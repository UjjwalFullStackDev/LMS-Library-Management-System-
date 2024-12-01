import express from 'express';
import { adminMulter, createAdmin, deleteAllFacultyByAdmin, deleteFacultyById, findFacultyById, getAllFaculty, updateFaculty } from '../controllers/admin.controller.js';
const adminRouter = express.Router();

adminRouter.post("/create-admin", adminMulter.single('adminProfile'), createAdmin)
adminRouter.get("/get-faculty/admin/:adminid/:fid", findFacultyById)
adminRouter.get("/get-all-faculty/admin/:adminid", getAllFaculty)
adminRouter.delete("/delete-faculty/admin/:adminid/:fid", deleteFacultyById)
adminRouter.delete("/delete-all-faculty/admin/:adminid", deleteAllFacultyByAdmin)
adminRouter.put("/update-faculty/admin/:adminid/:fid", updateFaculty)

export default adminRouter;