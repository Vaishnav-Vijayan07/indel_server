const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutBanner = sequelize.define(
    "AboutBanner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      super_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      banner_type: {
        type: DataTypes.ENUM,
        allowNull: true,
        values: ["mobile", "web"],
      },
      alt_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      tableName: "about_banners",
      timestamps: true,
    }
  );

  return AboutBanner;
};
