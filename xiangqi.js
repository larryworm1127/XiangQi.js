'use strict';

const XiangQi = function (containerId) {

  const _self = {};
  _self.containerId = containerId;
  _self.containerElement = document.querySelector(`#${containerId}`);

  _self.draw = () => {
    console.log(_self.containerElement);
  };

  return _self;
};

module.exports = {
  XiangQi
};
