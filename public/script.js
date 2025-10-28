// Fetch and display projects
async function loadProjects() {
  const res = await fetch("/projects");
  const projects = await res.json();

  const projectList = document.getElementById("project-list");
  projectList.innerHTML = "";

  projects.forEach((p, index) => {
    const card = document.createElement("div");
    card.classList.add("project-card");
    card.innerHTML = `
      <img src="${p.image}" alt="${p.projectName}">
      <h3>${p.projectName}</h3>
      <p>${p.description}</p>
      <p><b>Price:</b> ₹${p.price}</p>
      <button class="buy-btn" data-amount="${p.price}" data-name="${p.projectName}">Buy Now</button>
    `;
    projectList.appendChild(card);
  });

  // Reattach buy button listeners
  attachBuyButtons();
}

// Attach payment buttons
function attachBuyButtons() {
  document.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const amount = btn.getAttribute("data-amount") || 100;

      try {
        const res = await fetch("/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });

        const data = await res.json();
        console.log("💰 Cashfree Response:", data);

        if (data && data.payment_link) {
          window.location.href = data.payment_link; // redirect to Cashfree
        } else {
          alert("❌ Payment failed to start. Try again!");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("⚠️ Something went wrong while creating order.");
      }
    });
  });
}

// Search filter
document.getElementById("search").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll(".project-card").forEach((card) => {
    const name = card.querySelector("h3").innerText.toLowerCase();
    card.style.display = name.includes(term) ? "block" : "none";
  });
});

// Load projects on page load
window.onload = loadProjects;
