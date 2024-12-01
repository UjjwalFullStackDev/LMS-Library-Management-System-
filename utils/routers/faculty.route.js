import express from 'express';
import { createFaculty, facultyMulter, loginFaculty } from '../controllers/faculty.controller.js';
const facultyRouter = express.Router();

facultyRouter.post("/admin/:adminid/create-faculty", facultyMulter.single('facultyProfile'), createFaculty)
facultyRouter.post("/login-faculty", loginFaculty)

export default facultyRouter;