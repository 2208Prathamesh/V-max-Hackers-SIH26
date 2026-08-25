import express from "express";

import {
    getProfile,
    updateProfile,
    deleteAccount
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.delete("/me", deleteAccount);

export default router;