import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import path from 'path'
import facultyModel from '../models/faculty.model.js';
import handleError from '../middleware/error_logs/handleError.js';
import adminModel from '../models/admin.model.js';
import mongoose from 'mongoose';
import courseModel from '../models/course.model.js';

// ! Upload media file
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


// ! create faculty API

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



// ! Token generation functions
function generateToken(userid){
    return jwt.sign({ userid }, process.env.SECRET_KEY, { expiresIn: '30s' });
}

function generateRefreshToken(userid){
    return jwt.sign({ userid }, process.env.SECRET_KEY, { expiresIn: '1m' });
}


// ! Token refresh functions
export const refresh = (req, res) => {
    const { refreshToken } = req.cookies;

    // Check if refresh token exists
    if (!refreshToken) {
        return handleError(res, 400, "Refresh token not found");
    }

    // Verify the refresh token
    jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return handleError(res, 400, "Refresh token expired or invalid");
        }

        // Generate a new access token
        const newAccessToken = generateToken(decoded.userid);

        // Set the new access token as a cookie
        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            maxAge: 2 * 60 * 1000, // 2 minutes
        });

        // Respond with success
        return res.status(200).json({
            message: "Token refreshed successfully",
            accessToken: newAccessToken,
        });
    });
};


// ! Faculty login controller
export const loginFaculty = async (req, res) => {
    const {facultyEmail, facultyPassword} = req.body;

    if(!facultyEmail || !facultyPassword) {
        return handleError(res, 400, "All field are required");
    }
    try {
        // Check if faculty exists
        const faculty = await facultyModel.findOne({ facultyEmail });
        if (!faculty) {
            return handleError(res, 400, "Invalid faculty email");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(facultyPassword, faculty.facultyPassword);
        if (!isPasswordValid) {
            return handleError(res, 400, "Invalid faculty password");
        }

        // Generate tokens
        const userid = faculty._id;
        const accessToken = generateToken(userid);
        const refreshToken = generateRefreshToken(userid);

        // Set cookies
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 1000, // 7 days
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 1000, // 7 days
        });

        // Respond with success
        return res.status(200).json({
            message: "Login Successful",
            faculty,
            accessToken,
            refreshToken,
        });

    } catch (error) {
        return handleError(res, 500, `Internal server error: ${error.message}`);
    }
}



// ! Update faculty by Admin and Faculty Id
export const updateFaculty = async(req, res) => {
    const {adminid, fid} = req.params;
    const {facultyName, facultyEmail, facultyMobile, adminId} = req.body;

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



// ! Get Course by faculty
export const getCourses = async(req, res) => {
    const { fid } = req.params;
   
    // Validate faculty ID format
    if (!fid || !mongoose.Types.ObjectId.isValid(fid)) {
        return handleError(res, 400, "Invalid Faculty ID format or Faculty ID not provided.");
    }

    // Check faculty ID in the database
    let isValidFaculty;
    try {
        isValidFaculty = await facultyModel.findById(fid);
        if (!isValidFaculty) {
            return handleError(res, 400, "Faculty not found with the provided ID.");
        }
        const findCourses = await courseModel.find({ facultyId: fid }).populate('facultyId');
        if(!findCourses || findCourses.length === 0)
            return handleError(res, 400, "Courses not found for this faculty.")
        return handleError(res, 200, "Courses found", findCourses)
    } catch (error) {
        return handleError(res, 500, `Database error while finding faculty: ${error.message}`);
    }
}


// ! Faculty password reset
export const resetFacultyPassword = async(req,res) => {
    const {fid} = req.params;
    const {facultyPassword, newPassword} = req.body;

    // Validate faculty Password
    if (!facultyPassword) {
        return handleError(res, 400, "Old password is requires.");
    }

    try {
        const isValidFaculty = await facultyModel.findById(fid);
        if(!isValidFaculty)
            return handleError(res, 400, "Faculty not found.");
        const comparePassword = await bcrypt.compare(facultyPassword, isValidFaculty.facultyPassword)
        if (!comparePassword)
            return handleError(res, 400, "Old Password is incorrect");
        if(facultyPassword === newPassword)
            return handleError(res, 400, "Please enter new password you haven't used before")

        // Hash the password
        const salt = await bcrypt.genSalt(12);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        const faculty = await facultyModel.findByIdAndUpdate(fid,{
            facultyPassword: newHashedPassword,
        });

        // Save admin to the database
        const saveFaculty = await faculty.save();
        if (!saveFaculty)
            return handleError(res, 400, "Cannot save faculty")
        return handleError(res, 201, "New faculty password created successfully")

        
    } catch (error) {
        return handleError(res, 500, `Database error while reseting faculty: ${error.message}`);
    }
}