import Organization from "../models/Organization.js";
export const createOrganization = async(req,res)=>{
    try{
        const { name,description}=req.body;
        if(!name){
            return res.status(400).json({
                message :  "Organization name is required"
            });
        }

        const existingOrganization = await Organization.findOne({name});
        if(existingOrganization){
            return res.status(409).json({
                message: "Organization already exists"
            });
        }
        const organization = await Organization.create({
            name,description
        });
        return res.status(201).json({
            message : "Organization created successfully",
            organization   
        });
    }catch(error){
        console.error("Create organization error:", error.message);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};