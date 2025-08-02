import jwt from "jsonwebtoken";

// TODO: fetch JWT_SECRET from .env
const JWT_SECRET = "mysecret";
const JWT_EXPIRY_OPTIONS = Object.freeze({
  expiresIn: "7 days",
});

const generateToken = (id) => {
  return jwt.sign({ userId: id }, JWT_SECRET, JWT_EXPIRY_OPTIONS);
};

export { generateToken as default };
