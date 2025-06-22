import User from "../models/User.js";

//update user cartData: /api/cart/update
export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const { userId } = req;

    await User.findByIdAndUpdate(userId, { cartItems });

    return res.json({
      success: true,
      message: "Cart Updated Successfully",
    });
  } catch (err) {
    console.error(err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};