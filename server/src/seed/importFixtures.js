import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDatabase } from "../db.js";
import { Competition, Match, Team } from "../models/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, "data");

const competitionId = "fifa-world-cup-2026";
const competitionExternalId = "1";

function mapMatchStatus(status) {
  const statusMap = {
    upcoming: "scheduled",
    scheduled: "scheduled",
    live: "live",
    completed: "finished",
    finished: "finished"
  };

  return statusMap[status] ?? "scheduled";
}

async function readJson(fileName) {
  const fileContents = await fs.readFile(path.join(dataDirectory, fileName), "utf8");
  return JSON.parse(fileContents);
}

function getCompetitionDates(matches) {
  const kickoffTimes = matches.map((match) => new Date(match.timestamp).getTime());

  return {
    startDate: new Date(Math.min(...kickoffTimes)),
    endDate: new Date(Math.max(...kickoffTimes))
  };
}

async function seedCompetition(rounds, matches) {
  const { startDate, endDate } = getCompetitionDates(matches);

  await Competition.findOneAndUpdate(
    { externalId: competitionExternalId },
    {
      externalId: competitionExternalId,
      name: "FIFA World Cup 2026",
      sport: "football",
      startDate,
      endDate,
      status: "upcoming",
      rounds: rounds.map((round) => ({
        externalId: round._id,
        name: round.name,
        short: round.short
      }))
    },
    { new: true, upsert: true, runValidators: true }
  );
}

async function seedTeams(teams) {
  if (teams.length === 0) {
    return;
  }

  await Team.bulkWrite(
    teams.map((team) => ({
      updateOne: {
        filter: { _id: team.country_code },
        update: {
          $set: {
            externalId: team._id,
            countryCode: team.country_code,
            name: team.name,
            group: team.group,
            flag: team.flag,
            competitionIds: [competitionId]
          }
        },
        upsert: true
      }
    }))
  );
}

async function seedMatches(rounds, matches, teams) {
  const roundById = new Map(rounds.map((round) => [round._id, round]));
  const teamByExternalId = new Map(teams.map((team) => [team._id, team]));

  if (matches.length === 0) {
    return;
  }

  await Match.bulkWrite(
    matches.map((match) => {
      const round = roundById.get(match.round_id);
      const homeTeam = teamByExternalId.get(match.home_team_id);
      const awayTeam = teamByExternalId.get(match.away_team_id);

      return {
        updateOne: {
          filter: { externalId: match._id },
          update: {
            $set: {
              externalId: match._id,
              competitionId,
              stage: round?.short,
              venue: match.venue,
              round: {
                externalId: round?._id,
                name: round?.name,
                number: round?._id,
                short: round?.short
              },
              kickoffTime: new Date(match.timestamp),
              status: mapMatchStatus(match.status),
              homeTeamId: homeTeam?.country_code ?? null,
              awayTeamId: awayTeam?.country_code ?? null,
              score: {
                home: match.home_score,
                away: match.away_score
              }
            }
          },
          upsert: true
        }
      };
    })
  );
}

async function importFixtures() {
  const [{ rounds, matches }, teams] = await Promise.all([
    readJson("fifa_world_cup_2026_matches.json"),
    readJson("fifa_world_cup_2026_teams.json")
  ]);

  await connectDatabase();
  await seedCompetition(rounds, matches);
  await seedTeams(teams);
  await seedMatches(rounds, matches, teams);

  console.log(`Seeded FIFA World Cup 2026 fixtures: ${rounds.length} rounds, ${teams.length} teams, ${matches.length} matches.`);
}

importFixtures()
  .catch((error) => {
    console.error("Unable to seed fixtures:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
