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
    Position(0, 0, PIECES.chariot, SIDES.red),
    Position(0, 8, PIECES.chariot, SIDES.red),
    Position(0, 2, PIECES.elephant, SIDES.red),
    Position(2, 4, PIECES.elephant, SIDES.red),
    Position(0, 5, PIECES.advisor, SIDES.red),
    Position(1, 4, PIECES.advisor, SIDES.red),
    Position(2, 6, PIECES.horse, SIDES.red),
    Position(4, 7, PIECES.cannon, SIDES.red),
    Position(4, 0, PIECES.soldier, SIDES.red),
    Position(4, 2, PIECES.soldier, SIDES.red),
    Position(3, 4, PIECES.soldier, SIDES.red),
    Position(4, 6, PIECES.soldier, SIDES.red),
    Position(3, 8, PIECES.soldier, SIDES.red),
    Position(0, 4, PIECES.general, SIDES.red),

    Position(9, 1, PIECES.chariot, SIDES.black),
    Position(3, 3, PIECES.chariot, SIDES.black),
    Position(9, 2, PIECES.elephant, SIDES.black),
    Position(9, 6, PIECES.elephant, SIDES.black),
    Position(9, 5, PIECES.advisor, SIDES.black),
    Position(8, 4, PIECES.advisor, SIDES.black),
    Position(7, 0, PIECES.horse, SIDES.black),
    Position(7, 4, PIECES.cannon, SIDES.black),
    Position(6, 0, PIECES.soldier, SIDES.black),
    Position(5, 4, PIECES.soldier, SIDES.black),
    Position(6, 6, PIECES.soldier, SIDES.black),
    Position(6, 8, PIECES.soldier, SIDES.black),
    Position(9, 4, PIECES.general, SIDES.black),
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

const interactiveBoard = function () {
  const board = new XiangQi({ containerId: 'buttonControlBoard', delayDraw: true });
  document.getElementById('drawBoard').onclick = () => {
    board.drawBoard();
    document.getElementById('drawBoard').setAttribute('disabled', 'true');
  };

  document.getElementById('drawStartPos').onclick = () => {
    board.drawBoardContent(getStartPosition());
  };

  document.getElementById('clearBoard').onclick = () => {
    board.clearBoard();
  };
};

const pieceMoveBoard = function () {
  const board = new XiangQi({ containerId: 'movePieceBoard', startPos: true });
  const generator = getMove();

  document.getElementById('move').onclick = function () {
    const nextMove = generator.next();
    if (!nextMove.done) {
      board.movePiece(nextMove.value);
    } else {
      document.getElementById('move').setAttribute('disabled', 'true');
    }
  };

  function* getMove() {
    const moves = [
      Move(Position(2, 1), Position(2, 4)),
      Move(Position(7, 1), Position(7, 4)),
      Move(Position(0, 1), Position(2, 2)),
      Move(Position(9, 1), Position(7, 2)),
      Move(Position(0, 0), Position(1, 0)),
      Move(Position(9, 0), Position(9, 1)),
      Move(Position(1, 0), Position(1, 5)),
      Move(Position(9, 1), Position(6, 1))
    ];
    let index = 0;
    while (index < moves.length) {
      yield moves[index];
      index++;
    }
  }
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

  // Create board controlled by buttons
  interactiveBoard();

  // Create board with piece movements
  pieceMoveBoard();
});
