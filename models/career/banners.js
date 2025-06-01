const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CareerBanners = sequelize.define(
    "CareerBanners",
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
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "career_banners",
      timestamps: true,
    }
  );

  return CareerBanners;
};
