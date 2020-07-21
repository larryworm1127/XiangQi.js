'use strict';

// Other constants
const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  square: 'square',
  clear: 'clear',
  row: 'row',
};
const PIECE_PATH = 'assets/pieces/';

// XiangQi related constants
const NUM_ROWS = 10;
const NUM_COLS = 9;
const PIECES = {
  general: 'General.svg',
  advisor: 'Advisor.svg',
  elephant: 'Elephant.svg',
  cannon: 'Cannon.svg',
  chariot: 'Chariot.svg',
  horse: 'Horse.svg',
  soldier: 'Soldier.svg'
};
const SIDES = {
  red: 'r',
  black: 'b'
};

// Board content objects
function Position(row, column) {
  return { row: row, column: column };
}

function PiecesPos(
  general,
  advisor,
  elephant,
  cannon,
  chariot,
  horse,
  soldier
) {
  return {
    general: [...general],
    advisor: [...advisor],
    elephant: [...elephant],
    cannon: [...chariot],
    horse: [...horse],
    soldier: [...soldier]
  };
}

function Side(redPiecesPos, blackPiecesPos) {
  return { red: redPiecesPos, black: blackPiecesPos };
}


// Main library function
function XiangQi(containerId, boardSize, boardContent) {
  this.boardWidth = (boardSize === undefined) ? 400 : boardSize;
  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / 9) * 10;
  this.containerElement = document.querySelector(`#${containerId}`);
  this.board = [[], [], [], [], [], [], [], [], [], []];

  this.drawBoard();
}


XiangQi.prototype = {
  drawBoard: function () {
    const boardContainer = createDiv([CSS.boardContainer]);
    const board = createDiv([CSS.board]);
    board.style.width = `${this.boardWidth}px`;
    board.style.height = `${this.boardHeight}px`;

    for (let row = 0; row < NUM_ROWS; row++) {
      const rowDiv = createDiv([CSS.row]);

      for (let col = 0; col < NUM_COLS; col++) {
        const square = createDiv([CSS.square]);
        square.style.width = `${this.squareSize}px`;
        square.style.height = `${this.squareSize}px`;
        rowDiv.appendChild(square);
        this.board[row].push(square);
      }

      const clear = createDiv([CSS.clear]);
      rowDiv.appendChild(clear);
      board.appendChild(rowDiv);
      boardContainer.appendChild(board);
    }

    this.containerElement.appendChild(boardContainer);
  },

  drawBoardContent: function (boardContent) {
    Object.entries(boardContent).forEach(([side, pieces]) => {
      Object.entries(pieces).forEach(([piece, positions]) => {
        positions.forEach((position) => {
          this.drawPieces(position.row, position.column, piece, side);
        });
      });
    });
  },

  drawPieces: function (row, col, piece, side) {
    const pieceElement = document.createElement('img');
    pieceElement.src = `${PIECE_PATH}${SIDES[side]}${PIECES[piece]}`;
    pieceElement.style.width = `${this.squareSize}px`;
    pieceElement.style.height = `${this.squareSize}px`;
    this.board[row][col].appendChild(pieceElement);
  },

  drawStartPosition: function () {
    this.drawBoardContent(this.getStartPosition());
  },

  // ======================================================================
  // Utility functions
  // ======================================================================
  cleanUpConfig: function () {

  },

  getStartPosition: function () {
    const redPosition = PiecesPos(
      [Position(0, 4)],
      [Position(0, 3), Position(0, 5)],
      [Position(0, 2), Position(0, 6)],
      [Position(2, 1), Position(2, 7)],
      [Position(0, 0), Position(0, 8)],
      [Position(0, 1), Position(0, 7)],
      [Position(3, 0), Position(3, 2), Position(3, 4), Position(3, 6), Position(3, 8)]
    );
    const blackPositions = PiecesPos(
      [Position(9, 4)],
      [Position(9, 3), Position(9, 5)],
      [Position(9, 2), Position(9, 6)],
      [Position(7, 1), Position(7, 7)],
      [Position(9, 0), Position(9, 8)],
      [Position(9, 1), Position(9, 7)],
      [Position(6, 0), Position(6, 2), Position(6, 4), Position(6, 6), Position(6, 8)]
    );
    return Side(redPosition, blackPositions);
  },
};

const createDiv = (className) => {
  const element = document.createElement('div');
  element.classList.add(...className);
  return element;
};
