import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    competitionId: {
      type: String,
      required: true
    },
    stage: String,
    round: {
      name: String,
      number: Number
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
      required: true
    },
    awayTeamId: {
      type: String,
      required: true
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
