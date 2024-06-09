let currentVocabIndex = null;
let vocabList = [];
let currentQuizWord = null;
let currentQuizDefinition = null;
let quizType = null;
let isPairCorrect = null;
let filteredVocabList =[]


document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('vocabList', function(data) {
    if (data.vocabList) {
      console.log(data.vocabList)
      vocabList = data.vocabList;
      currentVocabIndex = -1;
      showNextItem();
    }
  });

  document.getElementById('nextButton').addEventListener('click', function() {
    showNextItem();
  });

  document.getElementById('nextAfterIncorrectButton').addEventListener('click', function() {
    document.getElementById('incorrectMessage').style.display = 'none';
    document.getElementById('correctDefinition').style.display = 'none';
    document.getElementById('nextAfterIncorrectButton').style.display = 'none';
    showNextItem();
  });

  document.querySelectorAll('.quiz-option').forEach(button => {
    button.addEventListener('click', function() {
      checkAnswer(button);
    });
  });
  document.getElementById('correctDefinition').style.display = 'none';

  document.getElementById('trueButton').addEventListener('click', function() {
    checkTrueFalse(true);
  });

  document.getElementById('falseButton').addEventListener('click', function() {
    checkTrueFalse(false);
  });
  }
);
  


function showNextItem() {
  console.log("filtering")
  filteredVocabList = vocabList.filter(vocab => {
    const results = vocab.quizResults || [];
    return results.filter(result => result === 'f').length > 2;
  });
  console.log(filteredVocabList)
  if (filteredVocabList.length === 0) {
    document.getElementById('vocabFlashcard').textContent = "No vocabulary to test.";
    document.getElementById('nextButton').style.display = 'none';
    return;
  }
  const quizStyle = Math.floor(Math.random() * 3);
  console.log(quizStyle);
  switch(quizStyle){
    case 0:
      quizStyle1();
      break;
    case 1:
      quizStyle2();
      break;
    case 2:
      quizStyle3();
      break;
  }
}

