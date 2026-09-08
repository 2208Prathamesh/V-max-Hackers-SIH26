import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authentication required");
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 401;
            throw error;
        }

        req.user = user;

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.message = "Invalid token";
        }

        if (error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.message = "Token expired";
        }

        next(error);
    }
};

export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            const error = new Error(`Forbidden: ${role} role required`);
            error.statusCode = 403;
            return next(error);
        }
        next();
    };
};

export default authMiddleware;