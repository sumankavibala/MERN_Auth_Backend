import { User } from "../model/userModel";
import Bcrypt, { hash } from "bcrypt";
import crypto from "crypto";
import { generateVerificationToken } from "../service/generateVerificatioCode";
import { generateTokenAndSetCookie } from "../service/generateTokenAndSetCookie";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../service/email";

export const signup = async (req: any, res: any) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      throw new Error("All field are required");
    }
    //The above if condition verifies data is available or not for email, password, name.
    // ! symbol is a boolean, when value is available then it returns true or else it will be false.
    const userAlreadyExists = await User.findOne({ email });
    //userAlreadyExists will store email from DB if available.
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }
    //The above if condition returns a message when user already exists in DB.
    const hashedPassword = await Bcrypt.hash(password, 10);
    //bcrypt hashes the password which encrypt the password string.
    // 10 is the salt round, i.e 10 round of applying blowfish algorithm for hashing the password.
    const verificationToken = generateVerificationToken();
    //verification token block generate verification code to send via email.
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    //user block contains information which is going to get saved in database.
    await user.save();

    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: "user created succesfully",
      user: {
        ...user,
        password: undefined,
      },
    });
    //above response code send success as true and a message with user data to the network log.

    await sendVerificationEmail(user.email, verificationToken);
    //sendVerificationEmail sends a verification mail to user mail
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req: any, res: any) => {
  const { code } = req.body;
  // verification token is got from req.body and saved in code block.
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });
    //user from db is searched by findone with search condition as verification token
    //and have another condition that verification token should be greater than current time which intern denote that verification should not be expired.
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
      //Above if condition checks whether the user is available in the db
      //who have the token code from user input and it should also be unexpired token.
    }
    user.isVerified = true;
    //user.isverifies=true makes the account verified in db
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    //the above code denotes that verificationtoken and expiry date of verification token should be delete from db
    await user.save();
    //save the changes in db
    await sendWelcomeEmail(user.email, user.name);
    //send a welcome mail to the user after account verification
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("Email verification failed-->>", error);
    res.status(500).json({ success: false, message: "server Error:" + error });
  }
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await Bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("console Error while logging in-->>" + error);
    res
      .status(400)
      .json({ success: false, message: "Error while logging in-->>" + error });
  }
};

export const logout = async (req: any, res: any) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req: any, res: any) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    //generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //creates reset token using crypto module which generates 20 characters and changes to string
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour expiry time for token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = new Date(resetTokenExpiresAt);
    await user.save();
    //saves the changes into db
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error: any) {
    console.log("Error while sending forgot password email-->>", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const resetPassword = async (req: any, res: any) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }
    //update password
    const hashedPassword = await Bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: `password reset failed Error:${error.message}`,
    });
  }
};

export const checkAuth = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.userId);
    // const user = await User.findById(req.userId).select("-password")

    if (!user) {
      return res.status(400).json({ succes: false, message: "user not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error: any) {
    console.log(`Error in checkAuth:${error.message}`);
    res.status(400).json({
      success: false,
      message: `Error in checkAuth:${error.message}`,
    });
  }
};
