import { Router } from "express";
import { getDatabaseStatus } from "../db.js";
import { Competition, Match, Team } from "../models/index.js";

export const fixturesRouter = Router();

const competitionExternalId = "1";
const competitionId = "fifa-world-cup-2026";

function serializeTeam(team) {
  if (!team) {
    return null;
  }

  return {
    id: team._id,
    name: team.name,
    countryCode: team.countryCode,
    flag: team.flag
  };
}

fixturesRouter.get("/rounds", async (_request, response, next) => {
  try {
    if (getDatabaseStatus() !== "connected") {
      response.status(503).json({
        message: "MongoDB is not connected. Seeded fixtures cannot be loaded yet.",
        database: "disconnected"
      });
      return;
    }

    const [competition, matches, teams] = await Promise.all([
      Competition.findOne({ externalId: competitionExternalId }).lean(),
      Match.find({ competitionId }).sort({ "round.number": 1, kickoffTime: 1 }).lean(),
      Team.find({ competitionIds: competitionId }).lean()
    ]);

    const teamsById = new Map(teams.map((team) => [team._id, team]));
    const matchesByRound = new Map();

    for (const match of matches) {
      const roundNumber = match.round?.number ?? 0;
      const roundMatches = matchesByRound.get(roundNumber) ?? [];

      roundMatches.push({
        id: match.externalId,
        venue: match.venue,
        kickoffTime: match.kickoffTime,
        status: match.status,
        score: match.score,
        homeTeam: serializeTeam(teamsById.get(match.homeTeamId)),
        awayTeam: serializeTeam(teamsById.get(match.awayTeamId))
      });

      matchesByRound.set(roundNumber, roundMatches);
    }

    const rounds = (competition?.rounds ?? []).map((round) => ({
      id: round.externalId,
      name: round.name,
      short: round.short,
      matches: matchesByRound.get(round.externalId) ?? []
    }));

    response.json({
      competition: competition
        ? {
            id: competitionId,
            name: competition.name,
            status: competition.status
          }
        : null,
      rounds
    });
  } catch (error) {
    next(error);
  }
});
