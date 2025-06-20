const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LoanAgainstPropertyFaq = sequelize.define(
    "LoanAgainstPropertyFaq",
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
      tableName: "loan_against_property_faqs",
      timestamps: true,
    }
  );

  return LoanAgainstPropertyFaq;
};
