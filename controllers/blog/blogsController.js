const { models } = require("../../models/index");
const CacheService = require("../../services/cacheService");
const CustomError = require("../../utils/customError");
const Logger = require("../../services/logger");
const fs = require("fs").promises;
const path = require("path");
const slugify = require("../../utils/slugify"); // Import the slugify utility
const { Sequelize, where, Op } = require("sequelize");

const Blogs = models.Blogs;

class BlogsController {
  // Utility to generate unique slug
  static async generateUniqueSlug(title, excludeId = null) {
    let slug = slugify(title);
    if (!slug) {
      slug = "blog-post"; // Fallback slug if title is empty
    }

    let count = 0;
    let uniqueSlug = slug;

    // Check for existing slugs
    while (
      await Blogs.findOne({
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
      if (updateData.slug) {
        updateData.slug = await BlogsController.generateUniqueSlug(updateData.slug);
        Logger.info(`Generated slug for new news: ${updateData.slug}`);
      } else if (!updateData.slug && updateData.title) {
        updateData.slug = await BlogsController.generateUniqueSlug(updateData.title);
        Logger.info(`Generated slug for new blog: ${updateData.slug}`);
      }

      if (req.files?.image) {
        updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Uploaded image for Blog: ${updateData.image}`);
      }
      if (req.files?.author_image) {
        updateData.author_image = `/uploads/blogs/${req.files.author_image[0].filename}`;
        Logger.info(`Uploaded author image for Blog: ${updateData.author_image}`);
      }
      if (req.files?.second_image) {
        updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Uploaded second image for Blog: ${updateData.second_image}`);
      }

      updateData.posted_on = new Date();
      const blog = await Blogs.create(updateData);

      await CacheService.invalidate("blogs");
      res.status(201).json({ success: true, data: blog, message: "Blog created" });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const { page, limit, search } = req.query;

      // If no pagination params, return full list (backward compatible for client-side usage)
      if (!page && !limit) {
        const cacheKey = "blogs";
        const cachedData = await CacheService.get(cacheKey);

        if (cachedData) {
          return res.json({ success: true, data: JSON.parse(cachedData) });
        }

        const blogs = await Blogs.findAll({
          order: [["posted_on", "DESC"]],
        });

        await CacheService.set(cacheKey, JSON.stringify(blogs), 3600);
        return res.json({ success: true, data: blogs });
      }

      // Pagination flow
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build where conditions for search
      const whereConditions = {};
      if (search && search.trim()) {
        whereConditions.title = { [Op.iLike]: `%${search.trim()}%` };
      }

      // Skip caching when search is applied
      const cacheKey = search ? null : `blogs_page_${pageNum}_limit_${limitNum}`;
      if (cacheKey) {
        const cachedData = await CacheService.get(cacheKey);
        // if (cachedData) {
        //   return res.json(JSON.parse(cachedData));
        // }
      }

      const { count, rows } = await Blogs.findAndCountAll({
        where: whereConditions,
        order: [["posted_on", "DESC"]],
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

  static async getById(req, res, next) {
    try {
      const { slug } = req.params;
      const cacheKey = `blog_${slug}`;
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const blog = await Blogs.findOne({ where: { slug } });
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
      res.json({ success: true, data: blog });
    } catch (error) {
      next(error);
    }
  }

  // static async update(req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const blog = await Blogs.findByPk(id);
  //     if (!blog) {
  //       throw new CustomError("Blog not found", 404);
  //     }

  //

  //     const updateData = { ...req.body };
  //     let oldImage = blog.image;
  //     let oldSecondImage = blog.second_image;

  //     // Generate slug if title is updated and no slug is provided
  //     if (updateData.title && !updateData.slug) {
  //       updateData.slug = await BlogsController.generateUniqueSlug(updateData.title, id);
  //       Logger.info(`Generated slug for updated blog ID ${id}: ${updateData.slug}`);
  //     }

  //     if (req.files?.image) {
  //       updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
  //       Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
  //       if (oldImage) {
  //         await BlogsController.deleteFile(oldImage);
  //       }
  //     }
  //     if (req.files?.second_image) {
  //       updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
  //       Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
  //       if (oldSecondImage) {
  //         await BlogsController.deleteFile(oldSecondImage);
  //       }
  //     }

  //     await blog.update(updateData);

  //     await CacheService.invalidate("blogs");
  //     await CacheService.invalidate(`blog_${id}`);
  //     res.json({ success: true, data: blog, message: "Blog updated" });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findByPk(id);
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      let updateData = { ...req.body };
      let oldImage = blog.image;
      let oldSecondImage = blog.second_image;
      let oldAuthorImage = blog.author_image;

      // Remove any `null` values from the updateData object
      updateData = Object.fromEntries(Object.entries(updateData).filter(([_, value]) => value !== null));

      // Generate slug if title is updated and no slug is provided
      // Generate slug from title if not provided
      if (!updateData.slug) {
        updateData.slug = await BlogsController.generateUniqueSlug(updateData.title);
        Logger.info(`Generated slug for new news: ${updateData.slug}`);
      }
      // else if (updateData.title && !updateData.slug) {
      //   updateData.slug = await BlogsController.generateUniqueSlug(updateData.title, id);
      //   Logger.info(`Generated slug for updated blog ID ${id}: ${updateData.slug}`);
      // }

      // Handle image uploads
      if (req.files?.image) {
        updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
        Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
        if (oldImage) {
          await BlogsController.deleteFile(oldImage);
        }
      }

      if (req.files?.author_image) {
        updateData.author_image = `/uploads/blogs/${req.files.author_image[0].filename}`;
        Logger.info(`Updated author image for Blog ID ${id}: ${updateData.author_image}`);
        if (oldAuthorImage) {
          await BlogsController.deleteFile(oldAuthorImage);
        }
      }

      if (req.files?.second_image) {
        updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
        Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
        if (oldSecondImage) {
          await BlogsController.deleteFile(oldSecondImage);
        }
      }

      updateData.posted_on = !blog.is_active ? new Date() : blog.posted_on;

      await blog.update(updateData);

      await CacheService.invalidate("blogs");
      await CacheService.invalidate(`blog_${id}`);
      await CacheService.invalidate(`metaData:blogItem:${id}`);

      res.json({ success: true, data: blog, message: "Blog updated" });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const blog = await Blogs.findByPk(id);
      if (!blog) {
        throw new CustomError("Blog not found", 404);
      }

      const oldImage = blog.image;
      const oldSecondImage = blog.second_image;
      const oldAuthorImage = blog.author_image;
      await blog.destroy();

      if (oldImage) {
        await BlogsController.deleteFile(oldImage);
      }
      if (oldSecondImage) {
        await BlogsController.deleteFile(oldSecondImage);
      }

      if (oldAuthorImage) {
        await BlogsController.deleteFile(oldAuthorImage);
      }

      await CacheService.invalidate("blogs");
      await CacheService.invalidate(`blog_${id}`);
      res.json({ success: true, message: "Blog deleted", data: id });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BlogsController;

// const { models } = require("../../models/index");
// const CacheService = require("../../services/cacheService");
// const CustomError = require("../../utils/customError");
// const Logger = require("../../services/logger");
// const fs = require("fs").promises;
// const path = require("path");

// const Blogs = models.Blogs;

// class BlogsController {
//   static async generateUniqueSlug(title, excludeId = null) {
//     let slug = slugify(title);
//     if (!slug) {
//       slug = "blog-post"; // Fallback slug if title is empty
//     }

//     let count = 0;
//     let uniqueSlug = slug;

//     // Check for existing slugs
//     while (
//       await Blogs.findOne({
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
//         updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
//         Logger.info(`Uploaded image for Blog: ${updateData.image}`);
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
//         Logger.info(`Uploaded second image for Blog: ${updateData.second_image}`);
//       }

//       const blog = await Blogs.create(updateData);

//       await CacheService.invalidate("blogs");
//       res.status(201).json({ success: true, data: blog, message: "Blog created" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getAll(req, res, next) {
//     try {
//       const cacheKey = "blogs";
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const blogs = await Blogs.findAll({
//         order: [["order", "ASC"]],
//       });

//       await CacheService.set(cacheKey, JSON.stringify(blogs), 3600);
//       res.json({ success: true, data: blogs });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async getById(req, res, next) {
//     try {
//       const { id } = req.params;
//       const cacheKey = `blog_${id}`;
//       const cachedData = await CacheService.get(cacheKey);

//       if (cachedData) {
//         return res.json({ success: true, data: JSON.parse(cachedData) });
//       }

//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
//       res.json({ success: true, data: blog });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async update(req, res, next) {
//     try {
//       const { id } = req.params;
//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       const updateData = { ...req.body };
//       let oldImage = blog.image;
//       let oldSecondImage = blog.second_image;

//       if (req.files?.image) {
//         updateData.image = `/uploads/blogs/${req.files.image[0].filename}`;
//         Logger.info(`Updated image for Blog ID ${id}: ${updateData.image}`);
//         if (oldImage) {
//           await BlogsController.deleteFile(oldImage);
//         }
//       }
//       if (req.files?.second_image) {
//         updateData.second_image = `/uploads/blogs/${req.files.second_image[0].filename}`;
//         Logger.info(`Updated second image for Blog ID ${id}: ${updateData.second_image}`);
//         if (oldSecondImage) {
//           await BlogsController.deleteFile(oldSecondImage);
//         }
//       }

//       await blog.update(updateData);

//       await CacheService.invalidate("blogs");
//       await CacheService.invalidate(`blog_${id}`);
//       res.json({ success: true, data: blog, message: "Blog updated" });
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async delete(req, res, next) {
//     try {
//       const { id } = req.params;
//       const blog = await Blogs.findByPk(id);
//       if (!blog) {
//         throw new CustomError("Blog not found", 404);
//       }

//       const oldImage = blog.image;
//       const oldSecondImage = blog.second_image;
//       await blog.destroy();

//       if (oldImage) {
//         await BlogsController.deleteFile(oldImage);
//       }
//       if (oldSecondImage) {
//         await BlogsController.deleteFile(oldSecondImage);
//       }

//       await CacheService.invalidate("blogs");
//       await CacheService.invalidate(`blog_${id}`);
//       res.json({ success: true, message: "Blog deleted", data: id });
//     } catch (error) {
//       next(error);
//     }
//   }
// }

// module.exports = BlogsController;
