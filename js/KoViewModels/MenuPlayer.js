var PlayerViewModel = function(data){
	var thisPlayer = this;

	/*
	 * OBSERVABLES
	 */
	this.isActive = ko.observable(data.isActive);
	this.loggedin = ko.observable(data.loggedin);
	this.email = ko.observable();
	this.name = ko.observable(data.name);
	this.name.focused = ko.observable();

	this.color = ko.observable(data.color);
	this.avatar = ko.observable(data.avatar);

	/*
	 * OBSERVABLES ARRAYS
	 */
	this.availableAvatars = ko.observableArray(data.availableAvatars);

	/*
	 * METHODS
	 */
	this.togglePlayer = function(){
		viewModel.computeAvailableColors(thisPlayer);
		thisPlayer.color( viewModel.availableColors()[0] );
		thisPlayer.isActive(!thisPlayer.isActive());
	};

	this.nextColor = function(){
		viewModel.computeAvailableColors(thisPlayer);
		var availableColors = viewModel.availableColors();
		var newColorIndex = $.inArray(thisPlayer.color(), availableColors) + 1;
		if(newColorIndex > availableColors.length - 1){
			newColorIndex = 0;
		}
		thisPlayer.color( availableColors[newColorIndex] );
	};

	this.prevColor = function(){
		viewModel.computeAvailableColors(thisPlayer);
		var availableColors = viewModel.availableColors();
		var newColorIndex = $.inArray(thisPlayer.color(), availableColors) -1;
		if(newColorIndex == -1){
			newColorIndex = availableColors.length - 1;
		}
		thisPlayer.color( availableColors[newColorIndex] );
	};

	this.nextAvatar = function(){
		var newAvatarIndex = $.inArray(thisPlayer.avatar(), thisPlayer.availableAvatars) + 1;
		if(newAvatarIndex > thisPlayer.availableAvatars.length - 1){
			newAvatarIndex = 0;
		}
		thisPlayer.avatar( thisPlayer.availableAvatars[newAvatarIndex] );
	};

	this.prevAvatar = function(){
		var newAvatarIndex = $.inArray(thisPlayer.avatar(), thisPlayer.availableAvatars) -1;
		if(newAvatarIndex == -1){
			newAvatarIndex = thisPlayer.availableAvatars.length - 1;
		}
		thisPlayer.avatar( thisPlayer.availableAvatars[newAvatarIndex] );
	};

	/*
	 * SUBSCRIPTIONS
	 */
	this.name.focused.subscribe(function(newValue) {
		if(!newValue && thisPlayer.loggedin()) {
			$.post( "ajax/setname.php",{ "username": thisPlayer.name, "email": thisPlayer.email}).done(function( data ) {
				console.log( data );
				result = $.parseJSON( data );
				if(!result.success){
					console.log(result.msg);
				}
			});
		}
	});

};