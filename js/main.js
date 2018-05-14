(function($) {


// Get game words
var word = {};
$.getJSON("./assets/text/dictionary.json", function( data ) {
}).done(function(data) {
  word = data;
  dictionarySize = Object.keys(word).length;
});
  // Get game elements
  var boardgame = $('#gameboard');
  var boardgameStats = $('#gameboard .game-stats');
  var boardgameWord = $('#gameboard .game-word');
  var boardgameEffects = $('#gameboard .game-effects');
  var boardgameWordDesc = $('#gameboard .game-word-description');
  var boardgameType = $('#gameboard .game-typing');
  var boardgameMessages = $('#gameboard .game-messages');
  var boardgameStars = $('#gameboard .game-stars');

  var gameStarted = false;
  var dictionarySize = 0;
  var currentWord = '';
  var currentDesc = '';
  var currentWordLength = 0;
  var currentCharacter = 0;
  var currentBonus = 0;
  var streak = 0;

  var gameOverStatus = false;
  var timerInterval = null;
  var timer = 45;
  var score = 0;
  var wordCount = 0;

  // Superpowers
  var superPowerFreeze = false;
  var superPowerDouble = false;



  function startGame(){

    // Get initial word and description
    getNextWord();
    initializeStats();
  }


  // On keypress
  $('body').on('keypress', function(eve){

    if(gameStarted == false){
      startGame();
      startTimer();
      gameStarted = true;
    } else {
      character = eve.key;
      charCode = eve.keyCode;

      if ((charCode > 64 && charCode < 91) || (charCode > 96 && charCode < 123) || charCode == 8 || charCode == 32 || charCode == 45){
        gameKeyPress(character);
      }
    }   

  });


  function startTimer(){
    timerInterval = setInterval(function(){

      // Freeze time superpower
      if(superPowerFreeze == false){
        timer--;
      }

      skyStatus();
      if(timer > 0){
        updateStats();
      } else {
        timer = 0;
        gameOver();
        return;
      }
    }, 1000);
  }


  function initializeStats(){
    boardgameStats.append('<div class="stat"><span class="timer">' + timer + '</span> seconds</div>');
    boardgameStats.append('<div class="stat"><span class="score">' + score + '</span></div>');
    boardgameStats.append('<div class="stat"><span class="words">' + wordCount + '</span></div>');
  }
  function updateStats(){
    boardgameStats.find('.timer').text(timer);
    boardgameStats.find('.score').text(score);
    boardgameStats.find('.words').text(wordCount);
  }

  function getNextWord(){
     var number = Math.floor(Math.random() * dictionarySize);
     boardgameType.html('');
     currentCharacter = 0;
     currentWord = Object.keys(word)[number];
     currentDesc = Object.values(word)[number];
     prepareGameBoard();
  }

  function prepareGameBoard(){

    // Check current word length
    wordLength = currentWord.length;
    currentWordLength = currentWord.length;
    currentBonus = parseInt(wordLength/2);

    // Double points superpower
    if(superPowerDouble == true){
      currentBonus = wordLength*2;
    }

    i = 0;

    // Show current word on board
    boardgameWord.html('<div class="current-word">' + currentWord + '</div>');
    boardgameWordDesc.html('<div class="current-word-desc">' + currentDesc + '</div>');

    // Create input boxes for each letter
    while(wordLength > 0){
      boardgameType.append('<div class="text-input"><input type="text" character="' + i + '" disabled value="" /></div>');
      wordLength--;
      i++;
    }
  }


  function gameKeyPress(x){
    if(timer > 0){
      var compareCharacter = currentWord.charAt(currentCharacter).toLowerCase();
      if(x == compareCharacter){
        goodPress();
      } else {
        badPress();
      }
    }
  }

  function goodPress(){
    $('.text-input input[character="' + currentCharacter + '"]').val(currentWord.charAt(currentCharacter)).addClass('good');
    currentCharacter++;
    if(currentCharacter == currentWordLength){
      message('good', 'Nice! +' + currentBonus + 's</p>');
      finishWord();
    }
  }

  function badPress(){
    $('.text-input input[character="' + currentCharacter + '"]').val(currentWord.charAt(currentCharacter)).addClass('bad');
    timer = timer - 15;
    streak = 0;
    boardgameStars.html('');
    updateStats();
    removeSuperPowers();
    skyStatus();
    message('bad', '-15s');
    getNextWord();
  }


  function finishWord(){

    // Add bonus time
    timer += currentBonus;
    streak++;
    addStreakStar();

    // Double points superpower
    if(superPowerDouble == true){
      score += currentBonus * 200;
    } else {
      score += currentBonus * 100;
    }

    currentCharacter = 0;
    wordCount++;
    boardgameWord.fadeIn();
    skyStatus();
    updateStats();
    getNextWord();
  }

  function gameOver(){
    timer = 0;
    updateStats();
    if(gameOverStatus == false){
      boardgameType.hide();
      boardgameMessages.hide();
      boardgameStars.hide();
      boardgameStats.hide();
      boardgameWord.hide();
      boardgameWordDesc.hide();
      gameOverStatus = true;
      boardgameMessages.html('');
      $('.scoreboard-score').text(score);
      dialog.showModal();
    }
  }


  function message(status, message){
    boardgameMessages.html('<div class="message ' + status + '">' + message + '</div>');
    boardgameMessages.find('.message').fadeIn();
  }


  function skyStatus(){
    if(timer <= 80){
      $('body').css('background-color', '#46aaff');
    }
    if(timer <= 60){
      $('body').css('background-color', '#99b7d0');
    }
    if(timer <= 40){
      $('body').css('background-color', '#ffad16');
    }
    if(timer <= 20){
      $('body').css('background-color', '#fd5e22');
    }
    if(timer <= 10){
      $('body').css('background-color', '#ef3434');
    }
  }

  function addStreakStar(){
    if (streak == 5){
      streak = 0;
      boardgameStars.html('');
       explode();
       addSuperPower();

    } else {
      boardgameStars.append('<div class="streak-star"></div>');
    }
  }



  function superPowerFreezePower(){
    boardgameStats.find('.stat').addClass('frozen');
    superPowerFreeze = true;
    setTimeout(function(){
      removeSuperPowers();
    },15000);

  }

  function superPowerDoublePower(){
    superPowerDouble = true;
    setTimeout(function(){
      removeSuperPowers();
    },15000);
  }

  function addSuperPower(){
    if(superPowerFreeze == false && superPowerDouble == false){
      powerNr = rand(1,1);
      removeSuperPowers();
      switch (powerNr) {
        case 1:
          superPowerFreezePower();
          sprpwr = $('<div class="superpower">Time frozen!</div>');
          boardgameEffects.prepend(sprpwr);
          break;

        case 2:
          sprpwr = $('<div class="superpower">Double points!</div>');
          boardgameEffects.prepend(sprpwr);
          superPowerDoublePower();
          break;
      }
    }
  }

  function removeSuperPowers(){
    $('.superpower').remove();
    boardgameStats.find('.stat').removeClass('frozen');
    superPowerFreeze = false;
    superPowerDouble = false;
  }


  // Scoreboard
  var dialog = $('dialog')[0];

  $('.close-dialog').on('click', function(){
    location.reload;
  });


  function explode() {
    var particles = 25;
    explosion = $('<div class="explosion"></div>');

    // put the explosion container into the body to be able to get it's size
    boardgameEffects.prepend(explosion);

    for (var i = 0; i < particles; i++) {
      // positioning x,y of the particle on the circle (little randomized radius)
      var x = (explosion.width() / 2) + rand(80, 250) * Math.cos(2 * Math.PI * i / rand(particles - 10, particles + 10)),
        y = (explosion.height() / 2) + rand(20, 250) * Math.sin(2 * Math.PI * i / rand(particles - 10, particles + 10)),
          // particle element creation (could be anything other than div)
        elm = $('<div class="particle" style="' + 'top: ' + y + 'px; ' + 'left: ' + x + 'px"></div>');

      if (i == 0) { // no need to add the listener on all generated elements
        // css3 animation end detection
        elm.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          explosion.remove(); // remove this explosion container when animation ended
        });
      }
      explosion.append(elm);
    }
  }

  // get random number between min and max value
  function rand(min, max) {
    return Math.floor(Math.random() * (max + 1)) + min;
  }

})( jQuery );
