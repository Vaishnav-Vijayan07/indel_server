const { models } = require("../models/index");

const BlogPageContent = models.BlogPageContent;

const CSRPageContent = models.CsrPageContent;
const AboutPageContent = models.AboutPageContent;
const DebtPartnersContent = models.DebtPartnersContent;

const initBlogPageContent = async () => {
  try {
    const existingContent = await BlogPageContent.findOne();

    if (existingContent) {
      console.log("Blog Page content already exists");
      return;
    }

    await BlogPageContent.create({
      meta_title: "Our Blog - Insights and Updates",
      meta_description: "Stay updated with our latest blog posts on finance, careers, and more.",
      meta_keywords: "blog, finance, careers, updates, insights",
      title: "Our Blog",
      slider_title: "Explore Our Latest Insights",
      slider_button_text: "Read More",
      slider_button_link: "https://example.com/blogs",
      all_blogs_title: "All Blogs",
    });

    console.log("Blog Page content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Blog Page content:", error.message);
  }
};


const initCSRPageContent = async () => {
  try {
    const existingContent = await CSRPageContent.findOne();

    if (existingContent) {
      console.log("CSR Page content already exists");
      return;
    }

    await CSRPageContent.create({
      meta_title: "Our CSR - Insights and Updates",
      meta_description: "Stay updated with our latest CSR posts on finance, careers, and more.",
      meta_keywords: "CSR, finance, careers, updates, insights",
      title: "Our CSRs",
      slider_title: "Explore Our Latest Insights",
      slider_button_text: "Read More",
      slider_button_link: "https://example.com/blogs",
      all_csr_title: "All CSRs",
    });

    console.log("CSR Page content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize CSR Page content:", error.message);
  }
};


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

const initDebtPartnersContent = async () => {
  try {
    const existingContent = await DebtPartnersContent.findOne();

    if (existingContent) {
      console.log("Debt partners Content already exists");
      return;
    }

    await DebtPartnersContent.create({
      title: "This is new title",
      super_title: "This is new super title",
    });

    console.log("Debt partners content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize debt partners Content:", error.message);
  }
};

module.exports = { initBlogPageContent, initAboutPageContent, initDebtPartnersContent,initCSRPageContent };
