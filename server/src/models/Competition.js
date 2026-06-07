import mongoose from "mongoose";

const competitionSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
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
    },
    rounds: [
      {
        externalId: Number,
        name: {
          type: String,
          required: true,
          trim: true
        },
        short: {
          type: String,
          trim: true
        }
      }
    ]
  },
  { timestamps: true }
);

export const Competition =
  mongoose.models.Competition ?? mongoose.model("Competition", competitionSchema);
