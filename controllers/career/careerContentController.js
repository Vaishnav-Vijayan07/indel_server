const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CareerContents = models.CareersContent;

class CareerContentsController {
  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      console.log(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async get(req, res, next) {
    try {
      const cacheKey = "CareerContents";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const content = await CareerContents.findOne();
      if (!content) {
        throw new CustomError("Career Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await CareerContents.findOne();
      if (!content) {
        throw new CustomError("Career Content not found", 404);
      }

      const updateData = { ...req.body };

      if (req.file) {
        console.log(req.file);
        updateData.make_your_move_image = `/uploads/career-contents/${req.file.filename}`;
        console.log(content.make_your_move_image);
        await CareerContentsController.deleteFile(content.make_your_move_image);
      }

      await content.update(updateData);

      await CacheService.invalidate("CareerContents");
       await CacheService.invalidate("webCareerPage");
      res.json({ success: true, data: content, message: "Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CareerContentsController;
