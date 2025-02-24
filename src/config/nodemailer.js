import nodemailer from 'nodemailer'
export const transporter = nodemailer.createTransport({
    service: 'gmail', // Your email service provider
    auth: {
        user: 'dafiyahilmulquran@gmail.com', // Your email
        pass: 'vash ribg ihua wyqo'    // Your email password or app-specific password
    }
});

