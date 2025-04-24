const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeFaq = sequelize.define(
    "HomeFaq",
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
      tableName: "home_faqs",
      timestamps: true,
    }
  );

  return HomeFaq;
};
