'use strict';

const XiangQi = function (containerId) {

  const CSS = {
    board: 'board',
    clearFix: 'clearFix',
    row: 'row',
    square: 'square',
  };

  const _self = {};
  _self.containerId = containerId;
  _self.containerElement = document.querySelector(`#${containerId}`);
  _self.board = [];

  _self.draw = () => {
    const board = createDiv(CSS.board);
    const squareSize = 48;

    for (let i = 0; i < 9; i++) {
      if (i === 4) {

      }
      const row = createDiv(CSS.row);

      for (let j = 0; j < 8; j++) {
        const square = createDiv(CSS.square);
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        row.appendChild(square);
      }

      const clearFix = createDiv(CSS.clearFix);
      row.appendChild(clearFix);

      board.appendChild(row);
    }

    _self.containerElement.appendChild(board);
  };

  return _self;
};


const createDiv = (className) => {
  const element = document.createElement('div');
  element.className = className
  return element
}
