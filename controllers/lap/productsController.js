const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const LapProducts = models.LapProducts;

class LapProductsController {
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
        updateData.icon = `/uploads/lap-products/${req.file.filename}`;
        Logger.info(`Uploaded icon for LapProduct: ${updateData.icon}`);
      }

      const lapProduct = await LapProducts.create(updateData);

      await CacheService.invalidate("lapProducts");
      res.status(201).json({ success: true, data: lapProduct, message: "LAP Product created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "lapProducts";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const lapProducts = await LapProducts.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(lapProducts), 3600);
      res.json({ success: true, data: lapProducts });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const lapProduct = await LapProducts.findByPk(id);
      if (!lapProduct) {
        throw new CustomError("LAP Product not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = lapProduct.icon;

      if (req.file) {
        updateData.icon = `/uploads/lap-products/${req.file.filename}`;
        Logger.info(`Updated icon for LapProduct ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await LapProductsController.deleteFile(oldIcon);
        }
      }

      await lapProduct.update(updateData);

      await CacheService.invalidate("lapProducts");
      await CacheService.invalidate(`lapProduct_${id}`);
      res.json({ success: true, data: lapProduct, message: "LAP Product updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const lapProduct = await LapProducts.findByPk(id);
      if (!lapProduct) {
        throw new CustomError("LAP Product not found", 404);
      }

      const oldIcon = lapProduct.icon;
      await lapProduct.destroy();

      if (oldIcon) {
        await LapProductsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("lapProducts");
      await CacheService.invalidate(`lapProduct_${id}`);
      res.json({ success: true, message: "LAP Product deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LapProductsController;
