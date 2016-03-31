chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "displayName") {
    message.innerText = 'Hello ' + request.source + '!' + '  ' + sessionId;
    
  }
});

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "sourceInfo") {
    message.innerText = sessionId;
    
    uri.value = request.uri;
    citation.value = request.citation;
  }
});

chrome.cookies.get({
      "name" : "fssessionid",
      "url" : "https://familysearch.org"
    }, function (cookie) {
      sessionId = "Here is your session: " + cookie.value;
    });

var data = {
  title : "",
  notes : ""
};

function onWindowLoad() {

  var message = document.querySelector('#message');
  
  var title = document.querySelector('#title');
  var uri = document.querySelector('#uri');
  var citation = document.querySelector('#citation');
  var notes = document.querySelector('#notes');

  var submit = document.querySelector('#submit')
    .onclick = function() {
      uri.value = '';
    };

  chrome.storage.local.get({
    "title" : "", 
    "notes" : ""
  }, function(items) {
      title.value = items.title;
      notes.value = items.notes;
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

  chrome.tabs.executeScript(null, {
    file: "myscript.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;