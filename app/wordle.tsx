import { formatOrdinals } from "./formatting";

export enum WordleGuessResult {
  Correct,
  OutOfPosition,
  Incorrect,
}

type LetterOffset = number;

export interface WordleGuess {
  correct: LetterOffset[];
  out_of_position: LetterOffset[];
}

export function parseWordleGrid(grid: string) {
  const rows = grid.trim().split("\n");
  const guesses = rows.map(parseWordleGuess);
  const labels = guesses.map((guess, index) => {
    return formatMessageForGuess(index + 1, guess);
  });
  const s = labels.length > 1 ? "s" : "";
  return `
    A grid of blocks with ${
      rows.length
    } row${s} and five colums of blocks, each row being a guess in a game of Wordle. ${labels.join(
    ". "
  )}.
  `;
  // Run through each row
}

function formatMessageForOutcome(
  label: "correct" | "out of position",
  offsets: number[]
) {
  const ordinals = offsets.map((offset) => formatOrdinals(offset));
  const multiple = offsets.length > 1;
  const w = multiple ? "are" : "is";
  const s = multiple ? "s" : "";
  if (multiple) {
    ordinals[ordinals.length - 1] = `and ${ordinals[ordinals.length - 1]}`;
  }
  return `The ${ordinals.join(", ")} letter${s} ${w} ${label}`;
}

function formatMessageForGuess(offset: number, guess: WordleGuess) {
  let message = `In the ${formatOrdinals(offset)} guess `;
  const hasCorrect = guess.correct.length > 0;
  const hasOutOfPosition = guess.out_of_position.length > 0;
  if (hasCorrect) {
    const allCorrrect = guess.correct.length === 5;
    if (allCorrrect) {
      message += "all of the letters are correct";
      return message;
    }
    message += formatMessageForOutcome("correct", guess.correct);
  }
  if (hasOutOfPosition) {
    if (hasCorrect) {
      message += " and ";
    }
    const allOutOfPosition = guess.out_of_position.length === 5;
    if (allOutOfPosition) {
      message += "all of the letters were out of position";
      return message;
    }
    message += formatMessageForOutcome(
      "out of position",
      guess.out_of_position
    );
  }
  if (!hasCorrect && !hasOutOfPosition) {
    message += "all letters were incorrect";
  }
  return message;
}

function parseWordleGuess(row: string): WordleGuess {
  const guess: WordleGuess = {
    correct: [],
    out_of_position: [],
  };
  // Use spread to split without messing with unicode stuff.
  for (const [index, block] of [...row].entries()) {
    populateGuessForBlock(block, index, guess);
  }
  return guess;
}

function getColorOfGuessResult(result: WordleGuessResult) {
  switch (result) {
    case WordleGuessResult.Correct:
      return "green";
    case WordleGuessResult.OutOfPosition:
      return "yellow";
    case WordleGuessResult.Incorrect:
      return "gray";
  }
}

function populateGuessForBlock(
  char: string,
  index: number,
  guess: WordleGuess
) {
  // We use base-1 since we will translate this to an ordinal.
  const offset = index + 1;
  switch (char) {
    case "🟨":
      return guess.out_of_position.push(offset);
    case "🟩":
      return guess.correct.push(offset);
    case "⬜":
    case "⬛":
      // Do nothing
      return;
    default:
      console.error("Unknown character", char);
  }
}
