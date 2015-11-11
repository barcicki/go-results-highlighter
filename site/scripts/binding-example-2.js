$(document).ready(() => {
    let $button = $('[rel="binding-example-2"]');
    let $table = $('#binding-example-2');

    if ($button && $table) {
        $button.click(() => {
            $table.goResultsHighlighter();
            $button
                .attr('disabled', true)
                .html('Go Results Highlighter is working.');
        });
    }
});