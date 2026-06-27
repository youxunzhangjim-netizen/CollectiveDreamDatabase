import { useEffect, useMemo, useState } from "react";
import {
  deleteOwnedRecord,
  fetchCollectionRecords,
  fetchOwnedRecords,
  fetchSavedRecords,
  removeCollectedRecord,
  removeSavedRecord,
  calculateDreamSignalCoherence,
  updateOwnedRecordMetadata,
  updateOwnedRecordSharing,
} from "../lib/recordsService.js";
import {
  createDefaultProfile,
  getOrCreateUserProfile,
  saveUserProfile,
} from "../lib/profileService.js";
import {
  getLanguageName,
  LANGUAGE_OPTIONS,
  normalizeLanguage,
} from "../lib/language.js";
import {
  getPrimaryDreamImageUrl,
  normalizeDreamImages,
} from "../lib/dreamImageService.js";
import {
  getDreamDateStatus,
  getVisibleDreamDate,
} from "../lib/dreamDate.js";
import { getTagLabel, RECORD_TAGS } from "../lib/tagTaxonomy.js";
import {
  exportPersonalDreamsCsv,
  exportPersonalDreamsJson,
  EXPORT_DETAIL_LEVELS,
} from "../lib/researchExportService.js";
import { suggestTagsForDream } from "../lib/dreamDiaryImportService.js";
import {
  PRIVACY_SHARING_MODES,
  getConsentsForSharingMode,
  isPublicPrivacySharingMode,
  normalizePrivacySettings,
  normalizePrivacySharingMode,
} from "../lib/privacyDefaults.js";
import {
  buildSuggestedPublicVersion,
  getPrivateDreamText,
  getPrivateDreamTitle,
} from "../lib/publicRedactionService.js";
import BulkSharingModal from "./BulkSharingModal.jsx";
import LanguageMenu from "./LanguageMenu.jsx";

