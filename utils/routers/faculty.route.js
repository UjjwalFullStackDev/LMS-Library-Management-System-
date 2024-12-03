import express from 'express';
import { createFaculty, facultyMulter, getCourses, loginFaculty, updateFaculty } from '../controllers/faculty.controller.js';
const facultyRouter = express.Router();

facultyRouter.post("/admin/:adminid/create-faculty", facultyMulter.single('facultyProfile'), createFaculty)
facultyRouter.post("/login-faculty", loginFaculty)
facultyRouter.put("/update-faculty/admin/:adminid/:fid", updateFaculty)
facultyRouter.get("/get-courses/faculty/:fid", getCourses)

export default facultyRouter;