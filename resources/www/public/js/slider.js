'use strict'

function Slider(element) {
  this.slides = element.getElementsByTagName('p').length;
  this.view = element.getElementsByClassName('slider_view')[0];
  this.view.style.width = this.slides * 100 + '%';

  this.current = 0;

  document.getElementsByClassName('prev')[0].addEventListener('click', this.prev.bind(this));
  document.getElementsByClassName('next')[0].addEventListener('click', this.next.bind(this));
};

Slider.prototype.next = function () {
  this.current++;
  if (this.current >= this.slides) {
    this.current = 0;
  }

  this.view.style.marginLeft = '-' + this.current * 100 + '%';
};

Slider.prototype.prev = function () {
  this.current--;
  if (this.current < 0) {
    this.current = this.slides - 1;
  }

  this.view.style.marginLeft = '-' + this.current * 100 + '%';
};
