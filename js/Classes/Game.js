var Game = function (scene, mapOptions, materials, camera, numberOfPlayers) {
	var self = this;

	this.bombs = [];
	this.players = [];
	this.availablePowerUps = [];

	/* BOXES */
	var fixedBox = BABYLON.Mesh.CreateBox("fixedBox", mapOptions.gridSize, scene);
	fixedBox.position.y = 10000;
	fixedBox.material = materials.portalBox;
	//fixedBox.receiveShadows = true;

	var collisionBox = BABYLON.Mesh.CreateBox("collisionBox", mapOptions.gridSize, scene);
	collisionBox.position.y = 10000;
	collisionBox.visibility = 0;

	var assetsManager = new BABYLON.AssetsManager(scene);

	// define load Space Station - TODO add dynamical scene loading here to sue user choosen themes
	var spaceStationTask = assetsManager.addMeshTask("spaceStationTask", "", "models/", "spacestation2.babylon");
	spaceStationTask.onSuccess = function(task){
		var spaceStationWrapper = BABYLON.Mesh.CreateBox('stationWrapper', 0.00001, scene);

		for(var i=0; i<task.loadedMeshes.length; i++){
			task.loadedMeshes[i].receiveShadows = true;
			task.loadedMeshes[i].parent = spaceStationWrapper;
			task.loadedMeshes[i].convertToFlatShadedMesh();
			//self.shadowGenerator.getShadowMap().renderList.push(task.loadedMeshes[i]);
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
		cube.material = materials.gray;

		// init mapOptions and power ups when  cube is ready
		self.createMap(cube, fixedBox, collisionBox);

		self.initPowerUps(task.loadedMeshes[0]);
	};

	// define load background image
	var backgroundImageTask = assetsManager.addImageTask("backgroundImageTask", "images/Earth-From-Space-Space-1080x1920.jpg");

	// execute load everything
	assetsManager.load();

	assetsManager.onFinish = function (tasks) {
		// set background image
		$('#renderCanvas').css({'background': 'url('+backgroundImageTask.image.src+')'});

		// init everything that is needed
		self.createGroundAndWalls();
		self.initPlayers();
		self.flyCameraToPosition();

		var controls = new Controls(self.players, materials, self.bombs, self.shadowGenerator);
	};



	/*
	 * METHODS
	 */
	this.initLightAndShadow = function(){
		/* LIGHT */
		this.light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
		this.light.position = new BABYLON.Vector3(200, 400, 200);
		//this.light.setDirectionToTarget(new BABYLON.Vector3(0, 0, 0));

		//this.light.intensity = 0.4;

		//this.lightBulb = BABYLON.Mesh.CreateSphere("lightBulb", 16, 4, scene);
		//this.lightBulb.position = this.light.position;
		//this.lightBulb.material = materials.glowingYellow;

		//this.hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
		//this.hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
		//this.hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
		//this.hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

		/* SHADOW */
		this.shadowGenerator = new BABYLON.ShadowGenerator(4096, this.light);
		//this.shadowGenerator.usePoissonSampling = true;
		this.shadowGenerator.useBlurVarianceShadowMap = true;
		this.shadowGenerator.bias = 0.000001;
		//this.shadowGenerator.blurScale = 0.1;
		this.shadowGenerator.setTransparencyShadow(true);
	};
	self.initLightAndShadow();

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

		// TODO better not use a global variable?? -> use scene.beginDirectAnimation
		cameraAnimateable = scene.beginAnimation(camera, 239, 240, false, 1, function(){
			camera.animations = [];
		});
	};

	this.createGroundAndWalls = function(){
		/* GROUND */
		this.ground = BABYLON.Mesh.CreateGround("ground", mapOptions.width - 5, mapOptions.height - 5, 1, scene);
		this.ground.material = materials.portalGround;
		this.ground.receiveShadows = true;
		this.ground.checkCollisions = true;


		/* WALLS */
		this.wallBottom = BABYLON.Mesh.CreateBox("wallBottom", 1.0, scene);
		this.wallBottom.scaling = new BABYLON.Vector3(mapOptions.width - 3, 10, 1);
		this.wallBottom.position.z = -mapOptions.height / 2 + 2;
		this.wallBottom.material = materials.glowingRed;
		this.wallBottom.checkCollisions = true;
		//this.wallBottom.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallBottom);
		this.wallBottom.visibility = 0.3;

		this.wallTop = BABYLON.Mesh.CreateBox("wallTop", 1.0, scene);
		this.wallTop.scaling = new BABYLON.Vector3(mapOptions.width - 3, 10, 1);
		this.wallTop.position.z = mapOptions.height / 2 - 2;
		this.wallTop.material = materials.glowingRed;
		this.wallTop.checkCollisions = true;
		//this.wallTop.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallTop);
		this.wallTop.visibility = 0.3;

		this.wallLeft = BABYLON.Mesh.CreateBox("wallLeft", 1.0, scene);
		this.wallLeft.scaling = new BABYLON.Vector3(1, 10, mapOptions.height - 5);
		this.wallLeft.position.x = -mapOptions.width / 2 + 2;
		this.wallLeft.material = materials.glowingRed;
		this.wallLeft.checkCollisions = true;
		//this.wallLeft.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallLeft);
		this.wallLeft.visibility = 0.3;

		this.wallRight = BABYLON.Mesh.CreateBox("wallRight", 1.0, scene);
		this.wallRight.scaling = new BABYLON.Vector3(1, 10, mapOptions.height - 5);
		this.wallRight.position.x = mapOptions.width / 2 - 2;
		this.wallRight.material = materials.glowingRed;
		this.wallRight.checkCollisions = true;
		//this.wallRight.receiveShadows = true;
		//this.shadowGenerator.getShadowMap().renderList.push(this.wallRight);
		this.wallRight.visibility = 0.3;

	};

	this.initPlayers = function(){
		playerStartPositions = [
			new BABYLON.Vector3(-mapOptions.width / 2 + 5, 2, mapOptions.height / 2 - 5),
			new BABYLON.Vector3(mapOptions.width / 2 - 5, 2, mapOptions.height / 2 - 5),
			new BABYLON.Vector3(-mapOptions.width / 2 + 5, 2, -mapOptions.height / 2 + 5),
			new BABYLON.Vector3(mapOptions.width / 2 - 5, 2, -mapOptions.height / 2 + 5)
		];

		// TODO separate the face from the head color and load it dynamically according to user choice in the menu

		var playerMaterials = [
			materials.green,
			materials.lightBlue,
			materials.red,
			materials.yellow
		];
		var playerHeadMaterials = [
			materials.greenCute,
			materials.lightBlue,
			materials.red,
			materials.yellow
		];

		for (var i = 0; i < Math.min( numberOfPlayers, 4 ); i++) {
			var newPlayer = new Player(i+1, 'Player' + (i+1), playerMaterials[i], playerHeadMaterials[i], playerStartPositions[i], scene, materials.glowingPurple, camera);
			for(var j=0; j<newPlayer.bodyParts.length; j++) {
				self.shadowGenerator.getShadowMap().renderList.push(newPlayer.bodyParts[j]);
				newPlayer.bodyParts[j].isPlayerAvatar = true;
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
				player.speed += 3;
				setTimeout(function(){
					player.speed -= 3;
					player.stopInfection();
				}, 10000);
			},
			function (player) {
				console.log('random effect 2 - slow');
				player.startInfection();
				var originalPlayerSpeed = player.speed;
				player.speed = 1;
				setTimeout(function(){
					player.speed = originalPlayerSpeed;
					player.stopInfection();
				}, 10000);
			},
			// TODO super strength, pushing bombs, normal speed upgrade
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

	/*
	 * creates a default grid for a map
	 * and then adds it's components to the scene
	 */
	this.createMap = function(box, fixedBox, collisionBox) {

		var width = Math.floor(mapOptions.width/mapOptions.gridSize);
		var height = Math.floor(mapOptions.height/mapOptions.gridSize);
		var gridSize = mapOptions.gridSize;
		var grid = [];

		// starting positions in the format 'x-y'
		var startingPositions = [
			'1-1',                      // the 3 top left corner tiles
			'2-1',
			'1-2',
			width-1 + '-1',             // the 3 top right corner tiles
			width-2 + '-1',
			width-1 + '-2',
			'1-' + (height-1),          // the 3 bottom left corner tiles
			'2-' + (height-1),
			'1-' + (height-2),
			width-1 + '-' + (height-1),  // the 3 bottom right corner tiles
			width-2 + '-' + (height-1),
			width-1 + '-' + (height-2)
		];

		for (var y=1; y < height; y++) {

			grid[y] = [];
			for (var x=1; x < width; x++) {

				var boxInGrid;

				// only place boxes if the current tile is not a player starting position
				if(startingPositions.indexOf( x + '-' + y) == -1) {

					// calculate the position for the box
					var newBoxPosition = new BABYLON.Vector3(
						x * gridSize - width * gridSize / 2,   // x
						2.5,                                   // y
						y * gridSize - height * gridSize / 2   // z
					);

					if ( x % 2 == 0 && y % 2 == 0) {
						// place fixed box
						var fixedBoxClone = fixedBox.createInstance("x" + x + "y" + y);
						fixedBoxClone.position = newBoxPosition;
						fixedBoxClone.applyGravity = true;
						fixedBoxClone.receiveShadows = true;
						fixedBoxClone.isFixedBox = true;
						fixedBoxClone.checkCollisions = true;
						self.shadowGenerator.getShadowMap().renderList.push(fixedBoxClone);
						boxInGrid = fixedBoxClone;
					} else if (Math.random() < 0.2) {
						// place destroyable box
						var name = "cube-x" + x + "y" + y;
						// finally create the box it self and add it to the grid
						boxInGrid = new Box(scene, newBoxPosition, box, collisionBox, name, self.shadowGenerator, self.availablePowerUps, self.players);
					}

					// add the fixed or destroyable box to the grid
					grid[y][x] = boxInGrid;
				}

			}

		}


		//TODO add ramps to the mapOptions??
		var box2 = BABYLON.Mesh.CreateBox("box1", 5, scene);
		box2.scaling.z = 2.2;
		box2.scaling.y = 0.05;
		box2.position.y = 2.5;
		box2.position.x = -5;
		box2.position.z = 3;
		box2.checkCollisions = true;
		box2.rotate(BABYLON.Axis.X, .5, BABYLON.Space.LOCAL);

	};

};
