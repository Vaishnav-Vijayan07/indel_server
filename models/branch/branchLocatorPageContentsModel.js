const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BranchLocatorPageContents = sequelize.define(
    "BranchLocatorPageContents",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_meta_tags: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "branch_locator_page_contents",
      timestamps: true,
    }
  );

  return BranchLocatorPageContents;
};
