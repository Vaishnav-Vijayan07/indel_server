const { Op, fn, col, where } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const States = models.CareerStates;

class StatesController {
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
      if (req.file) {
        updateData.image = `/uploads/career-states/${req.file.filename}`;
        Logger.info(`Uploaded image for State: ${updateData.image}`);
      }
    const existState = await States.findOne({
      where: where(
        fn('LOWER', col('state_name')),
        updateData.state_name.toLowerCase()
      )
    });


      if (existState) {
        throw new CustomError(`${existState?.state_name} is already exists`, 400);
      }

      const state = await States.create(updateData);

      await CacheService.invalidate("states");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidatePattern("states_page_*");

      res.status(201).json({ success: true, data: state, message: "State created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "states";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const states = await States.findAll({
          order: [["order", "ASC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(states), 3600);
        return res.json({ success: true, data: states });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.state_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `states_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await States.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
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
      const cacheKey = `state_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const state = await States.findByPk(id);
      if (!state) {
        throw new CustomError("State not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(state), 3600);
      res.json({ success: true, data: state });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const state = await States.findByPk(id);
      if (!state) {
        throw new CustomError("State not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = state.image;

      if (req.file) {
        updateData.image = `/uploads/career-states/${req.file.filename}`;
        Logger.info(`Updated image for State ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await StatesController.deleteFile(oldImage);
        }
      }

      await state.update(updateData);

      await CacheService.invalidate("states");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`state_${id}`);
      await CacheService.invalidatePattern("states_page_*");
      res.json({ success: true, data: state, message: "State updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const state = await States.findByPk(id);
      if (!state) {
        throw new CustomError("State not found", 404);
      }

      const oldImage = state.image;
      await state.destroy();

      if (oldImage) {
        await StatesController.deleteFile(oldImage);
      }

      await CacheService.invalidate("states");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`state_${id}`);
      await CacheService.invalidatePattern("states_page_*");
      res.json({ success: true, message: "State deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StatesController;
