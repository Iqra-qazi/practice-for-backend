import userModel from "../models/users.model.js";
import bcrypt from "bcryptjs"
import { clearAuthCookie, setAuthCookie, signAuthToken } from "../utils/jwt.js";
import { serializeAuthResponse } from "../utils/authUser.js";

async function registerUser(req, res) {
   try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    if (Object.hasOwn(body, "role")) {
        return res.status(400).json({ message: "Role cannot be assigned during public signup." });
    }

    const { username,email, password } = body;

    const userAlreadyExists= await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(userAlreadyExists){
        return res.status(409).json({
            message:"User Already Exists"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user= await userModel.create({username,email, password:hash})
    const token = signAuthToken(user);

    setAuthCookie(res, token);

    return res.status(201).json(serializeAuthResponse(user));
   } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    
   }
}

async function loginUser(req, res) {
    const {username, email, password } = req.body;
    const user = await userModel.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(!user){
        return res.status(404).json({
            message:"User not found"
        })
    }
    if ((user.status ?? "active") === "blocked") {
        return res.status(403).json({
            success: false,
            message: "Your account has been blocked"
        });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        return res.status(401).json({
            message:"Invalid password"
        })
    }

    const token = signAuthToken(user);

    setAuthCookie(res, token);

    return res.status(200).json(serializeAuthResponse(user));

}

async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id)
            .select("_id username email role picture");
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        return res.status(200).json(serializeAuthResponse(user));
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

function logoutUser(_req, res) {
    clearAuthCookie(res);
    return res.status(204).end();
}

export { registerUser, loginUser, getCurrentUser, logoutUser };