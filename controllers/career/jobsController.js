const { literal, Op } = require("sequelize");
const { models, sequelize } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");

const Jobs = models.CareerJobs;

class JobsController {
  static async create(req, res, next) {
    try {
      const {
        role_id,
        job_title,
        job_description,
        experience,
        is_active,
        is_approved,
        end_date,
        order,
        reapply_period_months,
        location_ids,
        state_ids,
        is_display_full_locations,
      } = req.body;

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
        is_display_full_locations,
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
    // Helper function to capitalize first letter of each word
    const capitalizeWords = (str) => {
      if (!str) return str;
      return str
        .toLowerCase()
        .split(/(\s+|-)/)
        .map((word, index, arr) => {
          if (word.match(/^\s+|-/)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join("");
    };

    try {
      const { state_id, location_id, role_id, page = 1, limit = 10 } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Pagination setup
      const pageNumber = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * pageSize;

      // Build where conditions for the Job model
      const jobWhereConditions = {
        is_active: true,
        is_approved: true,
        end_date: {
          [Op.gte]: today,
        },
      };

      if (role_id) {
        jobWhereConditions.role_id = parseInt(role_id);
      }

      // Build include options - simplified to avoid complex filtering
      const includeOptions = [
        {
          model: models.CareerRoles,
          as: "role",
          attributes: ["role_name"],
        },
        {
          model: models.CareerLocations,
          as: "locations",
          attributes: ["location_name"],
          through: { attributes: [] },
          include: [
            {
              model: models.Districts,
              as: "district",
              attributes: ["state_id"],
              where: { is_active: true },
              include: [
                {
                  model: models.CareerStates,
                  as: "state",
                  attributes: ["id", "state_name"],
                },
              ],
            },
          ],
        },
        {
          model: models.CareerStates,
          as: "states",
          attributes: ["id", "state_name"],
          through: { attributes: [] },
        },
      ];

      // Handle filtering by adding WHERE conditions to the main query
      let additionalWhereConditions = {};

      // Filter by location if provided
      if (location_id) {
        additionalWhereConditions = {
          ...additionalWhereConditions,
          [Op.and]: [
            ...(additionalWhereConditions[Op.and] || []),
            sequelize.literal(`EXISTS (
            SELECT 1 FROM job_locations jl 
            WHERE jl.job_id = "Jobs"."id" 
            AND jl.location_id = ${parseInt(location_id)}
          )`),
          ],
        };
      }

      // Filter by state if provided
      if (state_id) {
        additionalWhereConditions = {
          ...additionalWhereConditions,
          [Op.and]: [
            ...(additionalWhereConditions[Op.and] || []),
            sequelize.literal(`EXISTS (
            SELECT 1 FROM job_states js 
            WHERE js.job_id = "Jobs"."id" 
            AND js.state_id = ${parseInt(state_id)}
          )`),
          ],
        };
      }

      // Combine where conditions
      const finalWhereConditions = {
        ...jobWhereConditions,
        ...additionalWhereConditions,
      };

      const jobs = await Jobs.findAll({
        where: finalWhereConditions,
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
        limit: pageSize,
        offset: offset,
      });

      // Get total count for pagination info - simplified count query
      let countWhereConditions = { ...jobWhereConditions };

      if (location_id) {
        countWhereConditions = {
          ...countWhereConditions,
          [Op.and]: [
            ...(countWhereConditions[Op.and] || []),
            sequelize.literal(`EXISTS (
            SELECT 1 FROM job_locations jl 
            WHERE jl.job_id = "Jobs"."id" 
            AND jl.location_id = ${parseInt(location_id)}
          )`),
          ],
        };
      }

      if (state_id) {
        countWhereConditions = {
          ...countWhereConditions,
          [Op.and]: [
            ...(countWhereConditions[Op.and] || []),
            sequelize.literal(`EXISTS (
            SELECT 1 FROM job_states js 
            WHERE js.job_id = "Jobs"."id" 
            AND js.state_id = ${parseInt(state_id)}
          )`),
          ],
        };
      }

      const totalCount = await Jobs.count({
        where: countWhereConditions,
      });

      // Process jobs to format locations for multiple states (same logic as CareerPage)
      const formattedJobs = jobs.map((job) => {
        let locationDisplay = "";

        if (job.states && job.states.length > 0) {
          // Map locations to their respective states
          const stateLocationMap = job.states.map((state) => {
            // Filter locations for this state via district.state_id
            const stateLocations = job.locations
              .filter((loc) => loc.district && loc.district.state_id === state.id)
              .map((loc) => capitalizeWords(loc.location_name))
              .filter(Boolean);

            if (job.is_display_full_locations) {
              // Format: "Kerala: Calicut, Balussery and Chandra Nagar" or with ", etc."
              if (stateLocations.length > 0) {
                const lastLocation = stateLocations.pop();
                const locationString =
                  stateLocations.length > 0 ? `${stateLocations.join(", ")} and ${lastLocation}` : lastLocation;
                return `${capitalizeWords(state.state_name)}: ${locationString}${stateLocations.length + 1 > 3 ? ", etc." : ""}`;
              }
              return `${capitalizeWords(state.state_name)}: No Specific Locations`;
            } else {
              // Show "Multiple Locations" or "No Specific Locations"
              return stateLocations.length > 0
                ? `${capitalizeWords(state.state_name)}: Multiple Locations`
                : `${capitalizeWords(state.state_name)}: No Specific Locations`;
            }
          });

          // Join state-location strings with semicolons
          locationDisplay = stateLocationMap.join("; ");
        } else {
          // Fallback if no states are associated
          if (job.is_display_full_locations && job.locations.length > 0) {
            const locations = job.locations.map((loc) => capitalizeWords(loc.location_name)).filter(Boolean);
            const lastLocation = locations.pop();
            const locationString = locations.length > 0 ? `${locations.join(", ")} and ${lastLocation}` : lastLocation;
            locationDisplay = `Unknown State: ${locationString}${locations.length + 1 > 3 ? ", etc." : ""}`;
          } else {
            locationDisplay = `Unknown State: ${job.locations.length > 0 ? "Multiple Locations" : "No Specific Locations"}`;
          }
        }

        return {
          ...job.toJSON(), // Convert Sequelize instance to plain object
          locationDisplay, // Add formatted location string
        };
      });

      res.json({
        success: true,
        data: formattedJobs,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
          itemsPerPage: pageSize,
          hasNextPage: pageNumber < Math.ceil(totalCount / pageSize),
          hasPrevPage: pageNumber > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { state_id, location_id, role_id, page = 1, limit = 10 } = req.query;

      // Parse page and limit to integers
      const pageNum = Math.max(1, parseInt(page, 10)); // Ensure at least page 1
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Limit between 1 and 100
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for the Job model
      const jobWhereConditions = {};

      // Build include options for associations
      const includeOptions = [
        { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
        {
          model: models.CareerLocations,
          as: "locations",
          attributes: ["id", "location_name", "district_id"],
          through: { attributes: [] },
          required: !!location_id,
          where: location_id ? { id: parseInt(location_id) } : {},
        },
        {
          model: models.CareerStates,
          as: "states",
          attributes: ["id", "state_name"],
          through: { attributes: [] },
          required: !!state_id,
          where: state_id ? { id: parseInt(state_id) } : {},
        },
      ];

      if (role_id) {
        jobWhereConditions.role_id = parseInt(role_id);
      }

      // Fetch paginated jobs with total count
      const { rows: jobs, count: totalItems } = await Jobs.findAndCountAll({
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
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(totalItems / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      res.json({
        success: true,
        data: jobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    // Helper function to capitalize first letter of each word
    const capitalizeWords = (str) => {
      if (!str) return str;
      return str
        .toLowerCase()
        .split(/(\s+|-)/)
        .map((word, index, arr) => {
          if (word.match(/^\s+|-/)) return word;
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join("");
    };

    try {
      const { id } = req.params;
      const cacheKey = `job_${id}`;
      const cachedData = await CacheService.get(cacheKey);

      // if (cachedData) {
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const job = await Jobs.findByPk(id, {
        include: [
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          {
            model: models.CareerLocations,
            as: "locations",
            attributes: ["id", "location_name", "district_id"],
            through: { attributes: [] },
            include: [
              {
                model: models.Districts,
                as: "district",
                attributes: ["state_id"],
                include: [
                  {
                    model: models.CareerStates,
                    as: "state",
                    attributes: ["id", "state_name"],
                  },
                ],
              },
            ],
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

      // Process job to format locations similar to getAllFiltered
      let locationDisplay = "";
      if (job.states && job.states.length > 0) {
        // Map locations to their respective states
        const stateLocationMap = job.states.map((state) => {
          // Filter locations for this state via district.state_id
          const stateLocations = job.locations
            .filter((loc) => loc.district && loc.district.state_id === state.id)
            .map((loc) => capitalizeWords(loc.location_name))
            .filter(Boolean);

          if (job.is_display_full_locations) {
            // Format: "Kerala: Calicut, Balussery and Chandra Nagar" or with ", etc."
            if (stateLocations.length > 0) {
              const lastLocation = stateLocations.pop();
              const locationString =
                stateLocations.length > 0 ? `${stateLocations.join(", ")} and ${lastLocation}` : lastLocation;
              return `${capitalizeWords(state.state_name)}: ${locationString}${stateLocations.length + 1 > 3 ? ", etc." : ""}`;
            }
            return `${capitalizeWords(state.state_name)}: No Specific Locations`;
          } else {
            // Show "Multiple Locations" or "No Specific Locations"
            return stateLocations.length > 0
              ? `${capitalizeWords(state.state_name)}: Multiple Locations`
              : `${capitalizeWords(state.state_name)}: No Specific Locations`;
          }
        });

        // Join state-location strings with semicolons
        locationDisplay = stateLocationMap.join("; ");
      } else {
        // Fallback if no states are associated
        if (job.is_display_full_locations && job.locations.length > 0) {
          const locations = job.locations.map((loc) => capitalizeWords(loc.location_name)).filter(Boolean);
          const lastLocation = locations.pop();
          const locationString = locations.length > 0 ? `${locations.join(", ")} and ${lastLocation}` : lastLocation;
          locationDisplay = `Unknown State: ${locationString}${locations.length + 1 > 3 ? ", etc." : ""}`;
        } else {
          locationDisplay = `Unknown State: ${job.locations.length > 0 ? "Multiple Locations" : "No Specific Locations"}`;
        }
      }

      const formattedJob = {
        ...job.toJSON(), // Convert Sequelize instance to plain object
        locationDisplay, // Add formatted location string
      };

      await CacheService.set(cacheKey, JSON.stringify(formattedJob), 3600);
      res.json({ success: true, data: formattedJob });
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

      const {
        role_id,
        job_title,
        job_description,
        experience,
        is_active,
        is_approved,
        end_date,
        order,
        reapply_period_months,
        location_ids,
        state_ids,
        is_display_full_locations,
      } = req.body;

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
        is_display_full_locations,
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
