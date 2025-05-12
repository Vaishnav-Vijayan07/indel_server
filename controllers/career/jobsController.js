const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Jobs = models.CareerJobs;

class JobsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { role_id, location_id, state_id } = updateData;

      const role = await models.CareerRoles.findByPk(role_id);
      if (!role) {
        throw new CustomError("Role not found", 404);
      }

      const location = await models.CareerLocations.findByPk(location_id);
      if (!location) {
        throw new CustomError("Location not found", 404);
      }

      const state = await models.CareerStates.findByPk(state_id);
      if (!state) {
        throw new CustomError("State not found", 404);
      }

      const job = await Jobs.create(updateData);

      await CacheService.invalidate("jobs");
      res.status(201).json({ success: true, data: job, message: "Job created" });
    } catch (error) {
      next(error);
    }
  }

  static async getDropdowns(req, res, next) {
    try {
      const [roles, locations, states] = await Promise.all([
        models.CareerRoles.findAll({
          where: {
            is_active: true,
          },
          attributes: [
            ["id", "value"],
            ["role_name", "label"],
          ],
        }),
        models.CareerLocations.findAll({
          where: {
            is_active: true,
          },
          attributes: [
            ["id", "value"],
            ["location_name", "label"],
          ],
        }),
        models.CareerStates.findAll({
          where: {
            is_active: true,
          },
          attributes: [
            ["id", "value"],
            ["state_name", "label"],
          ],
        }),
      ]);

      res.json({
        success: true,
        data: {
          roles,
          locations,
          states,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "jobs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const jobs = await Jobs.findAll({
        include: [
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
          { model: models.CareerStates, as: "state", attributes: ["state_name"] },
        ],
        order: [["id", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(jobs), 3600);
      res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const cacheKey = `job_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const job = await Jobs.findByPk(id, {
        include: [
          { model: models.CareerRoles, as: "role" },
          { model: models.CareerLocations, as: "location" },
          { model: models.CareerStates, as: "state" },
        ],
      });
      if (!job) {
        throw new CustomError("Job not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(job), 3600);
      res.json({ success: true, data: job });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const job = await Jobs.findByPk(id);
      if (!job) {
        throw new CustomError("Job not found", 404);
      }

      const updateData = { ...req.body };

      await job.update(updateData);

      await CacheService.invalidate("jobs");
      await CacheService.invalidate(`job_${id}`);
      res.json({ success: true, data: job, message: "Job updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const job = await Jobs.findByPk(id);
      if (!job) {
        throw new CustomError("Job not found", 404);
      }

      await job.destroy();

      await CacheService.invalidate("jobs");
      await CacheService.invalidate(`job_${id}`);
      res.json({ success: true, message: "Job deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobsController;
