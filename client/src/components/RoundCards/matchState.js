export const basePredictionPoints = 10;

export function normalizeMatchStatus(status) {
  const statusMap = {
    completed: "finished",
    finished: "finished",
    in_progress: "live",
    live: "live",
    scheduled: "scheduled",
    upcoming: "scheduled"
  };

  return statusMap[status] ?? "scheduled";
}

export function hasPrediction(prediction) {
  return Number.isInteger(prediction?.home) && Number.isInteger(prediction?.away);
}

export function getPredictionOutcome(prediction) {
  if (!hasPrediction(prediction)) {
    return null;
  }

  if (prediction.home > prediction.away) {
    return "home";
  }

  if (prediction.away > prediction.home) {
    return "away";
  }

  return "draw";
}

export function getMatchCardState(match, prediction) {
  const status = normalizeMatchStatus(match?.status);
  const predictionSet = hasPrediction(prediction);

  if (status === "finished") {
    return {
      id: "finished",
      cardClass: "is-finished",
      isLocked: true,
      label: "Finished",
      navStatus: "finished"
    };
  }

  if (status === "live") {
    return {
      id: "live",
      cardClass: "is-live",
      isLocked: true,
      label: "In progress",
      navStatus: predictionSet ? "set" : "empty"
    };
  }

  if (predictionSet) {
    return {
      id: "predicted",
      cardClass: "is-predicted",
      isLocked: false,
      label: "Prediction set",
      navStatus: "set"
    };
  }

  return {
    id: "unpredicted",
    cardClass: "is-unpredicted",
    isLocked: false,
    label: "Not predicted yet",
    navStatus: "empty"
  };
}

export function getPredictionPoints(outcome, outcomes) {
  const selectedOutcome = outcomes.find((item) => item.id === outcome);

  if (!selectedOutcome) {
    return 0;
  }

  return Math.round(basePredictionPoints * selectedOutcome.multiplier);
}
