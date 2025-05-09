const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ShadesOfIndelContent = sequelize.define(
    "ShadesOfIndelContent",
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
      tableName: "shades_of_indel_content",
      timestamps: true,
    }
  );

  return ShadesOfIndelContent;
};
