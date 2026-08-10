const { models } = require("../../models/index");
const { fn, col, where, Op } = require("sequelize");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");

const Districts = models.Districts;

class DistrictsController {
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
        updateData.image = `/uploads/career-districts/${req.file.filename}`;
        Logger.info(`Uploaded image for District: ${updateData.image}`);
      }

      const existDistrict = await Districts.findOne({
        where: where(fn("LOWER", col("district_name")), updateData.district_name.toLowerCase()),
      });
      if (existDistrict) {
        throw new CustomError(`${existDistrict?.district_name} is already exists`, 400);
      }
      const district = await Districts.create(updateData);

      await CacheService.invalidate("districts");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidatePattern("districts_page_*");

      res.status(201).json({ success: true, data: district, message: "District created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      const includeState = [
        {
          model: models.CareerStates,
          as: "state",
          attributes: ["state_name"],
        },
      ];

      // Legacy path - no pagination params (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "districts";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const districts = await Districts.findAll({
          order: [["order", "ASC"]],
          include: includeState, // Assuming association
        });

        await CacheService.set(cacheKey, JSON.stringify(districts), 3600);
        return res.json({ success: true, data: districts });
      }

      // Pagination path
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.district_name = { [Op.iLike]: `%${search.trim()}%` };
      }

      const cacheKey = search ? null : `districts_page_${pageNum}_limit_${limitNum}`;

      const { count, rows } = await Districts.findAndCountAll({
        where: whereConditions,
        order: [["order", "ASC"]],
        include: includeState,
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
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
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      };

      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getDistrictsByStateId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "state_id parameter is required." });
      }

      const cacheKey = `districts_state_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const districts = await Districts.findAll({
        where: { state_id: id }, // filter by state_id
        order: [["district_name", "ASC"]],
        include: [
          {
            model: models.CareerStates,
            as: "state",
            attributes: ["state_name"],
          },
        ],
      });

      await CacheService.set(cacheKey, JSON.stringify(districts), 3600);

      res.json({ success: true, data: districts });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `district_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const district = await Districts.findByPk(id, {
        include: [{ model: models.CareerStates, as: "state" }], // Assuming association
      });
      if (!district) {
        throw new CustomError("District not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(district), 3600);
      res.json({ success: true, data: district });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const district = await Districts.findByPk(id);
      if (!district) {
        throw new CustomError("District not found", 404);
      }

      const updateData = { ...req.body };
      let oldImage = district.image;

      if (req.file) {
        updateData.image = `/uploads/career-districts/${req.file.filename}`;
        Logger.info(`Updated image for District ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await DistrictsController.deleteFile(oldImage);
        }
      }

      await district.update(updateData);

      await CacheService.invalidate("districts");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`district_${id}`);
      await CacheService.invalidatePattern("districts_page_*");
      await CacheService.invalidatePattern("districts_state_*");
      res.json({ success: true, data: district, message: "District updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const district = await Districts.findByPk(id);
      if (!district) {
        throw new CustomError("District not found", 404);
      }

      const oldImage = district.image;
      await district.destroy();

      if (oldImage) {
        await DistrictsController.deleteFile(oldImage);
      }

      await CacheService.invalidate("districts");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`district_${id}`);
      await CacheService.invalidatePattern("districts_page_*");
      await CacheService.invalidatePattern("districts_state_*");
      res.json({ success: true, message: "District deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DistrictsController;
