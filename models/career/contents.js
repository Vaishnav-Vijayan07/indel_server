const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CareerContents = sequelize.define(
    "CareerContents",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      page_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      find_job_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      find_job_button_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      find_job_button_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_your_move_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      make_your_move_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_your_move_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      make_your_move_: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery_sub_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gallery_button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      gallery_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      benefits_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      awards_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      testimonial_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      testimonial_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      testimonial_button_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      testimonial_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "career_contents",
      timestamps: true,
    }
  );

  return CareerContents;
};
