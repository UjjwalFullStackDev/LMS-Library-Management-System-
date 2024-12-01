import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import path from 'path'
import handleError from '../middleware/error_logs/handleError.js';
import adminModel from '../models/admin.model.js';
import mongoose from 'mongoose';
import facultyModel from '../models/faculty.model.js'

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



// Delete faculty API by admin and faculty ID
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
        
        // Check Faculty ID
        const isValidFacultyId = await facultyModel.findByIdAndDelete(fid);
    
        if(!isValidFacultyId){
            return handleError(res, 400, "Faculty not found with the provided ID.")
        }
            return handleError(res, 200, "Delete Faculty Successfully", isValidFacultyId)
        
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



// Update faculty by Admin and Faculty Id
export const updateFaculty = async(req, res) => {
    const {adminid, fid} = req.params;
    const {facultyName, facultyEmail, facultyMobile, adminId} = req.body;
    const facultyProfile = req.file;

    // if(!facultyProfile) {
    //     return handleError(res,400, "Faculty Profile required")
    // }
    // if(!facultyName || !facultyEmail || !facultyMobile || !adminId){
    //     return handleError(res,400,"All fields are required")
    // }

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

        const checkIds = isValidAdminId._id.toString() !== adminId.toString();
        if(checkIds) {
            return handleError(res,400,"Invalid admin id from body field")
        }
        
        // Check Faculty ID
        const isValidFacultyId = await facultyModel.findByIdAndUpdate(fid, {facultyName, facultyEmail, facultyMobile, adminId}, {new:true});
    
        if(!isValidFacultyId){
            return handleError(res, 400, "Faculty not found or updated with the provided ID.")
        }
            return handleError(res, 200, "Faculty Updated Successfully", isValidFacultyId)
        
    } catch (error) {
        // console.error("Error finding faculty by ID:", error);
        return handleError(res,500,"Internal Server Error")
    }
}