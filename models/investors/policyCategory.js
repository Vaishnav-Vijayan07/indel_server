const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PolicyCategories = sequelize.define(
    "PolicyCategories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(15),
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
      tableName: "policy_categories",
      timestamps: true,
    }
  );

  PolicyCategories.associate = (models) => {
    PolicyCategories.hasMany(models.Policies, { foreignKey: "category_id", as: "policies" });
  };

  return PolicyCategories;
};