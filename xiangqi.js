'use strict';

const CSS = {
  board: 'board',
  clearFix: 'clearFix',
  row: 'row',
  square: 'square',
  squareTopRow: 'square-top-row',
  squareBotRow: 'square-bottom-row',
  squareLeftCol: 'square-left-col',
  squareRightCol: 'square-right-col',
  squareNoBorder: 'square-no-border'
};


// Main library function
const XiangQi = function (containerId) {

  const _self = {};
  _self.containerId = containerId;
  _self.containerElement = document.querySelector(`#${containerId}`);
  _self.board = [];

  _self.draw = () => {
    const board = createDiv([CSS.board]);
    const squareSize = 48;

    for (let i = 0; i < 9; i++) {
      const row = createDiv([CSS.row]);

      for (let j = 0; j < 8; j++) {
        const square = createDiv(getSquareClass(i, j));
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        row.appendChild(square);
      }

      const clearFix = createDiv([CSS.clearFix]);
      row.appendChild(clearFix);
      board.appendChild(row);
    }

    _self.containerElement.appendChild(board);
  };

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
    case 7:
      classes.push(CSS.squareRightCol);
  }
  return classes
};
