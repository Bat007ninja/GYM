/**
 * Your PT programme, ~3 months at a time.
 *
 * Same block shape every training day (Block 1: choose 1 of 2 · Block 2: do
 * 1-3 of 3 · Block 3: choose 1 of 2), but each day uses different exercises.
 *
 * TO UPDATE: replace the placeholder `name` values below with the real
 * exercise names from your PT. Nothing else needs to change - the app reads
 * this file to build the checklist. Each exercise needs a unique `id`
 * (used to remember which boxes are ticked); keep ids unique but they don't
 * need to mean anything.
 */

const PROGRAMME = [
  {
    id: 'day1',
    label: 'Day 1',
    blocks: [
      {
        id: 'd1-b1',
        title: 'Block 1',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd1-b1-e1', name: 'Placeholder — Day 1, Block 1, Option A' },
          { id: 'd1-b1-e2', name: 'Placeholder — Day 1, Block 1, Option B' },
        ],
      },
      {
        id: 'd1-b2',
        title: 'Block 2',
        instructions: 'Do 1–3 of the 3 exercises',
        exercises: [
          { id: 'd1-b2-e1', name: 'Placeholder — Day 1, Block 2, Exercise 1' },
          { id: 'd1-b2-e2', name: 'Placeholder — Day 1, Block 2, Exercise 2' },
          { id: 'd1-b2-e3', name: 'Placeholder — Day 1, Block 2, Exercise 3' },
        ],
      },
      {
        id: 'd1-b3',
        title: 'Block 3',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd1-b3-e1', name: 'Placeholder — Day 1, Block 3, Option A' },
          { id: 'd1-b3-e2', name: 'Placeholder — Day 1, Block 3, Option B' },
        ],
      },
    ],
  },
  {
    id: 'day2',
    label: 'Day 2',
    blocks: [
      {
        id: 'd2-b1',
        title: 'Block 1',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd2-b1-e1', name: 'Placeholder — Day 2, Block 1, Option A' },
          { id: 'd2-b1-e2', name: 'Placeholder — Day 2, Block 1, Option B' },
        ],
      },
      {
        id: 'd2-b2',
        title: 'Block 2',
        instructions: 'Do 1–3 of the 3 exercises',
        exercises: [
          { id: 'd2-b2-e1', name: 'Placeholder — Day 2, Block 2, Exercise 1' },
          { id: 'd2-b2-e2', name: 'Placeholder — Day 2, Block 2, Exercise 2' },
          { id: 'd2-b2-e3', name: 'Placeholder — Day 2, Block 2, Exercise 3' },
        ],
      },
      {
        id: 'd2-b3',
        title: 'Block 3',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd2-b3-e1', name: 'Placeholder — Day 2, Block 3, Option A' },
          { id: 'd2-b3-e2', name: 'Placeholder — Day 2, Block 3, Option B' },
        ],
      },
    ],
  },
  {
    id: 'day3',
    label: 'Day 3',
    blocks: [
      {
        id: 'd3-b1',
        title: 'Block 1',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd3-b1-e1', name: 'Placeholder — Day 3, Block 1, Option A' },
          { id: 'd3-b1-e2', name: 'Placeholder — Day 3, Block 1, Option B' },
        ],
      },
      {
        id: 'd3-b2',
        title: 'Block 2',
        instructions: 'Do 1–3 of the 3 exercises',
        exercises: [
          { id: 'd3-b2-e1', name: 'Placeholder — Day 3, Block 2, Exercise 1' },
          { id: 'd3-b2-e2', name: 'Placeholder — Day 3, Block 2, Exercise 2' },
          { id: 'd3-b2-e3', name: 'Placeholder — Day 3, Block 2, Exercise 3' },
        ],
      },
      {
        id: 'd3-b3',
        title: 'Block 3',
        instructions: 'Choose 1 of 2',
        exercises: [
          { id: 'd3-b3-e1', name: 'Placeholder — Day 3, Block 3, Option A' },
          { id: 'd3-b3-e2', name: 'Placeholder — Day 3, Block 3, Option B' },
        ],
      },
    ],
  },
];
