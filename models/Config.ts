import mongoose, { Document } from "mongoose";

export interface IConfig extends Document {
  maintenanceMode: boolean;
  isSpinPaused?: boolean;
  isQuizPaused?: boolean;
}

const ConfigSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    isSpinPaused: { type: Boolean, default: false },
    isQuizPaused: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Export the model (avoid recompilation issues in dev)
export default mongoose.models.Config ||
  mongoose.model<IConfig>("Config", ConfigSchema);
