import $ from 'jquery';
import Caret from 'component-caret';
import wysiwyg from './wysiwyg';

class Editor {
    $el = undefined;
    caret = undefined;
    options = {};
    defaultOptions = {};

    constructor(options = {}) {
        this.options = {
            ...this.defaultOptions,
            options
        };
    }
 
    attach(element) {
        this.$el = $(element)
            .attr('contenteditable', true)
            .addClass('alpha--container')
            .on("paste", function(e) {
                e.preventDefault();

                let text;
                if (e.clipboardData) {
                    text = e.clipboardData.getData('text/plain');
                } else if (window.clipboardData) {
                    text = window.clipboardData.getData('Text');
                } else if (e.originalEvent.clipboardData) {
                    text = e.originalEvent.clipboardData.getData('text');
                }
                document.execCommand('insertText', false, text);
            });

        this.caret = new Caret(this.$el.get(0));
        this.caret.on('change', function () {
            var text = this.textBefore();
            var match = text.match(/@(\w+)$/);

            if (match) {
                console.log("Editing user name:", match[1]);

                wysiwyg.commands.table();
            }
        });

        wysiwyg.commands.table();
    }
}

let options = options;
let ed = new Editor(options);
ed.attach('#editor');