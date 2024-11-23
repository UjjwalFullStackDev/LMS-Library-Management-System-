import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import path from 'path'
import facultyModel from '../models/faculty.model.js';
import handleError from '../middleware/error_logs/handleError.js';
import adminModel from '../models/admin.model.js';

const facultyPath = path.join("public/faculty/")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, facultyPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const facultyMulter = multer({ storage: storage })

export const createFaculty = async(req, res) => {
    const {adminid} = req.params;
    const {facultyName, facultyEmail, facultyMobile, facultyPassword, adminId} = req.body;
    const facultyProfile = req.file;

    if(!facultyProfile) {
        return handleError(res, 400, "Faculty profile is require")
    }

    // Validate input fields
    if (!facultyName || !facultyEmail || !facultyMobile || !facultyPassword || !adminId) {
        return handleError(res, 400, "All field are required");
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
        const checkEmail = await facultyModel.findOne({ facultyEmail: facultyEmail });
        // console.log(checkEmail)
        if (checkEmail) {
            return handleError(res, 400, "Email already exist");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(facultyPassword, salt);

        const faculty = new facultyModel({
            facultyName,
            facultyEmail,
            facultyMobile,
            facultyPassword: hashedPassword,
            facultyProfile: facultyProfile.filename,
            adminId
        });

        // Save admin to the database
        const saveFaculty = await faculty.save();
        if (!saveFaculty)
            return handleError(res, 400, "Cannot save faculty")

        // Generate a token
        const token = jwt.sign({ userID: saveFaculty._id }, process.env.SECRET_KEY, { expiresIn: "4d" });

        // Return success response
        return handleError(res, 201, "faculty created successfully", saveFaculty, token)

    } catch (e) {
        return handleError(res, 500, `internal error ${e}`)
    }
}