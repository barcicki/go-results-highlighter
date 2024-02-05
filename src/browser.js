import { init, initWithJQuery } from './init';
import './styles/highlighter.scss';
import GoResultsHighlighter from './lib/wrapper';

export default GoResultsHighlighter;

if (typeof jQuery !== 'undefined') {
  initWithJQuery(jQuery);
} else if (document) {
  init(document);
}
