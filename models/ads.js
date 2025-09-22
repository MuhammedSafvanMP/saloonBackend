const mongoose = require("mongoose");

const adSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
     userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
      },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ad", adSchema);
