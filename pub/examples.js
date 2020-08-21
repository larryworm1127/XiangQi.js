'use strict';


// Board demo functions
const emptyBoard = function () {
  const board = new XiangQi({ containerId: 'emptyBoard' });
};

const fullBoardStart = function () {
  const board = new XiangQi({ containerId: 'fullBoardStart', boardContent: 'start' });
};

const midGameBoard = function () {
  const midGameFen = '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9'
  const board = new XiangQi({ containerId: 'midGameBoard', boardContent: midGameFen });
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
