const { models } = require("../models/index");

const MsmeLoanContent = models.MsmeLoanContent;

const initMsmeLoanContent = async () => {
  try {
    const existingContent = await MsmeLoanContent.findOne();

    if (existingContent) {
      console.log("MSME Loan Page Content already exists");
      return;
    }

    await MsmeLoanContent.create({
      meta_title: "MSME Loan Services - Empowering Businesses",
      meta_description: "Explore MSME loans tailored for small and medium businesses to grow and succeed.",
      meta_keywords: "MSME, business loans, small enterprise, financial support",

      title: "Empowering MSMEs with the Right Financial Support",
      sub_title: "Tailored loan solutions for your business growth",
      description: "Our MSME loan offerings are designed to help you scale operations, manage working capital, and seize new opportunities.",

      button_text: "Apply Now",
      button_url: "https://example.com/msme-loan/apply",

      our_offering_title: "What We Offer",
      our_offering_description: "Flexible loan amounts, competitive interest rates, and quick disbursement to meet your business needs.",

      why_msme_loan_title: "Why Choose Our MSME Loans?",
      why_msme_loan_description: "We understand the unique challenges MSMEs face and offer personalized support to fuel your journey.",
      why_msme_loan_image: null,
      image_alt: "Why Choose Our MSME Loans",

      who_do_serve_title: "Who Do We Serve?",
      about_msme_title: "About MSMEs",
      about_msme_description: "Micro, Small, and Medium Enterprises are the backbone of our economy. Our loans are here to support their mission.",

      msme_loan_overview_title: "MSME Loan Overview",
      msme_loan_overview_description: "Get a quick insight into eligibility, loan terms, and how we help businesses thrive with our offerings.",
    });

    console.log("MSME Loan Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize MSME Loan Content:", error.message);
  }
};

module.exports = { initMsmeLoanContent };
