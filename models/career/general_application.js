const { DataTypes } = require("sequelize");

const GeneralApplications = (sequelize) => {
  const GeneralApplications = sequelize.define(
    "GeneralApplications",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "id",
        },
      },
      preferred_role: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "general_applications",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  GeneralApplications.associate = (models) => {
    GeneralApplications.belongsTo(models.Applicants, {
      foreignKey: "applicant_id",
      as: "applicant",
    });
    GeneralApplications.belongsTo(models.ApplicationStatus, {
      foreignKey: "status_id",
      as: "status",
    });
    GeneralApplications.belongsTo(models.CareerRoles, {
      foreignKey: "role_id",
      as: "role",
    });
  };

  return GeneralApplications;
};
module.exports = GeneralApplications;
