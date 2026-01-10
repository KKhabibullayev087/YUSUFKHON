const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); 
app.use(express.json());

let tempStorage = {}; 
let users = []; 

// Nodemailer sozlamalari - PORT 587 ga o'zgartirildi (Timeoutni oldini oladi)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 587 port uchun shunday bo'lishi shart
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'zydswmxoetzjompb' // Sizning yangi parolingiz
    },
    tls: {
        rejectUnauthorized: false // Render tarmog'ida bloklanishni oldini oladi
    }
});

app.get('/', (req, res) => {
    res.send("<h1 style='color:green; text-align:center;'>Yusufkhon Serveri ishlamoqda!</h1>");
});

// 1. RO'YXATDAN O'TISH
app.post('/register', async (req, res) => {
    const { email, name, password } = req.body;
    console.log("Ro'yxatdan o'tish so'rovi keldi:", email);

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
                <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #06b6d4;">Yusufkhon Corporation</h2>
                    <p>Sizning tasdiqlash kodingiz:</p>
                    <h1 style="background: #eee; padding: 10px; display: inline-block;">${code}</h1>
                </div>
            `
        });
        
        console.log("Xat muvaffaqiyatli yuborildi!");
        res.status(200).json({ message: "Kod yuborildi" });

    } catch (error) {
        console.error("Xat yuborishda xato:", error.message);
        res.status(500).json({ message: "Email yuborishda xatolik: " + error.message });
    }
});

// 2. KODNI TASDIQLASH (OTP VERIFY)
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    const userData = tempStorage[email];

    if (userData && userData.code == otp) {
        users.push({ name: userData.name, email, password: userData.password });
        delete tempStorage[email];
        res.status(200).json({ message: "Muvaffaqiyatli tasdiqlandi!" });
    } else {
        res.status(400).json({ message: "Tasdiqlash kodi xato!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda tayyor`);
});
