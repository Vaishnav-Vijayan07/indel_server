const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const CdLoanProducts = models.CdLoanProducts;

class CdLoanProductsController {
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
        updateData.icon = `/uploads/cd-loan-products/${req.file.filename}`;
        Logger.info(`Uploaded icon for CdLoanProduct: ${updateData.icon}`);
      }

      const product = await CdLoanProducts.create(updateData);

      await CacheService.invalidate("cdLoanProducts");
      await CacheService.invalidate("webCDLoan");
      res.status(201).json({ success: true, data: product, message: "CD Loan Product created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "cdLoanProducts";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const products = await CdLoanProducts.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(products), 3600);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `cdLoanProduct_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const product = await CdLoanProducts.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Product not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(product), 3600);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const product = await CdLoanProducts.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Product not found", 404);
      }

      const updateData = { ...req.body };
      let oldIcon = product.icon;

      if (req.file) {
        updateData.icon = `/uploads/cd-loan-products/${req.file.filename}`;
        Logger.info(`Updated icon for CdLoanProduct ID ${id}: ${updateData.icon}`);
        if (oldIcon) {
          await CdLoanProductsController.deleteFile(oldIcon);
        }
      }

      await product.update(updateData);

      await CacheService.invalidate("cdLoanProducts");
      await CacheService.invalidate("webCDLoan");
      await CacheService.invalidate(`cdLoanProduct_${id}`);
      res.json({ success: true, data: product, message: "CD Loan Product updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const product = await CdLoanProducts.findByPk(id);
      if (!product) {
        throw new CustomError("CD Loan Product not found", 404);
      }

      const oldIcon = product.icon;
      await product.destroy();

      if (oldIcon) {
        await CdLoanProductsController.deleteFile(oldIcon);
      }

      await CacheService.invalidate("cdLoanProducts");
      await CacheService.invalidate("webCDLoan");
      await CacheService.invalidate(`cdLoanProduct_${id}`);
      res.json({ success: true, message: "CD Loan Product deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CdLoanProductsController;
