const nodemailer = require('nodemailer');

const getTransport = () => nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendPasswordResetCode = async ({ email, code }) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_USER and SMTP_PASS must be configured.');
    }

    const from = process.env.SMTP_FROM || `Ebisu Tracker <${process.env.SMTP_USER}>`;
    const subject = 'Your Ebisu Tracker password reset code';
    const text = `Your Ebisu Tracker password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
    const html = `
        <div style="margin:0;padding:32px 16px;background:#f6f7f9;font-family:Arial,sans-serif;color:#1f2937">
            <div style="max-width:520px;margin:0 auto;padding:32px;background:#ffffff;border-radius:16px;text-align:center">
                <img src="https://ebisutracker.com/img/logo3.0-dark-circle.png" alt="Ebisu Tracker" width="72" height="72" style="display:block;margin:0 auto 24px;object-fit:contain" />
                <h1 style="margin:0 0 16px;font-size:24px">Reset your Ebisu Tracker password</h1>
                <p style="margin:0 0 24px;line-height:1.5">Use this code to reset your password:</p>
                <div style="margin:0 0 24px;font-size:32px;font-weight:700;letter-spacing:8px;color:#111827">${code}</div>
                <p style="margin:0 0 16px;line-height:1.5">This code expires in 10 minutes.</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
        </div>`;

    await getTransport().sendMail({ from, to: email, subject, text, html });
};

module.exports = { sendPasswordResetCode };
