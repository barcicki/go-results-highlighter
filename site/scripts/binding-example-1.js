document.addEventListener('DOMContentLoaded', () => {
    let button = document.querySelector('[rel="binding-example-1"]');
    let table = document.getElementById('binding-example-1');

    if (button && table) {
        button.addEventListener('click', () => {
            new GoResultsHighlighter(table);

            button.textContent = 'Go Results Highlighter is working.';
            button.disabled = true;
        });
    }
});