const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanFeatures = sequelize.define(
    "GoldLoanFeatures",
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
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "gold_loan_features",
      timestamps: true,
    }
  );

  return GoldLoanFeatures;
};