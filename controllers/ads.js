const adsModel = require("../models/ads");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");
const userModel  = require("../models/user");

//create ads
exports.create = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const image = req.cloudinaryImageUrl;
  if (!image) {
    return res.status(400).json({ message: "No ads uploaded" });
  }

  // Find existing ads
  let ads = await adsModel.findOne({ userId }).populate("userId");

  if (!ads) {
    // Create new ad
    ads = await adsModel.create({ image, userId });
  } else {
    // Update existing ad
    ads.image = image;
    await ads.save();
  }

  // Find admin for notification
  const admin = await userModel.findOne({ role: "admin" });

  if (admin) {
    await notficationModel.create({
      adminId: admin._id,
      message: `New ad created or updated: ${ads.userId?.name || "Unknown User"}.`,
    });
  }

  return res.status(201).json({ message: "Ad saved successfully", status: 201 });
});


// get all  ads

exports.getAll = asyncHandler(async (req, res) => {
  const ads = await adsModel
    .find()
    .populate("userId");
  res.status(200).json(ads);
});


exports.getAllActive = asyncHandler(async (req, res) => {
  const ads = await adsModel.find({ isActive: true }).populate("userId");
  res.status(200).json(ads);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const ads = await adsModel
    .findById(req.params.id)
    .populate("userId");
  res.status(200).json(ads);
});

//delete ads
exports.delete = asyncHandler(async (req, res) => {
  const ads = await adsModel.findByIdAndDelete(req.params.id).populate("userId");

  const admin = await userModel.findOne({ role: "admin" });

  await notficationModel.create({
    adminId: admin?._id,
    message: `${ads.userId.name} has been deleted.`,
  });
  res.status(200).json({ message: "ads deleted", status: 200 });
});





// block and unblock shop

exports.block = async (req, res) => {
  try {
    const ads = await adsModel.findById(req.params.id).populate("userId");

    if (!ads) {
      return res.status(404).json({ message: "ads not found" });
    }

    ads.isActive = !ads.isActive;

    await ads.save();

    const admin = await adsModel.findOne({ role: "admin" });

    await notficationModel.create({
      adminId: admin?._id,
      message: `${ads?.userId?.name} ${
        shop.isActive !== true ? "blocked" : "unblocked"
      }`,
    });

    res.json({ shop, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

