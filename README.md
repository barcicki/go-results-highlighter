# Go Results Highlighter

## About

The goal of this plugin is to improve readability of Go result tables by
highlighting opponent rows for the selected player.

This is updated version of https://github.com/barcicki/jQuery-Table-Result-for-Go.
It was created to provide jQuery independent version of the plugin and serve it
using popular package managers such as Bower or NPM.

## Installation

Include `go-results-highlighter.min.js` and `go-results-highlighter.min.css`
(optionally) from `dist` directory to your website.

## Usage

There're several ways possible.

### Variant 1 - Let Go Results Highlighter use default settings (no additional JS code)

Add `data-go-results` attribute to **table** or **pre** tags which contain
Go results.

### Variant 2 - Manually bind Go Results Highlighter to selected elements

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

## Configuration & customization

To be described...

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