const DASHBOARD_COPY = {
  en: {
    documentTitle: "Personal Dream Console",
    languageLabel: "Switch interface language",
    englishLabel: "English interface",
    chineseLabel: "Traditional Chinese interface",
    spanishLabel: "Spanish interface",
    databaseButton: "Research Archive",
    recordButton: "Record Dream",
    importButton: "Import Diary",
    exportCsvButton: "Export My CSV",
    exportJsonButton: "Export My JSON",
    exportScopeLabel: "Export content",
    exportScopeDreams: "Dream diary only",
    exportScopeCoded: "Dreams + tags",
    exportScopeAnalysis: "Full private fields",
    bulkShareTitle: "Share private observations",
    bulkShareText:
      "Apply one public sharing mode to every dream in My Observations. You can still edit individual dreams later.",
    shareAllAnonymous: "Share all anonymously",
    shareAllAccount: "Share all with account",
    bulkSharing: "Updating sharing...",
    bulkShareAnonymousDone: ({ count }) => `${count} dreams are now public as anonymous records.`,
    bulkShareAccountDone: ({ count }) => `${count} dreams are now public with account attribution.`,
    bulkShareFailed: "Some dreams could not be updated. Please try again.",
    consoleLabel: "Account Console",
    memberSince: "Member since",
    signOut: "Sign Out",
    observationsTab: "My Observations",
    savedTab: "Saved Records",
    collectionsTab: "Collections",
    observationsEmpty: "No records found in your personal database.",
    savedEmpty: "No saved records found in your private archive.",
    collectionsEmpty: "No collected dreams found in your liked collection.",
    deleteButton: "Delete",
    removeButton: "Remove",
    lockedButton: "Locked",
    observationCount: "Observations",
    savedCount: "Saved",
    identityStatus: "Preferred language",
    activeStatus: "Active",
    accountEmailHidden: "Account email hidden",
    privateAccountLabel: "Private account",
    lastSync: "Last Sync",
    timeOrderLabel: "Dream order",
    timeNewest: "Newest first",
    timeOldest: "Oldest first",
    sortUpdated: "Recently amended",
    sortName: "Name A-Z",
    sortAuthor: "Recorder name",
    recordsLoading: "Loading personal records",
    accountDetails: "Account Details",
    displayNameLabel: "Public Name",
    displayNamePlaceholder: "Dream researcher name",
    countryLabel: "Country",
    countryPlaceholder: "Taiwan, United States...",
    ageLabel: "Age",
    agePlaceholder: "Optional",
    showEmailLabel: "Show email publicly",
    showAgeLabel: "Show age publicly",
    biologicalSexLabel: "Biological Sex",
    biologicalSexPlaceholder: "Prefer not to say",
    showBiologicalSexLabel: "Show biological sex publicly",
    preferredLanguageLabel: "Preferred Language",
    privacyCenterTitle: "Privacy & Research Contribution",
    privacyCenterSubtitle:
      "Choose how your dreams live in the platform. You can keep them private, contribute anonymous statistics, or share selected dreams with the world.",
    privacyDefaultsTitle: "Default for new dreams",
    privacyDefaultsDescription:
      "Set this once. Future dreams and diary imports will follow this choice automatically, unless you override it.",
    bulkSettingTitle: "Apply to existing dreams",
    bulkSettingDescription:
      "Update many dreams at once. You can filter by date, import batch, language, tags, sensitivity, or adult-content status.",
    publicVersionTitle: "Create Public Versions",
    publicVersionDescription:
      "Prepare a reviewed public version without changing the private original.",
    publicVersionSelect: "Selected dream",
    publicVersionGenerate: "Generate suggestion",
    publicVersionApprove: "Approve public version",
    publicVersionReject: "Reject suggestion",
    publicVersionEdit: "Edit manually",
    publicVersionPrivate: "Private original",
    publicVersionPublic: "Public version",
    publicVersionSensitive: "Changed or sensitive phrases",
    publicVersionEmpty: "Select one of your dreams to prepare a public version.",
    publicVersionNoSuggestion: "No public version yet. Generate a suggestion or write one manually.",
    publicVersionSaved: "Public version saved for review.",
    publicVersionApproved: "Public version confirmed.",
    publicVersionRejected: "Public version rejected.",
    publicVersionNotice:
      "Suggestions preserve first-person perspective and dream imagery, but they may miss private clues. Review before approving.",
    safetyWarning:
      "Some dreams may contain private people, places, relationships, sexuality, trauma, shame, or identity clues. Review sensitive dreams before making them public.",
    statsOnlyReassurance:
      "Stats-only dreams do not publish the dream text. They only contribute non-identifying signals such as tags, language, dream type, length, emotion, and time bucket.",
    notDiagnosisReminder:
      "Dream tags and statistics are for self-reflection and research. They are not medical, psychological, or psychiatric diagnosis.",
    privacyOptionPrivate: "Keep new dreams private",
    privacyOptionStats: "Keep text private, contribute anonymous statistics",
    privacyOptionAnonymous: "Share anonymously after review",
    privacyOptionPseudonym: "Share with pseudonym after review",
    privacyOptionRedacted: "Create public redacted versions after review",
    defaultPseudonymLabel: "Default pseudonym",
    defaultPseudonymPlaceholder: "Name shown only for pseudonym sharing",
    reviewBeforePublicLabel: "Require review before public sharing",
    presetsTitle: "One-click modes",
    presetsDescription: "A quick helper. Pick the posture that feels right, then adjust details later.",
    presetScopeTitle: "Apply this preset to",
    presetScopeFuture: "Use this for future dreams",
    presetScopeExisting: "Also apply to existing dreams",
    presetScopeFutureOnly: "Future dreams only",
    presetScopeExistingOnly: "Existing dreams only",
    presetScopeBoth: "Future and existing dreams",
    presetScopeNone: "Choose future dreams, existing dreams, or both.",
    applyChoiceButton: "Apply selected scope",
    presetPublicLabel: "Public",
    presetPrivateLabel: "Private",
    presetStatsLabel: "Statistics",
    applyPresetButton: "Apply to existing dreams",
    previewTitle: "Review before applying",
    previewDescription:
      "Review what will change before applying this preset to your existing observations.",
    previewAffected: "Will update",
    previewUnchanged: "Already matching",
    previewSkipped: "Skipped for safety",
    previewPublic: "Public after change",
    previewPrivate: "Private after change",
    previewStats: "Contributes stats",
    previewRedactedSkip: "Skipped because redacted public sharing needs a public version.",
    previewConfirm: "Apply this setting",
    previewCancel: "Cancel",
    bulkPresetApplying: "Applying preset...",
    bulkPresetApplied: ({ count }) => `${count} dreams updated by preset.`,
    bulkModalTitle: "Bulk sharing controls",
    bulkModalDescription:
      "Filter your private records, preview safety skips, then apply the selected preset.",
    bulkFiltersTitle: "Filters",
    bulkStepPreset: "Step 1: Choose preset",
    bulkStepDreams: "Step 2: Choose which dreams",
    bulkStepSafety: "Step 3: Review safety warnings",
    bulkStepConfirm: "Step 4: Confirm",
    bulkBack: "Back",
    bulkNext: "Next",
    bulkScopeLabel: "Dream set",
    bulkScopeAll: "All dreams",
    bulkScopePrivate: "All private dreams",
    bulkScopeImported: "All imported dreams",
    bulkScopeImportBatch: "One import batch",
    bulkScopeSelected: "Selected dreams",
    bulkImportBatchLabel: "Import batch",
    bulkAnyImportBatch: "Any batch",
    bulkDateFrom: "Date from",
    bulkDateTo: "Date to",
    bulkPeriodLabel: "Period",
    bulkAnyPeriod: "Any period",
    periodOptions: {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
    },
    bulkLanguageLabel: "Language",
    bulkAnyLanguage: "Any language",
    bulkSensitivityBelow: "Sensitivity below",
    bulkPublicTextLabel: "Public text",
    bulkPublicTextAny: "Any",
    bulkPublicTextAvailable: "Available",
    bulkPublicTextMissing: "Missing",
    bulkSpecificTags: "Specific tags",
    bulkSpecificTagsPlaceholder: "tag-slug, emotion, place...",
    bulkAdultFalseOnly: "Adult-content false only",
    bulkConfirmedTagsOnly: "Dreams with confirmed tags",
    bulkIncludeAdult: "Include adult-content dreams in this bulk change.",
    bulkIncludeHighSensitivity: "Include highly private dreams in this bulk change.",
    bulkSelectedDreams: "Selected dreams",
    bulkPreviewTitle: "Preview result",
    bulkPreviewDescription:
      "Private text is never used for research-only statistics. Public reading copies are created only for public presets.",
    bulkSkippedAdult: "Skipped adult",
    bulkSkippedHighSensitivity: "Skipped sensitive",
    bulkSkippedMissingPublicText: "Skipped missing public version",
    bulkCurrentBreakdown: "Current sharing",
    bulkNewBreakdown: "After preset",
    bulkStatsOnlyWarning:
      "Adult or highly private dreams may contribute only anonymous non-text signals in stats-only mode.",
    bulkProgress: "Applying",
    bulkUndo: "Undo last bulk change",
    bulkUndoing: "Undoing",
    bulkUndoComplete: "Bulk change undone",
    bulkSuccessTitle: "Bulk change complete",
    bulkSuccessSummary: ({ count, failed }) =>
      `${count} dreams updated. ${failed} failed.`,
    bulkNone: "None",
    modePrivate: "Private",
    modeStats: "Stats only",
    modeAnonymous: "Anonymous public",
    modePseudonym: "Pseudonym public",
    modeRedacted: "Redacted public",
    presetPersonalTitle: "Personal Journal",
    presetPersonalDescription:
      "Keep everything private. These dreams will not appear in public reading or research statistics.",
    presetPersonalPublic: "Nothing becomes public.",
    presetPersonalPrivate: "Dream text, tags, dates, and metadata stay private.",
    presetPersonalStats: "Nothing is included in collective statistics.",
    presetResearchTitle: "Research Contributor",
    presetResearchDescription:
      "Keep dream text private, but contribute anonymous tags and statistics to collective dream research.",
    presetResearchPublic: "No dream text is public.",
    presetResearchPrivate: "Original title and dream words stay private.",
    presetResearchStats: "Anonymous tags and non-identifying signals contribute.",
    presetAnonymousTitle: "Anonymous Archive",
    presetAnonymousDescription:
      "Let others read these dreams without showing your identity.",
    presetAnonymousPublic: "Dream text and tags become public.",
    presetAnonymousPrivate: "Account identity and email stay hidden.",
    presetAnonymousStats: "Public records also contribute to statistics.",
    presetPseudonymTitle: "Pseudonym Archive",
    presetPseudonymDescription:
      "Let others read these dreams under your chosen pseudonym.",
    presetPseudonymPublic: "Dream text, tags, and pseudonym become public.",
    presetPseudonymPrivate: "Account identity and email stay hidden.",
    presetPseudonymStats: "Public records also contribute to statistics.",
    presetRedactedTitle: "Redacted Public Archive",
    presetRedactedDescription:
      "Keep the original private and publish only a reviewed public version.",
    presetRedactedPublic: "Only the reviewed public version becomes visible.",
    presetRedactedPrivate: "Original title and full dream words stay private.",
    presetRedactedStats: "Tags and non-identifying signals contribute.",
    biologicalSexOptions: {
      female: "Female",
      male: "Male",
      intersex: "Intersex",
      notListed: "Not listed",
      preferNotToSay: "Prefer not to say",
    },
    saveProfile: "Save Profile",
    profileSaved: "Profile saved",
    joinedDate: "Joined",
    hiddenAge: "Hidden",
    originalLanguageLabel: "Original language",
    expandPanel: "Expand section",
    collapsePanel: "Collapse section",
    recordedBy: "Recorded by",
    anonymousObserver: "Anonymous Observer",
    unknownDate: "Date unknown",
    hiddenDate: "Date hidden",
    tagSuggestionHint: "New tag suggestions available",
    analysisTitle: "My Dream Map",
    analysisText:
      "A private pattern dashboard for self-reflection. It highlights recurring places, entities, symbols, emotions, lucid/nightmare frequency, similar dreams, and gentle questions generated locally from your tags and counts, not AI diagnosis.",
    analysisTotal: "Uploaded",
    analysisAdult: "Mature tagged",
    analysisFrequency: "Dream frequency",
    analysisRecurringPlaces: "Recurring places",
    analysisRecurringEntities: "Recurring people/entities",
    analysisCommonSymbols: "Common symbols",
    analysisLucidNightmare: "Lucid / nightmare",
    analysisSimilarDreams: "Similar dreams",
    analysisReflectionQuestions: "Questions for reflection",
    analysisPsychologyPatterns: "Psychological observables",
    analysisAnalysisMarkers: "Dream-analysis markers",
    analysisWeatherPatterns: "Weather / atmosphere",
    analysisPerspectivePatterns: "Viewpoint patterns",
    analysisStylePatterns: "Visual style",
    analysisEraPatterns: "Era / time setting",
    analysisDreamTypeLead: "Leading dream type",
    analysisPsychologyLead: "Leading psyche signal",
    analysisAnalysisLead: "Leading analysis marker",
    analysisLanguageLead: "Leading language",
    analysisEmotionLead: "Leading emotion",
    analysisAverageAge: "Avg dream age",
    analysisNoData: "No data yet",
    analysisVisualsButton: "Open visual map",
    analysisVisualsTitle: "Personal analysis visual map",
    analysisVisualsText:
      "A local diagram view generated from your own dream records, tags, dates, language, and descriptive markers. It is for reflection, not diagnosis.",
    closeVisuals: "Close",
  },
  zh: {
    documentTitle: "個人夢境終端",
    languageLabel: "切換介面語言",
    englishLabel: "英文介面",
    chineseLabel: "繁體中文介面",
    spanishLabel: "西班牙文介面",
    databaseButton: "研究檔案庫",
    recordButton: "記錄夢境",
    importButton: "匯入日記",
    exportCsvButton: "匯出 CSV",
    exportJsonButton: "匯出 JSON",
    exportScopeLabel: "匯出內容",
    exportScopeDreams: "只匯出夢境日記",
    exportScopeCoded: "夢境與標籤",
    exportScopeAnalysis: "完整私人欄位",
    bulkShareTitle: "批次公開私人觀測",
    bulkShareText: "把「我的觀測」中的所有夢境套用同一種公開方式。之後仍可逐則修改。",
    shareAllAnonymous: "全部匿名公開",
    shareAllAccount: "全部以帳戶公開",
    bulkSharing: "正在更新公開狀態...",
    bulkShareAnonymousDone: ({ count }) => `已將 ${count} 則夢境設為匿名公開。`,
    bulkShareAccountDone: ({ count }) => `已將 ${count} 則夢境設為帳戶署名公開。`,
    bulkShareFailed: "部分夢境無法更新，請再試一次。",
    consoleLabel: "帳戶終端",
    memberSince: "會員起始日",
    signOut: "登出",
    observationsTab: "我的觀測",
    savedTab: "已儲存紀錄",
    collectionsTab: "收藏集",
    observationsEmpty: "你的個人資料庫中尚無紀錄。",
    savedEmpty: "你的私人檔案庫中尚無已儲存紀錄。",
    collectionsEmpty: "你的收藏集中尚無夢境紀錄。",
    deleteButton: "刪除",
    removeButton: "移除",
    lockedButton: "已鎖定",
    observationCount: "觀測",
    savedCount: "已儲存",
    identityStatus: "偏好語言",
    activeStatus: "啟用中",
    accountEmailHidden: "帳戶電子郵件已隱藏",
    privateAccountLabel: "私人帳戶",
    lastSync: "最後同步",
    timeOrderLabel: "夢境排序",
    timeNewest: "最新在前",
    timeOldest: "最舊在前",
    sortUpdated: "最近修改",
    sortName: "名稱 A-Z",
    sortAuthor: "記錄者名稱",
    recordsLoading: "正在載入個人紀錄",
    accountDetails: "帳戶資料",
    displayNameLabel: "公開名稱",
    displayNamePlaceholder: "夢境研究者名稱",
    countryLabel: "國家／地區",
    countryPlaceholder: "台灣、美國...",
    ageLabel: "年齡",
    agePlaceholder: "選填",
    showEmailLabel: "公開顯示電子郵件",
    showAgeLabel: "公開顯示年齡",
    biologicalSexLabel: "生理性別",
    biologicalSexPlaceholder: "不透露",
    showBiologicalSexLabel: "公開顯示生理性別",
    preferredLanguageLabel: "偏好語言",
    privacyCenterTitle: "隱私與研究貢獻",
    privacyCenterSubtitle:
      "選擇你的夢如何存在於平台：保持私人、貢獻匿名統計，或把選定的夢分享給世界。",
    privacyDefaultsTitle: "新夢境預設",
    privacyDefaultsDescription:
      "設定一次。未來夢境與日記匯入會自動依照此選擇，除非你另外覆寫。",
    bulkSettingTitle: "套用到既有夢境",
    bulkSettingDescription:
      "一次更新多則夢。可依日期、匯入批次、語言、標籤、敏感度或成人內容狀態篩選。",
    publicVersionTitle: "建立公開版本",
    publicVersionDescription: "準備經檢查的公開版本，不改動私人原文。",
    publicVersionSelect: "選擇夢境",
    publicVersionGenerate: "產生建議",
    publicVersionApprove: "批准公開版本",
    publicVersionReject: "拒絕建議",
    publicVersionEdit: "手動編輯",
    publicVersionPrivate: "私人原文",
    publicVersionPublic: "公開版本",
    publicVersionSensitive: "已變更或敏感片語",
    publicVersionEmpty: "選擇一則你的夢來準備公開版本。",
    publicVersionNoSuggestion: "尚無公開版本。可以先產生建議或手動撰寫。",
    publicVersionSaved: "公開版本已存為待檢查。",
    publicVersionApproved: "公開版本已確認。",
    publicVersionRejected: "公開版本已拒絕。",
    publicVersionNotice: "建議會保留第一人稱與夢境意象，但可能漏掉私人線索。批准前請檢查。",
    safetyWarning:
      "有些夢可能包含私人人物、地點、關係、性、創傷、羞恥或身份線索。公開前請先檢查敏感夢境。",
    statsOnlyReassurance:
      "僅供統計的夢不會公開夢境文字，只貢獻非識別訊號，例如標籤、語言、夢境類型、長度、情緒與時間區段。",
    notDiagnosisReminder:
      "夢境標籤與統計用於自我反思與研究，不是醫療、心理或精神科診斷。",
    privacyOptionPrivate: "新夢境保持私人",
    privacyOptionStats: "文字私人，匿名加入統計",
    privacyOptionAnonymous: "審查後匿名公開",
    privacyOptionPseudonym: "審查後以筆名公開",
    privacyOptionRedacted: "審查後建立公開節錄版",
    defaultPseudonymLabel: "預設筆名",
    defaultPseudonymPlaceholder: "只在筆名公開時顯示",
    reviewBeforePublicLabel: "公開前必須先審查",
    presetsTitle: "一鍵模式",
    presetsDescription: "快速輔助選擇。先選一種姿態，之後仍可調整細節。",
    presetScopeTitle: "將此模式套用到",
    presetScopeFuture: "用於未來夢境",
    presetScopeExisting: "也套用到既有夢境",
    presetScopeFutureOnly: "只套用未來夢境",
    presetScopeExistingOnly: "只套用既有夢境",
    presetScopeBoth: "未來與既有夢境",
    presetScopeNone: "請選擇未來夢境、既有夢境，或兩者。",
    applyChoiceButton: "套用選擇範圍",
    presetPublicLabel: "公開",
    presetPrivateLabel: "私人",
    presetStatsLabel: "統計",
    applyPresetButton: "套用到既有夢境",
    previewTitle: "套用前檢查",
    previewDescription: "套用到既有觀測前，先確認會改變哪些夢境。",
    previewAffected: "將更新",
    previewUnchanged: "已相同",
    previewSkipped: "因安全略過",
    previewPublic: "變更後公開",
    previewPrivate: "變更後私人",
    previewStats: "加入統計",
    previewRedactedSkip: "因節錄公開需要公開版本，部分夢境會略過。",
    previewConfirm: "套用此設定",
    previewCancel: "取消",
    bulkPresetApplying: "正在套用預設...",
    bulkPresetApplied: ({ count }) => `已用預設更新 ${count} 則夢境。`,
    bulkModalTitle: "批次分享控制",
    bulkModalDescription: "篩選你的私人紀錄，預覽安全略過項目，再套用選取的預設。",
    bulkFiltersTitle: "篩選",
    bulkStepPreset: "步驟 1：選擇模式",
    bulkStepDreams: "步驟 2：選擇夢境",
    bulkStepSafety: "步驟 3：檢查安全提醒",
    bulkStepConfirm: "步驟 4：確認",
    bulkBack: "返回",
    bulkNext: "下一步",
    bulkScopeLabel: "夢境範圍",
    bulkScopeAll: "所有夢境",
    bulkScopePrivate: "所有私人夢境",
    bulkScopeImported: "所有匯入夢境",
    bulkScopeImportBatch: "一個匯入批次",
    bulkScopeSelected: "選取夢境",
    bulkImportBatchLabel: "匯入批次",
    bulkAnyImportBatch: "任何批次",
    bulkDateFrom: "起始日期",
    bulkDateTo: "結束日期",
    bulkPeriodLabel: "時段",
    bulkAnyPeriod: "任何時段",
    periodOptions: {
      morning: "早晨",
      afternoon: "下午",
      evening: "傍晚",
      night: "夜晚",
    },
    bulkLanguageLabel: "語言",
    bulkAnyLanguage: "任何語言",
    bulkSensitivityBelow: "敏感度低於",
    bulkPublicTextLabel: "公開文字",
    bulkPublicTextAny: "任何",
    bulkPublicTextAvailable: "已有",
    bulkPublicTextMissing: "缺少",
    bulkSpecificTags: "指定標籤",
    bulkSpecificTagsPlaceholder: "tag-slug、情緒、地點...",
    bulkAdultFalseOnly: "只包含非成人內容",
    bulkConfirmedTagsOnly: "只包含已確認標籤的夢境",
    bulkIncludeAdult: "在這次批次變更中包含成人內容夢境。",
    bulkIncludeHighSensitivity: "在這次批次變更中包含高度私人夢境。",
    bulkSelectedDreams: "選取夢境",
    bulkPreviewTitle: "預覽結果",
    bulkPreviewDescription:
      "私人文字不會用於只統計的研究資料。只有公開預設才會建立可閱讀的公開版本。",
    bulkSkippedAdult: "略過成人",
    bulkSkippedHighSensitivity: "略過高敏感",
    bulkSkippedMissingPublicText: "略過缺少公開版本",
    bulkCurrentBreakdown: "目前分享",
    bulkNewBreakdown: "套用後",
    bulkStatsOnlyWarning: "成人或高度私人夢境在只統計模式下只會貢獻匿名非文字訊號。",
    bulkProgress: "套用中",
    bulkUndo: "復原上次批次變更",
    bulkUndoing: "復原中",
    bulkUndoComplete: "批次變更已復原",
    bulkSuccessTitle: "批次變更完成",
    bulkSuccessSummary: ({ count, failed }) => `已更新 ${count} 則夢境，${failed} 則失敗。`,
    bulkNone: "無",
    modePrivate: "私人",
    modeStats: "只統計",
    modeAnonymous: "匿名公開",
    modePseudonym: "筆名公開",
    modeRedacted: "節錄公開",
    presetPersonalTitle: "個人日誌",
    presetPersonalDescription: "保持完全私人。這些夢不會出現在公開閱讀或研究統計中。",
    presetPersonalPublic: "沒有內容會公開。",
    presetPersonalPrivate: "夢境文字、標籤、日期與資料都保持私人。",
    presetPersonalStats: "不加入集體統計。",
    presetResearchTitle: "研究貢獻者",
    presetResearchDescription: "夢境文字保持私人，但匿名標籤與統計會貢獻給集體夢境研究。",
    presetResearchPublic: "夢境文字不公開。",
    presetResearchPrivate: "原始標題與夢境文字保持私人。",
    presetResearchStats: "匿名標籤與非識別訊號加入統計。",
    presetAnonymousTitle: "匿名檔案",
    presetAnonymousDescription: "讓他人閱讀這些夢，但不顯示你的身份。",
    presetAnonymousPublic: "夢境文字與標籤會公開。",
    presetAnonymousPrivate: "帳戶身份與電子郵件保持隱藏。",
    presetAnonymousStats: "公開紀錄也加入統計。",
    presetPseudonymTitle: "筆名檔案",
    presetPseudonymDescription: "讓他人以你選擇的筆名閱讀這些夢。",
    presetPseudonymPublic: "夢境文字、標籤與筆名會公開。",
    presetPseudonymPrivate: "帳戶身份與電子郵件保持隱藏。",
    presetPseudonymStats: "公開紀錄也加入統計。",
    presetRedactedTitle: "節錄公開檔案",
    presetRedactedDescription: "原始夢保持私人，只發布審閱後的公開版本。",
    presetRedactedPublic: "只有審閱後的公開版本會公開。",
    presetRedactedPrivate: "原始標題與完整夢境文字保持私人。",
    presetRedactedStats: "標籤與非識別訊號加入統計。",
    biologicalSexOptions: {
      female: "女性",
      male: "男性",
      intersex: "雙性",
      notListed: "未列出",
      preferNotToSay: "不透露",
    },
    saveProfile: "儲存個人資料",
    profileSaved: "個人資料已儲存",
    joinedDate: "加入日期",
    hiddenAge: "已隱藏",
    originalLanguageLabel: "原始語言",
    expandPanel: "展開區塊",
    collapsePanel: "收合區塊",
    recordedBy: "記錄者",
    anonymousObserver: "匿名觀察者",
    unknownDate: "日期不確定",
    hiddenDate: "日期已隱藏",
    tagSuggestionHint: "可加入新的標籤建議",
    analysisTitle: "我的夢境地圖",
    analysisText: "只根據此帳戶夢境建立的私人模式儀表板，用於自我反思。它會整理重複場景、人物／實體、符號、情緒、清醒夢／惡夢、相似夢境與反思問題；這些問題由標籤與次數在本機規則生成，不是 AI 診斷。",
    analysisTotal: "已上傳",
    analysisAdult: "成人標記",
    analysisFrequency: "夢境頻率",
    analysisRecurringPlaces: "重複場景",
    analysisRecurringEntities: "重複人物／實體",
    analysisCommonSymbols: "常見符號",
    analysisLucidNightmare: "清醒夢／惡夢",
    analysisSimilarDreams: "相似夢境",
    analysisReflectionQuestions: "反思問題",
    analysisPsychologyPatterns: "心理觀察項",
    analysisAnalysisMarkers: "夢境分析標記",
    analysisWeatherPatterns: "天氣／氣氛",
    analysisPerspectivePatterns: "視角模式",
    analysisStylePatterns: "視覺風格",
    analysisEraPatterns: "時代／時間背景",
    analysisDreamTypeLead: "主要夢境類型",
    analysisPsychologyLead: "主要心理訊號",
    analysisAnalysisLead: "主要分析標記",
    analysisLanguageLead: "主要語言",
    analysisEmotionLead: "主要情緒",
    analysisAverageAge: "平均夢中年齡",
    analysisNoData: "尚無資料",
    analysisVisualsButton: "開啟視覺圖表",
    analysisVisualsTitle: "個人分析視覺圖",
    analysisVisualsText:
      "由你的夢境記錄、標籤、日期、語言與描述性標記在本機產生的圖表視圖，用於自我反思，不是診斷。",
    closeVisuals: "關閉",
  },
  es: {
    documentTitle: "Consola personal de sueños",
    languageLabel: "Cambiar idioma de la interfaz",
    englishLabel: "Interfaz en inglés",
    chineseLabel: "Interfaz en chino tradicional",
    spanishLabel: "Interfaz en español",
    databaseButton: "Archivo de investigación",
    recordButton: "Registrar sueño",
    importButton: "Importar diario",
    exportCsvButton: "Exportar CSV",
    exportJsonButton: "Exportar JSON",
    exportScopeLabel: "Contenido exportado",
    exportScopeDreams: "Solo diario",
    exportScopeCoded: "Sueños + etiquetas",
    exportScopeAnalysis: "Campos privados completos",
    bulkShareTitle: "Compartir observaciones privadas",
    bulkShareText:
      "Aplica un modo público a todos los sueños de Mis observaciones. Luego puedes editar cada sueño por separado.",
    shareAllAnonymous: "Compartir todo anónimo",
    shareAllAccount: "Compartir todo con cuenta",
    bulkSharing: "Actualizando...",
    bulkShareAnonymousDone: ({ count }) => `${count} sueños ahora son públicos como registros anónimos.`,
    bulkShareAccountDone: ({ count }) => `${count} sueños ahora son públicos con atribución de cuenta.`,
    bulkShareFailed: "Algunos sueños no se pudieron actualizar. Inténtalo de nuevo.",
    consoleLabel: "Consola de cuenta",
    memberSince: "Miembro desde",
    signOut: "Cerrar sesión",
    observationsTab: "Mis observaciones",
    savedTab: "Registros guardados",
    collectionsTab: "Colecciones",
    observationsEmpty: "No hay registros en tu base personal.",
    savedEmpty: "No hay registros guardados en tu archivo privado.",
    collectionsEmpty: "Aún no hay sueños en tu colección.",
    deleteButton: "Eliminar",
    removeButton: "Quitar",
    lockedButton: "Bloqueado",
    observationCount: "Observaciones",
    savedCount: "Guardados",
    identityStatus: "Idioma preferido",
    activeStatus: "Activa",
    accountEmailHidden: "Correo de cuenta oculto",
    privateAccountLabel: "Cuenta privada",
    lastSync: "Última sincronización",
    timeOrderLabel: "Orden de sueños",
    timeNewest: "Más reciente primero",
    timeOldest: "Más antiguo primero",
    sortUpdated: "Modificado reciente",
    sortName: "Nombre A-Z",
    sortAuthor: "Nombre del registrador",
    recordsLoading: "Cargando registros personales",
    accountDetails: "Datos de la cuenta",
    displayNameLabel: "Nombre público",
    displayNamePlaceholder: "Nombre de investigación",
    countryLabel: "País / región",
    countryPlaceholder: "Taiwán, Estados Unidos...",
    ageLabel: "Edad",
    agePlaceholder: "Opcional",
    showEmailLabel: "Mostrar correo públicamente",
    showAgeLabel: "Mostrar edad públicamente",
    biologicalSexLabel: "Sexo biológico",
    biologicalSexPlaceholder: "Prefiero no decirlo",
    showBiologicalSexLabel: "Mostrar sexo biológico públicamente",
    preferredLanguageLabel: "Idioma preferido",
    privacyCenterTitle: "Privacidad y contribución a la investigación",
    privacyCenterSubtitle:
      "Elige cómo viven tus sueños en la plataforma. Puedes mantenerlos privados, contribuir estadísticas anónimas o compartir sueños seleccionados con el mundo.",
    privacyDefaultsTitle: "Predeterminado para nuevos sueños",
    privacyDefaultsDescription:
      "Configúralo una vez. Los sueños futuros y las importaciones de diario seguirán esta elección automáticamente, salvo que la cambies.",
    bulkSettingTitle: "Aplicar a sueños existentes",
    bulkSettingDescription:
      "Actualiza muchos sueños a la vez. Puedes filtrar por fecha, lote de importación, idioma, etiquetas, sensibilidad o estado de contenido adulto.",
    publicVersionTitle: "Crear versiones públicas",
    publicVersionDescription:
      "Prepara una versión pública revisada sin cambiar el original privado.",
    publicVersionSelect: "Sueño seleccionado",
    publicVersionGenerate: "Generar sugerencia",
    publicVersionApprove: "Aprobar versión pública",
    publicVersionReject: "Rechazar sugerencia",
    publicVersionEdit: "Editar manualmente",
    publicVersionPrivate: "Original privado",
    publicVersionPublic: "Versión pública",
    publicVersionSensitive: "Frases cambiadas o sensibles",
    publicVersionEmpty: "Selecciona uno de tus sueños para preparar una versión pública.",
    publicVersionNoSuggestion: "Aún no hay versión pública. Genera una sugerencia o escribe una manualmente.",
    publicVersionSaved: "Versión pública guardada para revisión.",
    publicVersionApproved: "Versión pública confirmada.",
    publicVersionRejected: "Versión pública rechazada.",
    publicVersionNotice:
      "Las sugerencias conservan la primera persona y las imágenes del sueño, pero pueden omitir pistas privadas. Revísalas antes de aprobar.",
    safetyWarning:
      "Algunos sueños pueden contener personas, lugares, relaciones, sexualidad, trauma, vergüenza o pistas de identidad. Revisa los sueños sensibles antes de hacerlos públicos.",
    statsOnlyReassurance:
      "Los sueños solo estadísticos no publican el texto. Solo aportan señales no identificables como etiquetas, idioma, tipo, longitud, emoción y periodo temporal.",
    notDiagnosisReminder:
      "Las etiquetas y estadísticas de sueños son para autorreflexión e investigación. No son diagnóstico médico, psicológico ni psiquiátrico.",
    privacyOptionPrivate: "Mantener nuevos sueños privados",
    privacyOptionStats: "Texto privado, estadísticas anónimas",
    privacyOptionAnonymous: "Compartir anónimo tras revisión",
    privacyOptionPseudonym: "Compartir con seudónimo tras revisión",
    privacyOptionRedacted: "Crear versiones públicas redactadas tras revisión",
    defaultPseudonymLabel: "Seudónimo predeterminado",
    defaultPseudonymPlaceholder: "Nombre mostrado solo con seudónimo",
    reviewBeforePublicLabel: "Revisar antes de publicar",
    presetsTitle: "Modos de un clic",
    presetsDescription: "Una ayuda rápida. Elige una postura y ajusta detalles después.",
    presetScopeTitle: "Aplicar este modo a",
    presetScopeFuture: "Usar para sueños futuros",
    presetScopeExisting: "Aplicar también a sueños existentes",
    presetScopeFutureOnly: "Solo sueños futuros",
    presetScopeExistingOnly: "Solo sueños existentes",
    presetScopeBoth: "Sueños futuros y existentes",
    presetScopeNone: "Elige sueños futuros, existentes o ambos.",
    applyChoiceButton: "Aplicar alcance elegido",
    presetPublicLabel: "Público",
    presetPrivateLabel: "Privado",
    presetStatsLabel: "Estadísticas",
    applyPresetButton: "Aplicar a sueños existentes",
    previewTitle: "Revisar antes de aplicar",
    previewDescription:
      "Revisa qué cambiará antes de aplicar este preset a tus observaciones existentes.",
    previewAffected: "Se actualizarán",
    previewUnchanged: "Ya coinciden",
    previewSkipped: "Omitidos por seguridad",
    previewPublic: "Públicos después",
    previewPrivate: "Privados después",
    previewStats: "Aportan estadísticas",
    previewRedactedSkip: "Se omiten sueños sin una versión pública para la versión redactada.",
    previewConfirm: "Aplicar este ajuste",
    previewCancel: "Cancelar",
    bulkPresetApplying: "Aplicando preset...",
    bulkPresetApplied: ({ count }) => `${count} sueños actualizados por preset.`,
    bulkModalTitle: "Controles de compartido masivo",
    bulkModalDescription:
      "Filtra tus registros privados, revisa omisiones de seguridad y aplica el preset seleccionado.",
    bulkFiltersTitle: "Filtros",
    bulkStepPreset: "Paso 1: Elige modo",
    bulkStepDreams: "Paso 2: Elige sueños",
    bulkStepSafety: "Paso 3: Revisa advertencias",
    bulkStepConfirm: "Paso 4: Confirma",
    bulkBack: "Atrás",
    bulkNext: "Siguiente",
    bulkScopeLabel: "Conjunto",
    bulkScopeAll: "Todos los sueños",
    bulkScopePrivate: "Todos los privados",
    bulkScopeImported: "Todos los importados",
    bulkScopeImportBatch: "Un lote de importación",
    bulkScopeSelected: "Sueños seleccionados",
    bulkImportBatchLabel: "Lote importado",
    bulkAnyImportBatch: "Cualquier lote",
    bulkDateFrom: "Desde fecha",
    bulkDateTo: "Hasta fecha",
    bulkPeriodLabel: "Periodo",
    bulkAnyPeriod: "Cualquier periodo",
    periodOptions: {
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Atardecer",
      night: "Noche",
    },
    bulkLanguageLabel: "Idioma",
    bulkAnyLanguage: "Cualquier idioma",
    bulkSensitivityBelow: "Sensibilidad menor que",
    bulkPublicTextLabel: "Texto público",
    bulkPublicTextAny: "Cualquiera",
    bulkPublicTextAvailable: "Disponible",
    bulkPublicTextMissing: "Falta",
    bulkSpecificTags: "Etiquetas específicas",
    bulkSpecificTagsPlaceholder: "tag-slug, emoción, lugar...",
    bulkAdultFalseOnly: "Solo sin contenido adulto",
    bulkConfirmedTagsOnly: "Sueños con etiquetas confirmadas",
    bulkIncludeAdult: "Incluir sueños con contenido adulto en este cambio masivo.",
    bulkIncludeHighSensitivity: "Incluir sueños altamente privados en este cambio masivo.",
    bulkSelectedDreams: "Sueños seleccionados",
    bulkPreviewTitle: "Vista previa",
    bulkPreviewDescription:
      "El texto privado nunca se usa para estadísticas de solo investigación. Las versiones públicas solo se crean con presets públicos.",
    bulkSkippedAdult: "Adultos omitidos",
    bulkSkippedHighSensitivity: "Sensibles omitidos",
    bulkSkippedMissingPublicText: "Omitidos sin versión pública",
    bulkCurrentBreakdown: "Compartido actual",
    bulkNewBreakdown: "Después del preset",
    bulkStatsOnlyWarning:
      "Los sueños adultos o muy privados solo aportan señales anónimas sin texto en modo de estadísticas.",
    bulkProgress: "Aplicando",
    bulkUndo: "Deshacer último cambio masivo",
    bulkUndoing: "Deshaciendo",
    bulkUndoComplete: "Cambio masivo deshecho",
    bulkSuccessTitle: "Cambio masivo completo",
    bulkSuccessSummary: ({ count, failed }) =>
      `${count} sueños actualizados. ${failed} fallidos.`,
    bulkNone: "Ninguno",
    modePrivate: "Privado",
    modeStats: "Solo estadísticas",
    modeAnonymous: "Público anónimo",
    modePseudonym: "Público con seudónimo",
    modeRedacted: "Público redactado",
    presetPersonalTitle: "Diario personal",
    presetPersonalDescription:
      "Mantén todo privado. Estos sueños no aparecerán en lectura pública ni estadísticas de investigación.",
    presetPersonalPublic: "Nada se vuelve público.",
    presetPersonalPrivate: "Texto, etiquetas, fechas y metadatos siguen privados.",
    presetPersonalStats: "Nada se incluye en estadísticas colectivas.",
    presetResearchTitle: "Contribuidor de investigación",
    presetResearchDescription:
      "Mantén privado el texto del sueño, pero aporta etiquetas y estadísticas anónimas a la investigación colectiva.",
    presetResearchPublic: "No se publica texto del sueño.",
    presetResearchPrivate: "Título original y palabras del sueño siguen privados.",
    presetResearchStats: "Etiquetas anónimas y señales no identificables contribuyen.",
    presetAnonymousTitle: "Archivo anónimo",
    presetAnonymousDescription:
      "Permite que otros lean estos sueños sin mostrar tu identidad.",
    presetAnonymousPublic: "Texto y etiquetas del sueño se vuelven públicos.",
    presetAnonymousPrivate: "Identidad de cuenta y correo permanecen ocultos.",
    presetAnonymousStats: "Los registros públicos también aportan estadísticas.",
    presetPseudonymTitle: "Archivo con seudónimo",
    presetPseudonymDescription:
      "Permite que otros lean estos sueños bajo tu seudónimo elegido.",
    presetPseudonymPublic: "Texto, etiquetas y seudónimo se vuelven públicos.",
    presetPseudonymPrivate: "Identidad de cuenta y correo permanecen ocultos.",
    presetPseudonymStats: "Los registros públicos también aportan estadísticas.",
    presetRedactedTitle: "Archivo público redactado",
    presetRedactedDescription:
      "Mantén el original privado y publica solo una versión pública revisada.",
    presetRedactedPublic: "Solo la versión pública revisada se vuelve visible.",
    presetRedactedPrivate: "Título original y texto completo siguen privados.",
    presetRedactedStats: "Etiquetas y señales no identificables contribuyen.",
    biologicalSexOptions: {
      female: "Femenino",
      male: "Masculino",
      intersex: "Intersexual",
      notListed: "No listado",
      preferNotToSay: "Prefiero no decirlo",
    },
    saveProfile: "Guardar perfil",
    profileSaved: "Perfil guardado",
    joinedDate: "Fecha de ingreso",
    hiddenAge: "Oculta",
    originalLanguageLabel: "Idioma original",
    expandPanel: "Expandir sección",
    collapsePanel: "Contraer sección",
    recordedBy: "Registrado por",
    anonymousObserver: "Observador anónimo",
    unknownDate: "Fecha desconocida",
    hiddenDate: "Fecha oculta",
    tagSuggestionHint: "Hay nuevas etiquetas sugeridas",
    analysisTitle: "Mi mapa de sueños",
    analysisText:
      "Panel privado de patrones para autorreflexión. Destaca lugares, entidades, símbolos, emociones, sueños lúcidos/pesadillas, sueños similares y preguntas generadas localmente desde etiquetas y conteos, no como diagnóstico de IA.",
    analysisTotal: "Subidos",
    analysisAdult: "Madurez marcada",
    analysisFrequency: "Frecuencia",
    analysisRecurringPlaces: "Lugares recurrentes",
    analysisRecurringEntities: "Personas/entidades",
    analysisCommonSymbols: "Símbolos comunes",
    analysisLucidNightmare: "Lúcido / pesadilla",
    analysisSimilarDreams: "Sueños similares",
    analysisReflectionQuestions: "Preguntas de reflexión",
    analysisPsychologyPatterns: "Observables psicológicos",
    analysisAnalysisMarkers: "Marcadores de análisis onírico",
    analysisWeatherPatterns: "Clima / atmósfera",
    analysisPerspectivePatterns: "Patrones de punto de vista",
    analysisStylePatterns: "Estilo visual",
    analysisEraPatterns: "Época / tiempo",
    analysisDreamTypeLead: "Tipo principal",
    analysisPsychologyLead: "Señal psíquica principal",
    analysisAnalysisLead: "Marcador principal",
    analysisLanguageLead: "Idioma principal",
    analysisEmotionLead: "Emoción principal",
    analysisAverageAge: "Edad media",
    analysisNoData: "Sin datos",
    analysisVisualsButton: "Abrir mapa visual",
    analysisVisualsTitle: "Mapa visual de análisis personal",
    analysisVisualsText:
      "Una vista de diagramas local generada desde tus propios registros, etiquetas, fechas, idioma y marcadores descriptivos. Es para reflexión, no diagnóstico.",
    closeVisuals: "Cerrar",
  },
};

