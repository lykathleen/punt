import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    competitionId: {
      type: String,
      required: true
    },
    stage: String,
    venue: String,
    round: {
      externalId: Number,
      name: String,
      number: Number,
      short: String
    },
    kickoffTime: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "finished"],
      default: "scheduled"
    },
    homeTeamId: {
      type: String,
      default: null
    },
    awayTeamId: {
      type: String,
      default: null
    },
    score: {
      home: Number,
      away: Number
    }
  },
  { timestamps: true }
);

matchSchema.index({ competitionId: 1, kickoffTime: 1 });
matchSchema.index({ competitionId: 1, "round.number": 1, kickoffTime: 1 });
matchSchema.index({ status: 1 });

export const Match = mongoose.models.Match ?? mongoose.model("Match", matchSchema);
