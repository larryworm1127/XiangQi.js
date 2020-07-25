'use strict';


// Board demo functions
const emptyBoard = function () {
  const fullConfig = {
    // the size of the XiangQi board, defaults to 400 if not provided
    boardSize: 400,
    // the ID of container element in the DOM, defaults to document.body if not provided
    containerId: 'emptyBoard',
    // initial board content, defaults to empty if not provided
    boardContent: [],
    // whether to draw board with start positions, defaults to false if not provided.
    startPos: false,
    // whether to draw sidebar or not, defaults to false if not provided (sidebar not implemented yet)
    showSideBar: false,
    // whether to allow pieces to be draggable, defaults to false if not provided (dragging not implemented yet)
    draggable: false,
    // whether to draw board on object creation, defaults to false if not provided.
    delayDraw: false,
    // whether to draw red side on bottom for start positions, defaults to false if not provided.
    redOnBottom: false
  };
  const board = new XiangQi(fullConfig);
};

const fullBoardStart = function () {
  const board = new XiangQi({ containerId: 'fullBoardStart', startPos: true });
};

const midGameBoard = function () {
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
  const drawBoardButton = document.getElementById('drawBoard');
  const drawStartPosButton = document.getElementById('drawStartPos');
  const clearBoardButton = document.getElementById('clearBoard');

  drawBoardButton.onclick = () => {
    board.drawBoard();
    drawBoardButton.setAttribute('disabled', 'true');
    drawStartPosButton.removeAttribute('disabled');
  };

  drawStartPosButton.onclick = () => {
    board.drawStartPositions();
    drawStartPosButton.setAttribute('disabled', 'true');
  };

  clearBoardButton.onclick = () => {
    board.clearBoard();
    drawStartPosButton.removeAttribute('disabled');
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

const addRemovePieceBoard = function () {
  const board = new XiangQi({ containerId: 'addRemoveControlBoard', startPos: true });

  const pieceType = document.getElementById('type');
  const side = document.getElementById('side');
  const addRow = document.getElementById('addRow');
  const addCol = document.getElementById('addCol');
  const addButton = document.getElementById('addPiece');

  const removeRow = document.getElementById('removeRow');
  const removeCol = document.getElementById('removeCol');
  const removeButton = document.getElementById('removePiece');

  addButton.onclick = (e) => {
    e.preventDefault();

    board.drawPiece(addRow.value, addCol.value, pieceType.value, side.value);
  };

  removeButton.onclick = (e) => {
    e.preventDefault();

    board.removePiece(removeRow.value, removeCol.value);
  };
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

  // Create board that adds and remove pieces
  addRemovePieceBoard();

  // Create board with piece movements
  pieceMoveBoard();
});
