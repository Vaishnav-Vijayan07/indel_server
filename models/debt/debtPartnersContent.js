const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeptPartnersContent = sequelize.define(
    "DeptPartnersContent",
    {
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      super_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "debt_partners_content",
      timestamps: true,
    }
  );

  return DeptPartnersContent;
};
