var Player = function(id, name, material, headMaterial, spawnPosition, scene, infectedMaterial, camera){
	var self = this;

	// body parts for walking animation
	var playerAvatar, playerBody, playerHead, playerHeadBubble, leftShoulder, leftHand, rightShoulder, rightHand, leftHip, leftFoot, rightHip, rightFoot;

	// playerForThisBomb stats
	this.id = id;
	this.name = name;
	this.isDead = false;
	this.speed = 0.5;
	this.limit = 1;
	this.range = 5;
	this.activeBombs = 0;

	this.mvtDirection = [0, 0, 0, 0];
	this.infectionInterval = null;

	this.walkingAnimations = [];

	scene.registerBeforeRender(function () {
		self.move();
	});



	/*
	 * METHODS
	 */
	this.createPlayerAvatar = function(){
		var playerAvatar = BABYLON.Mesh.CreateSphere(name, 16, 3, scene);
		playerAvatar.visibility = 0;
		playerAvatar.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);
		playerAvatar.checkCollisions = true;
		playerAvatar.ellipsoid = new BABYLON.Vector3(2, 4, 2);
		playerAvatar.ellipsoidOffset = new BABYLON.Vector3(0, 6, 0);
		playerAvatar.applyGravity = true;
		playerAvatar.isPlayerAvatar = true;

		this.bodyParts = [];

		playerBody = BABYLON.Mesh.CreateSphere(name, 16, 2.5, scene);
		playerBody.position.y = 0.9;
		playerBody.scaling.z = 0.7;
		playerBody.parent = playerAvatar;
		playerBody.material = material;
		this.bodyParts.push(playerBody);

		playerHead = BABYLON.Mesh.CreateSphere(name, 16, 2.5, scene);
		playerHead.parent = playerBody;
		playerHead.position.y = 1.5;
		playerHead.scaling.z = 1.42;
		playerHead.material = headMaterial;
		this.bodyParts.push(playerHead);

		playerHeadBubble = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
		playerHeadBubble.parent = playerHead;
		playerHeadBubble.position.y = 1.2;
		playerHeadBubble.position.z = -0.7;
		this.bodyParts.push(playerHeadBubble);

		leftShoulder = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
		leftShoulder.position.y = 0.75;
		leftShoulder.parent = playerBody;
		leftShoulder.visibility = 0;

		leftHand = BABYLON.Mesh.CreateSphere(name, 16, 1.5, scene);
		leftHand.scaling.x = 0.3;
		leftHand.scaling.z = 0.5;
		leftHand.parent = leftShoulder;
		leftHand.position.x = -1.4;
		leftHand.position.y = -0.7;
		leftHand.rotation.z = -Math.PI/8;
		this.bodyParts.push(leftHand);


		rightShoulder = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
		rightShoulder.position.y = 0.75;
		rightShoulder.parent = playerBody;
		rightShoulder.visibility = 0;

		rightHand = BABYLON.Mesh.CreateSphere(name, 16, 1.5, scene);
		rightHand.scaling.x = 0.3;
		rightHand.scaling.z = 0.5;
		rightHand.parent = rightShoulder;
		rightHand.position.x = 1.4;
		rightHand.position.y = -0.7;
		rightHand.rotation.z = Math.PI/8;
		this.bodyParts.push(rightHand);

		leftHip = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
		leftHip.parent = playerBody;
		leftHip.visibility = 0;

		leftFoot = BABYLON.Mesh.CreateSphere(name, 16, 2, scene);
		leftFoot.scaling.x = 0.5;
		leftFoot.scaling.z = 0.5;
		leftFoot.parent = leftHip;
		leftFoot.position.x = -0.5;
		leftFoot.position.y = -1.5;
		this.bodyParts.push(leftFoot);

		rightHip = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
		rightHip.parent = playerBody;
		rightHip.visibility = 0;

		rightFoot = BABYLON.Mesh.CreateSphere(name, 16, 2, scene);
		rightFoot.scaling.x = 0.5;
		rightFoot.scaling.z = 0.5;
		rightFoot.parent = rightHip;
		rightFoot.position.x = 0.5;
		rightFoot.position.y = -1.5;
		this.bodyParts.push(rightFoot);

		playerAvatar.position = spawnPosition;

		playerAvatar.material = material;
		playerAvatar.receiveShadows = true;
		playerAvatar.playerForThisBomb = this;

		return playerAvatar;
	};

	// create avatar
	this.avatar = this.createPlayerAvatar();

	this.stopWalkingAnimation = function(){
		for(var i=0; i<this.walkingAnimations.length; i++){
			this.walkingAnimations[i].pause();
		}
	};

	this.continueWalkingAnimation = function(){
		if(!this.walkingAnimations.length){
			var animationMoveHandsLeft = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			var keyFramesHandsLeft = [
				{frame: 0, value: -Math.PI/4},
				{frame: 10, value: Math.PI/8},
				{frame: 20, value: -Math.PI/4}
			];
			animationMoveHandsLeft.setKeys(keyFramesHandsLeft);
			leftShoulder.animations.push(animationMoveHandsLeft);
			this.walkingAnimations.push(scene.beginAnimation(leftShoulder, 0, 20, true));

			var animationMoveHandsRight = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			var keyFramesHandsRight = [
				{frame: 0, value:  Math.PI/8},
				{frame: 10, value: -Math.PI/4},
				{frame: 20, value: Math.PI/8}
			];
			animationMoveHandsRight.setKeys(keyFramesHandsRight);
			rightShoulder.animations.push(animationMoveHandsRight);
			this.walkingAnimations.push(scene.beginAnimation(rightShoulder, 0, 20, true));

			var animationMoveFootRight = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			animationMoveFootRight.setKeys(keyFramesHandsLeft);
			rightHip.animations.push(animationMoveFootRight);
			this.walkingAnimations.push(scene.beginAnimation(rightHip, 0, 20, true));

			var animationMoveFootLeft = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
			animationMoveFootLeft.setKeys(keyFramesHandsRight);
			leftHip.animations.push(animationMoveFootLeft);
			this.walkingAnimations.push(scene.beginAnimation(leftHip, 0, 20, true));
		}

		for(var i=0; i<this.walkingAnimations.length; i++){
			this.walkingAnimations[i].restart();
		}
	};

	this.startInfection = function(){
		self.stopInfection();
		// infected animation
		var blink = 0;
		self.infectionInterval = setInterval(function(){
			if(blink == 0){
				blink = 1;
				self.avatar.material = infectedMaterial;
			} else {
				blink = 0;
				self.avatar.material = material;
			}
		}, 300);
	};

	this.stopInfection = function(){
		clearInterval(self.infectionInterval);
		self.infectionInterval = null;
		self.avatar.material = material;
	};

	this.move = function () {

		var moveVector = new BABYLON.Vector3(0, GRAVITY, 0);

		if (this.mvtDirection[0] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(0, 0, 1));
		}
		if (this.mvtDirection[1] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(0, 0, -1));
		}
		if (this.mvtDirection[2] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(-1, 0, 0));
		}
		if (this.mvtDirection[3] != 0) {
			moveVector = moveVector.add(new BABYLON.Vector3(1, 0, 0));
		}

		this.avatar.moveWithCollisions(moveVector.normalize().scale(this.speed));
		this.rotateAvatarAccordingToMoveVector(moveVector);
		this.toggleWalkingAnimationOnMovement(moveVector);

	};

	this.rotateAvatarAccordingToMoveVector = function(moveVector){

		if(moveVector.x != 0 || moveVector.z != 0){

			var moveVectorNormalized = moveVector.normalize();

			// rotate avatar
			var v1 = new BABYLON.Vector3(0,1);
			var v2 = new BABYLON.Vector3(moveVectorNormalized.x, moveVectorNormalized.z);

			var angle = Math.acos(BABYLON.Vector2.Dot(v1, v2));

			// FIXME angle is not a product of PI but something like 135 degrees instead of 90 or 180

			if(!isNaN(angle)) {
				if (moveVectorNormalized.x < 0) angle = angle * -1;

				// calculate both angles in degrees
				var angleDegrees = Math.round(angle * 180 / Math.PI);
				var playerRotationDegrees = Math.round(this.avatar.rotation.y * 180 / Math.PI);

				//console.log(v1,v2, angle, angleDegrees);

				// calculate the delta
				var deltaDegrees = playerRotationDegrees - angleDegrees;

				// check what direction to turn to take the shortest turn
				if (deltaDegrees > 180) {
					deltaDegrees = deltaDegrees - 360;
				} else if (deltaDegrees < -180) {
					deltaDegrees = deltaDegrees + 360;
				}

				var rotationSpeed = Math.round(Math.abs(deltaDegrees) / 8);
				if (deltaDegrees > 0) {
					this.avatar.rotation.y -= rotationSpeed * Math.PI / 180;
					if (this.avatar.rotation.y < -Math.PI) {
						this.avatar.rotation.y = Math.PI;
					}
				}
				if (deltaDegrees < 0) {
					this.avatar.rotation.y += rotationSpeed * Math.PI / 180;
					if (this.avatar.rotation.y > Math.PI) {
						this.avatar.rotation.y = -Math.PI;
					}
				}

			}

		}

	};

	this.toggleWalkingAnimationOnMovement = function(moveVector){
		if(moveVector.x != 0 || moveVector.z != 0){
			this.continueWalkingAnimation();
		} else {
			this.stopWalkingAnimation();
		}
	};

	this.chooseDirection = function (direction, value) {
		if(this.mvtDirection[direction] != value) {
			this.mvtDirection[direction] = value;
		}
	};

	this.placeBomb = function(bombs, bombMaterial, players, shadowGenerator) {
		if(!self.noBombs && !self.isDead) {
			var newBombPosition = new BABYLON.Vector3(
				Math.round(this.avatar.position.x / 5) * 5,
				this.avatar.position.y,
				Math.round(this.avatar.position.z / 5) * 5
			);

			// check all boms to see ifn the current position is still free
			var spotOccupied = false;
			for (var i = 0; i < bombs.length; i++) {
				if (bombs[i].avatar.position.x == newBombPosition.x && bombs[i].avatar.position.z == newBombPosition.z) {
					spotOccupied = true;
				}
			}

			if (!spotOccupied && this.activeBombs < this.limit) {

				var bomb = new Bomb(scene, bombs, bombMaterial, newBombPosition, this, players, shadowGenerator, camera);
				this.activeBombs += 1;
				bombs.push(bomb);

				return bomb;
			}
		}

		return false;

	};

	this.die = function(players){
		// kill playerForThisBomb
		self.isDead = true;
		self.stopInfection();
		self.avatar.dispose();
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
	};

};