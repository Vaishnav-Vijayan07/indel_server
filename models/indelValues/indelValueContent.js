const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const IndelValueContent = sequelize.define(
    "IndelValueContent",
    {
      page_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      approach_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "indel_value_content",
      timestamps: true,
    }
  );

  return IndelValueContent;
};
