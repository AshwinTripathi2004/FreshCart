import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Register User: /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists",
      });
    }

    //encrypt password from plain password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true, //Prevent JS to access cookie
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time(7 days)
    });

    return res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};

//Login User: /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    //compare and check given password and stored encrypted password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true, //Prevent JS to access cookie
      secure: process.env.NODE_ENV === "production", // use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time(7 days)
    });

    return res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};


//check Auth : /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const {userId} = req;
    const user = await User.findById(userId).select("-password"); //this select we use for exclude the password field in res

    return res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
}


//Logout user : /api/user/logout
export const logout = async(req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })

    return res.json({
      success: true,
      message: "Logged Out"
    })

  } catch (err) {
    console.err(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
}