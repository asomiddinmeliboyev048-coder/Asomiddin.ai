import test from "node:test";
import assert from "node:assert/strict";
import { clean, dateFromText, inferTaskStatus, normalizeDateTime } from "./lms-parser.mjs";

test("clean collapses whitespace", () => {
  assert.equal(clean("  Algebra\n  topshiriq  "), "Algebra topshiriq");
});

test("dateFromText parses Tashkent local date and time", () => {
  assert.equal(dateFromText("Deadline: 24.11.2026 18:30"), "2026-11-24T13:30:00.000Z");
});

test("dateFromText returns null for absent or invalid dates", () => {
  assert.equal(dateFromText("No deadline provided"), null);
  assert.equal(dateFromText("Due: 31.02.2026"), null);
});

test("inferTaskStatus prioritizes graded and submitted markers", () => {
  assert.equal(inferTaskStatus("Submitted", "2020-01-01T00:00:00.000Z"), "submitted");
  assert.equal(inferTaskStatus("Graded", null), "graded");
});

test("inferTaskStatus distinguishes overdue, upcoming and unknown", () => {
  const now = Date.parse("2026-11-24T12:00:00.000Z");
  assert.equal(inferTaskStatus("", "2026-11-24T11:00:00.000Z", now), "overdue");
  assert.equal(inferTaskStatus("", "2026-11-24T13:00:00.000Z", now), "upcoming");
  assert.equal(inferTaskStatus("", null, now), "unknown");
});

test("normalizeDateTime safely rejects invalid LMS timestamps", () => {
  assert.equal(normalizeDateTime("not-a-date"), null);
  assert.equal(normalizeDateTime(null), null);
  assert.equal(normalizeDateTime("2026-11-24T18:30:00+05:00"), "2026-11-24T13:30:00.000Z");
});

test("inferTaskStatus does not treat negative submission labels as submitted", () => {
  assert.equal(inferTaskStatus("Not submitted", "2026-11-25T00:00:00.000Z", Date.parse("2026-11-24T00:00:00.000Z")), "upcoming");
  assert.equal(inferTaskStatus("Не отправлено", null), "not_submitted");
  assert.equal(inferTaskStatus("Topshirilmagan", null), "not_submitted");
});
