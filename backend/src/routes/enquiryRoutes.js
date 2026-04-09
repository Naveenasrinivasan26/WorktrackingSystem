const express = require("express");
const { submitEnquiry, getEnquiryStatus } = require("../controllers/enquiryController");
const validateRequest = require("../middlewares/validateRequest");
const { submitEnquiryValidator } = require("../validators/enquiryValidators");

const router = express.Router();

router.post("/submit", submitEnquiryValidator, validateRequest, submitEnquiry);
router.get("/status/:email", getEnquiryStatus);

module.exports = router;
