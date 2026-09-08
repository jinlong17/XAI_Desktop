/**
 * Realistic module state fixture for perf-budget + integration tests.
 *
 * Contains representative data matching the shape each adapter expects.
 * Values are stable across test runs (no Math.random, no Date.now variance).
 *
 * xai-web-cmdk test.md §4 PB1 fixture
 */

import type { WebModuleId } from "@repo/core/types";

/** A representative tasks state (array of 4 columns, 5 cards each) */
const tasksState = {
  overdue: [
    { id: "t1", title: "Finish quarterly review", sub: "Marketing", tags: ["work", "priority"] },
    { id: "t2", title: "Pay rent", sub: "Finance", tags: ["personal"] },
    { id: "t3", title: "Doctor appointment", sub: "Health", tags: ["personal"] },
    { id: "t4", title: "Submit expense report", sub: "Finance", tags: ["work"] },
    { id: "t5", title: "Buy birthday gift for mom", sub: "Personal", tags: ["personal", "shopping"] },
  ],
  next7: [
    { id: "t6", title: "Weekly standup notes", sub: "Work", tags: ["work"] },
    { id: "t7", title: "Book dentist appointment", sub: "Health", tags: ["personal"] },
    { id: "t8", title: "Review pull request", sub: "Engineering", tags: ["work", "code"] },
    { id: "t9", title: "Plan weekend hiking trip", sub: "Leisure", tags: ["personal", "outdoor"] },
    { id: "t10", title: "Write blog post draft", sub: "Side project", tags: ["writing"] },
  ],
  later: [
    { id: "t11", title: "Learn TypeScript generics", sub: "Education", tags: ["learning", "code"] },
    { id: "t12", title: "Organize home office", sub: "Personal", tags: ["personal"] },
    { id: "t13", title: "Research electric vehicles", sub: "Finance", tags: ["research"] },
    { id: "t14", title: "Batch cook for week", sub: "Health", tags: ["personal", "health"] },
    { id: "t15", title: "Read design patterns book", sub: "Education", tags: ["learning"] },
  ],
  noDate: [
    { id: "t16", title: "Update resume", sub: "Career", tags: ["work"] },
    { id: "t17", title: "Learn Spanish on Duolingo", sub: "Education", tags: ["learning"] },
    { id: "t18", title: "Clear old emails", sub: "Admin", tags: ["work"] },
    { id: "t19", title: "Backup hard drive", sub: "Tech", tags: ["personal"] },
    { id: "t20", title: "Fix leaking faucet", sub: "Home", tags: ["personal"] },
  ],
};

/** A representative board state (2 boards, 3 lists each, 3 cards each) */
const boardState = {
  boards: [
    {
      id: "b1",
      name: "Product Roadmap",
      lists: [
        {
          id: "l1",
          title: "Backlog",
          color: "blue",
          cards: [
            { id: "c1", title: "User onboarding flow", labels: ["UX", "P1"], members: [], due: null },
            { id: "c2", title: "API rate limiting", labels: ["Backend", "P2"], members: [], due: "2026-06-01" },
            { id: "c3", title: "Mobile push notifications", labels: ["Mobile", "P3"], members: [], due: null },
          ],
        },
        {
          id: "l2",
          title: "In Progress",
          color: "amber",
          cards: [
            { id: "c4", title: "Dashboard redesign", labels: ["Design", "P1"], members: [], due: "2026-05-30" },
            { id: "c5", title: "Database migration script", labels: ["Backend", "P1"], members: [], due: "2026-05-28" },
            { id: "c6", title: "Accessibility audit", labels: ["A11y", "P2"], members: [], due: "2026-06-05" },
          ],
        },
        {
          id: "l3",
          title: "Done",
          color: null,
          cards: [
            { id: "c7", title: "Initial project setup", labels: ["DevOps"], members: [], due: null },
            { id: "c8", title: "Authentication flow", labels: ["Backend", "Security"], members: [], due: null },
            { id: "c9", title: "Landing page design", labels: ["Design"], members: [], due: null },
          ],
        },
      ],
    },
    {
      id: "b2",
      name: "Personal Goals 2026",
      lists: [
        { id: "l4", title: "Goals", color: "green", cards: [
          { id: "c10", title: "Run a 5K", labels: ["Health"], members: [], due: "2026-07-01" },
          { id: "c11", title: "Read 12 books", labels: ["Education"], members: [], due: "2026-12-31" },
          { id: "c12", title: "Learn photography basics", labels: ["Hobby"], members: [], due: null },
        ]},
        { id: "l5", title: "In Progress", color: "amber", cards: [
          { id: "c13", title: "Daily meditation habit", labels: ["Mindfulness"], members: [], due: null },
          { id: "c14", title: "Reduce social media use", labels: ["Wellbeing"], members: [], due: null },
          { id: "c15", title: "Cook new recipe weekly", labels: ["Hobby", "Health"], members: [], due: null },
        ]},
        { id: "l6", title: "Done", color: null, cards: [
          { id: "c16", title: "Start yoga practice", labels: ["Health"], members: [], due: null },
          { id: "c17", title: "Create budget spreadsheet", labels: ["Finance"], members: [], due: null },
          { id: "c18", title: "Set up home garden", labels: ["Hobby"], members: [], due: null },
        ]},
      ],
    },
  ],
  active: "b1",
  panels: [{ id: "kanban" }],
  inbox: [
    { id: "i1", title: "Quick idea: build browser extension", labels: [], members: [], due: null },
    { id: "i2", title: "Need to follow up with Alex", labels: [], members: [], due: null },
  ],
};

