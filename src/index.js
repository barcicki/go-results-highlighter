import GoResultsHighlighter from './lib/wrapper';
import { init, initWithJQuery } from './init';
import './styles/highlighter.scss';

export default GoResultsHighlighter;

if (typeof jQuery !== 'undefined') {
  initWithJQuery(jQuery);
} else if (document) {
  init(document);
}
