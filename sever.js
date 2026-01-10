const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); 
app.use(express.json());

let tempStorage = {}; 
let users = []; 

// Nodemailer sozlamalari - YANGI PAROL BILAN
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'zydswmxoetzjompb' // BO'SHLIQLARSIZ YOZILDI
    },
    tls: {
        rejectUnauthorized: false // Ulanish xatolarini oldini olish uchun
    }
});

// Server ishlayotganini tekshirish
app.get('/', (req, res) => {
    res.send("<h1 style='color:green; text-align:center;'>Yusufkhon Serveri YANGI PAROL BILAN TAYYOR!</h1>");
});

// 1. RO'YXATDAN O'TISH
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    console.log("Ro'yxatdan o'tish so'rovi:", email);

    if(!email || !name || !password) {
        return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    tempStorage[email] = { code, name, password };

    try {
        await transporter.sendMail({
            from: '"Yusufkhon Corp" <xabibullayev.azizjon0608@gmail.com>',
            to: email,
            subject: 'Tasdiqlash kodi: ' + code,
            html: `<div style="text-align: center;"><h2>Kodingiz:</h2><h1 style="color: blue;">${code}</h1></div>`
        });
        
        console.log("Xat yuborildi!");
        res.status(200).json({ message: "Kod yuborildi" });
    } catch (error) {
        console.error("Xat yuborishda xato:", error.message);
        res.status(500).json({ message: "Xatolik: " + error.message });
    }
});

// 2. KODNI TASDIQLASH
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const userData = tempStorage[email];

    if (userData && userData.code == otp) {
        users.push({ name: userData.name, email, password: userData.password });
        delete tempStorage[email];
        res.status(200).json({ message: "Muvaffaqiyatli tasdiqlandi!" });
    } else {
        res.status(400).json({ message: "Kod xato!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishga tushdi`);
});
