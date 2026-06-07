import React from "react";
import "./GlobalLeaderboard.css";

const leaderboardRows = [
  {
    id: "1",
    username: "Kathleen",
    points: 48,
    roundMovement: 2
  },
  {
    id: "2",
    username: "Alice",
    points: 43,
    roundMovement: -1
  },
  {
    id: "3",
    username: "Maya",
    points: 41,
    roundMovement: 0
  },
  {
    id: "4",
    username: "Sam",
    points: 36,
    roundMovement: 1
  },
  {
    id: "5",
    username: "Jordan",
    points: 29,
    roundMovement: -2
  }
];

function getInitials(username) {
  return username
    .split(" ")
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getMovementLabel(roundMovement) {
  if (roundMovement > 0) {
    return `${roundMovement}`;
  }

  if (roundMovement < 0) {
    return `${Math.abs(roundMovement)}`;
  }

  return "-";
}

export function GlobalLeaderboard() {
  return (
    <section className="global-leaderboard" aria-label="Global leaderboard">
      <div className="leaderboard-heading">
        <p className="eyebrow">Global leaderboard</p>
        <h2>Overall table</h2>
      </div>

      <ol className="leaderboard-list">
        {leaderboardRows.map((row, index) => {
          const movementClass =
            row.roundMovement > 0 ? "is-up" : row.roundMovement < 0 ? "is-down" : "is-level";
          const rankClass = index < 3 ? ` is-rank-${index + 1}` : "";

          return (
            <li className="leaderboard-row" key={row.id}>
              <span className={`leaderboard-rank${rankClass}`}>{index + 1}</span>
              <span className="leaderboard-avatar" aria-hidden="true">
                {getInitials(row.username)}
              </span>
              <span className="leaderboard-user">{row.username}</span>
              <span className="leaderboard-points">{row.points}</span>
              <span className={`leaderboard-movement ${movementClass}`}>
                {getMovementLabel(row.roundMovement)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
