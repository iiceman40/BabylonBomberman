var Controls = function (players, materials, bombs, shadowGenerator) {
	var self = this;

	/* KEYBOARD */
	window.addEventListener("keyup", function (evt) {
		handleKeyUp(evt.keyCode);
	});

	window.addEventListener("keydown", function (evt) {
		handleKeyDown(evt.keyCode);
	});

	// TODO put in config file and make available for dynamic configuration
	DIRECTIONS = {
		// WASD
		PLAYER0: {
			TOP: 87,
			BOT: 83,
			LEFT: 65,
			RIGHT: 68,
			BOMB: 32
		},
		// NUMPAD
		PLAYER1: {
			TOP: 104,
			BOT: 101,
			LEFT: 100,
			RIGHT: 102,
			BOMB: 96
		}
	};

	var handleKeyDown = function (keycode) {
		for (var i = 0; i < players.length; i++) {
			if(DIRECTIONS['PLAYER'+i]) {
				switch (keycode) {
					case DIRECTIONS['PLAYER' + i].TOP :
						players[i].chooseDirection(0, 1);
						break;
					case DIRECTIONS['PLAYER' + i].BOT :
						players[i].chooseDirection(1, 1);
						break;
					case DIRECTIONS['PLAYER' + i].LEFT :
						players[i].chooseDirection(2, 1);
						break;
					case DIRECTIONS['PLAYER' + i].RIGHT :
						players[i].chooseDirection(3, 1);
						break;
					case DIRECTIONS['PLAYER' + i].BOMB:
						players[i].placeBomb(bombs, materials.black, players, shadowGenerator);
						break;
				}
			}
		}
	};

	var handleKeyUp = function (keycode) {
		for (var i = 0; i < players.length; i++) {
			if(DIRECTIONS['PLAYER'+i]) {
				switch (keycode) {
					case DIRECTIONS['PLAYER' + i].TOP :
						players[i].chooseDirection(0, 0);
						break;
					case DIRECTIONS['PLAYER' + i].BOT :
						players[i].chooseDirection(1, 0);
						break;
					case DIRECTIONS['PLAYER' + i].LEFT :
						players[i].chooseDirection(2, 0);
						break;
					case DIRECTIONS['PLAYER' + i].RIGHT :
						players[i].chooseDirection(3, 0);
						break;
				}
			}
		}
	};

	/* GAMEPADS */
	var gamepadConnected = function (gamepad) {
		// since the first 2 players are controlled by the keyboard start with the third player
		var playerIndex = gamepad.index + 2;
		var player = players[playerIndex];

		console.log(navigator.getGamepads(), playerIndex);

		if(player){
			// TODO somehow use DIRECTIONS configuration to create dynamically configurable controls
			gamepad.onleftstickchanged(function (values) {
				if (Math.round(values.y) < 0)
					player.chooseDirection(0, 1);
				if (Math.round(values.y) > 0)
					player.chooseDirection(1, 1);
				if (Math.round(values.x) < 0)
					player.chooseDirection(2, 1);
				if (Math.round(values.x) > 0)
					player.chooseDirection(3, 1);

				if (Math.round(values.y) == 0) {
					player.chooseDirection(0, 0);
					player.chooseDirection(1, 0);
				}
				if (Math.round(values.x) == 0) {
					player.chooseDirection(2, 0);
					player.chooseDirection(3, 0);
				}
			});

			gamepad.onbuttondown(function (buttonIndex) {
				player.placeBomb(self.bombs, materials.black, players, self.shadowGenerator);
			});

			gamepad.onbuttonup(function (buttonIndex) {
			});
		}

	};

	if(players.length > 2) {
		var gamepads = new BABYLON.Gamepads(gamepadConnected);
	}

};
