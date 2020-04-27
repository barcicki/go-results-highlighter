## Installation

#### Using NPM

Download Go Results Highlighter using following command:

```bash
npm install go-results-highlighter
```

and then in you script

```js
import 'go-results-highlighter'; // or import GoResultsHighlighter from 'go-results-highlighter` to access API
import 'go-results-highlighter/dist/lib.css';
```

It's possible to use unminified version with 

```js
// default version which automatically binds to elements with `data-go-results` attribute
import 'go-results-highlighter/src';

// GoResultsHighlighter without auto binding - just the API
import GoResultsHighlighter from 'go-results-highlighter/src/lib/wrapper' 
```

but remember that code from `src`  may require transpiling before serving to users.

#### Downloading manually

[Download the latest release from GitHub](https://github.com/barcicki/go-results-highlighter/releases/latest)

Include `go-results-highlighter.js` and `go-results-highlighter.css`

#### Using GitHack CDN

Include following lines in your website:

```html
<link rel="stylesheet" href="//rawcdn.githack.com/barcicki/go-results-highlighter/master/dist/lib.css">
<script src="//rawcdn.githack.com/barcicki/go-results-highlighter/master/dist/lib.js"></script>
```