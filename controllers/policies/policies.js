const { models } = require("../../models/index");

const MasterPolicies = models.MasterPolicies;

class PoliciesController {

    // Create a new policy
    static async create(req, res, next) {
        try {
            const updateData = { ...req.body };

            const existingPolicy = await MasterPolicies.findOne({ where: { type: updateData.type } });

            let policy;
            let message;

            if (existingPolicy) {
                await existingPolicy.update(updateData);
                policy = existingPolicy;
                message = "Policy updated (existing type)";
            } else {
                policy = await MasterPolicies.create(updateData);
                message = "Policy created";
            }

            res.status(201).json({ success: true, data: policy, message });
        } catch (error) {
            next(error);
        }
    }


    static async getAll(req, res, next) {
        try {
            const policies = await MasterPolicies.findAll({
            });

            res.json({ success: true, data: policies });
        } catch (error) {
            next(error);
        }
    }

    // // Update a policy
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const policy = await MasterPolicies.findByPk(id);

            if (!policy) {
                return res.json({ success: false, message: "Policy not updated" });
            }

            let updateData = req.body;
            updateData = Object.fromEntries(
                Object.entries(updateData).filter(([_, value]) => value !== null)
            );

            await policy.update(updateData);

            res.json({ success: true, data: policy, message: "Policy updated" });
        } catch (error) {
            next(error);
        }
    }


    // // Delete a policy
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const policy = await MasterPolicies.findByPk(id);

            if (!policy) {
                res.json({ success: false, message: "Policy not updated" });
            }

            await policy.destroy();

            res.json({ success: true, message: "Policy deleted", data: id });
        } catch (error) {
            next(error);
        }
    }

    // Find a policy by its type
    static async findByType(req, res, next) {
        try {
            const { type } = req.query; // or req.query if you prefer query params
            const policy = await MasterPolicies.findOne({ where: { type } });

            if (!policy) {
                return res.status(404).json({ success: false, message: "Policy not found for the given type." });
            }

            res.json({ success: true, data: policy });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = PoliciesController;