const { Sequelize, Op } = require("sequelize");
const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const states = require("../../models/career/states");
const { importBranchesFromXlsx } = require("../branchImport");
const ExcelJS = require("exceljs");

const Branches = models.Branches;

class BranchesController {
  static async create(req, res, next) {
    try {
      const data = { ...req.body };
      const branch = await Branches.create(data);
      await CacheService.invalidate("Branches");
      await CacheService.invalidate("Branches_active");
      await CacheService.invalidatePattern("Branches_page_*");
      res
        .status(201)
        .json({ success: true, data: branch, message: "Branch created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "Branches";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const branches = await Branches.findAll({
          // where: { is_active: true },
          include: [
            {
              model: models.CareerStates,
              as: "states",
              attributes: ["state_name"],
            },
            {
              model: models.Districts,
              as: "districts",
              attributes: ["district_name"],
            },
            {
              model: models.CareerLocations,
              as: "locations",
              attributes: ["location_name"],
            },
          ],
          order: [["name", "ASC"]],
        });
        await CacheService.set(cacheKey, JSON.stringify(branches), 3600);
        return res.json({ success: true, data: branches });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {  };
      if (search && search.trim()) {
        whereConditions.name = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied (arbitrary user input would create unbounded cache keys)
      const cacheKey = search ? null : `Branches_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      }

      const { count, rows } = await Branches.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: models.CareerStates,
            as: "states",
            attributes: ["state_name"],
          },
          {
            model: models.Districts,
            as: "districts",
            attributes: ["district_name"],
          },
          {
            model: models.CareerLocations,
            as: "locations",
            attributes: ["location_name"],
          },
        ],
        order: [["name", "ASC"]],
        limit: limitNum,
        offset,
      });

      const totalPages = Math.ceil(count / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

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
          hasNextPage,
          hasPrevPage,
        },
      };

      // Only cache if no search filter is applied
      if (cacheKey) {
        await CacheService.set(cacheKey, JSON.stringify(response), 3600);
      }
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async getAllBranchesFilter(req, res, next) {
    try {
      const {
        state = null,
        district = null,
        location = null,
        distance = null,
        lat = null,
        long = null,
      } = req.query;

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

  static async getActiveBranches(req, res, next) {
    try {
      const cacheKey = "Branches_active";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const branches = await Branches.findAll({
        where: { is_active: true },
        include: [
          {
            model: models.CareerStates,
            as: "states",
            attributes: ["state_name"],
          },
          {
            model: models.Districts,
            as: "districts",
            attributes: ["district_name"],
          },
          {
            model: models.CareerLocations,
            as: "locations",
            attributes: ["location_name"],
          },
        ],
        order: [["name", "ASC"]],
      });
      await CacheService.set(cacheKey, JSON.stringify(branches), 3600);
      return res.json({ success: true, data: branches });
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
      await CacheService.invalidate("Branches_active");
      await CacheService.invalidate(`branch_${id}`);
      await CacheService.invalidatePattern("Branches_page_*");
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
      await CacheService.invalidate("Branches_active");
      await CacheService.invalidate(`branch_${id}`);
      await CacheService.invalidatePattern("Branches_page_*");
      res.json({ success: true, message: "Branch deleted", data: id });
    } catch (error) {
      next(error);
    }
  }

  static async importBranch(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const result = await importBranchesFromXlsx(req.file.path);
      await CacheService.invalidate("Branches");
      await CacheService.invalidate("Branches_active");
      await CacheService.invalidatePattern("Branches_page_*");
      res.json({
        message: "Branches imported successfully",
        count: result.count,
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportAllBranches(req, res, next) {
    try {
      const branches = await Branches.findAll({
        include: [
          {
            model: models.CareerStates,
            as: "states",
            attributes: ["state_name"],
          },
          {
            model: models.Districts,
            as: "districts",
            attributes: ["district_name"],
          },
          {
            model: models.CareerLocations,
            as: "locations",
            attributes: ["location_name"],
          },
        ],
        order: [["name", "ASC"]],
        
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Branches");

      worksheet.columns = [
        { header: "Sl.No", key: "slNo", width: 8 },
        { header: "Name", key: "name", width: 25 },
        { header: "State", key: "state", width: 20 },
        { header: "District", key: "district", width: 20 },
        { header: "Location", key: "location", width: 20 },
        { header: "Phone No", key: "phoneNo", width: 15 },
        { header: "Mobile No", key: "mobileNo", width: 15 },
        { header: "Email", key: "email", width: 25 },
        { header: "Address", key: "address", width: 40 },
        { header: "Status", key: "status", width: 12 },
      ];

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      branches.forEach((branch, index) => {
        const plain = branch.toJSON();
        worksheet.addRow({
          slNo: index + 1,
          name: plain.name || "N/A",
          state: plain.states?.state_name || "N/A",
          district: plain.districts?.district_name || "N/A",
          location: plain.locations?.location_name || "N/A",
          phoneNo: plain.phone_no || "N/A",
          mobileNo: plain.mobile_no || "N/A",
          email: plain.email || "N/A",
          address:
            [plain.address_1, plain.address_2, plain.address_3]
              .filter(Boolean)
              .join(", ") || "N/A",
          status: plain.is_active ? "Active" : "Inactive",
        });
      });

      const filename = `branches_${new Date().toISOString().split("T")[0]}.xlsx`;
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BranchesController;
