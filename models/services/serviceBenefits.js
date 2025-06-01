const { DataTypes } = require("sequelize");

// models/service_benefits.js
module.exports = (sequelize) => {
  const ServiceBenefit = sequelize.define(
    "ServiceBenefit",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "service_benefits",
      timestamps: true,
    }
  );

  ServiceBenefit.associate = (models) => {
    ServiceBenefit.belongsTo(models.Services, {
      foreignKey: "service_id",
      as: "service",
    });
  };

  return ServiceBenefit;
};
