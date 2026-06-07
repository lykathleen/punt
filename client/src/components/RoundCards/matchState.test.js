import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getMatchCardState,
  getPredictionOutcome,
  getPredictionPoints,
  hasPrediction,
  normalizeMatchStatus
} from "./matchState.js";

const outcomes = [
  { id: "home", multiplier: 1 },
  { id: "draw", multiplier: 1.5 },
  { id: "away", multiplier: 2 }
];

describe("match card states", () => {
  it("handles match finished", () => {
    const state = getMatchCardState({ status: "finished" }, { home: 2, away: 1 });

    assert.equal(state.id, "finished");
    assert.equal(state.isLocked, true);
    assert.equal(state.cardClass, "is-finished");
    assert.equal(state.navStatus, "finished");
  });

  it("handles match in progress", () => {
    const state = getMatchCardState({ status: "live" }, { home: 1, away: 1 });

    assert.equal(state.id, "live");
    assert.equal(state.isLocked, true);
    assert.equal(state.cardClass, "is-live");
    assert.equal(state.navStatus, "set");
  });

  it("handles upcoming match with no prediction", () => {
    const state = getMatchCardState({ status: "scheduled" }, null);

    assert.equal(state.id, "unpredicted");
    assert.equal(state.isLocked, false);
    assert.equal(state.cardClass, "is-unpredicted");
    assert.equal(state.navStatus, "empty");
    assert.equal(hasPrediction(null), false);
  });

  it("handles upcoming match with prediction", () => {
    const prediction = { home: 0, away: 0 };
    const state = getMatchCardState({ status: "upcoming" }, prediction);

    assert.equal(state.id, "predicted");
    assert.equal(state.isLocked, false);
    assert.equal(state.cardClass, "is-predicted");
    assert.equal(state.navStatus, "set");
    assert.equal(getPredictionOutcome(prediction), "draw");
    assert.equal(getPredictionPoints("draw", outcomes), 15);
  });

  it("normalizes fixture status names", () => {
    assert.equal(normalizeMatchStatus("upcoming"), "scheduled");
    assert.equal(normalizeMatchStatus("in_progress"), "live");
    assert.equal(normalizeMatchStatus("completed"), "finished");
  });
});
