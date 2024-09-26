import Express from 'express';
import { checkAuth, forgotPassword, login, logout, resetPassword, signup, verifyEmail } from '../controller/authController';
import { verifyToken } from '../middleware/verifyToken';

export const authrouter = Express.Router();

authrouter.get('/check-auth',verifyToken,checkAuth);

authrouter.post('/signup',signup);
authrouter.post('/verify-email',verifyEmail);
authrouter.post('/login',login);
authrouter.post('/logout',logout);
authrouter.post('/forgot-Password',forgotPassword);
authrouter.post('/reset-Password/:token',resetPassword);

