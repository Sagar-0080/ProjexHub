document.addEventListener("DOMContentLoaded", () => {
  const projectList = document.getElementById("project-list");
  const search = document.getElementById("search");

  // 🔹 Load all projects
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

  // 🔹 Search functionality
  search.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".project").forEach((proj) => {
      const title = proj.querySelector("h3").textContent.toLowerCase();
      proj.style.display = title.includes(query) ? "block" : "none";
    });
  });
});

// 🟢 Payment Logic (Fixed)
async function buyNow(amount) {
  try {
    const response = await fetch("/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();
    console.log("💰 Cashfree Response:", data);

    // ✅ Case 1: Cashfree gives payment_session_id (most common)
    if (data.payment_session_id) {
      const url = `https://sandbox.cashfree.com/pg/view/sessions/checkout/web/${data.payment_session_id}`;
      window.location.href = url;
      return;
    }

    // ✅ Case 2: Nested session ID (in data.data.payment_session_id)
    if (data.data && data.data.payment_session_id) {
      const url = `https://sandbox.cashfree.com/pg/view/sessions/checkout/web/${data.data.payment_session_id}`;
      window.location.href = url;
      return;
    }

    // ✅ Case 3: Direct payment link
    if (data.payment_link) {
      window.location.href = data.payment_link;
      return;
    }

    // ❌ If no valid link found
    alert("❌ Payment failed to start. Try again!");
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Payment failed. Please try again later!");
  }
}
