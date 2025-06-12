const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactSubmissions = sequelize.define(
    "ContactSubmissions",
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
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subject: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      service_types: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "service_types",
          key: "id",
        },
      },
    },
    {
      tableName: "contact_submissions",
      timestamps: true,
    }
  );

  ContactSubmissions.associate = (models) => {
    ContactSubmissions.belongsTo(models.ServiceTypes, {
      foreignKey: "service_types",
      as: "service_type",
    });
  };

  return ContactSubmissions;
};
