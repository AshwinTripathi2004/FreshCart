import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";

//Plcae Order COD: /api/order/cod
export const placeOrderCOD = async (req, res) => {
  try {
    const { userId } = req;
    const { items, address } = req.body;

    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    //Calculate Amt using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    //Add tax charge (2 %)
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({
      success: true,
      message: "Order Placed Successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Plcae Order stripe: /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId } = req;
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid data",
      });
    }

    let productData = [];

    //Calculate Amt using items
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    //Add tax charge (2 %)
    amount += Math.floor(amount * 0.02);

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    //Stripe gateway initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    //create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Stipe webHooks to verify Payments Action: /stripe
export const stripeWebHooks = async (req, res) => {
  //Stripe gateway initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error(error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  //Handle the event
  switch (event.type) {
    case "payment_intent.succeeded": {
      console.log("payment_intent.payment_failed");
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;

      //Mark Payment as Paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });

      //Clear user cartData
      await User.findByIdAndUpdate(userId, {
        cartItems: {},
      });
      break;
    }

    case "payment_intent.payment_failed": {
      console.log("payment_intent.payment_failed");
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      //Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;

      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
      break;
  }

  return res.json({
    received: true,
  });
};

//Get Orders by User Id: /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    console.log("orders: ", orders);

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get All orders (for seller/admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
      
    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};