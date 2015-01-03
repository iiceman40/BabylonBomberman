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
				placeBomb(player);
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
						placeBomb(players[i]);
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

	// TODO move to Game Class
	function createMap(box, fixedBox) {
		// TODO use a grid system to place boxes and handle their state
		for (var y = -5; y < map.height - 10; y++) {
			for (var x = -5; x < map.width - 10; x++) {
				if (x % 5 == 0 && y % 5 == 0) {
					if ((x % 10 != 0 || y % 10 != 0) && Math.random() < 0.2) {
						var newBox = box.clone();//box.createInstance("x" + x + "y" + y);
						newBox.position = new BABYLON.Vector3(x + 10 - map.width / 2, 3, y + 10 - map.height / 2);
						newBox.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {
							mass: 100,
							friction: 1,
							restitution: 0.1
						});
						newBox.applyGravity = true;
						newBox.receiveShadows = true;
						newBox.isDestroyable = true;
						shadowGenerator.getShadowMap().renderList.push(newBox);
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

	// TODO move to Player class
	function placeBomb(player) {
		var bombPosition = new BABYLON.Vector3(
			Math.round(player.avatar.position.x / 5) * 5,
			player.avatar.position.y,
			Math.round(player.avatar.position.z / 5) * 5
		);

		var spotOccupied = false;
		for (var i = 0; i < bombs.length; i++) {
			if (bombs[i].position.x == bombPosition.x && bombs[i].position.z == bombPosition.z) {
				spotOccupied = true;
			}
		}

		if (!spotOccupied && player.activeBombs < player.limit) {
			var bomb = BABYLON.Mesh.CreateSphere("bomb", 16, 4, scene);
			bomb.material = materials.black;
			bomb.position = bombPosition;
			bomb.isBomb = true;
			bomb.player = player;
			player.activeBombs += 1;

			// We must create a new ActionManager for our building in order to use Actions.
			bomb.actionManager = new BABYLON.ActionManager(scene);
			// The trigger is OnIntersectionEnterTrigger
			var enterTrigger = {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: player.avatar};
			var exitTrigger = {trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: player.avatar};
			bomb.actionManager.registerAction(new BABYLON.DoNothingAction(enterTrigger));
			bomb.actionManager.registerAction(new BABYLON.ExecuteCodeAction(exitTrigger, function () {
				if (!bomb.isExploding) {
					bomb.impostor = bomb.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
						mass: 0,
						friction: 1,
						restitution: 0
					});
				}
			}));

			bomb.timer = setTimeout(function () {
				explodeBomb(bomb);
			}, 3000);

			bomb.receiveShadows = true;
			shadowGenerator.getShadowMap().renderList.push(bomb);

			var animationBombPulse = new BABYLON.Animation("bombAnimation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			var keyFramesBombPulse = [
				{frame: 0, value: new BABYLON.Vector3(1, 1, 1)},
				{frame: 30, value: new BABYLON.Vector3(0.8, 0.8, 0.8)},
				{frame: 60, value: new BABYLON.Vector3(1, 1, 1)}
			];
			animationBombPulse.setKeys(keyFramesBombPulse);
			bomb.animations.push(animationBombPulse);
			scene.beginAnimation(bomb, 0, 60, true);

			bombs.push(bomb);
		}

	}

	// TODO move to Bomb Class
	function explodeBomb(bomb) {
		bomb.isExploding = true;
		clearTimeout(bomb.timer);

		var bombRange = bomb.player.range;
		bomb.player.activeBombs -= 1;

		var rayOfFireLeft = createRayOfFire(bomb, new BABYLON.Vector3(-7, 0, 0), bombRange);
		var rayOfFireRight = createRayOfFire(bomb, new BABYLON.Vector3(7, 0, 0), bombRange);
		var rayOfFireTop = createRayOfFire(bomb, new BABYLON.Vector3(0, 0, -7), bombRange);
		var rayOfFireBottom = createRayOfFire(bomb, new BABYLON.Vector3(0, 0, 7), bombRange);
		// Start the particle system
		rayOfFireLeft.start();
		rayOfFireRight.start();
		rayOfFireTop.start();
		rayOfFireBottom.start();

		setTimeout(function () {
			rayOfFireLeft.stop();
			rayOfFireRight.stop();
			rayOfFireTop.stop();
			rayOfFireBottom.stop();
			var emitter = bomb.position.clone();
			createSmoke(emitter);
			bomb.isExploding = false;

			// remove bomb from bombs array
			var index = bombs.indexOf(bomb);
			if (index > -1) {
				bombs.splice(index, 1);
			}

			bomb.dispose();
		}, 1000);

	}

	// TODO move to Bomb class
	function createRayOfFire(bomb, direction, bombRange) {
		bomb.visibility = false;

		var distance = checkForHit(bomb, direction, bombRange, Infinity);
		console.log(distance);

		var checkingForHit = setInterval(function(){
			checkForHit(bomb, direction, bombRange, distance);
		}, 100);

		setTimeout(function(){
			clearInterval(checkingForHit);
		}, 1000);

		/* RAY OF FIRE EFFECT */
		// cap ray of fire to stop at target
		var lifeTime = bombRange/15 * 0.13;
		var lifeTimeLimit = distance/15 * 0.13;
		var minLifeTime = Math.min(lifeTime, lifeTimeLimit);
		var maxLifeTime = Math.min(lifeTime, lifeTimeLimit);

		// Create a particle systemw
		var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
		// Where the particles come from
		particleSystem.emitter = bomb; // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...
		// Colors of all particles
		particleSystem.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
		particleSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0, 0.5);
		particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.3);
		// Size of each particle (random between...
		particleSystem.minSize = 3;
		particleSystem.maxSize = 5;
		// Life time of each particle (random between...
		particleSystem.minLifeTime = minLifeTime;
		particleSystem.maxLifeTime = maxLifeTime;
		// Emission rate
		particleSystem.emitRate = 1000;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		// Direction of each particle after it has been emitted
		particleSystem.direction1 = direction;
		//particleSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0);
		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI;
		// Speed
		particleSystem.minEmitPower = 20;
		particleSystem.maxEmitPower = 20;
		particleSystem.updateSpeed = 0.01;

		return particleSystem;
	}

	function checkForHit(bomb, direction, bombRange, distanceLimit){
		// init distance to target
		var distance = Infinity;
		var rayPick = new BABYLON.Ray(bomb.position, direction);
		var meshFound = scene.pickWithRay(rayPick, function (item) {
			return (item.player || item.isDestroyable || item.isFixedBox || item.isBomb) && item != bomb;
		});

		// check what got hit by the explosion
		var target = meshFound.pickedMesh;
		if (target) {
			// set distance to actual target
			distance = bomb.position.subtract(target.position).length();
			// check if target found within the bomb range
			if (distance <= bombRange + 2.5 && distance < distanceLimit) {
				if (target.isBomb && !target.isExploding) {
					// chain bombs
					explodeBomb(target);
				} else if (target.isDestroyable && !target.isDestroyed) {
					// destroy box
					destroyBox(target);
				} else if (target.player) {
					// kill player
					target.player.isDead = true;
					target.dispose();
					// check remaining players
					setTimeout(function () {
						var remainingPlayers = [];
						for (var i = 0; i < players.length; i++) {
							if (!players[i].isDead) {
								remainingPlayers.push(players[i]);
							}
						}
						if (remainingPlayers.length == 1) {
							alert(remainingPlayers[0].name + ' wins!');
						}
					}, 200);
				}
			}
		}

		return distance;
	}

	// TODO create a Box Class??
	function destroyBox(box){
		box.isDestroyed = true;
		// particle effects
		var emitter = box.position.clone();
		createFragments(emitter);
		// fading animation
		var animationFadeBox = new BABYLON.Animation("fadeBox", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
		var fadeAnimationKeys = [
			{frame:0, value: 1},
			{frame:15, value: 0}
		];
		animationFadeBox.setKeys(fadeAnimationKeys);
		box.animations.push(animationFadeBox);
		scene.beginAnimation(box, 0, 50, true);
		// spawn power up and dispose shadow and box itself
		setTimeout(function () {
			var renderList = shadowGenerator.getShadowMap().renderList;
			var index = renderList.indexOf(box);
			if (index > -1) {
				renderList.splice(index, 1);
			}
			if (Math.random() < 0.66) {
				spawnPowerUp(box);
			}
			box.dispose();
		}, 500);
	}

	// TODO move to PowerUp class as constuctor
	function spawnPowerUp(box) {
		var randomIndex = Math.floor(Math.random() * availablePowerUps.length);
		var powerUpPrototype = availablePowerUps[randomIndex];

		var newPowerUp = powerUpPrototype.createInstance();
		newPowerUp.powerUpEffect = powerUpPrototype.powerUpEffect;
		newPowerUp.position = box.position.clone();
		newPowerUp.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
		newPowerUp.rotation.x = Math.PI/4;
		newPowerUp.rotation.y = Math.PI/4;
		newPowerUp.actionManager = new BABYLON.ActionManager(scene);

		var animationPowerUp = new BABYLON.Animation("rotatePowerUp", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		var rotationAnimationKeys = [
			{frame:0, value: 0},
			{frame:50, value: Math.PI/2},
			{frame:100, value: Math.PI}
		];
		animationPowerUp.setKeys(rotationAnimationKeys);
		newPowerUp.animations.push(animationPowerUp);
		scene.beginAnimation(newPowerUp, 0, 100, true);

		for (var i = 0; i < players.length; i++) {
			(function (e) {
				var player = players[e];
				var enterTrigger = {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: player.avatar};
				var usePowerUpAction = new BABYLON.ExecuteCodeAction(enterTrigger, function () {
					newPowerUp.powerUpEffect(player);
					newPowerUp.dispose();
				});
				newPowerUp.actionManager.registerAction(usePowerUpAction);
			})(i);
		}
	}

	function createFragments(emitter){
		// Create a particle system
		var particleSystem = new BABYLON.ParticleSystem("particles", 50, scene);
		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/metal_piece.png", scene);
		particleSystem.particleTexture.hasAlpha = true;
		// Where the particles come from
		particleSystem.emitter = emitter; // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(-2, 0, -2); // Starting all from
		particleSystem.maxEmitBox = new BABYLON.Vector3(2, 1, 2); // To...
		// Size of each particle (random between...
		particleSystem.minSize = 0.2;
		particleSystem.maxSize = 1.5;
		// Life time of each particle (random between...
		particleSystem.minLifeTime = 1;
		particleSystem.maxLifeTime = 1.5;
		// Emission rate
		particleSystem.emitRate = 50;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
		// Direction of each particle after it has been emitted
		particleSystem.direction1 = new BABYLON.Vector3(-2, 8, 2);
		particleSystem.direction2 = new BABYLON.Vector3(2, 8, -2);
		//particleSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0);
		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI;
		// Speed
		particleSystem.minEmitPower = 3;
		particleSystem.maxEmitPower = 3;
		particleSystem.updateSpeed = 0.008;
		// Gravity
		particleSystem.gravity = new BABYLON.Vector3(0, -98.1, 0);

		particleSystem.targetStopDuration = 0.4;
		particleSystem.disposeOnStop = true;

		particleSystem.start();
	}

	// TODO move to Bomb Class
	function createSmoke(emitter){
		// Create a particle system
		var particleSystem = new BABYLON.ParticleSystem("particles", 20, scene);
		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/smoke3.png", scene);
		particleSystem.particleTexture.hasAlpha = true;
		// Where the particles come from
		particleSystem.emitter = emitter; // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(-1, 0, -1); // Starting all from
		particleSystem.maxEmitBox = new BABYLON.Vector3(1, 1, 1); // To...
		// Colors of all particles
		particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.5);
		particleSystem.color2 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.5);
		particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
		// Size of each particle (random between...
		particleSystem.minSize = 2;
		particleSystem.maxSize = 5;
		// Life time of each particle (random between...
		particleSystem.minLifeTime = 0.2;
		particleSystem.maxLifeTime = 0.3;
		// Emission rate
		particleSystem.emitRate = 100000;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
		// Direction of each particle after it has been emitted
		particleSystem.direction1 = new BABYLON.Vector3(-1, 10, 1);
		particleSystem.direction2 = new BABYLON.Vector3(1, 10, -1);
		//particleSystem.direction2 = new BABYLON.Vector3(7, 0.5, 0);
		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI/8;
		// Speed
		particleSystem.minEmitPower = 1;
		particleSystem.maxEmitPower = 7;
		particleSystem.updateSpeed = 0.001;

		particleSystem.targetStopDuration = 0.1;
		particleSystem.disposeOnStop = true;

		particleSystem.start();
	}

});