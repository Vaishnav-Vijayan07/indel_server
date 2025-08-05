const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const Applicants = sequelize.define(
    "Applicants",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      current_location: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      preferred_location: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      notice_period: {
        type: DataTypes.ENUM,
        values: ["Less than 15 days", "15 to 30 days", "30 days", "60 to 90 days", "More than 90 days"],
        allowNull: true,
      },
      referred_employee_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      employee_referral_code: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      current_salary: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      expected_salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      file_uploaded_at: {
        type: DataTypes.DATE,
        allowNull: true, // Null if no resume
        defaultValue: null,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      tableName: "applicants",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  Applicants.associate = (models) => {
    Applicants.belongsTo(models.CareerLocations, {
      foreignKey: "preferred_location",
      as: "applicantLocation", // Updated alias
    });
  };

  return Applicants;
};
