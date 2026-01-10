const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// --- SOZLAMALAR ---
app.use(cors()); // BU JUDA MUHIM: Saytingiz serverga ulanishi uchun ruxsat beradi
app.use(express.json());

let tempStorage = {}; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'motprcendackubgi' 
    }
});

// Brauzerda tekshirish uchun (image_625d09.png o'rniga chiqadi)
app.get('/', (req, res) => {
    res.send("<h1 style='color:blue; text-align:center;'>Yusufkhon Corporation Serveri muvaffaqiyatli ishga tushdi!</h1>");
});

// Ro'yxatdan o'tish yo'nalishi
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
app.listen(PORT, () => console.log(`Server ${PORT}-portda tayyor`));
