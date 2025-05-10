const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Services = sequelize.define(
    "Services",
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
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "services",
      timestamps: true,
    }
  );

  Services.associate = (models) => {
    Services.hasMany(models.ServiceBenefit, {
      foreignKey: "service_id",
      as: "service_benefits",
    });
  };

  return Services;
};
