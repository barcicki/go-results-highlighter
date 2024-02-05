## Usage

There're several ways possible to use the Highlighter.

#### Let Go Results Highlighter use default settings (no additional JS code)

Add `data-go-results` attribute to **table** or **pre** tags which contain
Go results.

#### Manually bind Go Results Highlighter to selected elements

Highlighter is served using Universal Module Definition, therefore can be used
globally:

```js
var highlighter = new GoResultsHighlighter(elementWithGoResults, optionalSettings);
```

If it detects globally accessible jQuery object, then it's also possible to call:

```js
$(selectorOfElementWithGoResults).goResultsHighlighter(optionalSettings);
```

#### React

It's possible to use ref callback approach:

```jsx
import attachHighlighter from 'go-results-highlighter'

function Table() {
  return (
    <table ref={(element) => attachHighlighter(element, optionalSettings)}>
      ...
    </table>
  );
}
```

#### Access to existing highlighter object

It is possible to get a highlighter instance bound to elements using
`goResultsHighlighter` property, eg.

```js
var highlighter = document.querySelector('[data-go-results]').goResultsHighlighter;
```

or in jQuery:

```js
var highlighter = $('[data-go-results]').data('GoResultsHighlighter'); // or $('[data-go-results]').get().goResultsHighlighter;
```

[Learn more about highlighter's interface](./api.md)

## Configuration

Here's the table of available settings that can be overwritten.

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
|`checkColumnsForResults`|-|`true`|Whether the highlighter should first try to find columns with Go results before parsing every row|
|`ignoreOutOfBoundsRows`|-|`false`|Whether it is allowed to have games with player that are not visible on the list (e.g. when table is paginated)|
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

If, for any reason, above settings will have to be changed after the
initialization, please use `configure` method on the highlighter instance.
