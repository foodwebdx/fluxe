const validateUserData = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const errors = [];

  if (!username || username.trim().length === 0) {
    errors.push('Username is required');
  }

  if (username && username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (password && password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!firstName || firstName.trim().length === 0) {
    errors.push('First name is required');
  }

  if (!lastName || lastName.trim().length === 0) {
    errors.push('Last name is required');
  }

  if (req.body.role && !['admin', 'editor', 'author'].includes(req.body.role)) {
    errors.push('Role must be one of: admin, editor, author');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateUserData
};
