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

// Board content objects
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

  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / 9) * 10;
  this.board = [[], [], [], [], [], [], [], [], [], []];

  // User given board content always overrides start position
  if (this.startPos && this.boardContent.length === 0) {
    this.boardContent = [...this.getStartPosition()]
  } else {
    this.startPos = false;
  }

  // Draw board and its content
  this.drawBoard();
  this.drawBoardContent();
}

XiangQi.prototype = {
  drawBoard: function () {
    const board = createDiv([CSS.board]);
    board.style.width = `${this.boardWidth}px`;
    board.style.height = `${this.boardHeight}px`;

    // Add square div
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
    }

    this.containerElement.appendChild(board);
  },

  drawBoardContent: function () {
    this.boardContent.forEach((piece) => {
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

  drawPieceCount: function () {
    const sideBar = createDiv([CSS.sideBar]);
    sideBar.style.width = `${this.squareSize * 2}px`;
    sideBar.style.height = `${this.boardHeight}px`;

    this.containerElement.appendChild(sideBar);
  },

  // ======================================================================
  // Utility functions
  // ======================================================================
  buildConfig: function (config) {
    return {
      boardSize: ('boardSize' in config) ? config['boardSize'] : 400,
      container: ('containerId' in config) ? document.getElementById(config['containerId']) : document.body,
      boardContent: ('boardContent' in config) ? config['boardContent'] : [],
      startPos: ('startPos' in config) ? config['startPos'] : false,
      showSideBar: ('showSideBar' in config) ? config['showSideBar'] : false,
      draggable: ('draggable' in config) ? config['draggable'] : false
    };
  },

  getStartPosition: function () {
    return [
      Position(SIDES.red, 0, 4, PIECES.general),
      Position(SIDES.red, 0, 3, PIECES.advisor),
      Position(SIDES.red, 0, 5, PIECES.advisor),
      Position(SIDES.red, 0, 2, PIECES.elephant),
      Position(SIDES.red, 0, 6, PIECES.elephant),
      Position(SIDES.red, 2, 1, PIECES.cannon),
      Position(SIDES.red, 2, 7, PIECES.cannon),
      Position(SIDES.red, 0, 0, PIECES.chariot),
      Position(SIDES.red, 0, 8, PIECES.chariot),
      Position(SIDES.red, 0, 1, PIECES.horse),
      Position(SIDES.red, 0, 7, PIECES.horse),
      Position(SIDES.red, 3, 0, PIECES.soldier),
      Position(SIDES.red, 3, 2, PIECES.soldier),
      Position(SIDES.red, 3, 4, PIECES.soldier),
      Position(SIDES.red, 3, 6, PIECES.soldier),
      Position(SIDES.red, 3, 8, PIECES.soldier),

      Position(SIDES.black, 9, 4, PIECES.general),
      Position(SIDES.black, 9, 3, PIECES.advisor),
      Position(SIDES.black, 9, 5, PIECES.advisor),
      Position(SIDES.black, 9, 2, PIECES.elephant),
      Position(SIDES.black, 9, 6, PIECES.elephant),
      Position(SIDES.black, 7, 1, PIECES.cannon),
      Position(SIDES.black, 7, 7, PIECES.cannon),
      Position(SIDES.black, 9, 0, PIECES.chariot),
      Position(SIDES.black, 9, 8, PIECES.chariot),
      Position(SIDES.black, 9, 1, PIECES.horse),
      Position(SIDES.black, 9, 7, PIECES.horse),
      Position(SIDES.black, 6, 0, PIECES.soldier),
      Position(SIDES.black, 6, 2, PIECES.soldier),
      Position(SIDES.black, 6, 4, PIECES.soldier),
      Position(SIDES.black, 6, 6, PIECES.soldier),
      Position(SIDES.black, 6, 8, PIECES.soldier),
    ];
  },
};

const createDiv = (className) => {
  const element = document.createElement('div');
  element.classList.add(...className);
  return element;
};
