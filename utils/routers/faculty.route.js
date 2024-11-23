import express from 'express';
import { createFaculty, facultyMulter } from '../controllers/faculty.controller.js';
const facultyRouter = express.Router();

facultyRouter.post("/admin/:adminid/create-faculty", facultyMulter.single('facultyProfile'), createFaculty)

export default facultyRouter;