
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    studentName: String,
    studentEmail: {
        type: String,
        unique: true,
        required: true
    },
    studentMobile: {
        type: String,
        required: true
    },
    studentPassword: {
        type: String,
        minLength: 6,
        required: true
    },
    studentAddress: {
        type: String,
        required: true
    },
    enrollment: {
        type: String,
        required: true
    },
    selectCourse: {
        type: String,
        required: true
    },
    studentEducation: {
        type: String,
        required: true
    },
    studentProfile: String,
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminData",  // there passed admin model data collection name
        required: true
    }
}, {timestamps: true});

const studentModel = mongoose.model("studentData",studentSchema)

export default studentModel;