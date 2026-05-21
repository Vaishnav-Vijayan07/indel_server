const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Policies = sequelize.define(
    "Policies",
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
      file: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "policy_categories",
          key: "id",
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "policies",
      timestamps: true,
    }
  );

    Policies.associate = (models) => {
        Policies.belongsTo(models.PolicyCategories, { foreignKey: "category_id", as: "policyCategory" });
    };

  return Policies;
};
