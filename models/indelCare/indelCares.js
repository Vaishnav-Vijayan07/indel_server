const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const IndelCares = sequelize.define(
    "IndelCares",
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
      event_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_slider: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      show_on_home: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      slug: {
        type: DataTypes.STRING(255), // Max length for URL compatibility
        allowNull: true,
        validate: {
          notEmpty: true,
          is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // Kebab-case (e.g., my-blog-post)
        },
        comment: "URL-friendly identifier for the blog post",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "indel_cares",
      timestamps: true,
    }
  );

  return IndelCares;
};
