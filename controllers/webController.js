const { models } = require("../models/index");
const CacheService = require("../services/cacheService");
const CustomError = require("../utils/customError");
const logger = require("../services/logger");
const { Sequelize } = require("sequelize");

class WebController {
  static async getHomeData(req, res, next) {
    try {
      await CacheService.invalidate("webHomeData");
      const cacheKey = "webHomeData";
      const cachedData = await CacheService.get(cacheKey);

      if (cachedData) {
        logger.info("Serving home data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const data = {};
      try {
        data.heroBanner = await models.HeroBanner.findAll();
        logger.debug("Fetched heroBanner");
      } catch (err) {
        logger.error("Failed to fetch heroBanner", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.faqs = await models.HomeFaq.findAll({ order: [["order", "ASC"]] });
        logger.debug("Fetched faqs");
      } catch (err) {
        logger.error("Failed to fetch faqs", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.loanSteps = await models.HomeLoanStep.findAll({ order: [["order", "ASC"]] });
        logger.debug("Fetched loanSteps");
      } catch (err) {
        logger.error("Failed to fetch loanSteps", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        data.homeStatistics = await models.HomeStatistics.findAll({
          order: [["sort_order", "ASC"]],
        });
        logger.debug("Fetched loanSteps");
      } catch (err) {
        logger.error("Failed to fetch loanSteps", { error: err.message, stack: err.stack });
        throw err;
      }
      try {
        const homePageData = await models.HomePageContent.findAll();
        data.pageContent = homePageData[0];
        logger.debug("Fetched pageContent");
      } catch (err) {
        logger.error("Failed to fetch pageContent", { error: err.message, stack: err.stack });
        throw err;
      }

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
      if (cachedData) {
        logger.info("Serving home data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [aboutBanner, aboutContent, lifeAtIndelImages, quickLinks, teamMessages, serviceImages, statsData, accolades] =
        await Promise.all([
          models.AboutBanner.findAll(),
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
      if (cachedData) {
        logger.info("Serving management data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving partners data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving contact data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving history data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving blog data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving blog details from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving Indel values data from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving Diffrent Shades of Indel from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving Our Services from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      if (cachedData) {
        logger.info("Serving gold loan from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [goldloanContent, goldLoanFeatures, goldloanBannerFeatures, goldLoanFaq, goldLoanSchemes, schemeDetails] =
        await Promise.all([
          models.GoldloanContent.findAll(),
          models.GoldLoanFeatures.findAll(),
          models.GoldloanBannerFeatures.findAll(),
          models.GoldLoanFaq.findAll(),
          models.GoldLoanScheme.findAll(),
          models.SchemeDetails.findAll({
            order: [[Sequelize.literal('CAST("order" AS INTEGER)'), "ASC"]],
          }),
        ]);

      // Group scheme details under their respective schemes
      const schemes = goldLoanSchemes.map((scheme) => ({
        id: scheme.id,
        name: scheme.name,
        // is_active: scheme.is_active,
        details: schemeDetails
          .filter((detail) => detail.gold_loan_scheme_id === scheme.id)
          .map((detail) => ({
            id: detail.id,
            title: detail.title,
            description: detail.description,
            order: detail.order,
            // is_active: detail.is_active,
          })),
      }));

      const data = {
        GoldloanContent: goldloanContent[0] || null,
        GoldLoanFeatures: goldLoanFeatures,
        GoldloanBannerFeatures: goldloanBannerFeatures,
        GoldLoanFaq: goldLoanFaq,
        schemes,
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
      if (cachedData) {
        logger.info("Serving MSME Loan from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [msmeLoanContent, msmeLoanSupportedIndustries, msmeOfferings, msmeTargetedAudience, msmeLoanFaq] = await Promise.all([
        models.MsmeLoanContent.findAll(),
        models.MsmeLoanSupportedIndustries.findAll(),
        models.MsmeOfferings.findAll(),
        models.MsmeTargetedAudience.findAll(),
        models.MsmeLoanFaq.findAll(),
      ]);

      const data = {
        msmeLoanContent: msmeLoanContent[0] || null,
        msmeLoanSupportedIndustries,
        msmeOfferings,
        msmeTargetedAudience,
        msmeLoanFaq,
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
      if (cachedData) {
        logger.info("Serving CD Loan from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

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
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving Career Page from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [careersContent, careerBanners, careerGallery, careerStates, careerJobs] = await Promise.all([
        models.CareersContent.findAll(),
        models.CareerBanners.findAll(),
        models.CareerGallery.findAll(),
        models.CareerStates.findAll(),
        models.CareerJobs.findAll(),
      ]);

      const data = {
        careersContent: careersContent[0] || null,
        careerBanners,
        careerGallery,
        careerStates,
        careerJobs,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Career Page data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Career Page data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Career Page data", 500, error.message));
    }
  }
  static async eventGallery(req, res, next) {
    const cacheKey = "webEventGallery";

    try {
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving event gallery from cache");
        return res.json({ success: true, data: JSON.parse(cachedData) });
      }

      const eventTypes = await models.EventTypes.findAll({
        where: { is_active: true },
        order: [["order", "ASC"]],
        include: [
          {
            model: models.EventGallery,
            as: "galleryItems",
            where: { is_active: true },
            attributes: ["image"],
            required: false,
          },
        ],
      });

      const data = eventTypes.map((eventType) => ({
        event: eventType.title,
        gallery: (eventType.galleryItems || []).map((gallery) => gallery.image),
      }));

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched event gallery data from DB");
      res.json({ success: true, data });
    } catch (error) {
      logger.error("Error fetching event gallery data", { error: error.message, stack: error.stack });
      res.json({ success: false, error: { message: error.message, stack: error.stack } });
    }
  }

  static async Awards(req, res, next) {
    const cacheKey = "webAwards";

    try {
      const cachedData = await CacheService.get(cacheKey);
      if (cachedData) {
        logger.info("Serving Awards from cache");
        return res.json({ status: "success", data: JSON.parse(cachedData) });
      }

      const [awardPageContent, awards] = await Promise.all([models.AwardPageContent.findAll(), models.Awards.findAll()]);

      const data = {
        awardPageContent: awardPageContent[0] || null,
        awards,
      };

      await CacheService.set(cacheKey, JSON.stringify(data), 3600);
      logger.info("Fetched Awards data from DB");
      res.json({ status: "success", data });
    } catch (error) {
      logger.error("Error fetching Awards data", { error: error.message, stack: error.stack });
      next(new CustomError("Failed to fetch Awards data", 500, error.message));
    }
  }
}

module.exports = WebController;
