const { models } = require("../models/index");

const HomePageContent = models.HomePageContent;

const initHomePageContent = async () => {
  try {
    const existingContent = await HomePageContent.findOne();

    if (existingContent) {
      console.log("Home Page Content already exists");
      return;
    }

    await HomePageContent.create({
      gold_rate_icon: null, // Icon is uploaded later
      gold_rate_label: "Gold Rate",
      announcement_text: "Welcome to our platform!",
      about_super_title: "Our Mission",
      about_title: "About Us",
      about_sub_title: "Who We Are",
      about_description: "We are a leading platform for financial services.",
      about_image_url: null,
      about_button_name: "Learn More",
      about_button_url: "/about",
      step_title: "How It Works",
      branch_section_title: "Our Branches",
      branch_section_description: "Visit us at our multiple locations.",
      life_section_title: "Life at Our Company",
      life_section_description: "Join our vibrant community.",
      life_section_button_name_1: "Careers",
      life_section_button_link_1: "/careers",
      life_section_button_name_2: "Contact Us",
      life_section_button_link_2: "/contact",
      updates_section_title: "Latest Updates",
      investment_title: "Investment Opportunities",
      investment_description: "Explore our investment plans.",
      investment_image_url: null,
      investment_button_name: "Invest Now",
      investment_button_link: "/invest",
      features_title: "Our Features",
      features_sub_title: "Why Choose Us",
      features_description: "Discover our unique offerings.",
      mobile_app_image_url: null,
      ios_download_link: "https://apple.com/app-store",
      android_download_link: "https://play.google.com/store",
      faq_section_title: "Frequently Asked Questions",
      faq_section_super_title: "Got Questions?",
    });

    console.log("Home Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Home Page Content:", error.message);
  }
};

module.exports = { initHomePageContent };
