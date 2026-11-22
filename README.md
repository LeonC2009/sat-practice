# SAT Math Practice

A free, keyboard-friendly practice app for the digital SAT Math section. It makes up fresh questions every time, grades them with the same rules as the real test, tracks your stats, and gives a rough estimate of the score you're practising at.

Open `index.html` in a browser, or visit the GitHub Pages link for this repo. There is nothing to install and no account to make.

## What's in it

- **All 19 SAT Math skills** across the four test areas, each at easy, medium and hard:
  - Algebra: linear equations (one and two variables), linear functions, systems, inequalities
  - Advanced Math: equivalent expressions, nonlinear equations and systems, nonlinear functions
  - Problem-Solving and Data Analysis: ratios and rates, percentages, one-variable data, scatterplots and models, probability, margin of error, statistical claims
  - Geometry and Trigonometry: area and volume, lines and angles, right triangles and trig, circles
- **Endless questions.** Each one is generated from a template with random numbers, so the answer key is calculated, never typed in by hand. Tables, scatterplots and diagrams are drawn right in the question.
- **Real-test grading.** Multiple choice is an exact match. Grid-in answers follow the SAT entry rules: fractions and decimals both work, 5 characters for a positive answer and 6 for a negative one, and no mixed numbers.
- **Auto difficulty.** Two right in a row on a topic moves you up a level, and a miss moves you down. You can also pick a topic and difficulty yourself.
- **Stats page.** Accuracy, average time against the real test's pace (about 1:35 per question), a breakdown by topic and difficulty, and an estimated score with a chart over time.
- **Reference sheet** with the same formulas the real test gives you, and a link to the Desmos calculator.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `A` `B` `C` `D` | Pick an answer |
| `Enter` | Check the answer, then go to the next question |
| `S` | Stats |
| `P` or `Esc` | Back to practice |
| `R` | Reference sheet |

## About the score estimate

The estimate is a rough guide, not a prediction. Each test area gets a rating that moves up or down depending on how hard the questions you get right or wrong are. The areas are weighted like the real test (Algebra and Advanced Math about 35% each, Data Analysis and Geometry about 15% each). The College Board doesn't publish its exact scoring formula, and these practice questions aren't the real test, so check your level against an official practice test in the College Board's Bluebook app.

## Your data

Progress is saved in your browser only (in local storage). Nothing is sent anywhere. That means it stays on one device and browser, and clearing your browser data or using the **Reset progress** button erases it.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app in one file. This is the only file needed to run it. |
| `template.html` | The page layout and styling, with placeholders for the code |
| `core.js` | Shared helpers, the answer checker, and the Algebra questions |
| `adv.js` | Advanced Math questions |
| `psda.js` | Problem-Solving and Data Analysis questions |
| `geo.js` | Geometry and Trigonometry questions |
| `ui.js` | The interface: practice view, stats, score estimate, shortcuts |
| `build.py` | Combines the files above into `index.html` |
| `test.js` | Checks every question generator (see below) |

## Changing it

After editing any of the `.js` files or `template.html`, rebuild the app:

```
python3 build.py
```

To check the question generators, run (needs Node.js):

```
node test.js            # all topics
node test.js psda       # only topics starting with "psda"
```

It generates thousands of questions per topic and difficulty, and checks for broken answer choices, duplicate options, invalid grid-in answers and formatting glitches.

To add a topic, add a generator to the matching file, register the skill in the `DOMAINS` list in `core.js`, and run the build and the test.

## Notes

All questions are original. They follow the College Board's published digital SAT Math framework and skill descriptions, and no official test questions are copied. To take real full-length tests, use the free practice tests in the College Board's Bluebook app.

SAT® is a trademark of the College Board, which is not affiliated with this project.
