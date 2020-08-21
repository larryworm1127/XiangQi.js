'use strict';

// Website control
const $ = window.jQuery;

function clickGroupHeader() {
  const groupIdx = $(this).attr('id').replace('groupHeader-', '');
  const $examplesList = $('#groupContainer-' + groupIdx);
  if ($examplesList.css('display') === 'none') {
    $examplesList.slideDown('fast');
  } else {
    $examplesList.slideUp('fast');
  }
}

function init() {
  const $examplesNav = $('#examplesNav');
  $examplesNav.on('click', 'h4', clickGroupHeader);
}


// Board demo functions
const emptyBoard = function () {
  const board = new XiangQi({ containerId: 'emptyBoard' });
};

const fullBoardStart = function () {
  const board = new XiangQi({ containerId: 'fullBoardStart', boardContent: 'start' });
};

const midGameBoard = function () {
  const midGameFen = '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9';
  const board = new XiangQi({ containerId: 'midGameBoard', boardContent: midGameFen });
};

const multiBoard = function () {
  const board1 = new XiangQi({
    boardSize: '350',
    containerId: 'board1',
    boardContent: 'start'
  });
  const board2 = new XiangQi({
    boardSize: '350',
    containerId: 'board2',
    boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9'
  });
};

const showSideBarBoard = function () {
  const board = new XiangQi({
    containerId: 'showSideBar',
    boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9',
    showSideBar: true
  });
};

const draggableBoard = function () {
  const board = new XiangQi({
    containerId: 'draggable',
    boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9',
    draggable: true
  });
};

const clickableBoard = function () {
  const board = new XiangQi({
    containerId: 'clickable',
    boardContent: 'start',
    clickable: true
  });
};

const clickableVoidBoard = function () {
  const board = new XiangQi({
    containerId: 'voidPieces',
    boardContent: 'start',
    clickable: true,
    voidPieces: true
  });
};

const flipBoard = function () {
  const board = new XiangQi({
    containerId: 'flipBoard',
    boardContent: 'start',
  });
  document.getElementById('flip').addEventListener('click', () => board.flipBoard());
};

const pieceMoveBoard = function () {
  const board = new XiangQi({
    containerId: 'movePieceBoard',
    boardContent: 'start'
  });
  const generator = getMove();

  document.getElementById('move').onclick = function () {
    const nextMove = generator.next();
    if (!nextMove.done) {
      board.movePiece(nextMove.value);
    } else {
      document.getElementById('move').setAttribute('disabled', 'true');
    }
  };

  function* getMove() {
    const moves = [
      Move(Position(2, 1), Position(2, 4)),
      Move(Position(7, 1), Position(7, 4)),
      Move(Position(0, 1), Position(2, 2)),
      Move(Position(9, 1), Position(7, 2)),
      Move(Position(0, 0), Position(1, 0)),
      Move(Position(9, 0), Position(9, 1)),
      Move(Position(1, 0), Position(1, 5)),
      Move(Position(9, 1), Position(5, 1))
    ];
    let index = 0;
    while (index < moves.length) {
      yield moves[index];
      index++;
    }
  }
};

const addRemovePieceBoard = function () {
  const board = new XiangQi({ containerId: 'addRemoveControlBoard', boardContent: 'start', reportError: 'console' });

  const pieceType = document.getElementById('type');
  const side = document.getElementById('side');
  const addRow = document.getElementById('addRow');
  const addCol = document.getElementById('addCol');
  const addButton = document.getElementById('addPiece');

  const removeRow = document.getElementById('removeRow');
  const removeCol = document.getElementById('removeCol');
  const removeButton = document.getElementById('removePiece');

  addButton.onclick = (e) => {
    e.preventDefault();
    board.drawPiece(parseInt(addRow.value), parseInt(addCol.value), pieceType.value, side.value);
  };

  removeButton.onclick = (e) => {
    e.preventDefault();
    board.removePiece(parseInt(removeRow.value), parseInt(removeCol.value));
  };
};

const clearDrawBoard = function () {
  const board = new XiangQi({
    containerId: 'clearBoard',
    boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9',
  });
  document.getElementById('clear').addEventListener('click', () => board.clearBoard(false));
  document.getElementById('draw').addEventListener('click', () => board.drawBoardContent());
};

const largerBoard = function () {
  const board = new XiangQi({ containerId: 'largeBoard', boardContent: 'start' });
  document.getElementById('slider').addEventListener('change', event => {
    board.resizeBoard(parseInt(event.target.value));
    document.getElementById('size').textContent = `Size: ${event.target.value}px`
  });
};


document.addEventListener('DOMContentLoaded', function () {
  init();

  // Create empty board
  emptyBoard();
  fullBoardStart();
  midGameBoard();
  multiBoard();
  showSideBarBoard();
  draggableBoard();
  clickableBoard();
  clickableVoidBoard();
  flipBoard();
  pieceMoveBoard();
  clearDrawBoard();
  largerBoard();
  addRemovePieceBoard();
});
