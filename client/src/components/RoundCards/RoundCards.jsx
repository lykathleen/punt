import React, { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../api/apiRequest.js";
import {
  getMatchCardState,
  getPredictionOutcome,
  getPredictionPoints,
  hasPrediction
} from "./matchState.js";
import "./RoundCards.css";

const defaultScore = {
  home: 0,
  away: 0
};

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

function getMatchAnchorId(match) {
  return `match-${match.id}`;
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

function PlusIcon() {
  return (
    <svg className="score-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg className="score-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="inline-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5h12l2 2v14H5z" />
      <path d="M8 5v6h9M8 17h8" />
    </svg>
  );
}

function ScoreControl({ disabled = false, value, onChange, label }) {
  const displayValue = Number.isInteger(value) ? value : "-";

  return (
    <div className="score-control" aria-label={label}>
      <button
        className="score-button"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, (value ?? 0) - 1))}
        type="button"
        aria-label={`${label} down`}
      >
        <MinusIcon />
      </button>
      <span className={Number.isInteger(value) ? "score-value" : "score-value is-empty"}>{displayValue}</span>
      <button
        className="score-button"
        disabled={disabled}
        onClick={() => onChange((value ?? 0) + 1)}
        type="button"
        aria-label={`${label} up`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

function RoundMatchCard({ isFlashing, match, matchNumber }) {
  const [prediction, setPrediction] = useState(match.prediction ?? null);
  const homeName = getTeamName(match.homeTeam);
  const awayName = getTeamName(match.awayTeam);
  const outcomes = createOutcomes(match.homeTeam, match.awayTeam);
  const predictionSet = hasPrediction(prediction);
  const matchState = getMatchCardState(match, prediction);
  const selectedOutcome = getPredictionOutcome(prediction);
  const predictionPoints = getPredictionPoints(selectedOutcome, outcomes);
  const isLocked = matchState.isLocked;
  const visibleScore = matchState.id === "finished" && match.score ? match.score : prediction;
  const footerLabel = predictionSet
    ? "Correct prediction wins you..."
    : isLocked
      ? "Predictions are locked"
      : "Select a pick to calculate points";

  function applyOutcome(outcomeId) {
    if (isLocked) {
      return;
    }

    setPrediction((currentPrediction) => {
      const currentScore = currentPrediction ?? defaultScore;

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

  function updatePredictionScore(scorePart, value) {
    if (isLocked) {
      return;
    }

    setPrediction((currentPrediction) => ({
      ...(currentPrediction ?? defaultScore),
      [scorePart]: value
    }));
  }

  return (
    <article
      className={`round-card ${matchState.cardClass}${isFlashing ? " is-flashing" : ""}`}
      id={getMatchAnchorId(match)}
    >
      <div className="round-card-meta">
        <div>
          <small>Match {matchNumber}</small>
          <span>
            {formatDateLabel(match.kickoffTime)} · <strong>{formatTimeLabel(match.kickoffTime)}</strong>
          </span>
          <small>{getVenueCity(match.venue)}</small>
        </div>
        <span className={`status-pill is-${matchState.id}`}>
          <LockIcon />
          {isLocked ? matchState.label : `Locks in ${formatLockLabel(match.kickoffTime)}`}
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
          disabled={isLocked}
          label={`${homeName} prediction`}
          onChange={(home) => updatePredictionScore("home", home)}
          value={visibleScore?.home}
        />
        <span className="score-colon">:</span>
        <ScoreControl
          disabled={isLocked}
          label={`${awayName} prediction`}
          onChange={(away) => updatePredictionScore("away", away)}
          value={visibleScore?.away}
        />
      </div>

      <p className={`autosave-note is-${matchState.id}`}>
        <SaveIcon />
        {predictionSet ? "Your prediction · saves automatically" : matchState.label}
      </p>

      <div className="outcome-grid">
        {outcomes.map((outcome) => (
          <button
            className={outcome.id === selectedOutcome ? "outcome-card is-selected" : "outcome-card"}
            disabled={isLocked}
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
        <span>{footerLabel}</span>
        <strong>{predictionSet ? `${predictionPoints} pts` : "-- pts"}</strong>
      </footer>
    </article>
  );
}

function getJumpStatus(match) {
  return getMatchCardState(match, match.prediction ?? null).navStatus;
}

export function RoundCards() {
  const [rounds, setRounds] = useState([]);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [flashedMatchId, setFlashedMatchId] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const flashTimeout = useRef(null);

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

  useEffect(() => {
    return () => {
      clearTimeout(flashTimeout.current);
    };
  }, []);

  const selectedRound = rounds.find((round) => round.id === selectedRoundId);
  const selectedMatches = selectedRound?.matches ?? [];

  function jumpToMatch(matchId) {
    document.getElementById(getMatchAnchorId({ id: matchId }))?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
    setFlashedMatchId(matchId);
    clearTimeout(flashTimeout.current);
    flashTimeout.current = setTimeout(() => setFlashedMatchId(null), 900);
  }

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

      {selectedMatches.length > 0 && (
        <div className="rounds-body">
          <aside className="match-jump" aria-label={`${selectedRound.name} match navigation`}>
            <p className="panel-title">Jump to match</p>
            <div className="match-jump-list">
              {selectedMatches.map((match, index) => (
                <button
                  className="match-jump-button"
                  key={match.id}
                  onClick={() => jumpToMatch(match.id)}
                  type="button"
                >
                  <span className="match-jump-number">{index + 1}</span>
                  <span className="match-jump-copy">
                    <strong>
                      {getTeamCode(match.homeTeam)} vs {getTeamCode(match.awayTeam)}
                    </strong>
                    <small>
                      {formatDateLabel(match.kickoffTime)} · {formatTimeLabel(match.kickoffTime)}
                    </small>
                  </span>
                  <span className={`match-jump-status is-${getJumpStatus(match)}`} aria-label={getJumpStatus(match)} />
                </button>
              ))}
            </div>
          </aside>

          <div className="round-card-list">
            {selectedMatches.map((match, index) => (
              <RoundMatchCard
                isFlashing={match.id === flashedMatchId}
                key={match.id}
                match={match}
                matchNumber={index + 1}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
