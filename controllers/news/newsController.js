const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("../../utils/slugify"); // Import the slugify utility
const { Sequelize } = require("sequelize");
const emailWorker = require("../../utils/workerPool");
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
      const absolutePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        filePath.replace("/uploads/", "")
      );
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

      if (!updateData.slug && updateData.title) {
        updateData.slug = await NewsController.generateUniqueSlug(
          updateData.title
        );
        Logger.info(`Generated slug for new news: ${updateData.slug}`);
      }

      if (req.files?.image) {
        updateData.image = `/uploads/news/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for News: ${updateData.image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/news/${req.files.second_image[0].filename}`;
        Logger.info(
          `Uploaded second image for News: ${updateData.second_image}`
        );
      }

      const news = await News.create(updateData);

      const subscribedEmails = await models.NewsLetterSubs.findAll({
        attributes: ["email"],
      });
      const emailList = subscribedEmails
        .map((sub) => sub.email)
        .filter(Boolean);

      const newsUrl = `${process.env.FRONTEND_URL}/news/page/${news.id}`;
      const batchSize = 500; 
      const batches = [];

      for (let i = 0; i < emailList.length; i += batchSize) {
        batches.push(emailList.slice(i, i + batchSize));
      }

      const shortContent = updateData.image_description?.slice(0, 200) + "..." || "";

      const subject = `Latest News: ${updateData.title}`;
      const text = `Hello,\n\nWe’ve just published a new update:\n\n${updateData.title}\n\n${shortContent}\n\nRead more at: ${newsUrl}\n\nRegards,\nTeam Indel Money`;

      const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #1a202c;">${updateData.title}</h2>
        <p>${shortContent}</p>
        <p><a href="${newsUrl}" style="color: #2b6cb0;">Read the full news here →</a></p>
        <hr />
        <p style="font-size: 12px; color: #718096;">You received this email because you're subscribed to Indel Money news updates.</p>
      </div>
    `;
      const sendTasks = batches.map((batch) =>
        emailWorker.run({ emails: batch, text, subject, html })
      );

      Promise.allSettled(sendTasks)
        .then(async (results) => {
          results.forEach((res, idx) => {
            if (res.status === "fulfilled") {
              Logger.info(
                `Batch ${idx + 1} done (${
                  res.value.accepted?.length
                } accepted)`
              );
            } else {
              Logger.error(`Batch ${idx + 1} failed: ${res.reason.message}`);
            }
          });

          try {
            await emailWorker.destroy();
            Logger.info("Piscina worker destroyed after all batches sent");
          } catch (destroyErr) {
            Logger.error(
              `Failed to destroy Piscina worker: ${destroyErr.message}`
            );
          }
        })
        .catch((batchErr) => {
          Logger.error(
            `Error while sending email batches: ${batchErr.message}`
          );
        });

      await CacheService.invalidate("news");
      res
        .status(201)
        .json({ success: true, data: news, message: "News created" });
    } catch (error) {
      Logger.error(`News create error: ${error.stack}`);
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
      updateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== null)
      );

      // Generate slug if title is updated and no slug is provided
      if (updateData.title && !updateData.slug) {
        updateData.slug = await NewsController.generateUniqueSlug(
          updateData.title,
          id
        );
        Logger.info(
          `Generated slug for updated news ID ${id}: ${updateData.slug}`
        );
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
        Logger.info(
          `Updated second image for News ID ${id}: ${updateData.second_image}`
        );
        if (oldSecondImage) {
          await NewsController.deleteFile(oldSecondImage);
        }
      }

      await news.update(updateData);

      await CacheService.invalidate("news");
      await CacheService.invalidate(`news_${id}`);
      await CacheService.invalidate(`metaData:newsItem:${id}`);

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
