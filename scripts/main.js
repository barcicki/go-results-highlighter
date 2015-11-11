(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
'use strict';

require('./binding-example-1');

require('./binding-example-2');

/* global hljs:false */
hljs.initHighlightingOnLoad();

},{"./binding-example-1":1,"./binding-example-2":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zaXRlL3NjcmlwdHMvYmluZGluZy1leGFtcGxlLTEuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NpdGUvc2NyaXB0cy9iaW5kaW5nLWV4YW1wbGUtMi5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc2l0ZS9zY3JpcHRzL2Zha2VfNmJiYjYxZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQU07QUFDaEQsUUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQ2pFLFFBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7QUFFekQsUUFBSSxNQUFNLElBQUksS0FBSyxFQUFFO0FBQ2pCLGNBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUNuQyxnQkFBSSxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFaEMsa0JBQU0sQ0FBQyxXQUFXLEdBQUcsb0NBQW9DLENBQUM7QUFDMUQsa0JBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQzFCLENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQyxDQUFDOzs7OztBQ1pILENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBTTtBQUNwQixRQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUM3QyxRQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFckMsUUFBSSxPQUFPLElBQUksTUFBTSxFQUFFO0FBQ25CLGVBQU8sQ0FBQyxLQUFLLENBQUMsWUFBTTtBQUNoQixrQkFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7QUFDOUIsbUJBQU8sQ0FDRixJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUN0QixJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztTQUNuRCxDQUFDLENBQUM7S0FDTjtDQUNKLENBQUMsQ0FBQzs7O0FDWkgsWUFBWSxDQUFDOztRQUVOLHFCQUFxQjs7UUFDckIscUJBQXFCOzs7QUFHNUIsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsICgpID0+IHtcclxuICAgIGxldCBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdbcmVsPVwiYmluZGluZy1leGFtcGxlLTFcIl0nKTtcclxuICAgIGxldCB0YWJsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiaW5kaW5nLWV4YW1wbGUtMScpO1xyXG5cclxuICAgIGlmIChidXR0b24gJiYgdGFibGUpIHtcclxuICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIG5ldyBHb1Jlc3VsdHNIaWdobGlnaHRlcih0YWJsZSk7XHJcblxyXG4gICAgICAgICAgICBidXR0b24udGV4dENvbnRlbnQgPSAnR28gUmVzdWx0cyBIaWdobGlnaHRlciBpcyB3b3JraW5nLic7XHJcbiAgICAgICAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pOyIsIiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcclxuICAgIGxldCAkYnV0dG9uID0gJCgnW3JlbD1cImJpbmRpbmctZXhhbXBsZS0yXCJdJyk7XHJcbiAgICBsZXQgJHRhYmxlID0gJCgnI2JpbmRpbmctZXhhbXBsZS0yJyk7XHJcblxyXG4gICAgaWYgKCRidXR0b24gJiYgJHRhYmxlKSB7XHJcbiAgICAgICAgJGJ1dHRvbi5jbGljaygoKSA9PiB7XHJcbiAgICAgICAgICAgICR0YWJsZS5nb1Jlc3VsdHNIaWdobGlnaHRlcigpO1xyXG4gICAgICAgICAgICAkYnV0dG9uXHJcbiAgICAgICAgICAgICAgICAuYXR0cignZGlzYWJsZWQnLCB0cnVlKVxyXG4gICAgICAgICAgICAgICAgLmh0bWwoJ0dvIFJlc3VsdHMgSGlnaGxpZ2h0ZXIgaXMgd29ya2luZy4nKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuaW1wb3J0ICcuL2JpbmRpbmctZXhhbXBsZS0xJztcclxuaW1wb3J0ICcuL2JpbmRpbmctZXhhbXBsZS0yJztcclxuXHJcbi8qIGdsb2JhbCBobGpzOmZhbHNlICovXHJcbmhsanMuaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpO1xyXG4iXX0=
