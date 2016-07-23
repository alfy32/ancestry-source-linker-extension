(function () {

  // DOM Elements.
  // They are not available until the window is loaded.
  var message,
      title,
      uri,
      citation,
      notes,
      personIds,
      reason,
      addToSourceBox,
      submit;

  chrome.runtime.onMessage.addListener(function (request) {
    if (request.action == "sourceInfo") {
      uri.value = request.uri;
      citation.value = request.citation;
    }
    else if (request.action == "selectedPersonId") {
      var personId = request.personId;
      if (!!personId) {
        console.log("Got an id from the page! '" + personId + "'");
        addPersonId(personId);
      }
    }
  });

  function addPersonId(personId) {
    chrome.storage.local.get({
      "personIds": ""
    }, function (items) {
      personIds.value = items.personIds.trim() == "" ? personId : items.personIds + ", " + personId;
      chrome.storage.local.set({
        personIds: personIds.value
      });
    });
  }

  function getPersonIdsListFromInput() {
    return personIds.value.match(/[A-z0-9]{4}-[A-z0-9]{3,4}/g) || [];
  }

  function onWindowLoad() {

    message = document.querySelector('#message');

    title = document.querySelector('#title');
    uri = document.querySelector('#uri');
    citation = document.querySelector('#citation');
    notes = document.querySelector('#notes');
    personIds = document.querySelector('#personIds');
    reason = document.querySelector('#reason');
    addToSourceBox = document.querySelector('#addToSourceBox');

    submit = document.querySelector('#submit');

    Sources.statusUpdate = function (status) {
      message.innerText = status;
      console.log(status);
    };

    Sources.finishedAttaching = function () {
      message.innerText = "All sources attached!";
      console.log("Finished");
      window.close();
    };

    submit.onclick = function () {
      console.log("This is it!");
      Sources.createSource({
        source: {
          title: title.value,
          citation: citation.value,
          uri: uri.value,
          notes: notes.value
        },
        personIds: getPersonIdsListFromInput(),
        reason: reason.value,
        addToSourceBox: addToSourceBox.checked
      });
      message.innerText = 'Sources are Being Attached!';
    };

    getInitialValuesFromLocalStorage();
    saveToLocalStorageOnKeyUp("title", title);
    saveToLocalStorageOnKeyUp("notes", notes);
    saveToLocalStorageOnKeyUp("personIds", personIds);
    saveToLocalStorageOnKeyUp("reason", reason);

    chrome.tabs.executeScript(null, {
      file: "extension/injected-script.js"
    }, function () {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });

  }

  function getInitialValuesFromLocalStorage() {
    chrome.storage.local.get({
      "title": "",
      "notes": "",
      "personIds": "",
      "reason": ""
    }, function (items) {
      title.value = items.title;
      notes.value = items.notes;
      personIds.value = items.personIds;
      reason.value = items.reason;
    });
  }

  function saveToLocalStorageOnKeyUp(key, input) {
    input.onkeyup = function () {
      var data = {};
      data[key] = input.value;
      chrome.storage.local.set(data);
    }
  }

  window.onload = onWindowLoad;

})();