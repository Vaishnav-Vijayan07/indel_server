const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutPageContent = sequelize.define(
    "AboutPageContent",
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
      description: {
        type: DataTypes.TEXT,
      },
      overview_super_title: {
        type: DataTypes.STRING,
      },
      overview_title: {
        type: DataTypes.STRING,
      },
      overview_sub_title: {
        type: DataTypes.TEXT,
      },
      overview_description: {
        type: DataTypes.STRING,
      },
      service_title: {
        type: DataTypes.STRING,
      },
      service_sub_title: {
        type: DataTypes.STRING,
      },
      service_description: {
        type: DataTypes.TEXT,
      },
      achievements_title: {
        type: DataTypes.STRING,
      },
      investors_title: {
        type: DataTypes.STRING,
      },
      investors_button_title: {
        type: DataTypes.STRING,
      },
      investors_button_link: {
        type: DataTypes.STRING,
      },
      investors_image_1: {
        type: DataTypes.STRING,
      },
      investors_image_2: {
        type: DataTypes.STRING,
      },
      investors_card1_title: {
        type: DataTypes.STRING,
      },
      investors_card1_sub_title: {
        type: DataTypes.STRING,
      },
      investors_card2_title: {
        type: DataTypes.STRING,
      },
      investors_card2_sub_title: {
        type: DataTypes.STRING,
      },
      investors_card3_title: {
        type: DataTypes.STRING,
      },
      investors_card3_sub_title: {
        type: DataTypes.STRING,
      },
      life_at_indel_title: {
        type: DataTypes.STRING,
      },
      life_at_indel_description: {
        type: DataTypes.STRING,
      },
      life_at_indel_button_text: {
        type: DataTypes.STRING,
      },
      life_at_indel_button_link: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "about_page_content",
      timestamps: true,
    }
  );

  return AboutPageContent;
};
