const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const { fn, col, where } = require("sequelize");

const Locations = models.CareerLocations;
const Districts = models.Districts;
const States = models.CareerStates;

class LocationsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      // Check if location already exists (case-insensitive)
      const existLocation = await Locations.findOne({
        where: where(fn("LOWER", col("location_name")), updateData.location_name.toLowerCase()),
      });

      if (existLocation) {
        throw new CustomError(`${existLocation?.location_name} is already exists`, 400);
      }

      const location = await Locations.create(updateData);

      await CacheService.invalidate("locations");
      await CacheService.invalidate("webCareerPage");
      res.status(201).json({ success: true, data: location, message: "Location created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "locations";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const locations = await Locations.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(locations), 3600);
      res.json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async getAllLocationByState(req, res) {
    try {
      const { state_ids } = req.query;

      if (!state_ids) {
        return res.status(400).json({
          success: false,
          message: "state_ids query parameter is required",
        });
      }

      // Parse state IDs from comma-separated string
      const stateIdsArray = state_ids
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));

      if (stateIdsArray.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Valid state_ids are required",
        });
      }

      // Fetch locations that belong to districts within the specified states
      const locations = await Locations.findAll({
        where: {
          is_active: true,
        },
        include: [
          {
            model: Districts,
            as: "district", // You'll need to add this association to your Locations model
            where: {
              state_id: stateIdsArray,
              is_active: true,
            },
            required: true,
            include: [
              {
                model: States,
                as: "state",
                attributes: ["id", "state_name"],
              },
            ],
          },
        ],
        order: [
          ["order", "ASC"],
          ["location_name", "ASC"],
        ],
      });

      res.json({
        success: true,
        data: locations,
      });
    } catch (error) {
      console.error("Error fetching locations by states:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  static async getAllByStateDistrict(req, res, next) {
    try {
      const { district_id } = req.query;

      const cacheKey = "locations";
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const locations = await Locations.findAll({
        where: {
          // state_id: state_id,
          district_id: district_id,
        },
        order: [["location_name", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(locations), 3600);
      res.json({ success: true, data: locations });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `location_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const location = await Locations.findByPk(id);
      if (!location) {
        throw new CustomError("Location not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(location), 3600);
      res.json({ success: true, data: location });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const location = await Locations.findByPk(id);
      if (!location) {
        throw new CustomError("Location not found", 404);
      }

      const updateData = { ...req.body };

      await location.update(updateData);

      await CacheService.invalidate("locations");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`location_${id}`);
      res.json({ success: true, data: location, message: "Location updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const location = await Locations.findByPk(id);
      if (!location) {
        throw new CustomError("Location not found", 404);
      }

      await location.destroy();

      await CacheService.invalidate("locations");
      await CacheService.invalidate("webCareerPage");
      await CacheService.invalidate(`location_${id}`);
      res.json({ success: true, message: "Location deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationsController;
