const jwt = require("jsonwebtoken");

const verifyUser = async (req, res, next) => {
  try {

    let token = req.cookies?.accessToken;
    if (!token && req.headers["authorization"]) {
      token = req.headers["authorization"].split(" ")[1];
    }
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }
    
    const decodedData = jwt.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );

    if (!decodedData) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = decodedData;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyUser;
