const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const CreditRatings = sequelize.define(
        "CreditRatings",
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
            tableName: "credit_ratings",
            timestamps: true,
        }
    );

    return CreditRatings;
};