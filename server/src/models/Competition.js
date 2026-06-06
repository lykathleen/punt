import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sport: {
      type: String,
      default: "football",
      trim: true
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming"
    }
  },
  { timestamps: true }
);

export const Competition =
  mongoose.models.Competition ?? mongoose.model("Competition", competitionSchema);
