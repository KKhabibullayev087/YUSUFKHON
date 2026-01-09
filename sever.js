const express = require('express');
const cors = require('cors'); // CORS-ni ulaymiz
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); // BU JUDA MUHIM: Brauzer bloklamasligi uchun
app.use(express.json());

let tempStorage = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'motprcendackubgi' 
    }
});

// Asosiy sahifa (Brauzerda tekshirish uchun)
app.get('/', (req, res) => {
    res.send("<h1>Yusufkhon Corporation Serveri ishlamoqda!</h1>");
});

// Ro'yxatdan o'tish (Frontend /register deb so'raydi)
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000);
    tempStorage[email] = { code, name, password };

    try {
        await transporter.sendMail({
            from: '"Yusufkhon Corp" <xabibullayev.azizjon0608@gmail.com>',
            to: email,
            subject: 'Sizning tasdiqlash kodingiz',
            html: `<h1 style="color: #06b6d4;">${code}</h1>`
        });
        res.status(200).json({ message: "Yuborildi" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT}-portda yondi`));
