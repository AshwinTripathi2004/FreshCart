import jwt from "jsonwebtoken";

//Login seller: /api/seller/login
export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });

      res.cookie("sellerToken", token, {
        httpOnly: true, //Prevent JS to access cookie
        secure: process.env.NODE_ENV === "production", // use secure cookies in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time(7 days)
      });

      return res.json({
        success: true,
        message: "Logged In",
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid credentails",
      });
    }
  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};


//check seller Auth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
  try {
    return res.json({
      success: true,
    });
  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};


//Logout seller : /api/seller/logout
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({
      success: true,
      message: "Logged Out",
    });
  } catch (err) {
    console.err(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};