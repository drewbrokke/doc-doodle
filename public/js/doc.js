var _ = require('lodash');
var fs = require('fs');
var compressor = require('yuicompressor');

var CWD = process.cwd();

window.onload = function() {
	var body = $('body'),
		cssPanel = $('#cssPanel'),
		htmlPanel = $('#htmlPanel'),
		javascriptPanel = $('#javascriptPanel'),
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

	resizePanels();

	win.on('resize', resizePanels);

	var htmlEditor = createEditor(
		{
			mode: 'htmlmixed',
			panel: htmlPanel,
			value: '<div>html</div>'
		}
	);

	var cssEditor = createEditor(
		{
			mode: 'css',
			panel: cssPanel,
			value: 'div {\n    background-color: red;\n    height: 100px;\n    width: 100px;\n}'
		}
	);

	var javascriptEditor = createEditor(
		{
			mode: 'javascript',
			panel: javascriptPanel,
			value: '// This is for Javascript'
		}
	);

	$('#run').on(
		'click',
		function(event) {
			var output = $('#outputFrame').contents().find('html');

			output.find('body').html(htmlEditor.doc.getValue('\n'));

			output.find('#customCSS').html(cssEditor.doc.getValue('\n'));

			compressor.compress(
				javascriptEditor.doc.getValue('\n'),
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
						output.find('#customJS').html(data);
					}
				}
			);
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

	// Template functions
	var tempMessage = 'Are you sure you want to change markup? All data will be lost.';

	var clickableButton = $('#clickButton');

	clickableButton.click(
		function() {
			fs.readFile(CWD + '/templates/onClick.html', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					htmlEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					cssEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/onClick.js', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					javascriptEditor.doc.setValue(data);
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
					htmlEditor.doc.setValue(data);
				}
			);
			fs.readFile(CWD + '/templates/firstParagraph.css', {encoding: 'utf8'},function (err, data) {
				if (err) throw err;
					cssEditor.doc.setValue(data);
				}
			);

			javascriptEditor.doc.setValue('// Do something here');

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