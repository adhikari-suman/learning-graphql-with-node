import bcrypt from "bcryptjs";

// TODO: salt rounds needs to be put in .env
const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  if (password.length < 8) {
    throw new Error("Password must be 8 characters or longer.");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export { hashPassword as default };
