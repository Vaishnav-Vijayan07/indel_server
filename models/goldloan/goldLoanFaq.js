const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldLoanFaqs = sequelize.define(
    "GoldLoanFaqs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "gold_loan_faqs",
      timestamps: true,
    }
  );

  return GoldLoanFaqs;
};