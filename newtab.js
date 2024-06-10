document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('vocabList', function(data) {
    if (data.vocabList) {
      vocabList = data.vocabList;
      currentVocabIndex = -1;
      showNextItem();
    }
  });

  document.getElementById('snoozeButton').addEventListener('click', function() {
    snoozeCurrentVocab();
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

  document.getElementById('trueButton').addEventListener('click', function() {
    checkTrueFalse(true);
  });

  document.getElementById('falseButton').addEventListener('click', function() {
    checkTrueFalse(false);
  });
});

let currentVocabIndex = null;
let vocabList = [];
let currentQuizWord = null;
let currentQuizDefinition = null;
let quizType = null;
let isPairCorrect = null;
let newtab = true;

function showNextItem() {
  if (newtab){
    //to avoid err
    newtab = false;
    showNextVocab();
  }else{
    const eligibleForQuiz = vocabList.length>=4 && vocabList.some(entry => entry.seen > 3);
    const shouldShowQuiz = (Math.random() < 0.2) && eligibleForQuiz;
  
    if (shouldShowQuiz) {
      showQuiz();
    } else {
      showNextVocab();
    }
  }
}

function showNextVocab() {
  
  document.getElementById('quizContainer').style.display = 'none';
  document.getElementById('trueFalseContainer').style.display = 'none';
  
  document.getElementById('snoozeButton').style.display = '';
  document.getElementById('nextButton').style.display = '';
  correctDefinition.style.display = 'None';
  const startIndex = currentVocabIndex === null ? -1 : currentVocabIndex;
  let nextIndex = (startIndex + 1) % vocabList.length;

  while (nextIndex !== startIndex && vocabList[nextIndex].snoozed) {
    nextIndex = (nextIndex + 1) % vocabList.length;
  }

  if (nextIndex === startIndex) {
    // All items are snoozed or there are no items left
    const vocabFlashcard = document.getElementById('vocabFlashcard');
    vocabFlashcard.textContent = "No new vocabulary to display.";
    currentVocabIndex = null;
  } else {
    currentVocabIndex = Math.floor(Math.random()*vocabList.length);
    const vocabFlashcard = document.getElementById('vocabFlashcard');

    let wordDiv = document.getElementById('wordDiv');

    let defDiv = document.getElementById('defDiv');

    const word = vocabList[currentVocabIndex].word;
    const definition = vocabList[currentVocabIndex].definition;
    wordDiv.textContent = word;
    defDiv.textContent =definition;

    // Increment the seen count
    vocabList[currentVocabIndex].seen += 1;
    chrome.storage.local.set({ vocabList: vocabList }, function() {
      console.log(`Incremented seen count for "${word}".`);
    });

    // Show vocab card and hide quiz
    document.getElementById('quizContainer').style.display = 'none';
    vocabFlashcard.style.display = 'block';
    
  }
}

function snoozeCurrentVocab() {
  if (currentVocabIndex !== null && currentVocabIndex !== -1) {
    vocabList[currentVocabIndex].snoozed = true;

    // Save updated vocab list to Chrome storage
    chrome.storage.local.set({ vocabList: vocabList }, function() {
      console.log(`Snoozed "${vocabList[currentVocabIndex].word}".`);
      showNextItem();  // Show the next item (vocab or quiz)
    });
  }
}

function showQuiz() {
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
function updateQuizResults(result) {

  if (currentVocabIndex !== null && vocabList[currentVocabIndex].quizResults) {
    let quizResults =  vocabList[currentVocabIndex].quizResults;
    quizResults.unshift(result);
    if (quizResults.length > 4) {
      quizResults.pop(); // Remove the oldest result to keep only the first 4
    }
    vocabList[currentVocabIndex].quizResults = quizResults;

    chrome.storage.local.set({ vocabList: vocabList }, function() {
      console.log(`Updated quiz results for "${vocabList[currentVocabIndex].word}": ${quizResults}`);
    });
  }
}
function quizStyle1(){
  console.log("quiz style 1")
  const eligibleVocab = vocabList.filter(entry => entry.seen > 3);
  if (eligibleVocab.length < 1) {
    showNextVocab();
    return;
  }

  const quizIndex = Math.floor(Math.random() * eligibleVocab.length);
  const correctVocab = eligibleVocab[quizIndex];
  currentQuizWord = correctVocab.word;

  const options = [correctVocab.definition];
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
function quizStyle2(){
 console.log("Quiz Style 2: Ask for the word given a definition");
 const eligibleVocab = vocabList.filter(entry => entry.seen > 3);
 if (eligibleVocab.length < 1) {
   showNextVocab();
   return;
 }

 const quizIndex = Math.floor(Math.random() * eligibleVocab.length);
 const correctVocab = eligibleVocab[quizIndex];
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
function quizStyle3(){
// Quiz Style 3: True or False
const eligibleVocab = vocabList.filter(entry => entry.seen > 3);
if (eligibleVocab.length < 1) {
  showNextVocab();
  return;
}

const quizIndex = Math.floor(Math.random() * eligibleVocab.length);
const correctVocab = eligibleVocab[quizIndex];
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
  document.getElementById('quizQuestion').textContent = `What is the definition of "${correctVocab.word}"?`;

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
  updateQuizResults(result);

  if (button.textContent === correctAnswer) {
    button.classList.add('correct');
    document.getElementById('snoozeButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'none';
    correctMessage.style.display = 'block';
    setTimeout(() => {
      button.classList.remove('correct');
      correctMessage.style.display = 'none';
      showNextItem();
    }, 2000);
  } else {
    document.getElementById('snoozeButton').style.display = 'none';
    document.getElementById('nextButton').style.display = 'none';
    incorrectMessage.style.display = 'block';
    showCorrectAnswer();
    document.getElementById('nextAfterIncorrectButton').style.display = 'Block';
  }
}

function showCorrectAnswer() {
  
  document.getElementById('snoozeButton').style.display = 'none';
  document.getElementById('nextButton').style.display = 'none';
  const vocabFlashcard = document.getElementById('correctDefinition');
  vocabFlashcard.style.display = 'block';
  const correctVocab = vocabList.find(entry => entry.word === currentQuizWord);
  if (correctVocab) {
    vocabFlashcard.textContent = `${correctVocab.word}: ${correctVocab.definition}`;
    document.getElementById('quizContainer').style.display = 'none';
    vocabFlashcard.style.display = 'block';
  }
}
function checkTrueFalse(isTrue) {
  const correctMessage = document.getElementById('correctMessage');
  const incorrectMessage = document.getElementById('incorrectMessage');
  const correctDefinition = document.getElementById('correctDefinition');
 
  document.getElementById('snoozeButton').style.display = 'none';
  document.getElementById('nextButton').style.display = 'none';
  if (isTrue === isPairCorrect) {
    
    updateQuizResults('t');
    correctMessage.style.display = 'block';
    setTimeout(() => {
      correctMessage.style.display = 'none';
      showNextItem();
    }, 3000);
  } else {
    updateQuizResults('f');

    incorrectMessage.style.display = 'block';
    showCorrectAnswer();
    document.getElementById('nextAfterIncorrectButton').style.display = 'block';

  }
  document.getElementById('trueFalseContainer').style.display = 'none';

}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
