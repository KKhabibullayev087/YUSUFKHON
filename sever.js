const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Vaqtinchalik xotira (demo uchun)
let tempStorage = {}; 
let users = []; 

// Gmail transporter (App Password ishlatish shart!)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'xabibullayev.azizjon0608@gmail.com', // Gmail manzilingiz
    pass: 'hqosofjwxkttjizt' // Gmail App Password (bo'sliqsiz yoziladi)
  }
});

// Test route
app.get('/', (req, res) => {
  res.send("<h1 style='color:green;text-align:center;'>Yusufkhon Serveri Tayyor!</h1>");
});

// 1. Ro'yxatdan o'tish (OTP yuborish)
app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
  }

  const code = Math.floor(100000 + Math.random() * 900000);
  tempStorage[email] = { code, name, password };

  try {
    await transporter.sendMail({
      from: '"Yusufkhon Corp" <xabibullayev.azizjon0608@gmail.com>',
      to: email,
      subject: 'Tasdiqlash kodi',
      html: `<h2>Kodingiz:</h2><h1 style="color:blue;">${code}</h1>`
    });
    res.json({ message: "Kod yuborildi!" });
  } catch (err) {
    res.status(500).json({ message: "Email yuborishda xato: " + err.message });
  }
});

// 2. OTP tasdiqlash
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const userData = tempStorage[email];

  if (userData && userData.code == otp) {
    users.push({ name: userData.name, email, password: userData.password });
    delete tempStorage[email];
    res.json({ message: "Muvaffaqiyatli tasdiqlandi!" });
  } else {
    res.status(400).json({ message: "Kod xato!" });
  }
});

// 3. Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: "Xush kelibsiz!", userName: user.name });
  } else {
    res.status(401).json({ message: "Email yoki parol xato!" });
  }
});

// Render uchun port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda ishlayapti`));
