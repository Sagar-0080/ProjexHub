// ✅ Cashfree Payment Integration (Frontend)

document.addEventListener("DOMContentLoaded", () => {
  const buyButtons = document.querySelectorAll(".buy-btn");

  buyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const price = button.getAttribute("data-price") || 100;

      try {
        const response = await fetch("/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: price }),
        });

        if (!response.ok) {
          throw new Error("Failed to create Cashfree order");
        }

        const data = await response.json();
        console.log("✅ Cashfree Response:", data);

        // ✅ Redirect to Cashfree payment page (sandbox)
        if (data.payment_link) {
          window.location.href = data.payment_link;
        } else {
          alert("❌ Payment link missing. Try again!");
        }

      } catch (error) {
        console.error("❌ Payment Error:", error);
        alert("❌ Payment failed to start. Try again!");
      }
    });
  });
});
