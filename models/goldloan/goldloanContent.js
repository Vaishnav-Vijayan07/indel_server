const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanContent = sequelize.define(
    "GoldLoanContent",
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
        type: DataTypes.STRING,
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
      gold_rate_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      announcement_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_loan_step_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      identity_proof_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      identity_proof_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_proof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address_proof_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      steps_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_loan_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gold_loan_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      scheme_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "gold_loan_content",
      timestamps: true,
    }
  );

  return GoldLoanContent;
};
