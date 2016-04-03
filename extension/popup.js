(function () {

  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "sourceInfo") {
      // message.innerText = "Source info read from page!";
      uri.value = request.uri;
      citation.value = request.citation;
    } 
    else if (request.action == "selectedText") {
      console.log(personIds.value, request.selectedText);
      // personIds.value += ", " + myTrim(request.selectedText);

      chrome.storage.local.get({
        "personIds" : ""
      }, function(items) {
        personIds.value = ((items.personIds.trim() != "") ? (items.personIds + ", ") : "") + myTrim(request.selectedText);
        chrome.storage.local.set({
          personIds: personIds.value
        });
      });


    }
  });

  function myTrim(string) {
    var rtrim = /[^-A-z0-9]/g;
    return string.replace(rtrim, "");
  }

  function getPersonIds(personIdsList) {
    var ids = [];

    personIdsList
      .split(",")
      .forEach(function(id) {
        ids.push(myTrim(id));
      });

    return ids;
  }

  function onWindowLoad() {

    var message = document.querySelector('#message');
    
    var title = document.querySelector('#title');
    var uri = document.querySelector('#uri');
    var citation = document.querySelector('#citation');
    var notes = document.querySelector('#notes');
    var personIds = document.querySelector('#personIds');
    var reason = document.querySelector('#reason');
    var addToSourceBox = document.querySelector('#addToSourceBox');

    Sources.statusUpdate = function(status){
      message.innerText = status;
      console.log(status);
    };

    Sources.finishedAttaching = function() {
      message.innerText = "All sources attached!";
      console.log("Finished");
      window.close();
    }

    var submit = document.querySelector('#submit')
      .onclick = function() {
        console.log("This is it!");
        Sources.createSource({
          source: {
            title: title.value,
            citation: citation.value,
            uri: uri.value,
            notes: notes.value 
          },
          personIds: getPersonIds(personIds.value),
          reason: reason.value,
          addToSourceBox: addToSourceBox.checked
        });
        message.innerText = 'Sources are Being Attached!';
      };

    chrome.storage.local.get({
      "title" : "", 
      "notes" : "",
      "personIds" : "",
      "reason" : ""
    }, function(items) {
        title.value = items.title;
        notes.value = items.notes;
        personIds.value = items.personIds;
        reason.value = items.reason;
    });

    title.onkeyup = function() {
      chrome.storage.local.set({
        title: title.value
      });
    }

    notes.onkeyup = function() {
      chrome.storage.local.set({
        notes: notes.value
      });
    }

    personIds.onkeyup = function() {
      chrome.storage.local.set({
        personIds: personIds.value
      });
    }

    reason.onkeyup = function() {
      chrome.storage.local.set({
        reason: reason.value
      });
    }

    chrome.tabs.executeScript(null, {
      file: "injected-script.js"
    }, function() {
      // If you try and inject into an extensions page or the webstore/NTP you'll get an error
      if (chrome.runtime.lastError) {
        message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
      }
    });

  }

  window.onload = onWindowLoad;

})();