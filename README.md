# Go Results Highlighter

[![npm version](https://badge.fury.io/js/go-results-highlighter.svg)](https://badge.fury.io/js/go-results-highlighter)
[![Build Status](https://travis-ci.org/barcicki/go-results-highlighter.svg)](https://travis-ci.org/barcicki/go-results-highlighter)
[![Coverage Status](https://coveralls.io/repos/barcicki/go-results-highlighter/badge.svg?branch=v0.7.3&service=github)](https://coveralls.io/github/barcicki/go-results-highlighter?branch=master)
[![Dependency Status](https://david-dm.org/barcicki/go-results-highlighter.svg)](https://david-dm.org/barcicki/go-results-highlighter)
[![devDependency Status](https://david-dm.org/barcicki/go-results-highlighter/dev-status.svg)](https://david-dm.org/barcicki/go-results-highlighter#info=devDependencies)


Highlighted results:

![Results with highlight](http://barcicki.github.io/go-results-highlighter/assets/results-hover.png)

Highlighted results in compact mode:

![Results in compact mode](http://barcicki.github.io/go-results-highlighter/assets/results-click.png)


## About

The goal of this plugin is to improve readability of Go result tables by
highlighting opponent rows for the selected player.

This is the rewritten version of [jQuery Table Result for Go](https://github.com/barcicki/jQuery-Table-Result-for-Go).
It was created to provide jQuery independent version of the plugin and serve it
using popular package managers such as Bower or NPM.

## Installation

#### Using Bower

Download Go Results Highlighter using following command:

```bash
bower install go-results-highlighter --save
```

Then add highlighter files to your website

```html
<link rel="stylesheet" href="bower_components/go-results-highlighter/dist/go-results-highlighter.min.css">
<script src="bower_components/go-results-highlighter/dist/go-results-highlighter.min.js"></script>
```

#### Using NPM

Download Go Results Highlighter using following command:

```bash
npm install go-results-highlighter
```

Include `go-results-highlighter.min.js` and `go-results-highlighter.min.css`
from `node_modules/go-results-highlighter/dist` directory to your website.

#### Downloading manually

[Download the latest release from GitHub](https://github.com/barcicki/go-results-highlighter/releases/latest)

Include `go-results-highlighter.min.js` and `go-results-highlighter.min.css`
from `dist` directory to your website.

#### Using Rawgit CDN

Include following lines in your website:

```html
<link rel="stylesheet" href="//cdn.rawgit.com/barcicki/go-results-highlighter/v1.0.0/dist/go-results-highlighter.min.css">
<script src="//cdn.rawgit.com/barcicki/go-results-highlighter/v1.0.0/dist/go-results-highlighter.min.js"></script>
```

## Basic usage

There're several ways possible.

#### Let Go Results Highlighter use default settings (no additional JS code)

Add `data-go-results` attribute to **table** or **pre** tags which contain
Go results.

#### Manually bind Go Results Highlighter to selected elements

Highlighter is served using Universal Module Definition, therefore can be used
globally:

```js
var highlighter = new GoResultsHighlighter(elementWithGoResults, optionalSettings);
```
or using requirejs:

```js
require('go-results-highlighter', function (GoResultsHighlighter) {
    var highlighter = new GoResultsHighlighter(elementWithGoResults, optionalSettings);
});
```

if it detects globally accessible jQuery object, then it's also possible to call:

```js
$(selectorOfElementWithGoResults).goResultsHighlighter(optionalSettings);
```

## Configuration

|Setting|Attribute|&nbsp;&nbsp;Default&nbsp;value&nbsp;&nbsp;|Description|
|:---:|:---:|:------:|---|
|`hovering`|`data-go-hovering`|`true`|Enables highlighting player and opponents on mouse move|
|`clicking`|`data-go-clickin`|`true`|Enables rearranging table rows when clicking a player|
|`startingRow`|`data-go-starting-row`|`0`|Makes highlighter skip rows below this value|
|`placeColumn`|`data-go-place-column`|`0`|Informs highlighter where to look for player's place|
|`roundsColumn`|`data-go-rounds-columns`|null|Informs highlighter which columns should contain game resutls, column indexes should be separated with coma e.g. `"5,6,7"`. If not set highlighter will search for results in all columns|
|`rowTags`|-|`"tr"`|Selector used by highlighter to divide results into player rows|
|`cellTags`|-|`"td,th"`|Selector used by highlighter as a single cell which `textContent` should be analyzed|
|`cellSeparator`|-|`"[\t ]+"`|Used to divide raw line into columns when building table from raw results|
|`joinNames`|-|`true`|Whether to join to consecutive cells after place column index into single cell when building table from raw results. The goals is to join Last name and First name columns into one column|
|`results`|-|_see below_|Results map - `key` is a className and `value` is an RegExp string matching the result. The className is added to the row when highlighting|
|`results.won`|-|`"([0-9]+)\\+"`|className and RegExp for winning result|
|`results.lost`|-|`"([0-9]+)\\-"`|className and RegExp for losing result|
|`results.jigo`|-|`"([0-9]+)="`|className and RegExp for draw result|
|`results.unresolved`|-|`"([0-9]+)\\?"`|className and RegExp for scheduled or unresolved game|
|`prefixCls`|-|`"go-results-"`|Prefix added to every className|
|`rearrangedCls`|-|`"rearranged"`|className added when table is rearranged|
|`tableCls`|-|`"table"`|className added to element with enabled highlighter|
|`gameCls`|-|`"game"`|className of highlighted game call|
|`currentCls`|-|`"current"`|className of the row with highlighted player|

## Go Results Highlighter API

### `highlight(playerPlace, [games=[], rearrange=false])`

Highlights row with the player and his/hers opponents.

Arguments:
- `playerPlace` - or `settings.player` - either an object with settings or a number with
player place. If null or player on this place is not found the table is reset to
default state and any visual changes are reverted.
- `games` - or `settings.games` - highlight games with provided opponents, be default no game is
highlighted or all games if rows are already rearranged. Can be single number
with opponent's place or a list of opponents
- `rearrange` - or `settings.rearrange` - if true it rearranges the rows with players
so the opponents' rows are close to the the highlighted player

#### Example usages

```html
<table id="go-results" data-go-results>
<!-- ... results ... -->
</table>
```

```js
// grab the instance of highlighter from existing element (if that element had data-go-results attribute on page load)
var results = document.getElementById('go-results').goResultsHighlighter;

or

// create new highlighter
var results = new GoResultsHighlighter(document.getElementById('go-results'));

```

1. Highlight the player on the first place and all opponents:

    ```js
    results.highlight(1);
    ```

    or

    ```js
    results.highlight({ player: 1 });
    ```

2. Show opponents of player on 3rd place and rearrange the table (dimming other
rows)

    ```js
    results.highlight(3, true);
    ```

    or

    ```js
    results.highlight({ player: 3, rarrange: true });
    ```

3. Highlight the player on 2nd place and mark his game with player on 3rd place

    ```js
    results.highlight(2, 3);
    ```

    or

    ```js
    results.highlight({ player: 2, games: 3 });
    ```

4. Highlight the player on 3rd place and mark games with players 4 and 5, also
rearrange the rows.

    ```js
    results.highlight(3, [4,5], true);
    ```

    or

    ```js
    results.highlight({ player: 3, games: [4,5], rearrange: true });
    ```

5. Remove highlighting

    ```js
    results.highlight(null); // or any value that doesn't match any player
    ```

6. Get current highlighted player

    ```js
    var highlightedPlayer = results.player;
    ```

7. Get list of highlighted games

    ```js
    var highlightedGames = results.games;
    ```

8. Get opponents for player on 3rd place

    ```js
    var opponents = results.opponents(3);
    ```

9. Check if table is rearranged or highlighted

    ```js
    var isHighlighted = results.isHighlighted;
    var isRearranged = results.isRearranged;
    ```

## License

The MIT License (MIT)

Copyright (c) 2015 Artur Barcicki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