const BIOLOGICAL_SEX_OPTIONS = [
  "preferNotToSay",
  "female",
  "male",
  "intersex",
  "notListed",
];

function getPrivacyDefaultOptions(copy) {
  return [
    {
      value: PRIVACY_SHARING_MODES.PRIVATE,
      label: copy.privacyOptionPrivate,
    },
    {
      value: PRIVACY_SHARING_MODES.STATS_ONLY,
      label: copy.privacyOptionStats,
    },
    {
      value: PRIVACY_SHARING_MODES.ANONYMOUS_PUBLIC,
      label: copy.privacyOptionAnonymous,
    },
    {
      value: PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC,
      label: copy.privacyOptionPseudonym,
    },
    {
      value: PRIVACY_SHARING_MODES.REDACTED_PUBLIC,
      label: copy.privacyOptionRedacted,
    },
  ];
}

function getOneClickPresetCards(copy) {
  return [
    {
      id: "personal_journal",
      sharingMode: PRIVACY_SHARING_MODES.PRIVATE,
      title: copy.presetPersonalTitle,
      description: copy.presetPersonalDescription,
      publicLine: copy.presetPersonalPublic,
      privateLine: copy.presetPersonalPrivate,
      statsLine: copy.presetPersonalStats,
      accent: "cyan",
    },
    {
      id: "research_contributor",
      sharingMode: PRIVACY_SHARING_MODES.STATS_ONLY,
      title: copy.presetResearchTitle,
      description: copy.presetResearchDescription,
      publicLine: copy.presetResearchPublic,
      privateLine: copy.presetResearchPrivate,
      statsLine: copy.presetResearchStats,
      accent: "violet",
    },
    {
      id: "anonymous_archive",
      sharingMode: PRIVACY_SHARING_MODES.ANONYMOUS_PUBLIC,
      title: copy.presetAnonymousTitle,
      description: copy.presetAnonymousDescription,
      publicLine: copy.presetAnonymousPublic,
      privateLine: copy.presetAnonymousPrivate,
      statsLine: copy.presetAnonymousStats,
      accent: "cyan",
    },
    {
      id: "pseudonym_archive",
      sharingMode: PRIVACY_SHARING_MODES.PSEUDONYM_PUBLIC,
      title: copy.presetPseudonymTitle,
      description: copy.presetPseudonymDescription,
      publicLine: copy.presetPseudonymPublic,
      privateLine: copy.presetPseudonymPrivate,
      statsLine: copy.presetPseudonymStats,
      accent: "fuchsia",
    },
    {
      id: "redacted_archive",
      sharingMode: PRIVACY_SHARING_MODES.REDACTED_PUBLIC,
      title: copy.presetRedactedTitle,
      description: copy.presetRedactedDescription,
      publicLine: copy.presetRedactedPublic,
      privateLine: copy.presetRedactedPrivate,
      statsLine: copy.presetRedactedStats,
      accent: "violet",
      requiresPublicText: true,
    },
  ];
}

