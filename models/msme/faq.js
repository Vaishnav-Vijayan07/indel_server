const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MsmeLoanFaq = sequelize.define(
    "MsmeLoanFaq",
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
      tableName: "msme_loan_faqs",
      timestamps: true,
    }
  );

  return MsmeLoanFaq;
};
