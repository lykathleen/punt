import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    _id: {
      type: String
    },
    externalId: Number,
    countryCode: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    group: {
      type: String,
      trim: true
    },
    flag: String,
    logoUrl: String,
    competitionIds: [{ type: String }]
  },
  { timestamps: true }
);

export const Team = mongoose.models.Team ?? mongoose.model("Team", teamSchema);
