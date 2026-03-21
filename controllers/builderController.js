import Builder from "../models/builderSchema.js";

// Create a new builder
// export const createBuilder = async (req, res) => {
//     try {
//         const { builderName } = req.body;

//         // Handle image upload if provided
//         let builderImage = "";
//         if (req.file) {
//             builderImage = req.file.path;
//         } else if (req.body.builderImage) {
//             builderImage = req.body.builderImage;
//         }

//         // Create new builder
//         const newBuilder = new Builder({
//             builderName: builderName.trim(),
//             builderImage,
//             totalProjects: req.body.totalProjects || 0,
//             experienceInYears: req.body.experienceInYears || 0,
//             readyToMoveProjects: req.body.readyToMoveProjects || 0,
//             underConstruction: req.body.underConstruction || 0,
//             newLaunch: req.body.newLaunch || 0,
//             isActive: true,
//         });

//         await newBuilder.save();

//         return res.status(201).json({
//             message: "Builder created successfully",
//             builder: newBuilder,
//         });
//     } catch (error) {
//         console.error("Error creating builder:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };


export const createBuilder = async (req, res) => {
    try {

        const {
            builderName,
            establishedSince,
            projectsCompleted,
            projectsUnderConstruction,
            description
        } = req.body;

        if (!builderName || !establishedSince) {
            return res.status(400).json({
                message: "Builder Name and Established Since are required"
            });
        }

        let builderImage = "";

        if (req.file) {
            builderImage = req.file.path;
        } else if (req.body.builderImage) {
            builderImage = req.body.builderImage;
        }

        const builder = new Builder({
            builderName: builderName.trim(),
            builderImage,
            establishedSince,
            projectsCompleted: projectsCompleted || 0,
            projectsUnderConstruction: projectsUnderConstruction || 0,
            description: description || "",
        });

        await builder.save();

        res.status(201).json({
            message: "Builder created successfully",
            builder
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};
// Get all builders
// export const getAllBuilders = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, isActive } = req.query;

//         let filter = {};
//         if (isActive !== undefined) {
//             filter.isActive = isActive === "true";
//         }

//         const skip = (page - 1) * limit;

//         const builders = await Builder.find(filter)
//             .skip(skip)
//             .limit(parseInt(limit))
//             .sort({ createdAt: -1 });

//         const totalCount = await Builder.countDocuments(filter);

//         return res.status(200).json({
//             message: "Builders retrieved successfully",
//             builders,
//             pagination: {
//                 currentPage: parseInt(page),
//                 limit: parseInt(limit),
//                 totalCount,
//                 totalPages: Math.ceil(totalCount / limit),
//             },
//         });
//     } catch (error) {
//         console.error("Error fetching builders:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

export const getAllBuilders = async (req, res) => {
    try {

        const builders = await Builder.find({ isActive: true })
            .sort({ createdAt: -1 });

        const formattedBuilders = builders.map(builder => {

            const experience =
                new Date().getFullYear() - builder.establishedSince;

            return {
                id: builder._id,
                builderName: builder.builderName,
                builderImage: builder.builderImage,
                establishedSince: builder.establishedSince,
                experience: experience,
                projectsCompleted: builder.projectsCompleted,
                projectsUnderConstruction: builder.projectsUnderConstruction,
                description: builder.description,
                createdAt: builder.createdAt
            };
        });

        res.status(200).json(formattedBuilders);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching builders",
            error: error.message
        });
    }
};
// Get builder by ID
export const getBuilderById = async (req, res) => {
    try {
        const { builderId } = req.params;

        const builder = await Builder.findById(builderId);

        if (!builder) {
            return res.status(404).json({ message: "Builder not found" });
        }

        return res.status(200).json({
            message: "Builder retrieved successfully",
            builder,
        });
    } catch (error) {
        console.error("Error fetching builder:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// // Update builder by ID
// export const updateBuilder = async (req, res) => {
//     try {
//         const { builderId } = req.params;
//         const { builderName, isActive, totalProjects, experienceInYears, readyToMoveProjects, underConstruction, newLaunch } = req.body;

//         const builder = await Builder.findById(builderId);

//         if (!builder) {
//             return res.status(404).json({ message: "Builder not found" });
//         }

//         // Update fields
//         if (builderName) builder.builderName = builderName.trim();
//         if (isActive !== undefined) builder.isActive = isActive;
//         if (totalProjects !== undefined) builder.totalProjects = totalProjects;
//         if (experienceInYears !== undefined) builder.experienceInYears = experienceInYears;
//         if (readyToMoveProjects !== undefined) builder.readyToMoveProjects = readyToMoveProjects;
//         if (underConstruction !== undefined) builder.underConstruction = underConstruction;
//         if (newLaunch !== undefined) builder.newLaunch = newLaunch;

//         // Handle image update
//         if (req.file) {
//             builder.builderImage = req.file.path;
//         } else if (req.body.builderImage) {
//             builder.builderImage = req.body.builderImage;
//         }

//         builder.updatedAt = new Date();

//         await builder.save();

//         return res.status(200).json({
//             message: "Builder updated successfully",
//             builder,
//         });
//     } catch (error) {
//         console.error("Error updating builder:", error);
//         return res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

// Update builder by ID
export const updateBuilder = async (req, res) => {
    try {

        const { builderId } = req.params;

        const {
            builderName,
            establishedSince,
            projectsCompleted,
            projectsUnderConstruction,
            description,
            isActive
        } = req.body;

        // find builder
        const builder = await Builder.findById(builderId);

        if (!builder) {
            return res.status(404).json({
                message: "Builder not found"
            });
        }

        // update fields safely

        if (builderName !== undefined)
            builder.builderName = builderName.trim();

        if (establishedSince !== undefined)
            builder.establishedSince = establishedSince;

        if (projectsCompleted !== undefined)
            builder.projectsCompleted = projectsCompleted;

        if (projectsUnderConstruction !== undefined)
            builder.projectsUnderConstruction = projectsUnderConstruction;

        if (description !== undefined)
            builder.description = description;

        if (isActive !== undefined)
            builder.isActive = isActive;

        // handle image update
        if (req.file) {
            builder.builderImage = req.file.path;
        } else if (req.body.builderImage !== undefined) {
            builder.builderImage = req.body.builderImage;
        }

        builder.updatedAt = new Date();

        await builder.save();

        // calculate experience
        const experience =
            builder.establishedSince
                ? new Date().getFullYear() - builder.establishedSince
                : 0;

        return res.status(200).json({
            message: "Builder updated successfully",

            builder: {
                id: builder._id,
                builderName: builder.builderName,
                builderImage: builder.builderImage,
                establishedSince: builder.establishedSince,
                experience: experience,
                projectsCompleted: builder.projectsCompleted,
                projectsUnderConstruction: builder.projectsUnderConstruction,
                description: builder.description,
                isActive: builder.isActive,
                updatedAt: builder.updatedAt
            }
        });

    } catch (error) {

        console.error("Error updating builder:", error);

        return res.status(500).json({
            message: "Server error",
            error: error.message
        });

    }
};
// Delete builder by ID
export const deleteBuilder = async (req, res) => {
    try {
        const { builderId } = req.params;

        const builder = await Builder.findByIdAndDelete(builderId);

        if (!builder) {
            return res.status(404).json({ message: "Builder not found" });
        }

        return res.status(200).json({
            message: "Builder deleted successfully",
            builder,
        });
    } catch (error) {
        console.error("Error deleting builder:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Search builders by name
export const searchBuilders = async (req, res) => {
    try {
        const { query } = req.query;

        const builders = await Builder.find({
            builderName: { $regex: query, $options: "i" },
            isActive: true,
        }).limit(20);

        return res.status(200).json({
            message: "Search results retrieved successfully",
            builders,
        });
    } catch (error) {
        console.error("Error searching builders:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Deactivate builder (soft delete)
export const deactivateBuilder = async (req, res) => {
    try {
        const { builderId } = req.params;

        const builder = await Builder.findByIdAndUpdate(
            builderId,
            { isActive: false, updatedAt: new Date() },
            { new: true }
        );

        if (!builder) {
            return res.status(404).json({ message: "Builder not found" });
        }

        return res.status(200).json({
            message: "Builder deactivated successfully",
            builder,
        });
    } catch (error) {
        console.error("Error deactivating builder:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
