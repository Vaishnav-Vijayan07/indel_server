const { models } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");
const { Sequelize, where, Op } = require("sequelize");
const cacheService = require("../services/cacheService");

class WebController {
  static async getHomeData(req, res, next) {
    const cacheKey = "webHomeData";
    try {
      // Invalidate cache and check for cached data
      await CacheService.invalidate(cacheKey);
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving home data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      // Fetch all data concurrently
      const [heroBanner, faqs, loanSteps, homeStatistics, homePageData, lifeAtIndel, blogs, popUp, smartMoneyDeals] = await Promise.all([
        models.HeroBanner.findAll({ where: { is_active: true }, order: [["order", "ASC"]] }).catch((err) => {
          logger.error("Failed to fetch heroBanner", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.HomeFaq.findAll({ where: { is_active: true }, order: [["order", "ASC"]] }).catch((err) => {
          logger.error("Failed to fetch faqs", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.HomeLoanStep.findAll({ where: { is_active: true }, order: [["order", "ASC"]] }).catch((err) => {
          logger.error("Failed to fetch loanSteps", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.AboutStatistics.findAll().catch((err) => {
          logger.error("Failed to fetch homeStatistics", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.HomePageContent.findAll().catch((err) => {
          logger.error("Failed to fetch pageContent", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.Awards.findAll({
          where: {
            is_slide: true,
          },
          attributes: ["id", "title", "description", "image", "year", "image_alt", "is_slide"],
        }).catch((err) => {
          logger.error("Failed to fetch lifeAtIndel", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.Blogs.findAll({
          attributes: ["id", "title", "is_slider", "image_description", "image", "image_alt", "posted_on"],
        }).catch((err) => {
          logger.error("Failed to fetch blogs", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.PopupSettings.findAll().catch((err) => {
          logger.error("Failed to fetch blogs", { error: err.message, stack: err.stack });
          throw err;
        }),
        models.SmartMoneyDeals.findAll({
          attributes: ["id", "title", "icon", "order", "is_active", "link"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }).catch((err) => {
          logger.error("Failed to fetch blogs", { error: err.message, stack: err.stack });
          throw err;
        }),
      ]);

      const settings = popUp[0] || null;

      const isBanner = settings?.is_banner || false;

      const bannerPopupData = {
        appearence_time: settings?.banner_popup_appearence_time || null,
        image_alt: settings?.image_alt || null,
        image_link: settings?.image_link || null,
        banner_popup_image: settings?.banner_popup_image || null,
        sub_title: settings?.sub_title || null,
        title: settings?.title || null,
        logo: settings?.logo || null,
      };

      let popupServices = null;
      if (!isBanner) {
        popupServices = await models.PopupServices.findAll({
          attributes: ["id", "image", "image_alt", "title", "description", "button_link", "button_text", "order", "is_active"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        });
      }

      const servicePopupData = {
        appearence_time: settings?.service_popup_appearence_time || null,
        sub_title: settings?.sub_title || null,
        title: settings?.title || null,
        logo: settings?.logo || null,
        services: popupServices,
      };

      // Structure the response data
      const data = {
       smartMoneyDeals,
        banner: isBanner ? bannerPopupData : null,
        service: !isBanner ? servicePopupData : null,
        lifeAtIndel,
        blogs,
        heroBanner,
        faqs,
        loanSteps,
        homeStatistics,
        pageContent: homePageData[0],
      };

      // Cache the data for 1 hour
      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched home data");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching home data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch home data", 500, error.message));
    }
  }

  static async aboutData(req, res, next) {
    const cacheKey = "webAboutData";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving home data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [aboutBanner, aboutContent, lifeAtIndelImages, quickLinks, teamMessages, serviceImages, statsData, accolades] =
        await Promise.all([
          models.AboutBanner.findAll({
          where: {
            is_active: true,
          },
          order: [["order", "ASC"]],
          attributes: ["id", "title", "super_title", "image", "alt_text", "order", "is_active"],
        }),
          models.AboutPageContent.findAll(),
          models.AboutLifeAtIndelGallery.findAll(),
          models.AboutQuickLinks.findAll(),
          models.AboutMessageFromTeam.findAll(),
          models.AboutServiceGallery.findAll(),
          models.AboutStatistics.findAll(),
          models.AboutAccolades.findAll(),
        ]);

      const data = {
        aboutBanner,
        aboutContent: aboutContent[0] || null,
        lifeAtIndelImages,
        quickLinks,
        teamMessages,
        serviceImages,
        statsData,
        accolades,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched about data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching about data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch about data", 500, error.message));
    }
  }

  static async mangementData(req, res, next) {
    const cacheKey = "webManagementData";

    try {
      // await CacheService.invalidate("webManagementData");
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving management data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, teams] = await Promise.all([models.ManagementTeamContent.findAll(), models.ManagementTeams.findAll()]);

      const data = {
        content: content[0] || null,
        teams,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched management data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching management data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch management data", 500, error.message));
    }
  }

  static async partnersData(req, res, next) {
    const cacheKey = "webPartnersData";

    try {
      await CacheService.invalidate("webPartnersData");
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving partners data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, debtPartners] = await Promise.all([models.DebtPartnersContent.findAll(), models.DeptPartners.findAll()]);

      const data = {
        content: content[0] || null,
      };

      const partnersData = {
        debtPartners,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched partners data from DB");
      res.json({ status: "success", data, partnersData });
    } catch (error) {
      logger.error("Error fetching partners data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch partners data", 500, error.message));
    }
  }

  static async contactData(req, res, next) {
    const cacheKey = "webContactData";

    try {
      await CacheService.invalidate("webContactData");
      // const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving contact data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, faqs, officeContacts] = await Promise.all([
        models.ContactContent.findAll({
          attributes: {
            exclude: ["createdAt", "updatedAt", "branch_locator_title", "branch_locator_description"], // exclude timestamps
            include: [
              [Sequelize.col("branch_locator_title"), "branch_section_title"],
              [Sequelize.col("branch_locator_description"), "branch_section_description"],
            ],
          },
        }),
        models.ContactFaq.findAll(),
        models.ContactOffice.findAll(),
      ]);

      const data = {
        content: content[0] || null,
        faqs,
        officeContacts,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched contact data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching contact data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch contact data", 500, error.message));
    }
  }

  static async historyData(req, res, next) {
    const cacheKey = "webHistoryData";

    try {
      await CacheService.invalidate("webHistoryData");
      // const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving history data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, images, inceptions] = await Promise.all([
        models.HistoryPageContent.findAll(),
        models.HistoryImages.findAll(),
        models.HistoryInceptionsYears.findAll(),
      ]);

      const data = {
        content: content[0] || null,
        images,
        inceptions,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched history data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching history data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch history data", 500, error.message));
    }
  }

  static async blogData(req, res, next) {
    const cacheKey = "webBlogData";

    try {
      await CacheService.invalidate("webBlogData");
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving blog data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, blogs] = await Promise.all([models.BlogPageContent.findAll(), models.Blogs.findAll()]);

      const sliderItems = blogs.filter((blog) => blog.is_slider);

      const data = {
        content: content[0] || null,
        blogs,
        sliderItems,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched blog data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching blog data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch blog data", 500, error.message));
    }
  }
  static async blogDetails(req, res, next) {
    const { slug } = req.params;
    const cacheKey = `webBlogData_${slug}`;

    try {
      await CacheService.invalidate(`webBlogData_${slug}`);
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving blog details from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const blog = await models.Blogs.findOne({
        where: { slug },
      });

      await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
      logger.info("Fetched blog details from DB");
      res.json({ status: "success", data: blog });
    } catch (error) {
      logger.error("Error fetching blog details", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch blog details", 500, error.message));
    }
  }

  static async IndelValuesData(req, res, next) {
    const cacheKey = "webIndelValueData";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Indel values data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [indelValueContent, indelValues, approachPropositions] = await Promise.all([
        models.IndelValueContent.findAll(),
        models.IndelValues.findAll(),
        models.ApproachPropositions.findAll(),
      ]);

      const data = {
        indelValueContent: indelValueContent[0] || null,
        indelValues,
        approachPropositions,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Indel values data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Indel values data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Indel values data", 500, error.message));
    }
  }

  static async ShadesOfIndel(req, res, next) {
    const cacheKey = "webShadesOfIndel";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Diffrent Shades of Indel from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [differentShades, shadesOfIndelContent] = await Promise.all([
        models.DifferentShades.findAll(),
        models.ShadesOfIndelContent.findAll(),
      ]);

      const data = {
        shadesOfIndelContent: shadesOfIndelContent[0] || null,
        differentShades,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Diffrent Shades of Indel data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Diffrent Shades of Indel data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Diffrent Shades of Indel data", 500, error.message));
    }
  }

  static async OurServices(req, res, next) {
    const cacheKey = "webOurServices";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Our Services from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [serviceContent, serviceBenefit, services] = await Promise.all([
        models.ServiceContent.findAll(),
        models.ServiceBenefit.findAll(),
        models.Services.findAll(),
      ]);

      const data = {
        serviceContent: serviceContent[0] || null,
        serviceBenefit,
        services,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Our Services data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Our Services data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Our Services data", 500, error.message));
    }
  }

  static async goldLoan(req, res, next) {
    const cacheKey = "webGoldLoan";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving gold loan from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const service = await models.Services.findOne({
        where: { slug: "gold-loan", is_active: true },
        attributes: ["id"],
      });

      const [
        goldloanContent,
        goldLoanFeatures,
        goldloanBannerFeatures,
        ServiceBenefit,
        goldLoanFaq,
        goldLoanSchemes,
        schemeDetails,
        steps,
      ] = await Promise.all([
        models.GoldloanContent.findAll(),
        models.GoldLoanFeatures.findAll(),
        models.GoldloanBannerFeatures.findAll(),
        models.ServiceBenefit.findAll({
          where: { is_active: true, service_id: service?.id },
          order: [[Sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
        }),
        models.GoldLoanFaq.findAll({
          where: { is_active: true },
          order: [[Sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
        }),
        models.GoldLoanScheme.findAll(),
        models.SchemeDetails.findAll({
          order: [[Sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
        }),
        models.HomeLoanStep.findAll(),
      ]);

      // Group scheme details under their respective schemes
      // const schemes = goldLoanSchemes.map((scheme) => ({
      //   id: scheme.id,
      //   name: scheme.title,
      //   // is_active: scheme.is_active,
      //   details: schemeDetails
      //     .filter((detail) => detail.scheme_id === scheme.id)
      //     .map((detail) => ({
      //       id: detail.id,
      //       title: detail.title,
      //       description: detail.description,
      //       order: detail.order,
      //       // is_active: detail.is_active,
      //     })),
      // }));

      const schemes = goldLoanSchemes.map((scheme) => scheme.title);

      const schemesDetails = goldLoanSchemes.map((scheme) =>
        schemeDetails
          .filter((detail) => detail.scheme_id === scheme.id)
          .flatMap((detail) => ({
            id: detail.id,
            title: detail.title,
            value: detail.value,
          }))
      );

      const centerItem = goldLoanFeatures?.find((item) => item.is_center);
      const nonCenterItems = goldLoanFeatures?.filter((item) => !item.is_center);

      // Step 1: Group non-center items into pairs
      const grouped = [];
      for (let i = 0; i < nonCenterItems.length; i += 2) {
        grouped.push(nonCenterItems.slice(i, i + 2));
      }

      // Step 2: Insert centerItem in the middle group (e.g., group at index 1)
      if (centerItem) {
        if (grouped.length >= 2) {
          grouped[1].splice(1, 0, centerItem); // insert at index 1 in 2nd group
        } else if (grouped.length === 1) {
          grouped[0].push(centerItem);
        } else {
          grouped.push([centerItem]);
        }
      }

      const data = {
        GoldloanContent: goldloanContent[0] || null,
        GoldLoanFeatures: grouped,
        GoldloanBannerFeatures: goldloanBannerFeatures,
        GoldLoanFaq: goldLoanFaq,
        GoldloanBenefits: ServiceBenefit,
        Steps: steps,
        schemes: {
          goldLoanSchemes: schemes,
          goldLoanSchemeDetails: schemesDetails,
        },
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched gold loan data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching gold loan data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch gold loan data", 500, error.message));
    }
  }

  static async MSMELoan(req, res, next) {
    const cacheKey = "webMSMELoan";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving MSME Loan from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [msmeLoanContent, msmeLoanSupportedIndustries, msmeOfferings, msmeTargetedAudience, msmeLoanFaq, msmeLoanTypes] = await Promise.all([
        models.MsmeLoanContent.findAll(),
        models.MsmeLoanSupportedIndustries.findAll({
          // attributes: ["id", "image", "title", "description", "is_active", "order"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
        models.MsmeOfferings.findAll(),
        models.MsmeTargetedAudience.findAll({
          // attributes: ["id", "icon", "title", "description", "is_active", "order"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
        models.MsmeLoanFaq.findAll(),
        models.MsmeloanTypes.findAll({
          attributes: ["id", "image", "image_alt", "title", "sub_title", "description", "link", "is_active", "order"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);

      const data = {
        msmeLoanContent: msmeLoanContent[0] || null,
        msmeLoanSupportedIndustries,
        msmeOfferings,
        msmeTargetedAudience,
        msmeLoanFaq,
        msmeLoanTypes,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched MSME Loan data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching MSME Loan data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch MSME Loan data", 500, error.message));
    }
  }

  static async CDLoan(req, res, next) {
    const cacheKey = "webCDLoan";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving CD Loan from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [cdLoanContent, cdLoanBenefits, cdLoanProducts] = await Promise.all([
        models.CdLoanContent.findAll(),
        models.CdLoanBenefits.findAll(),
        models.CdLoanProducts.findAll(),
      ]);

      const data = {
        cdLoanContent: cdLoanContent[0] || null,
        cdLoanBenefits,
        cdLoanProducts,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched CD Loan data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching CD Loan data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch CD Loan data", 500, error.message));
    }
  }

  static async CareerPage(req, res, next) {
    const cacheKey = "webCareerPage";

    try {
      // const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Career Page from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [careersContent, careerBanners, careerGallery, careerStates, careerJobs, empBenefits, awards, testimoinials] =
        await Promise.all([
          models.CareersContent.findAll(),
          models.CareerBanners.findAll(),
          models.CareerGallery.findAll(),
          models.CareerStates.findAll(),
          models.CareerJobs.findAll({
            // attributes: ["id", "role_id", "location_id", "state_id", "job_title", "job_description", "key_responsibilities", "is_active"],
            include: [
              { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
              { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
              { model: models.CareerStates, as: "state", attributes: ["state_name"] },
            ],
            order: [["id", "ASC"]],
          }),
          models.EmployeeBenefits.findAll(),
          models.Awards.findAll({
          where: {
            is_slide: true,
          },
        }),
          models.Testimonials.findAll(),
        ]);

      const textTestimonials = testimoinials.filter((testimoinial) => testimoinial.type === "text");
      const imageTestimonials = testimoinials.filter((testimoinial) => testimoinial.type === "video");

      const data = {
        careersContent: careersContent[0] || null,
        careerBanners,
        careerGallery,
        careerStates,
        careerJobs,
        empBenefits,
        awards,
        testimoinials: {
          textTestimonials,
          imageTestimonials,
        },
      };

      console.log("Data fetched for Career Page:", data);

      // await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Career Page data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Career Page data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Career Page data", 500, error.message));
    }
  }

  static async ActiveJobs(req, res, next) {
    const cacheKey = "webCareerPage";
    const { state, location, role } = req.query;

    const whereClause = {
      is_active: true,
    };

    if (state) whereClause.state_id = state;
    if (role) whereClause.role_id = role;
    if (location) whereClause.location_id = location;

    try {
      // const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Career Page from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const jobs = await models.CareerJobs.findAll({
        where: whereClause,
        attributes: [
          "id",
          "role_id",
          "location_id",
          "state_id",
          "short_description",
          "detailed_description",
          "experience",
          "is_active",
        ],
        include: [
          { model: models.CareerRoles, as: "role", attributes: ["role_name"] },
          { model: models.CareerLocations, as: "location", attributes: ["location_name"] },
          { model: models.CareerStates, as: "state", attributes: ["state_name"] },
        ],
        order: [["id", "ASC"]],
        logging: console.log,
      });

      const data = {
        jobs,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Career Page data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      console.log(error);
      logger.error("Error fetching Career Page data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Career Page data", 500, error.message));
    }
  }
  static async eventGallery(req, res, next) {
    const cacheKey = "webEventGallery";
    const {
      type = "all", // 'all', 'image', 'video'
      page = 1, // page number (1-based)
      limit = 10, // items per page
    } = req.query;

    // Convert page to number and calculate offset
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions for EventGallery
    const galleryWhere = {
      is_active: true,
    };

    // Add type filter
    if (type === "image") {
      galleryWhere.is_video = false;
      galleryWhere.image = { [Op.ne]: null }; // Ensure image is not null
    } else if (type === "video") {
      galleryWhere.is_video = true;
      galleryWhere.video = { [Op.ne]: null }; // Ensure video is not null
    }

    // Build where conditions for EventTypes
    const eventTypeWhere = {
      is_active: true,
    };

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving event gallery from cache");
      //   return res.json({ success: true, data: JSON.parse(cachedData) });
      // }

      const [contents, eventMedias] = await Promise.all([
        models.GalleryPageContent.findAll(),
        models.EventTypes.findAndCountAll({
          where: eventTypeWhere,
          order: [["order", "ASC"]],
          include: [
            {
              model: models.EventGallery,
              as: "galleryItems",
              where: galleryWhere,
              attributes: ["id", "image", "video", "is_video", "order", "image_alt", "video_thumbnail", "thumbnail_alt", "createdAt"],
              required: type !== "all", // Use inner join for specific types
              order: [["order", "ASC"]],
            },
          ],
          limit: limitNum,
          offset: offset,
          distinct: true, // Important for correct count with joins
        }),
      ]);

      const galleryItems = eventMedias?.rows
        .map((eventType) => {
          const images = (eventType.galleryItems || []).map((gallery) => gallery.image).filter((img) => img);

          const video_thumbs = (eventType.galleryItems || []).map((gallery) => gallery.video_thumbnail).filter((vid) => vid);

          const thumbnails = [...images, ...video_thumbs];

          return {
            title: eventType.title,
            description: eventType.description,
            thumbnails,
            slug: eventType.slug,
          };
        })
        .filter((item) => item.thumbnails.length > 0);

      const mainSliderItems = eventMedias?.rows
        .filter((event) => event.is_slider)
        .map((event) => {
          return {
            title: event.title,
            description: event.description,
            gallery: event?.cover_image,
            alt: event?.image_alt,
            slug: event.slug,
          };
        });

      const data = {
        galleryPageContent: contents[0] || null,
        galleryItems,
        mainSliderItems,
        pagination: {
          totalCount: eventMedias.count,
          totalPages: Math.ceil(eventMedias.count / limitNum),
          currentPage: page,
          limit: limitNum,
        },
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched event gallery data from DB");
      res.status(200).json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching event gallery data", { error: error.message, stack: error.stack });
      res.json({ success: false, error: { message: error.message, stack: error.stack } });
    }
  }

  static async event(req, res, next) {
    const { slug, page = 1, limit = 6 } = req.query;

    console.log(slug);

    // Convert page to number and calculate offset
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const cacheKey = "webEventGallery";
    try {
      const event = await models.EventTypes.findOne({
        where: { slug },
        attributes: ["id", "title", "description", "slug"],
      });

      console.log(event);

      const eventData = await models.EventGallery.findAndCountAll({
        where: {
          is_active: true,
          event_type_id: event.id,
        },
        attributes: ["id", "image", "video", "is_video", "order", "image_alt", "video_thumbnail", "thumbnail_alt", "event_type_id", "is_active"],
        limit: limitNum,
        offset: offset,
        order: [["order", "ASC"]],
      });

      const { count, rows: events } = eventData;
      const pages = Math.ceil(count / limitNum);

      const data = {
        galleryItems: events || [],
        content: {
          title: event?.title,
          description: event?.description,
        },
        pagination: {
          totalCount: count,
          totalPages: pages,
          currentPage: page,
          limit: limitNum,
        },
      };

      logger.info("Fetched event gallery data from DB");
      res.status(200).json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching event gallery data", { error: error.message, stack: error.stack });
      res.json({ success: false, error: { message: error.message, stack: error.stack } });
    }
  }

  static async Awards(req, res, next) {
    const cacheKey = "webAwards";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Awards from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [awardPageContent, awards] = await Promise.all([
        models.AwardPageContent.findAll(),
        models.Awards.findAll({
          attributes: ["id", "title", "description", "image", "year", "image_alt", "is_slide"],
        }),
      ]);

      const slideItems = awards?.filter((award) => award.is_slide);
      const nonSlideItems = awards?.filter((award) => !award.is_slide);
      const data = {
        awardPageContent: awardPageContent[0] || null,
        slideItems,
        nonSlideItems,
      };

      // const data = {
      //   awardPageContent: awardPageContent[0] || null,
      //   awards,
      // };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Awards data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Awards data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Awards data", 500, error.message));
    }
  }

  static async indelCares(req, res, next) {
    const cacheKey = "webIndelCares";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        status: "error",
        message: "Invalid pagination parameters",
      });
    }

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving Awards from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, slideItems, nonSlideItems] = await Promise.all([
        models.IndelCaresContent.findAll(),
        models.IndelCares.findAll({
          attributes: ["id", "title", "description", "image", "event_date", "image_alt", "is_slider", "is_active", "order"],
          where: { is_active: true, is_slider: true },
          order: [["order", "ASC"]],
        }),
        models.IndelCares.findAndCountAll({
          attributes: ["id", "title", "description", "image", "event_date", "image_alt", "is_slider", "is_active", "order"],
          where: { is_active: true, is_slider: false },
          order: [["order", "ASC"]],
          limit,
          offset,
        }),
      ]);

      const totalPages = Math.ceil(nonSlideItems.count / limit);

      const data = {
        content: content[0] || null,
        slideItems,
        nonSlideItems: nonSlideItems.rows,
        pagination: {
          totalCount: nonSlideItems.count,
          totalPages: totalPages,
          currentPage: page,
          limit: limit,
        },
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Awards data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Awards data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Awards data", 500, error.message));
    }
  }

  static async ombudsmanFiles(req, res, next) {
    const cacheKey = "webOmbudsmanFiles";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving ombudsman files from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const files = await models.OmbudsmanFiles.findAll({
        attributes: ["id", "title", "file", "order"],
        order: [["order", "DESC"]],
      });

      await CacheService.set(cacheKey, JSON.stringify(files), 3600);
      logger.info("Fetched ombudsman files data from DB");
      res.json({ status: "success", files });
    } catch (error) {
      logger.error("Error fetching ombudsman files data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch ombudsman files data", 500, error.message));
    }
  }

  static async footerContent(req, res, next) {
    const cacheKey = "webFooterContent";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving ombudsman files from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, icons] = await Promise.all([
        models.FooterContent.findAll(),
        models.SocialMediaIcons.findAll({
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);
      const data = {
        content: content[0] || null,
        icons,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched footer content data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching content data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch content data", 500, error.message));
    }
  }

  static async headerContent(req, res, next) {
    const cacheKey = "webHeaderContent";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving ombudsman files from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, footerContent, modes] = await Promise.all([
        models.HeaderContents.findAll({
          attributes: [
            "id",
            "logo",
            "button_1_text",
            "button_1_inner_title",
            "button_2_link",
            "button_2_text",
            "apple_dowload_icon",
            "andrioid_download_icon",
            "apple_dowload_link",
            "andrioid_download_link",
          ],
        }),
        models.FooterContent.findAll({
          attributes: ["id", "icon_section_link", "icon_section_text", "toll_free_num"],
        }),
        models.PaymentModes.findAll({
          attributes: ["id", "is_active", "title", "link"],
          where: { is_active: true },
          order: [["order", "ASC"]],
        }),
      ]);
      const data = {
        content: content[0] || null,
        footerContent: footerContent[0] || null,
        modes,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched header data data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching content data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch content data", 500, error.message));
    }
  }

  static async popUps(req, res, next) {
    const cacheKey = "webPopUps";

    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving ombudsman files from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const popUp = await models.PopupSettings.findAll();
      const settings = popUp[0] || null;

      const isBanner = settings?.is_banner || false;
      console.log(isBanner);

      const bannerPopupData = {
        banner_popup_disappear_time: settings?.banner_popup_disappear_time || null,
        banner_popup_appearence_time: settings?.banner_popup_appearence_time || null,
        banner_popup_image: settings?.banner_popup_image || null,
        sub_title: settings?.sub_title || null,
        title: settings?.title || null,
        logo: settings?.logo || null,
      };

      const servicePopupData = {
        sub_title: settings?.sub_title || null,
        title: settings?.title || null,
        logo: settings?.logo || null,
      };

      const data = {
        banner: isBanner ? bannerPopupData : null,
        service: !isBanner ? servicePopupData : null,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched popUp data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching content data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch content data", 500, error.message));
    }
  }

  static async testimonials(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const type = req.query.type || "all";

    const whereClause = {
      is_active: true,
    };

    if (type && type !== "all") {
      whereClause.type = type;
    }

    try {
      const content = await models.TestimonialPageContent.findAll();
      const testimonials = await models.Testimonials.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [["order", "DESC"]],
        attributes: [
          "id",
          "name",
          "designation",
          "avatar",
          "testimonial",
          "thumbnail",
          "thumbnail_alt",
          "video",
          "order",
          "type",
          "is_active",
          "is_about",
          "image_alt",
        ],
      });

      const totalPages = Math.ceil(testimonials.count / limit);

      const data = {
        content: content[0] || null,
        testimonials: testimonials.rows,
        pagination: {
          totalCount: testimonials.count,
          totalPages: totalPages,
          currentPage: page,
          limit: limit,
        },
      };

      logger.info("Fetched testimonials from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error getting testimoinials data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to get testimoinials data", 500, error.message));
    }
  }

  static async partners(req, res, next) {
    try {
      const partners = await models.PartnersTypes.findAll({
        where: {
          is_active: true,
        },
        order: [["order", "ASC"]],
        attributes: ["id", "title", "order", "is_active"],
      });
      const content = await models.DebtPartnersContent.findAll({
        attributes: ["id", "title"],
      });
      const data = {
        content: content[0] || null,
        partners,
      };

      logger.info("Fetched partners for web from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error getting partners data for web", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to get partners data for web", 500, error.message));
    }
  }

  static async partnersData(req, res, next) {
    const { type } = req.query || null;

    try {
      if (!type) {
        throw new CustomError("No type provided", 400);
      }

      const partnerData = await models.Partners.findAll({
        where: {
          partner_type_id: type,
          is_active: true,
        },
        order: [["order", "ASC"]],
        attributes: ["id", "partner_type_id", "logo", "logo_alt", "is_active", "order"],
      });

      logger.info("Fetched partner for web from DB");
      res.json({ status: "success", partnerData });
    } catch (error) {
      logger.error("Error getting partner data for web", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to get partner data for web", 500, error.message));
    }
  }

  static async directors(req, res, next) {
    const cacheKey = "webDirectorsData";

    try {
      // await CacheService.invalidate("webManagementData");
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving management data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, teams] = await Promise.all([models.DirectorsContent.findAll(), models.Directors.findAll()]);

      const data = {
        content: content[0] || null,
        teams,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched management data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching management data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch management data", 500, error.message));
    }
  }

  static async policy(req, res, next) {
    const { type } = req.query;
    console.log(type);
    const cacheKey = `webPolicy${type}`;
    try {
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info(`Serving ${type} policy from cache`);
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const policy = await models.MasterPolicies.findOne({
        where: {
          type: type,
        },
      });

      await cacheService.set(cacheKey, JSON.stringify(policy || []), 3600);
      logger.info(`Fetched ${type} policy from DB`);
      res.json({ status: "success", policy: policy || [] });
    } catch (error) {
      logger.error(`Error fetching ${type} policy`, { error: error.message, stack: error.stack });
      next(new CustomError(`Failed to fetch ${type} policy`, 500, error.message));
    }
  }

  static async newsData(req, res, next) {
    const cacheKey = "webNewsData";

    try {
      await CacheService.invalidate("webNewsData");
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving blog data from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const [content, blogs] = await Promise.all([models.NewsPageContent.findAll(), models.News.findAll()]);

      const sliderItems = blogs.filter((blog) => blog.is_slider);

      const data = {
        content: content[0] || null,
        blogs,
        sliderItems,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched news data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching news data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch news data", 500, error.message));
    }
  }
  static async newsDetails(req, res, next) {
    const { slug } = req.params;
    const cacheKey = `webNewsData_${slug}`;

    try {
      await CacheService.invalidate(`webNewsData_${slug}`);
      const cachedData = await CacheService.get(cacheKey);
      // if (cachedData) {
      //   logger.info("Serving blog details from cache");
      //   return res.json({ status: "success", data: JSON.parse(cachedData) });
      // }

      const blog = await models.News.findOne({
        where: { slug },
      });

      await CacheService.set(cacheKey, JSON.stringify(blog), 3600);
      logger.info("Fetched news details from DB");
      res.json({ status: "success", data: blog });
    } catch (error) {
      logger.error("Error fetching news details", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch news details", 500, error.message));
    }
  }
}

module.exports = WebController;