function quizStyle1() {
  // Quiz Style 1: Ask for the definition of a word
  if (currentVocabIndex === null || currentVocabIndex >= filteredVocabList.length - 1) {
    currentVocabIndex = 0;
  } else {
    currentVocabIndex++;
  }

  const correctVocab = filteredVocabList[currentVocabIndex];
  currentQuizWord = correctVocab.word;
  currentQuizDefinition = correctVocab.definition;
  quizType = 'definition';

  const options = [correctVocab.definition];
  console.log(options);
  for (let i = 0; i<3;i++) {    
    const randomIndex = Math.floor(Math.random() * vocabList.length);
    const randomDefinition = vocabList[randomIndex].definition;
    if (!options.includes(randomDefinition)) {
      options.push(randomDefinition);
    }else{
      i--;
    }
  }

  shuffleArray(options);

  document.getElementById('quizQuestion').textContent = `What is the definition of "${correctVocab.word}"?`;
  document.getElementById('option1').textContent = options[0];
  document.getElementById('option2').textContent = options[1];
  document.getElementById('option3').textContent = options[2];
  document.getElementById('option4').textContent = options[3];

  document.getElementById('quizContainer').dataset.correctAnswer = correctVocab.definition;

  // Show quiz and hide vocab card
  document.getElementById('quizContainer').style.display = 'block';
  document.getElementById('vocabFlashcard').style.display = 'none';
  document.getElementById('correctMessage').style.display = 'none';
  document.getElementById('incorrectMessage').style.display = 'none';
  document.getElementById('correctDefinition').style.display = 'none';
  document.getElementById('nextAfterIncorrectButton').style.display = 'none';
}
  
  function quizStyle2() {
    // Quiz Style 2: Ask for the word given a definition
    if (currentVocabIndex === null || currentVocabIndex >= filteredVocabList.length - 1) {
      currentVocabIndex = 0;
    } else {
      currentVocabIndex++;
    }
  
    const correctVocab = filteredVocabList[currentVocabIndex];
    currentQuizWord = correctVocab.word;
    currentQuizDefinition = correctVocab.definition;
    quizType = 'word';
  
    const options = [correctVocab.word];
    for (let i = 0; i<3;i++) {    
      const randomIndex = Math.floor(Math.random() * vocabList.length);
      const randomWord = vocabList[randomIndex].word;
      if (!options.includes(randomWord)) {
        options.push(randomWord);
      }else{
        i--;
      }
    }
  
    shuffleArray(options);
  
    document.getElementById('quizQuestion').textContent = `What is the word for "${correctVocab.definition}"?`;
    document.getElementById('option1').textContent = options[0];
    document.getElementById('option2').textContent = options[1];
    document.getElementById('option3').textContent = options[2];
    document.getElementById('option4').textContent = options[3];
  
    document.getElementById('quizContainer').dataset.correctAnswer = correctVocab.word;
  
    // Show quiz and hide vocab card
    document.getElementById('quizContainer').style.display = 'block';
    document.getElementById('vocabFlashcard').style.display = 'none';
    document.getElementById('correctMessage').style.display = 'none';
    document.getElementById('incorrectMessage').style.display = 'none';
    document.getElementById('correctDefinition').style.display = 'none';
    document.getElementById('nextAfterIncorrectButton').style.display = 'none';
  }
  
  function quizStyle3() {
    // Quiz Style 3: True or False
    if (currentVocabIndex === null || currentVocabIndex >= filteredVocabList.length - 1) {
      currentVocabIndex = 0;
    } else {
      currentVocabIndex++;
    }
  
    const correctVocab = filteredVocabList[currentVocabIndex];
    currentQuizWord = correctVocab.word;
    currentQuizDefinition = correctVocab.definition;
    quizType = 'truefalse';
  
    isPairCorrect = Math.random() < 0.5;
  
    if (!isPairCorrect) {
      let incorrectVocab;
      do {
        const randomIndex = Math.floor(Math.random() * vocabList.length);
        incorrectVocab = vocabList[randomIndex];
      } while (incorrectVocab.word === currentQuizWord);
      currentQuizDefinition = incorrectVocab.definition;
    }
  
    document.getElementById('trueFalseQuestion').textContent = `Is the definition of "${currentQuizWord}" "${currentQuizDefinition}"?`;
  
    // Show true/false quiz and hide vocab card
    document.getElementById('trueFalseContainer').style.display = 'block';
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('vocabFlashcard').style.display = 'none';
    document.getElementById('correctMessage').style.display = 'none';
    document.getElementById('incorrectMessage').style.display = 'none';
    document.getElementById('correctDefinition').style.display = 'none';
    document.getElementById('nextAfterIncorrectButton').style.display = 'none';
  }
  
  function checkAnswer(button) {
    const correctAnswer = document.getElementById('quizContainer').dataset.correctAnswer;
    const correctMessage = document.getElementById('correctMessage');
    const incorrectMessage = document.getElementById('incorrectMessage');
    const correctDefinition = document.getElementById('correctDefinition');
  
    const result = button.textContent === correctAnswer ? 't' : 'f';
  
    if (result === 't') {
      correctMessage.style.display = 'block';
      setTimeout(() => {
        correctMessage.style.display = 'none';
        showNextItem();
      }, 3000);
    } else {
      incorrectMessage.style.display = 'block';
      showCorrectAnswer();
      document.getElementById('nextAfterIncorrectButton').style.display = 'block';
    }
  }
  
  function checkTrueFalse(isTrue) {
    const result = isTrue === isPairCorrect ? 't' : 'f';
    processTrueFalseResult(result);
  }
  
  function processTrueFalseResult(result) {
  
    const correctMessage = document.getElementById('correctMessage');
    const incorrectMessage = document.getElementById('incorrectMessage');
    const correctDefinition = document.getElementById('correctDefinition');
  
    if (result === 't') {
      correctMessage.style.display = 'block';
      setTimeout(() => {
        correctMessage.style.display = 'none';
        showNextItem();
      }, 3000);
    } else {
      incorrectMessage.style.display = 'block';
      showCorrectAnswer();
      document.getElementById('nextAfterIncorrectButton').style.display = 'block';
    }
  }
  
  function showCorrectAnswer() {
    const correctDefinition = document.getElementById('correctDefinition');
    correctDefinition.style.display = "Block";
    if (quizType === 'definition') {
      correctDefinition.textContent = `${currentQuizWord}: ${currentQuizDefinition}`;
    } else if (quizType === 'word') {
      correctDefinition.textContent = `${currentQuizDefinition}: ${currentQuizWord}`;
    } else {
      correctDefinition.textContent = `The correct definition of "${currentQuizWord}" is "${filteredVocabList.find(entry => entry.word === currentQuizWord).definition}"`;
    }
    document.getElementById('quizContainer').style.display = 'none';
    document.getElementById('trueFalseContainer').style.display = 'none';
    correctDefinition.style.display = 'block';
  }
  
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  