# True Strength AI

A small, static web app for measuring **relative** and **absolute** strength
in a gym setting — for both men and women — and seeing how far a lift is
from a goal or from lifting your own bodyweight.

No build step, no backend, no dependencies. Open `index.html` or host it
on GitHub Pages.

## What it does

Enter your sex, bodyweight, and any of four lifts (Squat, Bench Press,
Deadlift, Overhead Press) as a 1-rep max, and the app shows for each lift:

- **Absolute strength** — the weight itself.
- **Relative strength** — the lift as a multiple of your bodyweight
  (e.g. `1.75× bodyweight`).
- **A classification** on a 6-tier scale (Untrained → Beginner → Novice →
  Intermediate → Advanced → Elite), with a visual band bar and how much
  more weight is needed to reach the next tier.
- **Distance to your own bodyweight** — the classic "can you lift what you
  weigh" milestone, with an estimate of how much more is needed if not yet
  there.
- **Distance to a goal** — set an optional target weight per lift and see
  percent progress and kg/lb remaining.
- A **strength profile radar chart** comparing all entered lifts on the
  same 0–100 scale.
- A **powerlifting total** (Squat + Bench + Deadlift) score, when all three
  are entered.

## Standards used

Standards live in [`js/standards.js`](js/standards.js) as bodyweight
multipliers per lift, per sex — five thresholds each (the ratio needed to
be classed Beginner / Novice / Intermediate / Advanced / Elite). Below the
first threshold is "Untrained."

These are general estimates assembled from the shape of commonly published
bodyweight-multiplier strength charts (the kind used by sites like
StrengthLevel or Symmetric Strength). They are **not** a scientific or
federation-certified standard — treat them as a rough compass, not a
verdict. The numbers are plain data at the top of one file, so they're easy
to replace with a standard you trust more, or to extend with more lifts.

## Running it

Any static file server works, e.g.:

```
python3 -m http.server 8000
```

then open `http://localhost:8000`. Or just open `index.html` directly in a
browser. To publish it for free, enable GitHub Pages on this repo
(Settings → Pages → deploy from the `main` branch, root folder).

## Project structure

```
index.html        Page structure & form
css/styles.css     Styling, light/dark theme
js/standards.js    Strength standards data + calculation helpers (no DOM code)
js/app.js          Form handling, results rendering, radar chart (SVG)
```

`js/standards.js` has no DOM dependency, so its functions can be
unit-tested directly with Node:

```
node -e "console.log(require('./js/standards.js').classifyLift('male','squat',80,140))"
```
