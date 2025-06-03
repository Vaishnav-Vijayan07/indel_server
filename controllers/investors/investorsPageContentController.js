const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const InvestorsPageContent = models.InvestorsPageContent;

class InvestorsPageContentController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "Uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async get(req, res, next) {
    try {
      const cacheKey = "investorsPageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await InvestorsPageContent.findOne();
      if (!content) {
        throw new CustomError("Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await InvestorsPageContent.findOne();
      if (!content) {
        throw new CustomError("Content not found", 404);
      }

      const updateData = { ...req.body };
      const oldDisclosureFile = content.disclosure_file;
      const oldCsrPolicyDoc = content.csr_policy_doc;

      if (req.files.csr_policy_doc) {
        updateData.csr_policy_doc = `/Uploads/investors/${req.files.csr_policy_doc[0].filename}`;
        Logger.info(`Updated CSR policy document: ${updateData.csr_policy_doc}`);
        if (oldCsrPolicyDoc) {
          await InvestorsPageContentController.deleteFile(oldCsrPolicyDoc);
        }
      }

      if (req.files.disclosure_file) {
        updateData.disclosure_file = `/Uploads/investors/${req.files.disclosure_file[0].filename}`;
        Logger.info(`Updated disclosure file: ${updateData.disclosure_file}`);
        if (oldDisclosureFile) {
          await InvestorsPageContentController.deleteFile(oldDisclosureFile);
        }
      }

      await content.update(updateData);
      await CacheService.invalidate([
        "investorsPageContent",
        "webCsrReports",
        "webCorporateGovernence",
        "webInvestorsContact",
        "webNcdReports",
      ]);
      res.json({ success: true, data: content, message: "Investors Page Content updated" });
    } catch (error) {
      if (req.file) {
        await InvestorsPageContentController.deleteFile(`/Uploads/investors/${req.file.filename}`);
      }
      next(error);
    }
  }
}

module.exports = InvestorsPageContentController;
