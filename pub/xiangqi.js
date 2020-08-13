'use strict';

// Other constants
const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  square: 'square',
  clear: 'clear',
  row: 'row',
  sideBar: 'side-bar',
  sideBarSide: 'side-bar-side',
  sideBarTitle: 'side-bar-title'
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

  removePiece = (row, col) => {
    this.board[row][col] = Piece(PIECES.empty);
  };

  clearBoard = () => {
    this.board.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        this.removePiece(rowIndex, colIndex);
      });
    });
  };

  setStartPosition = (redOnBottom) => {
    this.board = getStartBoard(redOnBottom).map((row) => {
      return row.slice();
    });
  };

  getPieceCounts = () => {
    const result = {
      r: {},
      b: {}
    };
    Object.values(PIECES).forEach((piece) => {
      if (piece !== PIECES.empty) {
        result.r[piece] = 0;
        result.b[piece] = 0;
      }
    });

    this.board.forEach((row) => {
      row.forEach((square) => {
        if (square.type !== PIECES.empty) {
          result[square.side][square.type] += 1;
        }
      });
    });
    return result;
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
  this.config = _buildConfig(inputConfig);
  this.boardWidth = this.config.boardSize;
  this.containerElement = this.config.container;
  // this.draggable = this.config.draggable;
  this.draggable = true;

  this.squareSize = (this.boardWidth - 2) / NUM_COLS;
  this.boardHeight = (this.boardWidth / NUM_COLS) * NUM_ROWS;
  this.boardSquares = [[], [], [], [], [], [], [], [], [], []];
  this.board = new Board(this.config);
  this.hasSideBar = this.config.showSideBar;

  // Draw board and its content if delayDraw is disabled in config
  if (!this.config.delayDraw) {
    this.drawBoard();
    this.drawBoardContent();
  }

  // Draw side bar if enabled in config
  if (this.config.showSideBar) {
    this._drawSideBar();
  }

  if (this.draggable) {
    this.makeDraggable();
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
    this.board.removePiece(row, col);
  },

  drawSideBar: function () {
    if (!this.hasSideBar) {
      this._drawSideBar();
      this.hasSideBar = true;
    } else {
      this._updateSideBar();
    }
  },

  makeDraggable: function () {
    this.boardSquares.forEach((row) => {
      row.forEach(({ firstChild }) => {
        if (firstChild) {
          firstChild.onmousedown = (event) => {
            this._mouseDownDragHandler(event, firstChild);
          };

          firstChild.ondragstart = () => {
            return false;
          };
        }
      });
    });
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
    this.board.getBoardContent().forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = CSS.row;

      row.forEach(() => {
        const square = document.createElement('div');
        square.className = CSS.square;
        square.style.width = `${this.squareSize}px`;
        square.style.height = `${this.squareSize}px`;
        rowDiv.appendChild(square);
        this.boardSquares[rowIndex].push(square);
      });

      const clear = document.createElement('div');
      clear.className = CSS.clear;
      rowDiv.appendChild(clear);
      board.appendChild(rowDiv);
    });

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
    // Create sidebar container
    const sideBar = document.createElement('div');
    sideBar.className = CSS.sideBar;

    const sideBarTitle = document.createElement('p');
    sideBarTitle.textContent = 'Piece Counts';
    sideBarTitle.className = CSS.sideBarTitle;
    sideBar.appendChild(sideBarTitle);

    // Get and display piece counts
    const pieceCount = this.board.getPieceCounts();
    Object.entries(pieceCount).forEach(([side, pieceTypes]) => {
      const sideDiv = document.createElement('div');
      sideDiv.className = CSS.sideBarSide;

      Object.entries(pieceTypes).forEach(([pieceType, count]) => {
        const pieceDiv = document.createElement('div');

        const pieceElement = document.createElement('img');
        pieceElement.src = `${PIECE_PATH}${side}${pieceType}.svg`;
        pieceElement.style.width = `${this.squareSize}px`;
        pieceElement.style.height = `${this.squareSize}px`;
        pieceElement.textContent = `${count}`;
        pieceDiv.appendChild(pieceElement);

        const countElement = document.createElement('span');
        countElement.textContent = `${count}`;
        pieceDiv.appendChild(countElement);

        sideDiv.appendChild(pieceDiv);
      });

      sideBar.appendChild(sideDiv);
    });

    // Add sidebar div to main container
    this.containerElement.appendChild(sideBar);
  },

  _updateSideBar: function () {
    const pieceCount = this.board.getPieceCounts();
    console.log(pieceCount);
    const sideDivs = document.getElementsByClassName(CSS.sideBarSide);
    Object.values(pieceCount).forEach((pieceTypes, index) => {
      const sideDiv = sideDivs.item(index).children;

      Object.values(pieceTypes).forEach((count, index) => {
        const pieceDiv = sideDiv.item(index).children.item(1);
        pieceDiv.textContent = `${count}`;
      });
    });
  },

  _removePieceDOM: function (row, col) {
    const square = this.boardSquares[row][col];
    while (square.firstChild) {
      square.removeChild(square.lastChild);
    }
  },

  _mouseDownDragHandler: function (event, piece) {
    let lastSquare = null;
    let currentSquare = null;

    const shiftX = event.clientX - piece.getBoundingClientRect().left;
    const shiftY = event.clientY - piece.getBoundingClientRect().top;

    // (1) prepare to moving: make absolute and on top by z-index
    piece.style.position = 'absolute';
    piece.style.zIndex = '1000';

    // move it out of any current parents directly into body
    // to make it positioned relative to the body
    document.body.append(piece);

    // move our absolutely positioned ball under the pointer
    _moveAt(event.pageX, event.pageY);

    // centers the ball at (pageX, pageY) coordinates
    function _moveAt(pageX, pageY) {
      piece.style.left = pageX - shiftX + 'px';
      piece.style.top = pageY - shiftY + 'px';
    }

    function _mouseMoveDragHandler(event) {
      _moveAt(event.pageX, event.pageY);
      piece.hidden = true;
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      piece.hidden = false;

      if (!elemBelow) {
        return;
      }

      const squareBelow = elemBelow.closest('.square');
      if (currentSquare !== squareBelow) {
        if (currentSquare) {
          _leaveSquare(currentSquare);
        }
        lastSquare = currentSquare;
        currentSquare = squareBelow;
        if (currentSquare) {
          _enterSquare(currentSquare);
        }
      }
    }

    // move the ball on mousemove
    document.addEventListener('mousemove', _mouseMoveDragHandler);

    piece.onmouseup = () => {
      this._mouseUpDragHandler(piece, _mouseMoveDragHandler, currentSquare, lastSquare);
    };
  },

  _mouseUpDragHandler: function (piece, _mouseMoveDragHandler, currentSquare, lastSquare) {
    // Clear mousemove handlers
    document.removeEventListener('mousemove', _mouseMoveDragHandler);
    piece.onmouseup = null;

    // Clear square highlight
    _leaveSquare(currentSquare);
    if (!currentSquare.firstChild) {
      currentSquare.appendChild(piece);
    } else {
      lastSquare.appendChild(piece);
    }
    piece.style.position = 'static';
    piece.style.zIndex = '0';
  },
};


// ======================================================================
// Utility functions
// ======================================================================
const _buildConfig = function (inputConfig) {
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
};


const _enterSquare = function (elem) {
  elem.style.background = 'pink';
};


const _leaveSquare = function (elem) {
  elem.style.background = '';
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
