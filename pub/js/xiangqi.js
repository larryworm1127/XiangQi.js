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
  const ERRORS = {
    invalidBoardHeight: 'Invalid board content height! (10 rows)',
    invalidBoardWidth: 'Invalid board content width! (10 columns)',
    invalidSquareData: 'Invalid board square data! (requires { type: *, side: *})',
    invalidMoveString: 'Invalid move string passed to the function!',
    invalidFormat: 'Invalid config format!',
    invalidConfig: 'Invalid config fields!',
    invalidFen: 'Invalid FEN string!',
    invalidArgType: 'Invalid function argument type!',
    boardSizeTooSmall: 'Board size too small! (min: 200px)',
    invalidPosition: 'Invalid (row, column)! (0 <= row < 10, 0 <= column < 9)'
  };
  const PIECE_PATH = 'assets/pieces/';
  const BOARD_PATH = 'assets/boards/board.svg';

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

    #voidPieces = false;
    #selectedSquare = { row: 0, column: 0 };
    #previousHighlight = [];
    #isHighlighted = false;
    #hasSideBar = false;
    #board;

    constructor(config) {
      if (config.boardContent === 'start') {
        this.setStartPosition(config.redOnBottom);
      } else if (typeof config.boardContent === 'string') {
        this.board = parseFenString(config.boardContent);
      } else if (Array.isArray(config.boardContent) && config.boardContent.length > 0) {
        this.board = config.boardContent;
      } else {
        this.board = new Array(NUM_ROWS).fill(new Array(NUM_COLS).fill(Piece(PIECES.empty)));
      }

      if (config.voidPieces) {
        this.voidPieces = true;
      }
    }

    // ----------------------------------------------------------------------
    // Getters and setters
    // ----------------------------------------------------------------------
    get isHighlighted() {
      return this.#isHighlighted;
    }

    set isHighlighted(value) {
      this.#isHighlighted = value;
    }

    get voidPieces() {
      return this.#voidPieces;
    }

    set voidPieces(value) {
      this.#voidPieces = value;
    }

    get hasSideBar() {
      return this.#hasSideBar;
    }

    set hasSideBar(value) {
      this.#hasSideBar = value;
    }

    set previousHighlight(highlights) {
      if (Array.isArray(highlights)) {
        this.#previousHighlight = [...highlights];
      }
    };

    get previousHighlight() {
      return [...this.#previousHighlight];
    }

    get redOnTop() {
      return this.getPiecePos(new Piece(PIECES.general, SIDES.red)).row in [0, 1, 2];
    }

    set selectedSquare(value) {
      this.#selectedSquare.row = value.row;
      this.#selectedSquare.column = value.col;
    }

    get selectedSquare() {
      return { ...this.#selectedSquare };
    };

    set board(boardContent) {
      this.#board = boardContent.map((row) => {
        return row.slice();
      });
    };

    get boardContent() {
      return JSON.parse(JSON.stringify(this.#board));
    };

    /**
     * Update the virtual XiangQi board based on the move object given.
     *
     * Precondition: the move is valid
     *
     * @param moveObj {{oldPos: *, newPos: *}} A move object that instructs function of what to move.
     * @return {boolean} A flag to indicate whether the move operation was successful.
     */
    move = (moveObj) => {
      const square = this.#board[moveObj.oldPos.row][moveObj.oldPos.column];
      if (square.type === PIECES.empty) {
        return false;
      }

      if (!this.voidPieces && this.#board[moveObj.newPos.row][moveObj.newPos.column].type !== PIECES.empty) {
        return false;
      }

      this.#board[moveObj.oldPos.row][moveObj.oldPos.column] = Piece(PIECES.empty);
      this.#board[moveObj.newPos.row][moveObj.newPos.column] = square;
      return true;
    };

    getSquare = (row, col) => {
      return this.#board[row][col];
    };

    getPiecePos = (piece) => {
      for (let row = 0; row < NUM_ROWS; row++) {
        for (let col = 0; col < NUM_COLS; col++) {
          const square = this.#board[row][col];
          if (square.type === piece.type && square.side === piece.side) {
            return new Position(row, col);
          }
        }
      }
    };

    removePiece = (row, col) => {
      this.#board[row][col] = Piece(PIECES.empty);
    };

    clearBoard = () => {
      this.#board.forEach((row, rowIndex) => {
        row.forEach((_, colIndex) => {
          this.removePiece(rowIndex, colIndex);
        });
      });
    };

    flipBoard = () => {
      const newBoard = [];
      this.#board.forEach((row) => {
        newBoard.unshift([...row]);
      });
      this.board = newBoard;
    };

    setStartPosition = (redOnBottom) => {
      this.board = redOnBottom ? RED_BOT_BOARD_CONTENT : RED_TOP_BOARD_CONTENT;
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

      this.#board.forEach((row) => {
        row.forEach((square) => {
          if (square.type !== PIECES.empty) {
            result[square.side][square.type] += 1;
          }
        });
      });
      return result;
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
            ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
              board.boardContent[move.row][move.column].type === PIECES.empty)
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
            ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
              board.boardContent[move.row][move.column].type === PIECES.empty)
          );
        });
      }

      function getCannonMoves(board) {
        const possibleMoves = [];
        const boardContent = board.boardContent;

        let canJump = false;

        function cannonMovesHelper(position) {
          const square = boardContent[position.row][position.column];
          if (square.type !== PIECES.empty) {
            if (!board.voidPieces) {
              return false;
            }
            if (!canJump) {
              canJump = true;
              return true;
            } else if (square.side !== piece.side && canJump) {
              possibleMoves.push(position);
              return false;
            } else if (square.side === piece.side && canJump) {
              return false;
            }
          }
          if (!canJump) {
            possibleMoves.push(position);
          }
          return true;
        }

        let rowBelow = pos.row + 1;
        while (rowBelow < NUM_ROWS) {
          if (!cannonMovesHelper(Position(rowBelow, pos.column))) {
            break;
          }
          rowBelow += 1;
        }

        let rowAbove = pos.row - 1;
        canJump = false;
        while (rowAbove >= 0) {
          if (!cannonMovesHelper(Position(rowAbove, pos.column))) {
            break;
          }
          rowAbove -= 1;
        }

        let colRight = pos.column + 1;
        canJump = false;
        while (colRight < NUM_COLS) {
          if (!cannonMovesHelper(Position(pos.row, colRight))) {
            break;
          }
          colRight += 1;
        }

        let colLeft = pos.column - 1;
        canJump = false;
        while (colLeft >= 0) {
          if (!cannonMovesHelper(Position(pos.row, colLeft))) {
            break;
          }
          colLeft -= 1;
        }
        return possibleMoves;
      }

      function getChariotMoves(board) {
        const possibleMoves = [];
        const boardContent = board.boardContent;

        function chariotMovesHelper(position) {
          const square = boardContent[position.row][position.column];
          if (square.type !== PIECES.empty) {
            if ((board.voidPieces) ? square.side !== piece.side : square.type === PIECES.empty) {
              possibleMoves.push(position);
            }
            return false;
          }
          possibleMoves.push(position);
          return true;
        }

        let rowBelow = pos.row + 1;
        while (rowBelow < NUM_ROWS) {
          if (!chariotMovesHelper(Position(rowBelow, pos.column))) {
            break;
          }
          rowBelow += 1;
        }

        let rowAbove = pos.row - 1;
        while (rowAbove >= 0) {
          if (!chariotMovesHelper(Position(rowAbove, pos.column))) {
            break;
          }
          rowAbove -= 1;
        }

        let colRight = pos.column + 1;
        while (colRight < NUM_COLS) {
          if (!chariotMovesHelper(Position(pos.row, colRight))) {
            break;
          }
          colRight += 1;
        }

        let colLeft = pos.column - 1;
        while (colLeft >= 0) {
          if (!chariotMovesHelper(Position(pos.row, colLeft))) {
            break;
          }
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
            (board.redOnTop && piece.side === SIDES.red) ||
            (!board.redOnTop && piece.side !== SIDES.red)
          );
          return onTop ? (
            move.column >= 0 &&
            move.column < NUM_COLS &&
            move.row >= 0 &&
            move.row <= 4 &&
            ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
              board.boardContent[move.row][move.column].type === PIECES.empty)
          ) : (
            move.column >= 0 &&
            move.column < NUM_COLS &&
            move.row < NUM_ROWS &&
            move.row > NUM_ROWS - 6 &&
            ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
              board.boardContent[move.row][move.column].type === PIECES.empty)
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
            ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
              board.boardContent[move.row][move.column].type === PIECES.empty)
          );
        });
      }

      function getSoldierMoves(board) {
        const onTop = (
          (board.redOnTop && piece.side === SIDES.red) ||
          (!board.redOnTop && piece.side !== SIDES.red)
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
              ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
                board.boardContent[move.row][move.column].type === PIECES.empty)
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
              ((board.voidPieces) ? board.boardContent[move.row][move.column].side !== piece.side :
                board.boardContent[move.row][move.column].type === PIECES.empty)
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
    if (typeof this.config === 'string') {
      _reportError(this.config, 'console');
      return;
    }

    this.board = new Board(this.config);
    this.containerElement = this.config.container;
    this.boardDiv = null;
    this.sideBarDiv = null;
    this.boardSquares = [[], [], [], [], [], [], [], [], [], []];

    this.boardWidth = this.config.boardSize;
    this.squareSize = _getSquareSize(this.boardWidth);
    this.boardHeight = _getBoardHeight(this.boardWidth);

    // Draw board and its content
    this.drawBoard();
    this.drawBoardContent();

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
      if (typeof newWidth !== 'number') {
        _reportError(ERRORS.invalidArgType, this.config.reportError);
        return;
      }

      if (newWidth <= 200) {
        _reportError(ERRORS.boardSizeTooSmall, this.config.reportError);
        return;
      }

      const ratio = newWidth / 400;
      this.boardWidth = newWidth;
      this.boardHeight = _getBoardHeight(newWidth);
      this.squareSize = _getSquareSize(newWidth);
      _resizeBoardDOM(this);

      if (this.board.hasSideBar) {
        _resizeSideBarDOM(this, ratio);
      }
    },

    /**
     *
     * @param moveInput {string | Object} Standard XiangQi move notation.
     */
    movePiece: function (moveInput) {
      const move = (typeof moveInput === 'string') ? moveStringToObj(moveInput) : moveInput;
      if (typeof move === 'string') {
        _reportError(move, this.config.reportError);
        return;
      }

      if (this.board.move(move)) {
        this.clearBoard(false);
        this.drawBoardContent();

        if (this.board.hasSideBar) {
          _updateSideBarDOM(this);
        }
      }
    },

    drawStartPositions: function () {
      this.board.setStartPosition(this.config.redOnBottom);
      this.drawBoardContent();
    },

    drawBoardContent: function (boardContent = null) {
      const content = (boardContent) ?
        (typeof boardContent === 'string') ? parseFenString(boardContent) : boardContent
        : this.board.boardContent;

      if (typeof validateBoardContent(content) === 'string') {
        _reportError(content, this.config.reportError);
        return;
      }

      content.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
          if (square.type !== PIECES.empty) {
            _drawPieceDOM(this, rowIndex, colIndex, square.type, square.side);
          }
        });
      });
    },

    clearBoard: function (clearVirtual = true) {
      if (typeof clearVirtual !== 'boolean') {
        _reportError(ERRORS.invalidArgType, this.config.reportError);
        return;
      }

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
      if (typeof row !== 'number' || typeof col !== 'number') {
        _reportError(ERRORS.invalidArgType, this.config.reportError);
        return;
      }

      if (typeof piece !== 'string' || typeof side !== 'string') {
        _reportError(ERRORS.invalidArgType, this.config.reportError);
        return;
      }

      if (row >= NUM_ROWS || col >= NUM_COLS) {
        _reportError(ERRORS.invalidPosition, this.config.reportError);
        return;
      }

      _drawPieceDOM(this, row, col, piece, side);
    },

    removePiece: function (row, col) {
      if (typeof row !== 'number' || typeof col !== 'number') {
        _reportError(ERRORS.invalidArgType, this.config.reportError);
        return;
      }

      if (row >= NUM_ROWS || col >= NUM_COLS) {
        _reportError(ERRORS.invalidPosition, this.config.reportError);
        return;
      }

      _removePieceDOM(this, row, col);
      this.board.removePiece(row, col);
    },

    drawSideBar: function () {
      if (!this.board.hasSideBar) {
        _drawSideBarDOM(this);
        this.board.hasSideBar = true;
      } else {
        _updateSideBarDOM(this);
      }
    },

    removeSideBar: function () {
      if (this.board.hasSideBar) {
        _removeSidebarDOM(this);
        this.board.hasSideBar = false;
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
            firstChild.onmousedown = (event) => {
              _mouseDownDragHandler(this, event, firstChild, rowIndex, colIndex);
            };
            firstChild.ondragstart = () => {
              return false;
            };
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
    XiangQi.boardDiv.style.background = `url(${BOARD_PATH})`;

    // Add square div
    XiangQi.board.boardContent.forEach((row, rowIndex) => {
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


  function _drawSideBarDOM(XiangQi) {
    // Create sidebar container
    XiangQi.sideBarDiv = document.createElement('div');
    XiangQi.sideBarDiv.className = CSS.sideBar;

    const sideBarTitle = document.createElement('p');
    sideBarTitle.textContent = 'Piece Counts';
    sideBarTitle.className = CSS.sideBarTitle;
    XiangQi.sideBarDiv.appendChild(sideBarTitle);

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

      XiangQi.sideBarDiv.appendChild(sideDiv);
    });

    // Add sidebar div to main container
    XiangQi.containerElement.appendChild(XiangQi.sideBarDiv);
  }


  function _resizeSideBarDOM(XiangQi, ratio) {
    const title = XiangQi.sideBarDiv.children.item(0);
    title.style.fontSize = `${100 * ratio}%`;

    const redSide = XiangQi.sideBarDiv.children.item(1);
    const blackSide = XiangQi.sideBarDiv.children.item(2);

    for (let index = 0; index < redSide.children.length; index++) {
      const redPieceDiv = redSide.children.item(index);
      redPieceDiv.firstChild.style.width = `${XiangQi.squareSize}px`;
      redPieceDiv.firstChild.style.height = `${XiangQi.squareSize}px`;
      redPieceDiv.children.item(1).style.fontSize = `${100 * ratio}%`;

      const blackPieceDiv = blackSide.children.item(index);
      blackPieceDiv.firstChild.style.width = `${XiangQi.squareSize}px`;
      blackPieceDiv.firstChild.style.height = `${XiangQi.squareSize}px`;
      blackPieceDiv.children.item(1).style.fontSize = `${100 * ratio}%`;
    }
  }


  function _updateSideBarDOM(XiangQi) {
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


  function _removeSidebarDOM(XiangQi) {
    XiangQi.containerElement.removeChild(XiangQi.sideBarDiv);
  }

  // ----------------------------------------------------------------------
  // Event handlers (private)
  // ----------------------------------------------------------------------
  function _mouseDownDragHandler(XiangQi, event, piece, rowIndex, colIndex) {
    let lastSquare = XiangQi.boardSquares[rowIndex][colIndex];
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
      if (squareBelow && !squareBelow.firstChild && currentSquare !== squareBelow) {
        // Update virtual board
        const posStr = squareBelow.id.split('-');
        const newMove = Position(parseInt(posStr[0]), parseInt(posStr[1]));
        XiangQi.board.move(Move(lastPosition, newMove));
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
      _mouseUpDragHandler(piece, _mouseMoveDragHandler, currentSquare, lastSquare);
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
    const previousSquare = XiangQi.board.selectedSquare;
    XiangQi.boardSquares[previousSquare.row][previousSquare.column].classList.remove(CSS.highlightSquare);
    XiangQi.board.previousHighlight.forEach(({ row, column }) => {
      const square = XiangQi.boardSquares[row][column];
      if (!square.firstChild) {
        square.onclick = null;
      }
      square.classList.remove(CSS.highlightSquareMove);
    });
    XiangQi.makeClickable();

    // Update highlight state tracker
    const isHighlighted = XiangQi.board.isHighlighted;
    const isSamePieceClicked = previousSquare.row === row && previousSquare.column === col;
    if (isHighlighted || isSamePieceClicked) {
      XiangQi.board.isHighlighted = false;
    }

    // Add new highlights
    if (!isHighlighted || !isSamePieceClicked) {
      XiangQi.board.isHighlighted = true;

      // Add highlight to selected square
      XiangQi.boardSquares[row][col].classList.add(CSS.highlightSquare);

      // Show possible moves
      const moves = XiangQi.board.getValidMoves(row, col);
      XiangQi.board.previousHighlight = moves;
      XiangQi.board.selectedSquare = { row, col };
      moves.forEach(({ row, column }) => {
        XiangQi.boardSquares[row][column].classList.add(CSS.highlightSquareMove);
        XiangQi.boardSquares[row][column].onclick = () => {
          _squareOnClickMoveHandler(XiangQi, row, column);
        };
      });
    }
  }


  function _squareOnClickMoveHandler(XiangQi, row, col) {
    // Remove piece from old square
    const currSquare = XiangQi.board.selectedSquare;
    const pieceElem = XiangQi.boardSquares[currSquare.row][currSquare.column].firstChild;
    XiangQi.boardSquares[currSquare.row][currSquare.column].removeChild(pieceElem);

    // Update virtual board
    XiangQi.board.move(Move(Position(currSquare.row, currSquare.column), Position(row, col)));
    XiangQi.board.isHighlighted = false;

    // Remove highlights
    XiangQi.boardSquares[currSquare.row][currSquare.column].classList.remove(CSS.highlightSquare);
    XiangQi.board.previousHighlight.forEach(({ row, column }) => {
      XiangQi.boardSquares[row][column].classList.remove(CSS.highlightSquareMove);
      XiangQi.boardSquares[row][column].onclick = null;
    });

    // Move piece to clicked square
    const targetSquare = XiangQi.boardSquares[row][col];
    if (targetSquare.firstChild) {
      targetSquare.removeChild(targetSquare.firstChild);
    }
    targetSquare.appendChild(pieceElem);
    targetSquare.onclick = () => {
      _squareOnClickHandler(XiangQi, row, col);
    };

    // Update sidebar if there is one
    if (XiangQi.board.hasSideBar) {
      _updateSideBarDOM(XiangQi);
    }
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

  // ----------------------------------------------------------------------
  // Utility functions (private)
  // ----------------------------------------------------------------------
  /**
   * Validates config value and build new config object.
   *
   * @param config {Object | undefined} input initial config.
   * @return {Object | string} parsed config object or the error if invalid input config
   * @private
   */
  function _buildConfig(config) {
    if (config === undefined || config === null) {
      return {
        boardSize: 400,
        container: document.body,
        boardContent: Array(10).fill(Array(9).fill(Piece(PIECES.empty))),
        showSideBar: false,
        draggable: false,
        redOnBottom: false,
        clickable: false,
        voidPieces: false,
        reportError: false
      };
    } else if (typeof config !== 'object') {
      return ERRORS.invalidFormat;
    }

    // Validate config values
    return (
      ('boardSize' in config && typeof config['boardSize'] !== 'number' && config['boardSize'] < 200) ||
      ('containerId' in config && document.getElementById(config['containerId']) === null) ||
      ('boardContent' in config && (
        config['boardContent'] !== 'start' &&
        validateBoardContent(config['boardContent']) !== true &&
        (typeof config['boardContent'] !== 'string' ||
          !Array.isArray(parseFenString(config['boardContent'])))
      )) ||
      ('showSideBar' in config && typeof config['showSideBar'] !== 'boolean') ||
      ('draggable' in config && typeof config['draggable'] !== 'boolean') ||
      ('redOnBottom' in config && typeof config['redOnBottom'] !== 'boolean') ||
      ('clickable' in config && typeof config['clickable'] !== 'boolean') ||
      ('voidPieces' in config && typeof config['voidPieces'] !== 'boolean') ||
      ('reportError' in config && (
        config['reportError'] !== false &&
        config['reportError'] !== 'console' &&
        config['reportError'] !== 'alert'
      ))
    )
      ? ERRORS.invalidConfig
      : {
        boardSize: ('boardSize' in config) ? config['boardSize'] : 400,
        container: ('containerId' in config) ? document.getElementById(config['containerId']) : document.body,
        boardContent: ('boardContent' in config) ? config['boardContent'] :
          Array(10).fill(Array(9).fill(Piece(PIECES.empty))),
        showSideBar: ('showSideBar' in config) ? config['showSideBar'] : false,
        draggable: ('draggable' in config) ? config['draggable'] : false,
        redOnBottom: ('redOnBottom' in config) ? config['redOnBottom'] : false,
        clickable: ('clickable' in config) ? config['clickable'] : false,
        voidPieces: ('voidPieces' in config) ? config['voidPieces'] : false,
        reportError: ('reportError' in config) ? config['reportError'] : false
      };
  }


  function _getBoardHeight(boardWidth) {
    return (boardWidth / NUM_COLS) * NUM_ROWS;
  }


  function _getSquareSize(boardWidth) {
    return (boardWidth - 2) / NUM_COLS;
  }

  function _reportError(message, reportErrorConfig) {
    switch (reportErrorConfig) {
      case 'console':
        console.log(message);
        break;
      case 'alert':
        global.alert(message);
        break;
      default:
        return;
    }
  }


  // ----------------------------------------------------------------------
  // Utility functions (public)
  // ----------------------------------------------------------------------
  /**
   * Validate whether the given boardContent is valid or not.
   *
   * @param boardContent {Array[][]} the board content to be validated.
   * @return {boolean | string} true for valid and false for invalid board content.
   */
  function validateBoardContent(boardContent) {
    if (boardContent.length !== 10) {
      return ERRORS.invalidBoardHeight;
    }

    for (const row in boardContent) {
      if (boardContent[row].length !== 9) {
        return ERRORS.invalidBoardWidth;
      }
      for (const col in boardContent[row]) {
        const square = boardContent[row][col];
        if (
          (Object.values(PIECES).filter(item => item === square.type).length === 0) ||
          (square.type !== PIECES.empty && (square.side !== SIDES.red && square.side !== SIDES.black))
        ) {
          return ERRORS.invalidSquareData;
        }
      }
    }
    return true;
  }


  /**
   * Parses a XiangQi move string into a computer readable Move object.
   *
   * @param moveString {string} A move string in form of `[former rank][former file]-[new rank][new file]`
   * @return {{oldPos: *, newPos: *} | string} The corresponding Move object.
   */
  function moveStringToObj(moveString) {
    // Validate moveString
    if (moveString.length !== 5) {
      return ERRORS.invalidMoveString;
    }

    const split = moveString.split('-');
    const oldPos = split[0].split('');
    const newPos = split[1].split('');
    if (isNaN(parseInt(split[0])) || isNaN(parseInt(split[1]))) {
      return ERRORS.invalidMoveString;
    }

    // Build move object
    return Move(
      Position(parseInt(oldPos[0]) - 1, parseInt(oldPos[1]) - 1),
      Position(parseInt(newPos[0]) - 1, parseInt(newPos[1]) - 1)
    );
  }


  /**
   * Parses a FEN string for a board state into a computer readable 2D-array of Piece objects.
   *
   * @param fenString {String} the input FEN string.
   * @returns {Array[][] | String} the parsed board content as a 2D-array of Piece objects.
   */
  function parseFenString(fenString) {
    const split = fenString.split('/');
    if (split.length !== 10) {
      return ERRORS.invalidFen;
    }

    const result = split.map((row) => {
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

    if (validateBoardContent(result) !== true) {
      return ERRORS.invalidFen;
    }
    return result;
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
  global.validateBoardContent = global.validateBoardContent || validateBoardContent;
  global.Piece = global.Piece || Piece;
  global.Move = global.Move || Move;
  global.Position = global.Position || Position;

})(window);

