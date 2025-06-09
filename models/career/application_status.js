const { DataTypes } = require("sequelize");

// ApplicationStatuses Model
module.exports = (sequelize) => {
  const ApplicationStatuses = sequelize.define(
    "ApplicationStatuses",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      status_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: "application_statuses",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  ApplicationStatuses.associate = (models) => {
    ApplicationStatuses.hasMany(models.JobApplications, {
      foreignKey: "status_id",
      as: "job_applications",
    });
  };

  return ApplicationStatuses;
};
