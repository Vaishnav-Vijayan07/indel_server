const { models } = require("../../models/index");
const cacheService = require("../../services/cacheService");
const logger = require("../../services/logger");

const CareerMeta = models.CareerMeta;

class CareerMetaController {
  // Create a new meta
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };
      const { type } = updateData;
      const cacheKey = `careerMeta${type}`;

      const existingData = await CareerMeta.findOne({ where: { type: updateData.type } });

      let meta;
      let message;

      if (existingData) {
        await existingData.update(updateData);
        meta = existingData;
        message = "Meta updated";
      } else {
        meta = await CareerMeta.create(updateData);
        message = "Meta created";
      }

      await cacheService.invalidate(cacheKey);
      await cacheService.invalidate(`metaData:${type}`);

      res.status(201).json({ success: true, data: meta, message });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const policies = await CareerMeta.findAll({});
      res.json({ success: true, data: policies });
    } catch (error) {
      next(error);
    }
  }

  // // Update a meta
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const meta = await CareerMeta.findByPk(id);

      if (!meta) {
        return res.json({ success: false, message: "Meta not updated" });
      }

      let updateData = req.body;
      updateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== null));
      const type = updateData.type;
      const cacheKey = `careerMeta${type}`;

      await meta.update(updateData);

      await cacheService.invalidate(cacheKey);
      await cacheService.invalidate(`metaData:${type}`);

      res.json({ success: true, data: meta, message: "Meta updated" });
    } catch (error) {
      next(error);
    }
  }

  // // Delete a meta
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const meta = await CareerMeta.findByPk(id);

      if (!meta) {
        res.json({ success: false, message: "Meta not updated" });
      }

      const type = meta.type;
      const cacheKey = `careerMeta${type}`;

      await meta.destroy();

      await cacheService.invalidate(cacheKey);

      res.json({ success: true, message: "Meta deleted", data: id });
    } catch (error) {
      next(error);
    }
  }

  // Find a meta by its type
  static async findByType(req, res, next) {
    try {
      const { type } = req.query;
      const cacheKey = `careerMeta${type}`;

      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        logger.info(`Serving ${type} meta from cache`);
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }
      const meta = await CareerMeta.findOne({ where: { type } });

      if (!meta) {
        return res.status(200).json({ success: true, data: [] });
      }

      res.json({ success: true, data: meta });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CareerMetaController;
