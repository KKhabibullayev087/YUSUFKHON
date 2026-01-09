const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

let tempStorage = {}; // Vaqtincha kodlarni saqlash

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'xabibullayev.azizjon0608@gmail.com',
        pass: 'motprcendackubgi' // Google App Password
    }
});

// KOD YUBORISH
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000);
    tempStorage[email] = code;

    try {
        await transporter.sendMail({
            from: '"Yusufkhon Corp" <sizning_emailingiz@gmail.com>',
            to: email,
            subject: 'Sizning tasdiqlash kodingiz',
            html: `<h1 style="color: #06b6d4;">${code}</h1><p>Ushbu kodni ilovaga kiriting.</p>`
        });
        res.status(200).send("Yuborildi");
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// KODNI TEKSHIRISH
app.post('/verify-otp', (req, res) => {
    const { email, code, name, pass } = req.body;

    if (tempStorage[email] == code) {
        console.log(`Ro'yxatdan o'tdi: ${name} (${email})`);
        delete tempStorage[email]; // Ishlatilgan kodni o'chirish
        res.status(200).send("OK");
    } else {
        res.status(400).send("Xato kod");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));