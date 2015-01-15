var Game = function (scene, map, materials, camera, numberOfPlayers) {
	var self = this;

	this.bombs = [];
	this.players = [];
	this.availablePowerUps = [];

	/* BOXES */
	var fixedBox = BABYLON.Mesh.CreateBox("fixedBox", 5, scene);
	fixedBox.position.y = 10000;
	fixedBox.material = materials.portalBox;
	fixedBox.receiveShadows = true;

	var assetsManager = new BABYLON.AssetsManager(scene);

	// define load Space Station
	var spaceStationTask = assetsManager.addMeshTask("spaceStationTask", "", "models/", "spacestation2.babylon");
	spaceStationTask.onSuccess = function(task){
		self.initLightAndShadow();
		var spaceStationWrapper = BABYLON.Mesh.CreateBox('stationWrapper', 0.00001, scene);

		for(var i=0; i<task.loadedMeshes.length; i++){
			task.loadedMeshes[i].receiveShadows = true;
			task.loadedMeshes[i].parent = spaceStationWrapper;
			task.loadedMeshes[i].convertToFlatShadedMesh();
			self.shadowGenerator.getShadowMap().renderList.push(task.loadedMeshes[i]);
		}

		spaceStationWrapper.position.y = 42.2;
		spaceStationWrapper.position.z = 80;
		spaceStationWrapper.position.x = 403;
		spaceStationWrapper.rotation.x = Math.PI/2;
		spaceStationWrapper.rotation.y = Math.PI/2;
		spaceStationWrapper.scaling = new BABYLON.Vector3(500,500,500);
	};

	// define load Cube
	var cubeTask = assetsManager.addMeshTask("cubeTask", "", "models/", "cube.babylon");
	cubeTask.onSuccess = function(task){
		for(var i=0; i<task.loadedMeshes.length; i++){
			task.loadedMeshes[i].isVisible = false;
		}

		var cube = task.loadedMeshes[0];
		cube.position.y = -10;
		cube.isVisible = true;
		cube.scaling = new BABYLON.Vector3(2.1, 2.1, 2.1);
		cube.receiveShadows = true;
		cube.material = materials.gray;
		self.shadowGenerator.getShadowMap().renderList.push(cube);

		// init map and power ups when  cube is ready
		self.createMap(cube, fixedBox);
		self.initPowerUps(task.loadedMeshes[0]);
	};

	// define load background image
	var backgroundImageTask = assetsManager.addImageTask("backgroundImageTask", "http://fusionflight.com/wp-content/uploads/2014/08/Earth-From-Space-Space-1080x1920.jpg");

	// execute load everything
	assetsManager.load();

	assetsManager.onFinish = function (tasks) {
		// set background image
		$('#renderCanvas').css({'background': 'url('+backgroundImageTask.image.src+')'});

		// init everything that is needed
		self.createGroundAndWalls();
		self.initPlayers();
		self.flyCameraToPosition();
	};



	/*
	 * METHODS
	 */
	this.initLightAndShadow = function(){
		/* LIGHT */
		this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, 0, 0), scene);
		this.light.position = new BABYLON.Vector3(
			40,
			100,
			-40
		);
		this.light.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));
		this.light.intensity = 0.6;
		this.light.range = 5000;
		this.lightBulb = BABYLON.Mesh.CreateSphere("lightBulb", 16, 4, scene);
		this.lightBulb.position = this.light.position;
		this.lightBulb.material = materials.glowingYellow;

		this.hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
		this.hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
		this.hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
		this.hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

		/* SHADOW */
		this.shadowGenerator = new BABYLON.ShadowGenerator(4096, this.light); //8192
		this.shadowGenerator.useVarianceShadowMap = false;
		this.shadowGenerator.usePoissonSampling = true;
		this.shadowGenerator.setTransparencyShadow(true);
	};

	this.flyCameraToPosition = function() {
		var animationCameraDistance = new BABYLON.Animation("cameraDistanceAnimation", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var keyFramesCameraDistance = [
			{frame: 0, value: function(){return camera.radius}},
			{frame: 19, value: function(){return camera.radius}},
			{frame: 20, value: 2000},
			{frame: 240, value: 80}
		];
		animationCameraDistance.setKeys(keyFramesCameraDistance);
		camera.animations.push(animationCameraDistance);

		var animationCameraAngle = new BABYLON.Animation("cameraAngleAnimation", "beta", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var keyFramesCameraAngle = [
			{frame: 0, value: function(){return camera.beta}},
			{frame: 19, value: function(){return camera.beta}},
			{frame: 20, value: 3.0},
			{frame: 240, value: 0.01}
		];
		animationCameraAngle.setKeys(keyFramesCameraAngle);
		camera.animations.push(animationCameraAngle);

		var animationCameraAngle2 = new BABYLON.Animation("cameraAngle2Animation", "alpha", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var keyFramesCameraAngle2 = [
			{frame: 0, value: function(){return camera.alpha}},
			{frame: 19, value: function(){console.log(camera.alpha); return camera.alpha}},
			{frame: 20, value: 3.0},
			{frame: 240, value: -1.57079633}
		];
		animationCameraAngle2.setKeys(keyFramesCameraAngle2);
		camera.animations.push(animationCameraAngle2);

		// Creating an easing function
		var easingFunction = new BABYLON.QuadraticEase();
		// For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
		easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
		// Adding the easing function to the animation
		animationCameraDistance.setEasingFunction(easingFunction);
		animationCameraAngle.setEasingFunction(easingFunction);
		animationCameraAngle2.setEasingFunction(easingFunction);

		// TODO better not use a global variable??
		cameraAnimateable = scene.beginAnimation(camera, 20, 240, false, 1, function(){
			console.log('DEBUG - animation ended');
			camera.animations = [];
		});
	};

	this.createGroundAndWalls = function(){
		/* GROUND */
		this.ground = BABYLON.Mesh.CreateGround("ground", map.width - 5, map.height - 5, 1, scene);
		this.ground.material = materials.portalGround;
		this.ground.receiveShadows = true;
		this.ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});


		/* WALLS */
		this.wallBottom = BABYLON.Mesh.CreateBox("wallBottom", 1.0, scene);
		this.wallBottom.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
		this.wallBottom.position.z = -map.height / 2 + 2;
		this.wallBottom.material = materials.glowingRed;
		this.wallBottom.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
		//this.wallBottom.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallBottom);
		this.wallBottom.visibility = 0.3;

		this.wallTop = BABYLON.Mesh.CreateBox("wallTop", 1.0, scene);
		this.wallTop.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
		this.wallTop.position.z = map.height / 2 - 2;
		this.wallTop.material = materials.glowingRed;
		this.wallTop.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
		//this.wallTop.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallTop);
		this.wallTop.visibility = 0.3;

		this.wallLeft = BABYLON.Mesh.CreateBox("wallLeft", 1.0, scene);
		this.wallLeft.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
		this.wallLeft.position.x = -map.width / 2 + 2;
		this.wallLeft.material = materials.glowingRed;
		this.wallLeft.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
		//this.wallLeft.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallLeft);
		this.wallLeft.visibility = 0.3;

		this.wallRight = BABYLON.Mesh.CreateBox("wallRight", 1.0, scene);
		this.wallRight.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
		this.wallRight.position.x = map.width / 2 - 2;
		this.wallRight.material = materials.glowingRed;
		this.wallRight.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.001, friction: 0.001});
		//this.wallRight.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallRight);
		this.wallRight.visibility = 0.3;
	};

	this.initPlayers = function(){
		playerStartPositions = [
			new BABYLON.Vector3(-map.width / 2 + 5, 10, map.height / 2 - 5),
			new BABYLON.Vector3(map.width / 2 - 5, 10, -map.height / 2 + 5),
			new BABYLON.Vector3(-map.width / 2 + 5, 10, -map.height / 2 + 5),
			new BABYLON.Vector3(map.width / 2 - 5, 10, map.height / 2 - 5)
		];
		var playerMaterials = [
			materials.green,
			materials.blue,
			materials.red,
			materials.yellow
		];
		var playerHeadMaterials = [
			materials.greenCute,
			materials.blue,
			materials.red,
			materials.yellow
		];

		for (var i = 0; i < Math.min( numberOfPlayers, 4 ); i++) {
			var newPlayer = new Player('Player' + (i+1), playerMaterials[i], playerHeadMaterials[i], playerStartPositions[i], scene, materials.glowingPurple, camera);
			for(var j=0; j<newPlayer.bodyParts.length; j++) {
				self.shadowGenerator.getShadowMap().renderList.push(newPlayer.bodyParts[j]);
			}
			self.players.push(newPlayer);
		}
	};

	self.initPowerUps = function (powerUpTemplate) {
		powerUpTemplate.isVisible = false;

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
				for(var i=0; i<player.bodyParts.length; i++){
					player.bodyParts[i].visibility = 0.01;
				}
				setTimeout(function(){
					for(var i=0; i<player.bodyParts.length; i++){
						player.bodyParts[i].visibility = 1;
					}
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
					player.placeBomb(self.bombs, materials.black, self.players, self.shadowGenerator);
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
						var newBoxPosition = new BABYLON.Vector3(x + 10 - map.width / 2, 2.5, y + 10 - map.height / 2);
						var name = "cube-x" + x + "y" + y;
						new Box(scene, newBoxPosition, box, name, self.shadowGenerator, self.availablePowerUps, self.players);
					}
					if (x % 10 == 0 && y % 10 == 0) {
						var fixedBoxClone = fixedBox.createInstance("x" + x + "y" + y);
						fixedBoxClone.position = new BABYLON.Vector3(x + 10 - map.width / 2, 2.5, y + 10 - map.height / 2);
						fixedBoxClone.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 0,
							friction: 0.001,
							restitution: 0.001
						});
						fixedBoxClone.applyGravity = true;
						fixedBoxClone.receiveShadows = true;
						fixedBoxClone.isFixedBox = true;
						self.shadowGenerator.getShadowMap().renderList.push(fixedBoxClone);
					}
				}
			}
		}
	};

	this.update = function () {
		// move self.players
		for (var i = 0; i < self.players.length; i++) {
			self.players[i].move();
		}
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
		for (var i = 0; i < self.players.length; i++) {
			if(DIRECTIONS['PLAYER'+i]) {
				switch (keycode) {
					case DIRECTIONS['PLAYER' + i].TOP :
						self.players[i].chooseDirection(0, 1);
						break;
					case DIRECTIONS['PLAYER' + i].BOT :
						self.players[i].chooseDirection(1, 1);
						break;
					case DIRECTIONS['PLAYER' + i].LEFT :
						self.players[i].chooseDirection(2, 1);
						break;
					case DIRECTIONS['PLAYER' + i].RIGHT :
						self.players[i].chooseDirection(3, 1);
						break;
					case DIRECTIONS['PLAYER' + i].BOMB:
						self.players[i].placeBomb(self.bombs, materials.black, self.players, self.shadowGenerator);
						break;
				}
			}
		}
	};

	// TODO put in controller class??
	var handleKeyUp = function (keycode) {
		for (var i = 0; i < self.players.length; i++) {
			if(DIRECTIONS['PLAYER'+i]) {
				switch (keycode) {
					case DIRECTIONS['PLAYER' + i].TOP :
						self.players[i].chooseDirection(0, 0);
						break;
					case DIRECTIONS['PLAYER' + i].BOT :
						self.players[i].chooseDirection(1, 0);
						break;
					case DIRECTIONS['PLAYER' + i].LEFT :
						self.players[i].chooseDirection(2, 0);
						break;
					case DIRECTIONS['PLAYER' + i].RIGHT :
						self.players[i].chooseDirection(3, 0);
						break;
				}
			}
		}
	};

	/* GAMEPADS */
	// TODO put in controller class??
	var gamepadConnected = function (gamepad) {
		// since the first 2 self.players are controlled by the keyboard start with the third player
		var playerIndex = gamepad.index + 2;
		var player = self.players[playerIndex];

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
				player.placeBomb(self.bombs, materials.black, self.players, self.shadowGenerator);
			});

			gamepad.onbuttonup(function (buttonIndex) {
			});
		}

	};

	if(self.players.length > 2) {
		var gamepads = new BABYLON.Gamepads(gamepadConnected);
	}

};
