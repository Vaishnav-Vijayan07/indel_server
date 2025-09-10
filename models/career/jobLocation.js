const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JobLocation = sequelize.define(
    "JobLocation",
    {
      job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "jobs", // refers to the table name of CareerJobs
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "locations", // refers to the table name of CareerLocations
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "job_locations", // The actual table name in the database
      timestamps: false, // Join tables typically don't need timestamps
    }
  );

  return JobLocation;
};
