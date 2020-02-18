$(function () {
  "use strict";

  const SCREEN_WIDTH = 500, SCREEN_HEIGHT = 700;
  const FRAME_RATE = 25;

  const LEVELS = [
    'simple_arith',
    'day_of_the_week',
    'province',
    'geography_trivia',
    'letter_before_eng',
    'crow_color',
    'simple_arith_2',
    'country',
    'misnomer_trivia',
    'simple_arith_parity',
    'thai_trivia',
    'physician',
    'letter_before_thai',
    'shirt_color',
    'province_pun',
    'simple_arith_parity_2',
    'fish_pun',
    'noun_unit',
    'water_pun',
    'blue_whale',
    'x3_animal',
    'x3_hormone',
    'x3_fruit',
    'x3_spelling',
    'x4_pokemon',
    'x4_asean',
    'x3_last',
  ];
  const NUM_EASY_LEVELS = 20, NUM_HARD_LEVELS = 27;

  let currentMode = null, currentLevelNum = 0, currentLevel = null;

  function getTimeLimit() {
    if (currentMode === "easy")
      return 1800;
    else if (currentLevelNum === NUM_HARD_LEVELS - 1)
      return 8000;
    else if (currentLevelNum >= NUM_EASY_LEVELS)
      return 2500;
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
  // Persistence

  // settings has the following keys:
  //   hard_mode: 0 = locked; 1 = unlocked but not done; 2 = unlocked and done
  let settings = {};

  function loadSettings() {
    let settings_raw = localStorage.getItem('quizzy-quiz');
    if (settings_raw === null) {
      settings = {hard_mode: 0};
    } else {
      settings = JSON.parse(settings_raw);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem('quizzy-quiz', JSON.stringify(settings));
    } catch (e) {
      alert("ERROR: " + e.message);
    }
  }

  loadSettings();

  // ################################
  // Game logic

  let utils = {
    getPlayerName: function () {
      return "ออย";
    },
  }

  function setupLevel() {
    // Generate the question
    currentLevel = LGs[LEVELS[currentLevelNum]](utils);
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
    $('#pane-answers').toggleClass('grid', currentLevel.answers.length === 4);
    // Update the HUD
    $('#progress-text').text(
      '' + (currentLevelNum + 1) + ' / ' + NUM_EASY_LEVELS);
    $('#progress-bar').width((currentLevelNum + 1) * SCREEN_WIDTH / NUM_EASY_LEVELS);
    $('#progress-bar-2').width(
      Math.max(0, (currentLevelNum + 1 - NUM_EASY_LEVELS) * SCREEN_WIDTH /
                  (NUM_HARD_LEVELS - NUM_EASY_LEVELS)));
    startTimer(getTimeLimit());
  };

  function answerClickHandler(e) {
    stopTimer();
    let thisAnswer = $(this);
    let index = +thisAnswer.data('index');
    let is_correct = currentLevel.answers[index][0];
    thisAnswer.addClass(is_correct ? 'correct' : 'incorrect');
    let should_correct = (currentMode === "easy");
    if (is_correct === should_correct) {
      // The player followed the instruction
      currentLevelNum++;
      if (currentMode === 'easy' && currentLevelNum === NUM_EASY_LEVELS) {
        showEasyWin();
        return;
      } else if (currentMode === 'hard' && currentLevelNum === NUM_HARD_LEVELS) {
        showHardWin();
        return;
      } else {
        setupLevel();
      }
    } else {
      // The player did not follow the instruction
      showCover();
      window.setTimeout(function () {
        showFail(is_correct ? 'correct' : 'incorrect');
      }, 700);
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
      $('.button-answer').addClass('disabled');
      if (currentLevelNum === NUM_HARD_LEVELS - 1) {
        // Last question is a trick question
        showHardWin();
      } else {
        showCover();
        window.setTimeout(function () {
          showFail('timeout');
        }, 700);
      }
    }
  }

  function stopTimer() {
    if (timerHandler !== null) {
      window.clearInterval(timerHandler);
      timerHandler = null;
    }
  }

  // ################################
  // Fail screens

  const FAIL_MESSAGES = {
    incorrect: [
      ["คุณตอบผิด", "ลองใหม่นะ"],
      ["จงตอบถูก", "อย่าตอบผิด"],
      ["ผิดนะคร้าบ", "น่าเสียดายจริง ๆ"],
      ["ตอบผิดคะ", "ลองใหม่นะค่ะ"],
      ["ไม่ถูกต้อง", "แง"],
      ["ผิดเป็นครู", "คำตอบนี้เป็นครู"],
      ["ข้อที่ถูก", "คือข้ออื่น"],
      ["ยินดีด้วย", "ซะเมื่อไร"],
      ["ข้อที่ถูกก็มีนะ", "แต่คุณไม่ได้เลือกมัน"],
      ["ผิดนะจ๊ะ", "จริงจา"],
      ["ถูก", "ต้ม"],
    ],
    correct: [
      ["คุณตอบถูก", "ซึ่งเป็นสิ่งที่ผิด"],
      ["คุณตอบถูก", "ซึ่งไม่ใช่สิ่งที่ถูก"],
      ["จงตอบผิด", "อย่าตอบถูก"],
      ["คำตอบถูก", "แต่เขาให้ตอบผิด"],
      ["ถูกต้องนะคร้าบ", "แต่เขาให้ตอบผิด"],
      ["ถูกต้องคะ", "ลองใหม่นะค่ะ"],
      ["ตอบไม่ผิดนะ", "แต่ผิดคำสั่ง"],
      ["ยินดีด้วย", "ซะเมื่อไร"],
      ["ข้อนี้ถูกต้อง", "จึงไม่ควรถูกเลือก"],
      ["ผิดเป็นครู", "คำตอบนี้ไม่เป็นครู"],
      ["ถูกแล้วหละ", "ถูกหลอกให้ตอบถูก"],
      ["ข้อที่ผิด", "คือข้ออื่น"],
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

  let penaltyToApply = 0, semiPenalty = false;

  function showFail(failType) {
    penaltyToApply = 0;
    if (currentMode === 'hard' && currentLevelNum !== 0) {
      if (semiPenalty) {
        penaltyToApply = 1;
        semiPenalty = false;
      } else {
        semiPenalty = true;
      }
    }
    // Show message
    let message;
    if (failType !== "timeout" && currentLevel.message) {
      message = currentLevel.message;
    } else {
      message = randChoice(FAIL_MESSAGES[failType]);
    }
    $('#fail-image > img').hide();
    $('#fail-image-' + failType).show();
    $('#fail-line-0').text(message[0]);
    $('#fail-line-1').text(message[1]);
    if (penaltyToApply !== 0) {
      $('#fail-line-2').show().text('ลงโทษ! ถอยหลัง ' + penaltyToApply + ' ข้อ');
    } else {
      $('#fail-line-2').hide();
    }
    showCover('fail');
  }

  $('#button-fail-ok').click(function (e) {
    currentLevelNum -= penaltyToApply;
    setupLevel();
    hideCover();
  });

  // ################################
  // Win screens

  function showEasyWin() {
    if (settings.hard_mode < 1) {
      settings.hard_mode = 1;
      saveSettings();
    }
    $('#scene-easy-win').removeClass('confused');
    showScene('easy-win');
    window.setTimeout(function () {
      $('#easy-win-confusion').css(
        'top', $('#easy-win-image').position().top - $('#scene-easy-win').position().top + 20);
      $('#scene-easy-win').addClass('confused');
      window.setTimeout(function () {
        showCover('devil');
      }, 1500);
    }, 2000);
  }

  function showHardWin() {
    if (settings.hard_mode < 2) {
      settings.hard_mode = 2;
      saveSettings();
    }
    $('#countdown-number').text('...');
    showCover('countdown');
    window.setTimeout(function () {
      showScene('hard-win');
      $('#cover-wrapper').fadeOut(400);
    }, 1000);
  }

  // ################################
  // Main menu

  function setupMenu() {
    $('#checkbox-hard-wrapper').css(
      'visibility', settings.hard_mode >= 1 ? 'visible' : 'hidden');
    $('#cakefloor').toggle(settings.hard_mode >= 2);
  }

  $('#button-start').click(function (e) {
    let thisButton = $(this);
    currentMode = $('#game').hasClass('hard') ? 'hard' : 'easy';
    currentLevelNum = 0;
    showCountdown();
  });

  function showCountdown() {
    showCover('countdown');
    let countdownCount = 4;
    function decrementCountdown() {
      countdownCount--;
      if (countdownCount === 0) {
        setupLevel();
        showScene('quiz');
        hideCover();
      } else {
        $('#countdown-number').text(countdownCount);
        setTimeout(decrementCountdown, 500);
      }
    }
    decrementCountdown();
  }

  $('#checkbox-hard-wrapper').click(function (e) {
    $('#game').toggleClass('hard');
  });

  $('.button-exit').click(function (e) {
    hideCover();
    setupMenu();
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
    "img/crossmark.png",
    "img/time.png",
    "img/pokemon.png",
    "img/asean.png",
    "img/devil.png",
    "img/cakefloor.png",
  ];
  let numResourcesLeft = imageList.length;
  $('#pane-loading').text('Loading resources (' + numResourcesLeft + ' left)');

  function decrementPreload () {
    numResourcesLeft--;
    if (numResourcesLeft === 0) {
      setupMenu();
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
