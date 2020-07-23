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
function Position(side, row, column, type) {
  return { side: side, row: row, column: column, type: type };
}


// Main library function
function XiangQi(inputConfig) {
  const config = this.buildConfig(inputConfig);
  this.boardWidth = config['boardSize'];
  this.containerElement = config['container'];
  this.boardContent = config['boardContent'];
  this.startPos = config['startPos'];
  this.showSideBar = config['showSideBar'];
  this.draggable = config['draggable'];
  this.delayDraw = config['delayDraw'];
  this.redOnBottom = config['redOnBottom'];

  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / 9) * 10;
  this.board = [[], [], [], [], [], [], [], [], [], []];

  // User given board content always overrides start position
  if (this.startPos && this.boardContent.length === 0) {
    this.boardContent = [...getStartPosition(this.redOnBottom)];
  } else {
    this.startPos = false;
    this.redOnBottom = false;
  }

  // Draw board and its content if delayDraw is disabled in config
  if (!this.delayDraw) {
    this.drawBoard();
    this.drawBoardContent(this.boardContent);
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
  const topSide = (redOnBottom) ? SIDES.black : SIDES.red
  const bottomSide = (topSide === SIDES.red) ? SIDES.black : SIDES.red
  return [
    Position(topSide, 0, 4, PIECES.general),
    Position(topSide, 0, 3, PIECES.advisor),
    Position(topSide, 0, 5, PIECES.advisor),
    Position(topSide, 0, 2, PIECES.elephant),
    Position(topSide, 0, 6, PIECES.elephant),
    Position(topSide, 2, 1, PIECES.cannon),
    Position(topSide, 2, 7, PIECES.cannon),
    Position(topSide, 0, 0, PIECES.chariot),
    Position(topSide, 0, 8, PIECES.chariot),
    Position(topSide, 0, 1, PIECES.horse),
    Position(topSide, 0, 7, PIECES.horse),
    Position(topSide, 3, 0, PIECES.soldier),
    Position(topSide, 3, 2, PIECES.soldier),
    Position(topSide, 3, 4, PIECES.soldier),
    Position(topSide, 3, 6, PIECES.soldier),
    Position(topSide, 3, 8, PIECES.soldier),

    Position(bottomSide, 9, 4, PIECES.general),
    Position(bottomSide, 9, 3, PIECES.advisor),
    Position(bottomSide, 9, 5, PIECES.advisor),
    Position(bottomSide, 9, 2, PIECES.elephant),
    Position(bottomSide, 9, 6, PIECES.elephant),
    Position(bottomSide, 7, 1, PIECES.cannon),
    Position(bottomSide, 7, 7, PIECES.cannon),
    Position(bottomSide, 9, 0, PIECES.chariot),
    Position(bottomSide, 9, 8, PIECES.chariot),
    Position(bottomSide, 9, 1, PIECES.horse),
    Position(bottomSide, 9, 7, PIECES.horse),
    Position(bottomSide, 6, 0, PIECES.soldier),
    Position(bottomSide, 6, 2, PIECES.soldier),
    Position(bottomSide, 6, 4, PIECES.soldier),
    Position(bottomSide, 6, 6, PIECES.soldier),
    Position(bottomSide, 6, 8, PIECES.soldier),
  ];
};
