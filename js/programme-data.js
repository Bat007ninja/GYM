/**
 * Your PT programme, ~3 months at a time.
 *
 * 6 sessions a week (Monday-Saturday), 1 hour each, 3 blocks per session:
 *   Block 1 - choose 1 of 2
 *   Block 2 - choose 2-3 of 3
 *   Block 3 - choose 2-3 of 3
 * Same block shape every day; each day uses different exercises.
 *
 * TO UPDATE: once you have the real list from your PT, just replace the
 * placeholder strings in the block1/block2/block3 arrays below - block1
 * needs 2 names, block2 and block3 need 3 names each. Nothing else in the
 * app needs to change.
 */

const PROGRAMME_DAYS = [
  {
    label: 'Monday',
    block1: ['Placeholder — Mon Block 1, Option A', 'Placeholder — Mon Block 1, Option B'],
    block2: ['Placeholder — Mon Block 2, Option A', 'Placeholder — Mon Block 2, Option B', 'Placeholder — Mon Block 2, Option C'],
    block3: ['Placeholder — Mon Block 3, Option A', 'Placeholder — Mon Block 3, Option B', 'Placeholder — Mon Block 3, Option C'],
  },
  {
    label: 'Tuesday',
    block1: ['Placeholder — Tue Block 1, Option A', 'Placeholder — Tue Block 1, Option B'],
    block2: ['Placeholder — Tue Block 2, Option A', 'Placeholder — Tue Block 2, Option B', 'Placeholder — Tue Block 2, Option C'],
    block3: ['Placeholder — Tue Block 3, Option A', 'Placeholder — Tue Block 3, Option B', 'Placeholder — Tue Block 3, Option C'],
  },
  {
    label: 'Wednesday',
    block1: ['Placeholder — Wed Block 1, Option A', 'Placeholder — Wed Block 1, Option B'],
    block2: ['Placeholder — Wed Block 2, Option A', 'Placeholder — Wed Block 2, Option B', 'Placeholder — Wed Block 2, Option C'],
    block3: ['Placeholder — Wed Block 3, Option A', 'Placeholder — Wed Block 3, Option B', 'Placeholder — Wed Block 3, Option C'],
  },
  {
    label: 'Thursday',
    block1: ['Placeholder — Thu Block 1, Option A', 'Placeholder — Thu Block 1, Option B'],
    block2: ['Placeholder — Thu Block 2, Option A', 'Placeholder — Thu Block 2, Option B', 'Placeholder — Thu Block 2, Option C'],
    block3: ['Placeholder — Thu Block 3, Option A', 'Placeholder — Thu Block 3, Option B', 'Placeholder — Thu Block 3, Option C'],
  },
  {
    label: 'Friday',
    block1: ['Placeholder — Fri Block 1, Option A', 'Placeholder — Fri Block 1, Option B'],
    block2: ['Placeholder — Fri Block 2, Option A', 'Placeholder — Fri Block 2, Option B', 'Placeholder — Fri Block 2, Option C'],
    block3: ['Placeholder — Fri Block 3, Option A', 'Placeholder — Fri Block 3, Option B', 'Placeholder — Fri Block 3, Option C'],
  },
  {
    label: 'Saturday',
    block1: ['Placeholder — Sat Block 1, Option A', 'Placeholder — Sat Block 1, Option B'],
    block2: ['Placeholder — Sat Block 2, Option A', 'Placeholder — Sat Block 2, Option B', 'Placeholder — Sat Block 2, Option C'],
    block3: ['Placeholder — Sat Block 3, Option A', 'Placeholder — Sat Block 3, Option B', 'Placeholder — Sat Block 3, Option C'],
  },
];

const BLOCK_META = [
  { key: 'block1', title: 'Block 1', instructions: 'Choose 1 of 2' },
  { key: 'block2', title: 'Block 2', instructions: 'Choose 2–3 of 3' },
  { key: 'block3', title: 'Block 3', instructions: 'Choose 2–3 of 3' },
];

const PROGRAMME = PROGRAMME_DAYS.map((day, dayIndex) => ({
  id: `day-${dayIndex}`,
  label: day.label,
  blocks: BLOCK_META.map((meta) => ({
    id: `day-${dayIndex}-${meta.key}`,
    title: meta.title,
    instructions: meta.instructions,
    exercises: day[meta.key].map((name, exIndex) => ({
      id: `day-${dayIndex}-${meta.key}-ex-${exIndex}`,
      name,
    })),
  })),
}));
