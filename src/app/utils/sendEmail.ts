import nodemailer from 'nodemailer';
import config from '../config';
export const sendEmail = async (to: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: 'smpt.gmail.com',
        port: 587,
        secure: config.NODE_ENV === 'production',
        auth: {
             user: 'impactitbd24@gmail.com',
            pass: 'idah ephq oghb afdf',
        }
    })


await transporter.sendMail({
    from: 'impactitbd24@gmail.comm', // sender address
    to, // list of receivers
    subject: 'Reset your password within 10 mins!', // Subject line
    text: '', // plain text body
    html, // html body
  });
};
