import express from 'express';
import { adminMulter, createAdmin } from '../controllers/admin.controller.js';
const adminRouter = express.Router();

adminRouter.post("/create-admin", adminMulter.single('adminProfile'), createAdmin)

export default adminRouter;