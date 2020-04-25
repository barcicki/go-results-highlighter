// import code highlighter
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import '@primer/octicons/index.scss';

// import all jade pages
importAll(require.context('./pages', true, /\.(pug|jade)$/));

// import styles
import './styles/styles.scss';

// import usage examples
import './scripts/binding-example-1';
import './scripts/binding-example-2';

// init code highlighter
hljs.initHighlightingOnLoad();

function importAll(r) {
  return r.keys().map(r);
}
