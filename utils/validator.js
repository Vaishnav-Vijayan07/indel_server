const { check } = require("express-validator");
const { models } = require("../models");
const EventTypes = models.EventTypes;

const generateStringValidators = (fields, isOptional = false) => {
  return fields.map((field) =>
    isOptional
      ? check(field)
          .optional()
          .notEmpty()
          .withMessage(`${capitalize(field)} cannot be empty`)
      : check(field)
          .notEmpty()
          .withMessage(`${capitalize(field)} cannot be empty`)
  );
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const validateAboutLifeAtIndel = [
  check("order")
    .isInt({
      gt: 0,
    })
    .withMessage("Order must be a positive integer"),
];

const validateAboutLifeAtIndelUpdate = [];

const validateManagementTeam = [
  check("name").notEmpty().withMessage("Name is required"),
  check("title").notEmpty().withMessage("Title is required"),
  check("order")
    .optional()
    .isInt({
      gt: 0,
    })
    .withMessage("Order must be an integer"),
];

const validateManagementTeamUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("order")
    .optional()
    .isInt({
      gt: 0,
    })
    .withMessage("Order must be an integer"),
];

const validateDeptPartners = [
  check("name").notEmpty().withMessage("Name is required"),
  check("description").notEmpty().withMessage("description is required"),
  check("order")
    .optional()
    .isInt({
      gt: 0,
    })
    .withMessage("Order must be an integer"),
];

const validateDeptPartnersUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order")
    .optional()
    .isInt({
      gt: 0,
    })
    .withMessage("Order must be an integer"),
];

const validateAboutStatsItem = [
  check("value").isInt({ min: 0 }).withMessage("Value must be a positive integer"),
  check("suffix").notEmpty().withMessage("Suffix is required"),
  check("description").notEmpty().withMessage("Description is required"),
];

const validateAboutStatsItemUpdate = [
  check("value").optional().isInt({ min: 0 }).withMessage("Value must be a positive integer"),
  check("suffix").optional().notEmpty().withMessage("Suffix is required"),
  check("description").optional().notEmpty().withMessage("Description is required"),
];

