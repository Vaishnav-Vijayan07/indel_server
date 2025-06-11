const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const MasterPolicies = sequelize.define(
        "MasterPolicies",
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
            type: {
                type: DataTypes.ENUM(
                    "privacy-policy",
                    "mobile-app-policy",
                    "fair-practice-code",
                    "terms-and-conditions",
                    "kyc-policy",
                ),
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
            content: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: "master_policies",
            timestamps: true,
        }
    );

    return MasterPolicies;
};