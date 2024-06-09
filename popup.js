document.getElementById('addVocabForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const word = document.getElementById('word').value;
  const definition = document.getElementById('definition').value;

  // Get existing vocab data from Chrome storage
  chrome.storage.local.get('vocabList', function(data) {
    let vocabList = data.vocabList || [];

    // Append the new word, definition, and snoozed field
    vocabList.push({ word, definition, snoozed: false , seen: 0, quizResults: []});
    // Save updated vocab list to Chrome storage
    chrome.storage.local.set({ vocabList: vocabList }, function() {
      // Show a message indicating the word was added
      const messageDiv = document.getElementById('message');
      messageDiv.textContent = `The word "${word}" has been added to the list.`;

      // Clear form fields
      document.getElementById('addVocabForm').reset();

      // Clear the message after a few seconds
      setTimeout(() => {
        messageDiv.textContent = '';
      }, 3000);
    });
  });
});

document.getElementById('manageButton').addEventListener('click', function() {
  chrome.tabs.create({ url: 'manageVocab/manageVocab.html' });
});
