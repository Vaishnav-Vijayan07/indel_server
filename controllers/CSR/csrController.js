const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("../../utils/slugify"); // Import the slugify utility
const { Sequelize, where } = require("sequelize");

const Csr = models.Csr;

class CsrController {
  // Utility to generate unique slug
  static async generateUniqueSlug(title, excludeId = null) {
    let slug = slugify(title);
    if (!slug) {
      slug = "csr-post"; // Fallback slug if title is empty
    }

    let count = 0;
    let uniqueSlug = slug;

    // Check for existing slugs
    while (
      await Csr.findOne({
        where: { slug: uniqueSlug, id: { [Sequelize.Op.ne]: excludeId } },
      })
    ) {
      count++;
      uniqueSlug = `${slug}-${count}`;
    }

    return uniqueSlug;
  }

  static async deleteFile(filePath) {
    if (!filePath) return;
    try {
      const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
      await fs.unlink(absolutePath);
      Logger.info(`Deleted file: ${filePath}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
      }
    }
  }

  static async create(req, res, next) {
    try {
      const updateData = { ...req.body };

      // Generate slug from title if not provided
      if (!updateData.slug && updateData.title) {
        updateData.slug = await CsrController.generateUniqueSlug(updateData.title);
        Logger.info(`Generated slug for new csr: ${updateData.slug}`);
      }

      if (req.files?.image) {
        updateData.image = `/uploads/csr/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for csr: ${updateData.image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/csr/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for csr: ${updateData.second_image}`);
      }

      const csr = await Csr.create(updateData);

      await CacheService.invalidate("csr");
      res.status(201).json({ success: true, data: csr, message: "csr created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const cacheKey = "csr";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csr = await Csr.findAll({
        order: [["order", "ASC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(csr), 3600);
      res.json({ success: true, data: csr });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { slug } = req.params;
      const cacheKey = `csr_${slug}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const csr = await Csr.findOne({ where: { slug } });
      if (!csr) {
        throw new CustomError("csr not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(csr), 3600);
      res.json({ success: true, data: csr });
    } catch (error) {
      next(error);
    }
  }

  // static async update(req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const csr = await Csr.findByPk(id);
  //     if (!csr) {
  //       throw new CustomError("csr not found", 404);
  //     }

  //     

  //     const updateData = { ...req.body };
  //     let oldImage = csr.image;
  //     let oldSecondImage = csr.second_image;

  //     // Generate slug if title is updated and no slug is provided
  //     if (updateData.title && !updateData.slug) {
  //       updateData.slug = await CsrController.generateUniqueSlug(updateData.title, id);
  //       Logger.info(`Generated slug for updated csr ID ${id}: ${updateData.slug}`);
  //     }

  //     if (req.files?.image) {
  //       updateData.image = `/uploads/csr/${req.files.image[0].filename}`;
  //       Logger.info(`Updated image for csr ID ${id}: ${updateData.image}`);
  //       if (oldImage) {
  //         await CsrController.deleteFile(oldImage);
  //       }
  //     }
  //     if (req.files?.second_image) {
  //       updateData.second_image = `/uploads/csr/${req.files.second_image[0].filename}`;
  //       Logger.info(`Updated second image for csr ID ${id}: ${updateData.second_image}`);
  //       if (oldSecondImage) {
  //         await CsrController.deleteFile(oldSecondImage);
  //       }
  //     }

  //     await csr.update(updateData);

  //     await CacheService.invalidate("csr");
  //     await CacheService.invalidate(`csr_${id}`);
  //     res.json({ success: true, data: csr, message: "csr updated" });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const csr = await Csr.findByPk(id);
      if (!csr) {
        throw new CustomError("csr not found", 404);
      }

      

      let updateData = { ...req.body };
      let oldImage = csr.image;
      let oldSecondImage = csr.second_image;

      // Remove any `null` values from the updateData object
      updateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== null));

      // Generate slug if title is updated and no slug is provided
      if (updateData.title && !updateData.slug) {
        updateData.slug = await CsrController.generateUniqueSlug(updateData.title, id);
        Logger.info(`Generated slug for updated csr ID ${id}: ${updateData.slug}`);
      }

      // Handle image uploads
      if (req.files?.image) {
        updateData.image = `/uploads/csr/${req.files.image[0].filename}`;
        Logger.info(`Updated image for csr ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await CsrController.deleteFile(oldImage);
        }
      }

      if (req.files?.second_image) {
        updateData.second_image = `/uploads/csr/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for csr ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await CsrController.deleteFile(oldSecondImage);
        }
      }

      await csr.update(updateData);

      await CacheService.invalidate("csr");
      await CacheService.invalidate(`csr_${id}`);

      res.json({ success: true, data: csr, message: "csr updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const csr = await Csr.findByPk(id);
      if (!csr) {
        throw new CustomError("csr not found", 404);
      }

      const oldImage = csr.image;
      const oldSecondImage = csr.second_image;
      await csr.destroy();

      if (oldImage) {
        await CsrController.deleteFile(oldImage);
      }
      if (oldSecondImage) {
        await CsrController.deleteFile(oldSecondImage);
      }

      await CacheService.invalidate("csr");
      await CacheService.invalidate(`csr_${id}`);
      res.json({ success: true, message: "csr deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CsrController;

// const { models } = require("../../models/index");
// const CacheService = require("../../services/cacheService");
// const CustomError = require("../../utils/customError");
// const Logger = require("../../services/logger");
// const fs = require("fs").promises;
// const path = require("path");

// const Csr = models.Csr;

// class CsrController {
//   static async generateUniqueSlug(title, excludeId = null) {
//     let slug = slugify(title);
//     if (!slug) {
//       slug = "csr-post"; // Fallback slug if title is empty
//     }

//     let count = 0;
//     let uniqueSlug = slug;

//     // Check for existing slugs
//     while (
//       await Csr.findOne({
//         where: { slug: uniqueSlug, id: { [models.Sequelize.Op.ne]: excludeId } },
//       })
//     ) {
//       count++;
//       uniqueSlug = `${slug}-${count}`;
//     }

//     return uniqueSlug;
//   }
//   static async deleteFile(filePath) {
//     if (!filePath) return;
//     try {
//       const absolutePath = path.join(__dirname, "..", "..", "uploads", filePath.replace("/uploads/", ""));
//       await fs.unlink(absolutePath);
//       Logger.info(`Deleted file: ${filePath}`);
//     } catch (error) {
//       if (error.code !== "ENOENT") {
//         Logger.error(`Failed to delete file ${filePath}: ${error.message}`);
//       }
//     }
//   }

//   static async create(req, res, next) {
//     try {
//       const updateData = { ...req.body };
//       if (req.files?.image) {
//         updateData.image = `/uploads/csr/${req.files.image[0].filename}`;
//         Logger.info(`Uploaded image for csr: ${updateData.image}`);
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/csr/${req.files.second_image[0].filename}`;
//         Logger.info(`Uploaded second image for csr: ${updateData.second_image}`);
//       }

//       const csr = await Csr.create(updateData);

//       await CacheService.invalidate("Csr");
//       res.status(201).json({ success: true, data: csr, message: "csr created" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAll(req, res, next) {
//     try {
//       const cacheKey = "Csr";
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const Csr = await Csr.findAll({
//         order: [["order", "ASC"]],
//       });

//       await CacheService.set(cacheKey, JSON.stringify(Csr), 3600);
//       res.json({ success: true, data: Csr });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getById(req, res, next) {
//     try {
//       const { id } = req.params;
//       const cacheKey = `csr_${id}`;
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const csr = await Csr.findByPk(id);
//       if (!csr) {
//         throw new CustomError("csr not found", 404);
//       }

//       await CacheService.set(cacheKey, JSON.stringify(csr), 3600);
//       res.json({ success: true, data: csr });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async update(req, res, next) {
//     try {
//       const { id } = req.params;
//       const csr = await Csr.findByPk(id);
//       if (!csr) {
//         throw new CustomError("csr not found", 404);
//       }

//       const updateData = { ...req.body };
//       let oldImage = csr.image;
//       let oldSecondImage = csr.second_image;

//       if (req.files?.image) {
//         updateData.image = `/uploads/csr/${req.files.image[0].filename}`;
//         Logger.info(`Updated image for csr ID ${id}: ${updateData.image}`);
//         if (oldImage) {
//           await CsrController.deleteFile(oldImage);
//         }
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/csr/${req.files.second_image[0].filename}`;
//         Logger.info(`Updated second image for csr ID ${id}: ${updateData.second_image}`);
//         if (oldSecondImage) {
//           await CsrsController.deleteFile(oldSecondImage);
//         }
//       }

//       await csr.update(updateData);

//       await CacheService.invalidate("Csr");
//       await CacheService.invalidate(`csr_${id}`);
//       res.json({ success: true, data: csr, message: "csr updated" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async delete(req, res, next) {
//     try {
//       const { id } = req.params;
//       const csr = await Csr.findByPk(id);
//       if (!csr) {
//         throw new CustomError("csr not found", 404);
//       }

//       const oldImage = csr.image;
//       const oldSecondImage = csr.second_image;
//       await csr.destroy();

//       if (oldImage) {
//         await CsrController.deleteFile(oldImage);
//       }
//       if (oldSecondImage) {
//         await CsrController.deleteFile(oldSecondImage);
//       }

//       await CacheService.invalidate("Csr");
//       await CacheService.invalidate(`csr_${id}`);
//       res.json({ success: true, message: "csr deleted", data: id });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = CsrController;
