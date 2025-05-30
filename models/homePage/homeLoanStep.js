const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeLoanStep = sequelize.define(
    "HomeLoanStep",
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
        allowNull: false,
      },
      icon_url: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null since icon is uploaded later
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "home_loan_steps",
      timestamps: true,
    }
  );

  return HomeLoanStep;
};
