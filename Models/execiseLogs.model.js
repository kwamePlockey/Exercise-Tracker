const mongoose = require("mongoose")


const exerciseRoutineSchema = mongoose.Schema(
    {
        username: {
            type : String,
            required : true
        },
        description: {
            type: String,
            required : true
        },
        duration: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: false
        },
        userId: {
            type: String,
            required: true
        }
    }
      
)

const Exercise = mongoose.model("Log", exerciseRoutineSchema)

module.exports = Exercise;