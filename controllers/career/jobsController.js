const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Jobs = models.CareerJobs;

class JobsController {
  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      const { role_id, location_id, state_id } = updateData;

      // Validate foreign key references with enhanced error handling
      const [role, location, state] = await Promise.all([
        models.CareerRoles.findByPk(role_id),
        models.CareerLocations.findByPk(location_id),
        models.CareerStates.findByPk(state_id),
      ]);

      if (!role) throw new CustomError("Role not found", 404);
      if (!location) throw new CustomError("Location not found", 404);
      if (!state) throw new CustomError("State not found", 404);

      // Ensure is_active and end_date are handled correctly
      if (updateData.is_active === undefined) {
        updateData.is_active = true;
      }
      if (updateData.end_date) {
        updateData.end_date = new Date(updateData.end_date);
        if (isNaN(updateData.end_date.getTime())) {
          throw new CustomError("Invalid end_date format", 400);
        }
      }

      const job = await Jobs.create(updateData);

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

  static async getAll(req, res, next) {
    try {
      const cacheKey = "jobs";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const jobs = await Jobs.findAll({
        where: { is_active: true }, // Only fetch active jobs
        include: [
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
          { model: models.CareerStates, as: "state", attributes: ["state_name"] },
        ],
        order: [
          ["order", "ASC"],
          ["id", "ASC"],
        ], // Prioritize custom order
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
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
          { model: models.CareerStates, as: "state", attributes: ["state_name"] },
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

      // Validate foreign keys if provided in the update
      if (updateData.role_id) {
        const role = await models.CareerRoles.findByPk(updateData.role_id);
        if (!role) throw new CustomError("Role not found", 404);
      }
      if (updateData.location_id) {
        const location = await models.CareerLocations.findByPk(updateData.location_id);
        if (!location) throw new CustomError("Location not found", 404);
      }
      if (updateData.state_id) {
        const state = await models.CareerStates.findByPk(updateData.state_id);
        if (!state) throw new CustomError("State not found", 404);
      }

      // Validate end_date if provided
      if (updateData.end_date) {
        updateData.end_date = new Date(updateData.end_date);
        if (isNaN(updateData.end_date.getTime())) {
          throw new CustomError("Invalid end_date format", 400);
        }
      }

      await job.update(updateData);

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

      await job.destroy();

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
}

// class JobsController {
//   static async create(req, res, next) {
//     try {
//       const updateData = { ...req.body };

//       const { role_id, location_id, state_id } = updateData;

//       const role = await models.CareerRoles.findByPk(role_id);
//       if (!role) {
//         throw new CustomError("Role not found", 404);
//       }

//       const location = await models.CareerLocations.findByPk(location_id);
//       if (!location) {
//         throw new CustomError("Location not found", 404);
//       }

//       const state = await models.CareerStates.findByPk(state_id);
//       if (!state) {
//         throw new CustomError("State not found", 404);
//       }

//       const job = await Jobs.create(updateData);

//       await CacheService.invalidate("jobs");
//       await CacheService.invalidate("webCareerPage");
//       res.status(201).json({ success: true, data: job, message: "Job created" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getDropdowns(req, res, next) {
//     try {
//       const [roles, locations, states] = await Promise.all([
//         models.CareerRoles.findAll({
//           where: {
//             is_active: true,
//           },
//           attributes: [
//             ["id", "value"],
//             ["role_name", "label"],
//           ],
//         }),
//         models.CareerLocations.findAll({
//           where: {
//             is_active: true,
//           },
//           attributes: [
//             ["id", "value"],
//             ["location_name", "label"],
//           ],
//         }),
//         models.CareerStates.findAll({
//           where: {
//             is_active: true,
//           },
//           attributes: [
//             ["id", "value"],
//             ["state_name", "label"],
//           ],
//         }),
//       ]);

//       res.json({
//         success: true,
//         data: {
//           roles,
//           locations,
//           states,
//         },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAll(req, res, next) {
//     try {
//       const cacheKey = "jobs";
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const jobs = await Jobs.findAll({
//         include: [
//           { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
//           { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
//           { model: models.CareerStates, as: "state", attributes: ["state_name"] },
//         ],
//         order: [["id", "ASC"]],
//       });

//       await CacheService.set(cacheKey, JSON.stringify(jobs), 3600);
//       res.json({ success: true, data: jobs });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getById(req, res, next) {
//     try {
//       const { id } = req.params;
//       const cacheKey = `job_${id}`;
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const job = await Jobs.findByPk(id, {
//         include: [
//           { model: models.CareerRoles, as: "role" },
//           { model: models.CareerLocations, as: "location" },
//           { model: models.CareerStates, as: "state" },
//         ],
//       });
//       if (!job) {
//         throw new CustomError("Job not found", 404);
//       }

//       await CacheService.set(cacheKey, JSON.stringify(job), 3600);
//       res.json({ success: true, data: job });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async update(req, res, next) {
//     try {
//       const { id } = req.params;
//       const job = await Jobs.findByPk(id);
//       if (!job) {
//         throw new CustomError("Job not found", 404);
//       }

//       const updateData = { ...req.body };

//       await job.update(updateData);

//       await CacheService.invalidate("jobs");
//       await CacheService.invalidate("webCareerPage");
//       await CacheService.invalidate(`job_${id}`);
//       res.json({ success: true, data: job, message: "Job updated" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async delete(req, res, next) {
//     try {
//       const { id } = req.params;
//       const job = await Jobs.findByPk(id);
//       if (!job) {
//         throw new CustomError("Job not found", 404);
//       }

//       await job.destroy();

//       await CacheService.invalidate("jobs");
//       await CacheService.invalidate("webCareerPage");
//       await CacheService.invalidate(`job_${id}`);
//       res.json({ success: true, message: "Job deleted", data: id });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

module.exports = JobsController;
