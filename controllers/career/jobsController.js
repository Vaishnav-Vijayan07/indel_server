const { literal } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Jobs = models.CareerJobs;

class JobsController {
  static async create(req, res, next) {
    try {
      const { role_id, job_title, job_description, experience, is_active, is_approved, end_date, order, location_ids, state_ids } = req.body;

      // Validate multiple locations and states
      if (!Array.isArray(location_ids) || location_ids.length === 0) {
        throw new CustomError("At least one location is required", 400);
      }
      if (!Array.isArray(state_ids) || state_ids.length === 0) {
        throw new CustomError("At least one state is required", 400);
      }

      // Check if all provided location_ids and state_ids are valid
      const [validLocations, validStates] = await Promise.all([
        models.CareerLocations.findAll({ where: { id: location_ids } }),
        models.CareerStates.findAll({ where: { id: state_ids } }),
      ]);

      if (validLocations.length !== location_ids.length) {
        throw new CustomError("One or more provided location IDs are invalid", 400);
      }
      if (validStates.length !== state_ids.length) {
        throw new CustomError("One or more provided state IDs are invalid", 400);
      }

      // Ensure is_active and end_date are handled correctly
      const jobData = {
        role_id,
        job_title,
        job_description,
        experience,
        is_active: is_active ?? true,
        is_approved: is_approved ?? false,
        end_date: end_date ? new Date(end_date) : null,
        order,
      };

      if (jobData.end_date && isNaN(jobData.end_date.getTime())) {
        throw new CustomError("Invalid end_date format", 400);
      }

      const job = await sequelize.transaction(async (t) => {
        const newJob = await Jobs.create(jobData, { transaction: t });

        // Create associations for locations
        const jobLocations = location_ids.map((locId) => ({
          job_id: newJob.id,
          location_id: locId,
        }));
        await models.JobLocations.bulkCreate(jobLocations, { transaction: t });

        // Create associations for states
        const jobStates = state_ids.map((stateId) => ({
          job_id: newJob.id,
          state_id: stateId,
        }));
        await models.JobStates.bulkCreate(jobStates, { transaction: t });

        return newJob;
      });

      // Invalidate caches after creation
      await Promise.all([CacheService.invalidate("jobs"), CacheService.invalidate("webCareerPage")]);
      res.status(201).json({ success: true, data: job, message: "Job created" });
    } catch (error) {
      next(error);
    }
  }

