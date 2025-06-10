const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JobApplications = sequelize.define(
    "JobApplications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "jobs",
          key: "id",
        },
      },
      applicant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "applicants",
          key: "id",
        },
      },
      status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "application_statuses",
          key: "id",
        },
      },
      application_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "job_applications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  JobApplications.associate = (models) => {
    JobApplications.belongsTo(models.CareerJobs, {
      foreignKey: "job_id",
      as: "job",
    });
    JobApplications.belongsTo(models.Applicants, {
      foreignKey: "applicant_id",
      as: "applicant",
    });
    JobApplications.belongsTo(models.ApplicationStatus, {
      foreignKey: "status_id",
      as: "status",
    });
  };

  return JobApplications;
};
