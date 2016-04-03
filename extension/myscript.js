function getUserName() {
	return document
		.querySelector('#nav-display-name')
		.text;
}

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

if (isAncestry()) {
	chrome.runtime.sendMessage({
		action: "sourceInfo",
		title: getCollectionTitle(),
		uri: getUri(),
		citation: getCitation(),
	});
}

if (isFamilySearch()) {
	chrome.runtime.sendMessage({
		action: "selectedText",
		selectedText: window.getSelection().toString().trim()
	});
}