const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JobState = sequelize.define(
    "JobState",
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
      state_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "states", // refers to the table name of CareerStates
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      tableName: "job_states", // The actual table name in the database
      timestamps: false, // Join tables typically don't need timestamps
    }
  );

  return JobState;
};
