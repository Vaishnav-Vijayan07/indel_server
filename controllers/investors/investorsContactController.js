const { models } = require("../../models/index");
const { Op } = require("sequelize");
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
      await CacheService.invalidatePattern("InvestorsContact_page_*");
      res.status(201).json({ success: true, data: investorsContact, message: "Investors Contact created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "InvestorsContact";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const investorsContacts = await InvestorsContact.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(investorsContacts), 3600);
        return res.json({ success: true, data: investorsContacts });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `InvestorsContact_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await InvestorsContact.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const response = {
        success: true,
        data: rows,
        total: count,
        pagination: {
          page: pageNum,
          total: count,
          totalPages,
          limit: limitNum,
          offset,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
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
      await CacheService.invalidatePattern("InvestorsContact_page_*");
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
      await CacheService.invalidatePattern("InvestorsContact_page_*");
      res.json({ success: true, message: "Investors Contact deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = InvestorsContactController;
