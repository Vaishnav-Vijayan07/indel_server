const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Locations = sequelize.define(
    "Locations",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      location_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "states",
          key: "id",
        },
      },
      district_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "districts",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "locations",
      timestamps: true,
    }
  );

  Locations.associate = (models) => {
    Locations.hasMany(models.CareerJobs, {
      foreignKey: "location_id",
      as: "job_locations",
    });
  };

  Locations.associate = (models) => {
    Locations.hasMany(models.JobApplications, {
      foreignKey: "location",
      as: "job_applications",
    });
  };

  return Locations;
};
