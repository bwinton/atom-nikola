/* globals atom:false, module:false */

'use strict';

// Pad out numbers to at least two digits…
var pad = function (template) {
  var args = Array.prototype.slice.call(arguments, 1);

  let retval = '';
  for (let i in template) {
    let number = args[i];
    if (number) {
      if (number < 10) {
        number = '0' + number;
      } else {
        number = '' + number;
      }
    } else {
      number = '';
    }
    retval += template[i] + number;
  }
  return retval;
};

// Strip the initial white
var dedent = function (template) {
  var args = Array.prototype.slice.call(arguments, 1);

  let retval = '';
  for (let i in template) {
    let arg = args[i];
    if (arg) {
      arg = '' + arg;
    } else {
      arg = '';
    }
    retval += template[i].replace(/\n */g, '\n') + arg;
  }
  return retval;
};


module.exports = {
  command: null,

  activate: function () {
    // Register command that toggles this view
    this.command = atom.commands.add(
      'atom-workspace',
      'atom-nikola:new-blog-post',
      this.newBlogPost
    );
  },

  deactivate: function () {
    if (this.command) {
      this.command.dispose();
      this.command = null;
    }
  },

  newBlogPost: function () {

    var editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      atom.beep();
      return;
    }

    // TODO: Check to see if there's an existing blog post header…
    var today = new Date();
    today = pad`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()} ${'' + today.getHours()}:${today.getMinutes()}`;

    var header = editor.getTextInBufferRange([[0, 0], [2, 0]]);
    if (!/^<!--\n\.\./.test(header)) {
      var title = 'Title';
      var author = 'Blake Winton';
      var tags = ['random', 'tags'];
      var lineContents = dedent`<!--
        .. title: ${title}
        .. date: ${today}
        .. author: ${author}
        .. tags: ${tags.join(', ')}
        -->
        `;
      editor.setSelectedBufferRange([0, 0]);
      editor.insertText(lineContents);
      // Select the word "Title"
      editor.setSelectedBufferRange([[1, 10], [1, 15]]);
    } else {
      for (let i = 1; i <= editor.getLastBufferRow(); i++ ) {
        let line = editor.lineTextForBufferRow(i);
        if (line === '-->') {
          editor.setTextInBufferRange([[i, 0], [i + 1, 0]], `.. date: ${today}\n-->\n`);
          break;
        } else if (/^\.\. date: /.test(line)) {
          editor.setTextInBufferRange([[i, 0], [i + 1, 0]], `.. date: ${today}\n`);
          break;
        }
      }
    }

    editor.setGrammar(atom.grammars.grammarForScopeName('source.gfm'));
  }
};
