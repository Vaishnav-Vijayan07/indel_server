const { check } = require("express-validator");

const validateAboutLifeAtIndel = [check("order").isInt().withMessage("Order must be an integer")];

const validateAboutLifeAtIndelUpdate = [check("order").optional().isInt().withMessage("Order must be an integer")];

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
  check("location").notEmpty().withMessage("Location is required"),
];

const validateHeroBannerUpdate = [
  check("title").optional().notEmpty().withMessage("Title cannot be empty"),
  check("button_text").optional().notEmpty().withMessage("Button text cannot be empty"),
  check("button_link").optional().notEmpty().withMessage("Button link cannot be empty"),
  check("location").optional().notEmpty().withMessage("Location cannot be empty"),
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

const validateHomeFaq = [
  check("question").notEmpty().withMessage("Question is required"),
  check("answer").notEmpty().withMessage("Answer is required"),
  check("order").isInt().withMessage("Order must be an integer"),
];

const validateHomeFaqUpdate = [
  check("question").optional().notEmpty().withMessage("Question cannot be empty"),
  check("answer").optional().notEmpty().withMessage("Answer cannot be empty"),
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
  validateHomeFaq,
  validateHomeFaqUpdate,
  validateHomeSmartDeals,
  validateHomeSmartDealsUpdate,
  validateAboutBanner,
  validateAboutBannerUpdate,
  validateAboutLifeAtIndel,
  validateAboutLifeAtIndelUpdate,
};
