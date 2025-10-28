document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const search = document.getElementById("search");

  // 🟢 Load all projects
  fetch("/projects")
    .then((res) => res.json())
    .then((projects) => {
      projectList.innerHTML = projects
        .map(
          (p, i) => `
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

  // 🟣 Search functionality
  search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".project").forEach((proj) => {
      const title = proj.querySelector("h3").textContent.toLowerCase();
      proj.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

// 🟠 Payment function
async function buyNow(amount) {
  try {
    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    console.log("💰 Cashfree Response:", data);

    if (data.payment_link) {
      // ✅ Redirect to Cashfree checkout
      window.location.href = data.payment_link;
    } else {
      alert("❌ Payment failed to start. Try again!");
    }
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Payment failed. Please try again later!");
  }
}
