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

// ✅ Cashfree Payment Logic (Final)
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

    // ✅ Correct checkout URL for Sandbox (V2)
    if (data.payment_session_id) {
      const checkoutUrl = `https://sandbox.cashfree.com/pg/view/sessions/checkout/web/${data.payment_session_id}`;
      console.log("Redirecting to:", checkoutUrl);
      window.location.href = checkoutUrl;
      return;
    }

    // Fallback: if payment link exists
    if (data.payment_link) {
      window.location.href = data.payment_link;
      return;
    }

    // ❌ No valid link
    alert("❌ Payment failed to start. Try again later!");
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Something went wrong. Please try again later!");
  }
}
