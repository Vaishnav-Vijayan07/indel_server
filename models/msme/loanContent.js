const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MsmeLoanContent = sequelize.define(
    "MsmeLoanContent",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      button_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_offering_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      our_offering_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      why_msme_loan_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      why_msme_loan_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      who_do_serve_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_msme_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_msme_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      msme_loan_overview_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      msme_loan_overview_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "msme_loan_content",
      timestamps: true,
    }
  );

  return MsmeLoanContent;
};
