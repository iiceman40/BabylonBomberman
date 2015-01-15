$(document).ready(function(){

	loggedinPlayers = [];

	// tooltips
	$('.option').tooltip();
	$('body').tooltip({
		selector: "[data-tooltip=tooltip]",
		container: "body"
	});

	/*
	 * View Model
	 */
	var PlayerViewModel = function(data){
		var thisPlayer = this;

		// observables
		this.active = ko.observable(data.active);
		this.loggedin = ko.observable(data.loggedin);
		this.email = ko.observable();
		this.name = ko.observable(data.name);
		this.name.focused = ko.observable();

		this.color = ko.observable(data.color);
		this.avatar = ko.observable(data.avatar);

		// methods
		this.togglePlayer = function(){
			thisPlayer.active(!thisPlayer.active());
		};

		// subscriptions
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
	var playerArray = [
		new PlayerViewModel({name: 'Cute', avatar: 'bman_v1', color: 'success', active: true, loggedin: false}),
		new PlayerViewModel({name: 'Sad', avatar: 'bman_v4', color: 'warning', active: false, loggedin: false}),
		new PlayerViewModel({name: 'Angry', avatar: 'bman_v2', color: 'danger', active: false, loggedin: false}),
		new PlayerViewModel({name: 'Weird', avatar: 'bman_v3', color: 'info', active: false, loggedin: false})
	];

	var ViewModel = function(players) {
		var self = this;

		this.gameRunning = ko.observable(false);

		// Data
		this.email = ko.observable();
		this.password = ko.observable();
		this.matchesToWin = ko.observable(3);
		this.sound = ko.observable(true);
		this.players = ko.observableArray(players);
		this.currentPlayer = ko.observable();
		this.currentModalTemplate = ko.observable('login-template');

		this.numberOfPlayers = ko.computed(function() {
			return ko.utils.arrayFilter(self.players(), function(player) {
				return player.active();
			}).length;
		});

		// Operations
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
			if( this.matchesToWin() > 7 )
				this.matchesToWin(1);
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

		// todo check if local storage is available and set players as loggedin and active
		playerString = localStorage.getItem("bombermanPlayers");
		loggedinPlayers = $.parseJSON(playerString);

		this.startGame = function(){
			self.gameRunning(true);
			createGame({numberOfPlayers: self.numberOfPlayers()});
		}

	};

	// load templates and apply bindings
	var loadTemplates = function(templatesToLoad) {
		var templateName = templatesToLoad.pop();
		$.get('templates/' + templateName + '.html', function(template) {
			$('#templates').append('<script type="text/html" id="' + templateName + '-template">' + template + '</script>');

			if(templatesToLoad.length > 0){
				loadTemplates(templatesToLoad);
			} else {
				ko.applyBindings( new ViewModel(playerArray) );
			}
		});
	};

	var templatesToLoad = ['login', 'profile', 'player'];
	loadTemplates(templatesToLoad);

});