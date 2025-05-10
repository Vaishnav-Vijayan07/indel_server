const { check } = require("express-validator");

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
  check("title2").notEmpty().withMessage("Title 2 is required"),
  check("button_text").notEmpty().withMessage("Button text is required"),
  check("button_link").notEmpty().withMessage("Button link is required"),
  check("location").notEmpty().withMessage("Location is required"),
  check("image_alt_text").notEmpty().withMessage("Alt text is required"),
];

const validateHeroBannerUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("title2").notEmpty().withMessage("Title 2 is required"),
  check("button_text").optional().notEmpty().withMessage("Button text cannot be empty"),
  check("button_link").optional().notEmpty().withMessage("Button link cannot be empty"),
  check("location").optional().notEmpty().withMessage("Location cannot be empty"),
  check("image_alt_text").notEmpty().withMessage("Alt text is required"),
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

module.exports = {
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
  generateStringValidators,
};