const MOCK_OBSERVATIONS = [
  {
    id: "obs-001",
    title: "Neon Rain Rising From the Street",
    titleZh: "霓虹雨從街面升起",
    date: "2026-06-12",
    hash: "VX-20000000",
    accent: "cyan",
  },
  {
    id: "obs-002",
    title: "A City Suspended Under Water",
    titleZh: "懸在水下的城市",
    date: "2026-06-04",
    hash: "VX-20000004",
    accent: "fuchsia",
  },
  {
    id: "obs-003",
    title: "The Non-Human Archivist",
    titleZh: "非人類檔案管理者",
    date: "2026-05-29",
    hash: "VX-20000005",
    accent: "violet",
  },
];

const MOCK_SAVED_RECORDS = [
  {
    id: "saved-001",
    title: "The Station Clock Refused to Move",
    titleZh: "車站時鐘拒絕前進",
    date: "2026-06-08",
    hash: "VX-20000003",
    accent: "cyan",
  },
  {
    id: "saved-002",
    title: "The Ocean With No Shoreline",
    titleZh: "沒有海岸線的海",
    date: "2026-06-10",
    hash: "VX-20000002",
    accent: "fuchsia",
  },
];

const ACCENT_STYLES = {
  cyan: {
    border: "border-cyan-300/25",
    glow: "shadow-[0_0_32px_rgba(34,211,238,.10)]",
    dot: "bg-cyan-300",
    gradient:
      "radial-gradient(circle at 20% 20%, rgba(34,211,238,.32), transparent 28%), linear-gradient(135deg, #05060a 0%, #101827 54%, #030407 100%)",
  },
  fuchsia: {
    border: "border-fuchsia-300/25",
    glow: "shadow-[0_0_32px_rgba(217,70,239,.10)]",
    dot: "bg-fuchsia-300",
    gradient:
      "radial-gradient(circle at 82% 26%, rgba(217,70,239,.30), transparent 30%), linear-gradient(135deg, #05060a 0%, #17101f 54%, #030407 100%)",
  },
  violet: {
    border: "border-violet-300/25",
    glow: "shadow-[0_0_32px_rgba(167,139,250,.10)]",
    dot: "bg-violet-300",
    gradient:
      "radial-gradient(circle at 40% 10%, rgba(167,139,250,.30), transparent 32%), linear-gradient(135deg, #05060a 0%, #111827 54%, #030407 100%)",
  },
};

