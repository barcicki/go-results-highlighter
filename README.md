# Go Results Highlighter

[![npm version](https://badge.fury.io/js/go-results-highlighter.svg)](https://badge.fury.io/js/go-results-highlighter)
[![Build Status](https://travis-ci.org/barcicki/go-results-highlighter.svg)](https://travis-ci.org/barcicki/go-results-highlighter)
[![Coverage Status](https://coveralls.io/repos/barcicki/go-results-highlighter/badge.svg?branch=master&service=github)](https://coveralls.io/github/barcicki/go-results-highlighter?branch=master)
[![Dependency Status](https://david-dm.org/barcicki/go-results-highlighter.svg)](https://david-dm.org/barcicki/go-results-highlighter)
[![devDependency Status](https://david-dm.org/barcicki/go-results-highlighter/dev-status.svg)](https://david-dm.org/barcicki/go-results-highlighter#info=devDependencies)


Highlighted results:

![Results with highlight](http://barcicki.github.io/go-results-highlighter/assets/results-hover.png)

Highlighted results in compact mode:

![Results in compact mode](http://barcicki.github.io/go-results-highlighter/assets/results-click.png)

Visit [go-results-highlighter's website](https://barcicki.github.io/go-results-highlighter)
to see the Highlighter in action and explore more usage scenarios.

## About

The goal of this library is to improve readability of Go result tables by
highlighting opponent rows for the selected player.

This is the rewritten version of [jQuery Table Result for Go](https://github.com/barcicki/jQuery-Table-Result-for-Go).
It was created to provide jQuery independent version of the plugin and serve it
using popular package managers such as Bower or NPM.

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

Copyright (c) 2020 Artur Barcicki

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
