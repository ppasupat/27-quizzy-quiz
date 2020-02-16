$(function () {
  "use strict";

  const DEBUG = false;
  const LEVEL_DATA = [
  ];
  const SCREEN_WIDTH = 500, SCREEN_HEIGHT = 700;
  let currentMode = null, currentLevelNum = 0, currentLevel = null;

  const LEVELS = [
    'simple_arith',
    'simple_arith',
    'simple_arith',
  ];
  const NUM_EASY_LEVELS = 3;

  // ################################
  // Utilities

  function showScene(name) {
    $('.scene').hide();
    $('#scene-' + name).show();
  }

  // ################################
  // Game logic

  function setupLevel() {
    // Generate the question
    currentLevel = LGs[LEVELS[currentLevelNum]]();
    randShuffle(currentLevel.answers);
    $('#pane-question').empty().append(currentLevel.question);
    $('#pane-answers').empty();
    currentLevel.answers.forEach(function (answer, i) {
      $('#pane-answers').append(
        $('<div class="button button-answer centerize">')
        .data('index', i)
        .append(answer[1])
        .click(answerClickHandler));
    });
    // Update the HUD
    $('#pane-progress').text(
      'Level ' + (currentLevelNum + 1) + ' / ' + NUM_EASY_LEVELS);
  };

  function answerClickHandler(e) {
    let thisAnswer = $(this);
    let index = +thisAnswer.data('index');
    let is_correct = currentLevel.answers[index][0];
    if (is_correct) {
      // The player failed to choose a wrong answer.
      alert('Wrong!');
      setupLevel();
    } else {
      // The player correctly chose a wrong answer.
      currentLevelNum++;
      if (currentLevelNum == NUM_EASY_LEVELS) {
        // Win!
        showEasyWin();
        return;
      } else {
        setupLevel();
      }
    }
  }

  // ################################
  // Special events

  function showEasyWin() {
    showScene('easy-win');
  }

  // ################################
  // Main menu

  $('.button-start').click(function (e) {
    let thisButton = $(this);
    currentMode = thisButton.data('mode');
    currentLevelNum = 0;
    showScene('game');
    setupLevel();
  });

  $('.button-exit').click(function (e) {
    showScene('menu');
  });

  // ################################
  // Preloading and screen resizing

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
          showScene('menu');
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
  showScene('preload');

});