export default function UserDashboard({
  language = "zh",
  setLanguage = () => {},
  user,
  onSignOut,
  onOpenDatabase,
  onOpenRecorder,
  onOpenImporter,
  onOpenRecord,
}) {
  const copy = DASHBOARD_COPY[language] || DASHBOARD_COPY.zh;
  const [activeTab, setActiveTab] = useState("observations");
  const [profile, setProfile] = useState(() =>
    user ? createDefaultProfile(user) : null
  );
  const [profileDraft, setProfileDraft] = useState(() =>
    user ? createDefaultProfile(user) : null
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  const [observations, setObservations] = useState([]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [collectionRecords, setCollectionRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState("");
  const [bulkSharingMode, setBulkSharingMode] = useState("");
  const [bulkShareNotice, setBulkShareNotice] = useState("");
  const [bulkPreset, setBulkPreset] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState("research_contributor");
  const [presetApplyFuture, setPresetApplyFuture] = useState(true);
  const [presetApplyExisting, setPresetApplyExisting] = useState(false);
  const [selectedPublicVersionId, setSelectedPublicVersionId] = useState("");
  const [publicVersionDrafts, setPublicVersionDrafts] = useState({});
  const [publicVersionNotice, setPublicVersionNotice] = useState("");
  const [publicVersionSaving, setPublicVersionSaving] = useState("");
  const [exportDetail, setExportDetail] = useState(EXPORT_DETAIL_LEVELS.ANALYSIS);
  const [timeOrder, setTimeOrder] = useState("desc");
  const exportDetailOptions = [
    { value: EXPORT_DETAIL_LEVELS.DREAMS, label: copy.exportScopeDreams },
    { value: EXPORT_DETAIL_LEVELS.CODED, label: copy.exportScopeCoded },
    { value: EXPORT_DETAIL_LEVELS.ANALYSIS, label: copy.exportScopeAnalysis },
  ];
  const privacyDefaultOptions = useMemo(
    () => getPrivacyDefaultOptions(copy),
    [copy]
  );
  const oneClickPresets = useMemo(() => getOneClickPresetCards(copy), [copy]);
  const selectedPreset = useMemo(() => {
    const currentMode = normalizePrivacySharingMode(profileDraft?.defaultSharingMode);

    return (
      oneClickPresets.find((preset) => preset.id === selectedPresetId) ||
      oneClickPresets.find((preset) => preset.sharingMode === currentMode) ||
      oneClickPresets[0]
    );
  }, [oneClickPresets, profileDraft?.defaultSharingMode, selectedPresetId]);
  const activeItems =
    activeTab === "observations"
      ? observations
      : activeTab === "saved"
        ? savedRecords
        : collectionRecords;
  const orderedActiveItems = useMemo(
    () =>
      [...activeItems].sort((a, b) => {
        if (timeOrder === "updated") {
          return compareNullableMillis(getRecordUpdatedMillis(a), getRecordUpdatedMillis(b), "desc");
        }

        if (timeOrder === "name") {
          return getDisplayItemTitle(a, language).localeCompare(
            getDisplayItemTitle(b, language),
            language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en"
          );
        }

        if (timeOrder === "author") {
          return getItemAuthorName(a, copy).localeCompare(
            getItemAuthorName(b, copy),
            language === "zh" ? "zh-Hant" : language === "es" ? "es" : "en"
          );
        }

        const first = getRecordSortMillis(a);
        const second = getRecordSortMillis(b);

        return compareNullableMillis(first, second, timeOrder === "asc" ? "asc" : "desc");
      }),
    [activeItems, copy, language, timeOrder]
  );
  const emptyMessage =
    activeTab === "observations"
      ? copy.observationsEmpty
      : activeTab === "saved"
        ? copy.savedEmpty
        : copy.collectionsEmpty;
  const displayUser = normalizeDashboardUser(user, profile);
  const personalAnalysis = useMemo(
    () => buildPersonalDreamAnalysis(observations, language, copy),
    [copy, language, observations]
  );
  const lastSyncLabel = useMemo(() => formatLastSync(language), [language]);
  const selectedPublicVersionRecord = useMemo(
    () =>
      observations.find((record) => record.id === selectedPublicVersionId) ||
      observations[0] ||
      null,
    [observations, selectedPublicVersionId]
  );

  useEffect(() => {
    document.title = copy.documentTitle;
  }, [copy.documentTitle]);

  useEffect(() => {
    setProfile((current) =>
      current ? { ...current, preferredLanguage: language } : current
    );
    setProfileDraft((current) =>
      current ? { ...current, preferredLanguage: language } : current
    );
  }, [language]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    let ignore = false;

    async function loadRecords() {
      setRecordsLoading(true);
      setRecordsError("");

      try {
        const [profileData, ownedItems, savedItems, collectionItems] = await Promise.all([
          getOrCreateUserProfile(user),
          fetchOwnedRecords(user),
          fetchSavedRecords(user),
          fetchCollectionRecords(user),
        ]);

        if (ignore) return;

        setProfile(profileData);
        setProfileDraft(profileData);
        setObservations(ownedItems.map((item, index) => normalizeRecordItem(item, index)));
        setSavedRecords(
          savedItems.map((item, index) => normalizeRecordItem(item, index + 1))
        );
        setCollectionRecords(
          collectionItems.map((item, index) => normalizeRecordItem(item, index + 2))
        );
      } catch (error) {
        if (!ignore) {
          setRecordsError(error.message);
        }
      } finally {
        if (!ignore) {
          setRecordsLoading(false);
        }
      }
    }

    loadRecords();

    return () => {
      ignore = true;
    };
  }, [user]);

  const avatarText = useMemo(() => {
    if (displayUser.displayName) {
      return displayUser.displayName.slice(0, 2).toUpperCase();
    }

    if (displayUser.pseudoId) {
      return displayUser.pseudoId.replace("DREAMER-", "").slice(0, 2);
    }

    return "CD";
  }, [displayUser.displayName, displayUser.pseudoId]);

  async function handleSaveProfile() {
    if (!profileDraft) return;

    setProfileSaving(true);
    setProfileNotice("");

    try {
      await saveUserProfile(user, profileDraft);
      setProfile(profileDraft);
      setProfileNotice(copy.profileSaved);
    } catch (error) {
      setProfileNotice(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  function handlePrivacyDefaultModeChange(nextMode) {
    const defaultSharingMode = normalizePrivacySharingMode(nextMode);
    const consents = getConsentsForSharingMode(defaultSharingMode);
    const matchingPreset = oneClickPresets.find(
      (preset) => preset.sharingMode === defaultSharingMode
    );

    if (matchingPreset) {
      setSelectedPresetId(matchingPreset.id);
    }

    setProfileDraft((current) => ({
      ...normalizePrivacySettings(current || {}, user),
      ...(current || {}),
      defaultSharingMode,
      ...consents,
    }));
  }

  async function savePresetAsFutureDefault(preset) {
    if (!profileDraft) return;

    setSelectedPresetId(preset.id);

    const defaultSharingMode = normalizePrivacySharingMode(preset.sharingMode);
    const consents = getConsentsForSharingMode(defaultSharingMode);
    const nextDraft = {
      ...normalizePrivacySettings(profileDraft, user),
      ...profileDraft,
      defaultSharingMode,
      ...consents,
      requireReviewBeforePublic: isPublicPrivacySharingMode(defaultSharingMode)
        ? true
        : profileDraft.requireReviewBeforePublic !== false,
    };

    setProfileDraft(nextDraft);
    setProfileSaving(true);
    setProfileNotice("");

    try {
      await saveUserProfile(user, nextDraft);
      setProfile(nextDraft);
      setProfileNotice(copy.profileSaved);
    } catch (error) {
      setProfileNotice(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleApplyPresetChoice(preset) {
    if (!presetApplyFuture && !presetApplyExisting) {
      setProfileNotice(copy.presetScopeNone);
      return;
    }

    if (presetApplyFuture) {
      await savePresetAsFutureDefault(preset);
    } else {
      setSelectedPresetId(preset.id);
    }

    if (presetApplyExisting) {
      handleOpenPresetPreview(preset);
    }
  }

  function handleOpenPresetPreview(preset) {
    setSelectedPresetId(preset.id);
    setBulkPreset(preset);
  }

  function updatePublicVersionDraft(recordId, patch) {
    setPublicVersionDrafts((current) => ({
      ...current,
      [recordId]: {
        ...(current[recordId] || {}),
        ...patch,
      },
    }));
  }

  async function persistPublicVersion(record, patch, notice) {
    if (!record?.id || !user?.uid) return;

    setPublicVersionSaving(record.id);
    setPublicVersionNotice("");

    try {
      await updateOwnedRecordMetadata(user, record.id, patch);
      setObservations((current) =>
        current.map((item) =>
          item.id === record.id
            ? {
                ...item,
                ...patch,
                publicExcerpt: patch.publicText
                  ? String(patch.publicText).slice(0, 520)
                  : patch.publicText === ""
                    ? ""
                    : item.publicExcerpt,
              }
            : item
        )
      );
      setPublicVersionNotice(notice);
    } catch (error) {
      setPublicVersionNotice(error.message);
    } finally {
      setPublicVersionSaving("");
    }
  }

  async function handleGeneratePublicVersion(record) {
    if (!record?.id) return;

    const suggestion = buildSuggestedPublicVersion(record);
    updatePublicVersionDraft(record.id, {
      ...suggestion,
      editing: false,
    });
    await persistPublicVersion(
      record,
      {
        publicTitle: suggestion.publicTitle,
        publicText: suggestion.publicText,
        redactionStatus: "ai_suggested",
      },
      copy.publicVersionSaved
    );
  }

  async function handleApprovePublicVersion(record, draft) {
    if (!record?.id) return;

    await persistPublicVersion(
      record,
      {
        publicTitle: draft.publicTitle || record.publicTitle || "",
        publicText: draft.publicText || record.publicText || "",
        redactionStatus: "user_confirmed",
      },
      copy.publicVersionApproved
    );
  }

  async function handleRejectPublicVersion(record) {
    if (!record?.id) return;

    updatePublicVersionDraft(record.id, {
      publicTitle: "",
      publicText: "",
      changes: [],
      editing: false,
    });
    await persistPublicVersion(
      record,
      {
        publicTitle: "",
        publicText: "",
        redactionStatus: "none",
      },
      copy.publicVersionRejected
    );
  }

  function handleBulkSharingApplied(result) {
    const recordsById = result?.recordsById || {};
    const recordIds = Array.isArray(result?.recordIds) ? result.recordIds : [];

    if (Object.keys(recordsById).length > 0) {
      setObservations((current) =>
        current.map((item) =>
          recordsById[item.id] ? { ...item, ...recordsById[item.id] } : item
        )
      );
    }

    setBulkShareNotice(
      result?.action === "undo"
        ? copy.bulkUndoComplete
        : copy.bulkPresetApplied({ count: recordIds.length })
    );
  }

  async function handleShareAll(sharingMode) {
    if (!user?.uid || observations.length === 0 || bulkSharingMode) return;

    setBulkSharingMode(sharingMode);
    setBulkShareNotice(copy.bulkSharing);

    try {
      const results = await Promise.allSettled(
        observations.map((record) =>
          updateOwnedRecordSharing(user, record.id, { sharingMode }, profile).then(
            () => record.id
          )
        )
      );
      const successfulIds = new Set(
        results
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value)
      );
      const sharingPatch = buildDashboardSharingPatch(sharingMode, user, profile);

      if (successfulIds.size > 0) {
        setObservations((current) =>
          current.map((item) =>
            successfulIds.has(item.id) ? { ...item, ...sharingPatch } : item
          )
        );
      }

      setBulkShareNotice(
        successfulIds.size === observations.length
          ? normalizePrivacySharingMode(sharingMode) === "pseudonym_public"
            ? copy.bulkShareAccountDone({ count: successfulIds.size })
            : copy.bulkShareAnonymousDone({ count: successfulIds.size })
          : copy.bulkShareFailed
      );
    } catch {
      setBulkShareNotice(copy.bulkShareFailed);
    } finally {
      setBulkSharingMode("");
    }
  }

  async function handleRemove(id) {
    if (activeTab === "observations") {
      await deleteOwnedRecord(user, id);
      setObservations((current) => current.filter((item) => item.id !== id));
      return;
    }

    if (activeTab === "collections") {
      await removeCollectedRecord(user, id);
      setCollectionRecords((current) => current.filter((item) => item.id !== id));
      return;
    }

    await removeSavedRecord(user, id);
    setSavedRecords((current) => current.filter((item) => item.id !== id));
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030407] text-zinc-100 selection:bg-cyan-300/30 selection:text-cyan-50">
      <DashboardBackground />

      <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between lg:pb-5">
          <button
            type="button"
            onClick={onOpenDatabase}
            className="group flex min-w-0 items-center gap-3 self-start"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_24px_rgba(34,211,238,.16)] sm:h-10 sm:w-10">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_55%)]" />
              <span className="relative font-mono text-sm font-bold text-cyan-100">C∴</span>
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-xs uppercase tracking-[0.36em] text-cyan-200/80">
                CDO
              </span>
              <span className="block truncate text-sm font-semibold text-zinc-100">
                {copy.databaseButton}
              </span>
            </span>
          </button>

          <div className="cdo-mobile-scroll-nav sm:grid sm:w-auto sm:grid-cols-4 sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onOpenRecorder}
              className="cdo-mobile-label min-w-0 rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
            >
              {copy.recordButton}
            </button>
            <button
              type="button"
              onClick={onOpenImporter}
              className="cdo-mobile-label min-w-0 rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
            >
              {copy.importButton}
            </button>
            <LanguageToggle language={language} setLanguage={setLanguage} copy={copy} />
            <button
              type="button"
              onClick={onSignOut}
              className="cdo-mobile-label col-span-2 min-w-0 rounded-xl border border-red-300/25 bg-red-400/5 px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-red-100 transition hover:border-red-300/45 hover:bg-red-400/10 sm:col-span-1 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
            >
              {copy.signOut}
            </button>
          </div>
        </header>

        <section className="mb-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/75 shadow-terminal backdrop-blur">
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/10 shadow-[0_0_34px_rgba(34,211,238,.16)]">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,.35),transparent_58%)]" />
                <span className="relative font-mono text-xl font-bold text-cyan-100">
                  {avatarText}
                </span>
              </div>

              <div className="min-w-0">
                <p className="cdo-kicker">
                  {copy.consoleLabel}
                </p>
                <h1 className="mt-2 truncate text-2xl font-semibold text-zinc-50 sm:text-3xl">
                  {displayUser.displayName || displayUser.pseudoId || copy.privateAccountLabel}
                </h1>
                <p className="mt-2 truncate font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {displayUser.showEmail && displayUser.email
                    ? displayUser.email
                    : copy.accountEmailHidden}
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {displayUser.pseudoId} / {copy.memberSince} {displayUser.memberSince}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ProfilePill label={copy.countryLabel} value={displayUser.country || "--"} />
                  <ProfilePill
                    label={copy.ageLabel}
                    value={
                      displayUser.showAge && displayUser.age
                        ? String(displayUser.age)
                        : copy.hiddenAge
                    }
                  />
                  <ProfilePill
                    label={copy.biologicalSexLabel}
                    value={
                      displayUser.showBiologicalSex && displayUser.biologicalSex
                        ? getBiologicalSexLabel(displayUser.biologicalSex, copy)
                        : copy.hiddenAge
                    }
                  />
                </div>
              </div>
            </div>

              <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl xl:grid-cols-4">
                <StatusBlock label={copy.observationCount} value={String(observations.length)} />
                <StatusBlock label={copy.savedCount} value={String(savedRecords.length)} />
                <StatusBlock label={copy.collectionsTab} value={String(collectionRecords.length)} />
                <StatusBlock
                  label={copy.identityStatus}
                  value={getLanguageName(displayUser.preferredLanguage || language, language)}
                />
              </div>
            </div>
          </div>
        </section>

        <AccountDetailsSection
          profileDraft={profileDraft}
          setProfileDraft={setProfileDraft}
          displayUser={displayUser}
          copy={copy}
          language={language}
          setLanguage={setLanguage}
          profileSaving={profileSaving}
          profileNotice={profileNotice}
          onSave={handleSaveProfile}
        />

        {profileDraft && (
          <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/65 p-5 shadow-[0_0_36px_rgba(34,211,238,.08)] backdrop-blur sm:p-7">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="cdo-kicker">{copy.privacyCenterTitle}</p>
                <p className="cdo-body-copy mt-3 max-w-4xl">
                  {copy.privacyCenterSubtitle}
                </p>
              </div>
              <p className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-100 lg:max-w-md">
                {copy.safetyWarning}
              </p>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,.4fr)]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="cdo-card-heading">
                    {copy.privacyDefaultsTitle}
                      </h2>
                      <p className="cdo-muted-copy mt-2 text-xs leading-relaxed">
                        {copy.privacyDefaultsDescription}
                      </p>
                    </div>
                    <p className="max-w-sm rounded-xl border border-cyan-300/15 bg-black/25 p-3 text-xs leading-relaxed text-cyan-100">
                      {copy.statsOnlyReassurance}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                    {privacyDefaultOptions.map((option) => {
                      const active =
                        normalizePrivacySharingMode(profileDraft.defaultSharingMode) ===
                        option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handlePrivacyDefaultModeChange(option.value)}
                          className={[
                            "min-h-12 rounded-xl border px-3 py-3 text-left font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.08em] transition sm:tracking-[0.11em]",
                            active
                              ? "border-cyan-300/45 bg-cyan-300 text-zinc-950 shadow-[0_0_24px_rgba(34,211,238,.18)]"
                              : "border-white/10 bg-black/25 text-zinc-300 hover:border-cyan-300/35 hover:text-cyan-100",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,.6fr)]">
                    <label className="block min-w-0">
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        {copy.defaultPseudonymLabel}
                      </span>
                      <input
                        value={profileDraft.defaultPseudonym || ""}
                        onChange={(event) =>
                          setProfileDraft((current) => ({
                            ...current,
                            defaultPseudonym: event.target.value,
                          }))
                        }
                        placeholder={copy.defaultPseudonymPlaceholder}
                        className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 font-mono text-xs text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </label>
                    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={profileDraft.requireReviewBeforePublic !== false}
                        onChange={(event) =>
                          setProfileDraft((current) => ({
                            ...current,
                            requireReviewBeforePublic: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 accent-cyan-300"
                      />
                      <span className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.12em] text-zinc-300">
                        {copy.reviewBeforePublicLabel}
                      </span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="mt-4 w-full rounded-xl border border-cyan-300/35 bg-cyan-300 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {profileSaving ? "..." : copy.saveProfile}
                  </button>
                </div>

                <details className="group rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-5 sm:p-6">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start gap-3">
                      <DisclosureArrow copy={copy} />
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <h2 className="cdo-card-heading">
                            {copy.presetsTitle}
                          </h2>
                          <p className="cdo-muted-copy mt-2 text-xs leading-relaxed">
                            {copy.presetsDescription}
                          </p>
                        </div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
                          {copy.notDiagnosisReminder}
                        </p>
                      </div>
                    </div>
                  </summary>
                  <PresetScopeControl
                    copy={copy}
                    applyFuture={presetApplyFuture}
                    applyExisting={presetApplyExisting}
                    onFutureChange={setPresetApplyFuture}
                    onExistingChange={setPresetApplyExisting}
                  />
                  <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    {oneClickPresets.map((preset) => (
                      <PresetCard
                        key={preset.id}
                        preset={preset}
                        copy={copy}
                        active={
                          normalizePrivacySharingMode(profileDraft.defaultSharingMode) ===
                          preset.sharingMode
                        }
                        selected={selectedPreset?.id === preset.id}
                        disabled={profileSaving}
                        onSelect={() => setSelectedPresetId(preset.id)}
                        onUse={() => handleApplyPresetChoice(preset)}
                        onApply={() => handleOpenPresetPreview(preset)}
                      />
                    ))}
                  </div>
                </details>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6">
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.55fr)]">
                    <div>
                      <h2 className="cdo-card-heading">
                        {copy.bulkSettingTitle}
                      </h2>
                      <p className="cdo-muted-copy mt-2 text-xs leading-relaxed">
                        {copy.bulkSettingDescription}
                      </p>
                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        {exportDetailOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setExportDetail(option.value)}
                            className={[
                              "min-w-0 rounded-xl border px-3 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.1em] transition sm:tracking-[0.12em]",
                              exportDetail === option.value
                                ? "border-cyan-300/35 bg-cyan-300/10 text-cyan-100"
                                : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-fuchsia-300/30 hover:text-fuchsia-100",
                            ].join(" ")}
                          >
                            <span className="block truncate">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <button
                        type="button"
                        onClick={() => exportPersonalDreamsCsv(observations, { language, detailLevel: exportDetail })}
                        disabled={observations.length === 0}
                        className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-50 sm:tracking-[0.18em]"
                      >
                        {copy.exportCsvButton}
                      </button>
                      <button
                        type="button"
                        onClick={() => exportPersonalDreamsJson(observations, { language, detailLevel: exportDetail })}
                        disabled={observations.length === 0}
                        className="rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-fuchsia-100 transition hover:border-fuchsia-300/45 disabled:cursor-not-allowed disabled:opacity-50 sm:tracking-[0.18em]"
                      >
                        {copy.exportJsonButton}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <PrivacyPresetPreview
                preset={selectedPreset}
                copy={copy}
                disabled={profileSaving}
                applyFuture={presetApplyFuture}
                applyExisting={presetApplyExisting}
                onUse={() => selectedPreset && handleApplyPresetChoice(selectedPreset)}
                onApply={() => selectedPreset && handleOpenPresetPreview(selectedPreset)}
              />
            </div>
          </section>
        )}

        {profileDraft && (
          <PublicVersionTool
            records={observations}
            selectedRecord={selectedPublicVersionRecord}
            selectedRecordId={selectedPublicVersionRecord?.id || ""}
            drafts={publicVersionDrafts}
            copy={copy}
            language={language}
            savingId={publicVersionSaving}
            notice={publicVersionNotice}
            onSelect={setSelectedPublicVersionId}
            onDraftChange={updatePublicVersionDraft}
            onGenerate={handleGeneratePublicVersion}
            onApprove={handleApprovePublicVersion}
            onReject={handleRejectPublicVersion}
          />
        )}

        <PersonalAnalysisPanel stats={personalAnalysis} copy={copy} />

        <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-3 rounded-2xl border border-white/10 bg-black/40 p-1 lg:w-[36rem]">
            <TabButton
              active={activeTab === "observations"}
              onClick={() => setActiveTab("observations")}
            >
              {copy.observationsTab}
            </TabButton>
            <TabButton active={activeTab === "saved"} onClick={() => setActiveTab("saved")}>
              {copy.savedTab}
            </TabButton>
            <TabButton
              active={activeTab === "collections"}
              onClick={() => setActiveTab("collections")}
            >
              {copy.collectionsTab}
            </TabButton>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <label className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-3 sm:flex-row sm:items-center">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                {copy.timeOrderLabel}
              </span>
              <select
                value={timeOrder}
                onChange={(event) => setTimeOrder(event.target.value)}
                className="rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20 sm:tracking-[0.12em]"
              >
                <option value="desc">{copy.timeNewest}</option>
                <option value="asc">{copy.timeOldest}</option>
                <option value="updated">{copy.sortUpdated}</option>
                <option value="name">{copy.sortName}</option>
                <option value="author">{copy.sortAuthor}</option>
              </select>
            </label>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
              {copy.lastSync}: {lastSyncLabel}
            </p>
          </div>
        </section>

        {recordsError && (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 font-mono text-xs leading-6 text-amber-100">
            {recordsError}
          </div>
        )}

        {recordsLoading ? (
          <LoadingState
            label={
              copy.recordsLoading ||
              (language === "zh" ? "正在載入個人紀錄" : "Loading personal records")
            }
          />
        ) : orderedActiveItems.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {orderedActiveItems.map((item) => (
              <RecordCard
                key={item.id}
                item={item}
                language={language}
                copy={copy}
                actionLabel={
                  activeTab === "observations"
                    ? copy.deleteButton
                    : copy.removeButton
                }
                onOpen={() => onOpenRecord?.(item)}
                onRemove={() => handleRemove(item.id)}
              />
            ))}
          </section>
        ) : (
          <EmptyState message={emptyMessage} />
        )}

        {bulkPreset && (
          <BulkSharingModal
            preset={bulkPreset}
            records={observations}
            currentUser={user}
            profile={profile}
            language={language}
            copy={copy}
            onClose={() => setBulkPreset(null)}
            onApplied={handleBulkSharingApplied}
          />
        )}
      </div>
    </main>
  );
}

function formatLastSync(language) {
  const date = new Date();
  if (Number.isNaN(date.getTime())) return "—";

  const locale = language === "zh" ? "zh-Hant-TW" : language === "es" ? "es" : "en";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace("T", " ");
  }
}

function normalizeDashboardUser(user, profile) {
  if (!user) {
    return {
      email: "dreamer@example.com",
      pseudoId: "DREAMER-7F3A9C",
      memberSince: "2026-06-23",
      displayName: "",
      country: "",
      age: "",
      showEmail: false,
      showAge: false,
      biologicalSex: "",
      showBiologicalSex: false,
      preferredLanguage: "zh",
    };
  }

  const uidSeed = user.uid?.slice(0, 6).toUpperCase().padEnd(6, "0") || "000000";
  const createdAt = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toISOString().slice(0, 10)
    : "2026-06-23";

  return {
    email: user.email || "anonymous@collective.local",
    pseudoId: `DREAMER-${uidSeed}`,
    memberSince: profile?.joinedAt || createdAt,
    displayName: profile?.displayName || user.displayName || "",
    country: profile?.country || "",
    age: profile?.age || "",
    showEmail: Boolean(profile?.showEmail),
    showAge: Boolean(profile?.showAge),
    biologicalSex: profile?.biologicalSex || "",
    showBiologicalSex: Boolean(profile?.showBiologicalSex),
    preferredLanguage: normalizeLanguage(profile?.preferredLanguage || "zh"),
  };
}

function getBiologicalSexLabel(value, copy) {
  return copy.biologicalSexOptions?.[value] || copy.biologicalSexPlaceholder || "--";
}

function buildDashboardSharingPatch(sharingMode, user, profile) {
  const normalizedSharingMode = normalizePrivacySharingMode(sharingMode);
  const isPublic =
    normalizedSharingMode === "anonymous_public" ||
    normalizedSharingMode === "pseudonym_public" ||
    normalizedSharingMode === "redacted_public";
  const recordIdentityMode =
    normalizedSharingMode === "pseudonym_public" ? "pseudonym" : "anonymous";

  return {
    visibility: isPublic ? "public" : "private",
    isPublic,
    sharingMode: normalizedSharingMode,
    requestedSharingMode: normalizedSharingMode,
    includedInResearchStats: isPublic || normalizedSharingMode === "stats_only",
    researchConsent: isPublic || normalizedSharingMode === "stats_only",
    publicConsent: isPublic,
    recordIdentityMode,
    attributionMode: recordIdentityMode,
    creatorDisplayName:
      recordIdentityMode === "pseudonym"
        ? profile?.defaultPseudonym || profile?.displayName || user?.displayName || ""
        : "",
    creatorEmail: "",
  };
}

function normalizeRecordItem(item, index) {
  const accents = ["cyan", "fuchsia", "violet"];
  const id = item.id || item.recordId;
  const originalLanguage = normalizeLanguage(
    item.originalLanguage || item.original_language || "en"
  );
  const title = item.title || "";
  const titleEn = item.titleEn || item.title_en || "";
  const titleZh = item.titleZh || item.title_zh || "";
  const titleEs = item.titleEs || item.title_es || "";
  const text = item.dream_text || item.text || item.excerpt || "";
  const textEn = item.dream_text_en || item.textEn || item.text_en || item.excerpt_en || "";
  const textZh = item.dream_text_zh || item.textZh || item.excerpt_zh || item.excerpt || "";
  const textEs = item.dream_text_es || item.textEs || item.excerpt_es || item.excerpt || "";
  const images = normalizeDreamImages(item);
  const imageUrls = images.map((image) => image.url).filter(Boolean);
  const thumbnailUrl = getPrimaryDreamImageUrl(item);
  const dreamDate = getVisibleDreamDate(item);
  const dreamDateStatus = getDreamDateStatus(item);
  const tags = Array.isArray(item.tags) ? item.tags : [];
  const signalCoherence = calculateDreamSignalCoherence({
    dreamText:
      item.originalText ||
      item.original_text ||
      getLanguageSpecificRecordValue({ text, textEn, textZh, textEs }, "text", originalLanguage),
    title:
      item.originalTitle ||
      item.original_title ||
      getLanguageSpecificRecordValue({ title, titleEn, titleZh, titleEs }, "title", originalLanguage),
    dreamDate,
    dreamTime: item.dreamTime || item.dream_time,
    dreamPeriod: item.dreamPeriod || item.dream_period,
    dreamSequence: item.dreamSequence || item.dream_sequence,
    ageAtDream: item.ageAtDream,
    tags,
  });

  return {
    id,
    recordId: item.recordId || id,
    dream_id: item.dream_id || item.recordId || id,
    originalLanguage,
    originalTitle:
      item.originalTitle ||
      item.original_title ||
      getLanguageSpecificRecordValue(
        { title, titleEn, titleZh, titleEs },
        "title",
        originalLanguage
      ),
    originalText:
      item.originalText ||
      item.original_text ||
      getLanguageSpecificRecordValue(
        { text, textEn, textZh, textEs },
        "text",
        originalLanguage
      ),
    translationLanguages: normalizeTranslationLanguages(item.translationLanguages),
    translationSource: item.translationSource || "",
    title,
    titleEn,
    titleZh,
    titleEs,
    text,
    textEn,
    textZh,
    textEs,
    publicTitle: item.publicTitle || item.redactedTitle || "",
    publicText: item.publicText || item.redactedText || "",
    publicExcerpt: item.publicExcerpt || "",
    redactionStatus: item.redactionStatus || "",
    requestedSharingMode: item.requestedSharingMode || item.requested_sharing_mode || "",
    publicConsent: Boolean(item.publicConsent || item.public_consent),
    researchConsent: Boolean(item.researchConsent || item.research_consent),
    images,
    dreamImages: images,
    imageUrls,
    pictureUrls: imageUrls,
    thumbnailUrl,
    thumbnail_url: thumbnailUrl,
    generated_image_url: thumbnailUrl,
    dreamDate,
    dreamDateStatus,
    dream_date_status: dreamDateStatus,
    dreamTime: normalizeDreamTime(item.dreamTime || item.dream_time),
    dream_time: normalizeDreamTime(item.dreamTime || item.dream_time),
    dreamPeriod: normalizeDreamPeriod(item.dreamPeriod || item.dream_period),
    dream_period: normalizeDreamPeriod(item.dreamPeriod || item.dream_period),
    dreamSequence: normalizeDreamSequence(item.dreamSequence || item.dream_sequence),
    dream_sequence: normalizeDreamSequence(item.dreamSequence || item.dream_sequence),
    ageAtDream: item.ageAtDream || "",
    ownerId: item.ownerId || item.creatorId || "",
    creatorId: item.creatorId || item.ownerId || "",
    sourceType: item.sourceType || item.source_type || "",
    importBatchId: item.importBatchId || item.import_batch_id || "",
    sourceFileName: item.sourceFileName || item.source_file_name || "",
    anonymousLocked: Boolean(item.anonymousLocked),
    recordIdentityMode:
      item.recordIdentityMode === "pseudonym" ||
      item.attributionMode === "pseudonym" ||
      item.recordIdentityMode === "account" ||
      item.attributionMode === "account"
        ? "pseudonym"
        : "anonymous",
    creatorDisplayName: item.creatorDisplayName || "",
    authorName: item.authorName || item.creatorDisplayName || "",
    pseudoId: item.pseudoId || item.pseudo_id || "",
    visibility: item.visibility || (item.isPublic === false ? "private" : "public"),
    isPublic: typeof item.isPublic === "boolean" ? item.isPublic : item.visibility === "public",
    sharingMode:
      normalizePrivacySharingMode(
        item.sharingMode ||
        (item.visibility === "stats_only"
        ? "stats_only"
        : item.isPublic
          ? item.recordIdentityMode === "pseudonym" ||
            item.attributionMode === "pseudonym" ||
            item.recordIdentityMode === "account" ||
            item.attributionMode === "account"
            ? "pseudonym_public"
            : "anonymous_public"
          : "private")
      ),
    includedInResearchStats: Boolean(
      item.includedInResearchStats || item.researchConsent
    ),
    tags,
    tagsReviewedByUser: Boolean(item.tagsReviewedByUser || item.tags_reviewed_by_user),
    environmentTags: Array.isArray(item.environmentTags) ? item.environmentTags : [],
    entityTags: Array.isArray(item.entityTags) ? item.entityTags : [],
    anomalyTags: Array.isArray(item.anomalyTags)
      ? item.anomalyTags
      : Array.isArray(item.anomaly_tag_slugs)
        ? item.anomaly_tag_slugs
        : [],
    emotionTags: Array.isArray(item.emotionTags) ? item.emotionTags : [],
    styleTags: Array.isArray(item.styleTags) ? item.styleTags : [],
    eraTags: Array.isArray(item.eraTags) ? item.eraTags : [],
    weatherTags: Array.isArray(item.weatherTags) ? item.weatherTags : [],
    dreamTypeTags: Array.isArray(item.dreamTypeTags) ? item.dreamTypeTags : [],
    perspectiveTags: Array.isArray(item.perspectiveTags) ? item.perspectiveTags : [],
    psychologicalObservableTags: Array.isArray(item.psychologicalObservableTags)
      ? item.psychologicalObservableTags
      : [],
    dreamAnalysisTags: Array.isArray(item.dreamAnalysisTags)
      ? item.dreamAnalysisTags
      : [],
    customTags: Array.isArray(item.customTags) ? item.customTags : [],
    adultContent: Boolean(item.adultContent || item.adult_content || item.isAdult || item.is_adult),
    minimumViewerAge: item.minimumViewerAge || item.minimum_viewer_age || 0,
    sensitivityLevel:
      item.sensitivityLevel ??
      item.sensitivity_level ??
      (item.adultContent || item.adult_content ? 3 : 0),
    signal_coherence: signalCoherence,
    createdAt: item.createdAt || item.created_at || "",
    updatedAt: item.updatedAt || item.updated_at || item.sharingUpdatedAt || "",
    date: formatRecordDate(dreamDate),
    hash: item.hash || `VX-${String(id || "record").slice(0, 8).toUpperCase()}`,
    accent: item.accent || accents[index % accents.length],
  };
}

function getLanguageSpecificRecordValue(record, field, language) {
  const normalizedLanguage = normalizeLanguage(language);

  if (field === "title") {
    if (normalizedLanguage === "zh") return record.titleZh || record.title_zh || "";
    if (normalizedLanguage === "es") return record.titleEs || record.title_es || "";
    return record.titleEn || record.title_en || record.title || "";
  }

  if (normalizedLanguage === "zh") return record.textZh || record.text_zh || "";
  if (normalizedLanguage === "es") return record.textEs || record.text_es || "";
  return record.textEn || record.text_en || record.dream_text_en || record.text || "";
}

function formatRecordDate(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  if (typeof value.toDate === "function") return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);

  return "";
}

function normalizeDreamTime(value) {
  const rawValue = String(value || "").trim();
  const match = rawValue.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/);
  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function normalizeDreamPeriod(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  return ["morning", "afternoon", "evening", "night"].includes(normalizedValue)
    ? normalizedValue
    : "";
}

function normalizeDreamSequence(value) {
  const parsed = Number(value || 1);
  if (!Number.isFinite(parsed)) return 1;

  return Math.max(1, Math.min(12, Math.round(parsed)));
}

function getRecordDateDisplay(item, copy) {
  if (item.dreamDateStatus === "hidden") return copy.hiddenDate;
  return item.date || copy.unknownDate;
}

function getMissingSuggestedTags(item, language) {
  const text = getOriginalItemText(item);
  if (!text) return [];

  const existingSlugs = new Set((item.tags || []).map((tag) => tag.slug).filter(Boolean));

  return suggestTagsForDream(text, item.originalLanguage || language)
    .filter(
      (tag) =>
        tag.confidence >= 0.85 &&
        tag.tagType !== "interpretive_suggestion" &&
        !existingSlugs.has(tag.slug)
    )
    .map((tag) => ({
      ...tag,
      label: getTagLabel(RECORD_TAGS[tag.slug] || tag, language),
    }))
    .slice(0, 6);
}

function getRecordSortMillis(item) {
  const date = formatRecordDate(item.dreamDate || item.date);
  if (!date) return null;

  const time = normalizeDreamTime(item.dreamTime || item.dream_time);
  const parsed = new Date(time ? `${date}T${time}:00` : `${date}T00:00:00`).getTime();

  return Number.isFinite(parsed) ? parsed : null;
}

function getRecordTimestampMillis(value) {
  if (!value) return null;
  if (typeof value.toMillis === "function") return value.toMillis();
  if (Number.isFinite(value?.seconds)) return value.seconds * 1000;

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function getRecordUpdatedMillis(item) {
  return getRecordTimestampMillis(item.updatedAt || item.sharingUpdatedAt || item.createdAt);
}

function compareNullableMillis(first, second, direction = "desc") {
  if (first == null && second == null) return 0;
  if (first == null) return 1;
  if (second == null) return -1;

  return direction === "asc" ? first - second : second - first;
}

function buildPersonalDreamAnalysis(items, language, copy) {
  const languageCounts = new Map();
  const emotionCounts = new Map();
  const dreamTypeCounts = new Map();
  const psychologyCounts = new Map();
  const analysisCounts = new Map();
  const placeCounts = new Map();
  const entityCounts = new Map();
  const symbolCounts = new Map();
  const weatherCounts = new Map();
  const perspectiveCounts = new Map();
  const styleCounts = new Map();
  const eraCounts = new Map();
  const monthCounts = new Map();
  let adultCount = 0;
  let ageTotal = 0;
  let ageCount = 0;
  let lucidCount = 0;
  let nightmareCount = 0;

  items.forEach((item) => {
    const originalLanguage = normalizeLanguage(item.originalLanguage);
    languageCounts.set(originalLanguage, (languageCounts.get(originalLanguage) || 0) + 1);

    const monthKey = getDreamMonthKey(item);
    if (monthKey) {
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }

    if (item.adultContent || Number(item.minimumViewerAge || 0) >= 18) {
      adultCount += 1;
    }

    const ageAtDream = Number(item.ageAtDream);
    if (Number.isFinite(ageAtDream) && ageAtDream > 0) {
      ageTotal += ageAtDream;
      ageCount += 1;
    }

    getEmotionLabels(item, language).forEach((emotion) => {
      incrementMap(emotionCounts, emotion);
    });

    getCategoryTagLabels(item, "Dream Types", language).forEach((label) => {
      incrementMap(dreamTypeCounts, label);
    });

    getCategoryTagLabels(item, "Psychological Observables", language).forEach((label) => {
      incrementMap(psychologyCounts, label);
    });

    getCategoryTagLabels(item, "Dream Analysis", language).forEach((label) => {
      incrementMap(analysisCounts, label);
      incrementMap(symbolCounts, label);
    });

    getCategoryTagLabels(item, "Environment", language).forEach((label) => {
      incrementMap(placeCounts, label);
    });

    getCategoryTagLabels(item, "Entities", language).forEach((label) => {
      incrementMap(entityCounts, label);
    });

    getCategoryTagLabels(item, "Anomalies", language).forEach((label) => {
      incrementMap(symbolCounts, label);
    });

    getCategoryTagLabels(item, "Weather", language).forEach((label) => {
      incrementMap(weatherCounts, label);
    });

    getCategoryTagLabels(item, "Perspective", language).forEach((label) => {
      incrementMap(perspectiveCounts, label);
    });

    getCategoryTagLabels(item, "Styles", language).forEach((label) => {
      incrementMap(styleCounts, label);
    });

    getCategoryTagLabels(item, "Eras", language).forEach((label) => {
      incrementMap(eraCounts, label);
    });

    if (hasTagSlug(item, "lucid")) lucidCount += 1;
    if (hasTagSlug(item, "nightmare")) nightmareCount += 1;
  });

  const leadingLanguage = getTopMapEntry(languageCounts);
  const leadingEmotion = getTopMapEntry(emotionCounts);
  const leadingDreamType = getTopMapEntry(dreamTypeCounts);
  const leadingPsychology = getTopMapEntry(psychologyCounts);
  const leadingAnalysis = getTopMapEntry(analysisCounts);

  return {
    total: items.length,
    adultCount,
    leadingLanguage: leadingLanguage
      ? getLanguageName(leadingLanguage, language)
      : copy.analysisNoData,
    leadingEmotion: leadingEmotion || copy.analysisNoData,
    leadingDreamType: leadingDreamType || copy.analysisNoData,
    leadingPsychology: leadingPsychology || copy.analysisNoData,
    leadingAnalysis: leadingAnalysis || copy.analysisNoData,
    averageAge: ageCount > 0 ? Math.round(ageTotal / ageCount) : copy.analysisNoData,
    dreamFrequency: toTopEntries(monthCounts, 6),
    recurringPlaces: toTopEntries(placeCounts, 5),
    recurringEntities: toTopEntries(entityCounts, 5),
    commonSymbols: toTopEntries(symbolCounts, 5),
    psychologyPatterns: toTopEntries(psychologyCounts, 6),
    analysisMarkers: toTopEntries(analysisCounts, 6),
    weatherPatterns: toTopEntries(weatherCounts, 5),
    perspectivePatterns: toTopEntries(perspectiveCounts, 5),
    stylePatterns: toTopEntries(styleCounts, 5),
    eraPatterns: toTopEntries(eraCounts, 5),
    lucidCount,
    nightmareCount,
    similarDreams: findSimilarDreamPairs(items, language).slice(0, 3),
    reflectionQuestions: buildReflectionQuestions({
      copy,
      language,
      places: toTopEntries(placeCounts, 2),
      entities: toTopEntries(entityCounts, 2),
      emotions: toTopEntries(emotionCounts, 2),
      symbols: toTopEntries(symbolCounts, 2),
    }),
  };
}

function incrementMap(map, key) {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
}

function toTopEntries(map, limit = 5) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function getDreamMonthKey(item) {
  const value = item.dreamDate || item.date || "";
  if (!value || item.dreamDateStatus === "hidden") return "";

  const text = String(value).slice(0, 7);
  return /^\d{4}-\d{2}$/.test(text) ? text : "";
}

function hasTagSlug(item, slug) {
  return (
    item.tags?.some((tag) => tag.slug === slug) ||
    item.dreamTypeTags?.includes(slug) ||
    false
  );
}

function findSimilarDreamPairs(items, language) {
  const pairs = [];

  for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
      const left = items[leftIndex];
      const right = items[rightIndex];
      const leftSlugs = new Set((left.tags || []).map((tag) => tag.slug).filter(Boolean));
      const rightSlugs = new Set((right.tags || []).map((tag) => tag.slug).filter(Boolean));
      const overlap = [...leftSlugs].filter((slug) => rightSlugs.has(slug));

      if (overlap.length < 2) continue;

      pairs.push({
        leftTitle: getOriginalItemTitle(left) || formatRecordDate(left.dreamDate) || left.id,
        rightTitle: getOriginalItemTitle(right) || formatRecordDate(right.dreamDate) || right.id,
        overlapCount: overlap.length,
        tags: overlap
          .slice(0, 3)
          .map((slug) => getTagLabel(RECORD_TAGS[slug] || { slug, name: slug }, language)),
      });
    }
  }

  return pairs.sort((a, b) => b.overlapCount - a.overlapCount);
}

function buildReflectionQuestions({ copy, language, places, entities, emotions, symbols }) {
  const noData = copy.analysisNoData;
  const topPlace = places[0]?.label;
  const topEntity = entities[0]?.label;
  const topEmotion = emotions[0]?.label;
  const topSymbol = symbols[0]?.label;

  if (language === "zh") {
    return [
      topPlace ? `「${topPlace}」反覆出現時，通常伴隨什麼現實中的狀態或關係？` : noData,
      topEntity ? `當「${topEntity}」出現時，你在夢中比較像是靠近、逃避、照顧，還是觀察？` : noData,
      topEmotion ? `最近帶有「${topEmotion}」的夢，是在增加、減少，還是集中於某段時間？` : noData,
      topSymbol ? `「${topSymbol}」像是一個物件、場景規則，還是一種選擇點？` : noData,
    ].filter((item) => item && item !== noData).slice(0, 4);
  }

  if (language === "es") {
    return [
      topPlace ? `Cuando aparece “${topPlace}”, ¿qué estado o relación de la vida diaria suele acompañarlo?` : noData,
      topEntity ? `Cuando aparece “${topEntity}”, ¿te acercas, huyes, cuidas u observas?` : noData,
      topEmotion ? `¿Los sueños con “${topEmotion}” están aumentando, disminuyendo o concentrados en un periodo?` : noData,
      topSymbol ? `¿“${topSymbol}” funciona como objeto, regla del escenario o punto de decisión?` : noData,
    ].filter((item) => item && item !== noData).slice(0, 4);
  }

  return [
    topPlace ? `When “${topPlace}” repeats, what waking-life state or relationship usually surrounds it?` : noData,
    topEntity ? `When “${topEntity}” appears, are you approaching, avoiding, caring, or observing?` : noData,
    topEmotion ? `Are dreams tagged “${topEmotion}” increasing, decreasing, or clustered in one period?` : noData,
    topSymbol ? `Does “${topSymbol}” act like an object, a scene rule, or a choice point?` : noData,
  ].filter((item) => item && item !== noData).slice(0, 4);
}

function getEmotionLabels(item, language) {
  const labels = [];
  const seen = new Set();

  function addLabel(key, label) {
    if (!label || seen.has(key)) return;
    seen.add(key);
    labels.push(label);
  }

  item.tags
    ?.filter((tag) => tag.category === "Emotions")
    .forEach((tag) => {
      const key = tag.slug || tag.name;

      if (language === "zh") {
        addLabel(key, tag.name_zh || tag.nameZh || tag.name);
        return;
      }

      if (language === "es") {
        addLabel(key, tag.name_es || tag.nameEs || tag.name);
        return;
      }

      addLabel(key, tag.name);
    });

  item.emotionTags?.forEach((emotion) => {
    addLabel(emotion, getEmotionFallbackLabel(emotion, language));
  });

  return labels;
}

function getCategoryTagLabels(item, category, language) {
  const labels = [];
  const seen = new Set();

  item.tags
    ?.filter((tag) => tag.category === category)
    .forEach((tag) => {
      const key = tag.slug || tag.name;
      if (!key || seen.has(key)) return;
      seen.add(key);
      labels.push(getTagLabel(tag, language));
    });

  return labels;
}

function getEmotionFallbackLabel(emotion, language) {
  if (RECORD_TAGS[emotion]) {
    return getTagLabel(RECORD_TAGS[emotion], language);
  }

  const labels = {
    awe: { en: "Awe", zh: "敬畏", es: "Asombro" },
    fear: { en: "Fear", zh: "恐懼", es: "Miedo" },
    calm: { en: "Calm", zh: "平靜", es: "Calma" },
    grief: { en: "Grief", zh: "悲傷", es: "Duelo" },
    desire: { en: "Desire", zh: "渴望", es: "Deseo" },
    confusion: { en: "Confusion", zh: "困惑", es: "Confusión" },
  };

  return labels[emotion]?.[language] || labels[emotion]?.en || emotion;
}

function PrivacyPresetPreview({
  preset,
  copy,
  disabled,
  applyFuture,
  applyExisting,
  onUse,
  onApply,
}) {
  if (!preset) return null;

  const accent = ACCENT_STYLES[preset.accent] || ACCENT_STYLES.cyan;
  const publicMode = isPublicPrivacySharingMode(preset.sharingMode);
  const statsMode =
    normalizePrivacySharingMode(preset.sharingMode) === PRIVACY_SHARING_MODES.STATS_ONLY;

  return (
    <aside
      className={[
        "rounded-2xl border bg-black/35 p-5 shadow-terminal sm:p-6 xl:sticky xl:top-6 xl:self-start",
        accent.border,
      ].join(" ")}
    >
      <p className="cdo-kicker">
        {copy.previewTitle}
      </p>
      <h3 className="mt-3 text-xl font-semibold leading-snug text-zinc-50">
        {preset.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">
        {preset.description}
      </p>

      <dl className="mt-5 grid gap-3">
        <PresetFact label={copy.presetPublicLabel} value={preset.publicLine} />
        <PresetFact label={copy.presetPrivateLabel} value={preset.privateLine} />
        <PresetFact label={copy.presetStatsLabel} value={preset.statsLine} />
        <PresetFact
          label={copy.presetScopeTitle}
          value={getPresetScopeLabel(copy, applyFuture, applyExisting)}
        />
      </dl>

      <p
        className={[
          "mt-5 rounded-2xl border p-3 text-xs leading-relaxed",
          publicMode
            ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
            : statsMode
              ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
              : "border-white/10 bg-white/[0.04] text-zinc-300",
        ].join(" ")}
      >
        {statsMode ? copy.statsOnlyReassurance : copy.safetyWarning}
      </p>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onUse}
          disabled={disabled}
          className="rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {copy.applyChoiceButton}
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={disabled}
          className={[
            "rounded-2xl border px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-60",
            publicMode
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100 hover:border-amber-300/50"
              : "border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100 hover:border-fuchsia-300/45",
          ].join(" ")}
        >
          {copy.applyPresetButton}
        </button>
      </div>
    </aside>
  );
}

function PresetScopeControl({
  copy,
  applyFuture,
  applyExisting,
  onFutureChange,
  onExistingChange,
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="cdo-card-heading">{copy.presetScopeTitle}</h3>
          <p className="cdo-muted-copy mt-2 text-xs leading-relaxed">
            {getPresetScopeLabel(copy, applyFuture, applyExisting)}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[26rem]">
          <TogglePill
            checked={applyFuture}
            label={copy.presetScopeFuture}
            onChange={onFutureChange}
          />
          <TogglePill
            checked={applyExisting}
            label={copy.presetScopeExisting}
            onChange={onExistingChange}
          />
        </div>
      </div>
    </div>
  );
}

function DisclosureArrow({ copy }) {
  return (
    <span
      aria-hidden="true"
      title={copy.expandPanel || copy.presetsTitle}
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-100 transition group-open:rotate-90"
    >
      &gt;
    </span>
  );
}

function TogglePill({ checked, label, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange?.(!checked)}
      className={[
        "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition",
        checked
          ? "border-cyan-300/45 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-cyan-300/35 hover:text-cyan-100",
      ].join(" ")}
    >
      <span className="min-w-0 font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.1em]">
        {label}
      </span>
      <span
        className={[
          "flex h-5 w-9 shrink-0 items-center rounded-full border p-0.5 transition",
          checked ? "border-cyan-300/50 bg-cyan-300/30" : "border-white/15 bg-black/30",
        ].join(" ")}
      >
        <span
          className={[
            "h-3.5 w-3.5 rounded-full transition",
            checked ? "translate-x-3.5 bg-cyan-100" : "translate-x-0 bg-zinc-500",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

function getPresetScopeLabel(copy, applyFuture, applyExisting) {
  if (applyFuture && applyExisting) return copy.presetScopeBoth;
  if (applyFuture) return copy.presetScopeFutureOnly;
  if (applyExisting) return copy.presetScopeExistingOnly;
  return copy.presetScopeNone;
}

function AccountDetailsSection({
  profileDraft,
  setProfileDraft,
  displayUser,
  copy,
  language,
  setLanguage,
  profileSaving,
  profileNotice,
  onSave,
}) {
  if (!profileDraft) return null;

  return (
    <section className="mb-6 rounded-3xl border border-white/10 bg-zinc-950/60 p-5 backdrop-blur sm:p-7">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="cdo-panel-heading">
          {copy.accountDetails}
        </h2>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
          {copy.joinedDate}: {displayUser.memberSince}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.displayNameLabel}
          </span>
          <input
            value={profileDraft.displayName || ""}
            onChange={(event) =>
              setProfileDraft((current) => ({
                ...current,
                displayName: event.target.value,
              }))
            }
            placeholder={copy.displayNamePlaceholder}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.countryLabel}
          </span>
          <input
            value={profileDraft.country || ""}
            onChange={(event) =>
              setProfileDraft((current) => ({
                ...current,
                country: event.target.value,
              }))
            }
            placeholder={copy.countryPlaceholder}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.ageLabel}
          </span>
          <input
            type="number"
            min="0"
            value={profileDraft.age || ""}
            onChange={(event) =>
              setProfileDraft((current) => ({
                ...current,
                age: event.target.value,
              }))
            }
            placeholder={copy.agePlaceholder}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-cyan-50 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.biologicalSexLabel}
          </span>
          <select
            value={profileDraft.biologicalSex || "preferNotToSay"}
            onChange={(event) =>
              setProfileDraft((current) => ({
                ...current,
                biologicalSex: event.target.value,
              }))
            }
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          >
            {BIOLOGICAL_SEX_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {copy.biologicalSexOptions[option] || copy.biologicalSexPlaceholder}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            {copy.preferredLanguageLabel}
          </span>
          <select
            value={profileDraft.preferredLanguage || language}
            onChange={(event) => {
              const nextLanguage = event.target.value;
              setProfileDraft((current) => ({
                ...current,
                preferredLanguage: nextLanguage,
              }));
              setLanguage(nextLanguage);
            }}
            className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-sm text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} / {getLanguageName(option.value, language)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <VisibilityCheckbox
            checked={Boolean(profileDraft.showEmail)}
            label={copy.showEmailLabel}
            onChange={(checked) =>
              setProfileDraft((current) => ({ ...current, showEmail: checked }))
            }
          />
          <VisibilityCheckbox
            checked={Boolean(profileDraft.showAge)}
            label={copy.showAgeLabel}
            onChange={(checked) =>
              setProfileDraft((current) => ({ ...current, showAge: checked }))
            }
          />
          <VisibilityCheckbox
            checked={Boolean(profileDraft.showBiologicalSex)}
            label={copy.showBiologicalSexLabel}
            onChange={(checked) =>
              setProfileDraft((current) => ({
                ...current,
                showBiologicalSex: checked,
              }))
            }
          />
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={profileSaving}
          className="rounded-2xl border border-cyan-300/35 bg-cyan-300 px-5 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70 sm:tracking-[0.2em] lg:min-w-48"
        >
          {profileSaving ? "..." : copy.saveProfile}
        </button>
      </div>

      {profileNotice && (
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-cyan-100">
          {profileNotice}
        </p>
      )}
    </section>
  );
}

function VisibilityCheckbox({ checked, label, onChange }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-cyan-300"
      />
      <span className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-300">
        <span className="break-words">{label}</span>
      </span>
    </label>
  );
}

