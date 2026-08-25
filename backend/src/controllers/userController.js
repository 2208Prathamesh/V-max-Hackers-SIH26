import User from "../models/User.js";

const DEMO_USER_ID = "6a8d33ee091ba198bd2c4ec9";
// GET /api/users/profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(DEMO_USER_ID)
            .select("-passwordHash");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};


// PUT /api/users/profile
export const updateProfile = async (req, res) => {
    try {
        const { name, language, timezone } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (language !== undefined) {
            user.language = language;
        }

        if (timezone !== undefined) {
            user.timezone = timezone;
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage,
                language: user.language,
                timezone: user.timezone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};


// POST /api/users/profile/image
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // req.file.path depends on the storage configuration
        user.profileImage = req.file.path;

        await user.save();

        res.status(200).json({
            message: "Profile image uploaded successfully",
            profileImage: user.profileImage
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to upload profile image",
            error: error.message
        });
    }
};


// DELETE /api/users/account
export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.status(200).json({
            message: "Account deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete account",
            error: error.message
        });
    }
};