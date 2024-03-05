import Razorpay from "razorpay";

let razorpayClientLive = null;
let razorpayClientTest = null;

function getRazorpayClient(env) {
  if (env === "live") {
    if (!razorpayClientLive)
      razorpayClientLive = new Razorpay({
        key_id: process.env.RAZORPAY_API_KEY_ID,
        key_secret: process.env.RAZORPAY_API_KEY_SECRET,
      });
    return razorpayClientLive;
  }

  if (env === "test") {
    if (!razorpayClientTest)
      razorpayClientTest = new Razorpay({
        key_id: process.env.RAZORPAY_TEST_API_KEY_ID,
        key_secret: process.env.RAZORPAY_TEST_API_KEY_SECRET,
      });
    return razorpayClientTest;
  }
}

export default getRazorpayClient;
