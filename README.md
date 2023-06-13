# Go Results Highlighter

![Highlighter in action](./site/assets/demo.gif)

Visit [go-results-highlighter's website](https://barcicki.github.io/go-results-highlighter)
to see the Highlighter in action and explore more usage scenarios.

## About

The goal of this library is to improve readability of Go result tables by
highlighting opponent rows for the selected player.

This is the rewritten version of [jQuery Table Result for Go](https://github.com/barcicki/jQuery-Table-Result-for-Go).
It was created to provide jQuery independent version of the plugin and serve it
using popular package managers such as Bower or NPM.

## Highlighter Web Component

Version 2.1.0 introduced highlighter as [Web Component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)

Add this script to your side:
```html
<script src="//esm.run/go-results-highlighter/dist/component.js"></script>
```

Then wrap your results with this `go-results` tag:
```html
<go-results>
  Results - html table or plain text
</go-results>
```

## Installation

You can use [NPM](https://www.npmjs.com/package/go-results-highlighter) or
[Bower](https://bower.io) to install Highlighter or you can just [grab a copy
from GitHub](https://github.com/barcicki/go-results-highlighter/releases/latest).

[Learn more about installation](./docs/install.md)

## Usage

Once the script is included to the page, it will automatically search for nodes
with `data-go-results` attribute and make them interactive.

If that's not enough - [learn more about the usage](./docs/usage.md)

## Go Results Highlighter API

The Highlighter not only handle mouse event but also provides easy to use
interface allowing developers to programmatically highlight rows with results.

[Learn more about API](./docs/api.md)

[Common use cases](./docs/examples.md)

## License

The MIT License (MIT)

Copyright (c) 2023 Artur Barcicki

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
