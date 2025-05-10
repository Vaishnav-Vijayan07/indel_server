const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldloanBannerFeatures = sequelize.define(
    "GoldloanBannerFeatures",
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
      icon: {
        type: DataTypes.STRING,
        allowNull: true, 
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "gold_loan_banner_features",
      timestamps: true,
    }
  );

  return GoldloanBannerFeatures;
};
