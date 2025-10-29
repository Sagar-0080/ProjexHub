document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const search = document.getElementById("search");

  // 🔹 Load all projects
  fetch("/projects")
    .then((res) => res.json())
    .then((projects) => {
      projectList.innerHTML = projects
        .map(
          (p) => `
        <div class="project">
          <img src="${p.image}" alt="${p.projectName}" />
          <h3>${p.projectName}</h3>
          <p>${p.description}</p>
          <p><strong>₹${p.price}</strong></p>
          <button onclick="buyNow(${p.price})">Buy Now</button>
        </div>
      `
        )
        .join("");
    });

  // 🔹 Search projects
  search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".project").forEach((proj) => {
      const title = proj.querySelector("h3").textContent.toLowerCase();
      proj.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

// 🟢 Payment Logic (Cashfree)
async function buyNow(amount) {
  try {
    console.log("🟡 Creating Cashfree Order for amount:", amount);

    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    console.log("💰 Cashfree Response:", data);

    // ✅ If valid session or payment link exists
    if (data.payment_session_id) {
      // काही sandbox responses मध्ये "paymentpayment" येतो, तो कापूया
      let cleanSessionId = data.payment_session_id.replace("paymentpayment", "").trim();

      const checkoutUrl = `https://sandbox.cashfree.com/pg/view/sessions/checkout?payment_session_id=${cleanSessionId}`;
      console.log("Redirecting to:", checkoutUrl);
      window.location.href = checkoutUrl;
      return;
    } else if (data.payment_link) {
      console.log("Redirecting to payment link:", data.payment_link);
      window.location.href = data.payment_link;
      return;
    }

    // ❌ If something goes wrong
    alert("❌ Payment failed to start. Please try again later!");
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Something went wrong. Please try again later!");
  }
}
