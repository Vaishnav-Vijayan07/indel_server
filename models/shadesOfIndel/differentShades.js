const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DifferentShades = sequelize.define(
    "DifferentShades",
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
      banner_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      banner_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      brand_icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      brand_icon_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paragraph_1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paragraph_2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "different_shades",
      timestamps: true,
    }
  );

  return DifferentShades;
};
