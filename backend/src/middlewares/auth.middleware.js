import jwt from "jsonwebtoken";
import userModel from "../models/users.model.js";
import { getJwtSecret } from "../utils/jwt.js";

export async function authenticateToken(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let payload;
    try{
        payload = jwt.verify(token, getJwtSecret());
    } catch (err) {
        res.status(401).json({
            message:"Invalid Token",
            err: err.message
        })
        return;
    }

    if (!payload || typeof payload !== "object" || typeof payload.id !== "string") {
        return res.status(401).json({ message: "Invalid Token" });
    }

    try {
        const user = await userModel.findById(payload.id).select("_id role status");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if ((user.status ?? "active") === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked"
            });
        }

        req.user = {
            ...payload,
            id: user._id,
            role: user.role,
            status: user.status ?? "active"
        };
        return next();
    } catch (err) {
        return next(err);
    }
}

export function requireAdmin(req,res,next){
    if( req.user.role !== "admin"){
        return res.status(403).json({
            message:"Forbidden"
        })
    }
    next()
}
