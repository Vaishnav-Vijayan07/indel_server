const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Partners = sequelize.define(
    "Partners",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      partner_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "partners_types",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo_alt: {
        type: DataTypes.STRING,
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
    },
    {
      tableName: "partners",
      timestamps: true,
    }
  );

  Partners.associate = (models) => {
    Partners.belongsTo(models.PartnersTypes, {
      foreignKey: "partner_type_id",
      as: "partnerType",
    });
  };

  return Partners;
};
