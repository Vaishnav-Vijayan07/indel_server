const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("../../utils/slugify"); // Import the slugify utility
const { Sequelize, where } = require("sequelize");

const News = models.News;

class NewsController {
  // Utility to generate unique slug
  static async generateUniqueSlug(title, excludeId = null) {
    let slug = slugify(title);
    if (!slug) {
      slug = "news-post"; // Fallback slug if title is empty
    }

    let count = 0;
    let uniqueSlug = slug;

    // Check for existing slugs
    while (
      await News.findOne({
        where: { slug: uniqueSlug, id: { [Sequelize.Op.ne]: excludeId } },
      })
    ) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }

    return uniqueSlug;
  }

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

      // Generate slug from title if not provided
      if (!updateData.slug && updateData.title) {
        updateData.slug = await NewsController.generateUniqueSlug(updateData.title);
        Logger.info(`Generated slug for new news: ${updateData.slug}`);
      }

      if (req.files?.image) {
        updateData.image = `/uploads/news/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for News: ${updateData.image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/news/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for News: ${updateData.second_image}`);
      }

      const news = await News.create(updateData);

      await CacheService.invalidate("news");
      res.status(201).json({ success: true, data: news, message: "News created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "news";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const newsItems = await News.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(newsItems), 3600);
      res.json({ success: true, data: newsItems });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { slug } = req.params;
      const cacheKey = `news_${slug}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const news = await News.findOne({ where: { slug } });
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

      let updateData = { ...req.body };
      let oldImage = news.image;
      let oldSecondImage = news.second_image;

      // Remove any `null` values from the updateData object
      updateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== null));

      // Generate slug if title is updated and no slug is provided
      if (updateData.title && !updateData.slug) {
        updateData.slug = await NewsController.generateUniqueSlug(updateData.title, id);
        Logger.info(`Generated slug for updated news ID ${id}: ${updateData.slug}`);
      }

      // Handle image uploads
      if (req.files?.image) {
        updateData.image = `/uploads/news/${req.files.image[0].filename}`;
        Logger.info(`Updated image for News ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await NewsController.deleteFile(oldImage);
        }
      }

      if (req.files?.second_image) {
        updateData.second_image = `/uploads/news/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for News ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await NewsController.deleteFile(oldSecondImage);
        }
      }

      await news.update(updateData);

      await CacheService.invalidate("news");
      await CacheService.invalidate(`news_${id}`);

      res.json({ success: true, data: news, message: "News updated" });
    } catch (error) {
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

      await CacheService.invalidate("news");
      await CacheService.invalidate(`news_${id}`);
      res.json({ success: true, message: "News deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NewsController;
