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

  // 🔹 Search filter
  search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".project").forEach((proj) => {
      const title = proj.querySelector("h3").textContent.toLowerCase();
      proj.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

// 🟢 Payment Logic (Updated for Cashfree)
async function buyNow(amount) {
  try {
    console.log("🟡 Creating Cashfree order for ₹" + amount);

    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    console.log("💰 Cashfree Response:", data);

    if (data && data.payment_session_id) {
      // ✅ Correct latest Cashfree checkout URL
      const checkoutUrl = `https://sandbox.cashfree.com/pg/view/sessions/${data.payment_session_id}`;
      console.log("Redirecting to:", checkoutUrl);
      window.location.href = checkoutUrl;
    } else if (data.payment_link) {
      window.location.href = data.payment_link;
    } else {
      alert("❌ Payment could not start. Please try again later!");
    }
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Something went wrong while starting payment!");
  }
}
