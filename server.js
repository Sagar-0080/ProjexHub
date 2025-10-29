// ✅ Cashfree Integration (Updated 2025)
app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount || 100;

    // 🟢 New Cashfree API endpoint (Checkout Orders)
    const url = "https://sandbox.cashfree.com/pg/orders";

    const response = await axios.post(
      url,
      {
        order_amount: amount,
        order_currency: "INR",
        order_note: "ProjexHub Payment",
        customer_details: {
          customer_id: "CUST001",
          customer_email: "test@cashfree.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: "https://projexhub-80m8.onrender.com/success", // optional
        },
      },
      {
        headers: {
          accept: "application/json",
          "x-api-version": "2023-08-01", // ✅ latest version
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Cashfree order created:", response.data);
    res.json(response.data); // send full response to frontend
  } catch (error) {
    console.error("❌ Cashfree Error:", error.response?.data || error.message);
    res.status(500).json({
      error: true,
      message: error.response?.data?.message || "Error creating payment order",
    });
  }
});
