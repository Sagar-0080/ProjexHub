const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Debug ENV variables (optional)
console.log("✅ ENV Loaded:", process.env.CASHFREE_APP_ID, process.env.CASHFREE_SECRET_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 🧩 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'image') cb(null, 'public/images');
    else cb(null, 'uploads');
  },
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 👨‍💼 Admin credentials
const adminUser = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'projexhub123'
};

// 🛠️ Routes
app.get('/admin/login', (req, res) => res.sendFile(__dirname + '/admin/login.html'));
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username && password === adminUser.password)
    res.redirect('/admin/upload');
  else res.send('Invalid credentials');
});

// Upload page
app.get('/admin/upload', (req, res) => res.sendFile(__dirname + '/admin/upload.html'));
app.post('/admin/upload', upload.fields([{ name: 'image' }, { name: 'file' }]), (req, res) => {
  const { projectName, description, price } = req.body;
  const image = '/images/' + req.files['image'][0].filename;
  const file = '/uploads/' + req.files['file'][0].filename;

  let data = [];
  if (fs.existsSync('data.json')) data = JSON.parse(fs.readFileSync('data.json'));
  data.push({ projectName, description, price, image, file });
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

  res.send('✅ Project uploaded! <a href="/admin/upload">Upload more</a>');
});

// Delete project (Admin only)
app.get('/admin/delete/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (fs.existsSync('data.json')) {
    let data = JSON.parse(fs.readFileSync('data.json'));
    if (index >= 0 && index < data.length) {
      const imagePath = path.join(__dirname, 'public', data[index].image);
      const filePath = path.join(__dirname, data[index].file);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      data.splice(index, 1);
      fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
    }
  }
  res.redirect('/admin/upload');
});

// 📦 Get all projects
app.get('/projects', (req, res) => {
  let data = [];
  if (fs.existsSync('data.json')) data = JSON.parse(fs.readFileSync('data.json'));
  res.json(data);
});

// 💰 Cashfree Integration
app.post("/create-order", async (req, res) => {
  try {
    const amount = req.body.amount || 100;
    const url = "https://sandbox.cashfree.com/pg/orders";

    const response = await axios.post(
      url,
      {
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_id: "CUST001",
          customer_email: "test@cashfree.com",
          customer_phone: "9999999999"
        }
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-01-01",
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Cashfree order created:", response.data);
    res.json(response.data);

  } catch (error) {
    console.error("❌ Cashfree Error:", error.response?.data || error.message);
    res.status(500).send("Error creating payment order");
  }
});

// 🏠 Main homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
