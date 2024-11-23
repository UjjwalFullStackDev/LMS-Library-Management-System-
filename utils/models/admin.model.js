
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    adminName: String,
    adminEmail: {
        type: String,
        unique: true,
        required: true
    },
    adminPassword: {
        type: String,
        minLength: 6,
        // maxLength: 12,
        required: true
    },
    adminProfile: String
});

const adminModel = mongoose.model("adminData",adminSchema)

export default adminModel;