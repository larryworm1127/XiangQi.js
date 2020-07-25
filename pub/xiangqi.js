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

// Enums
const PIECES = {
  general: 'General',
  advisor: 'Advisor',
  elephant: 'Elephant',
  cannon: 'Cannon',
  chariot: 'Chariot',
  horse: 'Horse',
  soldier: 'Soldier',
  empty: 'Empty'
};
const SIDES = {
  red: 'r',
  black: 'b'
};

// ======================================================================
// A virtual XiangQi board
// Used to keep track of XiangQi pieces on the board.
// ======================================================================
class Board {

  constructor(config) {
    if (config.boardContent.length > 0) {
      this.board = config.boardContent.map((row) => {
        return row.slice();
      });
    } else if (config.startPos) {
      this.setStartPosition(config.redOnBottom);
    } else {
      this.board = new Array(NUM_ROWS).fill(new Array(NUM_COLS).fill(Piece(PIECES.empty)));
    }
  }

  /**
   * Precondition: the move is valid
   *
   * @param move A move object that instructs function of what to move.
   */
  move = (move) => {
    const square = this.board[move.oldPos.row][move.oldPos.column];
    if (square.type === PIECES.empty) {
      return false;
    }

    this.board[move.oldPos.row][move.oldPos.column] = Piece(PIECES.empty);
    this.board[move.newPos.row][move.newPos.column] = square;
    return true;
  };

  getBoardContent = () => {
    return JSON.parse(JSON.stringify(this.board));
  };

  clearBoard = () => {
    this.board = this.board.map(() => {
      return new Array(NUM_COLS).fill(Piece(PIECES.empty));
    });
  };

  setStartPosition = (redOnBottom) => {
    this.board = getStartBoard(redOnBottom).map((row) => {
      return row.slice();
    });
  };
}


// ======================================================================
// Objects functions
// ======================================================================
function Piece(type, side) {
  return { type: type, side: side };
}

function Position(row, column) {
  return { row: row, column: column };
}

function Move(oldPos, newPos) {
  return { oldPos: oldPos, newPos: newPos };
}


// ======================================================================
// Main library function
// ======================================================================
function XiangQi(inputConfig) {
  this.config = this._buildConfig(inputConfig);
  this.boardWidth = this.config.boardSize;
  this.containerElement = this.config.container;
  this.draggable = this.config.draggable;

  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / NUM_COLS) * NUM_ROWS;
  this.boardSquares = [[], [], [], [], [], [], [], [], [], []];
  this.board = new Board(this.config);

  // Draw board and its content if delayDraw is disabled in config
  if (!this.config.delayDraw) {
    this.drawBoard();
    this.drawBoardContent();
  }

  // Draw side bar if enabled in config
  if (this.config.showSideBar) {
    this._drawSideBar();
  }
}

XiangQi.prototype = {
  // ======================================================================
  // Main features functions
  // ======================================================================
  drawBoard: function () {
    this._drawBoardDOM();
  },

  movePiece: function (move) {
    if (this.board.move(move)) {
      this.clearBoard(false);
      this.drawBoardContent();
    }
  },

  drawStartPositions: function () {
    this.board.setStartPosition(this.config.redOnBottom);
    this.drawBoardContent();
  },

  drawBoardContent: function () {
    const content = this.board.getBoardContent();
    content.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square.type !== PIECES.empty) {
          this._drawPieceDOM(rowIndex, colIndex, square.type, square.side);
        }
      });
    });
  },

  clearBoard: function (clearVirtual = true) {
    this.boardSquares.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        this._removePieceDOM(rowIndex, colIndex);
      });
    });

    // Clear virtual board content
    if (clearVirtual) {
      this.board.clearBoard();
    }
  },

  drawPiece: function (row, col, piece, side) {
    this._drawPieceDOM(row, col, piece, side);
  },

  removePiece: function (row, col) {
    this._removePieceDOM(row, col);
  },

  // ======================================================================
  // DOM manipulation functions
  // ======================================================================
  _drawBoardDOM: function () {
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
        this.boardSquares[row].push(square);
      }

      const clear = document.createElement('div');
      clear.className = CSS.clear;
      rowDiv.appendChild(clear);
      board.appendChild(rowDiv);
    }

    this.containerElement.appendChild(board);
  },

  _drawPieceDOM: function (row, col, piece, side) {
    if (!this.boardSquares[row][col].firstChild) {
      const pieceElement = document.createElement('img');
      pieceElement.src = `${PIECE_PATH}${side}${piece}.svg`;
      pieceElement.style.width = `${this.squareSize}px`;
      pieceElement.style.height = `${this.squareSize}px`;

      this.boardSquares[row][col].appendChild(pieceElement);
    }
  },

  _drawSideBar: function () {
    const sideBar = document.createElement('div');
    sideBar.className = CSS.sideBar;
    sideBar.style.width = `${this.squareSize * 2}px`;
    sideBar.style.height = `${this.boardHeight}px`;

    this.containerElement.appendChild(sideBar);
  },

  _removePieceDOM: function (row, col) {
    const square = this.boardSquares[row][col];
    while (square.firstChild) {
      square.removeChild(square.lastChild);
    }
  },

  // ======================================================================
  // Utility functions
  // ======================================================================
  _buildConfig: function (inputConfig) {
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

  _getPieceCounts: function () {
    // TODO: finish this
    const result = {
      red: {},
      black: {}
    };
    Object.keys(PIECES).forEach((piece) => {
      result.red[piece] = 0;
      result.black[piece] = 0;
    });
    this.boardSquares.forEach((row) => {
      row.forEach((square) => {

      });
    });
  }
};

const getStartBoard = function (redOnBottom) {
  const topSide = (redOnBottom) ? SIDES.black : SIDES.red;
  const bottomSide = (topSide === SIDES.red) ? SIDES.black : SIDES.red;
  return [
    [
      Piece(PIECES.chariot, topSide),
      Piece(PIECES.horse, topSide),
      Piece(PIECES.elephant, topSide),
      Piece(PIECES.advisor, topSide),
      Piece(PIECES.general, topSide),
      Piece(PIECES.advisor, topSide),
      Piece(PIECES.elephant, topSide),
      Piece(PIECES.horse, topSide),
      Piece(PIECES.chariot, topSide),
    ],
    new Array(NUM_COLS).fill(Piece(PIECES.empty)),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 1 || index === 7) ? Piece(PIECES.cannon, topSide) : item;
    }),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index % 2 === 0) ? Piece(PIECES.soldier, topSide) : item;
    }),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index % 2 === 0) ? Piece(PIECES.soldier, bottomSide) : item;
    }),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)).map((item, index) => {
      return (index === 1 || index === 7) ? Piece(PIECES.cannon, bottomSide) : item;
    }),
    new Array(NUM_COLS).fill(Piece(PIECES.empty)),
    [
      Piece(PIECES.chariot, bottomSide),
      Piece(PIECES.horse, bottomSide),
      Piece(PIECES.elephant, bottomSide),
      Piece(PIECES.advisor, bottomSide),
      Piece(PIECES.general, bottomSide),
      Piece(PIECES.advisor, bottomSide),
      Piece(PIECES.elephant, bottomSide),
      Piece(PIECES.horse, bottomSide),
      Piece(PIECES.chariot, bottomSide),
    ],
  ];
};
