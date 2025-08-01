const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoldCaratTypes = sequelize.define(
    "GoldCaratTypes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "gold_carat_types",
      timestamps: true,
    }
  );

  return GoldCaratTypes;
};
