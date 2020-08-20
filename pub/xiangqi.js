'use strict';


(function (global) {

  // ----------------------------------------------------------------------
  // Constants functions
  // ----------------------------------------------------------------------
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
  const ABBREVIATION = {
    A: PIECES.advisor,
    C: PIECES.cannon,
    R: PIECES.chariot,
    E: PIECES.elephant,
    G: PIECES.general,
    H: PIECES.horse,
    S: PIECES.soldier
  };
  const SIDES = {
    red: 'r',
    black: 'b'
  };

  // XiangQi related constants
  const NUM_ROWS = 10;
  const NUM_COLS = 9;
  const RED_TOP_START_FEN = 'RHEAGAEHR/9/1C5C1/S1S1S1S1S/9/9/s1s1s1s1s/1c5c1/9/rheagaehr';
  const RED_BOT_START_FEN = 'rheagaehr/9/1c5c1/s1s1s1s1s/9/9/S1S1S1S1S/1C5C1/9/RHEAGAEHR';
  const RED_TOP_BOARD_CONTENT = parseFenString(RED_TOP_START_FEN);
  const RED_BOT_BOARD_CONTENT = parseFenString(RED_BOT_START_FEN);

  // ----------------------------------------------------------------------
  // Objects functions
  // ----------------------------------------------------------------------
  function Piece(type, side) {
    return { type, side };
  }

  function Position(row, column) {
    return { row, column };
  }

  function Move(oldPos, newPos) {
    return { oldPos, newPos };
  }

  // ----------------------------------------------------------------------
  // A virtual XiangQi board
  // ----------------------------------------------------------------------
  class Board {

    constructor(config) {
      if (config.boardContent === 'start') {
        this.setStartPosition(config.redOnBottom);
      } else if (typeof config.boardContent === 'string') {
        const parsedFen = parseFenString(config.boardContent);
        this.setBoardContent(parsedFen);
      } else if (Array.isArray(config.boardContent) && config.boardContent.length > 0) {
        this.setBoardContent(config.boardContent);
      } else {
        this.board = new Array(NUM_ROWS).fill(new Array(NUM_COLS).fill(Piece(PIECES.empty)));
      }

      this.voidPieces = config.clickable === 'void';
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

      if (!this.voidPieces && this.board[moveObj.newPos.row][moveObj.newPos.column].type !== PIECES.empty) {
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

    flipBoard = () => {
      const newBoard = [];
      this.board.forEach((row) => {
        newBoard.unshift([...row]);
      });
      this.setBoardContent(newBoard);
    };

    setStartPosition = (redOnBottom) => {
      this.setBoardContent(redOnBottom ? RED_BOT_BOARD_CONTENT : RED_TOP_BOARD_CONTENT);
    };

    setBoardContent = (boardContent) => {
      this.board = boardContent.map((row) => {
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
            ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
              board.getBoardContent()[move.row][move.column].type === PIECES.empty)
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
            ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
              board.getBoardContent()[move.row][move.column].type === PIECES.empty)
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
            if (!board.voidPieces) {
              break;
            }
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
            if (!board.voidPieces) {
              break;
            }
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
            if (!board.voidPieces) {
              break;
            }
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
            if (!board.voidPieces) {
              break;
            }
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
            if ((board.voidPieces) ?
              boardContent[rowBelow][pos.column].side !== piece.side :
              boardContent[rowBelow][pos.column].type === PIECES.empty
            ) {
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
            if ((board.voidPieces) ?
              boardContent[rowAbove][pos.column].side !== piece.side :
              boardContent[rowAbove][pos.column].type === PIECES.empty
            ) {
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
            if ((board.voidPieces) ?
              boardContent[pos.row][colRight].side !== piece.side :
              boardContent[pos.row][colRight].type === PIECES.empty
            ) {
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
            if ((board.voidPieces) ?
              boardContent[pos.row][colLeft].side !== piece.side :
              boardContent[pos.row][colLeft].type === PIECES.empty
            ) {
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
            ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
              board.getBoardContent()[move.row][move.column].type === PIECES.empty)
          ) : (
            move.column >= 0 &&
            move.column < NUM_COLS &&
            move.row < NUM_ROWS &&
            move.row > NUM_ROWS - 6 &&
            ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
              board.getBoardContent()[move.row][move.column].type === PIECES.empty)
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
            ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
              board.getBoardContent()[move.row][move.column].type === PIECES.empty)
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
              ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
                board.getBoardContent()[move.row][move.column].type === PIECES.empty)
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
              ((board.voidPieces) ? board.getBoardContent()[move.row][move.column].side !== piece.side :
                board.getBoardContent()[move.row][move.column].type === PIECES.empty)
            );
          });
        }
      }
    };
  }

  // ----------------------------------------------------------------------
  // Main library function
  // ----------------------------------------------------------------------
  function XiangQi(initialConfig) {
    this.config = _buildConfig(initialConfig);
    this.boardWidth = this.config.boardSize;
    this.containerElement = this.config.container;
    this.boardDiv = null;

    this.squareSize = _getSquareSize(this.boardWidth);
    this.boardHeight = _getBoardHeight(this.boardWidth);
    this.boardSquares = [[], [], [], [], [], [], [], [], [], []];
    this.board = new Board(this.config);
    this.hasSideBar = false;

    // Draw board and its content if delayDraw is disabled in config
    if (!this.config.delayDraw) {
      this.drawBoard();
      this.drawBoardContent();
    }

    // Draw side bar if enabled in config
    if (this.config.showSideBar) {
      this.drawSideBar();
    }

    if (this.config.draggable) {
      this.makeDraggable();
    } else if (this.config.clickable) {
      this.makeClickable();
    }
  }

  XiangQi.prototype = {
    // ----------------------------------------------------------------------
    // Main features functions (public)
    // ----------------------------------------------------------------------
    drawBoard: function () {
      _drawBoardDOM(this);
    },

    removeBoard: function () {
      _removeBoardDOM(this);
    },

    flipBoard: function () {
      this.board.flipBoard();
      this.clearBoard(false);
      this.drawBoardContent();
    },

    /**
     *
     * @param newWidth {number} The new width for the board
     */
    resizeBoard: function (newWidth) {
      this.boardWidth = newWidth;
      this.boardHeight = _getBoardHeight(newWidth);
      this.squareSize = _getSquareSize(newWidth);
      _resizeBoardDOM(this);
    },

    /**
     *
     * @param moveString {string} Standard XiangQi move notation.
     */
    movePiece: function (moveString) {
      const move = moveStringToObj(moveString);
      if (this.board.move(move)) {
        this.clearBoard(false);
        this.drawBoardContent();

        if (this.hasSideBar) {
          _updateSideBar(this);
        }
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
            _drawPieceDOM(this, rowIndex, colIndex, square.type, square.side);
          }
        });
      });
    },

    clearBoard: function (clearVirtual = true) {
      this.boardSquares.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          _removePieceDOM(this, rowIndex, colIndex);
        });
      });

      // Clear virtual board content
      if (clearVirtual) {
        this.board.clearBoard();
      }
    },

    drawPiece: function (row, col, piece, side) {
      _drawPieceDOM(this, row, col, piece, side);
    },

    removePiece: function (row, col) {
      _removePieceDOM(this, row, col);
      this.board.removePiece(row, col);
    },

    drawSideBar: function () {
      if (!this.hasSideBar) {
        _drawSideBar(this);
        this.hasSideBar = true;
      } else {
        _updateSideBar(this);
      }
    },

    enableVoidPieces: function () {
      this.board.voidPieces = true;
    },

    disableVoidPieces: function () {
      this.board.voidPieces = false;
    },

    makeDraggable: function () {
      this.removeClickable();

      // Add drag handlers for each square
      this.boardSquares.forEach((row, rowIndex) => {
        row.forEach(({ firstChild }, colIndex) => {
          if (firstChild) {
            firstChild.onmousedown = (event) => _mouseDownDragHandler(this, event, firstChild, rowIndex, colIndex);
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
              _squareOnClickHandler(this, rowIndex, colIndex);
            };
          }
        });
      });
    },

    removeClickable: function () {
      this.boardSquares.forEach((row) => {
        row.forEach((square) => {
          if (square.firstChild) {
            square.onclick = null;
          }
        });
      });
    },
  };

  // ----------------------------------------------------------------------
  // DOM manipulation functions (private)
  // ----------------------------------------------------------------------
  function _drawBoardDOM(XiangQi) {
    XiangQi.boardDiv = document.createElement('div');
    XiangQi.boardDiv.className = CSS.board;
    XiangQi.boardDiv.style.width = `${XiangQi.boardWidth}px`;
    XiangQi.boardDiv.style.height = `${XiangQi.boardHeight}px`;

    // Add square div
    XiangQi.board.getBoardContent().forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = CSS.row;

      row.forEach((_, colIndex) => {
        const square = document.createElement('div');
        square.className = CSS.square;
        square.id = `${rowIndex}-${colIndex}`;
        square.style.width = `${XiangQi.squareSize}px`;
        square.style.height = `${XiangQi.squareSize}px`;
        rowDiv.appendChild(square);
        XiangQi.boardSquares[rowIndex].push(square);
      });

      const clear = document.createElement('div');
      clear.className = CSS.clear;
      rowDiv.appendChild(clear);
      XiangQi.boardDiv.appendChild(rowDiv);
    });

    XiangQi.containerElement.appendChild(XiangQi.boardDiv);
  }

  function _resizeBoardDOM(XiangQi) {
    XiangQi.boardDiv.style.width = `${XiangQi.boardWidth}px`;
    XiangQi.boardDiv.style.height = `${XiangQi.boardHeight}px`;

    XiangQi.boardSquares.forEach((row) => {
      row.forEach((square) => {
        if (square.firstChild) {
          square.firstChild.style.width = `${XiangQi.squareSize}px`;
          square.firstChild.style.height = `${XiangQi.squareSize}px`;
        }
        square.style.width = `${XiangQi.squareSize}px`;
        square.style.height = `${XiangQi.squareSize}px`;
      });
    });
  }

  function _drawPieceDOM(XiangQi, row, col, piece, side) {
    if (!XiangQi.boardSquares[row][col].firstChild) {
      const pieceElement = document.createElement('img');
      pieceElement.src = `${PIECE_PATH}${side}${piece}.svg`;
      pieceElement.style.width = `${XiangQi.squareSize}px`;
      pieceElement.style.height = `${XiangQi.squareSize}px`;

      XiangQi.boardSquares[row][col].appendChild(pieceElement);
    }
  }

  function _drawSideBar(XiangQi) {
    // Create sidebar container
    const sideBar = document.createElement('div');
    sideBar.className = CSS.sideBar;

    const sideBarTitle = document.createElement('p');
    sideBarTitle.textContent = 'Piece Counts';
    sideBarTitle.className = CSS.sideBarTitle;
    sideBar.appendChild(sideBarTitle);

    // Get and display piece counts
    const pieceCount = XiangQi.board.getPieceCounts();
    Object.entries(pieceCount).forEach(([side, pieceTypes]) => {
      const sideDiv = document.createElement('div');
      sideDiv.className = CSS.sideBarSide;

      Object.entries(pieceTypes).forEach(([pieceType, count]) => {
        const pieceDiv = document.createElement('div');

        const pieceElement = document.createElement('img');
        pieceElement.src = `${PIECE_PATH}${side}${pieceType}.svg`;
        pieceElement.style.width = `${XiangQi.squareSize}px`;
        pieceElement.style.height = `${XiangQi.squareSize}px`;
        pieceDiv.appendChild(pieceElement);

        const countElement = document.createElement('span');
        countElement.textContent = `${count}`;
        pieceDiv.appendChild(countElement);

        sideDiv.appendChild(pieceDiv);
      });

      sideBar.appendChild(sideDiv);
    });

    // Add sidebar div to main container
    XiangQi.containerElement.appendChild(sideBar);
  }

  function _updateSideBar(XiangQi) {
    const pieceCount = XiangQi.board.getPieceCounts();

    const sideDivs = document.getElementsByClassName(CSS.sideBarSide);
    Object.values(pieceCount).forEach((pieceTypes, index) => {
      const sideDiv = sideDivs.item(index).children;

      Object.values(pieceTypes).forEach((count, index) => {
        const pieceDiv = sideDiv.item(index).children.item(1);
        pieceDiv.textContent = `${count}`;
      });
    });
  }

  function _removePieceDOM(XiangQi, row, col) {
    const square = XiangQi.boardSquares[row][col];
    while (square.firstChild) {
      square.removeChild(square.lastChild);
    }
  }

  function _removeBoardDOM(XiangQi) {
    XiangQi.containerElement.removeChild(XiangQi.boardDiv);
  }

  // ----------------------------------------------------------------------
  // Event handlers (private)
  // ----------------------------------------------------------------------
  function _mouseDownDragHandler(XiangQi, event, piece, rowIndex, colIndex) {
    let lastSquare = null;
    let currentSquare = null;
    const lastPosition = new Position(rowIndex, colIndex);

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
        XiangQi.board.move(new Move(lastPosition, newMove));
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
      _mouseUpDragHandler(
        XiangQi,
        piece,
        _mouseMoveDragHandler,
        currentSquare,
        lastSquare,
      );
    };
  }

  function _mouseUpDragHandler(piece, _mouseMoveDragHandler, currentSquare, lastSquare) {
    // Clear mousemove handlers
    document.removeEventListener('mousemove', _mouseMoveDragHandler);
    piece.onmouseup = null;

    // Clear square highlight
    _leaveSquare(currentSquare);
    if (currentSquare && !currentSquare.firstChild) {
      currentSquare.appendChild(piece);
    } else {
      lastSquare.appendChild(piece);
    }
    piece.style.position = 'static';
    piece.style.zIndex = '0';
  }

  function _squareOnClickHandler(XiangQi, row, col) {
    // Remove previous highlight
    const previousSquare = XiangQi.board.getSelectedSquare();
    XiangQi.boardSquares[previousSquare.row][previousSquare.column].classList.remove(CSS.highlightSquare);
    XiangQi.board.getPreviousHighlight().forEach(({ row, column }) => {
      const square = XiangQi.boardSquares[row][column];
      if (!square.firstChild) {
        square.onclick = null;
      }
      square.classList.remove(CSS.highlightSquareMove);
    });

    // Add highlight to selected square
    XiangQi.boardSquares[row][col].classList.add(CSS.highlightSquare);

    // Show possible moves
    const moves = XiangQi.board.getValidMoves(row, col);
    XiangQi.board.setPreviousHighlight(moves);
    XiangQi.board.updateSelectedSquare(row, col);
    moves.forEach(({ row, column }) => {
      XiangQi.boardSquares[row][column].classList.add(CSS.highlightSquareMove);
      XiangQi.boardSquares[row][column].onclick = () => {
        _squareOnClickMoveHandler(XiangQi, row, column);
      };
    });
  }

  function _squareOnClickMoveHandler(XiangQi, row, col) {
    // Remove piece from old square
    const currSquare = XiangQi.board.getSelectedSquare();
    const pieceElem = XiangQi.boardSquares[currSquare.row][currSquare.column].firstChild;
    XiangQi.boardSquares[currSquare.row][currSquare.column].removeChild(pieceElem);

    // Update virtual board
    XiangQi.board.move(Move(Position(currSquare.row, currSquare.column), Position(row, col)));

    // Remove highlights
    XiangQi.boardSquares[currSquare.row][currSquare.column].classList.remove(CSS.highlightSquare);
    XiangQi.board.getPreviousHighlight().forEach(({ row, column }) => {
      XiangQi.boardSquares[row][column].classList.remove(CSS.highlightSquareMove);
      XiangQi.boardSquares[row][column].onclick = null;
    });

    // Move piece to clicked square
    const targetSquare = XiangQi.boardSquares[row][col];
    if (targetSquare.firstChild) {
      targetSquare.removeChild(targetSquare.firstChild);
    }
    targetSquare.appendChild(pieceElem);
    targetSquare.onclick = () => _squareOnClickHandler(XiangQi, row, col);

    // Update sidebar if there is one
    if (XiangQi.hasSideBar) {
      _updateSideBar(XiangQi);
    }
  }

  // ----------------------------------------------------------------------
  // Utility functions (private)
  // ----------------------------------------------------------------------
  function _buildConfig(inputConfig) {
    const config = (inputConfig === undefined) ? {} : inputConfig;
    return {
      boardSize: ('boardSize' in config) ? config['boardSize'] : 400,
      container: ('containerId' in config) ? document.getElementById(config['containerId']) : document.body,
      boardContent: ('boardContent' in config) ? config['boardContent'] : [],
      showSideBar: ('showSideBar' in config) ? config['showSideBar'] : false,
      draggable: ('draggable' in config) ? config['draggable'] : false,
      delayDraw: ('delayDraw' in config) ? config['delayDraw'] : false,
      redOnBottom: ('redOnBottom' in config) ? config['redOnBottom'] : false,
      clickable: ('clickable' in config) ? config['clickable'] : 'no-void',
    };
  }


  function _getBoardHeight(boardWidth) {
    return (boardWidth / NUM_COLS) * NUM_ROWS;
  }


  function _getSquareSize(boardWidth) {
    return (boardWidth - 2) / NUM_COLS;
  }


  // centers the ball at (pageX, pageY) coordinates
  function _moveAt(pageX, pageY, shiftX, shiftY, piece) {
    piece.style.left = `${pageX - shiftX}px`;
    piece.style.top = `${pageY - shiftY}px`;
  }


  function _enterSquare(elem) {
    if (elem) {
      elem.classList.add(CSS.highlightSquare);
    }
  }


  function _leaveSquare(elem) {
    if (elem) {
      elem.classList.remove(CSS.highlightSquare);
    }
  }


  /**
   * Parses a XiangQi move string into a computer readable Move object.
   *
   * @param moveString {string} A move string in form of `[former rank][former file]-[new rank][new file]`
   * @return {{oldPos: *, newPos: *}} The corresponding Move object.
   */
  function moveStringToObj(moveString) {
    const split = moveString.split('-');
    const formerPos = split[0].split('');
    const newPos = split[1].split('');
    return Move(
      Position(parseInt(formerPos[0]) - 1, parseInt(formerPos[1]) - 1),
      Position(parseInt(newPos[0]) - 1, parseInt(newPos[1]) - 1)
    );
  }


  /**
   * Parses a FEN string for a board state into a computer readable 2D-array of Piece objects.
   *
   * @param fenString {String} the input FEN string.
   * @returns {Array[][]} the parsed board content as a 2D-array of Piece objects.
   */
  function parseFenString(fenString) {
    const split = fenString.split('/');

    return split.map((row) => {
      const rowSplit = row.split('');
      return rowSplit.flatMap((char) => {
        if (!isNaN(parseInt(char))) {
          return new Array(parseInt(char)).fill(Piece(PIECES.empty));
        }

        if (char === char.toUpperCase()) {
          return Piece(ABBREVIATION[char], SIDES.red);
        }
        return Piece(ABBREVIATION[char.toUpperCase()], SIDES.black);
      });
    });
  }


  /**
   * Takes an 2D-array of Piece objects and return its corresponding FEN string.
   *
   * @param boardContent {Array[][]} the board content to be converted.
   * @return {string} the corresponding FEN string for input <boardContent>.
   */
  function getFenString(boardContent) {
    let result = '';

    boardContent.forEach((row) => {
      let numEmpty = 0;
      row.forEach(({ type, side }) => {
        if (type === PIECES.empty) {
          numEmpty += 1;
        } else {
          if (numEmpty !== 0) {
            result += numEmpty;
            numEmpty = 0;
          }
          const piece = Object.keys(ABBREVIATION).find(key => ABBREVIATION[key] === type);
          result += (side === SIDES.red) ? piece.toUpperCase() : piece.toLowerCase();
        }
      });

      if (numEmpty !== 0) {
        result += numEmpty;
        numEmpty = 0;
      }
      result += '/';
    });
    return result;
  }

  global.XiangQi = global.XiangQi || XiangQi;
  global.parseFenString = global.parseFenString || parseFenString;
  global.getFenString = global.getFenString || getFenString;

})(window);

