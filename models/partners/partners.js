const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PartnersTypes = sequelize.define(
    "PartnersTypes",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "partners_types",
      timestamps: true,
    }
  );

  PartnersTypes.associate = (models) => {
    PartnersTypes.hasMany(models.Partners, { foreignKey: "partner_type_id" });
  };

  return PartnersTypes;
};
