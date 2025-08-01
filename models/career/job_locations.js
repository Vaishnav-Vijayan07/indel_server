const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JobLocations = sequelize.define(
    "JobLocations",
    {
      job_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "jobs",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      location_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "locations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "job_locations",
      timestamps: false, // This is a join table, no need for timestamps
    }
  );

  JobLocations.associate = (models) => {
    JobLocations.belongsTo(models.CareerJobs, { foreignKey: "job_id" });
    JobLocations.belongsTo(models.CareerLocations, { foreignKey: "location_id" });
  };

  return JobLocations;
};