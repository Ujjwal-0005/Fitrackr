import transporter from '../config/email.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OTP_EXPIRY_MINUTES = Math.floor(parseInt(process.env.OTP_EXPIRY_SECONDS || '300') / 60);

/**
 * Send signup OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 */
export const sendSignupOTP = async (email, otp) => {
  const mailOptions = {
    from: `"FiTrackr" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email – GymTrackr OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ Welcome to GymTrackr!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for signing up! Please use the OTP below to complete your registration:</p>
            
            <div class="otp-box">
              <div class="otp">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666;">This code expires in ${OTP_EXPIRY_MINUTES} minutes</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong>
              <ul style="margin: 5px 0;">
                <li>Never share this OTP with anyone</li>
                <li>GymTrackr will never ask for your OTP via phone or email</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GymTrackr. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send forgot password OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 */
export const sendForgotPasswordOTP = async (email, otp) => {
  const mailOptions = {
    from: `"GymTrackr" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password – GymTrackr OTP',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f5576c; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
          .alert { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            
            <div class="otp-box">
              <div class="otp">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #666;">This code expires in ${OTP_EXPIRY_MINUTES} minutes</p>
            </div>
            
            <div class="alert">
              <strong>🚨 Important:</strong>
              <p style="margin: 5px 0;">If you didn't request a password reset, please ignore this email and ensure your account is secure. Your password will not be changed unless you complete the reset process.</p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Security Tips:</strong>
              <ul style="margin: 5px 0;">
                <li>Never share this OTP with anyone</li>
                <li>GymTrackr staff will never ask for your OTP</li>
                <li>Use a strong, unique password</li>
              </ul>
            </div>
            
            <p>If you need assistance, contact our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GymTrackr. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - User's name
 */
export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"GymTrackr" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Welcome to GymTrackr! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FE9A00 0%, #FFA500 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature-box { background: white; border-left: 4px solid #FE9A00; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FE9A00 0%, #FFA500 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ Welcome to GymTrackr!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}! 👋</h2>
            <p>We're thrilled to have you join the GymTrackr community! You're now part of a platform designed to help you crush your fitness goals.</p>
            
            <h3>Get Started:</h3>
            <div class="feature-box">
              ✅ <strong>Complete your profile</strong> - Add your fitness details and goals
            </div>
            <div class="feature-box">
              ✅ <strong>Set your Smart Goals</strong> - Let AI help you plan your journey
            </div>
            <div class="feature-box">
              ✅ <strong>Start tracking workouts</strong> - Log exercises and monitor progress
            </div>
            <div class="feature-box">
              ✅ <strong>Track nutrition</strong> - Monitor your meals and calories
            </div>
            
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/home" class="cta-button">Start Your Journey →</a>
            </p>
            
            <p>Need help? Just reply to this email anytime - we're here to support you!</p>
            
            <p><strong>Let's crush those goals together! 💪</strong></p>
            <p>- The GymTrackr Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} GymTrackr. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
