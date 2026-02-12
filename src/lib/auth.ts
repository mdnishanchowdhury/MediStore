import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!],
    user: {
        additionalFields: {
            role: {
                type: "string",
                defaultValue: "CUSTOMER",
                required: false
            },
            phone: {
                type: "string",
                required: false
            },
            status: {
                type: "string",
                defaultValue: "ACTIVE",
                required: false
            }
        }
    },
    emailAndPassword: {
        enabled: true,
         requireEmailVerification: true,
    },
    emailVerification: {
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {

            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`

                const info = await transporter.sendMail({
                    from: `"MEDI STORE" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: "Verify your email",
                    html: `
                <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f9fc;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 50px auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #333333;
    }
    .content {
      font-size: 16px;
      line-height: 1.6;
      color: #555555;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      font-size: 16px;
      color: #ffffff;
      background-color: #4caf50;
      text-decoration: none;
      border-radius: 5px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #888888;
      text-align: center;
    }
    a { color: #4caf50; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Prisma Blog!</h1>
    </div>
    <div class="content">
      <p>Hello ${user.email},</p>
      <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
      <p style="text-align:center;">
        <a class="btn" href="${verificationUrl}">Verify Email</a>
      </p>
      <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
      <p><a href="${verificationUrl}">${url}</a></p>
      <p>Cheers,<br/>The Prisma Blog Team</p>
    </div>
    <div class="footer">
      &copy; 2025 Prisma Blog. All rights reserved.
    </div>
  </div>
</body>
</html>
                `,
                });
            } catch (error) {
                console.error(error)
                throw error
            }

        },
    },
    socialProviders: {
        google: {
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});