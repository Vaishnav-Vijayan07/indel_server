const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ApplicantLocations = sequelize.define(
    "ApplicantLocations",
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
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "applicant_locations",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["applicant_id", "location_id"],
        },
      ],
    }
  );

  ApplicantLocations.associate = (models) => {
    ApplicantLocations.belongsTo(models.Applicants, {
      foreignKey: "applicant_id",
      as: "applicant",
    });
    ApplicantLocations.belongsTo(models.CareerLocations, {
      foreignKey: "location_id",
      as: "location",
    });
  };

  return ApplicantLocations;
};

