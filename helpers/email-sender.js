import nodemailer from "nodemailer";
import { config } from "dotenv";
import { throwServerError } from "./index.js";
import CustomError from "../errors/CustomError.js";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
config({ path: ".env" });

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.SMTPPASS,
  },
});

const sendEmail = async ({ otpCode, email }) => {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Evote email verification",
      text: "Your registered email on evote has requested verification",
      html: `<!DOCTYPE html>
    <html>
    <head>
    <style>
    /* Add your custom CSS styles here */
    body {
      font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
    
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }
        
        .header {
          text-align: center;
          background-color: #007bff;
          color: #fff;
          padding: 20px 0;
        }
    
        .content {
          padding: 20px;
        }
    
        .otp {
          font-size: 28px;
          text-align: center;
          padding: 10px;
          background-color: #007bff;
          color: #fff;
          border-radius: 4px;
        }
    
        .instructions {
          font-size: 16px;
          margin-top: 20px;
        }
    
        .footer {
          text-align: center;
          font-size: 14px;
          margin-top: 20px;
          color: #777;
        }
        </style>
        </head>
        <body>
        <div class="container">
        <div class="header">
        <h1>OTP Verification</h1>
        </div>
        <div class="content">
          <p class="otp">Your OTP: <strong>${otpCode}</strong></p>
          <p class="instructions">Please use the OTP above to verify your email address.</p>
        </div>
        <div class="footer">
        This email was sent by Evote.
        </div>
      </div>
      </body>
    </html>`,
    };
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        reject(new CustomError("Error occured. Please try again"));
      } else {
        console.log("Email sent: " + info.response);
        // return true;
        resolve();
      }
    });
  });
};

export default sendEmail;
