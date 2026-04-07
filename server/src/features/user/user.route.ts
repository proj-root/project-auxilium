import express from 'express';
import * as UserController from './user.controller';
import { verifySession } from '@/middleware/auth.middleware';

const UserRouter = express.Router();
UserRouter.use(verifySession);

UserRouter.get('/', UserController.readPersonalDetailsById);

export default UserRouter;