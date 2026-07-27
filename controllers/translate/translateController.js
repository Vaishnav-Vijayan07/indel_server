const { translateBatch } = require("../../services/translateService");

const SUPPORTED_LOCALES = [
  "en",
  "as",
  "bn",
  "gu",
  "hi",
  "kn",
  "kok",
  "mai",
  "ml",
  "mr",
  "or",
  "pa",
  "sat",
  "ta",
  "te",
  "ur",
  // "ne",
  // "sa",
  // "sd",
  // "doi",
  // "mni-Mtei",
];

class TranslateController {
  static async translate(req, res, next) {
    try {
      const { targetLocale, texts, sourceLocale = "en" } = req.body;

      if (!targetLocale || typeof targetLocale !== "string" || !SUPPORTED_LOCALES.includes(targetLocale)) {
        return res.status(400).json({ status: "fail", message: "Invalid or missing targetLocale" });
      }

      if (!Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({ status: "fail", message: "Request must include a non-empty texts array" });
      }

      if (targetLocale === sourceLocale) {
        return res.json({ status: "success", data: texts });
      }

      const translatedTexts = await translateBatch(texts, targetLocale, sourceLocale);
      return res.json({ status: "success", data: translatedTexts });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TranslateController;
