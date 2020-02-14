$(function () {
  "use strict";

  const DEBUG = false;
  const LEVEL_DATA = [
  ];
  const SCREEN_WIDTH = 500, SCREEN_HEIGHT = 700;
  let currentLevel = 0;

  // ################################
  // TODO: Game logic

  // ################################
  // READY!!

  function resizeScreen() {
    let ratio = Math.min(
      1.0,
      window.innerWidth / SCREEN_WIDTH,
      (window.innerHeight - 25) / SCREEN_HEIGHT,
    );
    $('#game-wrapper').css({
      'width': (SCREEN_WIDTH * ratio) + 'px',
      'height': (SCREEN_HEIGHT * ratio) + 'px',
    });
    $('#game').css('transform', 'scale(' + ratio + ')');
  }

  resizeScreen();
  $(window).resize(resizeScreen);

  const imageList = [
    "img/poop.png",
  ];
  let numResourcesLeft = imageList.length;
  $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');

  function decrementPreload () {
    numResourcesLeft--;
    if (numResourcesLeft == 0) {
      $('#pane-loading')
        .empty()
        .append($('<div class=button>').text('เริ่มเล่น!').click(function () {
          $('#scene-main').show();
          $('#pane-info, #info-inst').show();
          $('#scene-preload').hide();
          initBag();
        }));
    } else {
      $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');
    }
  }

  let images = [];
  imageList.forEach(function (x) {
    let img = new Image();
    img.onload = decrementPreload;
    img.src = x;
    images.push(img);
  });

});
