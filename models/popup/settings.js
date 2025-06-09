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
      is_banner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      banner_popup_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_popup_appearence_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      service_popup_appearence_time: {
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
