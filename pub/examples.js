'use strict';


// Board demo functions
const emptyBoard = function () {
  const board = new XiangQi({ containerId: 'emptyBoard' });
};

const fullBoardStart = function () {
  const board = new XiangQi({ containerId: 'fullBoardStart', startPos: true });
};

const midGameBoard = function () {
  // One of the ways to create JS object mapping for board content
  const midGameBoardContent = [
    Position(SIDES.red, 0, 0, PIECES.chariot),
    Position(SIDES.red, 0, 8, PIECES.chariot),
    Position(SIDES.red, 0, 2, PIECES.elephant),
    Position(SIDES.red, 2, 4, PIECES.elephant),
    Position(SIDES.red, 0, 5, PIECES.advisor),
    Position(SIDES.red, 1, 4, PIECES.advisor),
    Position(SIDES.red, 2, 6, PIECES.horse),
    Position(SIDES.red, 4, 7, PIECES.cannon),
    Position(SIDES.red, 4, 0, PIECES.soldier),
    Position(SIDES.red, 4, 2, PIECES.soldier),
    Position(SIDES.red, 3, 4, PIECES.soldier),
    Position(SIDES.red, 4, 6, PIECES.soldier),
    Position(SIDES.red, 3, 8, PIECES.soldier),
    Position(SIDES.red, 0, 4, PIECES.general),

    Position(SIDES.black, 9, 1, PIECES.chariot),
    Position(SIDES.black, 3, 3, PIECES.chariot),
    Position(SIDES.black, 9, 2, PIECES.elephant),
    Position(SIDES.black, 9, 6, PIECES.elephant),
    Position(SIDES.black, 9, 5, PIECES.advisor),
    Position(SIDES.black, 8, 4, PIECES.advisor),
    Position(SIDES.black, 7, 0, PIECES.horse),
    Position(SIDES.black, 7, 4, PIECES.cannon),
    Position(SIDES.black, 6, 0, PIECES.soldier),
    Position(SIDES.black, 5, 4, PIECES.soldier),
    Position(SIDES.black, 6, 6, PIECES.soldier),
    Position(SIDES.black, 6, 8, PIECES.soldier),
    Position(SIDES.black, 9, 4, PIECES.general),
  ];
  const board = new XiangQi({ containerId: 'midGameBoard', boardContent: midGameBoardContent });
};

const lateGameBoard = function () {
  // Board content can also be loaded in from JSON files
  // The string below would ideally be in a JSON file but is extracted for demo
  const lateGameBoardContent =
    '[{"side": "b", "row": 0, "column": 1, "type": "Chariot"},' +
    '{"side": "b", "row": 0, "column": 4, "type": "General"},' +
    '{"side": "b", "row": 2, "column": 1, "type": "Horse"},' +
    '{"side": "b", "row": 2, "column": 4, "type": "Elephant"},' +
    '{"side": "b", "row": 2, "column": 5, "type": "Advisor"},' +
    '{"side": "b", "row": 3, "column": 4, "type": "Soldier"},' +
    '{"side": "b", "row": 6, "column": 0, "type": "Soldier"},' +
    '{"side": "b", "row": 6, "column": 7, "type": "Cannon"},' +
    '{"side": "b", "row": 6, "column": 8, "type": "Chariot"},' +
    '{"side": "r", "row": 4, "column": 1, "type": "Chariot"},' +
    '{"side": "r", "row": 4, "column": 5, "type": "Soldier"},' +
    '{"side": "r", "row": 5, "column": 7, "type": "Horse"},' +
    '{"side": "r", "row": 6, "column": 4, "type": "Cannon"},' +
    '{"side": "r", "row": 7, "column": 3, "type": "Advisor"},' +
    '{"side": "r", "row": 8, "column": 4, "type": "General"}]';

  const boardContent = JSON.parse(lateGameBoardContent);
  const board = new XiangQi({ containerId: 'lateGameBoard', boardContent: boardContent });
};

const largerBoard = function () {
  const board = new XiangQi({ containerId: 'largeBoard', boardSize: 800, startPos: true });
};


document.addEventListener('DOMContentLoaded', function () {
  // Create empty board
  emptyBoard();

  // Create full start board
  fullBoardStart();

  // Create mid game board
  midGameBoard();

  // Create late game board
  lateGameBoard();

  // Create larger size board
  largerBoard();
});
