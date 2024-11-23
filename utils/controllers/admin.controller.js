import bcrypt from 'bcrypt';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import path from 'path'
import handleError from '../middleware/error_logs/handleError.js';
import adminModel from '../models/admin.model.js';

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