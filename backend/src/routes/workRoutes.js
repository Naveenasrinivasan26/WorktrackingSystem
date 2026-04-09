const express = require("express");
const {
  getEntries,
  createEntry,
  getEntry,
  updateEntry,
  deleteEntry,
} = require("../controllers/workController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { workEntryValidator } = require("../validators/workValidators");

const router = express.Router();

router.use(protect);
router.get("/entries", getEntries);
router.post("/entries", workEntryValidator, validateRequest, createEntry);
router.get("/entries/:id", getEntry);
router.put("/entries/:id", workEntryValidator, validateRequest, updateEntry);
router.delete("/entries/:id", deleteEntry);

module.exports = router;
