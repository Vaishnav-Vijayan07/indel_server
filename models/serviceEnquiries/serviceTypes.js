const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ServiceTypes = sequelize.define(
    "ServiceTypes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "service_types",
      timestamps: true,
    }
  );

  return ServiceTypes;
};
