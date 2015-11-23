(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["test"] = factory();
	else
		root["GoResultsHighlighter"] = root["GoResultsHighlighter"] || {}, root["GoResultsHighlighter"]["test"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	__webpack_require__(2);

	/* global hljs:false */
	hljs.initHighlightingOnLoad();

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
	    var button = document.querySelector('[rel="binding-example-1"]');
	    var table = document.getElementById('binding-example-1');

	    if (button && table) {
	        button.addEventListener('click', function () {
	            new GoResultsHighlighter(table);

	            button.textContent = 'Go Results Highlighter is working.';
	            button.disabled = true;
	        });
	    }
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	$(document).ready(function () {
	    var $button = $('[rel="binding-example-2"]');
	    var $table = $('#binding-example-2');

	    if ($button && $table) {
	        $button.click(function () {
	            $table.goResultsHighlighter();
	            $button.attr('disabled', true).html('Go Results Highlighter is working.');
	        });
	    }
	});

/***/ }
/******/ ])
});
;