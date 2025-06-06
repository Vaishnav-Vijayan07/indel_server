const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HeroBanner = sequelize.define(
    "HeroBanner",
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
      button_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      button_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "hero_banners",
      timestamps: true,
    }
  );

  return HeroBanner;
};
