document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const search = document.getElementById("search");

  // Load projects
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

  search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".project").forEach((proj) => {
      const title = proj.querySelector("h3").textContent.toLowerCase();
      proj.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

// ✅ Cashfree Payment Logic
async function buyNow(amount) {
  try {
    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    console.log("💰 Cashfree Response:", data);

    if (data.payment_session_id) {
      const checkoutUrl = `https://sandbox.cashfree.com/pg/view/sessions/checkout/web/${data.payment_session_id}`;
      window.location.href = checkoutUrl;
    } else {
      alert("❌ Payment failed to start. Please try again later!");
    }
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Something went wrong. Please try again later!");
  }
}
