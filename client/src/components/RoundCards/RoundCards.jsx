import React, { useEffect, useState } from "react";
import { apiRequest } from "../../api/apiRequest.js";
import "./RoundCards.css";

const defaultScore = {
  home: 0,
  away: 0
};
const basePredictionPoints = 10;

function formatDateLabel(kickoffTime) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  })
    .format(new Date(kickoffTime))
    .toUpperCase();
}

function formatTimeLabel(kickoffTime) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(kickoffTime));
}

function formatLockLabel(kickoffTime) {
  const differenceMs = new Date(kickoffTime).getTime() - Date.now();

  if (differenceMs <= 0) {
    return "Locked";
  }

  const totalMinutes = Math.floor(differenceMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getVenueCity(venue) {
  return venue?.split(",")[0] ?? "Venue TBC";
}

function getTeamName(team) {
  return team?.name ?? "TBD";
}

function getTeamCode(team) {
  return team?.countryCode ?? "TBD";
}

function createOutcomes(homeTeam, awayTeam) {
  const homeName = getTeamName(homeTeam);
  const awayName = getTeamName(awayTeam);

  return [
    {
      id: "home",
      label: `${homeName} win`,
      percentage: "43%",
      note: "Favourites",
      multiplier: 1
    },
    {
      id: "draw",
      label: "Draw",
      percentage: "30%",
      boostLabel: "1.5x boost",
      multiplier: 1.5
    },
    {
      id: "away",
      label: `${awayName} win`,
      percentage: "27%",
      boostLabel: "2x boost",
      multiplier: 2
    }
  ];
}

function TeamCode({ team }) {
  return <span className="team-code">{getTeamCode(team)}</span>;
}

function ScoreControl({ value, onChange, label }) {
  return (
    <div className="score-control" aria-label={label}>
      <button
        className="score-button"
        onClick={() => onChange(Math.max(0, value - 1))}
        type="button"
        aria-label={`${label} down`}
      >
        -
      </button>
      <span className="score-value">{value}</span>
      <button
        className="score-button"
        onClick={() => onChange(value + 1)}
        type="button"
        aria-label={`${label} up`}
      >
        +
      </button>
    </div>
  );
}

function RoundMatchCard({ match }) {
  const [score, setScore] = useState(match.score ?? defaultScore);
  const homeName = getTeamName(match.homeTeam);
  const awayName = getTeamName(match.awayTeam);
  const outcomes = createOutcomes(match.homeTeam, match.awayTeam);
  const selectedOutcome =
    score.home > score.away ? "home" : score.away > score.home ? "away" : "draw";
  const selectedOutcomeDetails =
    outcomes.find((outcome) => outcome.id === selectedOutcome) ?? outcomes[0];
  const predictionPoints = Math.round(basePredictionPoints * selectedOutcomeDetails.multiplier);

  function applyOutcome(outcomeId) {
    setScore((currentScore) => {
      if (outcomeId === "home") {
        return {
          home: Math.max(currentScore.home, currentScore.away + 1),
          away: currentScore.away
        };
      }

      if (outcomeId === "away") {
        return {
          home: currentScore.home,
          away: Math.max(currentScore.away, currentScore.home + 1)
        };
      }

      return {
        home: currentScore.home,
        away: currentScore.home
      };
    });
  }

  return (
    <article className="round-card">
      <div className="round-card-meta">
        <div>
          <span>
            {formatDateLabel(match.kickoffTime)} · <strong>{formatTimeLabel(match.kickoffTime)}</strong>
          </span>
          <small>{getVenueCity(match.venue)}</small>
        </div>
        <span className="lock-pill">
          <span className="lock-icon" aria-hidden="true" />
          Locks in {formatLockLabel(match.kickoffTime)}
        </span>
      </div>

      <div className="match-prediction">
        <div className="team-name is-home">
          <span>{homeName}</span>
          <TeamCode team={match.homeTeam} />
        </div>

        <span className="versus">VS</span>

        <div className="team-name is-away">
          <TeamCode team={match.awayTeam} />
          <span>{awayName}</span>
        </div>
      </div>

      <div className="score-row">
        <ScoreControl
          label={`${homeName} prediction`}
          onChange={(home) => setScore((currentScore) => ({ ...currentScore, home }))}
          value={score.home ?? 0}
        />
        <span className="score-colon">:</span>
        <ScoreControl
          label={`${awayName} prediction`}
          onChange={(away) => setScore((currentScore) => ({ ...currentScore, away }))}
          value={score.away ?? 0}
        />
      </div>

      <p className="autosave-note">
        <span aria-hidden="true">▣</span>
        Your prediction · saves automatically
      </p>

      <div className="outcome-grid">
        {outcomes.map((outcome) => (
          <button
            className={outcome.id === selectedOutcome ? "outcome-card is-selected" : "outcome-card"}
            key={outcome.id}
            onClick={() => applyOutcome(outcome.id)}
            type="button"
          >
            <span>{outcome.percentage}</span>
            <strong>{outcome.label}</strong>
            {outcome.note && <small>{outcome.note}</small>}
            {outcome.boostLabel && <em>{outcome.boostLabel}</em>}
          </button>
        ))}
      </div>

      <footer className="round-card-footer">
        <span>Correct prediction wins you...</span>
        <strong>{predictionPoints} pts</strong>
      </footer>
    </article>
  );
}

export function RoundCards() {
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRounds() {
      try {
        const data = await apiRequest("/api/fixtures/rounds");
        const availableRounds = data.rounds ?? [];

        setRounds(availableRounds);
        setSelectedRoundId(availableRounds[0]?.id ?? null);
        setStatus("ready");
      } catch (requestError) {
        setError(requestError.message);
        setStatus("error");
      }
    }

    loadRounds();
  }, []);

  const selectedRound = rounds.find((round) => round.id === selectedRoundId);

  return (
    <section className="rounds-panel" aria-label="Round matches">
      {rounds.length > 0 && (
        <div className="round-tabs" aria-label="Fixture rounds">
          {rounds.map((round) => (
            <button
              className={round.id === selectedRoundId ? "is-active" : ""}
              key={round.id}
              onClick={() => setSelectedRoundId(round.id)}
              type="button"
            >
              {round.short}
            </button>
          ))}
        </div>
      )}

      <div className="rounds-heading">
        <h2>
          {selectedRound?.name ?? "Make your picks"}
          {selectedRound?.matches?.length ? ` · ${selectedRound.matches.length} matches` : ""}
        </h2>
      </div>

      {status === "loading" && <p className="round-state">Loading fixtures...</p>}
      {status === "error" && <p className="round-state">{error}</p>}
      {status === "ready" && rounds.length === 0 && (
        <p className="round-state">No fixture rounds found. Run npm run seed:fixtures and refresh.</p>
      )}
      {status === "ready" && selectedRound?.matches.length === 0 && (
        <p className="round-state">No matches found for this round.</p>
      )}

      {selectedRound?.matches.length > 0 && (
        <div className="round-card-list">
          {selectedRound.matches.map((match) => (
            <RoundMatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </section>
  );
}
