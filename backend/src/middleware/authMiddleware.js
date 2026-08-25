const validateRegister = (req) => {
  const {
    name,
    email,
    password,
  } = req.body;

  const errors = [];

  if (!name || !name.trim()) {
    errors.push("Name is required");
  }

  if (!email || !email.trim()) {
    errors.push("Email is required");
  }

  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.push("Invalid email format");
  }

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 8) {
    errors.push(
      "Password must be at least 8 characters"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegister,
};