document.getElementById('addVocabForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const word = document.getElementById('word').value;
  const definition = document.getElementById('definition').value;

  // Get existing vocab data from Chrome storage
  chrome.storage.local.get('vocabList', function(data) {
    let vocabList = data.vocabList || [];
    console.log(data.vocabList)

    // Append the new word, definition, snoozed field, and seen field
    vocabList.push({ word, definition, snoozed: false, seen: 0, quizResult:['n','n','n','n'] });

    // Save updated vocab list to Chrome storage
    chrome.storage.local.set({ vocabList: vocabList }, function() {
      updateVocabList(vocabList);

      // Clear form fields
      document.getElementById('addVocabForm').reset();
    });
  });
});

document.getElementById('clearButton').addEventListener('click', function() {
  chrome.storage.local.clear(function() {
    console.log('Chrome storage local data cleared');
    updateVocabList([]);  // Clear the displayed list
  });
});
document.getElementById('startTestButton').addEventListener('click', function() {
  chrome.tabs.create({ url: 'test/test.html' });
});

function updateVocabList(vocabList) {
  const vocabListContainer = document.getElementById('vocabList');
  vocabListContainer.innerHTML = '';

  vocabList.forEach((entry, index) => {
    if (entry.word && entry.definition) {
      const vocabDiv  = document.createElement('div');
      vocabDiv .className = 'flashcard';
      //vocabDiv .textContent = `${entry.word}: ${entry.definition} (Seen: ${entry.seen}, Snoozed: ${entry.snoozed})`;
 
      const wordDiv = document.createElement('div');
      wordDiv.textContent = ` ${entry.word}`;
      wordDiv.style.width = '250px';
      wordDiv.style.fontSize = '160%';
      wordDiv.style.marginRight  = '10px';

 
      const definitionDiv = document.createElement('div');
      definitionDiv.textContent = `${entry.definition}`;
      definitionDiv.style.width = '250px';
      definitionDiv.style.fontSize = '160%';
      definitionDiv.style.marginRight  = '10px';

  
      const quizResultsDiv = document.createElement('div');
      quizResultsDiv.className = 'quiz-results';
      quizResultsDiv.textContent = '';
      const results = entry.quizResults || [];
      
      for (let i = 0; i < 4; i++) {
        let resultEmoji = String.fromCodePoint(0x02754);
        if (results[i] === 't') {
          resultEmoji = String.fromCodePoint(0x02705);
        } else if (results[i] === 'f') {
          resultEmoji = String.fromCodePoint(0x0274C);
        }
        quizResultsDiv.textContent += resultEmoji;
      }
      quizResultsDiv.style.width = '200px';

      const deleteButton = document.createElement('button');
      deleteButton.classList.add("ui","button");
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function() {
        vocabList.splice(index, 1);  // Remove the entry from the list
        chrome.storage.local.set({ vocabList: vocabList }, function() {
          updateVocabList(vocabList);  // Update the displayed list
        });
      });

      const snoozeButton = document.createElement('button');
      snoozeButton.classList.add("ui","button");
      snoozeButton.style.width = '100px'
      snoozeButton.textContent = entry.snoozed ? 'Unsnooze' : 'Snooze';
      snoozeButton.addEventListener('click', function() {
        vocabList[index].snoozed = !vocabList[index].snoozed;
        chrome.storage.local.set({ vocabList: vocabList }, function() {
          updateVocabList(vocabList);  // Update the displayed list
        });
      });
      vocabDiv.appendChild(wordDiv);
      vocabDiv.appendChild(definitionDiv);
      vocabDiv.appendChild(quizResultsDiv);
      vocabDiv.appendChild(deleteButton);
      vocabDiv.appendChild(snoozeButton);
      vocabListContainer.appendChild(vocabDiv);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.local.get('vocabList', function(data) {
    if (data.vocabList) {
      updateVocabList(data.vocabList);
    }
  });
});