function PublicVersionTool({
  records = [],
  selectedRecord,
  selectedRecordId,
  drafts = {},
  copy,
  language = "en",
  savingId = "",
  notice = "",
  onSelect,
  onDraftChange,
  onGenerate,
  onApprove,
  onReject,
}) {
  const draft = selectedRecord
    ? {
        publicTitle: selectedRecord.publicTitle || "",
        publicText: selectedRecord.publicText || "",
        changes: [],
        editing: false,
        ...(drafts[selectedRecord.id] || {}),
      }
    : null;
  const privateText = selectedRecord ? getPrivateDreamText(selectedRecord) : "";
  const privateTitle = selectedRecord ? getPrivateDreamTitle(selectedRecord) : "";
  const busy = Boolean(selectedRecord?.id && savingId === selectedRecord.id);

  return (
    <details className="group mb-6 rounded-3xl border border-cyan-300/15 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(34,211,238,.06)] backdrop-blur sm:p-7">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start gap-3">
          <DisclosureArrow copy={copy} />
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="cdo-kicker">{copy.publicVersionTitle}</p>
              <p className="cdo-body-copy mt-3 max-w-3xl">
                {copy.publicVersionDescription}
              </p>
            </div>
            <p className="max-w-lg rounded-2xl border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-relaxed text-amber-100">
              {copy.publicVersionNotice}
            </p>
          </div>
        </div>
      </summary>

      {records.length === 0 ? (
        <p className="cdo-muted-copy mt-5">{copy.publicVersionEmpty}</p>
      ) : (
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              {copy.publicVersionSelect}
            </span>
            <select
              value={selectedRecordId}
              onChange={(event) => onSelect(event.target.value)}
              className="w-full rounded-2xl border border-cyan-300/15 bg-black/40 px-4 py-3.5 font-mono text-xs text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
            >
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {getDisplayItemTitle(record, language) || record.id}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <h3 className="cdo-card-heading">{copy.publicVersionPrivate}</h3>
              {privateTitle && (
                <p className="mt-4 text-lg font-semibold leading-snug text-zinc-100">
                  <HighlightedText text={privateTitle} changes={draft?.changes || []} variant="private" />
                </p>
              )}
              <p className="mt-4 max-h-96 overflow-y-auto pr-2 text-sm leading-relaxed text-zinc-300">
                <HighlightedText text={privateText} changes={draft?.changes || []} variant="private" />
              </p>
            </section>

            <section className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-5">
              <h3 className="cdo-card-heading">{copy.publicVersionPublic}</h3>
              {draft?.editing ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={draft.publicTitle}
                    onChange={(event) =>
                      onDraftChange(selectedRecord.id, { publicTitle: event.target.value })
                    }
                    className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 font-mono text-xs text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                  <textarea
                    value={draft.publicText}
                    onChange={(event) =>
                      onDraftChange(selectedRecord.id, { publicText: event.target.value })
                    }
                    rows={12}
                    className="w-full rounded-xl border border-cyan-300/15 bg-black/40 px-3 py-3 text-sm leading-relaxed text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
                  />
                </div>
              ) : draft?.publicText ? (
                <>
                  {draft.publicTitle && (
                    <p className="mt-4 text-lg font-semibold leading-snug text-zinc-100">
                      <HighlightedText text={draft.publicTitle} changes={draft.changes || []} variant="public" />
                    </p>
                  )}
                  <p className="mt-4 max-h-96 overflow-y-auto pr-2 text-sm leading-relaxed text-zinc-300">
                    <HighlightedText text={draft.publicText} changes={draft.changes || []} variant="public" />
                  </p>
                </>
              ) : (
                <p className="cdo-muted-copy mt-4">{copy.publicVersionNoSuggestion}</p>
              )}
            </section>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <h3 className="cdo-card-heading">{copy.publicVersionSensitive}</h3>
            {draft?.changes?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {draft.changes.map((change, index) => (
                  <span
                    key={`${change.original}-${index}`}
                    className="rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 font-mono text-[10px] text-amber-100"
                  >
                    {change.original} {"->"} {change.replacement}
                  </span>
                ))}
              </div>
            ) : (
              <p className="cdo-muted-copy mt-3">{copy.publicVersionNoSuggestion}</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <button
              type="button"
              onClick={() => selectedRecord && onGenerate(selectedRecord)}
              disabled={!selectedRecord || busy}
              className="rounded-2xl border border-cyan-300/35 bg-cyan-300 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "..." : copy.publicVersionGenerate}
            </button>
            <button
              type="button"
              onClick={() =>
                selectedRecord &&
                onDraftChange(selectedRecord.id, { editing: !draft?.editing })
              }
              disabled={!selectedRecord}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-cyan-300/35 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.publicVersionEdit}
            </button>
            <button
              type="button"
              onClick={() => selectedRecord && onApprove(selectedRecord, draft || {})}
              disabled={!selectedRecord || !draft?.publicText || busy}
              className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:border-emerald-300/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.publicVersionApprove}
            </button>
            <button
              type="button"
              onClick={() => selectedRecord && onReject(selectedRecord)}
              disabled={!selectedRecord || busy}
              className="rounded-2xl border border-red-300/25 bg-red-400/5 px-4 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-red-100 transition hover:border-red-300/45 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copy.publicVersionReject}
            </button>
          </div>

          {notice && (
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-cyan-100">
              {notice}
            </p>
          )}
        </div>
      )}
    </details>
  );
}

