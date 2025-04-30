const { models } = require("../models/index");

const AboutPageContent = models.AboutPageContent;

const initAboutPageContent = async () => {
  try {
    const existingContent = await AboutPageContent.findOne();

    if (existingContent) {
      console.log("About Page Content already exists");
      return;
    }

    await AboutPageContent.create({
      overview_super_title: "Who We Are",
      overview_title: "Empowering Financial Futures",
      overview_sub_title: "A quick look into our values and goals.",
      overview_description: "We are committed to providing trustworthy financial services.",

      service_title: "Our Services",
      service_sub_title: "What We Offer",
      service_description: "We offer a wide range of services tailored for your financial growth.",

      achievements_title: "Our Achievements",

      investors_title: "For Investors",
      investors_button_title: "Become an Investor",
      investors_button_link: "/investors",

      investors_card1_title: "Growth",
      investors_card1_sub_title: "Steady and Reliable",

      investors_card2_title: "Trust",
      investors_card2_sub_title: "Built Over Time",

      investors_card3_title: "Support",
      investors_card3_sub_title: "Always With You",

      life_at_indel_title: "Life at Indel",
      life_at_indel_description: "Discover what makes Indel a great place to work.",
      life_at_indel_button_text: "Join Us",
      life_at_indel_button_link: "/careers",
    });

    console.log("About Page Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize About Page Content:", error.message);
  }
};

module.exports = { initAboutPageContent };
