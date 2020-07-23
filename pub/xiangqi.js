'use strict';

// Other constants
const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  square: 'square',
  clear: 'clear',
  row: 'row',
  sideBar: 'side-bar'
};
const PIECE_PATH = 'assets/pieces/';

// XiangQi related constants
const NUM_ROWS = 10;
const NUM_COLS = 9;
const PIECES = {
  general: 'General',
  advisor: 'Advisor',
  elephant: 'Elephant',
  cannon: 'Cannon',
  chariot: 'Chariot',
  horse: 'Horse',
  soldier: 'Soldier'
};
const SIDES = {
  red: 'r',
  black: 'b'
};

// Objects functions
function Position(row, column, type, side) {
  return { side: side, row: row, column: column, type: type };
}

function Move(oldPos, newPos) {
  return { oldPos: oldPos, newPos: newPos };
}


// Main library function
function XiangQi(inputConfig) {
  const config = this.buildConfig(inputConfig);
  this.boardWidth = config['boardSize'];
  this.containerElement = config['container'];
  this.initialBoardContent = [...config['boardContent']];
  this.startPos = config['startPos'];
  this.showSideBar = config['showSideBar'];
  this.draggable = config['draggable'];
  this.delayDraw = config['delayDraw'];
  this.redOnBottom = config['redOnBottom'];

  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / 9) * 10;
  this.board = [[], [], [], [], [], [], [], [], [], []];

  // User given board content always overrides start position
  if (this.startPos && this.initialBoardContent.length === 0) {
    this.initialBoardContent = [...getStartPosition(this.redOnBottom)];
  } else {
    this.startPos = false;
    this.redOnBottom = false;
  }

  // Draw board and its content if delayDraw is disabled in config
  if (!this.delayDraw) {
    this.drawBoard();
    this.drawBoardContent(this.initialBoardContent);
  }

  // Draw side bar if enabled in config
  if (this.showSideBar) {
    this.drawSideBar();
  }
}

XiangQi.prototype = {
  // ======================================================================
  // DOM manipulation functions
  // ======================================================================
  drawBoard: function () {
    const board = document.createElement('div');
    board.className = CSS.board;
    board.style.width = `${this.boardWidth}px`;
    board.style.height = `${this.boardHeight}px`;

    // Add square div
    for (let row = 0; row < NUM_ROWS; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = CSS.row;

      for (let col = 0; col < NUM_COLS; col++) {
        const square = document.createElement('div');
        square.className = CSS.square;
        square.style.width = `${this.squareSize}px`;
        square.style.height = `${this.squareSize}px`;
        rowDiv.appendChild(square);
        this.board[row].push(square);
      }

      const clear = document.createElement('div');
      clear.className = CSS.clear;
      rowDiv.appendChild(clear);
      board.appendChild(rowDiv);
    }

    this.containerElement.appendChild(board);
  },

  drawBoardContent: function (boardContent) {
    boardContent.forEach((piece) => {
      this.drawPieces(piece.row, piece.column, piece.type, piece.side);
    });
  },

  drawPieces: function (row, col, piece, side, container) {
    const pieceElement = document.createElement('img');
    pieceElement.src = `${PIECE_PATH}${side}${piece}.svg`;
    pieceElement.style.width = `${this.squareSize}px`;
    pieceElement.style.height = `${this.squareSize}px`;

    if (container) {
      container.appendChild(pieceElement);
    } else {
      this.board[row][col].appendChild(pieceElement);
    }
  },

  drawSideBar: function () {
    const sideBar = document.createElement('div');
    sideBar.className = CSS.sideBar;
    sideBar.style.width = `${this.squareSize * 2}px`;
    sideBar.style.height = `${this.boardHeight}px`;

    this.containerElement.appendChild(sideBar);
  },

  clearBoard: function () {
    this.board.forEach((row) => {
      row.forEach((square) => {
        while (square.firstChild) {
          square.removeChild(square.lastChild);
        }
      });
    });
  },

  movePiece: function (move) {
    const newSquare = this.board[move.newPos.row][move.newPos.column];
    if (!newSquare.hasChildNodes()) {
      const oldSquare = this.board[move.oldPos.row][move.oldPos.column];
      const pieceElement = oldSquare.firstChild;
      oldSquare.removeChild(pieceElement);
      newSquare.appendChild(pieceElement);
    }
  },

  // ======================================================================
  // Utility functions
  // ======================================================================
  buildConfig: function (inputConfig) {
    const config = (inputConfig === undefined) ? {} : inputConfig;
    return {
      boardSize: ('boardSize' in config) ? config['boardSize'] : 400,
      container: ('containerId' in config) ? document.getElementById(config['containerId']) : document.body,
      boardContent: ('boardContent' in config) ? config['boardContent'] : [],
      startPos: ('startPos' in config) ? config['startPos'] : false,
      showSideBar: ('showSideBar' in config) ? config['showSideBar'] : false,
      draggable: ('draggable' in config) ? config['draggable'] : false,
      delayDraw: ('delayDraw' in config) ? config['delayDraw'] : false,
      redOnBottom: ('redOnBottom' in config) ? config['redOnBottom'] : false,
    };
  },
};

const getStartPosition = function (redOnBottom) {
  const topSide = (redOnBottom) ? SIDES.black : SIDES.red;
  const bottomSide = (topSide === SIDES.red) ? SIDES.black : SIDES.red;
  return [
    Position(0, 4, PIECES.general, topSide),
    Position(0, 3, PIECES.advisor, topSide),
    Position(0, 5, PIECES.advisor, topSide),
    Position(0, 2, PIECES.elephant, topSide),
    Position(0, 6, PIECES.elephant, topSide),
    Position(2, 1, PIECES.cannon, topSide),
    Position(2, 7, PIECES.cannon, topSide),
    Position(0, 0, PIECES.chariot, topSide),
    Position(0, 8, PIECES.chariot, topSide),
    Position(0, 1, PIECES.horse, topSide),
    Position(0, 7, PIECES.horse, topSide),
    Position(3, 0, PIECES.soldier, topSide),
    Position(3, 2, PIECES.soldier, topSide),
    Position(3, 4, PIECES.soldier, topSide),
    Position(3, 6, PIECES.soldier, topSide),
    Position(3, 8, PIECES.soldier, topSide),

    Position(9, 4, PIECES.general, bottomSide),
    Position(9, 3, PIECES.advisor, bottomSide),
    Position(9, 5, PIECES.advisor, bottomSide),
    Position(9, 2, PIECES.elephant, bottomSide),
    Position(9, 6, PIECES.elephant, bottomSide),
    Position(7, 1, PIECES.cannon, bottomSide),
    Position(7, 7, PIECES.cannon, bottomSide),
    Position(9, 0, PIECES.chariot, bottomSide),
    Position(9, 8, PIECES.chariot, bottomSide),
    Position(9, 1, PIECES.horse, bottomSide),
    Position(9, 7, PIECES.horse, bottomSide),
    Position(6, 0, PIECES.soldier, bottomSide),
    Position(6, 2, PIECES.soldier, bottomSide),
    Position(6, 4, PIECES.soldier, bottomSide),
    Position(6, 6, PIECES.soldier, bottomSide),
    Position(6, 8, PIECES.soldier, bottomSide),
  ];
};