function HighlightedText({ text, changes = [], variant }) {
  const source = String(text || "");
  const phrases = changes
    .map((change) => (variant === "public" ? change.replacement : change.original))
    .filter(Boolean);

  if (!source || phrases.length === 0) return source;

  const escaped = phrases.map(escapeRegExp).sort((a, b) => b.length - a.length);
  const matcher = new RegExp(`(${escaped.join("|")})`, "giu");
  const parts = source.split(matcher);

  return (
    <>
      {parts.map((part, index) =>
        phrases.some((phrase) => phrase.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={`${part}-${index}`}
            className="rounded bg-amber-300/20 px-1 text-amber-100"
          >
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function PresetCard({
  preset,
  copy,
  active,
  selected,
  disabled,
  onSelect,
  onUse,
  onApply,
}) {
  const accent = ACCENT_STYLES[preset.accent] || ACCENT_STYLES.cyan;
  const publicMode = isPublicPrivacySharingMode(preset.sharingMode);
  const statsMode =
    normalizePrivacySharingMode(preset.sharingMode) === PRIVACY_SHARING_MODES.STATS_ONLY;

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={[
        "cursor-pointer rounded-2xl border bg-black/30 p-4 shadow-terminal transition sm:p-5",
        selected ? `${accent.border} ring-1 ring-cyan-300/25` : active ? accent.border : "border-white/10",
        selected ? accent.glow : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span className={["mt-1 h-2.5 w-2.5 shrink-0 rounded-full", accent.dot].join(" ")} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold leading-snug text-zinc-100">
            {preset.title}
            </h3>
            {active && (
              <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-cyan-100">
                {copy.activeStatus}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {preset.description}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={[
            "rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em]",
            publicMode
              ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
              : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
          ].join(" ")}
        >
          {publicMode ? copy.presetPublicLabel : copy.presetPrivateLabel}
        </span>
        {statsMode && (
          <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-100">
            {copy.presetStatsLabel}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUse?.();
          }}
          disabled={disabled}
          className="rounded-xl border border-cyan-300/35 bg-cyan-300 px-3 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 sm:tracking-[0.14em]"
        >
          {copy.applyChoiceButton}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onApply?.();
          }}
          disabled={disabled}
          className={[
            "rounded-xl border px-3 py-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60 sm:tracking-[0.14em]",
            publicMode
              ? "border-amber-300/25 bg-amber-300/10 text-amber-100 hover:border-amber-300/45"
              : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-fuchsia-300/35 hover:bg-fuchsia-300/10",
          ].join(" ")}
        >
          {copy.applyPresetButton}
        </button>
      </div>
    </article>
  );
}

function PresetFact({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3.5">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-200/80">
        {label}
      </dt>
      <dd className="mt-2 text-xs leading-relaxed text-zinc-300">
        {value}
      </dd>
    </div>
  );
}

function getTopMapEntry(map) {
  let topKey = "";
  let topValue = 0;

  map.forEach((value, key) => {
    if (value > topValue) {
      topKey = key;
      topValue = value;
    }
  });

  return topKey;
}

function DashboardBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-22rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[-16rem] right-[-10rem] h-[36rem] w-[36rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.10),transparent_34rem)]" />
    </div>
  );
}

function LanguageToggle({ language, setLanguage, copy }) {
  return <LanguageMenu language={language} setLanguage={setLanguage} copy={copy} />;
}

function PersonalAnalysisPanel({ stats, copy }) {
  const [visualsOpen, setVisualsOpen] = useState(false);

  return (
    <details className="group mb-8 rounded-3xl border border-cyan-300/15 bg-zinc-950/60 p-5 shadow-[0_0_34px_rgba(34,211,238,.06)] backdrop-blur sm:p-7">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start gap-3">
          <DisclosureArrow copy={copy} />
          <div className="min-w-0">
            <p className="cdo-kicker">
              {copy.analysisTitle}
            </p>
            <p className="cdo-body-copy mt-3 max-w-3xl">
              {copy.analysisText}
            </p>
          </div>
        </div>
      </summary>
      <div className="mt-5 flex justify-start sm:justify-end">
        <button
          type="button"
          onClick={() => setVisualsOpen(true)}
          className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-fuchsia-100 transition hover:border-fuchsia-300/45 hover:bg-fuchsia-300/15"
        >
          {copy.analysisVisualsButton}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusBlock label={copy.analysisTotal} value={String(stats.total)} />
        <StatusBlock label={copy.analysisAdult} value={String(stats.adultCount)} />
        <StatusBlock label={copy.analysisLanguageLead} value={stats.leadingLanguage} />
        <StatusBlock label={copy.analysisEmotionLead} value={stats.leadingEmotion} />
        <StatusBlock label={copy.analysisDreamTypeLead} value={stats.leadingDreamType} />
        <StatusBlock label={copy.analysisPsychologyLead} value={stats.leadingPsychology} />
        <StatusBlock label={copy.analysisAnalysisLead} value={stats.leadingAnalysis} />
        <StatusBlock label={copy.analysisAverageAge} value={String(stats.averageAge)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <MiniList title={copy.analysisFrequency} items={stats.dreamFrequency} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisRecurringPlaces} items={stats.recurringPlaces} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisRecurringEntities} items={stats.recurringEntities} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisCommonSymbols} items={stats.commonSymbols} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisPsychologyPatterns} items={stats.psychologyPatterns} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisAnalysisMarkers} items={stats.analysisMarkers} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisWeatherPatterns} items={stats.weatherPatterns} empty={copy.analysisNoData} />
        <MiniList title={copy.analysisPerspectivePatterns} items={stats.perspectivePatterns} empty={copy.analysisNoData} />
        <StatusBlock
          label={copy.analysisLucidNightmare}
          value={`${stats.lucidCount || 0} / ${stats.nightmareCount || 0}`}
        />
        <SimilarDreamList
          title={copy.analysisSimilarDreams}
          items={stats.similarDreams}
          empty={copy.analysisNoData}
        />
      </div>

      <ReflectionList
        title={copy.analysisReflectionQuestions}
        questions={stats.reflectionQuestions}
        empty={copy.analysisNoData}
      />

      {visualsOpen && (
        <PersonalVisualModal
          stats={stats}
          copy={copy}
          onClose={() => setVisualsOpen(false)}
        />
      )}
    </details>
  );
}

