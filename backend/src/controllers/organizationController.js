import Organization from "../models/Organization.js";
export const createOrganization = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Organization name and email are required"
      });
    }

    const existingOrganization = await Organization.findOne({ email });

    if (existingOrganization) {
      return res.status(409).json({
        message: "Organization with this email already exists"
      });
    }

    const organization = await Organization.create({
      name,
      email,
      address
    });

    return res.status(201).json({
      message: "Organization created successfully",
      organization
    });
  } catch (error) {
    console.error("Create organization error:", error.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};