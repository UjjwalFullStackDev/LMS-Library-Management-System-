
import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    facultyName: String,
    facultyEmail: {
        type: String,
        unique: true,
        required: true
    },
    facultyMobile: {
        type: String,
        required: true
    },
    facultyPassword: {
        type: String,
        minLength: 6,
        required: true
    },
    facultyProfile: String,
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "adminData",  // there passed admin model data collection name
        required: true
    }
}, {timestamps: true});

const facultyModel = mongoose.model("facultyData",facultySchema)

export default facultyModel;