'use strict';

// Other constants
const CSS = {
  board: 'board',
  boardContainer: 'board-container',
  square: 'square',
  clear: 'clear',
  row: 'row',
};
const PIECE_PATH = 'assets/pieces/';

// XiangQi related constants
const NUM_ROWS = 10;
const NUM_COLS = 9;
const PIECES = {
  general: 'General.svg',
  advisor: 'Advisor.svg',
  elephant: 'Elephant.svg',
  cannon: 'Cannon.svg',
  chariot: 'Chariot.svg',
  horse: 'Horse.svg',
  soldier: 'Soldier.svg'
};
const SIDES = {
  red: 'r',
  black: 'b'
};


function XiangQi(containerId, boardSize) {
  this.boardWidth = (boardSize === undefined) ? 400 : boardSize;
  this.squareSize = this.getSquareSize();
  this.boardHeight = (this.boardWidth / 9) * 10;
  this.containerElement = document.querySelector(`#${containerId}`);
  this.board = [[], [], [], [], [], [], [], [], [], []];
}


XiangQi.prototype = {

  draw: function () {
    const boardContainer = createDiv([CSS.boardContainer]);
    const board = createDiv([CSS.board]);
    board.style.width = `${this.boardWidth}px`;
    board.style.height = `${this.boardHeight}px`;

    for (let row = 0; row < NUM_ROWS; row++) {
      const rowDiv = createDiv([CSS.row]);

      for (let col = 0; col < NUM_COLS; col++) {
        const square = createDiv([CSS.square]);
        square.style.width = `${this.squareSize}px`;
        square.style.height = `${this.squareSize}px`;
        rowDiv.appendChild(square);
        this.board[row].push(square);
      }

      const clear = createDiv([CSS.clear]);
      rowDiv.appendChild(clear);
      board.appendChild(rowDiv);
      boardContainer.appendChild(board);
    }

    this.containerElement.appendChild(boardContainer);
  },

  drawPieces: function (row, col, piece, side) {
    const pieceElement = document.createElement('img');
    pieceElement.src = `${PIECE_PATH}${SIDES[side]}${PIECES[piece]}`;
    pieceElement.style.width = `${this.squareSize}px`;
    pieceElement.style.height = `${this.squareSize}px`;
    this.board[row][col].appendChild(pieceElement);
  },

  getSquareSize: function () {
    let boardWidthContainer = this.boardWidth - 1;

    while (boardWidthContainer % NUM_COLS !== 0 && boardWidthContainer > 0) {
      boardWidthContainer = boardWidthContainer - 1;
    }

    return boardWidthContainer / NUM_COLS;
  }
};

const createDiv = (className) => {
  const element = document.createElement('div');
  element.classList.add(...className);
  return element;
};
