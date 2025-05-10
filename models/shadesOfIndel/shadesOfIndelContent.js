const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ShadesOfIndelContent = sequelize.define(
    "ShadesOfIndelContent",
    {
      page_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
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
