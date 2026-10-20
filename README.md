# Sprint Survival

A small browser simulator by [Coded Female](https://codedfemale.com). Guide a fictional mentoring app through three sprints: choose useful work, handle surprises and protect team wellbeing.

Plain HTML, CSS and JavaScript. No installation, dependencies or build step. No sign-up, analytics or remote data storage. There is no timer. Progress saves automatically in this browser using localStorage; return to resume the same journey.

## Play online

[Play Sprint Survival](https://codedfemale-dev.github.io/sprint-survival/)

## Play locally

Keep all application HTML, CSS and JavaScript files together, including `scenarios.js`, `save.js`, `studio.js` and `studio.css`. Open `index.html` in your browser.

1. Choose a team approach and add tasks in delivery order.
2. Lock the plan to reveal a surprise.
3. Choose a response, then adjust the plan.
4. Deliver, review and continue through all three sprints.
5. Read your final reflection, download it as a text file or replay with different decisions.

## How the model works

- A sprint starts with 12 effort units. These represent working time, not story points.
- Support reserves 2 capacity units and adds 8 wellbeing points. Steady adds 2 wellbeing points. Stretch adds 2 capacity units and costs 10 wellbeing points.
- Events change capacity and wellbeing. All wellbeing changes apply after delivery.
- Wellbeing begins at 80/100. Starting a sprint below 65 reduces capacity by 1; below 45 reduces it by 3. Wellbeing stays within 0 to 100.
- Tasks are attempted in selection order. Delivery stops at the first task that does not fit. Dependencies must be selected earlier or already complete.
- Removing a prerequisite also removes its dependants from the plan.
- Unfinished planned work returns to the backlog without partial progress and costs 4 wellbeing points per sprint. Work that was never selected has no penalty.
- Completed tasks remain complete. Sprint goals include work completed in earlier sprints.
- Value is a fictional estimate. There is no combined score or leaderboard. Accessibility, trust, learning and wellbeing belong in delivery conversations.
- The same three events appear each game to make comparisons easier. The partner banner becomes available after the first event, even if you defer it.

This is a deliberately simplified learning model. It does not prescribe Scrum rules or measure real people’s wellbeing or productivity.

## Add to GitHub

Upload the contents of this folder into a repository called `sprint-survival`. Keep the four application files together at the repository root. Include this README and the licence.

To publish with GitHub Pages, choose **Settings → Pages → Deploy from a branch**, then select your default branch and **/(root)**. GitHub’s [official publishing guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) explains the options. The project works as a static site and requires no server features.

Suggested repository description: “A playful delivery simulator about priorities, surprises and team wellbeing. Built with vanilla JavaScript for Coded Female.”

## Remix challenges

1. **First change:** edit a task title and description in `engine.js`. Keep its `id` unchanged.
2. **Try a trade-off:** adjust a task’s `effort` or `value`, then compare the results.
3. **Write a surprise:** rewrite an event’s choices and learning notes. Keep three options and check the stated effects match `capacity` and `wellbeing`.
4. **Go further:** add a task, give it a unique ID, then use that ID in another task’s `deps` to introduce a dependency.

| File | Purpose |
| --- | --- |
| `index.html` | Introduction, instructions and page structure |
| `style.css` | Coded Female colours, layout and responsive styles |
| `engine.js` | Task data, events and simulation rules |
| `script.js` | Shared controls and reflection download |
| `tests.cjs` | Rule checks with Node’s built-in test runner |
| `save.js` | Validated browser-local save and resume |
| `studio-tests.cjs` | Studio, replay and persistence checks |

Run optional rule checks with `node --test tests.cjs`. The checks are development tools; players do not need Node.

## Accessibility

Native buttons support keyboard use. Selection states use `aria-pressed`; phase changes focus the new heading; plan changes are announced through a live region. The layout adapts to narrow screens, honours reduced motion and does not rely on colour alone. No external fonts are loaded; it uses the system font stack used in the existing First Code Playground project.

## Licence

MIT. Contributions and remixes welcome. See `LICENSE`.

## Illustrated team studio

All three sprints and the final reflection share one illustrated studio with Maya, Jo, Sam and a duck guide. Sprint 1 explores priorities and scope; sprint 2 explores blockers, support and an inclusive booking journey; sprint 3 explores tested demonstrations, feedback and outcome evidence.

The duck introduces worked examples at the moment a decision matters. Character dialogue models team conversations. Each sprint has a short debrief with explanations for both answers. The cumulative product preview shows only delivered features, with example feedback questions clearly distinguished from real user evidence. The final story and downloadable reflection include each sprint’s response, lessons and answered debriefs.

`studio.js` renders the journey using the original engine and shared controls; `studio.css` supplies responsive layouts and code-native SVG/CSS illustrations. Mission cards include unfinished prerequisite work from earlier sprints. Queue reordering protects prerequisites. Pace labels include any recovery reduction from starting wellbeing. The original capacity, dependency and wellbeing rules are retained.

Replay a sprint from its review, or revisit any sprint from the final story. This restores that sprint’s starting state while retaining earlier results; later results and debrief answers are cleared. Start a new journey to return to the introduction and reset everything. Progress saves on this browser; no personal information is collected.

Run all rule and studio integration checks with `node --test tests.cjs studio-tests.cjs`.

## Save and resume

After starting, every game decision saves automatically under the namespaced `codedfemale:sprint-survival:studio:v1` localStorage key. Refreshing or returning shows a resume screen with the saved sprint and phase. The save includes the plan order, pace, response, delivered work, wellbeing, history and debrief answers. Replay checkpoints are rebuilt from history when resuming, so revisiting earlier sprints still works. Completed journeys can also be reopened.

Starting fresh asks before replacing saved progress. Cancel keeps the current save. Saves stay on the same browser/device; clearing site data or private browsing can remove them. There is no account, remote storage, cross-device sync or analytics. If browser storage is unavailable, the game remains playable and clearly says that it cannot save.

`save.js` versions and validates saves by rebuilding their history through the engine. Unreadable, incompatible or inconsistent saves fall back to a playable introduction instead of rendering stored content or breaking the game. The browser stores one journey; if several tabs play independently, the last saved action becomes the saved journey.

## Branching stories and original block-built art

Choose a story before starting a new journey. **First steps** retains the original three situations. **Changing pressures** adds seven original situations: AI review work, recovery, conflicting decisions, unfinished foundations, unreliable booking checks, keyboard access and attendance evidence. There are ten situations across the two stories.

Changing pressures selects later situations from earlier responses, delivered work and end-of-sprint wellbeing. A review-after-hours promise brings recovery into sprint 2; an unfinished booking journey brings a foundations discussion; unresolved pressure brings verification into sprint 3. Otherwise, missing keyboard booking prompts an access scenario, while delivered keyboard booking leads to an attendance investigation. Each branch states why it appeared, with worked examples, team dialogue and debrief explanations. Numerical capacity/wellbeing effects also differ by situation.

Branch selection uses only completed earlier sprints. A situation cannot switch midway through its response or review, and identical decisions give a consistent comparison. Saves retain the story; replay rebuilds the appropriate branch from the retained earlier history. Existing version-one and version-two saves without a story field continue in First steps. Downloaded reflections record the actual situations and their causes.

The characters, studio and duck use original vector cuboids and visible construction seams. These are generic block-built illustrations created for this game, without third-party branding, logos or copied toy figures.
