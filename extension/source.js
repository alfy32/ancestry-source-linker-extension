var Sources = {};

(function () {

  console.log("Loading source.js");

  var cookieHost = "https://beta.familysearch.org",
      ctHost = cookieHost + "/ct",
      linksHost = cookieHost + "/links",
      locale = "en",
      sessionId,
      personsToAttach = 0,
      sourcesAttached = 0;

  // Add a listener that creates a source when called.
  chrome.runtime.onMessage.addListener(function(request, sender) {
    if (request.action == "create-source") {
      Sources.statusUpdate("Creating a source...");

      postSource(request.source, request.personIds, request.reason, request.addToSourceBox);      
    }
  });

  // This is the defaul logger. Override it if you want.
  Sources.statusUpdate = function(message) {
    console.log(message);
  }

  Sources.finishedAttaching = function() {
    Sources.statusUpdate("Done attaching sources.");
  }

  // Example data:
  // {
  //   source: {
  //     title: "title",
  //     citation: "citation",
  //     uri: "uri",
  //     notes: "notes" 
  //   },
  //   personIds: [personId, ...],
  //   reason: "reason",
  //   addToSourceBox: <true|false>
  // }
  Sources.createSource = function(data, callback) {
    Sources.statusUpdate("Creating a source...");
    postSource(data.source, data.personIds, data.reason, data.addToSourceBox);
  }

  // This is to get the sessionId from family search.
  chrome.cookies.get({
      "name" : "fssessionid",
      "url" : cookieHost
    }, function (cookie) {
      sessionId = cookie.value;
      console.log("Your sessionId is: " + sessionId);
    }
  );

  // POST the source to links
  function postSource(source, personIds, reason, addToSourceBox) {
    var xhttp;

    Sources.statusUpdate("Adding source to person ids", source, personIds, reason);
    sourcesAttached = 0;
    personsToAttach = getPersonCount(personIds);

    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        handleSourceResponse(JSON.parse(xhttp.response), personIds, reason, addToSourceBox);
      }
    };

    xhttp.open("POST", linksHost + "/source", true);
    xhttp.setRequestHeader("Accept", "application/json");
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + sessionId);
    xhttp.send(JSON.stringify({
      "title":source.title,
      "citation":source.citation,
      "uri":{
        "uri":source.uri
      },
      "notes":source.notes,
      "sourceType":"DEFAULT",
      "lang":locale
    }));
  }

  function getPersonCount(personIds) {
    if (Array.isArray(personIds)) {
      return personIds.length;
    }
    else {
      return 1;
    }
  }

  // Handle the links response
  function handleSourceResponse(repsonse, personIds, reason, addToSourceBox) {
    var sourceId = repsonse.id;
    Sources.statusUpdate("Source added...", sourceId, personIds, reason, repsonse);

    if (!addToSourceBox) {
      removeFromSourceBox(sourceId);
    }

    if (Array.isArray(personIds)) {
      personIds.forEach(function(personId) {
        postReference(personId, sourceId, reason);
      });
    }
    else if (typeof personIds === 'string') {
      postReference(personId, sourceId, reason);
    }
  }

  // Remove from source box.
  function removeFromSourceBox(sourceId) {
    var xhttp;

    Sources.statusUpdate("Removing from source box...", sourceId);

    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 204) {
        Sources.statusUpdate("Removed from source box...", sourceId);
      }
    };

    xhttp.open("DELETE", linksHost + "/folder/sources/" + sourceId, true);
    xhttp.setRequestHeader("Authorization", "Bearer " + sessionId);
    xhttp.send();
  }

  // POST ct reference
  function postReference(personId, sourceId, reason) {
    var xhttp;

    Sources.statusUpdate("Posting reference...", personId, sourceId, reason);

    xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4 && xhttp.status == 201) {
        handleReferenceResponse(xhttp.getResponseHeader("X-Entity-ID"));
      }
    };
    xhttp.open("POST", ctHost + "/persons/" + personId + "/references/reference", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", "Bearer " + sessionId);
    xhttp.send(JSON.stringify({
      "entityId":personId,
      "justification":{
        "reason":reason
      },
      "referenceType":"SOURCE",
      "referencedResourceUri":sourceId
    }));
  }

  function handleReferenceResponse(referenceId) {
    sourcesAttached++;

    Sources.statusUpdate("Reference added... " + referenceId + 
      "(" + sourcesAttached + " of " + personsToAttach + ")"
    );

    if (sourcesAttached == personsToAttach) {
      Sources.finishedAttaching();
    }
  }

})();