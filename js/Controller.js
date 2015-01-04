$(document).ready(function () {
	var map = {
		height: 60,
		width: 100
	};

	var bombs = [];
	var availablePowerUps = [];

	// Get the canvas element from our HTML above
	var canvas = document.getElementById("renderCanvas");

	// Load the BABYLON 3D engine
	var engine = new BABYLON.Engine(canvas, true);

	var scene = new BABYLON.Scene(engine);
	scene.enablePhysics(new BABYLON.Vector3(0, -50, 0), new BABYLON.OimoJSPlugin());

	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", -1.57079633, 0, 80, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());

	var materials = new Materials(scene);

	var game = new Game(scene, map, materials, availablePowerUps);
	var light = game.light;
	var shadowGenerator = game.shadowGenerator;

	/* PLAYERS */
	var players = [];
	players.push(new Player('Player1', materials.green, new BABYLON.Vector3(-map.width / 2 + 5, 10, map.height / 2 - 5), scene));
	players.push(new Player('Player2', materials.blue, new BABYLON.Vector3(map.width / 2 - 5, 10, -map.height / 2 + 5), scene));
	players.push(new Player('Player3', materials.red, new BABYLON.Vector3(-map.width / 2 + 5, 10, -map.height / 2 + 5), scene));
	players.push(new Player('Player4', materials.yellow, new BABYLON.Vector3(map.width / 2 - 5, 10, map.height / 2 - 5), scene));

	/* BOXES */
	var fixedBox = BABYLON.Mesh.CreateBox("fixedBox", 5, scene);
	fixedBox.position.y = 10000;
	fixedBox.material = materials.portalBox;


	BABYLON.SceneLoader.ImportMesh("Cube", "models/", "cube.babylon", scene, function (meshes) {
		var cube = meshes[0];
		cube.position.y = -10;
		cube.isVisible = true;
		cube.scaling = new BABYLON.Vector3(2.1, 2.1, 2.1);
		cube.receiveShadows = true;
		cube.material = materials.gray;
		shadowGenerator.getShadowMap().renderList.push(cube);

		powerUpLimit = meshes[0].clone();
		powerUpLimit.material = materials.blue;
		powerUpLimit.position.y = -15;
		powerUpLimit.powerUpEffect = function (player) {
			player.limit += 1;
		};
		availablePowerUps.push(powerUpLimit);

		powerUpRange = meshes[0].clone();
		powerUpRange.material = materials.yellow;
		powerUpRange.position.y = -20;
		powerUpRange.powerUpEffect = function (player) {
			player.range += 5;
		};
		availablePowerUps.push(powerUpRange);

		createMap(cube, fixedBox);

	});

	/* RENDERING */
	stats = $('#stats');
	statsVisible = false;
	stats.click(function () {
		if (statsVisible) {
			statsVisible = false;
			scene.debugLayer.hide();
		} else {
			statsVisible = true;
			scene.debugLayer.show();
		}
	});
	var showStats = stats;

	engine.runRenderLoop(function () {
		scene.render();
		showStats.text((BABYLON.Tools.GetFps().toFixed()));
	});

	scene.registerBeforeRender(function () {
		update();
	});


	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () {
		engine.resize();
	});


	/* KEYBOARD */
	window.addEventListener("keyup", function (evt) {
		handleKeyUp(evt.keyCode);
	});

	window.addEventListener("keydown", function (evt) {
		handleKeyDown(evt.keyCode);
	});

	// TODO put in config file
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

	var gamepadConnected = function (gamepad) {
		var playerIndex = gamepad.index + 2; // since the first 2 players controlled by the keyboad for now
		var player = players[playerIndex];

		console.log(navigator.getGamepads(), playerIndex);

		if(player){
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
				player.placeBomb(bombs, materials.black, players, shadowGenerator);
			});

			gamepad.onbuttonup(function (buttonIndex) {
			});
		}

	};

	var gamepads = new BABYLON.Gamepads(gamepadConnected);


	var update = function () {
		// move players
		for (var i = 0; i < players.length; i++) {
			players[i].move();
		}

		// move light
		light.position.x = Math.sin(new Date().getTime() / 10000) * 60;
		light.position.z = Math.cos(new Date().getTime() / 10000) * 60;
		light.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));

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

	// TODO move to Game Class??
	function createMap(box, fixedBox) {
		// TODO use a grid system to place boxes and handle their state
		for (var y = -5; y < map.height - 10; y++) {
			for (var x = -5; x < map.width - 10; x++) {
				if (x % 5 == 0 && y % 5 == 0) {
					if ((x % 10 != 0 || y % 10 != 0) && Math.random() < 0.2) {
						var newBoxPosition = new BABYLON.Vector3(x + 10 - map.width / 2, 3, y + 10 - map.height / 2);
						var name = "cube-x" + x + "y" + y;
						new Box(scene, newBoxPosition, box, name, shadowGenerator, availablePowerUps, players);
					}
					if (x % 10 == 0 && y % 10 == 0) {
						var fixedBoxInstance = fixedBox.createInstance("x" + x + "y" + y);
						fixedBoxInstance.position = new BABYLON.Vector3(x + 10 - map.width / 2, 2.5, y + 10 - map.height / 2);
						fixedBoxInstance.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 0,
							friction: 0,
							restitution: 0.1
						});
						fixedBoxInstance.applyGravity = true;
						fixedBoxInstance.receiveShadows = true;
						fixedBoxInstance.isFixedBox = true;
						shadowGenerator.getShadowMap().renderList.push(fixedBoxInstance);
					}
				}
			}
		}
	}

});