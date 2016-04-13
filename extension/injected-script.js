(function () {

  function getCollectionTitle() {
    return document
        .querySelector(".collectionTitle a")
        .text;
  }

  function getUri() {
    return window.location.href;
  }

  function getBreadcrumb() {
    var breadcrumb = "";

    var elements = document
        .querySelector('.breadcrumbDiv')
        .querySelectorAll('div span.text');

    var item;
    for (var i = 0; i < elements.length; i++) {
      item = elements.item(i);
      breadcrumb += item.innerText + ' ';
    }

    return breadcrumb.trim();
  }

  function getPageAndImage() {
    var page = getPage();

    return 'Image: ' + getImage() +
        ((!!page) ? ' Page: ' + page : '');
  }

  function getPage() {
    return document
        .querySelector('.pageNum input')
        .value;
  }

  function getImage() {
    return document
        .querySelector('.imageNum input')
        .value;
  }

  function getCitation() {
    return getCollectionTitle() + '\n' +
        getBreadcrumb() + '\n' +
        getPageAndImage();
  }

  function isFamilySearch() {
    return window.location.hostname.indexOf("familysearch") >= 0;
  }

  function isAncestry() {
    return window.location.hostname.indexOf("ancestry") >= 0;
  }

  /**
   * Scrape the Ancestry source page for The title and the URI of the source.
   * This is used to prepopulate the fields in the popup.
   */
  if (isAncestry()) {
    chrome.runtime.sendMessage({
      action: "sourceInfo",
      title: getCollectionTitle(),
      uri: getUri(),
      citation: getCitation()
    });
  }

  /**
   * Scrape the page for selected text.
   * This allows you to highlight a PID on FamilySearch and add it to the person list.
   */
  if (isFamilySearch()) {
    chrome.runtime.sendMessage({
      action: "selectedText",
      selectedText: getPID()
    });
  }

  function getPID() {
    var matches = window.getSelection().toString()
        .match(/[A-z0-9]{4}-[A-z0-9]{3,4}/);

    return matches ? matches[0] : undefined;
  }

})();