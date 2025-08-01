const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HeaderContents = sequelize.define(
    "HeaderContents",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_1_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_1_inner_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_2_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_2_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apple_dowload_icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      andrioid_download_icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apple_download_icon_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      andrioid_download_icon_mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      apple_dowload_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      andrioid_download_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "header_contents",
      timestamps: true,
    }
  );

  return HeaderContents;
};
