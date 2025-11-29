import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fid: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pfp: {
      type: String,
    },
    earned: {
      type: Number,
      default: 0,
    },
    invited: {
      type: Number,
      default: 0,
    },
    refer_income: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
