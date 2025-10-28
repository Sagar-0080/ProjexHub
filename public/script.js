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

  // 🔹 Search
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
    console.log("💰 Cashfree Full Response:", data);

    // ✅ Step 1: Direct link from backend
    if (data.payment_link) {
      window.location.href = data.payment_link;
      return;
    }

    // ✅ Step 2: Check for nested or clean session ID
    let sessionId = data.payment_session_id;

    // काही वेळा Cashfree nested देतो (data.payment_session_id.payment_session_id)
    if (!sessionId && data.payment_session_id?.payment_session_id) {
      sessionId = data.payment_session_id.payment_session_id;
    }

    if (sessionId) {
      // काही वेळा extra text "payment" जोडलेले असते
      const cleanSession = sessionId.replace(/paymentpayment|payment$/g, "").trim();
      console.log("🧾 Clean Session ID:", cleanSession);

      const url = `https://sandbox.cashfree.com/pg/view/sessions/checkout/web/${cleanSession}`;
      console.log("Redirecting to Cashfree URL:", url);
      window.location.href = url;
      return;
    }

    // ❌ Fallback
    alert("❌ Payment failed to start. Try again!");
  } catch (err) {
    console.error("❌ Payment Error:", err);
    alert("❌ Payment failed. Please try again later!");
  }
}
