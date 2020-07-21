'use strict';

const CSS = {
  board: 'board',
  boardContainer: 'board-container',
};


class XiangQi {

  constructor(containerId, boardSize) {
    this.boardWidth = (boardSize === undefined) ? 400 : boardSize;
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
    board.style.width = `${this.boardWidth}px`;
    board.style.height = `${this.boardHeight}px`;

    for (let i = 0; i < 9; i++) {
      const row = createDiv([]);

      for (let j = 0; j < 8; j++) {
        const square = createDiv([]);
        row.appendChild(square);
        this.board[i].push(square);
      }

      const clearFix = createDiv([]);
      row.appendChild(clearFix);
      board.appendChild(row);
      boardContainer.appendChild(board);
    }

    this.containerElement.appendChild(boardContainer);
  };
}

const createDiv = (className) => {
  const element = document.createElement('div');
  element.classList.add(...className);
  return element;
};
