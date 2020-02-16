// ################################
// Utilities

function randRange(a, b) {
  if (b === undefined)
    return Math.floor(Math.random() * a);
  return Math.floor(Math.random() * (b - a) + a);
}

function randChoice(stuff) {
  return stuff[randRange(stuff.length)];
}

// Shuffle in-place
function randShuffle(stuff) {
  let n = stuff.length;
  for (let i = n - 1; i >= 0; i--) {
    let j = randRange(i + 1);
    let tmp = stuff[i]; stuff[i] = stuff[j]; stuff[j] = tmp;
  }
  return stuff;
}

// ################################
// Level generators

/*
A level generator is a function with no argument that returns
the following object:
  {
    question: something appendable to question-pane,
    answers: array of [is_correct, answer],
  }.
No need to shuffle the answers.
*/

// Mapping level name --> generator
const LGs = {};

// Simple arithmetics
LGs['simple_arith'] = function () {
  let a = randChoice([1, 2, 3]);
  let b = randChoice([1, 2, 3]);
  let d = randChoice([-1, 1]);
  return {
    question: ("" + a + " + " + b),
    answers: [
      [true, "" + (a + b)],
      [false, "" + (a + b + d)],
    ],
  };
};
