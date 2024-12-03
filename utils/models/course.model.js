import mongoose  from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseTitle: {
        type: String,
        required: true
    },
    courseDescription: String,
    coursePdf: {
        type: String,
        required: true
    },
    courseAuthor: String,
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "facultyData",
        required: true
    }
},{timestamps: true})

const courseModel = mongoose.model("courses",courseSchema);

export default courseModel;