const { models } = require("../models/index");

const GoldLoanContent = models.GoldloanContent;

const initGoldLoanContent = async () => {
  try {
    const existingContent = await GoldLoanContent.findOne();

    if (existingContent) {
      console.log("Gold Loan content already exists");
      return;
    }

    await GoldLoanContent.create({
      page_title: "Gold Loan Services",
      meta_title: "Gold Loan - Fast and Secure",
      meta_description: "Apply for a gold loan with competitive rates and quick processing.",
      meta_keywords: "gold loan, loan against gold, secure loan",
      gold_rate_text: "Current Gold Rate: Check with our branches",
      announcement_text: "Special offers on gold loans this month!",
      gold_loan_step_title: "How to Apply for a Gold Loan",
      description: "Get instant cash against your gold ornaments.",
      identity_proof_title: "Required Identity Proof",
      identity_proof_description: "Aadhaar Card, PAN Card, or Passport",
      address_proof: "Required Address Proof",
      address_proof_description: "Utility Bill, Aadhaar Card, or Rental Agreement",
      steps_image: "https://example.com/gold-loan-steps.jpg",
      gold_loan_title: "Gold Loan Benefits",
      gold_loan_description: "Flexible repayment options and competitive interest rates.",
      scheme_title: "Our Gold Loan Schemes",
      faq_title: "Frequently Asked Questions",
    });

    console.log("Gold Loan content initialized with default values");
  } catch (error) {
    console.error("Failed to initialize Gold Loan content:", error.message);
  }
};

module.exports = { initGoldLoanContent };
