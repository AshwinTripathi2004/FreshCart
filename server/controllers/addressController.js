import Address from "../models/Address.js";

//Add Address: /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const { userId } = req;
    await Address.create({ ...address, userId });

    return res.json({
      success: true,
      message: "Address added successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
  try {
    const { userId } = req;
    const addresses = await Address.find({ userId });

    return res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};