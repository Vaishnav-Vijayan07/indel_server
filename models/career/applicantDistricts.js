const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ApplicantDistricts = sequelize.define(
    "ApplicantDistricts",
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
      district_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "districts",
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
      tableName: "applicant_districts",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [
        {
          unique: true,
          fields: ["applicant_id", "district_id"],
        },
      ],
    }
  );

  ApplicantDistricts.associate = (models) => {
    ApplicantDistricts.belongsTo(models.Applicants, {
      foreignKey: "applicant_id",
      as: "applicant",
    });
    ApplicantDistricts.belongsTo(models.Districts, {
      foreignKey: "district_id",
      as: "district",
    });
  };

  return ApplicantDistricts;
};
