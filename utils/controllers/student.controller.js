import multer from "multer";
import bcrypt from 'bcrypt';
import path from 'path';
import jwt from 'jsonwebtoken'
import adminModel from "../models/admin.model.js";
import studentModel from "../models/student.model.js";
import handleError from "../middleware/error_logs/handleError.js";
import mongoose from "mongoose";


// Upload media file
const studentPath = path.join("public/students/")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, studentPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const studentMulter = multer({ storage: storage })


//create faculty API

export const createStudent = async(req, res) => {
    const {adminid} = req.params;
    const {studentName, studentEmail, studentMobile, studentPassword, studentConformPass, studentAddress, enrollment, selectCourse, studentEducation, adminId} = req.body;
    const studentProfile = req.file;

    if(!studentProfile) {
        return handleError(res, 400, "Student profile is require")
    }

    // Validate input fields
    if (!studentName || !studentEmail || !studentMobile || !studentPassword || !studentConformPass || !studentAddress || !enrollment || !selectCourse || !studentEducation || !adminId) {
        return handleError(res, 400, "All fields are required");
    }

    if(studentPassword !== studentConformPass) {
        return handleError(res, 400, "Password not match");
    }

    try {
        // Verify admin Id
        const verifyAdminId = await adminModel.findById(adminid)
        if(!verifyAdminId) {
            return handleError(res, 400, "Invalid admin id");
        }
        
        // Checking header id with the body admin Id
        if(verifyAdminId._id.toString() !== adminId.toString()) {
            return handleError(res, 400, "admin id invalid or mismatch")
        }

        // Check if the email already exists
        const checkEmail = await studentModel.findOne({ studentEmail: studentEmail });
        if (checkEmail) {
            return handleError(res, 400, "Email already exist");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(studentPassword, salt);

        const student = new studentModel({
            studentName,
            studentEmail,
            studentMobile,
            studentPassword: hashedPassword,
            studentAddress,
            enrollment,
            selectCourse,
            studentEducation,
            adminId
        });

        // Save admin to the database
        const saveStudent = await student.save();
        if (!saveStudent)
            return handleError(res, 400, "Cannot save student")

        // Generate a token
        const token = jwt.sign({ userID: saveStudent._id }, process.env.SECRET_KEY, { expiresIn: "4d" });

        // Return success response
        return handleError(res, 201, "faculty created successfully", saveStudent, token)

    } catch (e) {
        return handleError(res, 500, `internal error ${e}`)
    }
}


//login faculty API

export const loginStudent = async (req, res) => {
    const {studentEmail, studentPassword} = req.body;

    if(!studentEmail || !studentPassword) {
        return handleError(res, 400, "All field are required");
    }
    try {
        const checkEmail = await studentModel.findOne({studentEmail});
        if(!checkEmail)
            return handleError(res, 400, "Invalid student email");
        
        const comparePass = await bcrypt.compare(studentPassword, checkEmail.studentPassword)
        
        if(!comparePass) {
            return handleError(res, 400, "Invalid student password");
        }else{
            return handleError(res, 200, "Login Successfull");
        }

    } catch (e) {
        return handleError(res, 500, `internal error ${e}`)
    }
}


// Update student by Admin and sid Id
export const updateStudent = async(req, res) => {
    const {adminid, sid} = req.params;
    const {studentName, studentEmail, studentMobile, studentAddress, studentEducation, adminId} = req.body;

    // Validate input
    if (!adminid || !sid) {
        return handleError(res, 400, "Admin ID or student ID not provided.");
    }

    // Validate input
    if (!adminId) {
        return handleError(res, 400, "Admin ID not provided.");
    }

    // Check if IDs are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(adminid) || !mongoose.Types.ObjectId.isValid(sid)) {
        return handleError(res, 400, "Invalid Admin ID or student ID format.");
    }

    try {
        // Check Admin ID
        const isValidAdminId = await adminModel.findById(adminid);
        if(!isValidAdminId) 
            return handleError(res, 400, "Admin not found with the provided ID.")

        const checkIds = isValidAdminId._id.toString() !== adminId.toString();
        if(checkIds) {
            return handleError(res,400,"Invalid admin id from body field")
        }
        
        // Check student ID
        const isValidstudentId = await studentModel.findByIdAndUpdate(sid, {studentName, studentEmail, studentMobile, studentAddress, studentEducation, adminId}, {new:true});
    
        if(!isValidstudentId){
            return handleError(res, 400, "student not found or updated with the provided ID.")
        }
            return handleError(res, 200, "student Updated Successfully", isValidstudentId)
        
    } catch (error) {
        // console.error("Error finding student by ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}