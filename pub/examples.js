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
    [
      Piece(PIECES.empty), Piece(PIECES.chariot, SIDES.black),
      Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.general, SIDES.black),
      Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.empty),
    ],
    new Array(9).fill(Piece(PIECES.empty)),
    [
      Piece(PIECES.empty), Piece(PIECES.horse, SIDES.black), Piece(PIECES.empty),
      Piece(PIECES.empty), Piece(PIECES.elephant, SIDES.black), Piece(PIECES.advisor, SIDES.black),
      Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.empty),
    ],
    new Array(9).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 4) ? Piece(PIECES.soldier, SIDES.black) : item;
    }),
    [
      Piece(PIECES.empty), Piece(PIECES.chariot, SIDES.red), Piece(PIECES.empty),
      Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.soldier, SIDES.red),
      Piece(PIECES.empty), Piece(PIECES.empty), Piece(PIECES.empty),
    ],
    new Array(9).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 7) ? Piece(PIECES.horse, SIDES.red) : item;
    }),
    [
      Piece(PIECES.soldier, SIDES.black), Piece(PIECES.empty), Piece(PIECES.empty),
      Piece(PIECES.empty), Piece(PIECES.cannon, SIDES.red), Piece(PIECES.empty),
      Piece(PIECES.empty), Piece(PIECES.cannon, SIDES.black), Piece(PIECES.chariot, SIDES.black)
    ],
    new Array(9).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 3) ? Piece(PIECES.advisor, SIDES.red) : item;
    }),
    new Array(9).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 4) ? Piece(PIECES.general, SIDES.red) : item;
    }),
    new Array(9).fill(Piece(PIECES.empty))
  ];
  const board = new XiangQi({ containerId: 'midGameBoard', boardContent: midGameBoardContent });
};

const interactiveBoard = function () {
  const board = new XiangQi({ containerId: 'buttonControlBoard', delayDraw: true });
  document.getElementById('drawBoard').onclick = () => {
    board.drawBoard();
    document.getElementById('drawBoard').setAttribute('disabled', 'true');
    document.getElementById('drawStartPos').removeAttribute('disabled');
  };

  document.getElementById('drawStartPos').onclick = () => {
    board.drawStartPositions();
    document.getElementById('drawStartPos').setAttribute('disabled', 'true');
  };

  document.getElementById('clearBoard').onclick = () => {
    board.clearBoard();
    document.getElementById('drawStartPos').removeAttribute('disabled');
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
      Move(Position(9, 1), Position(5, 1))
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

  // Create larger size board
  largerBoard();

  // Create board controlled by buttons
  interactiveBoard();

  // Create board with piece movements
  pieceMoveBoard();
});
