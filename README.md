# XiangQi.js

## Description

XiangQi.js is a vanilla JavaScript library that embeds configurable 
XiangQi boards into websites. To learn more about it, go to its
landing page:
https://xiangqijs.herokuapp.com/

## Basic Setup

First, download the library files and unzip the files to
your desired location.
 
Since XiangQi.js uses no external API, to use the XiangQi.js API, 
simply load the JavaScript file and CSS file into the web page:
```html
<script type="text/javascript" src="path-to-xiangqi.js"></script>
<link rel="stylesheet" href="path-to-xiangqi.css">
```

Make sure to also include the `assets` folder that contains various content used
by XiangQi.js under the same directory as the library files. And that should be it!
Read the API Doc to see various configurations and API
functions that XiangQi.js provides, or read examples page to see sample of API usage.


## Basic Usage

#### Empty Board

XiangQi.js can initialize an empty XiangQi board with just a containerId property in config.

```jsx
// HTML
<div id="board"></div>

// JavaScript
const board = new XiangQi({
  containerId: 'board'
});
```

#### Start Position

Full start position can be displayed by passing in `'start'` for boardContent field

```jsx
// HTML
<div id="board"></div>

// JavaScript
const board = new XiangQi({
  containerId: 'board',
  boardContent: 'start'
});
```

#### FEN String Defined Board

A XiangQi board with use-defined board content.

```jsx
// HTML
<div id="board"></div>

// JavaScript
const board = new XiangQi({
  containerId: 'board',
  boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9'
});
```

#### Multiple Boards

Multiple XiangQi boards can be embedded at the same time by creating
multiple instances of XiangQi.

```jsx
// HTML
<div id="board1"></div>
<div id="board2"></div>

// JavaScript
const board1 = new XiangQi({
  containerId: 'board1',
  boardContent: 'start',
  boardSize: 350
});
const board2 = new XiangQi({
  containerId: 'board2',
  boardContent: '1r2g4/9/1h2ea3/4s4/1R3S3/7H1/s3C2cr/3A5/4G4/9',
  boardSize: 350
});
```

```css
#board1, #board2 {
    display: inline-block;
    margin-right: 5pt;
}
```

## Documentation

- Here is link to API Doc: https://xiangqijs.herokuapp.com/apis.html
- Here is link to API Examples: https://xiangqijs.herokuapp.com/examples.html
