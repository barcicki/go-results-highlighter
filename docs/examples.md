## Examples

Probably common use cases of the Go Results Highlighter.

#### Setup

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

### Highlight the player on the first place and all opponents:

```js
results.highlight(1);
```

or

```js
results.highlight({ player: 1 });
```

### Show opponents of player on 3rd place and rearrange the table (dimming other rows)

```js
results.highlight(3, true);
```

or

```js
results.highlight({ player: 3, rarrange: true });
```

### Highlight the player on 2nd place and mark his game with player on 3rd place

```js
results.highlight(2, 3);
```

or

```js
results.highlight({ player: 2, games: 3 });
```

### Highlight the player on 3rd place and mark games with players 4 and 5, also rearrange the rows.

```js
results.highlight(3, [4,5], true);
```

or

```js
results.highlight({ player: 3, games: [4,5], rearrange: true });
```

### Remove highlighting

```js
results.highlight(null); // or any value that doesn't match any player
```

### Get current highlighted player

```js
var highlightedPlayer = results.player;
```

### Get list of highlighted games

```js
var highlightedGames = results.games;
```

### Get opponents for player on 3rd place

```js
var opponents = results.opponents(3);
```

### Check if table is rearranged or highlighted

```js
var isHighlighting = results.isHighlighting;
var isRearranged = results.isRearranged;
```