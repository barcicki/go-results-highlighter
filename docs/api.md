## Go Results Highlighter API

Here's the list of available methods and properties to be provided by
instance of the highlighter.

### Methods

### `highlight(player, [games=[], rearrange=false])`

Highlights row with the player and his/hers opponents.

The first argument can be either a number or an object (`settings`) with properties named as
 the arguments

Arguments:
- `player` - or `settings.player` - either an object with settings or a number with
player place. If null or player on this place is not found the table is reset to
default state and any visual changes are reverted.
- `games` - or `settings.games` - highlight games with provided opponents, by default no game is
highlighted or all games if rows are rearranged (compact mode). Can be single number
with opponent's place or a list of numbers (opponents)
- `rearrange` - or `settings.rearrange` - if true it rearranges the rows with players
so the opponents' rows are close to the the highlighted player

[See example use cases](./examples.md)

### `opponents(playerPlace)`

Returns the array of opponents - theirs places (to be precise).

### `configure(settings)`

Allows to modify the settings with which the highlighter was initialized.

### `clearInlineStyles()`

Removes inline styles from player rows and theirs children. This method is called when using bookmarklet only.

[See usage for details](./usage.md)

### Properties

### `hovering`

Boolean value. Controls whether the rows should be highlighted when mouse is moving
above the table. Note that it doesn't stop manual highlighting.

### `rearranging`

Boolean value. Controls whether the rows can be rearranged on mouse click.
Note that it doesn't stop manual rearranging.

### `element`

Readonly. Holds the reference to the DOM element with results.

### `isHighlighting`

Readonly boolean. Informs whether any player is highlighted.

### `isRearranged`

Readonly boolean. Informs whether the rows of the result table are rearranged.

### `player`

Readonly. Holds the place of currently highlighted player (or null if no one is
highlighted).

### `games`

Readonly array. Array with places of opponents for whom games against current player
are highlighted.

### `players`

Readonly number. Contains the number of total rows with players.

### `configuration`

Readonly object. Holds current configuration of the highlighter.