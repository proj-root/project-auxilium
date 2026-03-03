import express from 'express';
import * as UserController from './user.controller';
import { verifyJWT } from '@/middleware/auth.middleware';

const UserRouter = express.Router();
UserRouter.use(verifyJWT);

UserRouter.get('/', UserController.readPersonalDetailsById);

export default UserRouter;