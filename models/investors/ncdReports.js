const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const NcdReports = sequelize.define(
        "NcdReports",
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
            file: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            tableName: "ncd_reports",
            timestamps: true,
        }
    );

    return NcdReports;
};