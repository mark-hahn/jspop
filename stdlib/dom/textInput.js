
var Popx = require('popx');

(() => {
  'use strict';

  class TextInput extends Popx {
    constructor () {
      super();
      this.react('selector', pins => {
        if (this.changedListener) 
          this.ele.removeEventListener('changed', this.changedListener);
        this.ele = document.querySelector(pins.selector.val);
        this.changedListener = e => this.emit('changed', e);
        this.ele.addEventListener('changed', this.changedListener);
      });
    }
  }

module.exports = new TextInput();

})();