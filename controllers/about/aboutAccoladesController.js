const { models, Sequelize } = require("../../models/index");
const { Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const AboutAccolades = models.AboutAccolades;

class AboutAccoladesController {
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

      

      if (req.files?.highlight_image) {
        data.highlight_image = `/uploads/about-accolades/${req.files.highlight_image[0]?.filename}`;
        Logger.info(`Uploaded image for about accolades highlight image: ${data.highlight_image}`);
      }

      if (req.files?.image) {
        data.image = `/uploads/about-accolades/${req.files.image[0]?.filename}`;
        Logger.info(`Uploaded image for about accolades image: ${data.image}`);
      }

      const link = await AboutAccolades.create(data);
      await CacheService.invalidate("aboutAccolade");
      res.status(201).json({ success: true, data: link, message: "Item created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "aboutAccolade";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const links = await AboutAccolades.findAll({ order: [["createdAt", "ASC"]] });
        await CacheService.set(cacheKey, JSON.stringify(links), 3600);
        return res.json({ success: true, data: links });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `aboutAccolade_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await AboutAccolades.findAndCountAll({
        where: whereConditions,
        order: [["createdAt", "ASC"]],
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
      const cacheKey = `aboutAccolade_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(link), 3600);
      res.json({ success: true, data: link });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      

      const updateData = { ...req.body };
      const oldImage = link.image;
      const oldHighlightImage = link.highlight_image;

      if (req.files?.image) {
        updateData.image = `/uploads/about-accolades/${req.files.image[0].filename}`;
        Logger.info(`Updated image for AboutAccolade ID ${id}: ${updateData.image}`);
        // if (oldImage) {
        //   await AboutAccoladesController.deleteFile(oldImage);
        // }
      }

      if (req.files?.highlight_image) {
        updateData.highlight_image = `/uploads/about-accolades/${req.files.highlight_image[0].filename}`;
        Logger.info(`Updated highlight image for AboutAccolade ID ${id}: ${updateData.highlight_image}`);
        // if (oldHighlightImage) {
        //   await AboutAccoladesController.deleteFile(oldHighlightImage);
        // }
      }

      await link.update(updateData);
      await CacheService.invalidate("aboutAccolade");
      await CacheService.invalidate(`aboutAccolade_${id}`);
      res.json({ success: true, data: link, message: "Item updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const link = await AboutAccolades.findByPk(id);
      if (!link) {
        throw new CustomError("Item not found", 404);
      }

      const oldImage = link.image;
      const oldHighlightImage = link.highlight_image;
      await link.destroy();

      // if (oldImage) {
      //   await AboutAccoladesController.deleteFile(oldImage);
      // }

      // if (oldHighlightImage) {
      //   await AboutAccoladesController.deleteFile(oldHighlightImage);
      // }

      await CacheService.invalidate("aboutAccolade");
      await CacheService.invalidate(`aboutAccolade_${id}`);
      res.json({ success: true, message: "Item deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AboutAccoladesController;
