const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const FooterContent = sequelize.define(
    "FooterContent",
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
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      news_letter_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toll_free_num: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_1_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_1_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_2_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_2_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_section_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_section_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      social_media_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "footer_content",
      timestamps: true,
    }
  );

  return FooterContent;
};
