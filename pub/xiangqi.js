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
  sideBarTitle: 'side-bar-title',
  highlightSquare: 'highlight-square',
  highlightSquareMove: 'highlight-square-move'
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

    this.selectedSquare = { row: 0, column: 0 };
    this.previousHighlight = [];
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

  getSelectedSquare = () => {
    return this.selectedSquare;
  };

  updateSelectedSquare = (row, col) => {
    this.selectedSquare.row = row;
    this.selectedSquare.column = col;
  };

  setPreviousHighlight = (highlights) => {
    this.previousHighlight = [...highlights];
  };

  getPreviousHighlight = () => {
    return [...this.previousHighlight];
  };

  getValidMoves = (row, col) => {
    const piece = this.getSquare(row, col);
    const pos = new Position(row, col);
    switch (piece.type) {
      case PIECES.general:
        return getGeneralMoves(this);
      case PIECES.advisor:
        return getAdvisorMoves(this);
      case PIECES.cannon:
        return getCannonMoves(this);
      case PIECES.chariot:
        return getChariotMoves(this);
      case PIECES.elephant:
        return getElephantMoves(this);
      case PIECES.horse:
        return getHorseMoves(this);
      case PIECES.soldier:
        return getSoldierMoves(this);
    }

    function getGeneralMoves(board) {
      const possibleMoves = [
        Position(pos.row + 1, pos.column),
        Position(pos.row - 1, pos.column),
        Position(pos.row, pos.column + 1),
        Position(pos.row, pos.column - 1),
      ];

      return possibleMoves.filter((move) => {
        return (
          move.column >= 3 & move.column <= 5 &&
          ((move.row >= 0 & move.row <= 2) || (move.row < NUM_ROWS && move.row > NUM_ROWS - 4)) &&
          board.getBoardContent()[move.row][move.column].side !== piece.side
        );
      });
    }

    function getAdvisorMoves(board) {
      const possibleMoves = [
        Position(pos.row + 1, pos.column + 1),
        Position(pos.row - 1, pos.column - 1),
        Position(pos.row + 1, pos.column - 1),
        Position(pos.row - 1, pos.column + 1),
      ];

      return possibleMoves.filter((move) => {
        return (
          move.column >= 3 & move.column <= 5 &&
          ((move.row >= 0 & move.row <= 2) || (move.row < NUM_ROWS & move.row > NUM_ROWS - 4)) &&
          board.getBoardContent()[move.row][move.column].side !== piece.side
        );
      });
    }

    function getCannonMoves(board) {
      const possibleMoves = [];
      const boardContent = board.getBoardContent();

      let canJump = false;
      let rowBelow = pos.row + 1;
      while (rowBelow < NUM_ROWS) {
        const square = boardContent[rowBelow][pos.column];
        if (square.type !== PIECES.empty) {
          if (!canJump) {
            canJump = true;
          } else if (square.side !== piece.side && canJump) {
            possibleMoves.push(Position(rowBelow, pos.column));
            break;
          }
        }
        if (!canJump) {
          possibleMoves.push(Position(rowBelow, pos.column));
        }
        rowBelow += 1;
      }

      let rowAbove = pos.row - 1;
      canJump = false;
      while (rowAbove >= 0) {
        const square = boardContent[rowAbove][pos.column];
        if (square.type !== PIECES.empty) {
          if (!canJump) {
            canJump = true;
          } else if (square.side !== piece.side && canJump) {
            possibleMoves.push(Position(rowAbove, pos.column));
            break;
          }
        }
        if (!canJump) {
          possibleMoves.push(Position(rowAbove, pos.column));
        }
        rowAbove -= 1;
      }

      let colRight = pos.column + 1;
      canJump = false;
      while (colRight < NUM_COLS) {
        const square = boardContent[pos.row][colRight];
        if (square.type !== PIECES.empty) {
          if (!canJump) {
            canJump = true;
          } else if (square.side !== piece.side && canJump) {
            possibleMoves.push(Position(pos.row, colRight));
            break;
          }
        }
        if (!canJump) {
          possibleMoves.push(Position(pos.row, colRight));
        }
        colRight += 1;
      }

      let colLeft = pos.column - 1;
      canJump = false;
      while (colLeft >= 0) {
        const square = boardContent[pos.row][colLeft];
        if (square.type !== PIECES.empty) {
          if (!canJump) {
            canJump = true;
          } else if (square.side !== piece.side && canJump) {
            possibleMoves.push(Position(pos.row, colLeft));
            break;
          }
        }
        if (!canJump) {
          possibleMoves.push(Position(pos.row, colLeft));
        }
        colLeft -= 1;
      }
      return possibleMoves;
    }

    function getChariotMoves(board) {
      const possibleMoves = [];
      const boardContent = board.getBoardContent();

      let rowBelow = pos.row + 1;
      while (rowBelow < NUM_ROWS) {
        if (boardContent[rowBelow][pos.column].type !== PIECES.empty) {
          if (boardContent[rowBelow][pos.column].side !== piece.side) {
            possibleMoves.push(Position(rowBelow, pos.column));
          }
          break;
        }
        possibleMoves.push(Position(rowBelow, pos.column));
        rowBelow += 1;
      }

      let rowAbove = pos.row - 1;
      while (rowAbove >= 0) {
        if (boardContent[rowAbove][pos.column].type !== PIECES.empty) {
          if (boardContent[rowAbove][pos.column].side !== piece.side) {
            possibleMoves.push(Position(rowAbove, pos.column));
          }
          break;
        }
        possibleMoves.push(Position(rowAbove, pos.column));
        rowAbove -= 1;
      }

      let colRight = pos.column + 1;
      while (colRight < NUM_COLS) {
        if (boardContent[pos.row][colRight].type !== PIECES.empty) {
          if (boardContent[pos.row][colRight].side !== piece.side) {
            possibleMoves.push(Position(pos.row, colRight));
          }
          break;
        }
        possibleMoves.push(Position(pos.row, colRight));
        colRight += 1;
      }

      let colLeft = pos.column - 1;
      while (colLeft >= 0) {
        if (boardContent[pos.row][colLeft].type !== PIECES.empty) {
          if (boardContent[pos.row][colLeft].side !== piece.side) {
            possibleMoves.push(Position(pos.row, colLeft));
          }
          break;
        }
        possibleMoves.push(Position(pos.row, colLeft));
        colLeft -= 1;
      }
      return possibleMoves;
    }

    function getElephantMoves(board) {
      const possibleMoves = [];

      if (
        pos.row + 1 < NUM_ROWS - 1 &&
        pos.column + 1 < NUM_COLS - 1 &&
        board.getSquare(pos.row + 1, pos.column + 1).type === PIECES.empty
      ) {
        possibleMoves.push(Position(pos.row + 2, pos.column + 2));
      }

      if (
        pos.row + 1 < NUM_ROWS - 1 &&
        pos.column - 1 > 0 &&
        board.getSquare(pos.row + 1, pos.column - 1).type === PIECES.empty
      ) {
        possibleMoves.push(Position(pos.row + 2, pos.column - 2));
      }

      if (
        pos.row - 1 > 0 &&
        pos.column + 1 < NUM_COLS - 1 &&
        board.getSquare(pos.row - 1, pos.column + 1).type === PIECES.empty
      ) {
        possibleMoves.push(Position(pos.row - 2, pos.column + 2));
      }

      if (
        pos.row - 1 > 0 &&
        pos.column - 1 > 0 &&
        board.getSquare(pos.row - 1, pos.column - 1).type === PIECES.empty
      ) {
        possibleMoves.push(Position(pos.row - 2, pos.column - 2));
      }

      return possibleMoves.filter((move) => {
        const onTop = (
          (board.getRedOnTop() && piece.side === SIDES.red) ||
          (!board.getRedOnTop() && piece.side !== SIDES.red)
        );
        return onTop ? (
          move.column >= 0 &&
          move.column < NUM_COLS &&
          move.row >= 0 &&
          move.row <= 4 &&
          board.getBoardContent()[move.row][move.column].side !== piece.side
        ) : (
          move.column >= 0 &&
          move.column < NUM_COLS &&
          move.row < NUM_ROWS &&
          move.row > NUM_ROWS - 6 &&
          board.getBoardContent()[move.row][move.column].side !== piece.side
        );
      });
    }

    function getHorseMoves(board) {
      const possibleMoves = [];
      if (
        pos.row + 1 < NUM_ROWS - 1 &&
        board.getSquare(pos.row + 1, pos.column).type === PIECES.empty
      ) {
        possibleMoves.push(
          Position(pos.row + 2, pos.column + 1),
          Position(pos.row + 2, pos.column - 1)
        );
      }

      if (
        pos.row - 1 > 0 &&
        board.getSquare(pos.row - 1, pos.column).type === PIECES.empty
      ) {
        possibleMoves.push(
          Position(pos.row - 2, pos.column + 1),
          Position(pos.row - 2, pos.column - 1)
        );
      }

      if (
        pos.column + 1 < NUM_COLS - 1 &&
        board.getSquare(pos.row, pos.column + 1).type === PIECES.empty
      ) {
        possibleMoves.push(
          Position(pos.row + 1, pos.column + 2),
          Position(pos.row - 1, pos.column + 2)
        );
      }

      if (
        pos.column - 1 > 0 &&
        board.getSquare(pos.row, pos.column - 1).type === PIECES.empty
      ) {
        possibleMoves.push(
          Position(pos.row + 1, pos.column - 2),
          Position(pos.row - 1, pos.column - 2)
        );
      }
      return possibleMoves.filter((move) => {
        return (
          move.column >= 0 &&
          move.column < NUM_COLS &&
          move.row >= 0 &&
          move.row < NUM_ROWS &&
          board.getBoardContent()[move.row][move.column].side !== piece.side
        );
      });
    }

    function getSoldierMoves(board) {
      const onTop = (
        (board.getRedOnTop() && piece.side === SIDES.red) ||
        (!board.getRedOnTop() && piece.side !== SIDES.red)
      );
      if (onTop) {
        if (pos.row < 5) {
          return [Position(pos.row + 1, pos.column)];
        }
        return [
          Position(pos.row, pos.column + 1),
          Position(pos.row, pos.column - 1),
          Position(pos.row + 1, pos.column)
        ].filter((move) => {
          return (
            move.row >= 0 &&
            move.row < NUM_ROWS &&
            move.column >= 0 &&
            move.column < NUM_COLS &&
            board.getBoardContent()[move.row][move.column].side !== piece.side
          );
        });
      } else {
        if (pos.row > 4) {
          return [Position(pos.row - 1, pos.column)];
        }
        return [
          Position(pos.row, pos.column + 1),
          Position(pos.row, pos.column - 1),
          Position(pos.row - 1, pos.column)
        ].filter((move) => {
          return (
            move.row >= 0 &&
            move.row < NUM_ROWS &&
            move.column >= 0 &&
            move.column < NUM_COLS &&
            board.getBoardContent()[move.row][move.column].side !== piece.side
          );
        });
      }
    }
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
  this.clickable = this.config.clickable;

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
  } else if (this.clickable) {
    this.makeClickable();
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
    // Add drag handlers for each square
    this.boardSquares.forEach((row, rowIndex) => {
      row.forEach(({ firstChild }, colIndex) => {
        if (firstChild) {
          firstChild.onmousedown = (event) => this._mouseDownDragHandler(event, firstChild, rowIndex, colIndex);
          firstChild.ondragstart = () => false;
        }
      });
    });
  },

  removeDraggable: function () {
    this.boardSquares.forEach((row) => {
      row.forEach(({ firstChild }) => {
        if (firstChild) {
          firstChild.onmousedown = null;
          firstChild.ondragstart = null;
        }
      });
    });
  },

  makeClickable: function () {
    this.removeDraggable();

    // Add onclick handler for each square
    this.boardSquares.forEach((row, rowIndex) => {
      row.forEach((square, colIndex) => {
        if (square.firstChild) {
          square.onclick = () => {
            this._squareOnClickHandler(rowIndex, colIndex);
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
      if (squareBelow && currentSquare !== squareBelow) {
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

  _squareOnClickHandler: function (row, col) {
    // Remove previous highlight
    const previousSquare = this.board.getSelectedSquare();
    this.boardSquares[previousSquare.row][previousSquare.column].classList.remove(CSS.highlightSquare);
    this.board.getPreviousHighlight().forEach(({ row, column }) => {
      const square = this.boardSquares[row][column];
      if (!square.firstChild) {
        square.onclick = null;
      }
      square.classList.remove(CSS.highlightSquareMove);
    });

    // Add highlight to selected square
    this.boardSquares[row][col].classList.add(CSS.highlightSquare);

    // Show possible moves
    const moves = this.board.getValidMoves(row, col);
    console.log(moves);
    this.board.setPreviousHighlight(moves);
    this.board.updateSelectedSquare(row, col);
    moves.forEach(({ row, column }) => {
      this.boardSquares[row][column].classList.add(CSS.highlightSquareMove);
      this.boardSquares[row][column].onclick = () => {
        this._squareOnClickMoveHandler(row, column);
      };
    });
  },

  _squareOnClickMoveHandler: function (row, col) {
    // Remove piece from old square
    const currSquare = this.board.getSelectedSquare();
    const pieceElem = this.boardSquares[currSquare.row][currSquare.column].firstChild;
    this.boardSquares[currSquare.row][currSquare.column].removeChild(pieceElem);

    // Update virtual board
    this.board.move(Move(Position(currSquare.row, currSquare.column), Position(row, col)));

    // Remove highlights
    this.boardSquares[currSquare.row][currSquare.column].classList.remove(CSS.highlightSquare);
    this.board.getPreviousHighlight().forEach(({ row, column }) => {
      this.boardSquares[row][column].classList.remove(CSS.highlightSquareMove);
      this.boardSquares[row][column].onclick = null;
    });

    // Move piece to clicked square
    const targetSquare = this.boardSquares[row][col];
    if (targetSquare.firstChild) {
      targetSquare.removeChild(targetSquare.firstChild);
    }
    targetSquare.appendChild(pieceElem);
    targetSquare.onclick = () => this._squareOnClickHandler(row, col);
    console.log(this.board.getBoardContent());
  }
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
    clickable: ('clickable' in config) ? config['clickable'] : false
  };
};


// centers the ball at (pageX, pageY) coordinates
const _moveAt = function (pageX, pageY, shiftX, shiftY, piece) {
  piece.style.left = `${pageX - shiftX}px`;
  piece.style.top = `${pageY - shiftY}px`;
};


const _enterSquare = function (elem) {
  if (elem) {
    elem.classList.add(CSS.highlightSquare);
  }
};


const _leaveSquare = function (elem) {
  if (elem) {
    elem.classList.remove(CSS.highlightSquare);
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
