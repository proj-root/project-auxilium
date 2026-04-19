import express from 'express';
import * as AuthController from './auth.controller';
import { verifyRefreshJWT } from '@/middleware/auth.middleware';

const AuthRouter = express.Router();

AuthRouter.post('/login', AuthController.login);

// AuthRouter.post('/register');

AuthRouter.post('/refresh', verifyRefreshJWT, AuthController.refresh);

AuthRouter.post('/logout', AuthController.logout);

export default AuthRouter;
