const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Locations = models.CareerLocations;

class LocationsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const location = await Locations.create(updateData);

      await CacheService.invalidate("locations");
      res.status(201).json({ success: true, data: location, message: "Location created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "locations";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const locations = await Locations.findAll({
        order: [["order", "ASC"]],
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
      await CacheService.invalidate(`location_${id}`);
      res.json({ success: true, message: "Location deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationsController;
