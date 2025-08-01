const { literal, Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Jobs = models.CareerJobs;

class JobsController {
  static async create(req, res, next) {
    try {
      const { role_id, job_title, job_description, experience, is_active, is_approved, end_date, order, reapply_period_months, location_ids, state_ids } = req.body;

      // Validate existence of locations and states
      if (!Array.isArray(location_ids) || location_ids.length === 0) {
        throw new CustomError("At least one location is required", 400);
      }
      if (!Array.isArray(state_ids) || state_ids.length === 0) {
        throw new CustomError("At least one state is required", 400);
      }

      const existingLocations = await models.CareerLocations.findAll({ where: { id: location_ids } });
      if (existingLocations.length !== location_ids.length) {
        throw new CustomError("One or more locations not found", 404);
      }

      const existingStates = await models.CareerStates.findAll({ where: { id: state_ids } });
      if (existingStates.length !== state_ids.length) {
        throw new CustomError("One or more states not found", 404);
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
        reapply_period_months,
      };

      if (jobData.end_date && isNaN(jobData.end_date.getTime())) {
        throw new CustomError("Invalid end_date format", 400);
      }

      const job = await Jobs.create(jobData);

      // Add associations
      await job.addLocations(location_ids);
      await job.addStates(state_ids);

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
          where: { is_active: true},
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Build where conditions for the Job model
      const jobWhereConditions = {
        is_active: true,
        is_approved: true,
        end_date: {
          [Op.gte]: today,
        },
      };

      // Build include options for associations
      const includeOptions = [
        { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
        {
          model: models.CareerLocations,
          as: "locations",
          attributes: ["location_name"],
          through: { attributes: [] }, // Exclude join table attributes
          required: location_id ? true : false, // Make required if filtering by location
          where: location_id ? { id: parseInt(location_id) } : {},
        },
        {
          model: models.CareerStates,
          as: "states",
          attributes: ["state_name"],
          through: { attributes: [] }, // Exclude join table attributes
          required: state_id ? true : false, // Make required if filtering by state
          where: state_id ? { id: parseInt(state_id) } : {},
        },
      ];

      if (role_id) {
        jobWhereConditions.role_id = parseInt(role_id);
      }

      const jobs = await Jobs.findAll({
        where: jobWhereConditions,
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

      // Build where conditions for the Job model
      const jobWhereConditions = {};

      // Build include options for associations
      const includeOptions = [
        { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
        {
          model: models.CareerLocations,
          as: "locations",
          attributes: ["location_name"],
          through: { attributes: [] }, // Exclude join table attributes
          required: location_id ? true : false, // Make required if filtering by location
          where: location_id ? { id: parseInt(location_id) } : {},
        },
        {
          model: models.CareerStates,
          as: "states",
          attributes: ["state_name"],
          through: { attributes: [] }, // Exclude join table attributes
          required: state_id ? true : false, // Make required if filtering by state
          where: state_id ? { id: parseInt(state_id) } : {},
        },
      ];

      if (role_id) {
        jobWhereConditions.role_id = parseInt(role_id);
      }

      const jobs = await Jobs.findAll({
        where: jobWhereConditions,
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
            attributes: ["id", "location_name"],
            through: { attributes: [] },
          },
          {
            model: models.CareerStates,
            as: "states",
            attributes: ["id", "state_name"],
            through: { attributes: [] },
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

      const { role_id, job_title, job_description, experience, is_active, is_approved, end_date, order, reapply_period_months, location_ids, state_ids } = req.body;

      // Validate existence of locations and states if provided
      if (location_ids) {
        if (!Array.isArray(location_ids) || location_ids.length === 0) {
          throw new CustomError("At least one location is required", 400);
        }
        const existingLocations = await models.CareerLocations.findAll({ where: { id: location_ids } });
        if (existingLocations.length !== location_ids.length) {
          throw new CustomError("One or more locations not found", 404);
        }
      }
      if (state_ids) {
        if (!Array.isArray(state_ids) || state_ids.length === 0) {
          throw new CustomError("At least one state is required", 400);
        }
        const existingStates = await models.CareerStates.findAll({ where: { id: state_ids } });
        if (existingStates.length !== state_ids.length) {
          throw new CustomError("One or more states not found", 404);
        }
      }

      const updateData = {
        role_id,
        job_title,
        job_description,
        experience,
        is_active,
        is_approved,
        end_date: end_date ? new Date(end_date) : null,
        order,
        reapply_period_months,
      };

      if (updateData.end_date && isNaN(updateData.end_date.getTime())) {
        throw new CustomError("Invalid end_date format", 400);
      }

      await job.update(updateData);

      // Update associations if provided
      if (location_ids) {
        await job.setLocations(location_ids);
      }
      if (state_ids) {
        await job.setStates(state_ids);
      }

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


// const { literal,Op } = require("sequelize");
// const { models, sequelize } = require("../../models/index");
// const CacheService = require("../../services/cacheService");
// const CustomError = require("../../utils/customError");

// const Jobs = models.CareerJobs;

// class JobsController {
//   static async create(req, res, next) {
//     try {
//       const updateData = { ...req.body };

//       const { role_id, location_id, state_id } = updateData;

//       // Validate foreign key references with enhanced error handling
//       const [role, location, state] = await Promise.all([
//         models.CareerRoles.findByPk(role_id),
//         models.CareerLocations.findByPk(location_id),
//         models.CareerStates.findByPk(state_id),
//       ]);

//       // if (!role) throw new CustomError("Role not found", 404);
//       if (!location) throw new CustomError("Location not found", 404);
//       if (!state) throw new CustomError("State not found", 404);

//       // Ensure is_active and end_date are handled correctly
//       if (updateData.is_active === undefined) {
//         updateData.is_active = true;
//       }
//       if (updateData.end_date) {
//         updateData.end_date = new Date(updateData.end_date);
//         if (isNaN(updateData.end_date.getTime())) {
//           throw new CustomError("Invalid end_date format", 400);
//         }
//       }

//       const job = await Jobs.create(updateData);

//       // Invalidate caches after creation
//       await Promise.all([CacheService.invalidate("jobs"), CacheService.invalidate("webCareerPage")]);
//       res.status(201).json({ success: true, data: job, message: "Job created" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getDropdowns(req, res, next) {
//     try {
//       const [roles, locations, states, statuses] = await Promise.all([
//         models.CareerRoles.findAll({
//           where: { is_active: true },
//           attributes: [
//             ["id", "value"],
//             ["role_name", "label"],
//           ],
//           order: [["role_name", "ASC"]],
//         }),
//         models.CareerLocations.findAll({
//           where: { is_active: true },
//           attributes: [
//             ["id", "value"],
//             ["location_name", "label"],
//           ],
//           order: [["location_name", "ASC"]],
//         }),
//         models.CareerStates.findAll({
//           where: { is_active: true},
//           attributes: [
//             ["id", "value"],
//             ["state_name", "label"],
//           ],
//           order: [["state_name", "ASC"]],
//         }),
//         models.ApplicationStatus.findAll({
//           where: { is_active: true },
//           attributes: [
//             ["id", "value"],
//             ["status_name", "label"],
//           ],
//           order: [["status_name", "ASC"]],
//         }),
//       ]);

//       res.json({
//         success: true,
//         data: { roles, locations, states, statuses },
//       });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAllFiltered(req, res, next) {
//     try {
//       const { state_id, location_id, role_id } = req.query;
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       // Build where conditions
//       const whereConditions = { 
//         is_active: true,
//         is_approved: true,
//         end_date: {
//         [Op.gte]: today,
//       },

//        };
//       if (role_id) whereConditions.role_id = parseInt(role_id);
//       if (location_id) whereConditions.location_id = parseInt(location_id);
//       if (state_id) whereConditions.state_id = parseInt(state_id);

//       const jobs = await Jobs.findAll({
//         where: whereConditions,
//         attributes: {
//           include: [
//             [
//               sequelize.literal(`(
//           SELECT COUNT(*)
//           FROM job_applications AS ja
//           WHERE ja.job_id = "Jobs"."id"
//         )`),
//               "application_count",
//             ],
//           ],
//         },

//         include: [
//           { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
//           { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
//           { model: models.CareerStates, as: "state", attributes: ["state_name"] },
//         ],
//         order: [
//           ["order", "ASC"],
//           ["id", "ASC"],
//         ],
//       });
//       res.json({ success: true, data: jobs });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAll(req, res, next) {
//     try {
//       const { state_id, location_id, role_id } = req.query;

//       // Build where conditions
//       const whereConditions = {};
//       if (role_id) whereConditions.role_id = parseInt(role_id);
//       if (location_id) whereConditions.location_id = parseInt(location_id);
//       if (state_id) whereConditions.state_id = parseInt(state_id);

//       const jobs = await Jobs.findAll({
//         where: whereConditions,
//         attributes: {
//           include: [
//             [
//               sequelize.literal(`(
//           SELECT COUNT(*)
//           FROM job_applications AS ja
//           WHERE ja.job_id = "Jobs"."id"
//         )`),
//               "application_count",
//             ],
//           ],
//         },

//         include: [
//           { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
//           { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
//           { model: models.CareerStates, as: "state", attributes: ["state_name"] },
//         ],
//         order: [
//           ["order", "ASC"],
//           ["id", "ASC"],
//         ],
//       });
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
//           { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
//           { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
//           { model: models.CareerStates, as: "state", attributes: ["state_name"] },
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

//       // Validate foreign keys if provided in the update
//       if (updateData.role_id) {
//         const role = await models.CareerRoles.findByPk(updateData.role_id);
//         if (!role) throw new CustomError("Role not found", 404);
//       }
//       if (updateData.location_id) {
//         const location = await models.CareerLocations.findByPk(updateData.location_id);
//         if (!location) throw new CustomError("Location not found", 404);
//       }
//       if (updateData.state_id) {
//         const state = await models.CareerStates.findByPk(updateData.state_id);
//         if (!state) throw new CustomError("State not found", 404);
//       }

//       // Validate end_date if provided
//       if (updateData.end_date) {
//         updateData.end_date = new Date(updateData.end_date);
//         if (isNaN(updateData.end_date.getTime())) {
//           throw new CustomError("Invalid end_date format", 400);
//         }
//       }

//       await job.update(updateData);

//       // Invalidate caches after update
//       await Promise.all([
//         CacheService.invalidate("jobs"),
//         CacheService.invalidate("webCareerPage"),
//         CacheService.invalidate(`job_${id}`),
//       ]);
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

//       // Invalidate caches after deletion
//       await Promise.all([
//         CacheService.invalidate("jobs"),
//         CacheService.invalidate("webCareerPage"),
//         CacheService.invalidate(`job_${id}`),
//       ]);
//       res.json({ success: true, message: "Job deleted", data: id });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async updateOrder(req, res, next) {
//     try {
//       // Expect: req.body.jobs = [{ id: 1, order: 1 }, ...]
//       const { jobs } = req.body;
//       if (!Array.isArray(jobs) || jobs.length === 0) {
//         throw new CustomError("No job order data provided", 400);
//       }

//       // Validate all jobs exist
//       const jobIds = jobs.map((j) => j.id);
//       const foundJobs = await Jobs.findAll({ where: { id: jobIds } });
//       if (foundJobs.length !== jobs.length) {
//         throw new CustomError("Some jobs not found", 404);
//       }

//       // Update order in a transaction
//       await Jobs.sequelize.transaction(async (t) => {
//         for (const { id, order } of jobs) {
//           await Jobs.update({ order }, { where: { id }, transaction: t });
//         }
//       });

//       // Invalidate cache
//       await Promise.all([CacheService.invalidate("jobs"), CacheService.invalidate("webCareerPage")]);

//       res.json({ success: true, message: "Order updated successfully" });
//     } catch (error) {
//       next(error);
//     }
//   }


// }

// module.exports = JobsController;