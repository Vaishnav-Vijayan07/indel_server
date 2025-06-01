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
      alt_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    },
    {
      tableName: "about_banners",
      timestamps: true,
    }
  );

  return AboutBanner;
};
