/**
 * Your PT programme (Top Condition Personal Training), ~3 months at a time.
 *
 * 6 sessions a week (Monday-Saturday), 1 hour each, 3 blocks per session:
 *   Block A - choose 1 of 2
 *   Block B - choose 2-3 of 3
 *   Block C - choose 2-3 of 3
 * Same block shape every day; each day uses different exercises.
 *
 * TO UPDATE: each exercise is `ex('Name', 'target reps')` - edit the name
 * or reps, add/remove entries, or swap in a new day entirely. block1 needs
 * 2 exercises, block2 and block3 need 3 each. Nothing else in the app
 * needs to change.
 */

function ex(name, reps) {
  return { name, reps };
}

const PROGRAMME_DAYS = [
  {
    label: 'Monday',
    block1: [
      ex('Smith Anderson Press', '5-10'),
      ex('Reset Sumo Deads', '5x3'),
    ],
    block2: [
      ex('Leg Ext 2/1', '5-8'),
      ex('NG Mid Width Pulldowns', '15-20'),
      ex('30° Incline DB Press', '8-15'),
    ],
    block3: [
      ex('Kas Smith Hip Thrust', '15-20'),
      ex('Hanging Knee Raise Variation', 'AMRAP'),
      ex('60° Bench Tricep Pushdown', '8-15'),
    ],
  },
  {
    label: 'Tuesday',
    block1: [
      ex('75° Upper Lat Cable Pull-Around', '5-8 e/s'),
      ex('FFE Split Squats', '5-8 e/s'),
    ],
    block2: [
      ex('Extended Range Flat FA Crunches', '8-15'),
      ex('Ramped Cable Goblets', '8-15'),
      ex('Offset Standing DB Curls', '8-15'),
    ],
    block3: [
      ex('Smith Behind The Back UH Shrugs', '15-20'),
      ex('Mogo 90/90 with Rotation', '5-8 breaths'),
      ex('15° DB Flyes', '8-15'),
    ],
  },
  {
    label: 'Wednesday',
    block1: [
      ex('Flat DB Press', '5-10'),
      ex('High Bar Trap Bar', '5x3'),
    ],
    block2: [
      ex('30° Smith CG Press', '5-8'),
      ex('Slider Cable Kick Backs', '8-15'),
      ex('Rollout or Core Variation', 'AMRAP'),
    ],
    block3: [
      ex('Standing Hammie Side Bend', '5-8 e/s'),
      ex('Underhand Pulldowns', '8-15'),
      ex('EZ Skullcrushers', '15-20'),
    ],
  },
  {
    label: 'Thursday',
    block1: [
      ex('Heel Raised FT Squat Variation', '5-8'),
      ex('Chin Variation / Wide Grip Upper Back Pulldowns', '8-15'),
    ],
    block2: [
      ex('90° DB Shoulder Press (tucked elbow)', '8-15'),
      ex('Full Range Hammie Ext', 'AMRAP'),
      ex('Rope/Cuffed Hammer Curls', '15-20'),
    ],
    block3: [
      ex('Hoe Stance Pulse', '8-15'),
      ex('Wide Foot Cable Trunk Rotations', '5-8 e/s'),
      ex('30° Cable Press', '8-15'),
    ],
  },
  {
    label: 'Friday',
    block1: [
      ex('Bench Press', '5x3'),
      ex("Smith RDL's", '5-8'),
    ],
    block2: [
      ex('Tricep Pushdowns', '15-20'),
      ex('Walking Lunges', '20m'),
      ex('Dual Cable Curls', '8-15'),
    ],
    block3: [
      ex('Upper Back Cable Row Variation', '8-15'),
      ex('Leg Extensions (short into lengthened)', '15+'),
      ex('Mogo Thoracic Spine Opener', '5-8 breaths'),
    ],
  },
  {
    label: 'Saturday',
    block1: [
      ex('Placeholder — Sat Block A, Option A', ''),
      ex('Placeholder — Sat Block A, Option B', ''),
    ],
    block2: [
      ex('Placeholder — Sat Block B, Option A', ''),
      ex('Placeholder — Sat Block B, Option B', ''),
      ex('Placeholder — Sat Block B, Option C', ''),
    ],
    block3: [
      ex('Placeholder — Sat Block C, Option A', ''),
      ex('Placeholder — Sat Block C, Option B', ''),
      ex('Placeholder — Sat Block C, Option C', ''),
    ],
  },
];

const BLOCK_META = [
  { key: 'block1', title: 'Block A', instructions: 'Choose 1 of 2' },
  { key: 'block2', title: 'Block B', instructions: 'Choose 2–3 of 3' },
  { key: 'block3', title: 'Block C', instructions: 'Choose 2–3 of 3' },
];

const PROGRAMME = PROGRAMME_DAYS.map((day, dayIndex) => ({
  id: `day-${dayIndex}`,
  label: day.label,
  blocks: BLOCK_META.map((meta) => ({
    id: `day-${dayIndex}-${meta.key}`,
    title: meta.title,
    instructions: meta.instructions,
    exercises: day[meta.key].map((exercise, exIndex) => ({
      id: `day-${dayIndex}-${meta.key}-ex-${exIndex}`,
      name: exercise.name,
      reps: exercise.reps,
    })),
  })),
}));
