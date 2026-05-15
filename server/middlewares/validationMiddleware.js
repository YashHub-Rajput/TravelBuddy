// File: server/middlewares/validationMiddleware.js
const { validationResult } = require("express-validator");

/**
 * validate – Run after express-validator chains.
 * Returns 400 with structured error list if validation fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation error",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

module.exports = { validate };