const validateAboutMessageFromTeam = [
  check("title").notEmpty().withMessage("Title is required"),
  check("short_title").notEmpty().withMessage("Short title is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("full_name").notEmpty().withMessage("Full name is required"),
  check("designation").notEmpty().withMessage("Designation is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateAboutMessageFromTeamUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("short_title").optional().notEmpty().withMessage("Short title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("full_name").optional().notEmpty().withMessage("Full name cannot be empty"),
  check("designation").optional().notEmpty().withMessage("Designation cannot be empty"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateAboutPageContentUpdate = [
  check("super_title").optional().notEmpty().withMessage("Super title cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("sub_title").optional().notEmpty().withMessage("Sub title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),

  check("investors_title").optional().notEmpty().withMessage("Investors title cannot be empty"),
  check("investors_sub_title").optional().notEmpty().withMessage("Investors sub title cannot be empty"),

  check("journey_title").optional().notEmpty().withMessage("Journey title cannot be empty"),
  check("journey_sub_title").optional().notEmpty().withMessage("Journey sub title cannot be empty"),
  check("journey_description").optional().notEmpty().withMessage("Journey description cannot be empty"),

  check("journey_year_title").optional().notEmpty().withMessage("Journey year title cannot be empty"),
  check("journey_year_sub_title").optional().notEmpty().withMessage("Journey year sub title cannot be empty"),
  check("journey_year_description").optional().notEmpty().withMessage("Journey year description cannot be empty"),

  check("life_at_indel_title").optional().notEmpty().withMessage("Life at indel title cannot be empty"),
  check("life_at_indel_sub_title").optional().notEmpty().withMessage("Life at indel sub title cannot be empty"),
  check("life_at_indel_description").optional().notEmpty().withMessage("Life at indel description cannot be empty"),
];

const validateAboutQuickLinks = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("button_name").notEmpty().withMessage("Button name is required"),
  check("button_link").notEmpty().withMessage("Button link is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateAboutQuickLinksUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("button_name").optional().notEmpty().withMessage("Button name cannot be empty"),
  check("button_link").optional().notEmpty().withMessage("Button link cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateAboutBanner = [
  check("title").notEmpty().withMessage("Title is required"),
  check("super_title").notEmpty().withMessage("Super title is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateAboutBannerUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("super_title").optional().notEmpty().withMessage("Super title cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateHomeSmartDeals = [
  check("title").notEmpty().withMessage("Title is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateHomeSmartDealsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateAuth = [
  check("username").notEmpty().withMessage("Username is required"),
  check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const validateHeroBanner = [
  check("title").notEmpty().withMessage("Title is required"),
  check("button_text").notEmpty().withMessage("Button text is required"),
  check("button_link").notEmpty().withMessage("Button link is required"),
  // check("location").notEmpty().withMessage("Location is required"),
  check("image_alt_text").optional().notEmpty().withMessage("Alt text is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateHeroBannerUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("button_text").optional().notEmpty().withMessage("Button text cannot be empty"),
  check("button_link").optional().notEmpty().withMessage("Button link cannot be empty"),
  // check("location").optional().notEmpty().withMessage("Location cannot be empty"),
  check("image_alt_text").optional().notEmpty().withMessage("Alt text is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateHomeStatistics = [
  check("title").notEmpty().withMessage("Title is required"),
  check("value").notEmpty().withMessage("Value is required"),
  check("sort_order").isInt().withMessage("Sort order must be an integer"),
  check("status").isBoolean().withMessage("Status must be a boolean"),
  check("suffix").optional().isString().withMessage("Suffix must be a string"),
];

const validateHomeStatisticsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("value").optional().notEmpty().withMessage("Value cannot be empty"),
  check("sort_order").optional().isInt().withMessage("Sort order must be an integer"),
  check("status").optional().isBoolean().withMessage("Status must be a boolean"),
  check("suffix").optional().isString().withMessage("Suffix must be a string"),
];

const validateHomePageContentUpdate = [
  check("gold_rate_label").optional().notEmpty().withMessage("Gold rate label cannot be empty"),
  check("announcement_text").optional().notEmpty().withMessage("Announcement text cannot be empty"),
  check("about_super_title").optional().notEmpty().withMessage("About super title cannot be empty"),
  check("about_title").optional().notEmpty().withMessage("About title cannot be empty"),
  check("about_sub_title").optional().notEmpty().withMessage("About sub title cannot be empty"),
  check("about_description").optional().notEmpty().withMessage("About description cannot be empty"),
  check("about_button_name").optional().notEmpty().withMessage("About button name cannot be empty"),
  check("about_button_url").optional().notEmpty().withMessage("About button URL cannot be empty"),
  check("step_title").optional().notEmpty().withMessage("Step title cannot be empty"),
  check("branch_section_title").optional().notEmpty().withMessage("Branch section title cannot be empty"),
  check("branch_section_description").optional().notEmpty().withMessage("Branch section description cannot be empty"),
  check("life_section_title").optional().notEmpty().withMessage("Life section title cannot be empty"),
  check("life_section_description").optional().notEmpty().withMessage("Life section description cannot be empty"),
  check("life_section_button_name_1").optional().notEmpty().withMessage("Life section button name 1 cannot be empty"),
  check("life_section_button_link_1").optional().notEmpty().withMessage("Life section button link 1 cannot be empty"),
  check("life_section_button_name_2").optional().notEmpty().withMessage("Life section button name 2 cannot be empty"),
  check("life_section_button_link_2").optional().notEmpty().withMessage("Life section button link 2 cannot be empty"),
  check("updates_section_title").optional().notEmpty().withMessage("Updates section title cannot be empty"),
  check("investment_title").optional().notEmpty().withMessage("Investment title cannot be empty"),
  check("investment_description").optional().notEmpty().withMessage("Investment description cannot be empty"),
  check("investment_button_name").optional().notEmpty().withMessage("Investment button name cannot be empty"),
  check("investment_button_link").optional().notEmpty().withMessage("Investment button link cannot be empty"),
  check("features_title").optional().notEmpty().withMessage("Features title cannot be empty"),
  check("features_sub_title").optional().notEmpty().withMessage("Features sub title cannot be empty"),
  check("features_description").optional().notEmpty().withMessage("Features description cannot be empty"),
  check("ios_download_link").optional().notEmpty().withMessage("iOS download link cannot be empty"),
  check("android_download_link").optional().notEmpty().withMessage("Android download link cannot be empty"),
  check("faq_section_title").optional().notEmpty().withMessage("FAQ section title cannot be empty"),
  check("faq_section_super_title").optional().notEmpty().withMessage("FAQ section super title cannot be empty"),
];

const validateHomeLoanStep = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateHomeLoanStepUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateFaq = [
  check("question").notEmpty().withMessage("Question is required"),
  check("answer").notEmpty().withMessage("Answer is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateFaqUpdate = [
  check("question").optional().notEmpty().withMessage("Question cannot be empty"),
  check("answer").optional().notEmpty().withMessage("Answer cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];
const validateMngmtTeamContentItemUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
];

const validateDeptPartnersContent = [
  check("title").notEmpty().withMessage("Title is required"),
  check("super_title").notEmpty().withMessage("Super title is required"),
];

const validateDeptPartnersContentUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("super_title").optional().notEmpty().withMessage("Super title cannot be empty"),
];

const validateContactContent = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("help_title").optional().notEmpty().withMessage("Help title cannot be empty"),
  check("toll_free_number").optional().notEmpty().withMessage("Toll free number cannot be empty"),
  check("form_title").optional().notEmpty().withMessage("Form title cannot be empty"),
  check("form_sub_title").optional().notEmpty().withMessage("Form sub-title cannot be empty"),
  check("branch_locator_title").optional().notEmpty().withMessage("Branch locator title cannot be empty"),
  check("branch_locator_description").optional().notEmpty().withMessage("Branch locator description cannot be empty"),
  check("faq_super_title").optional().notEmpty().withMessage("FAQ super title cannot be empty"),
  check("faq_title").optional().notEmpty().withMessage("FAQ title cannot be empty"),
];

const validateContactContentUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("help_title").optional().notEmpty().withMessage("Help title cannot be empty"),
  check("toll_free_number").optional().notEmpty().withMessage("Toll free number cannot be empty"),
  check("form_title").optional().notEmpty().withMessage("Form title cannot be empty"),
  check("form_sub_title").optional().notEmpty().withMessage("Form sub-title cannot be empty"),
  check("branch_locator_title").optional().notEmpty().withMessage("Branch locator title cannot be empty"),
  check("branch_locator_description").optional().notEmpty().withMessage("Branch locator description cannot be empty"),
  check("faq_super_title").optional().notEmpty().withMessage("FAQ super title cannot be empty"),
  check("faq_title").optional().notEmpty().withMessage("FAQ title cannot be empty"),
];

const validateContactOffices = [
  check("office_name").notEmpty().withMessage("Office name is required"),
  check("address").notEmpty().withMessage("Address is required"),
  check("phone").notEmpty().withMessage("Phone is required"),
  check("alternative_phone").notEmpty().withMessage("Alternative phone is required"),
  check("email").notEmpty().withMessage("Email is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateContactOfficesUpdate = [
  check("office_name").optional().notEmpty().withMessage("Office name cannot be empty"),
  check("address").optional().notEmpty().withMessage("Address cannot be empty"),
  check("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
  check("alternative_phone").optional().notEmpty().withMessage("Alternative phone cannot be empty"),
  check("email").optional().notEmpty().withMessage("Email cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateAboutAccolades = [
  check("title").notEmpty().withMessage("Title is required"),
  check("bold_text").notEmpty().withMessage("Bold text is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateAboutAccoladesUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("bold_text").optional().notEmpty().withMessage("Bold text cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateHistoryPageContent = [
  check("page_title").notEmpty().withMessage("Page title is required"),
  check("history_title").optional().notEmpty().withMessage("History title cannot be empty"),
  check("history_description").optional().notEmpty().withMessage("History description cannot be empty"),
  check("inception_title").optional().notEmpty().withMessage("Inception title cannot be empty"),
];

const validateHistoryPageContentUpdate = [
  check("page_title").optional().notEmpty().withMessage("Page title cannot be empty"),
  check("history_title").optional().notEmpty().withMessage("History title cannot be empty"),
  check("history_description").optional().notEmpty().withMessage("History description cannot be empty"),
  check("inception_title").optional().notEmpty().withMessage("Inception title cannot be empty"),
];

const validateHistoryImages = [
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
];

const validateHistoryImagesUpdate = [
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
];

const validateHistoryInceptionsYears = [
  check("year").notEmpty().withMessage("Year cannot be empty"),
  check("title").notEmpty().withMessage("Title cannot be empty"),
  check("description").notEmpty().withMessage("Description cannot be empty"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateHistoryInceptionsYearsUpdate = [
  check("year").optional().notEmpty().withMessage("Year cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateIndelValue = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateIndelValueUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateDifferentShadesValue = [
  check("title").notEmpty().withMessage("Title is required"),
  check("paragraph_1").notEmpty().withMessage("Paragraph 1 is required"),
  check("paragraph_2").notEmpty().withMessage("Paragraph 2 is required"),
  check("sort_order").isInt().withMessage("Sort order must be an integer"),
];

const validateDifferentShadesValueUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("paragraph_1").optional().notEmpty().withMessage("Paragraph 1 cannot be empty"),
  check("paragraph_2").optional().notEmpty().withMessage("Paragraph 2 cannot be empty"),
  check("sort_order").optional().isInt().withMessage("Sort order must be an integer"),
];

const validateServicesPageContentUpdate = [
  check("page_super_title").optional().notEmpty().withMessage("Page Super Title cannot be empty"),
  check("page_title").optional().notEmpty().withMessage("Page Title cannot be empty"),
  check("deals_title").optional().notEmpty().withMessage("Deals Title cannot be empty"),
  check("deals_description").optional().notEmpty().withMessage("Deals Description cannot be empty"),
  check("remit_section_title").optional().notEmpty().withMessage("Remit Section Title cannot be empty"),
  check("remit_section_description").optional().notEmpty().withMessage("Remit Section Description cannot be empty"),
  check("remit_section_button_title").optional().notEmpty().withMessage("Remit Section Button Title cannot be empty"),
  check("remit_section_button_link").optional().isURL().withMessage("Remit Section Button Link must be a valid URL"),
];

const validateServiceBenefits = [
  check("title").notEmpty().withMessage("Title is required"),
  check("service_id").notEmpty().withMessage("Service is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateServiceBenefitsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("service_id").optional().notEmpty().withMessage("Service cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateGoldLoanContentUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("page_title").optional().notEmpty().withMessage("Page Title cannot be empty"),
  check("gold_rate_text").optional().notEmpty().withMessage("Gold Rate Text cannot be empty"),
  check("announcement_text").optional().notEmpty().withMessage("Announcement Text cannot be empty"),
  check("gold_loan_step_title").optional().notEmpty().withMessage("Gold Loan Step Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("identity_proof_title").optional().notEmpty().withMessage("Identity Proof Title cannot be empty"),
  check("identity_proof_description").optional().notEmpty().withMessage("Identity Proof Description cannot be empty"),
  check("address_proof").optional().notEmpty().withMessage("Address Proof cannot be empty"),
  check("address_proof_description").optional().notEmpty().withMessage("Address Proof Description cannot be empty"),
  check("gold_loan_title").optional().notEmpty().withMessage("Gold Loan Title cannot be empty"),
  check("gold_loan_description").optional().notEmpty().withMessage("Gold Loan Description cannot be empty"),
  check("scheme_title").optional().notEmpty().withMessage("Scheme Title cannot be empty"),
  check("faq_title").optional().notEmpty().withMessage("FAQ Title cannot be empty"),
];

const validateGoldLoanScheme = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateGoldLoanSchemeUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateSchemeDetails = [
  check("title").notEmpty().withMessage("Title is required"),
  check("value").notEmpty().withMessage("Value is required"),
  check("scheme_id").notEmpty().withMessage("Service is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateSchemeDetailsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("value").optional().notEmpty().withMessage("Value cannot be empty"),
  check("scheme_id").optional().notEmpty().withMessage("Service cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateGoldLoanFeature = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateGoldLoanFeatureUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateMsmeLoanContent = [
  check("meta_title").notEmpty().withMessage("Meta title is required"),

  check("meta_description").notEmpty().withMessage("Meta description is required"),

  check("meta_keywords").notEmpty().withMessage("Meta keywords are required"),

  check("title").notEmpty().withMessage("Title is required"),

  check("sub_title").notEmpty().withMessage("Sub-title is required"),

  check("description").notEmpty().withMessage("Description is required"),

  check("button_text").notEmpty().withMessage("Button text is required"),

  check("button_url").notEmpty().withMessage("Button URL is required"),

  check("our_offering_title").notEmpty().withMessage("Our offering title is required"),

  check("our_offering_description").notEmpty().withMessage("Our offering description is required"),

  check("why_msme_loan_title").notEmpty().withMessage("Why MSME loan title is required"),

  check("why_msme_loan_description").notEmpty().withMessage("Why MSME loan description is required"),

  check("who_do_serve_title").notEmpty().withMessage("Who do serve title is required"),

  check("about_msme_title").notEmpty().withMessage("About MSME title is required"),

  check("about_msme_description").notEmpty().withMessage("About MSME description is required"),

  check("msme_loan_overview_title").notEmpty().withMessage("MSME loan overview title is required"),

  check("msme_loan_overview_description").notEmpty().withMessage("MSME loan overview description is required"),
];

const validateMsmeLoanContentUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),

  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),

  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),

  check("title").optional().notEmpty().withMessage("Title cannot be empty"),

  check("sub_title").optional().notEmpty().withMessage("Sub-title cannot be empty"),

  check("description").optional().notEmpty().withMessage("Description cannot be empty"),

  check("button_text").optional().notEmpty().withMessage("Button text cannot be empty"),

  check("button_url").optional().notEmpty().withMessage("Button URL cannot be empty"),

  check("our_offering_title").optional().notEmpty().withMessage("Our offering title cannot be empty"),

  check("our_offering_description").optional().notEmpty().withMessage("Our offering description cannot be empty"),

  check("why_msme_loan_title").optional().notEmpty().withMessage("Why MSME loan title cannot be empty"),

  check("why_msme_loan_description").optional().notEmpty().withMessage("Why MSME loan description cannot be empty"),

  check("who_do_serve_title").optional().notEmpty().withMessage("Who do serve title cannot be empty"),

  check("about_msme_title").optional().notEmpty().withMessage("About MSME title cannot be empty"),

  check("about_msme_description").optional().notEmpty().withMessage("About MSME description cannot be empty"),

  check("msme_loan_overview_title").optional().notEmpty().withMessage("MSME loan overview title cannot be empty"),

  check("msme_loan_overview_description").optional().notEmpty().withMessage("MSME loan overview description cannot be empty"),
];

const validateMsmeOfferings = [
  check("title").notEmpty().withMessage("Title is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateMsmeOfferingsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateMsmeTargetedAudienceUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateMsmeTargetedAudience = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description cannot be empty"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateMsmeLoanSupportedIndustriesUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateMsmeLoanSupportedIndustries = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").notEmpty().withMessage("Description cannot be empty"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateCdLoanContentUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("page_title").optional().notEmpty().withMessage("Page Title cannot be empty"),
  check("loan_offer_title").optional().notEmpty().withMessage("Loan Offer Title cannot be empty"),
  check("loan_offer_description").optional().notEmpty().withMessage("Loan Offer Description cannot be empty"),
  check("loan_offer_button_text").optional().notEmpty().withMessage("Loan Offer Button Text cannot be empty"),
  check("loan_offer_button_link").optional().isURL().withMessage("Loan Offer Button Link must be a valid URL"),
  check("covered_products_section_title").optional().notEmpty().withMessage("Covered Products Section Title cannot be empty"),
  check("eligibility_criteria_title").optional().notEmpty().withMessage("Eligibility Criteria Title cannot be empty"),
  check("eligibility_criteria_description").optional().notEmpty().withMessage("Eligibility Criteria Description cannot be empty"),
  check("eligibility_criteria_note").optional().notEmpty().withMessage("Eligibility Criteria Note cannot be empty"),
  check("feature_title").optional().notEmpty().withMessage("Feature Title cannot be empty"),
];

const validateCdLoanProductsUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateCdLoanProducts = [
  check("title").notEmpty().withMessage("Title is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerContentsUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("page_title").optional().notEmpty().withMessage("Page Title cannot be empty"),
  check("find_job_title").optional().notEmpty().withMessage("Find Job Title cannot be empty"),
  check("find_job_button_name").optional().notEmpty().withMessage("Find Job Button Name cannot be empty"),
  check("find_job_button_link").optional().isURL().withMessage("Find Job Button Link must be a valid URL"),
  check("make_your_move_title").optional().notEmpty().withMessage("Make Your Move Title cannot be empty"),
  check("make_your_move_description").optional().notEmpty().withMessage("Make Your Move Description cannot be empty"),
  check("make_your_move_").optional().notEmpty().withMessage("Make Your Move cannot be empty"),
  check("gallery_title").optional().notEmpty().withMessage("Gallery Title cannot be empty"),
  check("gallery_sub_title").optional().notEmpty().withMessage("Gallery Sub Title cannot be empty"),
  check("gallery_description").optional().notEmpty().withMessage("Gallery Description cannot be empty"),
  check("gallery_button_text").optional().notEmpty().withMessage("Gallery Button Text cannot be empty"),
  check("gallery_button_link").optional().isURL().withMessage("Gallery Button Link must be a valid URL"),
  check("benefits_title").optional().notEmpty().withMessage("Benefits Title cannot be empty"),
  check("awards_title").optional().notEmpty().withMessage("Awards Title cannot be empty"),
  check("testimonial_title").optional().notEmpty().withMessage("Testimonial Title cannot be empty"),
  check("testimonial_description").optional().notEmpty().withMessage("Testimonial Description cannot be empty"),
  check("testimonial_button_name").optional().notEmpty().withMessage("Testimonial Button Name cannot be empty"),
  check("testimonial_button_link").optional().isURL().withMessage("Testimonial Button Link must be a valid URL"),
];

const validateCareerBannersUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateCareerBanners = [
  check("title").notEmpty().withMessage("Title is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateCareerStatesUpdate = [
  check("state_name").optional().notEmpty().withMessage("State Name is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerStates = [
  check("state_name").notEmpty().withMessage("State Name is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerLocationsUpdate = [
  check("location_name").optional().notEmpty().withMessage("Location Name is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerLocations = [
  check("location_name").notEmpty().withMessage("Location Name is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerRolesUpdate = [
  check("role_name").optional().notEmpty().withMessage("Role Name is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
];

const validateCareerRoles = [
  check("role_name").notEmpty().withMessage("Role Name is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
];

// const validateJobsUpdate = [
//   check("role_id").optional().isInt().withMessage("Role ID must be an integer"),
//   check("location_id").optional().isInt().withMessage("Location ID must be an integer"),
//   check("state_id").optional().isInt().withMessage("State ID must be an integer"),
//   check("short_description").optional().notEmpty().withMessage("Short description cannot be empty"),
//   check("detailed_description").optional().notEmpty().withMessage("Detailed description cannot be empty"),
//   check("experience").optional().isInt().withMessage("Experience must be an integer"),
//   check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
// ];

// const validateJobs = [
//   check("role_id").isInt().withMessage("Role ID must be an integer"),
//   check("location_id").isInt().withMessage("Location ID must be an integer"),
//   check("state_id").isInt().withMessage("State ID must be an integer"),
//   check("short_description").notEmpty().withMessage("Short description cannot be empty"),
//   check("detailed_description").notEmpty().withMessage("Detailed description cannot be empty"),
//   check("experience").isInt().withMessage("Experience must be an integer"),
//   check("is_active").isBoolean().withMessage("Is active must be a boolean"),
// ];

const validateJobsUpdate = [
  check("role_id").optional().isInt({ min: 1 }).withMessage("Role ID must be a positive integer"),
  check("location_id").optional().isInt({ min: 1 }).withMessage("Location ID must be a positive integer"),
  check("state_id").optional().isInt({ min: 1 }).withMessage("State ID must be a positive integer"),
  check("job_title").optional().trim().isLength({ max: 255 }).withMessage("Job title must not exceed 255 characters"),
  check("job_description").optional().trim().notEmpty().withMessage("Job description cannot be empty if provided"),
  check("key_responsibility").optional().trim().notEmpty().withMessage("Key responsibility cannot be empty if provided"),
  check("experience").optional().isInt({ min: 0 }).withMessage("Experience must be a non-negative integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("end_date").optional().isISO8601().withMessage("End date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)"),
  check("order").optional().isInt({ min: 0 }).withMessage("Order must be a non-negative integer"),
];

const validateJobs = [
  check("role_id").exists().isInt({ min: 1 }).withMessage("Role ID is required and must be a positive integer"),
  check("location_id").exists().isInt({ min: 1 }).withMessage("Location ID is required and must be a positive integer"),
  check("state_id").exists().isInt({ min: 1 }).withMessage("State ID is required and must be a positive integer"),
  check("job_title").optional().trim().isLength({ max: 255 }).withMessage("Job title must not exceed 255 characters"),
  check("job_description").exists().trim().notEmpty().withMessage("Job description is required and cannot be empty"),
  check("key_responsibility").exists().trim().notEmpty().withMessage("Key responsibility is required and cannot be empty"),
  check("experience").exists().isInt({ min: 0 }).withMessage("Experience is required and must be a non-negative integer"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("end_date").optional().isISO8601().withMessage("End date must be a valid ISO 8601 date (e.g., YYYY-MM-DD)"),
  check("order").optional().isInt({ min: 0 }).withMessage("Order must be a non-negative integer"),
];

const validateBlogPageContentUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("slider_title").optional().notEmpty().withMessage("Slider Title cannot be empty"),
  check("slider_button_text").optional().notEmpty().withMessage("Slider Button Text cannot be empty"),
  check("slider_button_link").optional().isURL().withMessage("Slider Button Link must be a valid URL"),
  check("all_blogs_title").optional().notEmpty().withMessage("All Blogs Title cannot be empty"),
];

const validateBlogsUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("other_meta_tags").optional().notEmpty().withMessage("Other Meta Tags cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("image_description").optional().notEmpty().withMessage("Image Description cannot be empty"),
  check("image_alt").optional().notEmpty().withMessage("Image Alt cannot be empty"),
  check("second_image_description").optional().notEmpty().withMessage("Second Image Description cannot be empty"),
  check("second_image_alt").optional().notEmpty().withMessage("Second Image Alt cannot be empty"),
  check("is_active").optional().notEmpty().withMessage("Is active is required"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
  check("posted_on").optional().notEmpty().withMessage("Posted On cannot be empty"),
];

const validateBlogs = [
  check("meta_title").notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("other_meta_tags").optional().notEmpty().withMessage("Other Meta Tags cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("title").notEmpty().withMessage("Title is required"),
  check("image_description").notEmpty().withMessage("Image Description cannot be empty"),
  check("image_alt").optional().notEmpty().withMessage("Image Alt cannot be empty"),
  check("second_image_description").notEmpty().withMessage("Second Image Description cannot be empty"),
  check("second_image_alt").optional().notEmpty().withMessage("Second Image Alt cannot be empty"),
  check("is_active").notEmpty().withMessage("Is active is required"),
  check("order").isInt().withMessage("Order must be an integer"),
  check("posted_on").optional().notEmpty().withMessage("Posted On cannot be empty"),
];

const validateGalleryPageContentItemUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),
];

const validateEventType = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").notEmpty().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_slider").optional().isBoolean().withMessage("is_slider must be a boolean"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateEventTypeUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_slider").optional().isBoolean().withMessage("is_slider must be a boolean"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateEventGallery = [
  check("order").notEmpty().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_video").optional().isBoolean().withMessage("is_video must be a boolean"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
  check("event_type_id")
    .notEmpty()
    .isInt({ gt: 0 })
    .withMessage("Event Type ID must be a positive integer")
    .custom(async (value) => {
      const eventType = await EventTypes.findByPk(value);
      if (!eventType) {
        throw new Error("Event Type ID does not exist");
      }
      return true;
    }),
];

const validateEventGalleryUpdate = [
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_video").optional().isBoolean().withMessage("is_video must be a boolean"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
  check("event_type_id")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Event Type ID must be a positive integer")
    .custom(async (value) => {
      if (value) {
        const eventType = await EventTypes.findByPk(value);
        if (!eventType) {
          throw new Error("Event Type ID does not exist");
        }
      }
      return true;
    }),
];

const validateAwardPageContentItemUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("all_awards_title").optional().notEmpty().withMessage("All awards title cannot be empty"),
];

const validateAward = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("year")
    .notEmpty()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}`),
  check("is_slide").optional().isBoolean().withMessage("is_slide must be a boolean"),
];

const validateAwardUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1900 and ${new Date().getFullYear()}`),
  check("is_slide").optional().isBoolean().withMessage("is_slide must be a boolean"),
];

const validateNewsPageContentItemUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("slider_title").optional().notEmpty().withMessage("Slider title cannot be empty"),
  check("slider_button_text").optional().notEmpty().withMessage("Slider button text cannot be empty"),
  check("slider_button_link").optional().notEmpty().withMessage("Slider button link cannot be empty"),
  check("all_news_title").optional().notEmpty().withMessage("All news title cannot be empty"),
];

const validateNews = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").notEmpty().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateNewsUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateEventPageContentItemUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("slider_title").optional().notEmpty().withMessage("Slider title cannot be empty"),
  check("slider_button_text").optional().notEmpty().withMessage("Slider button text cannot be empty"),
  check("slider_button_link").optional().notEmpty().withMessage("Slider button link cannot be empty"),
  check("all_events_title").optional().notEmpty().withMessage("All events title cannot be empty"),
];

const validateEvent = [
  check("title").notEmpty().withMessage("Title is required"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("image_alt").optional().notEmpty().withMessage("Image alt text cannot be empty"),
  check("order").notEmpty().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateEventUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("image_alt").optional().notEmpty().withMessage("Image alt text cannot be empty"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateInvestorsPageContentItemUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta keywords cannot be empty"),
  check("page_title").optional().notEmpty().withMessage("Page title cannot be empty"),
  check("annual_report_title").optional().notEmpty().withMessage("Annual report title cannot be empty"),
  check("annual_report_button_title").optional().notEmpty().withMessage("Annual report button title cannot be empty"),
  check("annual_returns_title").optional().notEmpty().withMessage("Annual returns title cannot be empty"),
  check("investors_contact_title").optional().notEmpty().withMessage("Investors contact title cannot be empty"),
  check("policies_title").optional().notEmpty().withMessage("Policies title cannot be empty"),
  check("stock_exchange_title").optional().notEmpty().withMessage("Stock exchange title cannot be empty"),
  check("corporate_governance_title").optional().notEmpty().withMessage("Corporate governance title cannot be empty"),
  check("disclosure_title").optional().notEmpty().withMessage("Disclosure title cannot be empty"),
  check("disclosure_file").optional().notEmpty().withMessage("Disclosure file path cannot be empty"),
];

const validateFiscalYear = [
  check("fiscal_year")
    .notEmpty()
    .withMessage("Fiscal year is required")
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Fiscal year must be in YYYY-YY format (e.g., 2024-25)"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateFiscalYearUpdate = [
  check("fiscal_year")
    .optional()
    .notEmpty()
    .withMessage("Fiscal year cannot be empty")
    .matches(/^\d{4}-\d{2}$/)
    .withMessage("Fiscal year must be in YYYY-YY format (e.g., 2024-25)"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateAnnualReport = [
  check("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1 })
    .withMessage("Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateAnnualReportUpdate = [
  check("year")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateAnnualReturns = [
  check("year")
    .notEmpty()
    .withMessage("Year is required")
    .isInt({ min: 1 })
    .withMessage("Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateAnnualReturnsUpdate = [
  check("year")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateInvestorsContact = [
  check("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  check("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  check("address").optional().isString().withMessage("Address must be a string"),
  check("phone")
    .optional()
    .matches(/^\+?[\d\s-]{7,}$/)
    .withMessage("Phone must be a valid phone number (e.g., +1-123-456-7890)"),
  check("email").optional().isEmail().withMessage("Email must be a valid email address"),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateInvestorsContactUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty").isString().withMessage("Title must be a string"),
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().withMessage("Name must be a string"),
  check("address").optional().isString().withMessage("Address must be a string"),
  check("phone")
    .optional()
    .matches(/^\+?[\d\s-]{7,}$/)
    .withMessage("Phone must be a valid phone number (e.g., +1-123-456-7890)"),
  check("email").optional().isEmail().withMessage("Email must be a valid email address"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validatePolicies = [
  check("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validatePoliciesUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty").isString().withMessage("Title must be a string"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateBoardMeetings = [
  check("fiscal_year")
    .notEmpty()
    .withMessage("Fiscal Year is required")
    .isInt({ min: 1 })
    .withMessage("Fiscal Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Fiscal Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("meeting_date")
    .notEmpty()
    .withMessage("Meeting Date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Meeting Date must be a valid date (YYYY-MM-DD)"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateBoardMeetingsUpdate = [
  check("fiscal_year")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Fiscal Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Fiscal Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("meeting_date").optional().isDate({ format: "YYYY-MM-DD" }).withMessage("Meeting Date must be a valid date (YYYY-MM-DD)"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateOtherIntimations = [
  check("fiscal_year")
    .notEmpty()
    .withMessage("Fiscal Year is required")
    .isInt({ min: 1 })
    .withMessage("Fiscal Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Fiscal Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("month_date")
    .notEmpty()
    .withMessage("Month Date is required")
    .isDate({ format: "YYYY-MM-DD" })
    .withMessage("Month Date must be a valid date (YYYY-MM-DD)"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateOtherIntimationsUpdate = [
  check("fiscal_year")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Fiscal Year must be a valid Fiscal Year ID")
    .custom(async (value) => {
      const fiscalYear = await models.FiscalYears.findByPk(value);
      if (!fiscalYear) {
        throw new Error("Fiscal Year must be a valid Fiscal Year ID");
      }
      return true;
    }),
  check("month_date").optional().isDate({ format: "YYYY-MM-DD" }).withMessage("Month Date must be a valid date (YYYY-MM-DD)"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrCommittee = [
  check("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  check("nature").notEmpty().withMessage("Nature is required").isString().withMessage("Nature must be a string"),
  check("designation").notEmpty().withMessage("Designation is required").isString().withMessage("Designation must be a string"),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrCommitteeUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().withMessage("Name must be a string"),
  check("nature").optional().notEmpty().withMessage("Nature cannot be empty").isString().withMessage("Nature must be a string"),
  check("designation")
    .optional()
    .notEmpty()
    .withMessage("Designation cannot be empty")
    .isString()
    .withMessage("Designation must be a string"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrReport = [
  check("fiscal_year").isInt({ min: 1 }).withMessage("Fiscal Year must be a valid Fiscal Year ID"),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrReportUpdate = [
  check("fiscal_year").optional().isInt({ min: 1 }).withMessage("Fiscal Year must be a valid Fiscal Year ID"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrActionPlan = [
  check("fiscal_year").isInt({ min: 1 }).withMessage("Fiscal Year must be a valid Fiscal Year ID"),
  check("order").notEmpty().withMessage("Order is required").isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCsrActionPlanUpdate = [
  check("fiscal_year").optional().isInt({ min: 1 }).withMessage("Fiscal Year must be a valid Fiscal Year ID"),
  check("order").optional().isInt({ gt: 0 }).withMessage("Order must be a positive integer"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateTestimonialPageContents = [
  check("meta_title").notEmpty().withMessage("Meta Title is required").isString().withMessage("Meta Title must be a string"),
  check("meta_description")
    .notEmpty()
    .withMessage("Meta Description is required")
    .isString()
    .withMessage("Meta Description must be a string"),
  check("meta_keywords")
    .notEmpty()
    .withMessage("Meta Keywords is required")
    .isString()
    .withMessage("Meta Keywords must be a string"),
  check("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
];

const validateTestimonial = [
  check("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  check("designation").notEmpty().withMessage("Designation is required").isString().withMessage("Designation must be a string"),
  check("order")
    .notEmpty()
    .withMessage("Order is required")
    .isString()
    .matches(/^\d+$/)
    .withMessage("Order must be a numeric string"),
  check("type").notEmpty().withMessage("Type is required").isIn(["video", "text"]).withMessage("Type must be 'video' or 'text'"),
  check("testimonial")
    .if(check("type").equals("text"))
    .notEmpty()
    .withMessage("Testimonial text is required for type 'text'")
    .isString()
    .withMessage("Testimonial must be a string"),
  check("video")
    .if(check("type").equals("video"))
    .custom((value, { req }) => {
      if (!req.files || !req.files.video) {
        throw new Error("Video file is required for type 'video'");
      }
      return true;
    }),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
  check("is_about").optional().isBoolean().withMessage("is_about must be a boolean"),
];

const validateTestimonialUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().withMessage("Name must be a string"),
  check("designation")
    .optional()
    .notEmpty()
    .withMessage("Designation cannot be empty")
    .isString()
    .withMessage("Designation must be a string"),
  check("order")
    .optional()
    .notEmpty()
    .withMessage("Order cannot be empty")
    .isString()
    .matches(/^\d+$/)
    .withMessage("Order must be a numeric string"),
  check("type")
    .optional()
    .notEmpty()
    .withMessage("Type cannot be empty")
    .isIn(["video", "text"])
    .withMessage("Type must be 'video' or 'text'"),
  check("testimonial")
    .optional()
    .if(check("type").equals("text"))
    .notEmpty()
    .withMessage("Testimonial text is required for type 'text'")
    .isString()
    .withMessage("Testimonial must be a string"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
  check("is_about").optional().isBoolean().withMessage("is_about must be a boolean"),
];

const validateBranchLocatorPageContents = [
  check("meta_title").notEmpty().withMessage("Meta Title is required").isString().withMessage("Meta Title must be a string"),
  check("meta_description")
    .notEmpty()
    .withMessage("Meta Description is required")
    .isString()
    .withMessage("Meta Description must be a string"),
  check("meta_keywords")
    .notEmpty()
    .withMessage("Meta Keywords is required")
    .isString()
    .withMessage("Meta Keywords must be a string"),
  check("title").notEmpty().withMessage("Title is required").isString().withMessage("Title must be a string"),
  check("description").notEmpty().withMessage("Description is required").isString().withMessage("Description must be a string"),
];

const validateBranch = [
  check("name").notEmpty().withMessage("Name is required").isString().withMessage("Name must be a string"),
  check("state").notEmpty().withMessage("State is required").isString().withMessage("State must be a string"),
  check("district").notEmpty().withMessage("District is required").isString().withMessage("District must be a string"),
  check("location").notEmpty().withMessage("Location is required").isString().withMessage("Location must be a string"),
  check("address").notEmpty().withMessage("Address is required").isString().withMessage("Address must be a string"),
  check("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  check("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
  check("phone_no")
    .optional()
    .matches(/^\d{2,4}-\d{6,8}$/)
    .withMessage("Phone number must be in format 'XXX-XXXXXX' or similar"),
  check("mobile_no")
    .optional()
    .matches(/^\+?\d{10,12}$/)
    .withMessage("Mobile number must be 10-12 digits, optionally starting with '+'"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateBranchUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty").isString().withMessage("Name must be a string"),
  check("state").optional().notEmpty().withMessage("State cannot be empty").isString().withMessage("State must be a string"),
  check("district")
    .optional()
    .notEmpty()
    .withMessage("District cannot be empty")
    .isString()
    .withMessage("District must be a string"),
  check("location")
    .optional()
    .notEmpty()
    .withMessage("Location cannot be empty")
    .isString()
    .withMessage("Location must be a string"),
  check("address")
    .optional()
    .notEmpty()
    .withMessage("Address cannot be empty")
    .isString()
    .withMessage("Address must be a string"),
  check("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90"),
  check("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180"),
  check("phone_no")
    .optional()
    .matches(/^\d{2,4}-\d{6,8}$/)
    .withMessage("Phone number must be in format 'XXX-XXXXXX' or similar"),
  check("mobile_no")
    .optional()
    .matches(/^\+?\d{10,12}$/)
    .withMessage("Mobile number must be 10-12 digits, optionally starting with '+'"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("is_active").optional().isBoolean().withMessage("is_active must be a boolean"),
];

const validateCorporateGovernance = [
  check("title").notEmpty().withMessage("Title is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateCorporateGovernanceUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateQuarterlyReportsUpdate = [
  check("year").optional().isInt().withMessage("Year ID must be an integer"),
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateQuarterlyReports = [
  check("year").isInt().withMessage("Year ID must be an integer"),
  check("title").notEmpty().withMessage("Title is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateCreditRatingsUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateCreditRatings = [
  check("title").notEmpty().withMessage("Title is required"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateIndelCaresUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  // check("event_date").optional().isISO8601().withMessage("Event date must be a valid date (YYYY-MM-DD)"),
  check("is_slider").optional().isBoolean().withMessage("Is slider must be a boolean"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("description").optional().notEmpty().withMessage("Description cannot be empty"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateIndelCares = [
  check("title").notEmpty().withMessage("Title is required"),
  // check("event_date").isISO8601().withMessage("Event date must be a valid date (YYYY-MM-DD)"),
  check("is_slider").isBoolean().withMessage("Is slider must be a boolean"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("description").notEmpty().withMessage("Description cannot be empty"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateIndelCaresContentUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("care_title").optional().notEmpty().withMessage("Care Title cannot be empty"),
];

const validateFooterContentUpdate = [
  check("meta_title").optional().notEmpty().withMessage("Meta Title cannot be empty"),
  check("meta_description").optional().notEmpty().withMessage("Meta Description cannot be empty"),
  check("meta_keywords").optional().notEmpty().withMessage("Meta Keywords cannot be empty"),
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("sub_title").optional().notEmpty().withMessage("Sub Title cannot be empty"),
  check("address").optional().notEmpty().withMessage("Address cannot be empty"),
  check("toll_free_num")
    .optional()
    .matches(/^\+?\d{10,15}$/)
    .withMessage("Toll Free Number must be a valid number with 10-15 digits"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("button_1_text").optional().notEmpty().withMessage("Button 1 Text cannot be empty"),
  check("button_1_link").optional().isURL().withMessage("Button 1 Link must be a valid URL"),
  check("button_2_text").optional().notEmpty().withMessage("Button 2 Text cannot be empty"),
  check("button_2_link").optional().isURL().withMessage("Button 2 Link must be a valid URL"),
  check("icon_section_link").optional().isURL().withMessage("Icon Section Link must be a valid URL"),
  check("icon_section_text").optional().notEmpty().withMessage("Icon Section Text cannot be empty"),
  check("social_media_text").optional().notEmpty().withMessage("Social Media Text cannot be empty"),
];

const validateSocialMediaIconsUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("link").optional().notEmpty().isURL().withMessage("Link must be a valid URL"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validateSocialMediaIcons = [
  check("title").notEmpty().withMessage("Title is required"),
  check("link").notEmpty().isURL().withMessage("Link must be a valid URL"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateServiceEnquiry = [
  check("name").notEmpty().withMessage("Name is required"),
  check("phone").notEmpty().withMessage("Phone is required"),
  check("service_types").notEmpty().withMessage("Service types is required"),
  check("enquiry_type").isIn(["gold_loan_calculator", "emi_calculator", "general"]).withMessage("Invalid enquiry type"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("enquiry_type_details").optional().isObject().withMessage("Enquiry type details must be an object"),
];

const validateServiceEnquiryUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
  check("service_types").optional().notEmpty().withMessage("Service types cannot be empty"),
  check("enquiry_type")
    .optional()
    .isIn(["gold_loan_calculator", "emi_calculator", "general"])
    .withMessage("Invalid enquiry type"),
  check("email").optional().isEmail().withMessage("Email must be valid"),
  check("enquiry_type_details").optional().isObject().withMessage("Enquiry type details must be an object"),
];

const validateServiceType = [
  check("type_name").notEmpty().withMessage("Type name is required"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateServiceTypeUpdate = [
  check("type_name").optional().notEmpty().withMessage("Type name cannot be empty"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateGoldCaratType = [
  check("name").notEmpty().withMessage("Name is required"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateGoldCaratTypeUpdate = [
  check("name").optional().notEmpty().withMessage("Name cannot be empty"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateGoldType = [
  check("gold_type_name").notEmpty().withMessage("Gold type name is required"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateGoldTypeUpdate = [
  check("gold_type_name").optional().notEmpty().withMessage("Gold type name cannot be empty"),
  check("description").optional().isString().withMessage("Description must be a string"),
];

const validateNewsLetterSubs = [check("email").notEmpty().isEmail().withMessage("Valid email is required")];

const validateHeaderContentsUpdate = [
  check("quick_pay_title").optional().notEmpty().withMessage("Quick Pay Title cannot be empty"),
  check("button_1_text").optional().notEmpty().withMessage("Button 1 Text cannot be empty"),
  check("button_1_inner_title").optional().notEmpty().withMessage("Button 1 Inner Title cannot be empty"),
  check("button_2_link").optional().isURL().withMessage("Button 2 Link must be a valid URL"),
  check("button_2_text").optional().notEmpty().withMessage("Button 2 Text cannot be empty"),
  // check("apple_dowload_icon").optional().isURL().withMessage("Apple Download Icon must be a valid URL"),
  // check("andrioid_download_icon").optional().isURL().withMessage("Android Download Icon must be a valid URL"),
  check("apple_dowload_link").optional().isURL().withMessage("Apple Download Link must be a valid URL"),
  check("andrioid_download_link").optional().isURL().withMessage("Android Download Link must be a valid URL"),
];

const validatePaymentModesUpdate = [
  check("title").optional().notEmpty().withMessage("Title is required"),
  check("link").optional().notEmpty().isURL().withMessage("Link must be a valid URL"),
  check("is_active").optional().isBoolean().withMessage("Is active must be a boolean"),
  check("order").optional().isInt().withMessage("Order must be an integer"),
];

const validatePaymentModes = [
  check("title").notEmpty().withMessage("Title is required"),
  check("link").notEmpty().isURL().withMessage("Link must be a valid URL"),
  check("is_active").isBoolean().withMessage("Is active must be a boolean"),
  check("order").isInt().withMessage("Order must be an integer"),
];

module.exports = {
  validatePaymentModes,
  validatePaymentModesUpdate,
  validateHeaderContentsUpdate,
  validateNewsLetterSubs,
  validateSocialMediaIcons,
  validateSocialMediaIconsUpdate,
  validateFooterContentUpdate,
  validateIndelCaresUpdate,
  validateIndelCaresContentUpdate,
  validateIndelCares,
  validateCreditRatings,
  validateCreditRatingsUpdate,
  validateQuarterlyReports,
  validateQuarterlyReportsUpdate,
  validateAuth,
  validateHeroBanner,
  validateHeroBannerUpdate,
  validateHomeStatistics,
  validateHomeStatisticsUpdate,
  validateHomePageContentUpdate,
  validateHomeLoanStep,
  validateHomeLoanStepUpdate,
  validateFaq,
  validateFaqUpdate,
  validateHomeSmartDeals,
  validateHomeSmartDealsUpdate,
  validateAboutBanner,
  validateAboutBannerUpdate,
  validateAboutLifeAtIndel,
  validateAboutLifeAtIndelUpdate,
  validateAboutQuickLinks,
  validateAboutQuickLinksUpdate,
  validateAboutPageContentUpdate,
  validateAboutMessageFromTeam,
  validateAboutMessageFromTeamUpdate,
  validateAboutStatsItem,
  validateAboutStatsItemUpdate,
  validateManagementTeam,
  validateManagementTeamUpdate,
  validateMngmtTeamContentItemUpdate,
  validateDeptPartners,
  validateDeptPartnersUpdate,
  validateDeptPartnersContent,
  validateDeptPartnersContentUpdate,
  validateContactContent,
  validateContactContentUpdate,
  validateContactOffices,
  validateContactOfficesUpdate,
  validateAboutAccolades,
  validateAboutAccoladesUpdate,
  validateHistoryPageContent,
  validateHistoryPageContentUpdate,
  validateHistoryImages,
  validateHistoryImagesUpdate,
  validateHistoryInceptionsYears,
  validateHistoryInceptionsYearsUpdate,
  validateIndelValue,
  validateIndelValueUpdate,
  validateDifferentShadesValue,
  validateDifferentShadesValueUpdate,
  validateServicesPageContentUpdate,
  validateServiceBenefits,
  validateServiceBenefitsUpdate,
  validateGoldLoanContentUpdate,
  validateGoldLoanScheme,
  validateGoldLoanSchemeUpdate,
  validateSchemeDetails,
  validateSchemeDetailsUpdate,
  validateGoldLoanFeature,
  validateGoldLoanFeatureUpdate,
  validateMsmeLoanContent,
  validateMsmeLoanContentUpdate,
  validateMsmeOfferings,
  validateMsmeOfferingsUpdate,
  validateMsmeTargetedAudience,
  validateMsmeTargetedAudienceUpdate,
  validateMsmeLoanSupportedIndustries,
  validateMsmeLoanSupportedIndustriesUpdate,
  validateCdLoanContentUpdate,
  validateCdLoanProducts,
  validateCdLoanProductsUpdate,
  validateCareerContentsUpdate,
  validateCareerBanners,
  validateCareerBannersUpdate,
  validateCareerStates,
  validateCareerStatesUpdate,
  validateCareerLocations,
  validateCareerLocationsUpdate,
  validateCareerRoles,
  validateCareerRolesUpdate,
  validateJobs,
  validateJobsUpdate,
  validateBlogPageContentUpdate,
  validateBlogs,
  validateBlogsUpdate,
  generateStringValidators,
  validateGalleryPageContentItemUpdate,
  validateEventType,
  validateEventTypeUpdate,
  validateEventGallery,
  validateEventGalleryUpdate,
  validateAwardPageContentItemUpdate,
  validateAward,
  validateAwardUpdate,
  validateNewsPageContentItemUpdate,
  validateNews,
  validateNewsUpdate,
  validateEventPageContentItemUpdate,
  validateEvent,
  validateEventUpdate,
  validateNews,
  validateNewsUpdate,
  validateInvestorsPageContentItemUpdate,
  validateFiscalYear,
  validateFiscalYearUpdate,
  validateAnnualReport,
  validateAnnualReportUpdate,
  validateAnnualReturns,
  validateAnnualReturnsUpdate,
  validateInvestorsContact,
  validateInvestorsContactUpdate,
  validatePolicies,
  validatePoliciesUpdate,
  validateBoardMeetings,
  validateBoardMeetingsUpdate,
  validateOtherIntimations,
  validateOtherIntimationsUpdate,
  validateCsrCommittee,
  validateCsrCommitteeUpdate,
  validateCsrReport,
  validateCsrReportUpdate,
  validateCsrActionPlan,
  validateCsrActionPlanUpdate,
  validateTestimonialPageContents,
  validateTestimonial,
  validateTestimonialUpdate,
  validateBranchLocatorPageContents,
  validateBranch,
  validateBranchUpdate,
  validateCorporateGovernance,
  validateCorporateGovernanceUpdate,
  validateServiceEnquiry,
  validateServiceEnquiryUpdate,
  validateServiceType,
  validateServiceTypeUpdate,
  validateGoldCaratType,
  validateGoldCaratTypeUpdate,
  validateGoldType,
  validateGoldTypeUpdate,
};
