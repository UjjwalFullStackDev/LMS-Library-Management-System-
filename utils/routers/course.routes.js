import express from 'express';
import { courseMulter, createCourse } from '../controllers/course.controller.js';
const courseRoute = express.Router()

courseRoute.post("/create-course/faculty/:fid", courseMulter.single("coursePdf"), createCourse);

export default courseRoute;