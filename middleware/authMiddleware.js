import jwt from "jsonwebtoken";
import "dotenv/config";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // We split the string by space to get just the token part ("Bearer" + " " + "<JWT_TOKEN>")
  // If authHeader is undefined, token becomes undefined
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Token Verification Failed:");
      console.log("--> Error Message:", err.message); // Will tell us "jwt malformed" or "invalid signature"
      console.log("--> Token Received:", token); // Check if it has extra quotes '"eyJ..."'
      return res.status(403).json({ error: "Invalid or Expired token" });
    }
    console.log(user);
    req.user = user;

    next();
  });
};
