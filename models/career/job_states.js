const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JobStates = sequelize.define(
    "JobStates",
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
      state_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "states",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "job_states",
      timestamps: false, // This is a join table, no need for timestamps
    }
  );

  JobStates.associate = (models) => {
    JobStates.belongsTo(models.CareerJobs, { foreignKey: "job_id" });
    JobStates.belongsTo(models.CareerStates, { foreignKey: "state_id" });
  };

  return JobStates;
};