const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CsrActionPlan = sequelize.define(
    "CsrActionPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      fiscal_year: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      report: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "csr_action_plan",
      timestamps: true,
    }
  );

  return CsrActionPlan;
};
