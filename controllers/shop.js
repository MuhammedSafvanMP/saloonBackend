const shopModel = require("../models/shop");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");
const userModel  = require("../models/user");

//create shop
exports.create = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    description,
    email,
    gst,
    category,
     services,
     userId,
        openTime,
          closeTime
  } = req.body;


  if (
    !name ||
    !phone || 
    !category ||
    !services ||
    !email  ||
    !location ||
    !userId ||
     !openTime ||
     !closeTime
    
  ) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const images = req.cloudinaryImageUrl;
    const image = req.cloudinaryImageUrl;

    if (!image) {
    return res.status(400).json({ message: "No banner uploaded" });
  }

  const shop = await shopModel.create({
    name,
    phone,
    location,
    description,
    email,
    gst,
    photos: images,
    banner: image,
    services,
    category,
    userId,
     openTime,
          closeTime
  });

  if (!shop) {
    return res.status(400).json({ message: "Shop not created" });
  }

    await userModel.findByIdAndUpdate(
      userId,
      { role: "owner" },
      { new: true, runValidators: true }
    );
  


  const admin = await userModel.findOne({ role: "admin" });

  // Create notification (after successful creation)
  await notficationModel.create({
    adminId: admin?._id,
    message: `New shop created: ${shop?.name}.`,
  });

  return res.status(201).json({ message: "shop created", status: 201 });
});

// get all  shop

exports.getAll = asyncHandler(async (req, res) => {
  const shop = await shopModel
    .find()
    .populate("userId");
  res.status(200).json(shop);
});


exports.getAllActive = asyncHandler(async (req, res) => {
  const shop = await shopModel.find({ isActive: true }).populate("userId");
  res.status(200).json(shop);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const shop = await shopModel
    .findById(req.params.id)
    .populate("userId");
  res.status(200).json(shop);
});

//delete shop
exports.delete = asyncHandler(async (req, res) => {
  const shop = await shopModel.findByIdAndDelete(req.params.id);


  const admin = await userModel.findOne({ role: "admin" });

  await notficationModel.create({
    adminId: admin?._id,
    message: `${shop?.name} has been deleted.`,
  });
  res.status(200).json({ message: "Shop deleted", status: 200 });
});



exports.update = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    location,
    description,
    email,
    gst,
    category,
     services,
      newBanner,
      existingPhotos,
       openTime,
          closeTime
 
  } = req.body;

  const newImages = req.cloudinaryImageUrl || [];
    const image = req.cloudinaryImageUrl


  const shop = await shopModel.findById(req.params.id);
  if (!shop) {
    return res.status(404).json({ message: "shop not found" });
  }

    if (email && email !== shop.email) {
      const emailExists = await shopModel.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }
  
    // Update only the fields provided
    if (name) user.name = name;
    if (email) user.email = email;

  // Basic fields
  if (name) shop.name = name;
  if (phone) shop.phone = phone;
  if (description) shop.description = description;
  if (category) shop.category = category;
  if( openTime) shop.openTime = openTime;
  if(closeTime) shop.closeTime = closeTime;
  if(newBanner) shop.banner = newBanner;
    if (image) shop.banner = image;

  if(gst) shop.gst = gst;

    if (location) {
    if (location.street) shop.location.street = location.street;
    if (location.place) shop.location.place = location.place;
    if (location.pincode) shop.location.pincode = location.pincode;
  }


  // Helper to parse FormData string/array
  const parseField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [field];
    }
  };

  // ✅ Update amenities, transportation, restaurants, nearbyPlaces
  shop.services = parseField(services);


  // ✅ Merge photos
  let finalPhotos = [];
  if (existingPhotos) {
    finalPhotos = JSON.parse(existingPhotos);
  }
  if (newImages.length > 0) {
    finalPhotos = finalPhotos.concat(newImages);
  }
  shop.photos = finalPhotos;

  const updatedshop = await shop.save();

  const admin = await adminModel.findOne({ role: "admin" });
  await notficationModel.create({
    adminId: admin?._id,
    message: `${shop.name} has been updated.`,
  });

  res.status(200).json({
    message: "shop updated successfully",
    shop: updatedshop,
    status: 200,
  });
});

// block and unblock shop

exports.block = async (req, res) => {
  try {
    const shop = await shopModel.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({ message: "shop not found" });
    }

    shop.isActive = !shop.isActive;

    await shop.save();

    const admin = await adminModel.findOne({ role: "admin" });

    await notficationModel.create({
      adminId: admin?._id,
      message: `${shop?.name} ${
        shop.isActive !== true ? "blocked" : "unblocked"
      }`,
    });

    res.json({ shop, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update rating

exports.updateRating = async (req, res) => {
  try {
    const { id } = req.params;

    const { userId, ratingValue } = req.body;

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const shop = await shopModel.findById(id);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    // Check if user already rated
    const existingRating = shop.rating.details.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingRating) {
      // Update rating
      existingRating.value = ratingValue;
    } else {
      // Add new rating
      shop.rating.details.push({ userId, value: ratingValue });
      shop.rating.count += 1;
    }

    // Recalculate average
    const total = shop.rating.details.reduce((sum, r) => sum + r.value, 0);
    shop.rating.average = parseFloat(
      (total / shop.rating.details.length).toFixed(2)
    );

    await shop.save();

    res.status(200).json({
      message: "Shop rating updated successfully",
      rating: shop.rating,
      status: 200,
    });
  } catch (error) {
    console.error("Rating error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
