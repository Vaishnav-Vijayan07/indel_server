const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanScheme = sequelize.define(
    "GoldLoanScheme",
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
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "gold_loan_scheme",
      timestamps: true,
    }
  );

  return GoldLoanScheme;
};