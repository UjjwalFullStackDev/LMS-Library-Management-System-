import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import path from 'path'
import handleError from '../middleware/error_logs/handleError.js';
import adminModel from '../models/admin.model.js';
import mongoose from 'mongoose';
import facultyModel from '../models/faculty.model.js'
import courseModel from '../models/course.model.js';
import studentModel from '../models/student.model.js';

const adminPath = path.join("public/admin/")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, adminPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const adminMulter = multer({ storage: storage })


// Create Admin API
export const createAdmin = async (req, res) => {
    const { adminName, adminEmail, adminPassword } = req.body;
    const adminProfile = req.file;

    if (!adminProfile) {
        return handleError(res, 400, "Admin profile is require")
    }

    // Validate input fields
    if (!adminName || !adminEmail || !adminPassword) {
        return handleError(res, 400, "All field are required");
    }

    try {
        // Check if the email already exists
        const checkEmail = await adminModel.findOne({ adminEmail: adminEmail });
        // console.log(checkEmail)
        if (checkEmail) {
            return handleError(res, 400, "Email already exist");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const adminUser = new adminModel({
            adminName,
            adminEmail,
            adminPassword: hashedPassword,
            adminProfile: adminProfile.filename,
        });

        // Save admin to the database
        const saveAdmin = await adminUser.save();
        if (!saveAdmin)
            return handleError(res, 400, "Cannot save admin")

        // Generate a token
        const token = jwt.sign({ userID: saveAdmin._id }, process.env.SECRET_KEY, { expiresIn: "4d" });

        // Return success response
        return handleError(res, 201, "Admin created successfully", saveAdmin, token)
    } catch (e) {
        return handleError(res, 500, `internal error ${e}`)
    }
}



// Find faculty using admin API
export const findFacultyById = async(req, res) => {

    const {adminid, fid} = req.params;

    // Validate input
    if (!adminid || !fid) {
        return handleError(res, 400, "Admin ID or Faculty ID not provided.");
    }

    // Check if IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid) || !mongoose.Types.ObjectId.isValid(fid)) {
        return handleError(res, 400, "Invalid Admin ID or Faculty ID format.");
    }
    
    try {
        // Check Admin ID
        const isValidAdminId = await adminModel.findById(adminid);
    
        if(!isValidAdminId) 
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        // Check Faculty ID
        const isValidFacultyId = await facultyModel.findById(fid);
    
        if(!isValidFacultyId){
            return handleError(res, 400, "Faculty not found with the provided ID.")
        }
            return handleError(res, 200, "Success", isValidFacultyId)
        
    } catch (error) {
        console.error("Error finding faculty by ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}



// Get all faculty by admin id
export const getAllFaculty= async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        const findAllFaculty = await facultyModel.find()
        if(findAllFaculty) {
            return handleError(res, 200, "Success", findAllFaculty)
        }
        
    } catch (error) {
        console.error("Error finding faculty by Admin ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}



// Delete faculty by admin and faculty ID
export const deleteFacultyById = async(req, res) => {
    const {adminid, fid} = req.params;

    // Validate input
    if (!adminid || !fid) {
        return handleError(res, 400, "Admin ID or Faculty ID not provided.");
    }

    // Check if IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid) || !mongoose.Types.ObjectId.isValid(fid)) {
        return handleError(res, 400, "Invalid Admin ID or Faculty ID format.");
    }

    try {
        // Check Admin ID
        const isValidAdminId = await adminModel.findById(adminid);
        if(!isValidAdminId) 
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        // Check & Delete Faculty ID
        const deletedFaculty = await facultyModel.findByIdAndDelete(fid);
        
        if(!deletedFaculty){
            return handleError(res, 400, "Faculty not found with the provided ID.")
        }

        // Delete Associated Courses
        const deleteAssociatedCourses = await courseModel.deleteMany({ facultyId: fid });
        const coursesDeleted = deleteAssociatedCourses.deletedCount;

        return handleError(
            res,
            200,
            `Faculty and ${coursesDeleted} associated course(s) deleted successfully.`
        );
        
    } catch (error) {
        // console.error("Error finding faculty by ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}



// Delete all faculty by Admin Id
export const deleteAllFacultyByAdmin = async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        const deleteAllFaculty = await facultyModel.deleteMany();
        if(deleteAllFaculty) {
            return handleError(res, 200, "Deleted All Faculties")
        }
        
    } catch (error) {
        // console.error("Error finding faculty by Admin ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}


// Delete all Courses by Admin Id
export const deleteAllCourses = async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        console.log(20)
        const deleteAllCourse = await courseModel.deleteMany();
        const coursesDeleted = deleteAllCourse.deletedCount;
        if(deleteAllCourse) {
            return handleError(
                res,
                200,
                `${coursesDeleted} course deleted successfully.`,
            );
        }
    } catch (error) {
        return handleError(res,500,"Internal Server Error")
    }
}


// get all Courses by Admin Id
export const getAllCourses = async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        const findCourses = await courseModel.find().populate('facultyId')
        if(findCourses) {
            return handleError(res, 200, " All Courses Found", findCourses)
        }
    } catch (error) {
        return handleError(res,500,"Internal Server Error")
    }
}



// Get all students by admin id
export const getAllStudent= async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        const findAllStudent = await studentModel.find()
        if(findAllStudent) {
            return handleError(res, 200, "Success", findAllStudent)
        }
        
    } catch (error) {
        console.error("Error finding Student by Admin ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}



// Delete all students by Admin Id
export const deleteAllStudent = async(req, res) => {
    const {adminid} = req.params
    
    if (!adminid) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if ID are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid)) {
        return handleError(res, 400, "Invalid Admin ID format.");
    }
    
    try {
        const isVarifyAdmin = await adminModel.findById(adminid)
        if(!isVarifyAdmin)
            return handleError(res, 400, "Admin not found with the provided ID.")
        const deleteAllStudent = await studentModel.deleteMany();
        const studentDeleted = deleteAllStudent.deletedCount;
        if(deleteAllStudent) {
            return handleError(
                res,
                200,
                `${studentDeleted} students deleted successfully.`,
            );
        }
    } catch (error) {
        return handleError(res,500,"Internal Server Error")
    }
}



// Delete student by admin and student ID
export const deleteStudentById = async(req, res) => {
    const {adminid, sid} = req.params;

    // Validate input
    if (!adminid || !sid) {
        return handleError(res, 400, "Admin ID or Student ID not provided.");
    }

    // Check if IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid) || !mongoose.Types.ObjectId.isValid(sid)) {
        return handleError(res, 400, "Invalid Admin ID or Student ID format.");
    }

    try {
        // Check Admin ID
        const isValidAdminId = await adminModel.findById(adminid);
        if(!isValidAdminId) 
            return handleError(res, 400, "Admin not found with the provided ID.")
        
        // Check & Delete Faculty ID
        const deletedStudent = await studentModel.findByIdAndDelete(sid);
        
        if(!deletedStudent){
            return handleError(res, 400, "Student not found with the provided ID.")
        }
        return handleError(res, 200, "Student Deleted fSuccessfully.", deletedStudent)
        
    } catch (error) {
        // console.error("Error finding faculty by ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}