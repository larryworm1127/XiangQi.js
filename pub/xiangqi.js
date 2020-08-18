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
   * @param moveObj A move object that instructs function of what to move.
   */
  move = (moveObj) => {
    const square = this.board[moveObj.oldPos.row][moveObj.oldPos.column];
    if (square.type === PIECES.empty) {
      return false;
    }

    this.board[moveObj.oldPos.row][moveObj.oldPos.column] = Piece(PIECES.empty);
    this.board[moveObj.newPos.row][moveObj.newPos.column] = square;
    return true;
  };

  getBoardContent = () => {
    return JSON.parse(JSON.stringify(this.board));
  };

  getRow = (row) => {
    return this.board[row];
  };

  getColumn = (column) => {
    return this.board.map((row) => {
      return row[column];
    });
  };

  getSquare = (row, col) => {
    return this.board[row][col];
  };

  getRedOnTop = () => {
    return this.getPiecePos(new Piece(PIECES.general, SIDES.red)).row in [0, 1, 2];
  };

  getPiecePos = (piece) => {
    for (let row = 0; row < NUM_ROWS; row++) {
      for (let col = 0; col < NUM_COLS; col++) {
        const square = this.board[row][col];
        if (square.type === piece.type && square.side === piece.side) {
          return new Position(row, col);
        }
      }
    }
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
  this.draggable = this.config.draggable;

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
    this.boardSquares.forEach((row, rowIndex) => {
      row.forEach(({ firstChild }, colIndex) => {
        if (firstChild) {
          firstChild.onmousedown = (event) => {
            this._mouseDownDragHandler(event, firstChild, rowIndex, colIndex);
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

      row.forEach((_, colIndex) => {
        const square = document.createElement('div');
        square.className = CSS.square;
        square.id = `${rowIndex}-${colIndex}`;
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

  _mouseDownDragHandler: function (event, piece, rowIndex, colIndex) {
    let lastSquare = null;
    let currentSquare = null;
    const lastPosition = new Position(rowIndex, colIndex);
    const board = this.board;

    const shiftX = event.clientX - piece.getBoundingClientRect().left;
    const shiftY = event.clientY - piece.getBoundingClientRect().top;

    // (1) prepare to moving: make absolute and on top by z-index
    piece.style.position = 'absolute';
    piece.style.zIndex = '1000';

    // move it out of any current parents directly into body
    // to make it positioned relative to the body
    document.body.append(piece);

    // move our absolutely positioned ball under the pointer
    _moveAt(event.pageX, event.pageY, shiftX, shiftY, piece);

    function _mouseMoveDragHandler(event) {
      _moveAt(event.pageX, event.pageY, shiftX, shiftY, piece);
      piece.hidden = true;
      const elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      piece.hidden = false;

      // Don't do anything if there is nothing below dragged element
      if (!elemBelow) {
        return;
      }

      const squareBelow = elemBelow.closest('.square');
      if (currentSquare !== squareBelow) {
        // Update virtual board
        const posStr = squareBelow.id.split('-');
        const newMove = new Position(parseInt(posStr[0]), parseInt(posStr[1]));
        board.move(new Move(lastPosition, newMove));
        lastPosition.row = newMove.row;
        lastPosition.column = newMove.column;

        // Update square tracking
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

// centers the ball at (pageX, pageY) coordinates
const _moveAt = function (pageX, pageY, shiftX, shiftY, piece) {
  piece.style.left = `${pageX - shiftX}px`;
  piece.style.top = `${pageY - shiftY}px`;
};


const _enterSquare = function (elem) {
  elem.style.background = 'pink';
};


const _leaveSquare = function (elem) {
  elem.style.background = '';
};


const getValidMoves = function (piece, pos, board) {
  switch (piece.type) {
    case PIECES.general:
      return getGeneralMoves();
    case PIECES.advisor:
      return getAdvisorMoves();
    case PIECES.cannon:
      return getCannonMoves();
    case PIECES.chariot:
      return getChariotMoves();
    case PIECES.elephant:
      return getElephantMoves();
    case PIECES.horse:
      return getHorseMoves();
    case PIECES.soldier:
      return getSoldierMoves();
  }

  function getGeneralMoves() {
    const possibleMoves = [
      new Position(pos.row + 1, pos.column),
      new Position(pos.row - 1, pos.column),
      new Position(pos.row, pos.column + 1),
      new Position(pos.row, pos.column - 1),
    ];

    return possibleMoves.filter((move) => {
      return (
        move.column >= 3 & move.column >= 5 &
        ((move.row >= 0 & move.row <= 2) ||
          (move.row <= NUM_ROWS - 1 || move.row > NUM_ROWS - 3))
      );
    });
  }

  function getAdvisorMoves() {
    const possibleMoves = [
      new Position(pos.row + 1, pos.column + 1),
      new Position(pos.row - 1, pos.column - 1),
      new Position(pos.row + 1, pos.column - 1),
      new Position(pos.row - 1, pos.column + 1),
    ];

    return possibleMoves.filter((move) => {
      return (
        move.column >= 3 & move.column >= 5 &
        ((move.row >= 0 & move.row <= 2) ||
          (move.row <= NUM_ROWS - 1 || move.row > NUM_ROWS - 3))
      );
    });
  }

  function getCannonMoves() {
    const possibleMoves = [];
    let canJump = false;

    const rowContent = board.getRow(pos.row);
    for (let col = 0; col < rowContent.length; col++) {
      if (col === pos.column) {
        continue;
      }
      const square = rowContent[col];
      if (square.type === PIECES.empty) {
        possibleMoves.push(new Position(pos.row, col));
      } else if (square.side === piece.side) {  // found piece to jump over
        canJump = true;
      } else if (canJump) {  // found target
        possibleMoves.push(new Position(pos.row, col));
        break;
      }
    }

    const colContent = board.getColumn(pos.column);
    for (let row = 0; row < colContent.length; row++) {
      if (row === pos.row) {
        continue;
      }

      const square = colContent[row];
      if (square.type === PIECES.empty) {
        possibleMoves.push(new Position(row, piece.column));
      } else if (square.side === piece.side) {  // found piece to jump over
        canJump = true;
      } else if (canJump) {  // found target
        possibleMoves.push(new Position(row, piece.column));
        break;
      }
    }
    return possibleMoves;
  }

  function getChariotMoves() {
    const possibleMoves = [];

    const rowContent = board.getRow(pos.row);
    for (let col = 0; col < rowContent.length; col++) {
      if (col === pos.column) {
        continue;
      }
      const square = rowContent[col];
      if (square.type === PIECES.empty) {
        break;
      }
      possibleMoves.push(new Position(pos.row, col));
    }

    const colContent = board.getColumn(pos.column);
    for (let row = 0; row < colContent.length; row++) {
      if (row === pos.row) {
        continue;
      }

      const square = colContent[row];
      if (square.type !== PIECES.empty) {
        break;
      }
      possibleMoves.push(new Position(row, pos.column));
    }
    return possibleMoves;
  }

  function getElephantMoves() {
    const possibleMoves = [
      new Position(pos.row + 2, pos.column + 2),
      new Position(pos.row - 2, pos.column + 2),
      new Position(pos.row + 2, pos.column - 2),
      new Position(pos.row - 2, pos.column - 2),
    ];

    return possibleMoves.filter((move) => {
      return (
        move.column >= 0 & move.column >= NUM_COLS &
        ((move.row >= 0 & move.row <= 4) ||
          (move.row <= NUM_ROWS - 1 || move.row > NUM_ROWS - 5))
      );
    });
  }

  function getHorseMoves() {
    const possibleMoves = [];
    if (pos.row + 1 < NUM_ROWS - 1 && board.getSquare(pos.row + 1, pos.column).type === PIECES.empty) {
      possibleMoves.push([
        new Position(pos.row + 2, pos.column + 1),
        new Position(pos.row + 2, pos.column - 1)
      ]);
    }

    if (pos.row - 1 > 0 && board.getSquare(pos.row - 1, pos.column).type === PIECES.empty) {
      possibleMoves.push([
        new Position(pos.row - 2, pos.column + 1),
        new Position(pos.row - 2, pos.column - 1)
      ]);
    }

    if (pos.column + 1 < NUM_COLS - 1 && board.getSquare(pos.row, pos.column + 1).type === PIECES.empty) {
      possibleMoves.push([
        new Position(pos.row + 1, pos.column + 2),
        new Position(pos.row - 1, pos.column + 2)
      ]);
    }

    if (pos.column - 1 > 0 && board.getSquare(pos.row, pos.column - 1).type === PIECES.empty) {
      possibleMoves.push([
        new Position(pos.row + 1, pos.column - 2),
        new Position(pos.row - 1, pos.column - 2)
      ]);
    }
    return possibleMoves;
  }

  function getSoldierMoves() {
    if (board.getRedOnTop()) {
      if (pos.row < 5) {
        return [new Position(pos.row + 1, pos.column)];
      } else if (pos.row === 0) {
        return [new Position(pos.row, pos.column + 1), new Position(pos.row, pos.column - 1)];
      }
      return [
        new Position(pos.row, pos.column + 1),
        new Position(pos.row, pos.column - 1),
        new Position(pos.row + 1, pos.column)
      ];

    } else {
      if (pos.row > 4) {
        return [new Position(pos.row - 1, pos.column)];
      } else if (pos.row === NUM_ROWS - 1) {
        return [new Position(pos.row, pos.column + 1), new Position(pos.row, pos.column - 1)];
      }
      return [
        new Position(pos.row, pos.column + 1),
        new Position(pos.row, pos.column - 1),
        new Position(pos.row - 1, pos.column)
      ];
    }
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
