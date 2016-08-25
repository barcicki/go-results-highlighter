!function e(t,r,n){function o(s,a){if(!r[s]){if(!t[s]){var l="function"==typeof require&&require;if(!a&&l)return l(s,!0);if(i)return i(s,!0);var u=new Error("Cannot find module '"+s+"'");throw u.code="MODULE_NOT_FOUND",u}var c=r[s]={exports:{}};t[s][0].call(c.exports,function(e){var r=t[s][1][e];return o(r?r:e)},c,c.exports,e,t,r,n)}return r[s].exports}for(var i="function"==typeof require&&require,s=0;s<n.length;s++)o(n[s]);return o}({1:[function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function o(e,t,r){var n=(0,a.asArray)(document.querySelectorAll(e)).filter(function(e){if(r)return!0;if("TABLE"===e.nodeName){for(var t=e.rows.length,n=0;n<t;n++)for(var o=e.rows[n].cells.length,i=0;i<o;i++)if(l.test(e.rows[n].cells[i].textContent))return!0;return!1}var s=e.textContent.match(u);return s&&s.length>6});if(!n.length){var i=void 0;return i=r?prompt('Could not find any elements matching "'+e+'" selector. Do you want to provide another one?'):prompt('Could not find any tables with Go results ("'+e+'"). If you are confident that this page has one - please provide a specific selector to the element.'),void(i?o(i,t,!0):console.log("Could not find any elements with Go results."))}var c=0,g=0;n.forEach(function(e){if(e.goResultsHighlighter)return void(g+=1);var r=new s.default(e,t);r.clearInlineStyles(),c+=1}),console.log("Go Results Highlighter was applied to "+c+" DOM elements. "+g+" had Highlighter before.")}var i=e("./lib/wrapper"),s=n(i),a=e("./lib/utils");e("./styles/bookmark.less");var l=/^[^0-9]*([0-9]+[-+=?])[^-+?]*$/,u=/[0-9]+[-+?]/g;location.hostname.indexOf("europeangodatabase")!==-1?o("#tab_wallist",{placeColumn:1}):o("table, pre")},{"./lib/utils":6,"./lib/wrapper":7,"./styles/bookmark.less":8}],2:[function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){var r=e.getBoundingClientRect().top-t;Math.abs(r)>10&&window.scrollBy(0,r)}function s(e){for(var t={player:null,games:null,target:null};e&&e!==document;){var r=e.getAttribute(c.DOM_ATTRIBUTES.OPPONENT_PLACEMENT),n=e.getAttribute(c.DOM_ATTRIBUTES.PLAYER_PLACEMENT);if(r&&(t.games=Number(r)),n){t.player=Number(n);break}e=e.parentNode}return t.target=e,t}function a(e){e.filter(function(e){return e.row.properNextSibling}).reverse().forEach(function(e){e.row.properNextSibling===-1?e.row.parentNode.appendChild(e.row):e.row.parentNode.insertBefore(e.row,e.row.properNextSibling),e.row.properNextSibling=null})}function l(e,t){var r=e.row.parentNode,n=e.row.nextElementSibling;t.forEach(function(t){t.row.properNextSibling=t.row.nextElementSibling||-1,t.tournamentPlace<e.tournamentPlace?r.insertBefore(t.row,e.row):(r.insertBefore(t.row,n),n=t.row.nextElementSibling)})}Object.defineProperty(r,"__esModule",{value:!0});var u=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),c=e("./settings"),g=e("./parser"),f=n(g),p=e("./raw2table"),m=n(p),d=e("./utils"),h=function(){function e(t,r){if(o(this,e),this.settings=(0,d.defaults)(c.DEFAULT_SETTINGS,(0,c.readTableSettingsFromDOM)(t),r),t instanceof HTMLPreElement){var n=(0,m.default)(t.innerHTML,r),i=t.parentNode;i.insertBefore(n,t),i.removeChild(t),this.element=n}else this.element=t;this.element.classList&&(this.createPlayersMap(),this.bindEvents(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls),this.current=null,this.games=[],this.isRearranged=!1,this.isHighlighting=!1)}return u(e,[{key:"createPlayersMap",value:function(){this.map=(0,f.default)(this.element,this.settings),this.players=[];for(var e in this.map)this.map.hasOwnProperty(e)&&this.players.push(this.map[e])}},{key:"highlight",value:function(e){var t=this;e||(e={});var r=e.player,n=e.rearrange===!0,o=e.games,i=this.map[r],s=(0,c.toPrefixedClasses)(this.settings);this.isRearranged&&a(this.players),i&&n?(l(i,i.opponents.map(function(e){return t.map[e]})),this.element.classList.add(s.rearrangedCls),this.isRearranged=!0):(this.element.classList.remove(s.rearrangedCls),this.isRearranged=!1);var u=(0,d.asArray)(this.element.querySelectorAll("."+s.gameCls)),g=this.element.querySelector("."+s.currentCls),f=g?g.getAttribute(c.DOM_ATTRIBUTES.PLAYER_PLACEMENT):null,p=f?this.map[f]:null,m=function(e,r){var n=r?"add":"remove";e.row.classList[n](s.currentCls),e.opponents.forEach(function(r){var o=t.map[r];o.row.classList[n](t.settings.prefixCls+e.games[r].cls)})};u.forEach(function(e){e.classList.remove(s.gameCls)}),p&&p!==i&&m(p,!1),i&&i!==p&&m(i,!0),this.games.length=0,i?("number"==typeof o&&(o=[o]),o&&"number"==typeof o.length?o.forEach(function(e){var n=t.map[e],o=i.games[e];n&&o&&(o.cell.classList.add(s.gameCls),n.games[r].cell.classList.add(s.gameCls),t.games.push(e))}):this.isRearranged&&i.opponents.forEach(function(e){t.map[e].games[r].cell.classList.add(s.gameCls),t.games.push(e)}),this.current=r,this.isHighlighting=!0):(this.current=null,this.isHighlighting=!1)}},{key:"configure",value:function(e){this.highlight(null),this.element.classList.remove(this.settings.prefixCls+this.settings.tableCls),this.settings=(0,d.defaults)(this.settings,e),this.createPlayersMap(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls)}},{key:"bindEvents",value:function(){var e=this,t=!1;this.element.addEventListener("touchstart",function(){t=!1}),this.element.addEventListener("touchmove",function(){t=!0}),this.element.addEventListener("touchend",function(r){if(!(t||e.settings.rearranging===!1&&e.settings.hovering===!1)){var n=s(r.target),o=n.target,a=n.player,l=n.games;if(a){var u=!1,c=void 0;e.current===a?(e.settings.rearranging&&e.settings.hovering||(a=null),u=!e.isRearranged):!e.isRearranged&&e.settings.hovering||(u=!0),u&&(c=o.getBoundingClientRect().top),e.highlight({player:a,games:l,rearrange:u}),c&&i(o,c),r.preventDefault()}}}),this.element.addEventListener("click",function(t){if(e.settings.rearranging!==!1){var r=s(t.target),n=r.target,o=r.player,a=r.games,l=!1,u=void 0;o&&(!e.isRearranged||n.properNextSibling?l=!0:e.settings.hovering||(o=null),l&&(u=n.getBoundingClientRect().top),e.highlight({player:o,games:a,rearrange:l}),u&&i(n,u))}}),this.element.addEventListener("mouseover",function(t){if(e.settings.hovering!==!1){var r=s(t.target),n=r.player,o=r.games,i=e.isRearranged;if(n){if(e.isRearranged){if((!o||n!==e.current)&&e.games.length===e.map[e.current].opponents.length)return;n!==e.current&&(n=e.current,o=null)}e.highlight({player:n,rearrange:i,games:o})}}},!1),this.element.addEventListener("mouseout",function(t){if(e.settings.hovering!==!1){for(var r=t.relatedTarget;r&&r!==document&&r!==e.element;)r=r.parentNode;r!==e.element&&(e.isRearranged&&e.games.length!==e.map[e.current].opponents.length?e.highlight({player:e.current,rearrange:!0}):e.isRearranged||e.highlight(null))}},!1)}},{key:"clearInlineStyles",value:function(){this.players.forEach(function(e){(0,d.asArray)(e.row.childNodes).forEach(function(e){return e.removeAttribute("style")})})}}]),e}();r.default=h,h.DEFAULT_SETTINGS=c.DEFAULT_SETTINGS},{"./parser":3,"./raw2table":4,"./settings":5,"./utils":6}],3:[function(e,t,r){"use strict";function n(e,t){e.setAttribute(E.DOM_ATTRIBUTES.PLAYER_PLACEMENT,t)}function o(e,t){return e.reduce(function(e,r){return(0,h.asArray)(r.querySelectorAll(t)).forEach(function(t,r){var n=e[r];n||(n=[],e[r]=n),n.push(t.textContent)}),e},[])}function i(e,t){return e.filter(function(e){return t.some(function(t){return e.match(t.regexp)})})}function s(e,t){var r=e.length,n=i(e,t).length;return n/r>=.4}function a(e,t,r){return o(e,t).reduce(function(e,t,n){return s(t,r)&&e.push(n),e},[])}function l(e){return function(t,r){return e.indexOf(r)!==-1}}function u(e,t,r){if("string"==typeof t.roundsColumns){var n=t.roundsColumns.split(",").map(Number);return l(n)}if(!t.checkColumnsForResults)return function(){return!0};var o=a(e,t.cellTags,r);return l(o)}function c(e,t){var r=(0,E.nameHeadersToRegExp)(t.nameColumnHeaders),n=[],i=o(e,t.headerTags);return i.forEach(function(e,t){e.some(function(e){return r.some(function(t){return e.match(t)})})&&n.push(t)}),n}function g(e,t,r){r=r||.4;var n=e.length,o=e.filter(function(e){return t(e)}).length;return o/n>=r}function f(e,t){if(!t.nameCellExpression)return[];var r=new RegExp(t.nameCellExpression),n=function(e){return e.match(r)};return o(e,t.cellTags).reduce(function(e,t,r){return g(t,n)&&e.push(r),e},[])}function p(e,t){var r=[];return"string"==typeof t.nameColumns?r=t.nameColumns.split(",").map(Number):(0,h.isNumber)(t.nameColumns)?r.push(parseInt(t.nameColumns)):t.checkColumnsForPlayerNames&&(r=c(e,t),r&&0!=r.length||(r=f(e,t))),l(r)}function m(e,t,r,n){if(e.classList.add(n.tooltipCointainerCls),e.children&&!Array.from(e.children).some(function(e){return e.classList&&e.classList.contains(n.tooltiptextCls)})){var o=document.createElement("div");o.innerHTML=t,o.classList.add(n.tooltiptextCls,n.tooltiptextCls+"-"+r),e.appendChild(o)}}function d(e,t){function r(e,t,r,n){var o=n.displayOpponentNameHint,l=(0,E.toPrefixedClasses)(n);t.forEach(function(t){var u=void 0,c=void 0;if(t.hasAttribute(E.DOM_ATTRIBUTES.GAME_RESULT)&&t.hasAttribute(E.DOM_ATTRIBUTES.OPPONENT_PLACEMENT))u=Number(t.getAttribute(E.DOM_ATTRIBUTES.OPPONENT_PLACEMENT)),c=t.getAttribute(E.DOM_ATTRIBUTES.GAME_RESULT);else{for(var g=0;g<a;g++){var f=t.textContent.match(s[g].regexp);if(f){if(u=Number(f[1]),c=s[g].cls,u<=0||!n.ignoreOutOfBoundsRows&&u>i.length)return;t.setAttribute(E.DOM_ATTRIBUTES.OPPONENT_PLACEMENT,u),t.setAttribute(E.DOM_ATTRIBUTES.GAME_RESULT,s[g].cls)}}if(!u)return}if(e.games[u]={cell:t,cls:c},e.opponents.push(u),o){var p=r[u]?r[u].name:"";p&&m(t,p,c,l)}})}var o=(0,h.defaults)(E.DEFAULT_SETTINGS,t),i=(0,h.asArray)(e.querySelectorAll(o.rowTags)),s=(0,E.toResultsWithRegExp)(o.results),a=s.length,l=u(i,o,s),c=o.displayOpponentNameHint?p(i,o):function(e,t){return!1},g=[],f=void 0,d=void 0;return i.forEach(function(e,t){if(!(t<o.startingRow)){var r=(0,h.asArray)(e.querySelectorAll(o.cellTags)),i=r.filter(c),s=i.map(function(e){return e.textContent}).join(" "),a=-1;if(!r.length||!r[o.placeColumn])return void n(e,a);var l=parseInt(r[o.placeColumn].textContent,10),u={tournamentPlace:-1,row:e,games:{},opponents:[],name:s};if(e.hasAttribute(E.DOM_ATTRIBUTES.PLAYER_PLACEMENT))a=Number(e.getAttribute(E.DOM_ATTRIBUTES.PLAYER_PLACEMENT));else{if(d)a=d+1;else{if(isNaN(l))return void n(e,a);a=l||1}l?l<=f&&(l=f):l=f?f:1,n(e,a)}a!=-1&&(u.tournamentPlace=l,g[a]=u,f=l,d=a)}}),g.forEach(function(e){var t=(0,h.asArray)(e.row.querySelectorAll(o.cellTags)),n=t.filter(l);r(e,n,g,o),e.opponents.sort(function(e,t){return e>t?1:-1})}),(0,h.arrayToObject)(g)}Object.defineProperty(r,"__esModule",{value:!0}),r.default=d;var h=e("./utils"),E=e("./settings")},{"./settings":5,"./utils":6}],4:[function(e,t,r){"use strict";function n(e,t){var r=document.createElement("table");if(!e)return r;var n=(0,i.defaults)(o.DEFAULT_SETTINGS,t),s=e.replace(/<br[^>]*>/gi,"\n").replace(/<\/?code[^>]*>/gi,"").split(/\r\n|\n/);if(s.length<=2&&!s[0]&&!s[1])return r;var a=(0,o.toResultsWithRegExp)(n.results),l=a.length,u=s.map(function(e){return e.replace(/([0-9]+)\s(dan|kyu)/i,"$1_$2").split(new RegExp(n.cellSeparator)).filter(function(e){return e.length>0})}).filter(function(e){return e.length>0&&0!==e[0].indexOf(";")}),c=u.reduce(function(e,t){return Math.max(e,t.length)},0),g=n.joinNames?-1:0,f=n.placeColumn+1,p=null;"string"==typeof n.roundsColumns&&(p=n.roundsColumns.split(",").map(Number));var m=void 0;return u.forEach(function(e,t){var i=document.createElement("tr"),s=e.length;if(s){if(t<n.startingRow||s<c+g){var u=document.createElement("td");u.setAttribute("colspan",c+g),u.textContent=e.join(" "),i.setAttribute(o.DOM_ATTRIBUTES.PLAYER_PLACEMENT,-1),i.appendChild(u)}else{var d=parseInt(e[n.placeColumn],10);isNaN(d)&&!m?e.forEach(function(e){var t=document.createElement("td");t.textContent=e,i.setAttribute(o.DOM_ATTRIBUTES.PLAYER_PLACEMENT,-1),i.appendChild(t)}):!function(){i.setAttribute(o.DOM_ATTRIBUTES.PLAYER_PLACEMENT,m||d);var t=[];n.joinNames&&e.splice(f,2,e[f]+"  "+e[f+1]),e.forEach(function(e,r){var n=document.createElement("td");if(n.textContent=e.replace(/_/," "),!p||p.indexOf(r)>=0)for(var s=0;s<l;s++){var u=e.match(a[s].regexp);if(u){var c=u[1];t.push(c),n.setAttribute(o.DOM_ATTRIBUTES.OPPONENT_PLACEMENT,c),n.setAttribute(o.DOM_ATTRIBUTES.GAME_RESULT,a[s].cls)}}i.appendChild(n)}),t.length&&i.setAttribute(o.DOM_ATTRIBUTES.OPPONENTS,t.join(",")),m?m+=1:m=2}()}r.appendChild(i)}}),r.setAttribute(o.DOM_ATTRIBUTES.RESULT_TABLE,""),r}Object.defineProperty(r,"__esModule",{value:!0}),r.default=n;var o=e("./settings"),i=e("./utils")},{"./settings":5,"./utils":6}],5:[function(e,t,r){"use strict";function n(e){var t=[];for(var r in e)e.hasOwnProperty(r)&&t.push({cls:r,regexp:new RegExp(e[r])});return t}function o(e){return e&&0!=e.length?e.map(function(e){return new RegExp(e,"i")}):[]}function i(e){var t={};return a.forEach(function(r){t[r]=e.prefixCls+e[r]}),t}function s(e){var t={};return e.hasAttribute(l.SETTING_PLACE_COLUMN)&&(t.placeColumn=Number(e.getAttribute(l.SETTING_PLACE_COLUMN))),e.hasAttribute(l.SETTING_STARTING_ROW)&&(t.startingRow=Number(e.getAttribute(l.SETTING_STARTING_ROW))),e.hasAttribute(l.SETTING_ROUNDS_COLUMNS)&&(t.roundsColumns=e.getAttribute(l.SETTING_ROUNDS_COLUMNS)),e.hasAttribute(l.SETTING_REARRANGING)&&(t.rearranging="false"!==e.getAttribute(l.SETTING_REARRANGING)),e.hasAttribute(l.SETTING_HOVERING)&&(t.hovering="false"!==e.getAttribute(l.SETTING_HOVERING)),t}Object.defineProperty(r,"__esModule",{value:!0}),r.toResultsWithRegExp=n,r.nameHeadersToRegExp=o,r.toPrefixedClasses=i,r.readTableSettingsFromDOM=s;var a=(r.DEFAULT_SETTINGS={prefixCls:"go-results-",rearrangedCls:"rearranged",tableCls:"table",gameCls:"game",currentCls:"current",tooltipCointainerCls:"tooltip",tooltiptextCls:"tooltiptext",results:{won:"([0-9]+)\\+",lost:"([0-9]+)\\-",jigo:"([0-9]+)=",unresolved:"([0-9]+)\\?"},startingRow:0,placeColumn:0,roundsColumns:null,nameColumns:null,nameColumnHeaders:["name","player","gracz","imię"],nameCellExpression:"(?=^.*[A-Z][a-z]{3,})(?!.*([Kk][yy][uu]|[Dd][Aa][Nn]))",rowTags:"tr",cellTags:"td",headerTags:"th",ignoreOutOfBoundsRows:!1,checkColumnsForResults:!0,displayOpponentNameHint:!0,checkColumnsForPlayerNames:!0,cellSeparator:"[\t ]+",joinNames:!0,hovering:!0,rearranging:!0},["rearrangedCls","tableCls","gameCls","currentCls","tooltipCointainerCls","tooltiptextCls"]),l=r.DOM_ATTRIBUTES={RESULT_TABLE:"data-go-results",SETTING_STARTING_ROW:"data-go-starting-row",SETTING_PLACE_COLUMN:"data-go-place-column",SETTING_ROUNDS_COLUMNS:"data-go-rounds-columns",SETTING_REARRANGING:"data-go-rearranging",SETTING_HOVERING:"data-go-hovering",PLAYER_PLACEMENT:"data-go-place",OPPONENT_PLACEMENT:"data-go-opponent",OPPONENT_NAME:"data-go-name",OPPONENTS:"data-go-opponents",GAME_RESULT:"data-go-result"}},{}],6:[function(e,t,r){"use strict";function n(e){return Array.prototype.slice.call(e)}function o(e){for(var t=arguments.length,r=Array(t>1?t-1:0),n=1;n<t;n++)r[n-1]=arguments[n];var o=r.filter(function(e){return"object"===("undefined"==typeof e?"undefined":l(e))}).reverse(),i=o.length,s={};e:for(var a in e){for(var u=0;u<i;u++)if(o[u].hasOwnProperty(a)){s[a]=o[u][a];continue e}s[a]=e[a]}return s}function i(){for(var e={},t=arguments.length,r=Array(t),n=0;n<t;n++)r[n]=arguments[n];return r.forEach(function(t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])}),e}function s(e){return!isNaN(parseFloat(e))&&isFinite(e)}function a(e){for(var t={},r=0;r<e.length;r++)void 0!==e[r]&&(t[r]=e[r]);return t}Object.defineProperty(r,"__esModule",{value:!0});var l="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e};r.asArray=n,r.defaults=o,r.combine=i,r.isNumber=s,r.arrayToObject=a},{}],7:[function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(this instanceof o))return new o(e,t);var r=new l.default(e,t);this.highlight=function(e,t,n){"object"===("undefined"==typeof e?"undefined":s(e))?r.highlight(e):("boolean"==typeof t&&(n=t,t=null),r.highlight({player:e,rearrange:n,games:t}))},this.configure=function(e){r.configure(e)},this.opponents=function(e){var t=r.map[e];return t?t.opponents.slice():[]},this.clearInlineStyles=function(){r.clearInlineStyles()},Object.defineProperties(this,{element:i(function(){return r.element}),isHighlighting:i(function(){return r.isHighlighting}),isRearranged:i(function(){return r.isRearranged}),player:i(function(){return r.current||null}),players:i(function(){return r.players.length}),games:i(function(){return r.games}),configuration:i(function(){var e=r.settings.results,t={};for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return{startingRow:r.settings.startingRow,placeColumn:r.settings.placeColumn,roundsColumns:r.settings.roundsColumns,prefixCls:r.settings.prefixCls,rearrangedCls:r.settings.rearrangedCls,tableCls:r.settings.tableCls,gameCls:r.settings.gameCls,currentCls:r.settings.currentCls,rowTags:r.settings.rowTags,cellTags:r.settings.cellTags,cellSeparator:r.settings.cellSeparator,joinNames:r.settings.joinNames,ignoreOutOfBoundsRows:r.settings.ignoreOutOfBoundsRows,checkColumnsForResults:r.settings.checkColumnsForResults,results:t}}),rearranging:{set:function(e){!e&&r.isRearranged&&r.highlight(null),r.settings.rearranging=!!e},get:function(){return r.settings.rearranging},configurable:!1,enumerable:!0},hovering:{set:function(e){return r.settings.hovering=!!e},get:function(){return r.settings.hovering},configurable:!1,enumerable:!0}}),r.element.goResultsHighlighter=this}function i(e){return{get:e,enumerable:!0,configurable:!1}}Object.defineProperty(r,"__esModule",{value:!0});var s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol?"symbol":typeof e},a=e("./highlighter"),l=n(a);r.default=o},{"./highlighter":2}],8:[function(e,t,r){!function(){var e=document.getElementsByTagName("head")[0],t=document.createElement("style");t.type="text/css";var r=".go-results-rearranged{color:#dddddd !important;cursor:pointer !important}.go-results-current{background-color:#d2d2d2 !important;color:#000000 !important;cursor:pointer !important}.go-results-current .go-results-game{background-color:#a7a7a7 !important}.go-results-won{background-color:#799B29 !important;color:#000000 !important}.go-results-won .go-results-game{background-color:#5A6A2C !important;color:#ffffff !important}.go-results-lost{background-color:#D97962 !important;color:#000000 !important}.go-results-lost .go-results-game{background-color:#A5422B !important;color:#ffffff !important}.go-results-jigo{background-color:#D7C3D1 !important;color:#000000 !important}.go-results-jigo .go-results-game{background-color:#9E7593 !important}.go-results-unresolved{background-color:#CBDCE5 !important;color:#000000 !important}.go-results-unresolved .go-results-game{background-color:#7D9CAD !important}.go-results-tooltip{position:relative !important}.go-results-tooltiptext{visibility:hidden !important;width:120px !important;text-align:center !important;padding:5px 0 !important;border-radius:6px !important;border:2px solid #000000 !important;position:absolute !important;z-index:1 !important}.go-results-tooltiptextwon{background-color:#799B29 !important;color:#000000 !important}.go-results-tooltiptextlost{background-color:#D97962 !important;color:#000000 !important}.go-results-tooltiptextjigo{background-color:#D7C3D1 !important;color:#000000 !important}.go-results-tooltiptextunresolved{background-color:#CBDCE5 !important;color:#000000 !important}.go-results-tooltip:hover .go-results-tooltiptext{visibility:visible !important}";t.styleSheet?t.styleSheet.cssText=r:t.appendChild(document.createTextNode(r)),e.appendChild(t)}()},{}]},{},[1]);