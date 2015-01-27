var ViewModel = function(data) {
	var self = this;

	this.gameRunning = ko.observable(false);

	/*
	 * OBSERVABLES
	 */
	this.email = ko.observable();
	this.password = ko.observable();
	this.matchesToWin = ko.observable(3);
	this.sound = ko.observable(true);
	this.currentPlayer = ko.observable();
	this.currentModalTemplate = ko.observable('login-template');

	this.selectedMap = ko.observable(data.selectedMap);
	this.selectedTheme = ko.observable(data.selectedTheme);

	/*
	 * OBSERVABLE ARRAYS
	 */
	this.players = ko.observableArray([]);
	this.availableColors = ko.observableArray(data.availableColors);
	this.availableThemes = ko.observableArray(data.availableThemes);
	this.availableMaps = ko.observableArray(data.availableMaps);

	// init players array
	for(var i=0; i<data.players.length; i++){
		var playerData = new PlayerViewModel(data.players[i]);
		playerData.availableAvatars = data.availableAvatars;
		self.players.push(playerData);
	}

	/*
	 * COMPUTED OBSERVABLES
	 */
	this.numberOfPlayers = ko.computed(function() {
		return ko.utils.arrayFilter(self.players(), function(player) {
			return player.isActive();
		}).length;
	});

	this.computeAvailableColors = function(thisPlayer){
		var newAvailableColors = ko.utils.arrayFilter(availableColors, function(color) {
			var found = false;
			$.each(self.players(), function(key, player){
				if(player != thisPlayer && player.isActive() && player.color() == color){
					found = true;
				}
			});
			return !found;
		});
		self.availableColors(newAvailableColors);
	};

	/*
	 * METHODS
	 */
	this.getModalTemplate = function(){
		return self.currentModalTemplate();
	};

	// Options
	this.toggleSound = function(){
		if( this.sound() ) this.sound(false);
		else this.sound(true);
	};
	this.addMatchesToWin = function(){
		this.matchesToWin(this.matchesToWin()+1);
		if( this.matchesToWin() > 7 ) {
			this.matchesToWin(1);
		}
	};
	this.cycleMap = function(){
		var newIndex = self.availableMaps.indexOf(self.selectedMap()) + 1;
		if(newIndex > self.availableMaps().length-1){
			newIndex = 0;
		}
		self.selectedMap(self.availableMaps()[newIndex]);
	};
	this.cycleTheme = function(){
		var newIndex = self.availableThemes.indexOf(self.selectedTheme()) + 1;
		if(newIndex > self.availableThemes().length-1){
			newIndex = 0;
		}
		self.selectedTheme(self.availableThemes()[newIndex]);
	};


	this.setCurrentPlayer = function(player){
		self.currentPlayer(player);
		if( player.loggedin() )
			self.currentModalTemplate('profile-template');
		else
			self.currentModalTemplate('login-template');
	};

	this.signup = function(){
		$("#loginForm").submit();
		if( self.email!=undefined && self.password!=undefined )
			$.post( "ajax/signup.php",{ "username": self.email, "email": self.email, "password": self.password}).done(function( data ) {
				console.log( data );
				result = $.parseJSON( data );
				if( result.success == true){
					$('#loginModal').modal('hide');
					self.players()[0].name(self.email());
					self.players()[0].loggedin(true);
				} else alert(result.msg);
			});
		else console.log('Please fill out password and email.')
	};

	this.login = function(){
		$("#loginForm").submit();
		if( self.email!=undefined && self.password!=undefined )
			$.post( "ajax/login.php",{"email": self.email, "password": self.password}).done(function( data ) {
				console.log( data );
				result = $.parseJSON( data );
				if( result.success == true){
					$('#loginModal').modal('hide');
					self.currentPlayer.name(result.username);
					self.currentPlayer.email(result.email);
					self.currentPlayer.loggedin(true);

					if($.inArray(result.email,loggedinPlayers) == -1 ){
						loggedinPlayers.push(result.email);
						playerString = JSON.stringify(loggedinPlayers);
						localStorage.setItem("bombermanPlayers", playerString);
						console.log(localStorage.getItem("bombermanPlayers"));
					}
				} else alert(result.msg);
			});
		else console.log('Please fill out password and email.')
	};

	this.startGame = function(){
		self.gameRunning(true);
		createGame({numberOfPlayers: self.numberOfPlayers()});
	};

	/*
	 * INIT
	 */
	// todo check if local storage is available and set players as loggedin and isActive
	playerString = localStorage.getItem("bombermanPlayers");
	loggedinPlayers = $.parseJSON(playerString);

};