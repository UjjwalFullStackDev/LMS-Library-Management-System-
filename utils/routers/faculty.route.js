import express from 'express';
import { createFaculty, facultyMulter, getCourses, loginFaculty, refresh, resetFacultyPassword, updateFaculty } from '../controllers/faculty.controller.js';
import protectRoute from '../middleware/protectRoute/protect.route.js';
import { emailVarification } from '../middleware/emailVarification/emailVarification.js';
const facultyRouter = express.Router();

facultyRouter.post("/admin/:adminid/create-faculty", facultyMulter.single('facultyProfile'), emailVarification, createFaculty)
facultyRouter.post("/login-faculty", loginFaculty)
facultyRouter.put("/update-faculty/admin/:adminid/:fid", updateFaculty)
facultyRouter.get("/get-courses/faculty/:fid", protectRoute, getCourses)
facultyRouter.post("/refresh-token", refresh)
facultyRouter.post("/reset-faculty-password/:fid", resetFacultyPassword)
facultyRouter.get("/email-verification", (req, res) => {
    res.status(200).json({
        message: "Email varified successfully"
    })
})

export default facultyRouter;