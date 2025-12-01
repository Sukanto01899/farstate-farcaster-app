import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    task_name: {
      type: String,
      default: "",
    },
    task_url: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "",
    },
    type: {
      enum: ["like", "cast", "recast", "retweet", "tweet", "follow"],
    },
    completed_by: {
      type: Array,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
