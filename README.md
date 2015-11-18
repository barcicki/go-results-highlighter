# Go Results Highlighter

[![Build Status](https://travis-ci.org/barcicki/go-results-highlighter.svg)](https://travis-ci.org/barcicki/go-results-highlighter)

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
|`placeColumn`|`data-go-place-col`|`0`|Informs highlighter where to look for player's place|
|`roundsColumn`|`data-go-rounds-cols`|null|Informs highlighter which columns should contain game resutls, column indexes should be separated with coma e.g. `"5,6,7"`. If not set highlighter will search for results in all columns|
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
|`showingDetailsCls`|-|`"showing-details"`|className added when table is rearranged|
|`tableCls`|-|`"table"`|className added to element with enabled highlighter|
|`gameCls`|-|`"game"`|className of highlighted game call|
|`currentCls`|-|`"current"`|className of the row with highlighted player|

## Go Results Highlighter API

### `highlight(playerPlace, [compact = false])`

Highlights row with the player and his/hers opponents.

Arguments:
- `playerPlace` - or `settings.player` - either an object with settings or a number with
player place. If null or player on this place is not found the table is reset to
default state and any visual changes are reverted.
- `compact` - or `settings.compact` - if true it rearranges the rows with players
so the opponents' rows are close to the the highlighted player
- `settings.opponent` - highlight the game between player and this opponent if
possible

#### Example usages

```html
<table id="go-results" data-go-results>
<!-- ... results ... -->
</table>
```

```js
// grab the instance of highlter from existing element
var results = document.getElementById('go-results').goResultsHighlighter;
```

1. Highlight the player on the first place and all opponents:

    ```js
    results.highlight(1);
    ```

    or

    ```js
    results.highlight({ player: 1 });
    ```

2. Show opponents of player on 3rd place and dim other rows

    ```js
    results.highlight(3, true);
    ```

    or

    ```js
    results.highlight({ player: 3, compact: true });
    ```

3. Highlight the player on 2nd place and mark his game with palyer on 3rd place

    ```js
    results.highlight({ player: 2, opponent: 3 });
    ```

4. Remove highlighting

    ```js
    results.highlight(null); // or any value that doesn't match any player
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