  static async getDropdowns(req, res, next) {
    try {
      const [roles, locations, states, statuses] = await Promise.all([
        models.CareerRoles.findAll({
          where: { is_active: true },
          attributes: [
            ["id", "value"],
            ["role_name", "label"],
          ],
          order: [["role_name", "ASC"]],
        }),
        models.CareerLocations.findAll({
          where: { is_active: true },
          attributes: [
            ["id", "value"],
            ["location_name", "label"],
          ],
          order: [["location_name", "ASC"]],
        }),
        models.CareerStates.findAll({
          where: { is_active: true },
          attributes: [
            ["id", "value"],
            ["state_name", "label"],
          ],
          order: [["state_name", "ASC"]],
        }),
        models.ApplicationStatus.findAll({
          where: { is_active: true },
          attributes: [
            ["id", "value"],
            ["status_name", "label"],
          ],
          order: [["status_name", "ASC"]],
        }),
      ]);

      res.json({
        success: true,
        data: { roles, locations, states, statuses },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFiltered(req, res, next) {
    try {
      const { state_id, location_id, role_id } = req.query;

      // Build where conditions
      const whereConditions = { is_active: true };
      if (role_id) whereConditions.role_id = parseInt(role_id);

      const includeOptions = [
        { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
        {
          model: models.CareerLocations,
          as: "locations",
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "location_name"],
          required: location_id ? true : false, // Make required if filtering by location
          where: location_id ? { id: parseInt(location_id) } : {},
        },
        {
          model: models.CareerStates,
          as: "states",
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "state_name"],
          required: state_id ? true : false, // Make required if filtering by state
          where: state_id ? { id: parseInt(state_id) } : {},
        },
      ];

      const jobs = await Jobs.findAll({
        where: whereConditions,
        attributes: {
          include: [
            [
              sequelize.literal(`(
          SELECT COUNT(*)
          FROM job_applications AS ja
          WHERE ja.job_id = "Jobs"."id"
        )`),
              "application_count",
            ],
          ],
        },
        include: includeOptions,
        order: [
          ["order", "ASC"],
          ["id", "ASC"],
        ],
      });
      res.json({ success: true, data: jobs });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { state_id, location_id, role_id } = req.query;

      // Build where conditions
      const whereConditions = {};
      if (role_id) whereConditions.role_id = parseInt(role_id);

      const includeOptions = [
        { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
        {
          model: models.CareerLocations,
          as: "locations",
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "location_name"],
          required: location_id ? true : false, // Make required if filtering by location
          where: location_id ? { id: parseInt(location_id) } : {},
        },
        {
          model: models.CareerStates,
          as: "states",
          through: { attributes: [] }, // Exclude join table attributes
          attributes: ["id", "state_name"],
          required: state_id ? true : false, // Make required if filtering by state
          where: state_id ? { id: parseInt(state_id) } : {},
        },
      ];

      const jobs = await Jobs.findAll({
        where: whereConditions,
        attributes: {
          include: [
            [
              sequelize.literal(`(
          SELECT COUNT(*)
          FROM job_applications AS ja
          WHERE ja.job_id = "Jobs"."id"
        )`),
              "application_count",
            ],
          ],
        },
        include: includeOptions,
        order: [
          ["order", "ASC"],
          ["id", "ASC"],
        ],
      });
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
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          {
            model: models.CareerLocations,
            as: "locations",
            through: { attributes: [] },
            attributes: ["id", "location_name"],
          },
          {
            model: models.CareerStates,
            as: "states",
            through: { attributes: [] },
            attributes: ["id", "state_name"],
          },
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

      const { role_id, job_title, job_description, experience, is_active, is_approved, end_date, order, location_ids, state_ids } = req.body;

      // Validate foreign keys if provided in the update
      if (role_id) {
        const role = await models.CareerRoles.findByPk(role_id);
        if (!role) throw new CustomError("Role not found", 404);
      }

      // Validate and update locations
      if (location_ids !== undefined) {
        if (!Array.isArray(location_ids)) {
          throw new CustomError("location_ids must be an array", 400);
        }
        const validLocations = await models.CareerLocations.findAll({ where: { id: location_ids } });
        if (validLocations.length !== location_ids.length) {
          throw new CustomError("One or more provided location IDs are invalid", 400);
        }
      }

      // Validate and update states
      if (state_ids !== undefined) {
        if (!Array.isArray(state_ids)) {
          throw new CustomError("state_ids must be an array", 400);
        }
        const validStates = await models.CareerStates.findAll({ where: { id: state_ids } });
        if (validStates.length !== state_ids.length) {
          throw new CustomError("One or more provided state IDs are invalid", 400);
        }
      }

      // Validate end_date if provided
      const updatedEndDate = end_date ? new Date(end_date) : null;
      if (updatedEndDate && isNaN(updatedEndDate.getTime())) {
        throw new CustomError("Invalid end_date format", 400);
      }

      await sequelize.transaction(async (t) => {
        // Update main job details
        await job.update({
          role_id,
          job_title,
          job_description,
          experience,
          is_active: is_active ?? job.is_active,
          is_approved: is_approved ?? job.is_approved,
          end_date: updatedEndDate,
          order: order ?? job.order,
        }, { transaction: t });

        // Update locations
        if (location_ids !== undefined) {
          await models.JobLocations.destroy({ where: { job_id: job.id }, transaction: t });
          if (location_ids.length > 0) {
            const newJobLocations = location_ids.map((locId) => ({
              job_id: job.id,
              location_id: locId,
            }));
            await models.JobLocations.bulkCreate(newJobLocations, { transaction: t });
          }
        }

        // Update states
        if (state_ids !== undefined) {
          await models.JobStates.destroy({ where: { job_id: job.id }, transaction: t });
          if (state_ids.length > 0) {
            const newJobStates = state_ids.map((stateId) => ({
              job_id: job.id,
              state_id: stateId,
            }));
            await models.JobStates.bulkCreate(newJobStates, { transaction: t });
          }
        }
      });

      // Invalidate caches after update
      await Promise.all([
        CacheService.invalidate("jobs"),
        CacheService.invalidate("webCareerPage"),
        CacheService.invalidate(`job_${id}`),
      ]);
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

      await sequelize.transaction(async (t) => {
        // Delete associations first
        await models.JobLocations.destroy({ where: { job_id: job.id }, transaction: t });
        await models.JobStates.destroy({ where: { job_id: job.id }, transaction: t });
        // Then delete the job
        await job.destroy({ transaction: t });
      });

      // Invalidate caches after deletion
      await Promise.all([
        CacheService.invalidate("jobs"),
        CacheService.invalidate("webCareerPage"),
        CacheService.invalidate(`job_${id}`),
      ]);
      res.json({ success: true, message: "Job deleted", data: id });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrder(req, res, next) {
    try {
      // Expect: req.body.jobs = [{ id: 1, order: 1 }, ...]
      const { jobs } = req.body;
      if (!Array.isArray(jobs) || jobs.length === 0) {
        throw new CustomError("No job order data provided", 400);
      }

      // Validate all jobs exist
      const jobIds = jobs.map((j) => j.id);
      const foundJobs = await Jobs.findAll({ where: { id: jobIds } });
      if (foundJobs.length !== jobs.length) {
        throw new CustomError("Some jobs not found", 404);
      }

      // Update order in a transaction
      await Jobs.sequelize.transaction(async (t) => {
        for (const { id, order } of jobs) {
          await Jobs.update({ order }, { where: { id }, transaction: t });
        }
      });

      // Invalidate cache
      await Promise.all([CacheService.invalidate("jobs"), CacheService.invalidate("webCareerPage")]);

      res.json({ success: true, message: "Order updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = JobsController;