function PersonalVisualModal({ stats, copy, onClose }) {
  const visualGroups = [
    { title: copy.analysisFrequency, items: stats.dreamFrequency },
    { title: copy.analysisPsychologyPatterns, items: stats.psychologyPatterns },
    { title: copy.analysisAnalysisMarkers, items: stats.analysisMarkers },
    { title: copy.analysisWeatherPatterns, items: stats.weatherPatterns },
    { title: copy.analysisPerspectivePatterns, items: stats.perspectivePatterns },
    { title: copy.analysisStylePatterns, items: stats.stylePatterns },
    { title: copy.analysisEraPatterns, items: stats.eraPatterns },
    { title: copy.analysisCommonSymbols, items: stats.commonSymbols },
  ];
  const orbitItems = [
    ...(stats.recurringPlaces || []).slice(0, 2),
    ...(stats.recurringEntities || []).slice(0, 2),
    ...(stats.psychologyPatterns || []).slice(0, 3),
    ...(stats.analysisMarkers || []).slice(0, 3),
  ].slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-md sm:p-6">
      <section className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-6xl rounded-3xl border border-cyan-300/20 bg-zinc-950/95 p-5 shadow-[0_0_80px_rgba(34,211,238,.16)] sm:min-h-0 sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="cdo-kicker">
              {copy.analysisVisualsTitle}
            </p>
            <p className="cdo-body-copy mt-3 max-w-3xl">
              {copy.analysisVisualsText}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ProfilePill label={copy.analysisTotal} value={String(stats.total)} />
              <ProfilePill label={copy.analysisEmotionLead} value={stats.leadingEmotion} />
              <ProfilePill label={copy.analysisPsychologyLead} value={stats.leadingPsychology} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-200 transition hover:border-cyan-300/35 hover:text-cyan-100"
          >
            {copy.closeVisuals}
          </button>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <PersonalVisualOrbit items={orbitItems} empty={copy.analysisNoData} />
          <div className="grid gap-4 sm:grid-cols-2">
            {visualGroups.map((group) => (
              <PersonalVisualBarCard
                key={group.title}
                title={group.title}
                items={group.items}
                total={Math.max(1, stats.total)}
                empty={copy.analysisNoData}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PersonalVisualOrbit({ items = [], empty }) {
  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-cyan-300/15 bg-black/35 p-5">
      <div className="absolute inset-6 rounded-full border border-cyan-300/10" />
      <div className="absolute inset-16 rounded-full border border-fuchsia-300/10" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/25 bg-cyan-300/10 shadow-[0_0_38px_rgba(34,211,238,.16)]" />
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_20px_rgba(103,232,249,.9)]" />

      {items.length > 0 ? (
        <div className="relative grid min-h-[19rem] grid-cols-2 content-between gap-3 sm:grid-cols-3">
          {items.map((item, index) => (
            <span
              key={`${item.label}-${index}`}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-slate-200 shadow-[0_0_24px_rgba(0,0,0,.25)]"
            >
              <span className="block truncate">{item.label}</span>
              <span className="mt-1 block text-cyan-100">{item.count}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="relative flex min-h-[19rem] items-center justify-center text-sm leading-relaxed text-slate-400">
          {empty}
        </p>
      )}
    </div>
  );
}

function PersonalVisualBarCard({ title, items = [], total, empty }) {
  const maxCount = Math.max(1, ...items.map((item) => item.count || 0));

  return (
    <section className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="cdo-card-heading">
          {title}
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          N={total}
        </span>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.slice(0, 6).map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-sm font-medium text-slate-300">{item.label}</span>
                <span className="font-mono text-cyan-100">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="cdo-gradient-bar h-full rounded-full"
                  style={{ width: `${Math.max(6, Math.round((item.count / maxCount) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="cdo-muted-copy mt-4">{empty}</p>
      )}
    </section>
  );
}

function MiniList({ title, items = [], empty }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <h3 className="cdo-card-heading">
        {title}
      </h3>
      {items.length > 0 ? (
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-zinc-300">{item.label}</span>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/5 px-2 py-1 font-mono text-[10px] text-cyan-100">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="cdo-muted-copy mt-4">{empty}</p>
      )}
    </div>
  );
}

function SimilarDreamList({ title, items = [], empty }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <h3 className="cdo-card-heading">
        {title}
      </h3>
      {items.length > 0 ? (
        <div className="mt-4 space-y-4">
          {items.map((item) => (
            <div key={`${item.leftTitle}-${item.rightTitle}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="cdo-body-copy">
                {item.leftTitle} ↔ {item.rightTitle}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                {item.tags.join(" / ")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="cdo-muted-copy mt-4">{empty}</p>
      )}
    </div>
  );
}

function ReflectionList({ title, questions = [], empty }) {
  return (
    <div className="mt-6 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-5">
      <h3 className="cdo-panel-heading">
        {title}
      </h3>
      {questions.length > 0 ? (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {questions.map((question) => (
            <li key={question} className="cdo-body-copy rounded-xl border border-white/10 bg-black/25 p-4">
              {question}
            </li>
          ))}
        </ul>
      ) : (
        <p className="cdo-muted-copy mt-4">{empty}</p>
      )}
    </div>
  );
}

function ProfilePill({ label, value }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-300">
      <span className="text-zinc-500">{label}: </span>
      <span className="text-cyan-100">{value}</span>
    </span>
  );
}

function StatusBlock({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="cdo-metric-label">
        {label}
      </p>
      <p className="cdo-metric-value mt-2 truncate">
        {value}
      </p>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-[0.18em] transition",
        active
          ? "bg-fuchsia-300 text-zinc-950 shadow-[0_0_20px_rgba(217,70,239,.18)]"
          : "text-zinc-500 hover:bg-white/5 hover:text-fuchsia-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function RecordCard({ item, language, copy, actionLabel, onOpen, onRemove, locked = false }) {
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const style = ACCENT_STYLES[item.accent] || ACCENT_STYLES.cyan;
  const title = getDisplayItemTitle(item, language);
  const body = getDisplayItemText(item, language);
  const showThumbnail = Boolean(item.thumbnailUrl && !thumbnailFailed);
  const missingSuggestedTags = getMissingSuggestedTags(item, language).slice(0, 3);
  const suggestionTitle =
    missingSuggestedTags.length > 0
      ? `${copy.tagSuggestionHint}: ${missingSuggestedTags.map((tag) => tag.label).join(", ")}`
      : "";

  return (
    <article
      onClick={onOpen}
      className={[
        "cdo-record-card cursor-pointer overflow-hidden rounded-3xl border bg-zinc-950/80 backdrop-blur transition duration-300 hover:-translate-y-1",
        style.border,
        style.glow,
      ].join(" ")}
    >
      {showThumbnail && (
        <div className="relative h-44 border-b border-white/10 bg-black">
          <img
            src={item.thumbnailUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover opacity-90"
            onError={() => setThumbnailFailed(true)}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:28px_28px] opacity-20" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950/90 to-transparent" />
          <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/45 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100 backdrop-blur">
            {item.hash}
          </div>
          <span className={`absolute right-4 top-4 h-3 w-3 rounded-full ${style.dot}`} />
        </div>
      )}

      <div className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {getRecordDateDisplay(item, copy)}
          </span>
          {missingSuggestedTags.length > 0 && (
            <span
              className="inline-flex shrink-0 items-center gap-1"
              title={suggestionTitle}
              aria-label={suggestionTitle}
            >
              {missingSuggestedTags.map((tag) => (
                <span
                  key={tag.slug}
                  className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,.85)]"
                />
              ))}
            </span>
          )}
        </div>
        {title && <h2 className="text-xl font-semibold text-zinc-50">{title}</h2>}
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {copy.recordedBy} @{getItemAuthorName(item, copy)}
        </p>
        {body && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-300">
            {body}
          </p>
        )}
        <p className="mt-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100">
          {copy.originalLanguageLabel}: {getLanguageName(item.originalLanguage, language)}
        </p>

        <button
          type="button"
          disabled={locked}
          onClick={(event) => {
            event.stopPropagation();
            if (locked) return;
            onRemove();
          }}
          className={[
            "mt-6 w-full rounded-xl border px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] transition",
            locked
              ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-500"
              : "border-red-300/20 bg-red-400/5 text-red-100 hover:border-red-300/45 hover:bg-red-400/10",
          ].join(" ")}
        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

function getOriginalItemTitle(item) {
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  return (
    item.originalTitle ||
    getLanguageSpecificRecordValue(item, "title", originalLanguage) ||
    item.title ||
    ""
  );
}

function getDisplayItemTitle(item, language) {
  const requestedLanguage = normalizeLanguage(language);
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(item, requestedLanguage)
  ) {
    return getLanguageSpecificRecordValue(item, "title", requestedLanguage) || "";
  }

  return getOriginalItemTitle(item);
}

function getOriginalItemText(item) {
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  return (
    item.originalText ||
    getLanguageSpecificRecordValue(item, "text", originalLanguage) ||
    item.text ||
    ""
  );
}

function getDisplayItemText(item, language) {
  const requestedLanguage = normalizeLanguage(language);
  const originalLanguage = normalizeLanguage(item.originalLanguage);

  if (
    requestedLanguage !== originalLanguage &&
    hasRecorderTranslation(item, requestedLanguage)
  ) {
    return getLanguageSpecificRecordValue(item, "text", requestedLanguage) || "";
  }

  return getOriginalItemText(item);
}

function hasRecorderTranslation(record, language) {
  if (record.translationSource !== "recorder_provided") return false;

  return normalizeTranslationLanguages(record.translationLanguages).includes(
    normalizeLanguage(language)
  );
}

function normalizeTranslationLanguages(value) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(normalizeLanguage))];
}

function getItemAuthorName(item, copy) {
  return (
    item.authorName ||
    item.creatorDisplayName ||
    item.displayName ||
    copy.anonymousObserver
  );
}

function LoadingState({ label }) {
  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-10 text-center shadow-[0_0_40px_rgba(34,211,238,.06)]">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-200 border-t-transparent" />
      <p className="font-mono text-sm uppercase tracking-[0.24em] text-cyan-100">
        {label}
      </p>
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <section className="rounded-3xl border border-dashed border-cyan-300/20 bg-cyan-300/5 p-10 text-center shadow-[0_0_40px_rgba(34,211,238,.06)]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-black/40">
        <span className="font-mono text-lg text-cyan-100">∅</span>
      </div>
      <p className="font-mono text-sm uppercase tracking-[0.24em] text-cyan-100">
        {message}
      </p>
    </section>
  );
}
