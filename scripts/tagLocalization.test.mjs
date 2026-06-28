import assert from "node:assert/strict";
import {
  getTagLabel,
  normalizeCustomTagEntry,
  normalizeSharedTag,
  tagExists,
} from "../src/lib/tagTaxonomy.js";

const chineseLabel = "\u9670\u6697\u9577\u5eca";
const normalizedChineseEntry = normalizeCustomTagEntry({
  label: chineseLabel,
  category: "Environment",
  language: "zh",
});

assert.equal(normalizedChineseEntry.originalLanguage, "zh");
assert.equal(normalizedChineseEntry.nameZh, chineseLabel);
assert.equal(normalizedChineseEntry.nameEn, "");
assert.equal(normalizedChineseEntry.nameEs, "");
assert.equal(normalizedChineseEntry.translationStatus, "pending");

const legacyCopiedTag = normalizeSharedTag({
  slug: "environment-dark-corridor",
  category: "Environment",
  name: chineseLabel,
  name_zh: chineseLabel,
  name_es: chineseLabel,
});

assert.equal(legacyCopiedTag.originalLanguage, "zh");
assert.equal(legacyCopiedTag.nameEn, undefined);
assert.equal(legacyCopiedTag.name_en, "");
assert.equal(legacyCopiedTag.name_zh, chineseLabel);
assert.equal(legacyCopiedTag.name_es, "");
assert.equal(getTagLabel(legacyCopiedTag, "en"), chineseLabel);
assert.equal(getTagLabel(legacyCopiedTag, "es"), chineseLabel);

const curatedTag = normalizeSharedTag({
  slug: "environment-dark-corridor",
  category: "Environment",
  name: chineseLabel,
  name_en: "dark corridor",
  name_zh: chineseLabel,
  name_es: "pasillo oscuro",
  originalLabel: chineseLabel,
  originalLanguage: "zh",
});

assert.equal(curatedTag.translationStatus, "complete");
assert.equal(getTagLabel(curatedTag, "en"), "dark corridor");
assert.equal(getTagLabel(curatedTag, "zh"), chineseLabel);
assert.equal(getTagLabel(curatedTag, "es"), "pasillo oscuro");
assert.equal(tagExists("dark corridor", [], [curatedTag]), true);
assert.equal(tagExists("pasillo oscuro", [], [curatedTag]), true);

console.log("tag localization tests passed");
