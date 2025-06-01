const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutStatistics = sequelize.define(
    "AboutStatistics",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      suffix: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      tableName: "about_statistics",
      timestamps: true,
    }
  );

  return AboutStatistics;
};