/** A representative habits state (5 habits with weekly data) */
const habitsState = {
  habits: [
    { id: "h1", name: "Morning run", emoji: "🏃", checks: { "2026-05-20": true, "2026-05-22": true, "2026-05-24": true } },
    { id: "h2", name: "Read for 30 minutes", emoji: "📚", checks: { "2026-05-19": true, "2026-05-20": true, "2026-05-21": true, "2026-05-22": true, "2026-05-23": true } },
    { id: "h3", name: "Drink 8 glasses of water", emoji: "💧", checks: { "2026-05-23": true, "2026-05-24": true } },
    { id: "h4", name: "Language learning (Spanish)", emoji: "🗣️", checks: { "2026-05-18": true, "2026-05-19": true } },
    { id: "h5", name: "Evening journaling", emoji: "📓", checks: { "2026-05-20": true, "2026-05-21": true, "2026-05-22": true, "2026-05-23": true, "2026-05-24": true } },
  ],
};

/** A representative pomodoro sessions state (10 sessions) */
const pomodoroState = [
  { id: "s1", mode: "focus", startedAt: "2026-05-24T09:00:00Z", duration: 1500 },
  { id: "s2", mode: "short-break", startedAt: "2026-05-24T09:25:00Z", duration: 300 },
  { id: "s3", mode: "focus", startedAt: "2026-05-24T09:30:00Z", duration: 1500 },
  { id: "s4", mode: "short-break", startedAt: "2026-05-24T09:55:00Z", duration: 300 },
  { id: "s5", mode: "focus", startedAt: "2026-05-24T10:00:00Z", duration: 1500 },
  { id: "s6", mode: "long-break", startedAt: "2026-05-24T10:25:00Z", duration: 900 },
  { id: "s7", mode: "focus", startedAt: "2026-05-23T14:00:00Z", duration: 1500 },
  { id: "s8", mode: "focus", startedAt: "2026-05-23T14:25:00Z", duration: 1500 },
  { id: "s9", mode: "focus", startedAt: "2026-05-22T10:00:00Z", duration: 1500 },
  { id: "s10", mode: "focus", startedAt: "2026-05-21T09:00:00Z", duration: 1500 },
];

/** A representative matrix state (4 quadrants) */
const matrixState = {
  q1: [
    { id: "m1", text: "Ship Q2 feature deadline" },
    { id: "m2", text: "Medical check-up" },
    { id: "m3", text: "Tax deadline" },
  ],
  q2: [
    { id: "m4", text: "Learn new framework" },
    { id: "m5", text: "Exercise routine" },
    { id: "m6", text: "Strategic planning meeting" },
  ],
  q3: [
    { id: "m7", text: "Team lunch (optional)" },
    { id: "m8", text: "Unimportant emails" },
    { id: "m9", text: "Scheduling conflicts" },
  ],
  q4: [
    { id: "m10", text: "Social media browsing" },
    { id: "m11", text: "Minor admin tasks" },
  ],
};

/** A representative meditation state */
const meditationState = {
  scene: "forest",
  sound: "rain",
  duration: 10,
  schemaVersion: 1,
};

/** A representative dashboard state */
const dashboardState = {
  dashOrder: ["clock", "stat-tasks", "stat-streak", "stat-pomos", "mini-cal", "world-clocks"],
  clockStyle: "classic",
  clockTz: "America/New_York",
  zones: ["America/Los_Angeles", "Europe/London", "Asia/Tokyo"],
};

/** A representative countdown state */
const countdownState = [
  { id: "cd1", title: "Summer vacation", targetDate: "2026-07-15" },
  { id: "cd2", title: "Project deadline", targetDate: "2026-06-01" },
  { id: "cd3", title: "Birthday party", targetDate: "2026-06-20" },
];

/**
 * A realistic state snapshot representing a typical user's data across all modules.
 * Use this for perf-budget tests and integration tests that need realistic data volumes.
 */
export const REALISTIC_MODULE_STATES: Readonly<Record<WebModuleId, unknown>> = Object.freeze({
  tasks: tasksState,
  board: boardState,
  habits: habitsState,
  pomodoro: pomodoroState,
  matrix: matrixState,
  meditation: meditationState,
  dashboard: dashboardState,
  countdown: countdownState,
  calendar: {},
  statistics: {},
  timetrack: {},
  metrics: {},
  settings: [],
  ai: {},
  search: {},
});
