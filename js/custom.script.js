$(document).ready(function(){
	var map = {
		height: 60,
		width: 100
	};

	// Get the canvas element from our HTML above
	var canvas = document.getElementById("renderCanvas");

	// Load the BABYLON 3D engine
	var engine = new BABYLON.Engine(canvas, true);
	
	var scene = new BABYLON.Scene(engine);
	scene.enablePhysics(new BABYLON.Vector3(0, -50, 0), new BABYLON.OimoJSPlugin());

	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", -1.57079633, 0, 100, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());


	/* MATERIALS */
	var mat = new BABYLON.StandardMaterial("mat", scene);
	mat.diffuseColor = BABYLON.Color3.FromInts(121, 189, 224);

	var gray = new BABYLON.StandardMaterial("gray", scene);
	gray.diffuseColor = BABYLON.Color3.FromInts(115, 135, 155);
	gray.specularPower = 1000;

	var green = new BABYLON.StandardMaterial("green", scene);
	green.diffuseColor = BABYLON.Color3.Green();

	var red = new BABYLON.StandardMaterial("red", scene);
	red.diffuseColor = BABYLON.Color3.Red();

	var blue = new BABYLON.StandardMaterial("blue", scene);
	blue.diffuseColor = BABYLON.Color3.Blue();

	var yellow = new BABYLON.StandardMaterial("yellow", scene);
	yellow.diffuseColor = BABYLON.Color3.Yellow();

	var black = new BABYLON.StandardMaterial("black", scene);
	black.diffuseColor = BABYLON.Color3.Black();

	var portalGround = new BABYLON.StandardMaterial("portalGround", scene);
	portalGround.diffuseTexture = new BABYLON.Texture("textures/portal-tile-dark.jpg", scene);
	portalGround.diffuseTexture.uScale = 19.0;
	portalGround.diffuseTexture.vScale = 11.0;
	portalGround.diffuseTexture.uOffset = 0.5;
	/*
	portalGround.specularColor =  BABYLON.Color3.Gray();
	portalGround.bumpTexture = new BABYLON.Texture("textures/portal-tile-dark-normalmap.jpg", scene);
	portalGround.bumpTexture.uScale = 19.0;
	portalGround.bumpTexture.vScale = 11.0;
	*/

	var portalBox = new BABYLON.StandardMaterial("portalGround", scene);
	portalBox.diffuseTexture = new BABYLON.Texture("textures/portal-tile.jpg", scene);
	portalBox.specularColor =  BABYLON.Color3.White();
	portalBox.bumpTexture = new BABYLON.Texture("textures/portal-tile-normalmap2.jpg", scene);


	/* LIGHT */
	var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
	light.position = new BABYLON.Vector3(40, 50, 40);
	light.intensity = 1;
	//light.range = 300;
	var lightBulb = BABYLON.Mesh.CreateSphere("lightBulb", 16, 4, scene);
	lightBulb.position = light.position;
	lightBulb.material = yellow;

	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
	hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
	hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

	/* SHADOW */
	var shadowGenerator = new BABYLON.ShadowGenerator(8192, light);
	shadowGenerator.useVarianceShadowMap = false;
	shadowGenerator.usePoissonSampling = true;


	/* GROUND */
	var ground = BABYLON.Mesh.CreateGround("ground", map.width - 5, map.height - 5, 1, scene);
	ground.material = portalGround;
	ground.receiveShadows = true;
	ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 1});


	/* WALLS */
	var wallBottom = BABYLON.Mesh.CreateBox("wallBottom", 1.0, scene);
	wallBottom.scaling = new BABYLON.Vector3(map.width-3, 10, 1);
	wallBottom.position.z = -map.height/2 + 2;
	wallBottom.material = mat;
	wallBottom.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	wallBottom.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(wallBottom);

	var wallTop = BABYLON.Mesh.CreateBox("wallTop", 1.0, scene);
	wallTop.scaling = new BABYLON.Vector3(map.width-3, 10, 1);
	wallTop.position.z = map.height/2 - 2;
	wallTop.material = mat;
	wallTop.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	wallTop.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(wallTop);

	var wallLeft = BABYLON.Mesh.CreateBox("wallLeft", 1.0, scene);
	wallLeft.scaling = new BABYLON.Vector3(1, 10, map.height-5);
	wallLeft.position.x = -map.width/2 + 2;
	wallLeft.material = mat;
	wallLeft.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	wallLeft.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(wallLeft);

	var wallRight = BABYLON.Mesh.CreateBox("wallRight", 1.0, scene);
	wallRight.scaling = new BABYLON.Vector3(1, 10, map.height-5);
	wallRight.position.x = map.width/2 - 2;
	wallRight.material = mat;
	wallRight.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	wallRight.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(wallRight);


	/* PLAYERS */
	var players = [];
	players.push(createPlayer( green, new BABYLON.Vector3(-map.width/2 + 5, 10, map.height/2 - 5) ));
	players.push(createPlayer( blue, new BABYLON.Vector3(map.width/2 - 5, 10, -map.height/2 + 5) ));

	/* BOXES */
	var fixedBox = BABYLON.Mesh.CreateBox("fixedBox", 5, scene);
	fixedBox.position.y = 10000;
	fixedBox.material = portalBox;


	console.log('importing mesh...');
	BABYLON.SceneLoader.ImportMesh("Cube", "models/", "cube.babylon", scene, function (meshes) {
		var cube = meshes[0];
		cube.position.y = -10;
		cube.isVisible = true;
		cube.scaling = new BABYLON.Vector3(2.1, 2.1, 2.1);
		cube.receiveShadows = true;
		cube.material = gray;
		shadowGenerator.getShadowMap().renderList.push(cube);

		createMap(cube, fixedBox);

	});

	/* RENDERING */
	stats = $('#stats');
	statsVisible = false;
	stats.click(function(){
		if(statsVisible){
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

	DIRECTIONS = {
		KEYPAD: {
			TOP: 104,
			BOT: 101,
			LEFT: 100,
			RIGHT: 102,
			BOMB: 96
		},
		QWSD: {
			TOP: 87,
			BOT: 83,
			LEFT: 65,
			RIGHT: 68,
			BOMB: 32
		}
	};

	var mvtDirection = {};
	mvtDirection.player1 = [0, 0, 0, 0];
	mvtDirection.player2 = [0, 0, 0, 0];

	var update = function () {
		// move players
		for(var i = 0; i < players.length; i++){
			move(players[i]);
		}

		// move light
		light.position.x = Math.sin(new Date().getTime() / 10000) * 60;
		light.position.z = Math.cos(new Date().getTime() / 10000) * 60;
		light.setDirectionToTarget(new BABYLON.Vector3(0,0,0));

	};

	var move = function (player) {

		var s = player.speed;

		var moveVector = new BABYLON.Vector3(0, 0, 0);

		if (player.mvtDirection[0] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(0, 0, 1));
		}
		if (player.mvtDirection[1] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(0, 0, -1));
		}
		if (player.mvtDirection[2] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(-1, 0, 0));
		}
		if (player.mvtDirection[3] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(1, 0, 0));
		}
		player.impostor.body.linearVelocity.scaleEqual(0.8);
		player.impostor.body.angularVelocity = new OIMO.Vec3();
		player.impostor.body.angularVelocity.scaleEqual(0);
		player.applyImpulse(moveVector.normalize().scale(s), player.position);

	};

	var chooseDirection = function (direction, value, player) {
		player.mvtDirection[direction] = value;
	};

	var handleKeyDown = function (keycode) {
		switch (keycode) {
			// player 0
			case DIRECTIONS.QWSD.TOP :
				chooseDirection(0, 1, players[0]);
				break;
			case DIRECTIONS.QWSD.BOT :
				chooseDirection(1, 1, players[0]);
				break;
			case DIRECTIONS.QWSD.LEFT :
				chooseDirection(2, 1, players[0]);
				break;
			case DIRECTIONS.QWSD.RIGHT :
				chooseDirection(3, 1, players[0]);
				break;
			case DIRECTIONS.QWSD.BOMB:
				placeBomb(players[0]);
				break;
			// player 1
			case DIRECTIONS.KEYPAD.TOP :
				chooseDirection(0, 1, players[1]);
				break;
			case DIRECTIONS.KEYPAD.BOT :
				chooseDirection(1, 1, players[1]);
				break;
			case DIRECTIONS.KEYPAD.LEFT:
				chooseDirection(2, 1, players[1]);
				break;
			case DIRECTIONS.KEYPAD.RIGHT:
				chooseDirection(3, 1, players[1]);
				break;
			case DIRECTIONS.KEYPAD.BOMB:
				placeBomb(players[1]);
				break;
		}
	};

	var handleKeyUp = function (keycode) {
		switch (keycode) {
			case DIRECTIONS.KEYPAD.TOP :
				chooseDirection(0, 0, players[1]);
				break;
			case DIRECTIONS.QWSD.TOP :
				chooseDirection(0, 0, players[0]);
				break;
			case DIRECTIONS.KEYPAD.BOT :
				chooseDirection(1, 0, players[1]);
				break;
			case DIRECTIONS.QWSD.BOT :
				chooseDirection(1, 0, players[0]);
				break;
			case DIRECTIONS.KEYPAD.LEFT:
				chooseDirection(2, 0, players[1]);
				break;
			case DIRECTIONS.QWSD.LEFT :
				chooseDirection(2, 0, players[0]);
				break;
			case DIRECTIONS.KEYPAD.RIGHT:
				chooseDirection(3, 0, players[1]);
				break;
			case DIRECTIONS.QWSD.RIGHT :
				chooseDirection(3, 0, players[0]);
				break;
		}
	};

	function createPlayer (material, spawnPosition) {
		var player = BABYLON.Mesh.CreateSphere("player1", 16, 4, scene);
		player.position = spawnPosition;
		player.impostor = player.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
			mass: 30,
			friction: 1,
			restitution: 0.5
		});

		player.speed = 3;

		player.mvtDirection = [0, 0, 0, 0];
		player.material = material;
		player.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(player);

		return player;
	};

	function createMap(box, fixedBox) {
		// TODO use a grid system to place boxes and handle their state
		for (var y = -5; y < map.height-10; y++) {
			for (var x = -5; x < map.width-10; x++) {
				if(x%5 == 0 && y%5 == 0) {
					if((x%10 != 0 || y%10 != 0) && Math.random() < 0.2) {
						var newBox = box.createInstance("x" + x + "y" + y);
						newBox.position = new BABYLON.Vector3(x + 10 - map.width / 2, 3, y + 10 - map.height / 2);
						newBox.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 10,
							friction: 1,
							restitution: 0.1
						});
						newBox.applyGravity = true;
						newBox.receiveShadows = true;
						newBox.isDestroyable = true;
						shadowGenerator.getShadowMap().renderList.push(newBox);
					}
					if(x%10 == 0 && y%10 == 0) {
						var fixedBoxInstance = fixedBox.createInstance("x" + x + "y" + y);
						fixedBoxInstance.position = new BABYLON.Vector3(x + 10 - map.width / 2, 3, y + 10 - map.height / 2);
						fixedBoxInstance.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 1000,
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

	// An array with all animation keys
	var keysFrames = [];
	//At the animation key 0, the value of scaling is "1"
	keysFrames.push({
		frame: 0,
		value: new BABYLON.Vector3(1,1,1)
	});
	//At the animation key 20, the value of scaling is "0.2"
	keysFrames.push({
		frame: 30,
		value: new BABYLON.Vector3(0.8,0.8,0.8)
	});
	//At the animation key 100, the value of scaling is "1"
	keysFrames.push({
		frame: 60,
		value: new BABYLON.Vector3(1,1,1)
	});

	// An array with all animation keys
	var keysFramesExplosion = [];
	//At the animation key 0, the value of scaling is "1"
	keysFramesExplosion.push({
		frame: 0,
		value: new BABYLON.Vector3(1,1,1)
	});
	//At the animation key 20, the value of scaling is "0.2"
	keysFramesExplosion.push({
		frame: 30,
		value: new BABYLON.Vector3(10,1,1)
	});


	var bomb;
	function placeBomb(player){
		console.log('placing bomb');
		var bomb = BABYLON.Mesh.CreateSphere("bomb", 16, 4, scene);
		bomb.material = black;
		bomb.position = new BABYLON.Vector3(player.position.x, player.position.y, player.position.z);

		// We must create a new ActionManager for our building in order to use Actions.
		bomb.actionManager = new BABYLON.ActionManager(scene);
		// The trigger is OnIntersectionEnterTrigger
		var enterTrigger = {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: player};
		var exitTrigger = {trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: player};
		bomb.actionManager.registerAction(new BABYLON.DoNothingAction(enterTrigger));
		bomb.actionManager.registerAction(new BABYLON.ExecuteCodeAction(exitTrigger, function(){
			console.log('left bomb');
			bomb.impostor = bomb.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
				mass: 1000,
				friction: 1,
				restitution: 0
			});
		}));

		bombRange = 3;
		bombRangeTime = bombRange * 0.15;

		setTimeout(function(){

			rayOfFireLeft = createRayOfFire(bomb, new BABYLON.Vector3(-7, 0.5, 0), bombRangeTime);
			rayOfFireRight = createRayOfFire(bomb, new BABYLON.Vector3(7, 0.5, 0), bombRangeTime);
			rayOfFireTop = createRayOfFire(bomb, new BABYLON.Vector3(0, 0.5, -7), bombRangeTime);
			rayOfFireBottom = createRayOfFire(bomb, new BABYLON.Vector3(0, 0.5, 7), bombRangeTime);
			// Start the particle system
			rayOfFireLeft.start();
			rayOfFireRight.start();
			rayOfFireTop.start();
			rayOfFireBottom.start();

			setTimeout(function(){
				rayOfFireLeft.stop();
				rayOfFireRight.stop();
				rayOfFireTop.stop();
				rayOfFireBottom.stop();
				bomb.dispose();
			}, 1000)

		}, 3000);


		bomb.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(bomb);

		var animationBomb = new BABYLON.Animation("bombAnimation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		animationBomb.setKeys(keysFrames);
		bomb.animations.push(animationBomb);
		scene.beginAnimation(bomb, 0, 60, true);

	}

	function createRayOfFire(bomb, direction, lifeTime){
		bomb.visibility = false;
		var rayPick = new BABYLON.Ray(bomb.position, direction);
		var meshFound = scene.pickWithRay(rayPick, function (item) {
			return item.isDestroyable || item.isFixedBox;
		});

		if(meshFound.pickedMesh && meshFound.pickedMesh.isDestroyable && meshFound.distance <= bombRange*2) {
			setTimeout(function(){
				var renderList = shadowGenerator.getShadowMap().renderList;
				var index = renderList.indexOf(meshFound.pickedMesh);
				if (index > -1) {
					renderList.splice(index, 1);
				}
				meshFound.pickedMesh.dispose();
			}, 800);

		} else {
			console.log('nothing hit');
		}

		/* RAY OF FIRE EFFECT */
		var minLifeTime = lifeTime;
		var maxLifeTime = lifeTime;

		// Create a particle system
		var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

		// Where the particles come from
		particleSystem.emitter = bomb; // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		//particleSystem.maxEmitBox = new BABYLON.Vector3(5, 0, 0); // To...

		// Colors of all particles
		particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
		particleSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0, 1.0);
		particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);

		// Size of each particle (random between...
		particleSystem.minSize = 4;
		particleSystem.maxSize = 5;

		// Life time of each particle (random between...
		particleSystem.minLifeTime = minLifeTime;
		particleSystem.maxLifeTime = maxLifeTime;

		// Emission rate
		particleSystem.emitRate = 1500;

		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;


		// Direction of each particle after it has been emitted
		particleSystem.direction1 = direction;
		//particleSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0);

		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI;

		// Speed
		particleSystem.minEmitPower = 8;
		particleSystem.maxEmitPower = 8;
		particleSystem.updateSpeed = 0.02;

		return particleSystem;
	}

});