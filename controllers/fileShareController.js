const Logger = require("winston");
const { models } = require("../models");
const { Op } = require("sequelize");
const CacheService = require("../services/cacheService");
const FIleShare = models.FileShare;
const path = require("path");
const fs = require("fs").promises;

class FileShareController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Uploaded file: ${data.file}`);
      }

      const files = await FIleShare.create(data);

      await CacheService.invalidate("fileShare");
      res.status(201).json({ success: true, data: files, message: "File created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiles(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // Legacy path - no pagination params (backward compatible)
      if (!page && !limit) {
        const cacheKey = "fileShare";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const files = await FIleShare.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(files), 3600);
        return res.json({ success: true, data: files });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `fileShare_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await FIleShare.findAndCountAll({
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

  static async updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await FIleShare.findByPk(id);

      if (!file) {
        if (req.file) {
          const newFilePath = path.join(__dirname, "..", "..", "uploads", "file-share", req.file.filename);
          await fs.unlink(newFilePath).catch(() => {});
        }

        return res.status(404).json({ success: false, message: "File not found" });
      }

      const updateData = { ...req.body };

      // If a new file is uploaded, update the file path
      if (req.file) {
        updateData.file = `/uploads/file-share/${req.file.filename}`;
        Logger.info(`Updated file: ${updateData.file}`);
      }

      // If old file exists, delete it
      if (file.file) {
        const oldFileRelative = file.file.replace("/uploads/", "");
        const oldFilePath = path.join(__dirname, "..", "..", "uploads", oldFileRelative);

        try {
          await fs.access(oldFilePath);
          Logger.info(`Deleting old file: ${oldFilePath}`);
          await fs.unlink(oldFilePath);
          Logger.info(`Deleted old file: ${oldFilePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            Logger.warn(`Old file not found, skipping delete: ${oldFilePath}`);
          } else {
            throw err; // rethrow unexpected errors
          }
        }
      }

      await file.update(updateData);
      await CacheService.invalidate("fileShare");
      res.json({ success: true, data: file, message: "File updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const file = await FIleShare.findByPk(id);
      if (!file) {
        return res.status(404).json({ success: false, message: "File not found" });
      }

      if (file.file) {
        const oldFileRelative = file.file.replace("/uploads/", "");
        const oldFilePath = path.join(__dirname, "..", "..", "uploads", oldFileRelative);

        try {
          await fs.access(oldFilePath);
          Logger.info(`Deleting old file: ${oldFilePath}`);
          await fs.unlink(oldFilePath);
          Logger.info(`Deleted old file: ${oldFilePath}`);
        } catch (err) {
          if (err.code === "ENOENT") {
            Logger.warn(`Old file not found, skipping delete: ${oldFilePath}`);
          } else {
            throw err; // rethrow unexpected errors
          }
        }
      }

      await file.destroy();
      await CacheService.invalidate("fileShare");
      res.json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FileShareController;
