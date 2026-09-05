import User from "../models/User.js";
import { hashPassword } from "../utils/password.js";

export const register = async(req,res)=>{
    try{
        const{name,email,password,role,organizationID,departmentID} = req.body;
        if(!name || !email || !password || !role || !organizationId){
            return res.status(400).json({message:"Required feilds are missing"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).json({
                message : "User with this email already exists"
            });
        }
        const passwordHash = await hashPassword(password);
        const user = await user.create({
            name,email,passwordHash,role,organizationID,departmentID
        });

        return res.status(201).json({
            message : "User registered successfully",
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            organizationId: user.organizationId,
            departmentId: user.departmentId,
            status: user.status
        });
    }
    catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};