import courseModel from '../models/course.model.js';
import multer from 'multer';
import path from 'path';
import facultyModel from '../models/faculty.model.js';
import handleError from '../middleware/error_logs/handleError.js';
import mongoose from 'mongoose';

const coursePath = path.join("public/course/");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, coursePath)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const courseMulter = multer({ storage: storage });



// Create course API
export const createCourse = async (req, res) => {
    const { courseTitle, courseDescription, courseAuthor, facultyId } = req.body;
    const coursePdf = req.file;
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
    } catch (error) {
        return handleError(res, 500, `Database error while finding faculty: ${error.message}`);
    }

    // Validate course PDF
    if (!coursePdf) {
        return handleError(res, 400, "Course PDF is required.");
    }

    // Validate required fields
    if (!courseTitle || !courseDescription || !courseAuthor || !facultyId) {
        return handleError(res, 400, "All fields are required.");
    }

    // Ensure body facultyId matches params fid
    const checkFacultyBodyId = isValidFaculty._id.toString() !== facultyId.toString();
    if (checkFacultyBodyId) {
        return handleError(res, 400, "Invalid faculty ID in body.");
    }

    try {
        const storeCourse = new courseModel({
            courseTitle,
            courseDescription,
            courseAuthor,
            coursePdf: coursePdf.filename,
            facultyId,
        });

        const saveCourse = await storeCourse.save();
        if (!saveCourse) {
            return handleError(res, 400, "Error when saving course.");
        }

        return handleError(res, 201, "Course created", saveCourse);
    } catch (error) {
        return handleError(res, 500, `Internal Server Error: ${error.message}`);
    }
};
