import mongoose from "mongoose";

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    competitionId: {
      type: String,
      required: true
    },
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    },
    type: {
      type: String,
      enum: ["pre_match", "post_match"],
      required: true
    },
    entries: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        points: Number,
        rank: Number,
        deltaPoints: Number,
        deltaRank: Number
      }
    ]
  },
  { timestamps: true }
);

leaderboardSnapshotSchema.index({
  competitionId: 1,
  matchId: 1,
  type: 1
});

export const LeaderboardSnapshot =
  mongoose.models.LeaderboardSnapshot ??
  mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
