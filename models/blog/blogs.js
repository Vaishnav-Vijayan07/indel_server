const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Blogs = sequelize.define(
    "Blogs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: true,
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
      meta_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      other_meta_tags: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      second_image_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_slider: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      posted_on: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "blogs",
      timestamps: true,
    }
  );

  return Blogs;
};
