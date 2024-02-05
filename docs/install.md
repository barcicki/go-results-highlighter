## Installation

### Using Unpkg CDN

Include following lines in your website:

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/go-results-highlighter@latest/dist/browser.css">
<script src="//cdn.jsdelivr.net/npm/go-results-highlighter@latest/dist/browser.js"></script>
```

### Using NPM

Download Go Results Highlighter using following command:

```bash
npm install go-results-highlighter
```

Then, the packages exposes following files:
* `go-results-highlighter` - default behavior of the packages exposes GoResultsHighlighter function that can be manually attached to any table with results
* `go-results-highlighter/dist/browser.css` - default highlighting styles that can be included in your page
* `go-results-highlighter/dist/browser.js` - browser-specific, minified version, that will automatically bind highlighter to elements with `data-go-results` attribute
 
### Downloading manually

[Download the latest release from GitHub](https://github.com/barcicki/go-results-highlighter/releases/latest)

Include `go-results-highlighter.js` and `go-results-highlighter.css` on your site.

