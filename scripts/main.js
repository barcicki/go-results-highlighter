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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zaXRlL3NjcmlwdHMvYmluZGluZy1leGFtcGxlLTEuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NpdGUvc2NyaXB0cy9iaW5kaW5nLWV4YW1wbGUtMi5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc2l0ZS9zY3JpcHRzL2Zha2VfMjAxNzY4N2YuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFNO0FBQ2hELFFBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUNqRSxRQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRXpELFFBQUksTUFBTSxJQUFJLEtBQUssRUFBRTtBQUNqQixjQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDbkMsZ0JBQUksb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWhDLGtCQUFNLENBQUMsV0FBVyxHQUFHLG9DQUFvQyxDQUFDO0FBQzFELGtCQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztTQUMxQixDQUFDLENBQUM7S0FDTjtDQUNKLENBQUMsQ0FBQzs7Ozs7QUNaSCxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQU07QUFDcEIsUUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDN0MsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRXJDLFFBQUksT0FBTyxJQUFJLE1BQU0sRUFBRTtBQUNuQixlQUFPLENBQUMsS0FBSyxDQUFDLFlBQU07QUFDaEIsa0JBQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0FBQzlCLG1CQUFPLENBQ0YsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FDdEIsSUFBSSxDQUFDLG9DQUFvQyxDQUFDLENBQUM7U0FDbkQsQ0FBQyxDQUFDO0tBQ047Q0FDSixDQUFDLENBQUM7OztBQ1pILFlBQVksQ0FBQzs7UUFFTixxQkFBcUI7O1FBQ3JCLHFCQUFxQjs7O0FBRzVCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XHJcbiAgICBsZXQgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW3JlbD1cImJpbmRpbmctZXhhbXBsZS0xXCJdJyk7XHJcbiAgICBsZXQgdGFibGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmluZGluZy1leGFtcGxlLTEnKTtcclxuXHJcbiAgICBpZiAoYnV0dG9uICYmIHRhYmxlKSB7XHJcbiAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgICAgICBuZXcgR29SZXN1bHRzSGlnaGxpZ2h0ZXIodGFibGUpO1xyXG5cclxuICAgICAgICAgICAgYnV0dG9uLnRleHRDb250ZW50ID0gJ0dvIFJlc3VsdHMgSGlnaGxpZ2h0ZXIgaXMgd29ya2luZy4nO1xyXG4gICAgICAgICAgICBidXR0b24uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XHJcbiAgICBsZXQgJGJ1dHRvbiA9ICQoJ1tyZWw9XCJiaW5kaW5nLWV4YW1wbGUtMlwiXScpO1xyXG4gICAgbGV0ICR0YWJsZSA9ICQoJyNiaW5kaW5nLWV4YW1wbGUtMicpO1xyXG5cclxuICAgIGlmICgkYnV0dG9uICYmICR0YWJsZSkge1xyXG4gICAgICAgICRidXR0b24uY2xpY2soKCkgPT4ge1xyXG4gICAgICAgICAgICAkdGFibGUuZ29SZXN1bHRzSGlnaGxpZ2h0ZXIoKTtcclxuICAgICAgICAgICAgJGJ1dHRvblxyXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSlcclxuICAgICAgICAgICAgICAgIC5odG1sKCdHbyBSZXN1bHRzIEhpZ2hsaWdodGVyIGlzIHdvcmtpbmcuJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmltcG9ydCAnLi9iaW5kaW5nLWV4YW1wbGUtMSc7XHJcbmltcG9ydCAnLi9iaW5kaW5nLWV4YW1wbGUtMic7XHJcblxyXG4vKiBnbG9iYWwgaGxqczpmYWxzZSAqL1xyXG5obGpzLmluaXRIaWdobGlnaHRpbmdPbkxvYWQoKTtcclxuIl19
