var Game = function (scene, map, materials, players) {
	var self = this;

	this.bombs = [];
	this.availablePowerUps = [];

	/* LIGHT */
	this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
	this.light.position = new BABYLON.Vector3(40, 50, 40);
	this.light.intensity = 0.5;
	//light.range = 300;
	this.lightBulb = BABYLON.Mesh.CreateSphere("lightBulb", 16, 4, scene);
	this.lightBulb.position = this.light.position;
	this.lightBulb.material = materials.yellow;

	this.hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	this.hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
	this.hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
	this.hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

	/* SHADOW */
	this.shadowGenerator = new BABYLON.ShadowGenerator(8192, this.light);
	this.shadowGenerator.useVarianceShadowMap = false;
	this.shadowGenerator.usePoissonSampling = true;
	this.shadowGenerator.setTransparencyShadow(true);

	// shadows for players
	for(var i=0; i<players.length; i++){
		// TODO move adding players to game object
		self.shadowGenerator.getShadowMap().renderList.push(players[i].avatar);
	}


	/* GROUND */
	this.ground = BABYLON.Mesh.CreateGround("ground", map.width - 5, map.height - 5, 1, scene);
	this.ground.material = materials.portalGround;
	this.ground.receiveShadows = true;
	this.ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});


	/* WALLS */
	this.wallBottom = BABYLON.Mesh.CreateBox("wallBottom", 1.0, scene);
	this.wallBottom.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
	this.wallBottom.position.z = -map.height / 2 + 2;
	this.wallBottom.material = materials.mat;
	this.wallBottom.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
	this.wallBottom.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallBottom);

	this.wallTop = BABYLON.Mesh.CreateBox("wallTop", 1.0, scene);
	this.wallTop.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
	this.wallTop.position.z = map.height / 2 - 2;
	this.wallTop.material = materials.mat;
	this.wallTop.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
	this.wallTop.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallTop);

	this.wallLeft = BABYLON.Mesh.CreateBox("wallLeft", 1.0, scene);
	this.wallLeft.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
	this.wallLeft.position.x = -map.width / 2 + 2;
	this.wallLeft.material = materials.mat;
	this.wallLeft.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
	this.wallLeft.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallLeft);

	this.wallRight = BABYLON.Mesh.CreateBox("wallRight", 1.0, scene);
	this.wallRight.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
	this.wallRight.position.x = map.width / 2 - 2;
	this.wallRight.material = materials.mat;
	this.wallRight.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
	this.wallRight.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallRight);

	/* BOXES */
	var fixedBox = BABYLON.Mesh.CreateBox("fixedBox", 5, scene);
	fixedBox.position.y = 10000;
	fixedBox.material = materials.portalBox;

	// load models and init map and power ups when ready
	BABYLON.SceneLoader.ImportMesh("Cube", "models/", "cube.babylon", scene, function (meshes) {
		var cube = meshes[0];
		cube.position.y = -10;
		cube.isVisible = true;
		cube.scaling = new BABYLON.Vector3(2.1, 2.1, 2.1);
		cube.receiveShadows = true;
		cube.material = materials.gray;
		self.shadowGenerator.getShadowMap().renderList.push(cube);

		self.initPowerUps(meshes[0]);

		self.createMap(cube, fixedBox);

	});



	self.initPowerUps = function (powerUpTemplate) {

		powerUpLimit = powerUpTemplate.clone();
		powerUpLimit.material = materials.blue;
		powerUpLimit.position.y = -15;
		powerUpLimit.powerUpEffect = function (player) {
			player.limit += 1;
		};
		self.availablePowerUps.push(powerUpLimit);

		powerUpRange = powerUpTemplate.clone();
		powerUpRange.material = materials.yellow;
		powerUpRange.position.y = -20;
		powerUpRange.powerUpEffect = function (player) {
			player.range += 5;
		};
		self.availablePowerUps.push(powerUpRange);

		powerUpRandom = powerUpTemplate.clone();
		powerUpRandom.material = materials.glowingPurple;
		powerUpRandom.position.y = -25;
		var randomEffects = [
			function (player) {
				console.log('random effect 1 - speed');
				player.startInfection();
				var originalPlayerSpeed = player.speed;
				player.speed = 30;
				setTimeout(function(){
					player.speed = originalPlayerSpeed;
					player.stopInfection();
				}, 10000);
			},
			function (player) {
				console.log('random effect 2 - slow');
				player.startInfection();
				var originalPlayerSpeed = player.speed;
				player.speed = 5;
				setTimeout(function(){
					player.speed = originalPlayerSpeed;
					player.stopInfection();
				}, 10000);
			},
			/*
			function (player) {
				console.log('random effect 3 - super strength');
				player.startInfection();
				player.avatar.impostor = player.avatar.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
					mass: 10000000000,
					friction: 0.001,
					restitution: 0.999
				});
				setTimeout(function(){
					player.avatar.impostor = player.avatar.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
						mass: 100,
						friction: 0.001,
						restitution: 0.999
					});
					player.stopInfection();
				}, 10000);
			},
			*/
			function (player) {
				console.log('random effect 4 - invisible');
				player.startInfection();
				player.avatar.visibility = 0.01;
				setTimeout(function(){
					player.avatar.visibility = 1;
					player.stopInfection();
				}, 10000);
			},
			function (player) {
				console.log('random effect 5 - no bombs');
				player.startInfection();
				player.noBombs = true;
				setTimeout(function(){
					player.noBombs = false;
					player.stopInfection();
				}, 10000);
			},
			function (player) {
				console.log('random effect 5 - bombs nonstop');
				player.startInfection();
				var bombsNonstop = setInterval(function(){
					player.placeBomb(self.bombs, materials.black, players, self.shadowGenerator);
				}, 200);
				setTimeout(function(){
					clearInterval(bombsNonstop);
					player.stopInfection();
				}, 10000);
			}
		];
		powerUpRandom.powerUpEffect = function(player){
			// trigger random effect
			var randomIndex = Math.floor(Math.random() * randomEffects.length);
			randomEffects[randomIndex](player);
		};
		self.availablePowerUps.push(powerUpRandom);

	};

	this.createMap = function(box, fixedBox) {
		// TODO use a grid system to place boxes and handle their state
		for (var y = -5; y < map.height - 10; y++) {
			for (var x = -5; x < map.width - 10; x++) {
				if (x % 5 == 0 && y % 5 == 0) {
					if ((x % 10 != 0 || y % 10 != 0) && Math.random() < 0.2) {
						var newBoxPosition = new BABYLON.Vector3(x + 10 - map.width / 2, 3, y + 10 - map.height / 2);
						var name = "cube-x" + x + "y" + y;
						new Box(scene, newBoxPosition, box, name, self.shadowGenerator, self.availablePowerUps, players);
					}
					if (x % 10 == 0 && y % 10 == 0) {
						var fixedBoxInstance = fixedBox.createInstance("x" + x + "y" + y);
						fixedBoxInstance.position = new BABYLON.Vector3(x + 10 - map.width / 2, 2.5, y + 10 - map.height / 2);
						fixedBoxInstance.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 0,
							friction: 0.001,
							restitution: 0.001
						});
						fixedBoxInstance.applyGravity = true;
						fixedBoxInstance.receiveShadows = true;
						fixedBoxInstance.isFixedBox = true;
						self.shadowGenerator.getShadowMap().renderList.push(fixedBoxInstance);
					}
				}
			}
		}
	};

	this.update = function () {
		// move players
		for (var i = 0; i < players.length; i++) {
			players[i].move();
		}

		// move light
		self.light.position.x = Math.sin(new Date().getTime() / 10000) * 60;
		self.light.position.z = Math.cos(new Date().getTime() / 10000) * 60;
		self.light.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));

	};

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

	// TODO put in controller class??
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
						players[i].placeBomb(self.bombs, materials.black, players, self.shadowGenerator);
						break;
				}
			}
		}
	};

	// TODO put in controller class??
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
	// TODO put in controller class??
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
