import { useMemo, useState } from "react";
import {
  createBulkPrivacyJob,
  updateBulkPrivacyJob,
  updateOwnedRecordSharing,
} from "../lib/recordsService.js";
import {
  PRIVACY_SHARING_MODES,
  isPublicPrivacySharingMode,
  normalizePrivacySharingMode,
} from "../lib/privacyDefaults.js";
import {
  LANGUAGE_OPTIONS,
  getLanguageName,
  normalizeLanguage,
} from "../lib/language.js";
import { getTagLabel } from "../lib/tagTaxonomy.js";

const DEFAULT_FILTERS = {
  scope: "all",
  importBatchId: "",
  selectedIds: [],
  dateFrom: "",
  dateTo: "",
  period: "",
  language: "",
  adultFalseOnly: false,
  sensitivityThreshold: 5,
  confirmedTagsOnly: false,
  publicText: "any",
  tagQuery: "",
  includeAdultContent: false,
  includeHighSensitivity: false,
};

const PERIODS = ["morning", "afternoon", "evening", "night"];

export default function BulkSharingModal({
  preset,
  records = [],
  currentUser,
  profile,
  language = "zh",
  copy,
  initialFilters = null,
  onClose,
  onApplied,
}) {
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    ...(initialFilters || {}),
    selectedIds: Array.isArray(initialFilters?.selectedIds)
      ? initialFilters.selectedIds
      : DEFAULT_FILTERS.selectedIds,
  }));
  const [phase, setPhase] = useState("preview");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [jobId, setJobId] = useState("");
  const [successfulIds, setSuccessfulIds] = useState([]);
  const [failedIds, setFailedIds] = useState([]);
  const [previousStates, setPreviousStates] = useState([]);
  const [mobileStep, setMobileStep] = useState(1);

  const importBatches = useMemo(() => getImportBatchOptions(records), [records]);
  const tagOptions = useMemo(() => getTagOptions(records, language), [records, language]);
  const preview = useMemo(
    () => buildBulkSharingPreview(records, preset, filters),
    [filters, preset, records]
  );
  const publicTarget = isPublicPrivacySharingMode(preset.sharingMode);
  const statsOnlyTarget =
    normalizePrivacySharingMode(preset.sharingMode) === PRIVACY_SHARING_MODES.STATS_ONLY;
  const applying = phase === "applying";
  const undoing = phase === "undoing";
  const canApply = preview.affectedRecords.length > 0 && !applying && !undoing;
  const mobileSteps = [
    copy.bulkStepPreset || "Step 1",
    copy.bulkStepDreams || "Step 2",
    copy.bulkStepSafety || "Step 3",
    copy.bulkStepConfirm || "Step 4",
  ];
  const confirmClassName = [
    "rounded-2xl border px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-50",
    publicTarget
      ? "border-amber-300/35 bg-amber-300 text-zinc-950 hover:bg-amber-200"
      : statsOnlyTarget
        ? "border-emerald-300/35 bg-emerald-300 text-zinc-950 hover:bg-emerald-200"
        : "border-cyan-300/35 bg-cyan-300 text-zinc-950 hover:bg-cyan-200",
  ].join(" ");

  function updateFilter(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function goNext() {
    setMobileStep((current) => Math.min(4, current + 1));
  }

  function goBack() {
    setMobileStep((current) => Math.max(1, current - 1));
  }

  async function handleApply() {
    if (!canApply || !currentUser?.uid) return;

    setPhase("applying");
    setProgress({ done: 0, total: preview.affectedRecords.length });
    setFailedIds([]);
    setSuccessfulIds([]);

    const previous = preview.affectedRecords.map(capturePreviousSharingState);
    setPreviousStates(previous);

    const nextJobId = await createBulkPrivacyJob(currentUser, {
      presetId: preset.id,
      sharingMode: preset.sharingMode,
      status: "applying",
      filters,
      preview: preview.summary,
      previousStates: previous,
      affectedRecordIds: preview.affectedRecords.map((record) => record.id),
      skippedRecordIds: preview.skippedRecords.map((record) => record.id),
    }).catch(() => "");

    setJobId(nextJobId || "");

    const ok = [];
    const failed = [];

    for (const record of preview.affectedRecords) {
      try {
        await updateOwnedRecordSharing(
          currentUser,
          record.id,
          buildSharingUpdate(preset, record),
          profile
        );
        ok.push(record.id);
      } catch {
        failed.push(record.id);
      } finally {
        setProgress((current) => ({
          done: Math.min(current.done + 1, current.total),
          total: current.total,
        }));
      }
    }

    setSuccessfulIds(ok);
    setFailedIds(failed);

    if (nextJobId) {
      await updateBulkPrivacyJob(currentUser, nextJobId, {
        status: failed.length > 0 ? "completed_with_errors" : "applied",
        successfulRecordIds: ok,
        failedRecordIds: failed,
      }).catch(() => {});
    }

    onApplied?.({
      action: "apply",
      preset,
      recordIds: ok,
      recordsById: buildAppliedRecordMap(preview.affectedRecords, ok, preset, profile, currentUser),
      previousStates: previous,
    });
    setPhase("success");
  }

  async function handleUndo() {
    if (!currentUser?.uid || successfulIds.length === 0 || undoing) return;

    setPhase("undoing");
    setProgress({ done: 0, total: successfulIds.length });

    const successfulSet = new Set(successfulIds);
    const restoreStates = previousStates.filter((state) => successfulSet.has(state.id));
    const undone = [];

    for (const state of restoreStates) {
      try {
        await updateOwnedRecordSharing(
          currentUser,
          state.id,
          {
            sharingMode: state.sharingMode,
            publicText: state.publicText || "",
            publicTitle: state.publicTitle || "",
            redactionStatus: state.redactionStatus || "",
          },
          profile
        );
        undone.push(state.id);
      } catch {
        // Keep going; undo is best-effort for already-applied records.
      } finally {
        setProgress((current) => ({
          done: Math.min(current.done + 1, current.total),
          total: current.total,
        }));
      }
    }

    if (jobId) {
      await updateBulkPrivacyJob(currentUser, jobId, {
        status: "undone",
        undoneRecordIds: undone,
      }).catch(() => {});
    }

    onApplied?.({
      action: "undo",
      preset,
      recordIds: undone,
      recordsById: Object.fromEntries(
        restoreStates
          .filter((state) => undone.includes(state.id))
          .map((state) => [state.id, state])
      ),
      previousStates,
    });
    setPhase("undone");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 px-3 py-0 backdrop-blur-sm sm:items-center sm:py-4">
      <section className="max-h-[96vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-cyan-300/20 bg-zinc-950 p-4 pb-0 shadow-[0_0_60px_rgba(34,211,238,.16)] sm:max-h-[92vh] sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="cdo-kicker">{preset.title}</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-50">
              {copy.bulkModalTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-300">
              {copy.bulkModalDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={applying || undoing}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs font-bold text-zinc-300 transition hover:border-cyan-300/35 hover:text-cyan-100 disabled:opacity-50"
          >
            X
          </button>
        </div>

        <div className="mt-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={mobileStep === 1 || applying || undoing}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copy.bulkBack || "Back"}
            </button>
            <p className="min-w-0 text-right font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
              {mobileSteps[mobileStep - 1]}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {mobileSteps.map((step, index) => (
              <span
                key={step}
                className={[
                  "h-1.5 rounded-full",
                  index + 1 <= mobileStep ? "bg-cyan-300" : "bg-white/10",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)]">
          <section
            className={[
              "rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 lg:hidden",
              mobileStep === 1 ? "block" : "hidden",
            ].join(" ")}
          >
            <h3 className="cdo-card-heading">{preset.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {preset.description}
            </p>
            <div className="mt-4 grid gap-2">
              <PreviewMetric label={copy.presetPublicLabel} value={publicTarget ? copy.previewPublic : copy.previewPrivate} />
              <PreviewMetric label={copy.presetStatsLabel} value={statsOnlyTarget || publicTarget ? copy.previewStats : copy.bulkNone} />
            </div>
            <button
              type="button"
              onClick={goNext}
              className="mt-5 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-cyan-200"
            >
              {copy.bulkNext || "Next"}
            </button>
          </section>

          <section
            className={[
              "rounded-2xl border border-white/10 bg-black/25 p-4",
              mobileStep === 2 ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <h3 className="cdo-card-heading">{copy.bulkFiltersTitle}</h3>
            <details open className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                {copy.bulkScopeLabel}
              </summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label={copy.bulkScopeLabel}>
                <select
                  value={filters.scope}
                  onChange={(event) => updateFilter({ scope: event.target.value })}
                  className={inputClassName}
                >
                  <option value="all">{copy.bulkScopeAll}</option>
                  <option value="private">{copy.bulkScopePrivate}</option>
                  <option value="imported">{copy.bulkScopeImported}</option>
                  <option value="import_batch">{copy.bulkScopeImportBatch}</option>
                  <option value="selected">{copy.bulkScopeSelected}</option>
                </select>
              </Field>

              <Field label={copy.bulkImportBatchLabel}>
                <select
                  value={filters.importBatchId}
                  onChange={(event) => updateFilter({ importBatchId: event.target.value })}
                  disabled={filters.scope !== "import_batch"}
                  className={inputClassName}
                >
                  <option value="">{copy.bulkAnyImportBatch}</option>
                  {importBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={copy.bulkDateFrom}>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => updateFilter({ dateFrom: event.target.value })}
                  className={inputClassName}
                />
              </Field>

              <Field label={copy.bulkDateTo}>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => updateFilter({ dateTo: event.target.value })}
                  className={inputClassName}
                />
              </Field>

              <Field label={copy.bulkPeriodLabel}>
                <select
                  value={filters.period}
                  onChange={(event) => updateFilter({ period: event.target.value })}
                  className={inputClassName}
                >
                  <option value="">{copy.bulkAnyPeriod}</option>
                  {PERIODS.map((period) => (
                    <option key={period} value={period}>
                      {copy.periodOptions?.[period] || period}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={copy.bulkLanguageLabel}>
                <select
                  value={filters.language}
                  onChange={(event) => updateFilter({ language: event.target.value })}
                  className={inputClassName}
                >
                  <option value="">{copy.bulkAnyLanguage}</option>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {getLanguageName(option.value, language)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={copy.bulkSensitivityBelow}>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={filters.sensitivityThreshold}
                  onChange={(event) =>
                    updateFilter({
                      sensitivityThreshold: Math.max(
                        1,
                        Math.min(5, Number(event.target.value || 5))
                      ),
                    })
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label={copy.bulkPublicTextLabel}>
                <select
                  value={filters.publicText}
                  onChange={(event) => updateFilter({ publicText: event.target.value })}
                  className={inputClassName}
                >
                  <option value="any">{copy.bulkPublicTextAny}</option>
                  <option value="available">{copy.bulkPublicTextAvailable}</option>
                  <option value="missing">{copy.bulkPublicTextMissing}</option>
                </select>
              </Field>
              </div>
            </details>

            {filters.scope === "selected" && (
              <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-3">
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100">
                  {copy.bulkSelectedDreams}
                </h4>
                <div className="mt-3 max-h-64 overflow-y-auto pr-1">
                  {records.map((record) => (
                    <Checkbox
                      key={record.id}
                      checked={filters.selectedIds.includes(record.id)}
                      onChange={(checked) => {
                        const selected = new Set(filters.selectedIds);
                        if (checked) selected.add(record.id);
                        else selected.delete(record.id);
                        updateFilter({ selectedIds: [...selected] });
                      }}
                      label={getRecordTitle(record, copy)}
                    />
                  ))}
                </div>
              </div>
            )}

            <details open className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100">
                {copy.bulkSpecificTags}
              </summary>

              <Field label={copy.bulkSpecificTags} className="mt-4">
                <input
                  value={filters.tagQuery}
                  onChange={(event) => updateFilter({ tagQuery: event.target.value })}
                  placeholder={copy.bulkSpecificTagsPlaceholder}
                  className={inputClassName}
                  list="bulk-sharing-tags"
                />
                <datalist id="bulk-sharing-tags">
                  {tagOptions.map((tag) => (
                    <option key={tag.slug} value={tag.slug}>
                      {tag.label}
                    </option>
                  ))}
                </datalist>
              </Field>

              <div className="mt-4 grid gap-2">
                <Checkbox
                  checked={filters.adultFalseOnly}
                  onChange={(checked) => updateFilter({ adultFalseOnly: checked })}
                  label={copy.bulkAdultFalseOnly}
                />
                <Checkbox
                  checked={filters.confirmedTagsOnly}
                  onChange={(checked) => updateFilter({ confirmedTagsOnly: checked })}
                  label={copy.bulkConfirmedTagsOnly}
                />
                {publicTarget && (
                  <>
                    <Checkbox
                      checked={filters.includeAdultContent}
                      onChange={(checked) => updateFilter({ includeAdultContent: checked })}
                      label={copy.bulkIncludeAdult}
                    />
                    <Checkbox
                      checked={filters.includeHighSensitivity}
                      onChange={(checked) => updateFilter({ includeHighSensitivity: checked })}
                      label={copy.bulkIncludeHighSensitivity}
                    />
                  </>
                )}
              </div>

            </details>

            <button
              type="button"
              onClick={goNext}
              className="mt-4 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-cyan-200 lg:hidden"
            >
              {copy.bulkNext || "Next"}
            </button>
          </section>

          <section
            className={[
              "rounded-2xl border p-4 lg:hidden",
              mobileStep === 3 ? "block" : "hidden",
              publicTarget
                ? "border-amber-300/25 bg-amber-300/10"
                : "border-cyan-300/20 bg-cyan-300/5",
            ].join(" ")}
          >
            <h3 className="cdo-card-heading">{copy.bulkStepSafety}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              {copy.safetyWarning}
            </p>
            <p className="mt-3 rounded-2xl border border-cyan-300/15 bg-black/25 p-3 text-sm leading-relaxed text-cyan-100">
              {copy.statsOnlyReassurance}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              {copy.notDiagnosisReminder}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <PreviewMetric label={copy.previewAffected} value={preview.summary.affected} />
              <PreviewMetric label={copy.previewSkipped} value={preview.summary.skipped} />
              <PreviewMetric label={copy.bulkSkippedMissingPublicText} value={preview.skippedMissingPublicTextCount} />
            </div>
            <button
              type="button"
              onClick={goNext}
              className="mt-5 w-full rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-cyan-200"
            >
              {copy.bulkNext || "Next"}
            </button>
          </section>

          <section
            className={[
              "rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4",
              mobileStep === 4 ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <h3 className="cdo-card-heading">{copy.bulkPreviewTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {copy.bulkPreviewDescription}
            </p>

            {statsOnlyTarget && preview.statsOnlyRiskCount > 0 && (
              <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm leading-relaxed text-amber-100">
                {copy.bulkStatsOnlyWarning}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <PreviewMetric label={copy.previewAffected} value={preview.summary.affected} />
              <PreviewMetric label={copy.previewSkipped} value={preview.summary.skipped} />
              <PreviewMetric label={copy.bulkSkippedAdult} value={preview.skippedAdultCount} />
              <PreviewMetric label={copy.bulkSkippedHighSensitivity} value={preview.skippedHighSensitivityCount} />
              <PreviewMetric label={copy.bulkSkippedMissingPublicText} value={preview.skippedMissingPublicTextCount} />
              <PreviewMetric label={copy.previewStats} value={preview.summary.statsCount} />
            </div>

            {!canApply && !applying && !undoing && phase === "preview" && (
              <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-sm leading-relaxed text-amber-100">
                {copy.noAffectedDreams || "No dreams need this change."}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <BreakdownPanel
                title={copy.bulkCurrentBreakdown}
                breakdown={preview.currentBreakdown}
                copy={copy}
              />
              <BreakdownPanel
                title={copy.bulkNewBreakdown}
                breakdown={preview.newBreakdown}
                copy={copy}
              />
            </div>

            {(applying || undoing) && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                  <span>{undoing ? copy.bulkUndoing : copy.bulkProgress}</span>
                  <span>{progress.done}/{progress.total}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all"
                    style={{
                      width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {(phase === "success" || phase === "undone") && (
              <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-black/30 p-4">
                <h4 className="text-base font-semibold text-cyan-100">
                  {phase === "undone" ? copy.bulkUndoComplete : copy.bulkSuccessTitle}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {copy.bulkSuccessSummary({
                    count: successfulIds.length,
                    failed: failedIds.length,
                  })}
                </p>
              </div>
            )}

            <div className="sticky bottom-0 -mx-4 mt-5 grid gap-3 border-t border-white/10 bg-zinc-950/95 p-4 backdrop-blur sm:grid-cols-3 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
              <button
                type="button"
                onClick={handleApply}
                disabled={!canApply}
                className={[confirmClassName, "sm:col-span-2"].join(" ")}
              >
                {applying ? copy.bulkProgress : copy.previewConfirm}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={applying || undoing}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-zinc-200 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copy.previewCancel}
              </button>
              {phase === "success" && successfulIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoing}
                  className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-amber-100 transition hover:border-amber-300/45 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-3"
                >
                  {copy.bulkUndo}
                </button>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 font-mono text-xs text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50";

function Field({ label, children, className = "" }) {
  return (
    <label className={["block min-w-0", className].filter(Boolean).join(" ")}>
      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 accent-cyan-300"
      />
      <span className="min-w-0 text-xs leading-relaxed text-zinc-300">{label}</span>
    </label>
  );
}

function PreviewMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-cyan-100">{value}</p>
    </div>
  );
}

function BreakdownPanel({ title, breakdown, copy }) {
  const entries = Object.entries(breakdown).filter(([, value]) => value > 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
        {title}
      </h4>
      <div className="mt-3 grid gap-2">
        {(entries.length > 0 ? entries : [["none", 0]]).map(([mode, count]) => (
          <div
            key={mode}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <span className="truncate text-xs text-zinc-300">
              {getSharingModeLabel(mode, copy)}
            </span>
            <span className="font-mono text-xs font-bold text-cyan-100">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildBulkSharingPreview(records, preset, filters) {
  const targetMode = normalizePrivacySharingMode(preset.sharingMode);
  const publicTarget = isPublicPrivacySharingMode(targetMode);
  const statsTarget = publicTarget || targetMode === PRIVACY_SHARING_MODES.STATS_ONLY;
  const currentBreakdown = {};
  const newBreakdown = {};
  const affectedRecords = [];
  const skippedRecords = [];
  let skippedAdultCount = 0;
  let skippedHighSensitivityCount = 0;
  let skippedMissingPublicTextCount = 0;
  let statsOnlyRiskCount = 0;

  records.forEach((record) => {
    const currentMode = normalizePrivacySharingMode(record.sharingMode);

    if (!matchesUserFilters(record, filters)) return;

    currentBreakdown[currentMode] = (currentBreakdown[currentMode] || 0) + 1;

    const adult = isAdultRecord(record);
    const sensitivityLevel = getSensitivityLevel(record);
    const missingPublicText = !String(record.publicText || "").trim();

    if (preset.requiresPublicText && missingPublicText) {
      skippedMissingPublicTextCount += 1;
      skippedRecords.push(record);
      return;
    }

    if (publicTarget && adult && !filters.includeAdultContent) {
      skippedAdultCount += 1;
      skippedRecords.push(record);
      return;
    }

    if (publicTarget && sensitivityLevel >= 3 && !filters.includeHighSensitivity) {
      skippedHighSensitivityCount += 1;
      skippedRecords.push(record);
      return;
    }

    if (!publicTarget && statsTarget && (adult || sensitivityLevel >= 3)) {
      statsOnlyRiskCount += 1;
    }

    const alreadyMatching =
      currentMode === targetMode &&
      (!preset.requiresPublicText || record.redactionStatus === "user_confirmed");

    if (!alreadyMatching) {
      affectedRecords.push(record);
    }

    newBreakdown[targetMode] = (newBreakdown[targetMode] || 0) + 1;
  });

  const eligibleCount = Object.values(newBreakdown).reduce(
    (total, value) => total + value,
    0
  );

  return {
    affectedRecords,
    skippedRecords,
    skippedAdultCount,
    skippedHighSensitivityCount,
    skippedMissingPublicTextCount,
    statsOnlyRiskCount,
    currentBreakdown,
    newBreakdown,
    summary: {
      affected: affectedRecords.length,
      skipped: skippedRecords.length,
      publicCount: publicTarget ? eligibleCount : 0,
      privateCount: publicTarget ? 0 : eligibleCount,
      statsCount: statsTarget ? eligibleCount : 0,
    },
  };
}

function matchesUserFilters(record, filters) {
  if (!record?.id) return false;

  const scope = filters.scope || "all";
  const currentMode = normalizePrivacySharingMode(record.sharingMode);

  if (scope === "private" && (record.isPublic || currentMode !== PRIVACY_SHARING_MODES.PRIVATE)) {
    return false;
  }

  if (scope === "imported" && !isImportedRecord(record)) return false;

  if (
    scope === "import_batch" &&
    (!filters.importBatchId || record.importBatchId !== filters.importBatchId)
  ) {
    return false;
  }

  if (scope === "selected" && !filters.selectedIds.includes(record.id)) {
    return false;
  }

  if (filters.dateFrom && (!record.dreamDate || record.dreamDate < filters.dateFrom)) {
    return false;
  }

  if (filters.dateTo && (!record.dreamDate || record.dreamDate > filters.dateTo)) {
    return false;
  }

  if (filters.period && record.dreamPeriod !== filters.period) return false;

  if (
    filters.language &&
    normalizeLanguage(record.originalLanguage || "zh") !== normalizeLanguage(filters.language)
  ) {
    return false;
  }

  if (filters.adultFalseOnly && isAdultRecord(record)) return false;

  if (getSensitivityLevel(record) >= Number(filters.sensitivityThreshold || 5)) {
    return false;
  }

  if (filters.confirmedTagsOnly && !record.tagsReviewedByUser) return false;

  if (filters.publicText === "available" && !String(record.publicText || "").trim()) {
    return false;
  }

  if (filters.publicText === "missing" && String(record.publicText || "").trim()) {
    return false;
  }

  const requestedTags = String(filters.tagQuery || "")
    .split(/[,\n]/)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  if (requestedTags.length > 0) {
    const recordTags = getRecordTagTokens(record);
    if (!requestedTags.every((tag) => recordTags.has(tag))) return false;
  }

  return true;
}

function buildSharingUpdate(preset, record) {
  return {
    sharingMode: preset.sharingMode,
    publicText: record.publicText || "",
    publicTitle: record.publicTitle || "",
    redactionStatus: preset.requiresPublicText ? "user_confirmed" : "",
  };
}

function buildAppliedRecordMap(records, ids, preset, profile, currentUser) {
  const idSet = new Set(ids);
  const patch = buildClientSharingPatch(preset, profile, currentUser);

  return Object.fromEntries(
    records
      .filter((record) => idSet.has(record.id))
      .map((record) => [
        record.id,
        {
          ...record,
          ...patch,
          redactionStatus: preset.requiresPublicText ? "user_confirmed" : "",
        },
      ])
  );
}

function buildClientSharingPatch(preset, profile, currentUser) {
  const sharingMode = normalizePrivacySharingMode(preset.sharingMode);
  const publicMode = isPublicPrivacySharingMode(sharingMode);
  const recordIdentityMode =
    sharingMode === PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC ? "pseudonym" : "anonymous";

  return {
    sharingMode,
    requestedSharingMode: sharingMode,
    visibility: publicMode ? "public" : "private",
    isPublic: publicMode,
    publicConsent: publicMode,
    researchConsent: publicMode || sharingMode === PRIVACY_SHARING_MODES.STATS_ONLY,
    includedInResearchStats:
      publicMode || sharingMode === PRIVACY_SHARING_MODES.STATS_ONLY,
    recordIdentityMode,
    attributionMode: recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "pseudonym"
        ? profile?.defaultPseudonym || profile?.displayName || currentUser?.displayName || ""
        : "",
    creatorEmail: "",
  };
}

function capturePreviousSharingState(record) {
  return {
    id: record.id,
    sharingMode: normalizePrivacySharingMode(record.sharingMode),
    requestedSharingMode: record.requestedSharingMode || record.sharingMode || "",
    visibility: record.visibility || "private",
    isPublic: Boolean(record.isPublic),
    publicConsent: Boolean(record.publicConsent),
    researchConsent: Boolean(record.researchConsent),
    includedInResearchStats: Boolean(record.includedInResearchStats),
    recordIdentityMode: record.recordIdentityMode || "anonymous",
    attributionMode: record.attributionMode || record.recordIdentityMode || "anonymous",
    creatorDisplayName: record.creatorDisplayName || "",
    creatorEmail: record.creatorEmail || "",
    publicTitle: record.publicTitle || "",
    publicText: record.publicText || "",
    redactionStatus: record.redactionStatus || "",
  };
}

function getImportBatchOptions(records) {
  const batches = new Map();

  records.forEach((record) => {
    if (!record.importBatchId) return;
    batches.set(record.importBatchId, {
      id: record.importBatchId,
      label: record.sourceFileName
        ? `${record.sourceFileName} / ${record.importBatchId.slice(0, 8)}`
        : record.importBatchId,
    });
  });

  return [...batches.values()];
}

function getTagOptions(records, language) {
  const tags = new Map();

  records.forEach((record) => {
    (record.tags || []).forEach((tag) => {
      const slug = tag.slug || tag.name;
      if (!slug || tags.has(slug)) return;
      tags.set(slug, {
        slug,
        label: getTagLabel(tag, language),
      });
    });
  });

  return [...tags.values()].slice(0, 120);
}

function getRecordTagTokens(record) {
  const tokens = new Set();

  (record.tags || []).forEach((tag) => {
    [tag.slug, tag.name, tag.name_zh, tag.nameZh, tag.name_es, tag.nameEs]
      .filter(Boolean)
      .forEach((value) => tokens.add(String(value).trim().toLowerCase()));
  });

  [
    ...(record.environmentTags || []),
    ...(record.entityTags || []),
    ...(record.anomalyTags || []),
    ...(record.emotionTags || []),
    ...(record.styleTags || []),
    ...(record.eraTags || []),
    ...(record.weatherTags || []),
    ...(record.dreamTypeTags || []),
    ...(record.perspectiveTags || []),
    ...(record.psychologicalObservableTags || []),
    ...(record.dreamAnalysisTags || []),
    ...(record.customTags || []),
  ].forEach((value) => tokens.add(String(value).trim().toLowerCase()));

  return tokens;
}

function getSharingModeLabel(mode, copy) {
  if (mode === "none") return copy.bulkNone;

  const labels = {
    private: copy.modePrivate,
    stats_only: copy.modeStats,
    anonymous_public: copy.modeAnonymous,
    pseudonym_public: copy.modePseudonym,
    redacted_public: copy.modeRedacted,
    none: copy.bulkNone,
  };

  return labels[normalizePrivacySharingMode(mode)] || labels[mode] || mode;
}

function getRecordTitle(record, copy) {
  return (
    record.originalTitle ||
    record.title ||
    record.publicTitle ||
    record.pseudoId ||
    record.id ||
    copy.unknownDate
  );
}

function isImportedRecord(record) {
  return Boolean(record.importBatchId || record.sourceType === "diary_import");
}

function isAdultRecord(record) {
  return Boolean(record.adultContent) || Number(record.minimumViewerAge || 0) >= 18;
}

function getSensitivityLevel(record) {
  return Number.isFinite(Number(record.sensitivityLevel))
    ? Number(record.sensitivityLevel)
    : isAdultRecord(record)
      ? 3
      : 0;
}
