const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const OmbudsmanFiles = models.OmbudsmanFiles;

class OmbudsmanFilesController {
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

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      if (req.file) {
        updateData.file = `/uploads/ombudsman-files/${req.file.filename}`;
        Logger.info(`Uploaded file for OmbudsmanFile: ${updateData.file}`);
      }

      const ombudsmanFile = await OmbudsmanFiles.create(updateData);

      await CacheService.invalidate("ombudsmanFiles");
      res.status(201).json({ success: true, data: ombudsmanFile, message: "Ombudsman File created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "ombudsmanFiles";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const ombudsmanFiles = await OmbudsmanFiles.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(ombudsmanFiles), 3600);
      res.json({ success: true, data: ombudsmanFiles });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `ombudsmanFile_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const ombudsmanFile = await OmbudsmanFiles.findByPk(id);
      if (!ombudsmanFile) {
        throw new CustomError("Ombudsman File not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(ombudsmanFile), 3600);
      res.json({ success: true, data: ombudsmanFile });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const ombudsmanFile = await OmbudsmanFiles.findByPk(id);
      if (!ombudsmanFile) {
        throw new CustomError("Ombudsman File not found", 404);
      }

      const updateData = { ...req.body };
      let oldFile = ombudsmanFile.file;

      if (req.file) {
        updateData.file = `/uploads/ombudsman-files/${req.file.filename}`;
        Logger.info(`Updated file for OmbudsmanFile ID ${id}: ${updateData.file}`);
        if (oldFile) {
          await OmbudsmanFilesController.deleteFile(oldFile);
        }
      }

      await ombudsmanFile.update(updateData);

      await CacheService.invalidate("ombudsmanFiles");
      await CacheService.invalidate(`ombudsmanFile_${id}`);
      res.json({ success: true, data: ombudsmanFile, message: "Ombudsman File updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const ombudsmanFile = await OmbudsmanFiles.findByPk(id);
      if (!ombudsmanFile) {
        throw new CustomError("Ombudsman File not found", 404);
      }

      const oldFile = ombudsmanFile.file;
      await ombudsmanFile.destroy();

      if (oldFile) {
        await OmbudsmanFilesController.deleteFile(oldFile);
      }

      await CacheService.invalidate("ombudsmanFiles");
      await CacheService.invalidate(`ombudsmanFile_${id}`);
      res.json({ success: true, message: "Ombudsman File deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OmbudsmanFilesController;
