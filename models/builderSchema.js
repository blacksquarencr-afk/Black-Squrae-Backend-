// import mongoose from "mongoose";

// const builderSchema = new mongoose.Schema({
//     builderName: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     builderImage: {
//         type: String,
//         default: "", // URL or path to builder image
//     },
//     totalProjects: {
//         type: Number,
//         default: 0,
//     },
//     experienceInYears: {
//         type: Number,
//         default: 0,
//     },
//     readyToMoveProjects: {
//         type: Number,
//         default: 0,
//     },
//     underConstruction: {
//         type: Number,
//         default: 0,
//     },
//     newLaunch: {
//         type: Number,
//         default: 0,
//     },
//     isActive: {
//         type: Boolean,
//         default: true,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// const Builder = mongoose.model("Builder", builderSchema);
// export default Builder;


import mongoose from "mongoose";

const builderSchema = new mongoose.Schema({

    builderName: {
        type: String,
        required: true,
        trim: true,
    },

    builderImage: {
        type: String,
        default: "",
    },

    establishedSince: {   // frontend: Established Since
        type: Number,
        required: true,
    },

    projectsCompleted: {  // frontend: Projects Completed
        type: Number,
        default: 0,
    },

    projectsUnderConstruction: {  // frontend: Under Construction
        type: Number,
        default: 0,
    },

    description: {   // frontend: Description
        type: String,
        default: "",
    },

    isActive: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const Builder = mongoose.model("Builder", builderSchema);

export default Builder;