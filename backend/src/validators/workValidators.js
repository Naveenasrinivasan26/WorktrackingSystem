const { body } = require("express-validator");

const workEntryValidator = [
  body("project").notEmpty().withMessage("Project is required"),
  body("tasks").notEmpty().withMessage("Tasks description is required"),
  body("hoursSpent").isFloat({ gt: 0 }).withMessage("Hours must be a positive number"),
  body("date").isISO8601().withMessage("Date must be valid"),
];

module.exports = { workEntryValidator };
