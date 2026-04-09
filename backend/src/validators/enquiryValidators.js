const { body } = require("express-validator");

const submitEnquiryValidator = [
  body("companyName").notEmpty().withMessage("Company name is required"),
  body("workEmail").isEmail().withMessage("Valid work email is required"),
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("teamSize").notEmpty().withMessage("Team size is required"),
];

module.exports = { submitEnquiryValidator };
