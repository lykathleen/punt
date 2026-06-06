import mongoose from "mongoose";

const leaderboardCurrentSchema = new mongoose.Schema(
  {
    competitionId: {
      type: String,
      required: true
    },
    entries: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        points: Number,
        rank: Number
      }
    ]
  },
  { timestamps: true }
);

leaderboardCurrentSchema.index({ competitionId: 1 });

export const LeaderboardCurrent =
  mongoose.models.LeaderboardCurrent ??
  mongoose.model("LeaderboardCurrent", leaderboardCurrentSchema);
