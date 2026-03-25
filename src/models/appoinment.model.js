import mongoose from "mongoose";

const appoinmentSchema = new mongoose.Schema(
    {
        parentId: {
            type: Number,
            required: true,
            index: true,
        },

        teacherId: {
            type: Number,
            required: true,
            index: true,
        },

        date: {
            type: String, // "dd-mm-yyyy"
            required: true,
        },

        time: {
            type: String, // "HH:mm"
            required: true,
        },
        status: { 
            type: String, 
            default: "booked",
        }
    },
    { timestamps: true }
);

export default mongoose.model("appoinment", appoinmentSchema);