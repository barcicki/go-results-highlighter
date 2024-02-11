!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.GoResultsHighlighter=t():e.GoResultsHighlighter=t()}(this,(()=>(()=>{"use strict";var e={};const t={prefixCls:"go-results-",rearrangedCls:"rearranged",tableCls:"table",gameCls:"game",currentCls:"current",results:{won:"([0-9]+)\\+",lost:"([0-9]+)\\-",jigo:"([0-9]+)=",unresolved:"([0-9]+)\\?"},startingRow:0,placeColumn:null,roundsColumns:null,rowTags:"tr",cellTags:"td",ignoreOutOfBoundsRows:!1,checkColumnsForResults:!0,cellSeparator:"[\t ]+",joinNames:!0,hovering:!0,rearranging:!0},s=["rearrangedCls","tableCls","gameCls","currentCls"],n={RESULT_TABLE:"data-go-results",SETTING_STARTING_ROW:"data-go-starting-row",SETTING_PLACE_COLUMN:"data-go-place-column",SETTING_ROUNDS_COLUMNS:"data-go-rounds-columns",SETTING_REARRANGING:"data-go-rearranging",SETTING_HOVERING:"data-go-hovering",PLAYER_PLACEMENT:"data-go-place",OPPONENT_PLACEMENT:"data-go-opponent",OPPONENTS:"data-go-opponents",GAME_RESULT:"data-go-result"};function r(e){const t=[];for(let s in e)e.hasOwnProperty(s)&&t.push({cls:s,regexp:new RegExp(e[s])});return t}function o(e){return Array.prototype.slice.call(e)}function l(e){for(var t=arguments.length,s=new Array(t>1?t-1:0),n=1;n<t;n++)s[n-1]=arguments[n];const r=s.filter((e=>"object"==typeof e)).reverse(),o=r.length,l={};e:for(let t in e){for(let e=0;e<o;e++)if(r[e].hasOwnProperty(t)){l[t]=r[e][t];continue e}l[t]=e[t]}return l}const i=.4;function a(e,t){e.setAttribute(n.PLAYER_PLACEMENT,t)}function g(e){const t=[];for(let s=0;s<e.length;s++)for(let n=0;n<e[s].cells.length;n++)t[n]||(t[n]=[]),t[n][s]=e[s].cells[n].textContent;return t}function u(e){const t=Number(e);return!isNaN(t)&&t>0}function c(e){return e&&String(e).length>0}function h(e){return(t,s)=>-1!==e.indexOf(s)}function d(e,s){const d=l(t,s),p=r(d.results),m=p.length,f=function(e,t){const s=e.querySelectorAll(t.rowTags),n=new Array(s.length);for(let e=0;e<s.length;e++){const r=s[e],l=r.querySelectorAll(t.cellTags);n[e]={row:r,cells:o(l)}}return n}(e,d),E=function(e,t,s){return"string"==typeof t.roundsColumns?h(t.roundsColumns.split(",").map(Number)):t.checkColumnsForResults?h(function(e,t){return g(e).reduce(((e,s,n)=>(function(e,t){const s=e.filter(c).length,n=function(e,t){return e.filter((e=>t.some((t=>e.match(t.regexp)))))}(e,t).length;return n/s>=i}(s,t)&&e.push(n),e)),[])}(e,s)):()=>!0}(f,d,p),N=function(e,t){if("number"==typeof t.placeColumn)return t.placeColumn;const s=g(e).findIndex((e=>{const t=e.filter(c).length;return e.filter(u).length/t>=i}));return Math.max(s,0)}(f,d),C={};let b,T;return f.forEach((function(e,t){let{row:s,cells:r}=e;if(t<d.startingRow)return;let o=-1;if(!r.length||!r[N])return void a(s,o);let l=parseInt(r[N].textContent,10);const i={tournamentPlace:-1,row:s,games:[],opponents:[],opponentsCls:{}};if(s.hasAttribute(n.PLAYER_PLACEMENT))o=Number(s.getAttribute(n.PLAYER_PLACEMENT));else{if(T)o=T+1;else{if(isNaN(l))return void a(s,o);o=l||1}l?l<=b&&(l=b):l=b||1,a(s,o)}-1!==Number(o)&&(i.gridPlacement=o,i.tournamentPlace=l,r.forEach(((e,t)=>{E(e,t)&&function(e,t,s){let r,o;if(t.hasAttribute(n.GAME_RESULT)&&t.hasAttribute(n.OPPONENT_PLACEMENT))r=Number(t.getAttribute(n.OPPONENT_PLACEMENT)),o=t.getAttribute(n.GAME_RESULT);else{for(let e=0;e<m;e++){let s=t.textContent.match(p[e].regexp);if(s){if(r=Number(s[1]),o=p[e].cls,r<=0||!d.ignoreOutOfBoundsRows&&r>f.length)return;t.setAttribute(n.OPPONENT_PLACEMENT,r),t.setAttribute(n.GAME_RESULT,p[e].cls)}}if(!r)return}t.highlighterGame={player:e.gridPlacement,opponent:r,row:e.row,column:s},e.games.push({cell:t,index:s,opponentPlace:r,cls:o}),e.opponentsCls[r]=o,e.opponents.push(r)}(i,e,t)})),i.index=t,i.opponents.sort(((e,t)=>e-t)),C[o]=i,b=l,T=o)})),C}class p{constructor(e,s){if(this.settings=l(t,function(e){const t={};return"function"!=typeof e.hasAttribute||(e.hasAttribute(n.SETTING_PLACE_COLUMN)&&(t.placeColumn=Number(e.getAttribute(n.SETTING_PLACE_COLUMN))),e.hasAttribute(n.SETTING_STARTING_ROW)&&(t.startingRow=Number(e.getAttribute(n.SETTING_STARTING_ROW))),e.hasAttribute(n.SETTING_ROUNDS_COLUMNS)&&(t.roundsColumns=e.getAttribute(n.SETTING_ROUNDS_COLUMNS)),e.hasAttribute(n.SETTING_REARRANGING)&&(t.rearranging="false"!==e.getAttribute(n.SETTING_REARRANGING)),e.hasAttribute(n.SETTING_HOVERING)&&(t.hovering="false"!==e.getAttribute(n.SETTING_HOVERING))),t}(e),s),e instanceof HTMLPreElement||e instanceof Text){let o=function(e,s){const o=document.createElement("table");if(!e)return o;const i=l(t,s),a=e.replace(/<br[^>]*>/gi,"\n").replace(/<\/?code[^>]*>/gi,"").split(/\r\n|\n/);if(a.length<=2&&!a[0]&&!a[1])return o;const g=r(i.results),u=g.length,c=a.map((e=>e.replace(/([0-9]+)\s(dan|kyu)/i,"$1_$2").split(new RegExp(i.cellSeparator)).filter((e=>e.length>0)))).filter((e=>e.length>0&&0!==e[0].indexOf(";"))),h=c.reduce(((e,t)=>Math.max(e,t.length)),0),d=i.placeColumn||0,p=i.joinNames?-1:0,m=d+1;let f,E=null;return"string"==typeof i.roundsColumns&&(E=i.roundsColumns.split(",").map(Number)),c.forEach(((e,t)=>{const s=document.createElement("tr"),r=e.length;if(r){if(t<i.startingRow||r<h+p){let t=document.createElement("td");t.setAttribute("colspan",h+p),t.textContent=e.join(" "),s.setAttribute(n.PLAYER_PLACEMENT,-1),s.appendChild(t)}else{const t=parseInt(e[d],10);if(isNaN(t)&&!f)e.forEach((e=>{let t=document.createElement("td");t.textContent=e,s.setAttribute(n.PLAYER_PLACEMENT,-1),s.appendChild(t)}));else{s.setAttribute(n.PLAYER_PLACEMENT,f||t);let r=[];i.joinNames&&e.splice(m,2,"".concat(e[m],"  ").concat(e[m+1])),e.forEach(((e,t)=>{let o=document.createElement("td");if(o.textContent=e.replace(/_/," "),!E||E.indexOf(t)>=0)for(let t=0;t<u;t++){let s=e.match(g[t].regexp);if(!s)continue;let l=s[1];r.push(l),o.setAttribute(n.OPPONENT_PLACEMENT,l),o.setAttribute(n.GAME_RESULT,g[t].cls)}s.appendChild(o)})),r.length&&s.setAttribute(n.OPPONENTS,r.join(",")),f?f+=1:f=2}}o.appendChild(s)}})),o.setAttribute(n.RESULT_TABLE,""),o}(e.textContent,s),i=e.parentNode;i.insertBefore(o,e),i.removeChild(e),this.element=o}else this.element=e;this.element.classList&&(this.createPlayersMap(),this.bindEvents(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls),this.element.setAttribute(n.RESULT_TABLE,""),this.current=null,this.games=[],this.isRearranged=!1,this.isHighlighting=!1)}createPlayersMap(){this.map=d(this.element,this.settings),this.players=[];for(let e in this.map)this.map.hasOwnProperty(e)&&this.players.push(this.map[e])}highlight(e){e||(e={});let t=e.player,r=!0===e.rearrange,l=e.games;const i=this.map[t],a=function(e){let t={};return s.forEach((s=>{t[s]=e.prefixCls+e[s]})),t}(this.settings);this.isRearranged&&this.players.forEach((e=>{const t=e.row.parentNode.children[e.index];t!==e.row&&e.row.parentNode.insertBefore(e.row,t),e.rearranged=!1})),i&&r?(function(e,t){const s=e.row.parentNode;let n=e.row.nextElementSibling;for(let r=0;r<t.length;r++){const o=t[r];o.index<e.index?s.insertBefore(o.row,e.row):(s.insertBefore(o.row,n),n=o.row.nextElementSibling),o.rearranged=!0}}(i,i.opponents.map((e=>this.map[e]))),this.element.classList.add(a.rearrangedCls),this.isRearranged=!0):(this.element.classList.remove(a.rearrangedCls),this.isRearranged=!1);const g=o(this.element.querySelectorAll("."+a.gameCls)),u=this.element.querySelector("."+a.currentCls),c=u?u.getAttribute(n.PLAYER_PLACEMENT):null,h=c?this.map[c]:null,d=(e,t)=>{const s=t?"add":"remove";e.row.classList[s](a.currentCls),e.opponents.forEach((t=>{const n=this.map[t];n&&n.row.classList[s](this.settings.prefixCls+e.opponentsCls[t])}))};if(g.forEach((e=>{e.classList.remove(a.gameCls)})),h&&h!==i&&d(h,!1),i&&i!==h&&d(i,!0),this.games.length=0,i){if("number"==typeof l&&(l=[l]),l&&"number"==typeof l.length){for(const t of i.games)if(l.includes(t.opponentPlace)&&(!e.column||e.column===t.index)){const e=E(this.map[t.opponentPlace],t);if(!e)continue;t.cell.classList.add(a.gameCls),e.cell.classList.add(a.gameCls),this.games.push(t.opponentPlace)}}else if(this.isRearranged)for(const e of i.games){const t=E(this.map[e.opponentPlace],e);t&&(t.cell.classList.add(a.gameCls),this.games.push(e.opponentPlace))}this.games.sort(),this.current=t,this.isHighlighting=!0}else this.current=null,this.isHighlighting=!1}configure(e){this.highlight(null),this.element.classList.remove(this.settings.prefixCls+this.settings.tableCls),this.settings=l(this.settings,e),this.createPlayersMap(),this.element.classList.add(this.settings.prefixCls+this.settings.tableCls)}bindEvents(){let e=!1,t=!1;this.element.addEventListener("touchstart",(()=>{e=!1})),this.element.addEventListener("touchmove",(()=>{e=!0})),this.element.addEventListener("touchend",(s=>{if(e||!1===this.settings.rearranging&&!1===this.settings.hovering)return;let{target:n,player:r,games:o}=f(s.target,this.element);if(!r)return;let l,i=!1;this.current===r?(this.settings.rearranging&&this.settings.hovering||(r=null),i=!this.isRearranged):!this.isRearranged&&this.settings.hovering||(i=!0),i&&(l=n.getBoundingClientRect().top),this.highlight({player:r,games:o,rearrange:i}),l&&m(n,l),t=!0})),this.element.addEventListener("click",(e=>{if(t)return void(t=!1);if(!1===this.settings.rearranging)return;let s,{target:n,player:r,games:o}=f(e.target,this.element),l=!1;r&&(!this.isRearranged||this.map[r]&&this.map[r].rearranged?l=!0:this.settings.hovering||(r=null),s=n.getBoundingClientRect().top,this.highlight({player:r,games:o,rearrange:l}),s&&m(n,s))})),this.element.addEventListener("mouseover",(e=>{if(!1===this.settings.hovering)return;let{player:t,games:s,column:n}=f(e.target,this.element),r=this.isRearranged;if(t){if(this.isRearranged){if((!s||t!==this.current)&&this.games.length===this.map[this.current].opponents.length)return;t!==this.current&&(t=this.current,s=null)}this.highlight({player:t,rearrange:r,games:s,column:n})}}),!1),this.element.addEventListener("mouseout",(e=>{if(!1===this.settings.hovering)return;let t=e.relatedTarget;for(;t&&t!==document&&t!==this.element;)t=t.parentNode;t!==this.element&&(this.isRearranged&&this.games.length!==this.map[this.current].opponents.length?this.highlight({player:this.current,rearrange:!0}):this.isRearranged||this.highlight(null))}),!1)}clearInlineStyles(){this.players.forEach((e=>{o(e.row.childNodes).filter((e=>e.nodeType===Node.ELEMENT_NODE)).forEach((e=>e.removeAttribute("style")))}))}}function m(e,t){let s=e.getBoundingClientRect().top-t;Math.abs(s)>10&&window.scrollBy(0,s)}function f(e,t){const s={player:null,games:null,target:null};for(;e&&e!==document&&e!==t;){if(e.highlighterGame)return{player:e.highlighterGame.player,games:e.highlighterGame.opponent,target:e.highlighterGame.row,column:e.highlighterGame.column};let t=e.getAttribute(n.OPPONENT_PLACEMENT),r=e.getAttribute(n.PLAYER_PLACEMENT);if(t&&(s.games=Number(t)),r){s.player=Number(r);break}e=e.parentNode}return s.target=e,s}function E(e,t){let s,n=null;for(const r of e.games){const e=Math.abs(t.index-r.index);(!n||e<s)&&(n=r,s=e)}return n}function N(e,t){if(!e)return;if(!(this instanceof N))return new N(e,t);const s=new p(e,t);this.highlight=(e,t,n)=>{"object"==typeof e?s.highlight(e):("boolean"==typeof t&&(n=t,t=null),s.highlight({player:e,rearrange:n,games:t}))},this.configure=e=>{s.configure(e)},this.opponents=e=>{const t=s.map[e];return t?t.opponents.slice():[]},this.clearInlineStyles=()=>{s.clearInlineStyles()},Object.defineProperties(this,{element:C((()=>s.element)),isHighlighting:C((()=>s.isHighlighting)),isRearranged:C((()=>s.isRearranged)),player:C((()=>s.current||null)),players:C((()=>s.players.length)),games:C((()=>s.games)),configuration:C((()=>{const e=s.settings.results,t={};for(let s in e)e.hasOwnProperty(s)&&(t[s]=e[s]);return{startingRow:s.settings.startingRow,placeColumn:s.settings.placeColumn,roundsColumns:s.settings.roundsColumns,prefixCls:s.settings.prefixCls,rearrangedCls:s.settings.rearrangedCls,tableCls:s.settings.tableCls,gameCls:s.settings.gameCls,currentCls:s.settings.currentCls,rowTags:s.settings.rowTags,cellTags:s.settings.cellTags,cellSeparator:s.settings.cellSeparator,joinNames:s.settings.joinNames,ignoreOutOfBoundsRows:s.settings.ignoreOutOfBoundsRows,checkColumnsForResults:s.settings.checkColumnsForResults,results:t}})),rearranging:{set:e=>{!e&&s.isRearranged&&s.highlight(null),s.settings.rearranging=!!e},get:()=>s.settings.rearranging,configurable:!1,enumerable:!0},hovering:{set:e=>s.settings.hovering=!!e,get:()=>s.settings.hovering,configurable:!1,enumerable:!0}}),s.element.goResultsHighlighter=this}function C(e){return{get:e,enumerable:!0,configurable:!1}}p.DEFAULT_SETTINGS=t;class b extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this.shadowRoot.innerHTML="<style>".concat("[data-go-results].go-results-rearranged [data-go-place]{opacity:.2;cursor:pointer}[data-go-results] .go-results-current[data-go-place]{background-color:#d2d2d2;color:#000;cursor:pointer;opacity:1}[data-go-results] .go-results-current[data-go-place] .go-results-game{background-color:#a7a7a7}[data-go-results] .go-results-won[data-go-place]{background-color:#799b29;color:#000;opacity:1}[data-go-results] .go-results-won[data-go-place] .go-results-game{background-color:#5a6a2c;color:#fff}[data-go-results] .go-results-lost[data-go-place]{background-color:#d97962;color:#000;opacity:1}[data-go-results] .go-results-lost[data-go-place] .go-results-game{background-color:#a5422b;color:#fff}[data-go-results] .go-results-jigo[data-go-place]{background-color:#d7c3d1;color:#000;opacity:1}[data-go-results] .go-results-jigo[data-go-place] .go-results-game{background-color:#9e7593}[data-go-results] .go-results-unresolved{background-color:#cbdce5;color:#000}[data-go-results] .go-results-unresolved .go-results-game{background-color:#7d9cad}slot{display:none}#go-results-wrapper{width:100%;overflow-x:auto}table[data-go-results]{min-width:100%}table[data-go-results] td{padding:.25em}",'</style><slot></slot><div id="go-results-wrapper"></div>')}connectedCallback(){const e=this.shadowRoot.querySelector("slot"),t=this.shadowRoot.getElementById("go-results-wrapper");e.onslotchange=()=>{const s={placeColumn:T(this,"place-column",Number,null),roundsColumns:T(this,"rounds-columns",null,null),startingRow:T(this,"starting-row",Number,0)};Array.from(e.assignedNodes()).forEach((e=>{const n=e.cloneNode(!0);t.appendChild(n),new N(n,s)}))}}}function T(e,t,s,n){if(e.hasAttribute(t)){const n=e.getAttribute(t);return"function"==typeof s?s(n):n}return n}return customElements.define("go-results",b),e.default})()));