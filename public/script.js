// ✅ ProjexHub Frontend + Cashfree Integration

document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const searchInput = document.getElementById("search");

  // 🧩 Fetch projects from backend
  async function loadProjects() {
    const res = await fetch("/projects");
    const data = await res.json();
    displayProjects(data);
  }

  // 🧩 Display projects
  function displayProjects(projects) {
    projectList.innerHTML = "";
    projects.forEach((p, index) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${p.image}" alt="${p.projectName}">
        <h3>${p.projectName}</h3>
        <p>${p.description}</p>
        <p><strong>Price:</strong> ₹${p.price}</p>
        <button class="buy-btn" data-price="${p.price}">Buy Now</button>
      `;
      projectList.appendChild(card);
    });

    attachBuyListeners();
  }

  // 🧩 Add Cashfree Payment logic
  function attachBuyListeners() {
    const buttons = document.querySelectorAll(".buy-btn");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const amount = btn.getAttribute("data-price") || 100;

        try {
          const res = await fetch("/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
          });

          if (!res.ok) throw new Error("❌ Failed to create order");

          const data = await res.json();
          console.log("✅ Cashfree Order:", data);

          if (data.payment_link) {
            window.location.href = data.payment_link;
          } else {
            alert("❌ Payment link not received.");
          }
        } catch (err) {
          console.error("❌ Payment Error:", err);
          alert("❌ Payment failed to start. Try again!");
        }
      });
    });
  }

  // 🧩 Search Function
  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    const res = await fetch("/projects");
    const data = await res.json();
    const filtered = data.filter(p =>
      p.projectName.toLowerCase().includes(query)
    );
    displayProjects(filtered);
  });

  // Initial Load
  loadProjects();
});
