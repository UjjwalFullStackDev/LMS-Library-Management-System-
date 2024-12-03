import express from 'express';
import { createStudent, loginStudent, studentMulter, updateStudent } from '../controllers/student.controller.js';
const studentRouter = express.Router();

studentRouter.post("/create-student/admin/:adminid/", studentMulter.single('studentProfile'), createStudent)
studentRouter.post("/login-student", loginStudent)
studentRouter.put("/update-student/admin/:adminid/:sid", updateStudent)

export default studentRouter;