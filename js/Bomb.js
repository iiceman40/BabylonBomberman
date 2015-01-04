var Bomb = function (scene, bombs, bombMaterial, bombPosition, player, players, shadowGenerator) {
	var self = this;

	this.isBomb = true; // TODO remove and add check for class instead??
	this.isExploding = false;
	this.playerForThisBombAvatar = player;
	this.timer = setTimeout(function () {
		self.explode(bombs, players);
	}, 3000);

	var bombAvatar = BABYLON.Mesh.CreateSphere("bomb", 16, 4, scene);
	bombAvatar.material = bombMaterial;
	bombAvatar.position = bombPosition;
	bombAvatar.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(bombAvatar);

	// We must create a new ActionManager for our building in order to use Actions.
	bombAvatar.actionManager = new BABYLON.ActionManager(scene);
	// The trigger is OnIntersectionEnterTrigger
	var enterTrigger = {trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger, parameter: this.avatar};
	var exitTrigger = {trigger: BABYLON.ActionManager.OnIntersectionExitTrigger, parameter: this.avatar};
	bombAvatar.actionManager.registerAction(new BABYLON.DoNothingAction(enterTrigger));
	bombAvatar.actionManager.registerAction(new BABYLON.ExecuteCodeAction(exitTrigger, function () {
		if (!self.isExploding) {
			bombAvatar.impostor = bombAvatar.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
				mass: 0,
				friction: 1,
				restitution: 0
			});
		}
	}));

	var animationBombPulse = new BABYLON.Animation("bombAnimation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var keyFramesBombPulse = [
		{frame: 0, value: new BABYLON.Vector3(1, 1, 1)},
		{frame: 30, value: new BABYLON.Vector3(0.8, 0.8, 0.8)},
		{frame: 60, value: new BABYLON.Vector3(1, 1, 1)}
	];
	animationBombPulse.setKeys(keyFramesBombPulse);
	bombAvatar.animations.push(animationBombPulse);
	scene.beginAnimation(bombAvatar, 0, 60, true);

	this.avatar = bombAvatar;


	/*
	 * METHODS
	 */
	this.explode = function (bombs, players) {
		self.isExploding = true;
		clearTimeout(this.timer);

		var bombRange = this.playerForThisBombAvatar.range;
		this.playerForThisBombAvatar.activeBombs -= 1;

		var rayOfFireLeft = self.createRayOfFire(new BABYLON.Vector3(-7, 0, 0), bombRange, players);
		var rayOfFireRight = self.createRayOfFire(new BABYLON.Vector3(7, 0, 0), bombRange, players);
		var rayOfFireTop = self.createRayOfFire(new BABYLON.Vector3(0, 0, -7), bombRange, players);
		var rayOfFireBottom = self.createRayOfFire(new BABYLON.Vector3(0, 0, 7), bombRange, players);
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
			var emitter = self.avatar.position.clone();
			self.createSmoke(emitter);
			self.isExploding = false;

			// remove bomb from bombs array
			var index = bombs.indexOf(self);
			if (index > -1) {
				bombs.splice(index, 1);
			}

			self.avatar.dispose();
		}, 1000);

	};

	this.createRayOfFire = function(direction, bombRange, players) {
		this.visibility = false;

		var initialDistance = Infinity;
		var distance = self.checkForHit(self.avatar, direction, bombRange, initialDistance, players);

		var checkingForHit = setInterval(function(){
			self.checkForHit(self.avatar, direction, bombRange, distance, players);
		}, 100);

		setTimeout(function(){
			clearInterval(checkingForHit);
		}, 1000);

		// RAY OF FIRE EFFECT //
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
		particleSystem.emitter = self.avatar; // the starting object, the emitter
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
	};

	this.checkForHit = function(bomb, direction, bombRange, distanceLimit, players){
		// init distance to target
		var distance = Infinity;
		var rayPick = new BABYLON.Ray(self.avatar.position, direction);
		var meshFound = scene.pickWithRay(rayPick, function (item) {
			return (item.playerForThisBombAvatar || item.boxForThisAvatar || item.isFixedBox || item.isBomb) && item != self.avatar;
		});

		// check what got hit by the explosion
		var target = meshFound.pickedMesh;
		if (target) {
			// set distance to actual target
			distance = self.avatar.position.subtract(target.position).length();

			// check if target found within the bomb range
			if (distance <= bombRange + 2.5 && distance < distanceLimit) {
				console.log(target);

				if (target.isBomb && !target.isExploding) {
					// chain bombs
					target.explode(bombs, players);
				} else if (target.boxForThisAvatar) {
					// destroy box
					target.boxForThisAvatar.destroy();
				} else if (target.playerForThisBombAvatar) {
					// kill player
					target.playerForThisBombAvatar.die(players);
				}

			}
		}

		return distance;
	};

	this.createSmoke = function(emitter){
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

};
