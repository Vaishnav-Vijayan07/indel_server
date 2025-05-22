const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const validateMiddleware = require("../../middlewares/validateMiddleware");
const CsrCommitteeController = require("../../controllers/investors/csrCommitteeController");
const { validateCsrCommittee, validateCsrCommitteeUpdate } = require("../../utils/validator");

router.get("/", CsrCommitteeController.getAll);
router.get("/:id", CsrCommitteeController.getById);

router.use(authMiddleware(["admin"]));
router.post("/", validateCsrCommittee, validateMiddleware, CsrCommitteeController.create);
router.put("/:id", validateCsrCommitteeUpdate, validateMiddleware, CsrCommitteeController.update);
router.delete("/:id", CsrCommitteeController.delete);

module.exports = router;
