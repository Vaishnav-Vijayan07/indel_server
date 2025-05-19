const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const News = models.News;

class NewsController {
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
      const data = { ...req.body };
      if (!req.files || !req.files.image) {
        throw new CustomError("Image is required", 400);
      }
      data.image = `/uploads/news/${req.files.image[0].filename}`;
      Logger.info(`Uploaded image for News: ${data.image}`);
      if (req.files.second_image) {
        data.second_image = `/uploads/news/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for News: ${data.second_image}`);
      }

      const news = await News.create(data);
      await CacheService.invalidate("News");
      res.status(201).json({ success: true, data: news, message: "News created" });
    } catch (error) {
      if (req.files) {
        if (req.files.image) {
          await NewsController.deleteFile(`/uploads/news/${req.files.image[0].filename}`);
        }
        if (req.files.second_image) {
          await NewsController.deleteFile(`/uploads/news/${req.files.second_image[0].filename}`);
        }
      }
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "News";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const news = await News.findAll({ order: [["order", "ASC"]] });
      await CacheService.set(cacheKey, JSON.stringify(news), 3600);
      res.json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `news_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const news = await News.findByPk(id);
      if (!news) {
        throw new CustomError("News not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(news), 3600);
      res.json({ success: true, data: news });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const news = await News.findByPk(id);
      if (!news) {
        throw new CustomError("News not found", 404);
      }

      const updateData = { ...req.body };
      const oldImage = news.image;
      const oldSecondImage = news.second_image;

      if (req.files && req.files.image) {
        updateData.image = `/uploads/news/${req.files.image[0].filename}`;
        Logger.info(`Updated image for News ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await NewsController.deleteFile(oldImage);
        }
      }
      if (req.files && req.files.second_image) {
        updateData.second_image = `/uploads/news/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for News ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await NewsController.deleteFile(oldSecondImage);
        }
      }

      await news.update(updateData);
      await CacheService.invalidate("News");
      await CacheService.invalidate(`news_${id}`);
      res.json({ success: true, data: news, message: "News updated" });
    } catch (error) {
      if (req.files) {
        if (req.files.image) {
          await NewsController.deleteFile(`/uploads/news/${req.files.image[0].filename}`);
        }
        if (req.files.second_image) {
          await NewsController.deleteFile(`/uploads/news/${req.files.second_image[0].filename}`);
        }
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const news = await News.findByPk(id);
      if (!news) {
        throw new CustomError("News not found", 404);
      }

      const oldImage = news.image;
      const oldSecondImage = news.second_image;
      await news.destroy();

      if (oldImage) {
        await NewsController.deleteFile(oldImage);
      }
      if (oldSecondImage) {
        await NewsController.deleteFile(oldSecondImage);
      }

      await CacheService.invalidate("News");
      await CacheService.invalidate(`news_${id}`);
      res.json({ success: true, message: "News deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NewsController;