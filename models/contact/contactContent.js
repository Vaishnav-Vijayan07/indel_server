const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactContent = sequelize.define(
    "ContactContent",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      help_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      toll_free_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      form_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      form_sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_locator_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branch_locator_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      faq_super_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      faq_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "contact_content",
      timestamps: true,
    }
  );

  return ContactContent;
};
