(()=>{"use strict";var e={192:(e,t,n)=>{n.d(t,{c:()=>a});var r=n(500),s=n.n(r),o=n(312),i=n.n(o)()(s());i.push([e.id,"[data-go-results].go-results-rearranged [data-go-place]{opacity:.2;cursor:pointer}[data-go-results] .go-results-current[data-go-place]{background-color:#d2d2d2;color:#000;cursor:pointer;opacity:1}[data-go-results] .go-results-current[data-go-place] .go-results-game{background-color:#a7a7a7}[data-go-results] .go-results-won[data-go-place]{background-color:#799b29;color:#000;opacity:1}[data-go-results] .go-results-won[data-go-place] .go-results-game{background-color:#5a6a2c;color:#fff}[data-go-results] .go-results-lost[data-go-place]{background-color:#d97962;color:#000;opacity:1}[data-go-results] .go-results-lost[data-go-place] .go-results-game{background-color:#a5422b;color:#fff}[data-go-results] .go-results-jigo[data-go-place]{background-color:#d7c3d1;color:#000;opacity:1}[data-go-results] .go-results-jigo[data-go-place] .go-results-game{background-color:#9e7593}[data-go-results] .go-results-unresolved{background-color:#cbdce5;color:#000}[data-go-results] .go-results-unresolved .go-results-game{background-color:#7d9cad}",""]);const a=i},312:e=>{e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n="",r=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),r&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),r&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n})).join("")},t.i=function(e,n,r,s,o){"string"==typeof e&&(e=[[null,e,void 0]]);var i={};if(r)for(var a=0;a<this.length;a++){var l=this[a][0];null!=l&&(i[l]=!0)}for(var c=0;c<e.length;c++){var u=[].concat(e[c]);r&&i[u[0]]||(void 0!==o&&(void 0===u[5]||(u[1]="@layer".concat(u[5].length>0?" ".concat(u[5]):""," {").concat(u[1],"}")),u[5]=o),n&&(u[2]?(u[1]="@media ".concat(u[2]," {").concat(u[1],"}"),u[2]=n):u[2]=n),s&&(u[4]?(u[1]="@supports (".concat(u[4],") {").concat(u[1],"}"),u[4]=s):u[4]="".concat(s)),t.push(u))}},t}},500:e=>{e.exports=function(e){return e[1]}},596:e=>{var t=[];function n(e){for(var n=-1,r=0;r<t.length;r++)if(t[r].identifier===e){n=r;break}return n}function r(e,r){for(var o={},i=[],a=0;a<e.length;a++){var l=e[a],c=r.base?l[0]+r.base:l[0],u=o[c]||0,g="".concat(c," ").concat(u);o[c]=u+1;var h=n(g),p={css:l[1],media:l[2],sourceMap:l[3],supports:l[4],layer:l[5]};if(-1!==h)t[h].references++,t[h].updater(p);else{var d=s(p,r);r.byIndex=a,t.splice(a,0,{identifier:g,updater:d,references:1})}i.push(g)}return i}function s(e,t){var n=t.domAPI(t);return n.update(e),function(t){if(t){if(t.css===e.css&&t.media===e.media&&t.sourceMap===e.sourceMap&&t.supports===e.supports&&t.layer===e.layer)return;n.update(e=t)}else n.remove()}}e.exports=function(e,s){var o=r(e=e||[],s=s||{});return function(e){e=e||[];for(var i=0;i<o.length;i++){var a=n(o[i]);t[a].references--}for(var l=r(e,s),c=0;c<o.length;c++){var u=n(o[c]);0===t[u].references&&(t[u].updater(),t.splice(u,1))}o=l}}},176:e=>{var t={};e.exports=function(e,n){var r=function(e){if(void 0===t[e]){var n=document.querySelector(e);if(window.HTMLIFrameElement&&n instanceof window.HTMLIFrameElement)try{n=n.contentDocument.head}catch(e){n=null}t[e]=n}return t[e]}(e);if(!r)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");r.appendChild(n)}},808:e=>{e.exports=function(e){var t=document.createElement("style");return e.setAttributes(t,e.attributes),e.insert(t,e.options),t}},120:(e,t,n)=>{e.exports=function(e){var t=n.nc;t&&e.setAttribute("nonce",t)}},520:e=>{e.exports=function(e){if("undefined"==typeof document)return{update:function(){},remove:function(){}};var t=e.insertStyleElement(e);return{update:function(n){!function(e,t,n){var r="";n.supports&&(r+="@supports (".concat(n.supports,") {")),n.media&&(r+="@media ".concat(n.media," {"));var s=void 0!==n.layer;s&&(r+="@layer".concat(n.layer.length>0?" ".concat(n.layer):""," {")),r+=n.css,s&&(r+="}"),n.media&&(r+="}"),n.supports&&(r+="}");var o=n.sourceMap;o&&"undefined"!=typeof btoa&&(r+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(o))))," */")),t.styleTagTransform(r,e,t.options)}(t,e,n)},remove:function(){!function(e){if(null===e.parentNode)return!1;e.parentNode.removeChild(e)}(t)}}}},936:e=>{e.exports=function(e,t){if(t.styleSheet)t.styleSheet.cssText=e;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(e))}}}},t={};function n(r){var s=t[r];if(void 0!==s)return s.exports;var o=t[r]={id:r,exports:{}};return e[r](o,o.exports,n),o.exports}n.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return n.d(t,{a:t}),t},n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),n.nc=void 0,(()=>{const e={prefixCls:"go-results-",rearrangedCls:"rearranged",tableCls:"table",gameCls:"game",currentCls:"current",results:{won:"([0-9]+)\\+",lost:"([0-9]+)\\-",jigo:"([0-9]+)=",unresolved:"([0-9]+)\\?"},startingRow:0,placeColumn:null,roundsColumns:null,rowTags:"tr",cellTags:"td",ignoreOutOfBoundsRows:!1,checkColumnsForResults:!0,cellSeparator:"[\t ]+",joinNames:!0,hovering:!0,rearranging:!0},t=["rearrangedCls","tableCls","gameCls","currentCls"],r={RESULT_TABLE:"data-go-results",SETTING_STARTING_ROW:"data-go-starting-row",SETTING_PLACE_COLUMN:"data-go-place-column",SETTING_ROUNDS_COLUMNS:"data-go-rounds-columns",SETTING_REARRANGING:"data-go-rearranging",SETTING_HOVERING:"data-go-hovering",PLAYER_PLACEMENT:"data-go-place",OPPONENT_PLACEMENT:"data-go-opponent",OPPONENTS:"data-go-opponents",GAME_RESULT:"data-go-result"};function s(e){const t=[];for(let n in e)e.hasOwnProperty(n)&&t.push({cls:n,regexp:new RegExp(e[n])});return t}function o(e){return Array.prototype.slice.call(e)}function i(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];const s=n.filter((e=>"object"==typeof e)).reverse(),o=s.length,i={};e:for(let t in e){for(let e=0;e<o;e++)if(s[e].hasOwnProperty(t)){i[t]=s[e][t];continue e}i[t]=e[t]}return i}const a=.4;function l(e,t){e.setAttribute(r.PLAYER_PLACEMENT,t)}function c(e){const t=[];for(let n=0;n<e.length;n++)for(let r=0;r<e[n].cells.length;r++)t[r]||(t[r]=[]),t[r][n]=e[n].cells[r].textContent;return t}function u(e){const t=Number(e);return!isNaN(t)&&t>0}function g(e){return e&&String(e).length>0}function h(e){return(t,n)=>-1!==e.indexOf(n)}function p(t,n){const p=i(e,n),d=s(p.results),f=d.length,m=function(e,t){const n=e.querySelectorAll(t.rowTags),r=new Array(n.length);for(let e=0;e<n.length;e++){const s=n[e],i=s.querySelectorAll(t.cellTags);r[e]={row:s,cells:o(i)}}return r}(t,p),E=function(e,t,n){return"string"==typeof t.roundsColumns?h(t.roundsColumns.split(",").map(Number)):t.checkColumnsForResults?h(function(e,t){return c(e).reduce(((e,n,r)=>(function(e,t){const n=e.filter(g).length,r=function(e,t){return e.filter((e=>t.some((t=>e.match(t.regexp)))))}(e,t).length;return r/n>=a}(n,t)&&e.push(r),e)),[])}(e,n)):()=>!0}(m,p,d),C=function(e,t){if("number"==typeof t.placeColumn)return t.placeColumn;const n=c(e).findIndex((e=>{const t=e.filter(g).length;return e.filter(u).length/t>=a}));return Math.max(n,0)}(m,p),b={};let N,T;return m.forEach((function(e,t){let{row:n,cells:s}=e;if(t<p.startingRow)return;let o=-1;if(!s.length||!s[C])return void l(n,o);let i=parseInt(s[C].textContent,10);const a={tournamentPlace:-1,row:n,games:[],opponents:[],opponentsCls:{}};if(n.hasAttribute(r.PLAYER_PLACEMENT))o=Number(n.getAttribute(r.PLAYER_PLACEMENT));else{if(T)o=T+1;else{if(isNaN(i))return void l(n,o);o=i||1}i?i<=N&&(i=N):i=N||1,l(n,o)}-1!==Number(o)&&(a.gridPlacement=o,a.tournamentPlace=i,s.forEach(((e,t)=>{E(e,t)&&function(e,t,n){let s,o;if(t.hasAttribute(r.GAME_RESULT)&&t.hasAttribute(r.OPPONENT_PLACEMENT))s=Number(t.getAttribute(r.OPPONENT_PLACEMENT)),o=t.getAttribute(r.GAME_RESULT);else{for(let e=0;e<f;e++){let n=t.textContent.match(d[e].regexp);if(n){if(s=Number(n[1]),o=d[e].cls,s<=0||!p.ignoreOutOfBoundsRows&&s>m.length)return;t.setAttribute(r.OPPONENT_PLACEMENT,s),t.setAttribute(r.GAME_RESULT,d[e].cls)}}if(!s)return}t.highlighterGame={player:e.gridPlacement,opponent:s,row:e.row,column:n},e.games.push({cell:t,index:n,opponentPlace:s,cls:o}),e.opponentsCls[s]=o,e.opponents.push(s)}(a,e,t)})),a.index=t,a.opponents.sort(((e,t)=>e-t)),b[o]=a,N=i,T=o)})),b}class d{constructor(t,n){if(this.settings=i(e,function(e){const t={};return"function"!=typeof e.hasAttribute||(e.hasAttribute(r.SETTING_PLACE_COLUMN)&&(t.placeColumn=Number(e.getAttribute(r.SETTING_PLACE_COLUMN))),e.hasAttribute(r.SETTING_STARTING_ROW)&&(t.startingRow=Number(e.getAttribute(r.SETTING_STARTING_ROW))),e.hasAttribute(r.SETTING_ROUNDS_COLUMNS)&&(t.roundsColumns=e.getAttribute(r.SETTING_ROUNDS_COLUMNS)),e.hasAttribute(r.SETTING_REARRANGING)&&(t.rearranging="false"!==e.getAttribute(r.SETTING_REARRANGING)),e.hasAttribute(r.SETTING_HOVERING)&&(t.hovering="false"!==e.getAttribute(r.SETTING_HOVERING))),t}(t),n),t instanceof HTMLPreElement||t instanceof Text){let o=function(t,n){const o=document.createElement("table");if(!t)return o;const a=i(e,n),l=t.replace(/<br[^>]*>/gi,"\n").replace(/<\/?code[^>]*>/gi,"").split(/\r\n|\n/);if(l.length<=2&&!l[0]&&!l[1])return o;const c=s(a.results),u=c.length,g=l.map((e=>e.replace(/([0-9]+)\s(dan|kyu)/i,"$1_$2").split(new RegExp(a.cellSeparator)).filter((e=>e.length>0)))).filter((e=>e.length>0&&0!==e[0].indexOf(";"))),h=g.reduce(((e,t)=>Math.max(e,t.length)),0),p=a.placeColumn||0,d=a.joinNames?-1:0,f=p+1;let m,E=null;return"string"==typeof a.roundsColumns&&(E=a.roundsColumns.split(",").map(Number)),g.forEach(((e,t)=>{const n=document.createElement("tr"),s=e.length;if(s){if(t<a.startingRow||s<h+d){let t=document.createElement("td");t.setAttribute("colspan",h+d),t.textContent=e.join(" "),n.setAttribute(r.PLAYER_PLACEMENT,-1),n.appendChild(t)}else{const t=parseInt(e[p],10);if(isNaN(t)&&!m)e.forEach((e=>{let t=document.createElement("td");t.textContent=e,n.setAttribute(r.PLAYER_PLACEMENT,-1),n.appendChild(t)}));else{n.setAttribute(r.PLAYER_PLACEMENT,m||t);let s=[];a.joinNames&&e.splice(f,2,"".concat(e[f],"  ").concat(e[f+1])),e.forEach(((e,t)=>{let o=document.createElement("td");if(o.textContent=e.replace(/_/," "),!E||E.indexOf(t)>=0)for(let t=0;t<u;t++){let n=e.match(c[t].regexp);if(!n)continue;let i=n[1];s.push(i),o.setAttribute(r.OPPONENT_PLACEMENT,i),o.setAttribute(r.GAME_RESULT,c[t].cls)}n.appendChild(o)})),s.length&&n.setAttribute(r.OPPONENTS,s.join(",")),m?m+=1:m=2}}o.appendChild(n)}})),o.setAttribute(r.RESULT_TABLE,""),o}(t.textContent,n),a=t.parentNode;a.insertBefore(o,t),a.removeChild(t),this.element=o}else this.element=t;this.element.classList&&(this.createPlayersMap(),this.bindEvents(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls),this.element.setAttribute(r.RESULT_TABLE,""),this.current=null,this.games=[],this.isRearranged=!1,this.isHighlighting=!1)}createPlayersMap(){this.map=p(this.element,this.settings),this.players=[];for(let e in this.map)this.map.hasOwnProperty(e)&&this.players.push(this.map[e])}highlight(e){e||(e={});let n=e.player,s=!0===e.rearrange,i=e.games;const a=this.map[n],l=function(e){let n={};return t.forEach((t=>{n[t]=e.prefixCls+e[t]})),n}(this.settings);this.isRearranged&&this.players.forEach((e=>{const t=e.row.parentNode.children[e.index];t!==e.row&&e.row.parentNode.insertBefore(e.row,t),e.rearranged=!1})),a&&s?(function(e,t){const n=e.row.parentNode;let r=e.row.nextElementSibling;for(let s=0;s<t.length;s++){const o=t[s];o.index<e.index?n.insertBefore(o.row,e.row):(n.insertBefore(o.row,r),r=o.row.nextElementSibling),o.rearranged=!0}}(a,a.opponents.map((e=>this.map[e]))),this.element.classList.add(l.rearrangedCls),this.isRearranged=!0):(this.element.classList.remove(l.rearrangedCls),this.isRearranged=!1);const c=o(this.element.querySelectorAll("."+l.gameCls)),u=this.element.querySelector("."+l.currentCls),g=u?u.getAttribute(r.PLAYER_PLACEMENT):null,h=g?this.map[g]:null,p=(e,t)=>{const n=t?"add":"remove";e.row.classList[n](l.currentCls),e.opponents.forEach((t=>{const r=this.map[t];r&&r.row.classList[n](this.settings.prefixCls+e.opponentsCls[t])}))};if(c.forEach((e=>{e.classList.remove(l.gameCls)})),h&&h!==a&&p(h,!1),a&&a!==h&&p(a,!0),this.games.length=0,a){if("number"==typeof i&&(i=[i]),i&&"number"==typeof i.length){for(const t of a.games)if(i.includes(t.opponentPlace)&&(!e.column||e.column===t.index)){const e=E(this.map[t.opponentPlace],t);if(!e)continue;t.cell.classList.add(l.gameCls),e.cell.classList.add(l.gameCls),this.games.push(t.opponentPlace)}}else if(this.isRearranged)for(const e of a.games){const t=E(this.map[e.opponentPlace],e);t&&(t.cell.classList.add(l.gameCls),this.games.push(e.opponentPlace))}this.games.sort(),this.current=n,this.isHighlighting=!0}else this.current=null,this.isHighlighting=!1}configure(e){this.highlight(null),this.element.classList.remove(this.settings.prefixCls+this.settings.tableCls),this.settings=i(this.settings,e),this.createPlayersMap(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls)}bindEvents(){let e=!1,t=!1;this.element.addEventListener("touchstart",(()=>{e=!1})),this.element.addEventListener("touchmove",(()=>{e=!0})),this.element.addEventListener("touchend",(n=>{if(e||!1===this.settings.rearranging&&!1===this.settings.hovering)return;let{target:r,player:s,games:o}=m(n.target,this.element);if(!s)return;let i,a=!1;this.current===s?(this.settings.rearranging&&this.settings.hovering||(s=null),a=!this.isRearranged):!this.isRearranged&&this.settings.hovering||(a=!0),a&&(i=r.getBoundingClientRect().top),this.highlight({player:s,games:o,rearrange:a}),i&&f(r,i),t=!0})),this.element.addEventListener("click",(e=>{if(t)return void(t=!1);if(!1===this.settings.rearranging)return;let n,{target:r,player:s,games:o}=m(e.target,this.element),i=!1;s&&(!this.isRearranged||this.map[s]&&this.map[s].rearranged?i=!0:this.settings.hovering||(s=null),n=r.getBoundingClientRect().top,this.highlight({player:s,games:o,rearrange:i}),n&&f(r,n))})),this.element.addEventListener("mouseover",(e=>{if(!1===this.settings.hovering)return;let{player:t,games:n,column:r}=m(e.target,this.element),s=this.isRearranged;if(t){if(this.isRearranged){if((!n||t!==this.current)&&this.games.length===this.map[this.current].opponents.length)return;t!==this.current&&(t=this.current,n=null)}this.highlight({player:t,rearrange:s,games:n,column:r})}}),!1),this.element.addEventListener("mouseout",(e=>{if(!1===this.settings.hovering)return;let t=e.relatedTarget;for(;t&&t!==document&&t!==this.element;)t=t.parentNode;t!==this.element&&(this.isRearranged&&this.games.length!==this.map[this.current].opponents.length?this.highlight({player:this.current,rearrange:!0}):this.isRearranged||this.highlight(null))}),!1)}clearInlineStyles(){this.players.forEach((e=>{o(e.row.childNodes).filter((e=>e.nodeType===Node.ELEMENT_NODE)).forEach((e=>e.removeAttribute("style")))}))}}function f(e,t){let n=e.getBoundingClientRect().top-t;Math.abs(n)>10&&window.scrollBy(0,n)}function m(e,t){const n={player:null,games:null,target:null};for(;e&&e!==document&&e!==t;){if(e.highlighterGame)return{player:e.highlighterGame.player,games:e.highlighterGame.opponent,target:e.highlighterGame.row,column:e.highlighterGame.column};let t=e.getAttribute(r.OPPONENT_PLACEMENT),s=e.getAttribute(r.PLAYER_PLACEMENT);if(t&&(n.games=Number(t)),s){n.player=Number(s);break}e=e.parentNode}return n.target=e,n}function E(e,t){let n,r=null;for(const s of e.games){const e=Math.abs(t.index-s.index);(!r||e<n)&&(r=s,n=e)}return r}function C(e,t){if(!e)return;if(!(this instanceof C))return new C(e,t);const n=new d(e,t);this.highlight=(e,t,r)=>{"object"==typeof e?n.highlight(e):("boolean"==typeof t&&(r=t,t=null),n.highlight({player:e,rearrange:r,games:t}))},this.configure=e=>{n.configure(e)},this.opponents=e=>{const t=n.map[e];return t?t.opponents.slice():[]},this.clearInlineStyles=()=>{n.clearInlineStyles()},Object.defineProperties(this,{element:b((()=>n.element)),isHighlighting:b((()=>n.isHighlighting)),isRearranged:b((()=>n.isRearranged)),player:b((()=>n.current||null)),players:b((()=>n.players.length)),games:b((()=>n.games)),configuration:b((()=>{const e=n.settings.results,t={};for(let n in e)e.hasOwnProperty(n)&&(t[n]=e[n]);return{startingRow:n.settings.startingRow,placeColumn:n.settings.placeColumn,roundsColumns:n.settings.roundsColumns,prefixCls:n.settings.prefixCls,rearrangedCls:n.settings.rearrangedCls,tableCls:n.settings.tableCls,gameCls:n.settings.gameCls,currentCls:n.settings.currentCls,rowTags:n.settings.rowTags,cellTags:n.settings.cellTags,cellSeparator:n.settings.cellSeparator,joinNames:n.settings.joinNames,ignoreOutOfBoundsRows:n.settings.ignoreOutOfBoundsRows,checkColumnsForResults:n.settings.checkColumnsForResults,results:t}})),rearranging:{set:e=>{!e&&n.isRearranged&&n.highlight(null),n.settings.rearranging=!!e},get:()=>n.settings.rearranging,configurable:!1,enumerable:!0},hovering:{set:e=>n.settings.hovering=!!e,get:()=>n.settings.hovering,configurable:!1,enumerable:!0}}),n.element.goResultsHighlighter=this}function b(e){return{get:e,enumerable:!0,configurable:!1}}d.DEFAULT_SETTINGS=e;var N=n(596),T=n.n(N),y=n(520),A=n.n(y),v=n(176),R=n.n(v),L=n(120),P=n.n(L),w=n(808),S=n.n(w),x=n(936),O=n.n(x),_=n(192),M={};M.styleTagTransform=O(),M.setAttributes=P(),M.insert=R().bind(null,"head"),M.domAPI=A(),M.insertStyleElement=S(),T()(_.c,M),_.c&&_.c.locals&&_.c.locals;const G=/^[^0-9]*([0-9]+[-+=?])[^-+?]*$/,I=/[0-9]+[-+?]/g;function U(e,t,n){const r=o(document.querySelectorAll(e)).filter((e=>{if(n)return!0;if("TABLE"===e.nodeName){const t=e.rows.length;for(let n=0;n<t;n++){const t=e.rows[n].cells.length;for(let r=0;r<t;r++)if(G.test(e.rows[n].cells[r].textContent))return!0}return!1}const t=e.textContent.match(I);return t&&t.length>6}));if(!r.length){let r;return r=n?prompt('Could not find any elements matching "'.concat(e,'" selector. Do you want to provide another one?')):prompt('Could not find any tables with Go results ("'.concat(e,'"). If you are confident that this page has one - please provide a specific selector to the element.')),void(r?U(r,t,!0):console.log("Could not find any elements with Go results."))}let s=0,i=0;r.forEach((e=>{e.goResultsHighlighter?i+=1:(new C(e,t).clearInlineStyles(),s+=1)})),console.log("Go Results Highlighter was applied to ".concat(s," DOM elements. ").concat(i," had Highlighter before."))}-1!==location.hostname.indexOf("europeangodatabase")?U("#tab_wallist",{placeColumn:1}):U("table, pre")})()})();