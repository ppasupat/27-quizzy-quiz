$(function () {
  "use strict";

  const SCREEN_WIDTH = 500, SCREEN_HEIGHT = 700;
  const FRAME_RATE = 25;

  const LEVELS = [
    'simple_arith',
    'simple_arith',
    'simple_arith',
  ];
  const NUM_EASY_LEVELS = 1;

  let currentMode = null, currentLevelNum = 0, currentLevel = null;

  function getTimeLimit() {
    if (currentMode == "easy")
      return 3000;
    else
      return 1800;
  }

  // ################################
  // Utilities

  function showScene(name) {
    $('.scene').hide();
    $('#scene-' + name).show();
  }

  function showCover(name) {
    $('#cover-wrapper').show();
    $('.cover').hide();
    if (name) {
      $('#cover-' + name).show();
    }
  }

  function hideCover() {
    $('#cover-wrapper').hide();
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
    startTimer(getTimeLimit());
  };

  function answerClickHandler(e) {
    stopTimer();
    let thisAnswer = $(this);
    let index = +thisAnswer.data('index');
    let is_correct = currentLevel.answers[index][0];
    if (is_correct) {
      // The player failed to choose a wrong answer.
      showCover();
      thisAnswer.addClass('correct');
      window.setTimeout(function () {
        showFail('correct');
      }, 500);
    } else {
      // The player correctly chose a wrong answer.
      thisAnswer.addClass('incorrect');
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
  // Timer

  let timerHandler = null, timerStartTime = null, timerAmount = null;

  function startTimer(amountMs) {
    stopTimer();
    timerStartTime = Date.now();
    timerAmount = amountMs;
    timerHandler = window.setInterval(updateTimer, 1000. / FRAME_RATE);
    updateTimer();
  }

  function updateTimer() {
    let remaining = timerAmount - (Date.now() - timerStartTime);
    if (remaining > 0) {
      $('#timer-bar').width(remaining * SCREEN_WIDTH / timerAmount);
    } else {
      $('#timer-bar').width(0);
      stopTimer();
      showFail('timeout');
    }
  }

  function stopTimer() {
    if (timerHandler !== null) {
      window.clearInterval(timerHandler);
      timerHandler = null;
    }
  }

  // ################################
  // Special screens

  const FAIL_MESSAGES = {
    correct: [
      ["คุณตอบถูก", "ซึ่งเป็นสิ่งที่ผิด"],
      ["คุณตอบถูก", "ซึ่งไม่ใช่สิ่งที่ถูก"],
      ["จงตอบผิด", "อย่าตอบถูก"],
      ["คำตอบถูก", "แต่เกมนี้ให้ตอบผิด"],
      ["ถูกต้องนะคร้าบ", "แต่เขาให้ตอบผิด"],
      ["ถูกต้องคะ", "ลองใหม่นะค่ะ"],
      ["ตอบไม่ผิดนะ", "แต่ผิดคำสั่ง"],
      ["ยินดีด้วย", "ซะเมื่อไร"],
      ["ข้อนี้ถูกต้อง", "จึงไม่ควรถูกเลือก"],
      ["ผิดเป็นครู", "คำตอบนี้ไม่เป็นครู"],
      ["ถูกแล้วหละ", "ถูกหลอกให้ตอบถูก"],
      ["ข้อที่ผิด", "คือข้ออื่น"],
      ["ถูก", "ต้ม"],
    ],
    timeout: [
      ["หมดเวลา", "สนุกแล้วสิ"],
      ["หมดเวลา", "ต้องเร็วกว่านี้หน่อย"],
      ["หมดเวลา", "ช้าไปหน่อยนะ"],
      ["หมดเวลาแล้ว", "ที่ฉันมีเธอ"],
      ["ช้าไปหน่อย", "เร็วขึ้นอีกนิดนะ"],
      ["เวลาหมดแล้ว", "ลองใหม่นะ"],
      ["เวลาหมดแล้ว", ":("],
      ["เวลา", "มันหมดแล้ว"],
      ["ช้าจัง", "เวลาหมดแล้ว"],
      ["ช้าจุงเบย", "เวลาหมดงุงิ"],
    ],
  };

  function showFail(failType) {
    let message = randChoice(FAIL_MESSAGES[failType]);
    $('#fail-image > img').hide();
    $('#fail-image-' + failType).show();
    $('#fail-line-0').text(message[0]);
    $('#fail-line-1').text(message[1]);
    showCover('fail');
  }

  $('#button-fail-ok').click(function (e) {
    setupLevel();
    hideCover();
  });

  function showEasyWin() {
    showScene('easy-win');
  }

  // ################################
  // Main menu

  $('#button-start').click(function (e) {
    let thisButton = $(this);
    currentMode = "easy";   // TODO: Set this on the main menu
    currentLevelNum = 0;
    showCountdown();
  });

  function showCountdown() {
    showCover('countdown');
    let countdownCount = 4;
    function decrementCountdown() {
      countdownCount--;
      if (countdownCount == 0) {
        setupLevel();
        showScene('game');
        hideCover();
      } else {
        $('#countdown-number').text(countdownCount);
        setTimeout(decrementCountdown, 500);
      }
    }
    decrementCountdown();
  }

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
    "img/checkmark.png",
    "img/time.png",
  ];
  let numResourcesLeft = imageList.length;
  $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');

  function decrementPreload () {
    numResourcesLeft--;
    if (numResourcesLeft == 0) {
      showScene('menu');
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
