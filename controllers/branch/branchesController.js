const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const states = require("../../models/career/states");

const Branches = models.Branches;

class BranchesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const branch = await Branches.create(data);
      await CacheService.invalidate("Branches");
      res.status(201).json({ success: true, data: branch, message: "Branch created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "Branches";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const branches = await Branches.findAll({
        where: { is_active: true },
        include: [
          { model: models.CareerStates, as: "states", attributes: ["state_name"] },
          { model: models.Districts, as: "districts", attributes: ["district_name"] },
          { model: models.CareerLocations, as: "locations", attributes: ["location_name"] },
        ],
        order: [["name", "ASC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(branches), 3600);
      res.json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }

  static async getAllBranchesFilter(req, res, next) {
    try {
      const { state = null, district = null, location = null, distance = null, lat = null, long = null } = req.query;

      const filters = {
        is_active: true,
      };

      if (state) {
        filters.state = state;
      }

      if (district) {
        filters.district = district;
      }

      if (location) {
        filters.location = location;
      }

      let branches;

      if (distance && lat && long && parseFloat(distance)) {
        const latFloat = parseFloat(lat);
        const longFloat = parseFloat(long);
        const earthRadiusKm = 6371;

        branches = await Branches.findAll({
          where: {
            ...filters,
            [Op.and]: [
              Sequelize.literal(`
                ${earthRadiusKm} * acos(
                  cos(radians(${latFloat}))
                  * cos(radians("latitude"))
                  * cos(radians("longitude") - radians(${longFloat}))
                  + sin(radians(${latFloat}))
                  * sin(radians("latitude"))
                ) <= ${parseFloat(distance)}
              `),
            ],
          },
          order: [["name", "ASC"]],
        });
      } else {
        branches = await Branches.findAll({
          where: filters,
          order: [["name", "ASC"]],
        });
      }

      res.json({ success: true, data: branches });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `branch_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const branch = await Branches.findByPk(id);
      if (!branch) {
        throw new CustomError("Branch not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(branch), 3600);
      res.json({ success: true, data: branch });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const branch = await Branches.findByPk(id);
      if (!branch) {
        throw new CustomError("Branch not found", 404);
      }

      const updateData = { ...req.body };
      await branch.update(updateData);
      await CacheService.invalidate("Branches");
      await CacheService.invalidate(`branch_${id}`);
      res.json({ success: true, data: branch, message: "Branch updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const branch = await Branches.findByPk(id);
      if (!branch) {
        throw new CustomError("Branch not found", 404);
      }

      await branch.destroy();
      await CacheService.invalidate("Branches");
      await CacheService.invalidate(`branch_${id}`);
      res.json({ success: true, message: "Branch deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BranchesController;
