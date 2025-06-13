const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CdLoanContent = sequelize.define(
    "CdLoanContent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loan_offer_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loan_offer_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      loan_offer_button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      loan_offer_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      covered_products_section_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      covered_products_section_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      covered_products_section_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eligibility_criteria_icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eligibility_criteria_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eligibility_criteria_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      eligibility_criteria_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      eligibility_criteria_note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feature_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feature_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feature_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "cd_loan_content",
      timestamps: true,
    }
  );

  return CdLoanContent;
};
