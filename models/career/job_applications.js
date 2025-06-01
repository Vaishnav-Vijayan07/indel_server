const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const JobApplications = sequelize.define(
        "JobApplications",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            location: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "locations",
                    key: "id",
                },
            },
            referred_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            referral_code: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            age: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            preferred_role: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "roles",
                    key: "id",
                },
            },
            current_salary: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            expected_salary: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            resume: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            tableName: "job_applications",
            timestamps: true,
        }
    );

    JobApplications.associate = (models) => {
        JobApplications.belongsTo(models.CareerLocations, {
            foreignKey: "location",
            as: "job_location",
        });
        JobApplications.belongsTo(models.CareerRoles, {
            foreignKey: "preferred_role",
            as: "job_role",
        });
    };

    return JobApplications;
};