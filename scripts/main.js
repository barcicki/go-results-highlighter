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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWt0eVxcZ28tcmVzdWx0cy1oaWdobGlnaHRlclxcbm9kZV9tb2R1bGVzXFxndWxwLWJyb3dzZXJpZnlcXG5vZGVfbW9kdWxlc1xcYnJvd3Nlci1wYWNrXFxfcHJlbHVkZS5qcyIsIkQ6L1Byb2pla3R5L2dvLXJlc3VsdHMtaGlnaGxpZ2h0ZXIvc2l0ZS9zY3JpcHRzL2JpbmRpbmctZXhhbXBsZS0xLmpzIiwiRDovUHJvamVrdHkvZ28tcmVzdWx0cy1oaWdobGlnaHRlci9zaXRlL3NjcmlwdHMvYmluZGluZy1leGFtcGxlLTIuanMiLCJEOi9Qcm9qZWt0eS9nby1yZXN1bHRzLWhpZ2hsaWdodGVyL3NpdGUvc2NyaXB0cy9mYWtlXzg0OGIyYWQ4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsWUFBTTtBQUNoRCxRQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLDJCQUEyQixDQUFDLENBQUM7QUFDakUsUUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDOztBQUV6RCxRQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDakIsY0FBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQ25DLGdCQUFJLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDOztBQUVoQyxrQkFBTSxDQUFDLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztBQUMxRCxrQkFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7U0FDMUIsQ0FBQyxDQUFDO0tBQ047Q0FDSixDQUFDLENBQUM7Ozs7O0FDWkgsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxZQUFNO0FBQ3BCLFFBQUksT0FBTyxHQUFHLENBQUMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0FBQzdDLFFBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDOztBQUVyQyxRQUFJLE9BQU8sSUFBSSxNQUFNLEVBQUU7QUFDbkIsZUFBTyxDQUFDLEtBQUssQ0FBQyxZQUFNO0FBQ2hCLGtCQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztBQUM5QixtQkFBTyxDQUNGLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQ3RCLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1NBQ25ELENBQUMsQ0FBQztLQUNOO0NBQ0osQ0FBQyxDQUFDOzs7QUNaSCxZQUFZLENBQUM7O1FBRU4scUJBQXFCOztRQUNyQixxQkFBcUI7OztBQUc1QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xyXG4gICAgbGV0IGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tyZWw9XCJiaW5kaW5nLWV4YW1wbGUtMVwiXScpO1xyXG4gICAgbGV0IHRhYmxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JpbmRpbmctZXhhbXBsZS0xJyk7XHJcblxyXG4gICAgaWYgKGJ1dHRvbiAmJiB0YWJsZSkge1xyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgbmV3IEdvUmVzdWx0c0hpZ2hsaWdodGVyKHRhYmxlKTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHRvbi50ZXh0Q29udGVudCA9ICdHbyBSZXN1bHRzIEhpZ2hsaWdodGVyIGlzIHdvcmtpbmcuJztcclxuICAgICAgICAgICAgYnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7IiwiJChkb2N1bWVudCkucmVhZHkoKCkgPT4ge1xyXG4gICAgbGV0ICRidXR0b24gPSAkKCdbcmVsPVwiYmluZGluZy1leGFtcGxlLTJcIl0nKTtcclxuICAgIGxldCAkdGFibGUgPSAkKCcjYmluZGluZy1leGFtcGxlLTInKTtcclxuXHJcbiAgICBpZiAoJGJ1dHRvbiAmJiAkdGFibGUpIHtcclxuICAgICAgICAkYnV0dG9uLmNsaWNrKCgpID0+IHtcclxuICAgICAgICAgICAgJHRhYmxlLmdvUmVzdWx0c0hpZ2hsaWdodGVyKCk7XHJcbiAgICAgICAgICAgICRidXR0b25cclxuICAgICAgICAgICAgICAgIC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpXHJcbiAgICAgICAgICAgICAgICAuaHRtbCgnR28gUmVzdWx0cyBIaWdobGlnaHRlciBpcyB3b3JraW5nLicpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5pbXBvcnQgJy4vYmluZGluZy1leGFtcGxlLTEnO1xyXG5pbXBvcnQgJy4vYmluZGluZy1leGFtcGxlLTInO1xyXG5cclxuLyogZ2xvYmFsIGhsanM6ZmFsc2UgKi9cclxuaGxqcy5pbml0SGlnaGxpZ2h0aW5nT25Mb2FkKCk7XHJcbiJdfQ==
