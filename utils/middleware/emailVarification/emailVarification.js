import nodemailer from 'nodemailer'
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
});


export const emailVarification = async(req, res, next) => {
  
    const { facultyEmail } = req.body;

    try {
        transporter.sendMail({
            from: process.env.SMTP_USER,
            to: facultyEmail,
            subject: "Email Verification",
            html: `
                <h1>Email Verification</h1>
                <p>Click <a href="${process.env.CLIENT_URL}/api/v1/email-verification/">here</a> to verify your email address.</p>
            `
        }, (error, info) => {
            if (error) {
                return handleError(res, 500, `internal error ${error}`)
            }
            return res.status(200).json({
                message: "Email sent successfully",
                info
            });
        });
        next();
    } catch (error) {
        return handleError(res, 500, `internal error ${error}`)
        
    }
}
