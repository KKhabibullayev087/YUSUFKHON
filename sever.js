const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); 
app.use(express.json());

// Foydalanuvchilarni vaqtincha saqlash (Bazangiz bo'lmagani uchun)
let tempStorage = {}; 
let users = []; // Ro'yxatdan o'tganlar shu yerga tushadi

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'motprcendackubgi' 
    }
});

// Asosiy sahifa (Server ishlashini tekshirish uchun)
app.get('/', (req, res) => {
    res.send("<h1 style='color:blue; text-align:center;'>Yusufkhon Corporation Serveri muvaffaqiyatli ishga tushdi!</h1>");
});

// 1. RO'YXATDAN O'TISH (KOD YUBORISH)
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    
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
            html: `
                <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px;">
                    <h2 style="color: #06b6d4;">Yusufkhon Corporation</h2>
                    <p>Sizning ro'yxatdan o'tish kodingiz:</p>
                    <h1 style="letter-spacing: 5px; color: #333;">${code}</h1>
                </div>
            `
        });
        res.status(200).json({ message: "Kod yuborildi" });
    } catch (error) {
        console.error("Email xatosi:", error);
        res.status(500).json({ message: "Email yuborishda xatolik yuz berdi" });
    }
});

// 2. KODNI TASDIQLASH (OTP VERIFY)
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const userData = tempStorage[email];

    if (userData && userData.code == otp) {
        // Kod to'g'ri bo'lsa, foydalanuvchini "baza"ga qo'shish
        users.push({
            name: userData.name,
            email: email,
            password: userData.password
        });
        delete tempStorage[email]; // Vaqtincha xotiradan o'chirish
        res.status(200).json({ message: "Muvaffaqiyatli tasdiqlandi!" });
    } else {
        res.status(400).json({ message: "Tasdiqlash kodi xato!" });
    }
});

// 3. KIRISH (LOGIN)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.status(200).json({ 
            message: "Xush kelibsiz!", 
            token: "fake-jwt-token-" + Math.random(),
            userName: user.name 
        });
    } else {
        res.status(401).json({ message: "Email yoki parol xato!" });
    }
});

// --- SERVERNI ISHGA TUSHIRISH ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda tayyor`);
});
