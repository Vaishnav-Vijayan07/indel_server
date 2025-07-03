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
      branch_locator_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_locator_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_locator_icon_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_locator_icon_web: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toll_free_icon_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toll_free_icon_web: {
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
