const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ServiceEnquiries = sequelize.define(
    "ServiceEnquiries",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subject: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      service_types: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "service_types",
          key: "id",
        },
      },
      enquiry_type: {
        type: DataTypes.ENUM("gold_loan_calculator", "emi_calculator", "general", "contact"),
        allowNull: false,
      },
      enquiry_type_details: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "service_enquiries",
      timestamps: true,
    }
  );

  ServiceEnquiries.associate = (models) => {
    ServiceEnquiries.belongsTo(models.ServiceTypes, {
      foreignKey: "service_types",
      as: "service_type",
    });
  };

  return ServiceEnquiries;
};
