const bookingModel = require("../models/booking");
const asyncHandler = require("express-async-handler");
const notficationModel = require("../models/notfication");
const shopModel = require("../models/shop");

//create booking
exports.create = asyncHandler(async (req, res) => {
  const { userId,  shopId, checkInDate , time } = req.body;

  if (!userId || !time || !checkInDate || !shopId) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const booking = await bookingModel.create({
    userId,
    roomId,
    shopId,
    checkInDate,
    time
    // checkOutDate,
  });

  if (!booking) {
    return res.status(400).json({ message: "Booking not created" });
  }

  // Fetch hostel details
  const shop = await shopModel.findById(shopId);


  if (shop) {
    await notficationModel.create({
      adminId: shop?.userId,
      message: `New booking created at ${checkInDate}.`,
    });
  }
  
    hostel.bookingCount += 1; 
    hostel.save();

  return res.status(201).json({ message: "Booking created", status: 201 });
});

// get all superadmin booking

exports.getAllAdmin = asyncHandler(async (req, res) => {

  const bookings = await bookingModel
    .find()
    .populate({
      path: "shopId",
      model: "Shop",
    })
    .populate({
      path: "userId",
      model: "User",
    });

  res.status(200).json(bookings);
});

// get all bookings
exports.getAllbooking = asyncHandler(async (req, res) => {
  const booking = await bookingModel.find().populate("shopId userId");
  res.status(200).json(booking);
});



// get all booking under owner
exports.getAllUserBooking = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  const bookings = await bookingModel
    .find({userId: userId}).populate("shopId");
    
  res.status(200).json(bookings);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const booking = await bookingModel
    .findById(req.params.id)
    .populate("userId shopId");
  res.status(200).json(booking);
});

//delete booking
exports.delete = asyncHandler(async (req, res) => {
   
    await bookingModel.findByIdAndDelete(req.params.id);


    //  await notficationModel.create({
    //   adminId: hostel?.,
    //   ownerId: hostel.ownerId,
    //   message: `User booking deleted.`,
    // });

  res.status(200).json({ message: "booking deleted", status: 200 });
});

// Update booking (partial update)
exports.update = asyncHandler(async (req, res) => {
  const { checkInDate, status, paymentStatus } = req.body;

  const booking = await bookingModel.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "booking not found" });
  }

  if (checkInDate) booking.checkInDate = checkInDate;
  // if (checkOutDate) booking.checkOutDate = checkOutDate;
  if (status) booking.status = status;
  if (paymentStatus) booking.paymentStatus = paymentStatus;

  const updatedbooking = await booking.save();

  // Fetch hostel details

  // if (status) {
  //   await notficationModel.create({
  //     adminId: hostel?.superAdminId,
  //     ownerId: hostel.ownerId,
  //     message: `${updatedbooking?.status} booking at ${hostel.name}.`,
  //   });
  // }

  res.status(200).json({
    message: "booking updated successfully",
    booking: updatedbooking,
    status: 200,
  });
});
