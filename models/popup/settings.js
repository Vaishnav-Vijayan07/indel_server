const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PopupSettings = sequelize.define(
    "PopupSettings",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_popup_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      service_popup_status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      banner_popup_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_popup_appearence_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      banner_popup_disappear_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_popup_appearence_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_popup_disappear_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "popup_settings",
      timestamps: true,
    }
  );

  return PopupSettings;
};
