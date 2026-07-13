const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const InvestorsContact = models.InvestorsContact;

class InvestorsContactController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const file = req.file ? `/uploads/investors/investors-contacts/${req.file.filename}` : null;
      if (data.type === "pdf") {
        data.name = "";
        data.address = "";
        data.phone = "";
        data.email = "";
      }
      const investorsContact = await InvestorsContact.create({ ...data, file });
      await CacheService.invalidate("InvestorsContact");
      await CacheService.invalidate("webInvestorsContact");
      res.status(201).json({ success: true, data: investorsContact, message: "Investors Contact created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "InvestorsContact";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const investorsContacts = await InvestorsContact.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(investorsContacts), 3600);
      res.json({ success: true, data: investorsContacts });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `investorsContact_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(investorsContact), 3600);
      res.json({ success: true, data: investorsContact });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      const updateData = { ...req.body };
      const oldFile = investorsContact.file;

      if (req.file) {
        updateData.file = `/uploads/investors/investors-contacts/${req.file.filename}`;
        if (oldFile) {
          await InvestorsContactController.deleteFile(oldFile);
        }
      } else if (req.body.removeFile === "true" || req.body.removeFile === true) {
        if (oldFile) {
          await InvestorsContactController.deleteFile(oldFile);
        }
        updateData.file = null;
      } else {
        updateData.file = oldFile;
      }

      if (investorsContact.type === "pdf" && updateData.type === "text") {
        if (oldFile && !req.file) {
          await InvestorsContactController.deleteFile(oldFile);
        }
        updateData.file = null;
      }

      // PDF mode: null text-only fields
      if (updateData.type === "pdf") {
        updateData.name = "";
        updateData.address = "";
        updateData.phone = "";
        updateData.email = "";
      }

      await investorsContact.update(updateData);
      await CacheService.invalidate("InvestorsContact");
      await CacheService.invalidate("webInvestorsContact");
      await CacheService.invalidate(`investorsContact_${id}`);
      res.json({ success: true, data: investorsContact, message: "Investors Contact updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const investorsContact = await InvestorsContact.findByPk(id);
      if (!investorsContact) {
        throw new CustomError("Investors Contact not found", 404);
      }

      const file = investorsContact.file;
      if (file) {
        await InvestorsContactController.deleteFile(file);
      }

      await investorsContact.destroy();
      await CacheService.invalidate("InvestorsContact");
      await CacheService.invalidate("webInvestorsContact");
      await CacheService.invalidate(`investorsContact_${id}`);
      res.json({ success: true, message: "Investors Contact deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvestorsContactController;
