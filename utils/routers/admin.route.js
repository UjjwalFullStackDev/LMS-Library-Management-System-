import express from 'express';
import { adminMulter, createAdmin, deleteAllCourses, deleteAllFacultyByAdmin, deleteAllStudent, deleteFacultyById, deleteStudentById, findFacultyById, getAllCourses, getAllFaculty, getAllStudent } from '../controllers/admin.controller.js';
const adminRouter = express.Router();

adminRouter.post("/create-admin", adminMulter.single('adminProfile'), createAdmin)
adminRouter.get("/get-faculty/admin/:adminid/:fid", findFacultyById)
adminRouter.get("/get-all-faculty/admin/:adminid", getAllFaculty)
adminRouter.delete("/delete-faculty/admin/:adminid/:fid", deleteFacultyById)
adminRouter.delete("/delete-all-faculty/admin/:adminid", deleteAllFacultyByAdmin)
adminRouter.delete("/delete-all-courses/admin/:adminid", deleteAllCourses)
adminRouter.get("/get-all-courses/admin/:adminid", getAllCourses)
adminRouter.get("/get-all-students/admin/:adminid", getAllStudent)
adminRouter.delete("/delete-all-students/admin/:adminid", deleteAllStudent)
adminRouter.delete("/delete-student/admin/:adminid/:sid", deleteStudentById)

export default adminRouter;