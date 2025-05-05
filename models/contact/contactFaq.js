const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactFaq = sequelize.define(
    "ContactFaq",
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
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "contact_faqs",
      timestamps: true,
    }
  );

  return ContactFaq;
};
