const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EmployeeBenefits = sequelize.define(
    "EmployeeBenefits",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "employee_benefits",
      timestamps: true,
    }
  );

  return EmployeeBenefits;
};
