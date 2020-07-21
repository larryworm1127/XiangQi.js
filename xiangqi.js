'use strict';

const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  clearFix: 'clearFix',
  row: 'row',
  square: 'square',
  crossLeft: 'cross-left',
  crossRight: 'cross-right',
  squareTopRow: 'square-top-row',
  squareBotRow: 'square-bottom-row',
  squareLeftCol: 'square-left-col',
  squareRightCol: 'square-right-col',
  squareNoBorder: 'square-no-border',
};

const CROSS_LEFT_RATIO = -1.4375;
const CROSS_TOP_RATIO = 0.583;


class Draw {

  createSquareDom = function (row, col) {
    const square = document.createElement('div');
    square.style.width = `${this.squareSize}px`;
    square.style.height = `${this.squareSize}px`;
    square.classList.add(...getSquareClass(row, col));

    // Draw right cross
    if (col === 3 && (row === 0 || row === 7)) {
      const cross = document.createElement('div');
      cross.style.width = `${this.squareCrossLength}px`;
      cross.style.height = `${this.squareCrossLength}px`;
      cross.style.top = `${this.squareSize * CROSS_TOP_RATIO}px`;
      cross.style.left = `${this.squareSize * CROSS_LEFT_RATIO}px`;
      cross.className = CSS.crossRight;
      square.appendChild(cross);
    }

    // Draw left cross
    if (col === 5 && (row === 0 || row === 7)) {
      const cross = document.createElement('div');
      cross.style.width = `${this.squareCrossLength}px`;
      cross.style.height = `${this.squareCrossLength}px`;
      cross.style.left = `${this.squareSize * CROSS_LEFT_RATIO}px`;
      cross.style.top = `${this.squareSize * CROSS_TOP_RATIO}px`;
      cross.className = CSS.crossLeft;
      square.appendChild(cross);
    }
    return square;
  };
}


class XiangQi extends Draw {

  constructor(containerId, boardSize) {
    super();
    this.boardWidth = (boardSize === undefined) ? 402 : boardSize;
    this.squareSize = (this.boardWidth - 2) / 8 - 2;
    this.boardHeight = (this.squareSize + 2) * 9 + 2;
    this.squareCrossLength = Math.sqrt(Math.pow(this.squareSize, 2) * 2) * 2 + 3;
    this.containerElement = document.querySelector(`#${containerId}`);
    this.board = [[], [], [], [], [], [], [], [], []];
  }

  draw = function () {
    const boardContainer = createDiv([CSS.boardContainer]);
    boardContainer.style.width = `${this.boardWidth}px`;
    boardContainer.style.height = `${this.boardHeight}px`;
    const board = createDiv([CSS.board]);
    board.style.width = this.boardWidth;
    board.style.height = this.boardHeight;

    for (let i = 0; i < 9; i++) {
      const row = createDiv([CSS.row]);

      for (let j = 0; j < 8; j++) {
        const square = this.createSquareDom(i, j);
        row.appendChild(square);
        this.board[i].push(square);
      }

      const clearFix = createDiv([CSS.clearFix]);
      row.appendChild(clearFix);
      board.appendChild(row);
      boardContainer.appendChild(board);
    }

    this.containerElement.appendChild(boardContainer);
  };

  drawPieces = function () {
    this.board.forEach((item) => {
      item.forEach((square) => {
        square.appendChild(createDiv(['piece']));
      });
    });
  };
}

const createDiv = (className) => {
  const element = document.createElement('div');
  element.classList.add(...className);
  return element;
};

const getSquareClass = (row, col) => {
  const classes = [];
  switch (row) {
    case 0:
      classes.push(CSS.squareTopRow);
      break;
    case 4:
      classes.push(CSS.squareNoBorder);
      break;
    case 8:
      classes.push(CSS.squareBotRow);
      break;
    default:
      classes.push(CSS.square);
  }

  switch (col) {
    case 0:
      classes.push(CSS.squareLeftCol);
      break;
    case 7:
      classes.push(CSS.squareRightCol);
  }
  return classes;
};
