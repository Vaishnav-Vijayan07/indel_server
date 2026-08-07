const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const MsmeTargetedAudience = models.MsmeTargetedAudience;

class MsmeTargetedAudienceController {
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
      const updateData = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/msme-targeted-audience/${req.file.filename}`;
        Logger.info(`Uploaded image for MsmeTargetedAudience: ${updateData.image}`);
      }

      const audience = await MsmeTargetedAudience.create(updateData);

      await CacheService.invalidate("msmeTargetedAudience");
      res.status(201).json({ success: true, data: audience, message: "MSME Targeted Audience created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "msmeTargetedAudience";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const audiences = await MsmeTargetedAudience.findAll({ order: [["order", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(audiences), 3600);
        return res.json({ success: true, data: audiences });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search (search on title, description)
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions[Op.or] = [
          { title: { [Op.iLike]: `%${search.trim()}%` } },
          { description: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `msmeTargetedAudience_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await MsmeTargetedAudience.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
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
      const cacheKey = `msmeTargetedAudience_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(audience), 3600);
      res.json({ success: true, data: audience });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = audience.image;

      if (req.file) {
        updateData.image = `/uploads/msme-targeted-audience/${req.file.filename}`;
        Logger.info(`Updated image for MsmeTargetedAudience ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await MsmeTargetedAudienceController.deleteFile(oldImage);
        }
      }

      await audience.update(updateData);

      await CacheService.invalidate("msmeTargetedAudience");
      await CacheService.invalidate(`msmeTargetedAudience_${id}`);
      res.json({ success: true, data: audience, message: "MSME Targeted Audience updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const audience = await MsmeTargetedAudience.findByPk(id);
      if (!audience) {
        throw new CustomError("MSME Targeted Audience not found", 404);
      }

      const oldImage = audience.image;
      await audience.destroy();

      if (oldImage) {
        await MsmeTargetedAudienceController.deleteFile(oldImage);
      }

      await CacheService.invalidate("msmeTargetedAudience");
      await CacheService.invalidate(`msmeTargetedAudience_${id}`);
      res.json({ success: true, message: "MSME Targeted Audience deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MsmeTargetedAudienceController;
