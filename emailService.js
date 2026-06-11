import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../config/config.env') });

// Generate random 6-digit OTP
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create transporter for sending emails
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Missing EMAIL_USER or EMAIL_PASSWORD environment variables');
    }

    const transporterConfig = {
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    };

    if (process.env.EMAIL_HOST) {
        transporterConfig.host = process.env.EMAIL_HOST;
        transporterConfig.port = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
        transporterConfig.secure = process.env.EMAIL_SECURE === 'true';
    } else {
        transporterConfig.service = process.env.EMAIL_SERVICE || 'gmail';
        transporterConfig.secure = process.env.EMAIL_SECURE === 'true';
    }

    return nodemailer.createTransport(transporterConfig);
};

// Send OTP to user email
export const sendOTPEmail = async (email, otp, name) => {
    try {
        const transporter = createTransporter();
    await transporter.verify();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification - Expense Tracker OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Welcome to Expense Tracker, ${name}!</h2>
                        
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            Thank you for registering with Expense Tracker. To complete your account verification, please use the OTP below:
                        </p>
                        
                        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #666;">Your OTP is:</p>
                            <h1 style="color: #007bff; margin: 10px 0; font-size: 36px; letter-spacing: 2px;">${otp}</h1>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            <strong>This OTP will expire in ${process.env.OTP_EXPIRY_TIME || 10} minutes.</strong>
                        </p>
                        
                        <p style="color: #666; font-size: 14px; line-height: 1.6;">
                            If you did not register for this account, please ignore this email.
                        </p>
                        
                        <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
                            <p style="color: #999; font-size: 12px; margin: 0;">
                                © 2024 Expense Tracker. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            `,
        };
        
        const result = await transporter.sendMail(mailOptions);
        return { success: true, message: 'OTP sent successfully', result };
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return {
            success: false,
            message: 'Failed to send OTP email',
            error: error.message,
            detail: error.response || error,
        };
    }
};

// Verify OTP (check if OTP matches and hasn't expired)
export const verifyOTP = (storedOTP, providedOTP, otpExpiry) => {
    if (!storedOTP || !providedOTP) {
        return { valid: false, message: 'OTP is missing' };
    }
    
    if (storedOTP !== providedOTP) {
        return { valid: false, message: 'Invalid OTP' };
    }
    
    if (new Date() > new Date(otpExpiry)) {
        return { valid: false, message: 'OTP has expired' };
    }
    
    return { valid: true, message: 'OTP verified successfully' };
};
