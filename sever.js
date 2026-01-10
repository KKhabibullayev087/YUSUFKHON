const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); 
app.use(express.json());

let tempStorage = {}; 
let users = []; 

// Nodemailer sozlamalarini yanada aniqroq qildik
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL ishlatish
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'motprcendackubgi' 
    },
    // Ulanish vaqti tugashini oldini olish uchun
    connectionTimeout: 10000 
});

app.get('/', (req, res) => {
    res.send("<h1 style='color:blue; text-align:center;'>Yusufkhon Corporation Serveri muvaffaqiyatli ishga tushdi!</h1>");
});

// 1. RO'YXATDAN O'TISH
app.post('/register', async (req, res) => {
    console.log("Yangi ro'yxatdan o'tish so'rovi keldi:", req.body.email);
    
    const { email, name, password } = req.body;
    
    if(!email || !name || !password) {
        return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    tempStorage[email] = { code, name, password };

    try {
        // Xat yuborishni kutish vaqtini belgilaymiz
        await transporter.sendMail({
            from: '"Yusufkhon Corp" <xabibullayev.azizjon0608@gmail.com>',
            to: email,
            subject: 'Tasdiqlash kodi: ' + code,
            html: `
                <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #06b6d4;">Yusufkhon Corporation</h2>
                    <p>Sizning tasdiqlash kodingiz:</p>
                    <h1 style="letter-spacing: 5px; color: #333; background: #f4f4f4; padding: 10px; display: inline-block;">${code}</h1>
                    <p style="color: #888; font-size: 12px;">Agar bu so'rovni siz yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.</p>
                </div>
            `
        });
        
        console.log("Email muvaffaqiyatli yuborildi:", email);
        res.status(200).json({ message: "Kod yuborildi" });

    } catch (error) {
        console.error("Email yuborishda xatolik yuz berdi:", error.message);
        res.status(500).json({ message: "Email yuborishda xatolik: " + error.message });
    }
});

// 2. KODNI TASDIQLASH
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const userData = tempStorage[email];

    if (userData && userData.code == otp) {
        users.push({
            name: userData.name,
            email: email,
            password: userData.password
        });
        delete tempStorage[email];
        res.status(200).json({ message: "Muvaffaqiyatli tasdiqlandi!" });
    } else {
        res.status(400).json({ message: "Tasdiqlash kodi xato yoki muddati o'tgan!" });
    }
});

// 3. KIRISH
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.status(200).json({ 
            message: "Xush kelibsiz!", 
            token: "user-token-" + Date.now(),
            userName: user.name 
        });
    } else {
        res.status(401).json({ message: "Email yoki parol xato!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda tayyor va ishlamoqda...`);
});
