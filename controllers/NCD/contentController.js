const Logger = require("../../services/logger");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const fs = require("fs").promises;
const path = require("path");
const NcdPageContent = models.NcdPageContent;

class NcdPageContentController {


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



  static async get(req, res, next) {
    try {
      const cacheKey = "NcdPageContent";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      
      const content = await NcdPageContent.findOne();
      if (!content) {
        throw new CustomError("NCD form Page Content not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(content), 3600);
      res.json({ success: true, data: content });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const content = await NcdPageContent.findOne();
      if (!content) {
        throw new CustomError("NCD form Page Content not found", 404);
      }
      const updateData = { ...req.body };
      
       if (req.files) {
        if (req.files.banner_image) {
          updateData.banner_image = `/uploads/ncd-forms/${req.files.banner_image[0].filename}`;
             await NcdPageContentController.deleteFile(content.banner_image);
        }
        if (req.files.second_banner_image) {
          updateData.second_banner_image = `/uploads/ncd-forms/${req.files.second_banner_image[0].filename}`;
             await NcdPageContentController.deleteFile(content.second_banner_image);
        }
      }

      await content.update(updateData);

      
      await CacheService.invalidate("NcdPageContent");
      res.json({ success: true, data: content, message: "NCD form Page Content updated" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NcdPageContentController;
