const mongoose = require('mongoose');

// validate(schema) -> checks req.body, replaces it with the cleaned data
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const first = result.error.issues[0];
    const field = first.path.join('.') || 'body';
    return res.status(400).json({ message: `Invalid input: ${field} - ${first.message}` });
  }
  req.body = result.data;
  next();
};

// validateId() -> rejects malformed Mongo ids (avoids 500 CastError)
const validateId = (param = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[param])) {
    return res.status(400).json({ message: 'Invalid id' });
  }
  next();
};

module.exports = { validate, validateId };
