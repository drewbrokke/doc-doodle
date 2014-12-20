var _ = require('lodash');
var fs = require('fs');
var compressor = require('yuicompressor');

var CWD = process.cwd();

window.onload = function() {
	var body = $('body'),
		CSSEditor,
		CSSPanel = $('#CSSPanel'),
		HTMLEditor,
		HTMLPanel = $('#HTMLPanel'),
		JSEditor;
		JSPanel = $('#JSPanel'),
		JSTemplate = 'window.onload = function() {try{<%= script %>} catch(e){}}',
		templateList = $('.template-list'),
		win = $(window);

	// Panel height

	function createEditor(config) {
		return CodeMirror(
			config.panel.find('.editor')[0],
			{
				keymap: "sublime",
				lineNumbers: true,
				mode:  config.mode,
				theme: "ambiance",
				value: config.value
			}
		);
	}

	function createToggler(toggler, content) {
		toggler = $(toggler);
		content = $(content);

		toggler.on(
			'click',
			function(event) {
				content.toggleClass('hide');

				toggler.toggleClass('open', !content.hasClass('hide'));
			}
		);
	}

	function resizePanels() {
		var containerHeight = win.height() - ($('.navbar').outerHeight() * 2);

		var panelHeight = (containerHeight / 2) - 10;

		$('.editor, #outputFrame').css('height', panelHeight + 'px');
	}

	function refreshIframe() {
		console.log('Reloading iframe...');

		var iframe = $('#outputFrame')[0];

		iframe.src = iframe.src;
	}

	function updateAll() {
		updateHTML();
		updateCSS();
		updateJS();
	}

	function updateCSS(value) {
		if (!value) {
			value = CSSEditor.doc.getValue();
		}

		fs.writeFile('output/output-css.css', value, function (err) {
			if (!err) {
				console.log('CSS saved!');

				refreshIframe();
			}
		});
	}

	function updateHTML(value) {
		if (!value) {
			value = HTMLEditor.doc.getValue();
		}

		fs.writeFile('output/output-html.html', value, function (err) {
			if (!err) {
				console.log('HTML saved!');

				refreshIframe();
			}
		});
	}

	function updateJS(value) {
		if (!value) {
			value = JSEditor.doc.getValue();
		}

		value = _.template(
			JSTemplate,
			{
				script: value
			}
		);

		compressor.compress(
			value,
			{
				'line-break': 80,
				charset: 'utf8',
				nomunge: true,
				type: 'js'
			},
			function(err, data) {
				if (err) {
					console.log(err);

					$('#error-display').html(err);
				}
				else {
					fs.writeFile('output/output-js.js', data, function (err) {
						if (!err) {
							console.log('Javascript saved!');

							refreshIframe();
						}
					});
				}
			}
		);
	}

	resizePanels();

	win.on('resize', resizePanels);

	HTMLEditor = createEditor(
		{
			mode: 'htmlmixed',
			panel: HTMLPanel,
			value: '<div>HTML</div>'
		}
	);

	CSSEditor = createEditor(
		{
			mode: 'css',
			panel: CSSPanel,
			value: 'div {\n    background-color: red;\n    height: 100px;\n    width: 100px;\n}'
		}
	);

	JSEditor = createEditor(
		{
			mode: 'javascript',
			panel: JSPanel,
			value: '// This is for Javascript\n'
		}
	);

	HTMLEditor.on(
		'change',
		function(editor) {
			var value = editor.doc.getValue();

			updateHTML(value);
		}
	);

	CSSEditor.on(
		'change',
		function(editor) {
			var value = editor.doc.getValue();

			updateCSS(value);
		}
	);

	JSEditor.on(
		'change',
		function(editor) {
			var value = editor.doc.getValue();

			updateJS(value);
		}
	);

	updateAll();

	$('#run').on(
		'click',
		function(event) {
			updateAll();
		}
	);

	createToggler('#menuToggle', '.toggle-list');
	createToggler('#templatesToggle', '.template-list');

	// Toolbar

	$('.open-dev-tools').on(
		'click',
		function() {
			gui.Window.get().showDevTools();
		}
	);

	$('.reload').on(
		'click',
		function() {
			gui.Window.get().reload();
		}
	);

	// Template functions
	var tempMessage = 'Are you sure you want to change markup? All data will be lost.';

	var clickableButton = $('#clickButton');

	clickableButton.click(
		function() {
			fs.readFile(CWD + '/templates/onClick.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					HTMLEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					CSSEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.js', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					JSEditor.doc.setValue(data);
				}
			);

			templateList.toggleClass('hide');
		}
	);

	var firstParagraph = $('#firstParagraph');

	firstParagraph.click(
		function() {
			fs.readFile(CWD + '/templates/firstParagraph.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					HTMLEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/firstParagraph.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					CSSEditor.doc.setValue(data);
				}
			);

			JSEditor.doc.setValue('// Do something here');

			templateList.toggleClass('hide');
		}
	);

	// Options toggle

	$('.options-toggle').on(
		'click',
		function(event) {
			currentTarget = $(event.currentTarget);

			var optionsPanel = currentTarget.next('.options');

			optionsPanel.toggleClass('open');
		}
	);
};