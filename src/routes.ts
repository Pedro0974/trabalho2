// src/routes.ts
import { Router } from 'express';
import authController from './controllers/authController';
import userController from './controllers/userController';

const routes = Router();

routes.post('/login', authController.login);
routes.post('/register', userController.register);

export default routes;
