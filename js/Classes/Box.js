var Box = function (scene, position, boxTemplate, collisionBoxTemplate, name, shadowGenerator, availablePowerUps, players) {
	var self = this;

	var boxAvatar = boxTemplate.createInstance("x" + position.x + "y" + position.y); //boxTemplate.clone(name);
	boxAvatar.position = position;
	boxAvatar.boxForThisAvatar = self;
	boxAvatar.applyGravity = true;
	//boxAvatar.checkCollisions = true;
	//boxAvatar.receiveShadows = true;
	shadowGenerator.getShadowMap().renderList.push(boxAvatar);

	this.avatar = boxAvatar;

	this.collisionBox = collisionBoxTemplate.createInstance();
	this.collisionBox.checkCollisions = true;
	this.collisionBox.position = position;

	this.isDestroyed = false;


	this.destroy = function (){
		if(!self.isDestroyed) {
			self.isDestroyed = true;

			// particle effects
			var emitter = self.avatar.position.clone();
			self.createFragments(emitter);

			// fading animation
			var animationFadeBox = new BABYLON.Animation("fadeBox", "visibility", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
			var fadeAnimationKeys = [
				{frame: 0, value: 1},
				{frame: 15, value: 0}
			];
			animationFadeBox.setKeys(fadeAnimationKeys);
			self.avatar.animations.push(animationFadeBox);
			scene.beginAnimation(self.avatar, 0, 50, true);

			// spawn power up and dispose shadow and box itself
			setTimeout(function () {
				var renderList = shadowGenerator.getShadowMap().renderList;
				var index = renderList.indexOf(self.avatar);
				if (index > -1) {
					renderList.splice(index, 1);
				}

				if (Math.random() < 0.66) {
					self.spawnPowerUp();
				}

				boxAvatar.dispose();
			}, 500);
		}
	};

	this.spawnPowerUp = function() {
		var position = self.avatar.position.clone();
		new PowerUp(scene, position, players, availablePowerUps);
	};

	this.createFragments = function(emitter){
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
	};


	return this;
};
