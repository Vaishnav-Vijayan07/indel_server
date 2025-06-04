const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const IndelCaresContent = sequelize.define(
        "IndelCaresContent",
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
            events_title: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "indel_cares_content",
            timestamps: true,
        }
    );

    return IndelCaresContent;
};
