'use strict';

const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  clearFix: 'clearFix',
  row: 'row',
  square: 'square',
  squareTopRow: 'square-top-row',
  squareBotRow: 'square-bottom-row',
  squareLeftCol: 'square-left-col',
  squareRightCol: 'square-right-col',
  squareNoBorder: 'square-no-border',
  squareWithCrossLeft: 'square-with-cross-left',
  squareWithCrossRight: 'square-with-cross-right'
};


// Main library function
const XiangQi = function (containerId, boardSize) {

  const _self = {};
  _self.boardWidth = (boardSize === undefined) ? 402 : boardSize;
  _self.squareSize = (_self.boardWidth - 2) / 8 - 2;
  _self.boardHeight = (_self.squareSize + 2) * 9 + 2;
  _self.squareCrossLength = Math.sqrt(Math.pow(_self.squareSize, 2) * 2) * 2;
  _self.containerId = containerId;
  _self.containerElement = document.querySelector(`#${containerId}`);
  _self.board = [[], [], [], [], [], [], [], [], []]

  _self.draw = () => {
    const boardContainer = createDiv([CSS.boardContainer]);
    boardContainer.style.width = `${_self.boardWidth}px`;
    boardContainer.style.height = `${_self.boardHeight}px`;
    const board = createDiv([CSS.board]);
    board.style.width = _self.boardWidth;
    board.style.height = _self.boardHeight;

    for (let i = 0; i < 9; i++) {
      const row = createDiv([CSS.row]);

      for (let j = 0; j < 8; j++) {
        const square = createDiv(getSquareClass(i, j));
        square.style.width = `${_self.squareSize}px`;
        square.style.height = `${_self.squareSize}px`;
        row.appendChild(square);
        _self.board[i].push(square);
      }

      const clearFix = createDiv([CSS.clearFix]);
      row.appendChild(clearFix);
      board.appendChild(row);
      boardContainer.appendChild(board);
    }

    _self.containerElement.appendChild(boardContainer);
  };

  _self.drawPieces = () => {
    _self.board.forEach((item) => {
      item.forEach((square) => {
        square.appendChild(createDiv(['piece']))
      })
    })
  }

  return _self;
};


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
    case 3:
      if (row === 0 || row === 7) {
        classes.push(CSS.squareWithCrossRight);
      }
      break;
    case 5:
      if (row === 0 || row === 7) {
        classes.push(CSS.squareWithCrossLeft);
      }
      break;
    case 7:
      classes.push(CSS.squareRightCol);
  }
  return classes;
};
