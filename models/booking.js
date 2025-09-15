const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
    checkInDate: { type: Date, required: true },
    time: {type: String},
    // checkOutDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },
      paymentMethod: {
      type: String,
      enum: ["cash", "card", "online", "wallet", null],
      default: null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
