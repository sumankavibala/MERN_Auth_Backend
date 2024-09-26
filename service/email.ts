import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplate";
import { transporter } from "./nodeMailer";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: any
) => {
  const recipient = email;

  try {
   
    const mailOptions = {
      from: process.env.NODEMAILER_USERNAME,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
    };

    transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error while sending Email:",error);
      throw new Error(`Error send verification email:${error}`);
    }
      console.log("Email sent successfully: ", info.response);
    });

  } catch (error) {
    console.log(`Error send verification email:-->>${error}`);
    throw new Error(`Error send verification email:${error}`);
  }
};

export const sendWelcomeEmail = async(email:string|undefined,name:string)=>{
    const recipient = email;
    const username = name;

    try {
        const mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: recipient,
            subject: "Welcome Email",
            html: WELCOME_EMAIL_TEMPLATE.replace("{NICK}",username),

        }
        const info = await transporter.sendMail(mailOptions)
        console.log("welcome Email sent successfully: ", info.response);


    } catch (error) {
        console.log("Error while sending welcome Email:",error);
    }
};

export const sendPasswordResetEmail = async(email:any,resetURL:string)=>{
const recipient = email;
try {
    const mailOptions = {
        from: process.env.NODEMAILER_USERNAME,
        to: recipient,
        subject: "Reset your password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL)
    }
    const info = await transporter.sendMail(mailOptions);
} catch (error) {
    console.log("Error while sending forgot password email-->>",error);
    throw new Error ("Error while sending forgot password email-->>"+error)
}
}

export const sendResetSuccessEmail = async(email:any)=>{
    const recipient = email;
    try {
        const mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: recipient,
            subject: "Password reset successfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE
        }
        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent successfully")
    } catch (error) {
        console.log(`Error while sending password reset success email${error}`)
        throw new Error (`Error while sending password reset success email${error}`)
    }
}