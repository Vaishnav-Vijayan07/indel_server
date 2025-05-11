const { models } = require("../models/index");

const CdLoanContent = models.CdLoanContent;

const initCdLoanContent = async () => {
  try {
    const existingContent = await CdLoanContent.findOne();

    if (existingContent) {
      console.log("CD Loan content already exists");
      return;
    }

    await CdLoanContent.create({
      page_title: "CD Loan Services",
      meta_title: "CD Loan - Quick and Reliable",
      meta_description: "Explore our CD loan offerings with attractive terms and fast approval.",
      meta_keywords: "cd loan, loan against cd, quick loan",
      loan_offer_title: "Exclusive CD Loan Offers",
      loan_offer_description: "Avail loans against your certificate of deposit with ease.",
      loan_offer_button_text: "Apply Now",
      loan_offer_button_link: "https://example.com/apply",
      covered_products_section_title: "Products Covered Under CD Loan",
      covered_products_section_image: "https://example.com/covered-products.jpg",
      eligibility_criteria_icon: "https://example.com/eligibility-icon.png",
      eligibility_criteria_title: "Eligibility Criteria",
      eligibility_criteria_description: "Must hold a valid certificate of deposit with our institution.",
      eligibility_criteria_note: "Terms and conditions apply.",
      feature_title: "Key Features of CD Loan",
      feature_image: "https://example.com/feature-image.jpg",
    });

    console.log("CD Loan content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize CD Loan content:", error.message);
  }
};

module.exports = { initCdLoanContent };
