const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomePageContent = sequelize.define(
    "HomePageContent",
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
      other_meta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gold_rate_icon: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null since icon is uploaded later
      },
      gold_rate_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      announcement_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      about_super_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      about_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_button_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_button_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      step_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smart_deal_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      life_section_button_name_1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_button_link_1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_button_name_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_button_link_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_image1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_image2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_image3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      life_section_mob_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      awards_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updates_section_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      investment_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_button_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      investment_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      features_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      features_sub_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      features_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mobile_app_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_app_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ios_download_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      android_download_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_section_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_section_super_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_section_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_section_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "home_page_content",
      timestamps: true,
    }
  );

  return HomePageContent;
};
