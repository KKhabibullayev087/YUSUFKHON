document.getElementById('logistics-form').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const date = document.getElementById('date').value;
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const rate = parseFloat(document.getElementById('rate').value);
    const resultBox = document.getElementById('result-box');

    // ----------------------------------------------------
    // 🚚 LOGISTIKA HISOB-KITOB MANTIQIY QISMI
    // Oddiy formula: Umumiy narx = (Masofa * Tarif) * Og'irlik
    // ----------------------------------------------------
    
    // Tonna va masofaga asoslangan umumiy daromad (Tushum)
    const totalAmount = distance * rate * weight;
    
    // So'm formatiga o'tkazish funksiyasi
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS', minimumFractionDigits: 0 }).format(amount);
    };

    // Natijani yig'ish
    const transactionData = {
        date: date,
        description: `${origin} dan ${destination} ga yuk tashish`,
        distance: distance,
        weight: weight,
        rate_per_km_per_ton: rate,
        total_income: totalAmount,
        status: 'Yangi Tushum'
    };

    // Backendga yuboriladigan ma'lumot (Hozircha konsolga chiqadi)
    console.log("SERVERga yuboriladigan Logistika Tranzaksiyasi:");
    console.log(transactionData);

    // Natijani admin panelida ko'rsatish
    resultBox.style.display = 'block';
    resultBox.classList.remove('message-error');
    resultBox.classList.add('message-success');
    
    resultBox.innerHTML = `
        <h3>✅ Yuk Tashish Hisoblandi va Saqlandi</h3>
        <p><strong>Yo'nalish:</strong> ${origin} -> ${destination}</p>
        <p><strong>Og'irlik:</strong> ${weight} tonna | <strong>Masofa:</strong> ${distance} km</p>
        <p style="font-size: 1.2em; margin-top: 10px;">
            **Umumiy Daromad:** <strong>${formatMoney(totalAmount)}</strong>
        </p>
    `;

    // Shaklni tozalash (agar saqlash muvaffaqiyatli bo'lsa)
    // this.reset(); 
});
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('logistics-form');
    const resultBox = document.getElementById('result-box');

    // !!! O'zingizning ma'lumotlaringizni kiriting !!!
    const TELEGRAM_BOT_TOKEN = '7969245704:AAHZLnw3kiePNXLVpl4fuHlglMdsoI4uUsU'; // <-- BOT token
    // Ma'lumot yuborilishi kerak bo'lgan shaxslar/guruhlar chat ID'lari
    const chatIds = ['7705118087', '5231166345']; 

    // Formani yuborishni ushlab qolish
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Standart formani yuborishni to'xtatish

        // 1. Maydon qiymatlarini olish
        const date = document.getElementById('date').value;
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const distance = parseFloat(document.getElementById('distance').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const rate = parseFloat(document.getElementById('rate').value);
        
        // Validatsiya
        if (isNaN(distance) || isNaN(weight) || isNaN(rate) || distance <= 0 || weight <= 0 || rate <= 0) {
            resultBox.style.backgroundColor = '#f44336';
            resultBox.textContent = "Iltimos, barcha sonli maydonlarga (Masofa, Og'irlik, Tarif) to'g'ri qiymatlar kiriting.";
            resultBox.style.display = 'block';
            return;
        }

        // 2. 💰 Yuk tashish qiymatini hisoblash (Masofa * Tarif)
        // Agar tarif 1 Km * 1 Tonna uchun bo'lsa: finalCost = distance * rate * weight;
        // Agar tarif faqat 1 Km uchun (yuk og'irligi tarifda hisobga olingan) bo'lsa:
        const finalCost = distance * rate; 

        // 3. Natijani ekranda ko'rsatish
        resultBox.style.backgroundColor = '#0d0e0dff';
        resultBox.innerHTML = `
            <h3>✅ Hisoblash Natijasi</h3>
            <p><strong>Masofa:</strong> ${distance.toFixed(0)} Km</p>
            <p><strong>Yuk Og'irligi:</strong> ${weight.toFixed(1)} Tonna</p>
            <p><strong>Tarif:</strong> ${rate.toLocaleString('uz-UZ')} So'm/Km</p>
            <hr>
            <p><strong>💰 Jami Qiymat:</strong> <strong>${finalCost.toLocaleString('uz-UZ')} So'm</strong></p>
            <p>Ma'lumotlar Telegram Botiga yuborilmoqda...</p>
        `;
        resultBox.style.display = 'block';
        
        // 4. Telegramga yuborish uchun xabarni tayyorlash
        const telegramMessage = `
            📊 **Yangi Logistika Tranzaksiyasi**

            📅 **Sana:** ${date}
            
            📍 **Yo'nalish:** ${origin} ➡️ ${destination}
            🛣️ **Masofa:** ${distance.toFixed(0)} Km
            
            ⚖️ **Yuk Og'irligi:** ${weight.toFixed(1)} Tonna
            💵 **1 Km uchun Tarif:** ${rate.toLocaleString('uz-UZ')} So'm
            
            💰 **JAMI YUK QIYMADI:** **${finalCost.toLocaleString('uz-UZ')} So'm**
        `;

        // 5. Har bir chat ID'siga xabarni yuborish
        const telegramPromises = chatIds.map(id => {
            return fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    chat_id: id,
                    text: telegramMessage
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(`Telegram xatosi (ID: ${id}): ${errorData.description || 'Noma\'lum xato'}`);
                    });
                }
                return response.json();
            })
            .catch(error => {
                console.error('Telegramga yuborishda xatolik:', error.message);
                return { success: false, error: error.message };
            });
        });

        // Barcha yuborish jarayonlari tugashini kutish
        Promise.all(telegramPromises).then(results => {
             // Agar barchasi muvaffaqiyatli bo'lsa
             const allSuccessful = results.every(res => res && res.ok);
             
             if (allSuccessful) {
                 resultBox.style.backgroundColor = '#2196F3';
                 resultBox.innerHTML = `
                     <h3>✅ Tranzaksiya Muvaffaqiyatli Saqlandi</h3>
                     <p>Jami Qiymat: <strong>${finalCost.toLocaleString('uz-UZ')} So'm</strong></p>
                     <p>Ma'lumotlar **${chatIds.length}** ta qabul qiluvchiga yuborildi.</p>
                 `;
             } else {
                 // Agar ba'zi yuborishlar xato bilan tugasa
                 resultBox.style.backgroundColor = '#FF9800'; // Sariq rang - ogohlantirish
                 resultBox.innerHTML = `
                     <h3>⚠️ Xatolik/Ogohlantirish</h3>
                     <p>Jami Qiymat: <strong>${finalCost.toLocaleString('uz-UZ')} So'm</strong></p>
                     <p>Ba'zi Telegram xabarlari yuborilmadi. Konsolni tekshiring.</p>
                 `;
             }
        });
    });
});