import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    _id: {
      type: String
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    logoUrl: String,
    competitionIds: [{ type: String }]
  },
  { timestamps: true }
);

export const Team = mongoose.models.Team ?? mongoose.model("Team", teamSchema);
