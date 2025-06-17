const { models } = require("../models/index");

const LoanAgainstPropertyContent = models.LoanAgainstPropertyContent;

const initLoanAgainstPropertyContent = async () => {
  try {
    const existingContent = await LoanAgainstPropertyContent.findOne();

    if (existingContent) {
      console.log("Loan Against Property Page Content already exists");
      return;
    }

    await LoanAgainstPropertyContent.create({
      meta_title: "Loan Against Property Services - Empowering Businesses",
      meta_description: "Explore Loan Against Property tailored for small and medium businesses to grow and succeed.",
      meta_keywords: "Loan Against Property, business loans, small enterprise, financial support",

      title: "Empowering Loan Against Property with the Right <span>Financial Support</span>",
      sub_title: "Tailored loan solutions for your business growth",
      description: "Our Loan Against Property offerings are designed to help you scale operations, manage working capital, and seize new opportunities.",

      button_text: "Apply Now",
      button_url: "https://example.com/loan-against-property/apply",

      our_offering_title: "What We Offer",
      our_offering_description: "Flexible loan amounts, competitive interest rates, and quick disbursement to meet your business needs.",

      why_loan_against_property_title: "Why Choose Our <span>Loan Against Property?</span>",
      why_loan_against_property_description: "We understand the unique challenges loan against property face and offer personalized support to fuel your journey.",
      why_loan_against_property_image: null,
      image_alt: "Why Choose Our Loan Against Property",

      who_do_serve_title: "Who Do We <span>Serve?</span>",
      about_loan_against_property_title: "About <span>Loan Against Properties</span>",
      about_loan_against_property_description: "Micro, Small, and Medium Enterprises are the backbone of our economy. Our loans are here to support their mission.",

      loan_against_property_overview_title: "Loan Against Property <span>Overview</span>",
      loan_against_property_overview_description: "Get a quick insight into eligibility, loan terms, and how we help businesses thrive with our offerings.",
    });

    console.log("Loan Against Property Content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Loan Against Property Content:", error.message);
  }
};

module.exports = { initLoanAgainstPropertyContent };
