$(document).ready(function(){

	// tooltips
	$('.option').tooltip();
	$('body').tooltip({
		selector: "[data-tooltip=tooltip]",
		container: "body"
	});

	// load templates and apply bindings
	var loadTemplates = function(templatesToLoad) {
		var templateName = templatesToLoad.pop();
		$.get('templates/' + templateName + '.html', function(template) {
			$('#templates').append('<script type="text/html" id="' + templateName + '-template">' + template + '</script>');

			if(templatesToLoad.length > 0){
				loadTemplates(templatesToLoad);
			} else {
				viewModel = new ViewModel({
					players: playerArray,
					availableAvatars: availableAvatars,
					availableColors: availableColors,
					availableMaps: availableMaps,
					availableThemes: availableThemes,
					selectedMap: availableMaps[0],
					selectedTheme: availableThemes[0]
				});
				ko.applyBindings(viewModel);
			}
		});
	};

	var templatesToLoad = ['login', 'profile', 'player'];
	loadTemplates(templatesToLoad);

});