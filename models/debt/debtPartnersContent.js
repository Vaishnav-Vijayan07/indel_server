const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DeptPartnersContent = sequelize.define(
    "DeptPartnersContent",
    {
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
