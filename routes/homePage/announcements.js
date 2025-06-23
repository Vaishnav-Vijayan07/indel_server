// routes/announcementRoutes.js

const express = require("express");
const AnnouncementController = require("../../controllers/homePage/announcementController");

const router = express.Router();

// Create a new announcement
router.post("/", AnnouncementController.create);

// Get all announcements (optionally filtered by state_id)
router.get("/", AnnouncementController.getAll);

// Get a specific announcement by ID
// router.get("/:id", AnnouncementController.getById);

// Update an announcement by ID
router.put("/:id", AnnouncementController.update);

// Delete an announcement by ID
router.delete("/:id", AnnouncementController.delete);

module.exports = router;
