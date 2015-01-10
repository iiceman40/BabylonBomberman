var Player = function(name, material, headMaterial, spawnPosition, scene, infectedMaterial, camera){
	var self = this;

	// avatar
	var playerAvatar = BABYLON.Mesh.CreateSphere(name, 16, 3, scene);
	playerAvatar.visibility = 0;
	playerAvatar.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2);

	this.bodyParts = [];

	var playerBody = BABYLON.Mesh.CreateSphere(name, 16, 2.5, scene);
	playerBody.position.y = 0.9;
	playerBody.scaling.z = 0.7;
	playerBody.parent = playerAvatar;
	playerBody.material = material;
	this.bodyParts.push(playerBody);

	var playerHead = BABYLON.Mesh.CreateSphere(name, 16, 2.5, scene);
	playerHead.parent = playerBody;
	playerHead.position.y = 1.5;
	playerHead.scaling.z = 1.42;
	playerHead.material = headMaterial;
	this.bodyParts.push(playerHead);

	var playerHeadBubble = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
	playerHeadBubble.parent = playerHead;
	playerHeadBubble.position.y = 1.2;
	playerHeadBubble.position.z = -0.7;
	this.bodyParts.push(playerHeadBubble);

	var leftShoulder = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
	leftShoulder.position.y = 0.75;
	leftShoulder.parent = playerBody;
	leftShoulder.visibility = 0;

	var leftHand = BABYLON.Mesh.CreateSphere(name, 16, 1.5, scene);
	leftHand.scaling.x = 0.3;
	leftHand.scaling.z = 0.5;
	leftHand.parent = leftShoulder;
	leftHand.position.x = -1.4;
	leftHand.position.y = -0.7;
	leftHand.rotation.z = -Math.PI/8;
	this.bodyParts.push(leftHand);


	var rightShoulder = BABYLON.Mesh.CreateSphere(name, 16, 0.5, scene);
	rightShoulder.position.y = 0.75;
	rightShoulder.parent = playerBody;
	rightShoulder.visibility = 0;

	var rightHand = BABYLON.Mesh.CreateSphere(name, 16, 1.5, scene);
	rightHand.scaling.x = 0.3;
	rightHand.scaling.z = 0.5;
	rightHand.parent = rightShoulder;
	rightHand.position.x = 1.4;
	rightHand.position.y = -0.7;
	rightHand.rotation.z = Math.PI/8;
	this.bodyParts.push(rightHand);

	var leftFoot = BABYLON.Mesh.CreateSphere(name, 16, 2, scene);
	leftFoot.scaling.x = 0.5;
	leftFoot.scaling.z = 0.5;
	leftFoot.parent = playerBody;
	leftFoot.position.x = -0.5;
	leftFoot.position.y = -1.5;
	this.bodyParts.push(leftFoot);

	var rightFoot = BABYLON.Mesh.CreateSphere(name, 16, 2, scene);
	rightFoot.scaling.x = 0.5;
	rightFoot.scaling.z = 0.5;
	rightFoot.parent = playerBody;
	rightFoot.position.x = 0.5;
	rightFoot.position.y = -1.5;
	this.bodyParts.push(rightFoot);

	playerAvatar.position = spawnPosition;
	playerAvatar.impostor = playerAvatar.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
		mass: 100,
		friction: 0.001,
		restitution: 0.999
	});

	playerAvatar.material = material;
	playerAvatar.receiveShadows = true;
	playerAvatar.playerForThisBomb = this;

	this.avatar = playerAvatar;

	// playerForThisBomb stats
	this.name = name;
	this.isDead = false;
	this.speed = 15;
	this.limit = 1;
	this.range = 5;
	this.activeBombs = 0;

	this.mvtDirection = [0, 0, 0, 0];
	this.infectionInterval = null;
	this.newRotation = 0;



	// TODO animations
	var animationMoveHandsLeft = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var keyFramesHands = [
		{frame: 0, value: -Math.PI/4},
		{frame: 10, value: Math.PI/8},
		{frame: 20, value: -Math.PI/4}
	];
	animationMoveHandsLeft.setKeys(keyFramesHands);
	leftShoulder.animations.push(animationMoveHandsLeft);
	scene.beginAnimation(leftShoulder, 0, 20, true);

	var animationMoveHandsRight = new BABYLON.Animation("handAnimation", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var keyFramesHandsRight = [
		{frame: 0, value:  Math.PI/8},
		{frame: 10, value: -Math.PI/4},
		{frame: 20, value: Math.PI/8}
	];
	animationMoveHandsRight.setKeys(keyFramesHandsRight);
	rightShoulder.animations.push(animationMoveHandsRight);
	scene.beginAnimation(rightShoulder, 0, 20, true);


	/*
	 * METHODS
	 */
	this.startInfection = function(){
		self.stopInfection();
		// infected animation
		var blink = 0;
		self.infectionInterval = setInterval(function(){
			if(blink == 0){
				blink = 1;
				playerAvatar.material = infectedMaterial;
			} else {
				blink = 0;
				playerAvatar.material = material;
			}
		}, 300);
	};

	this.stopInfection = function(){
		clearInterval(self.infectionInterval);
		self.infectionInterval = null;
		playerAvatar.material = material;
	};

	this.move = function () {

		var moveVector = new BABYLON.Vector3(0, 0, 0);

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

		this.avatar.impostor.body.linearVelocity.scaleEqual(0.92);
		this.avatar.impostor.body.angularVelocity = new OIMO.Vec3();
		this.avatar.impostor.body.angularVelocity.scaleEqual(0);

		var moveVectorNormalized = moveVector.normalize();
		var finalMoveVector = moveVectorNormalized.scale(this.speed);

		// rotate avatar
		var v1 = new BABYLON.Vector3(0,0,1);
		var v2 = moveVectorNormalized;

		var productVector = BABYLON.Vector3.Dot(v1, v2);
		var productLength = v1.length() * v2.length();
		var angle = Math.acos(productVector / productLength);

		if(!isNaN(angle)) {
			if(moveVectorNormalized.x<0) angle = angle * -1;

			// TODO calculate both angles in degrees
			// TODO calculate the delta
			// TODO if delta > 180 degree calculate shorter and change direction

			this.avatar.rotation.y = angle;
			//this.newRotation = angle;
		}

		this.avatar.updatePhysicsBodyPosition();

		this.avatar.applyImpulse(finalMoveVector, this.avatar.position);

	};

	this.chooseDirection = function (direction, value) {
		this.mvtDirection[direction] = value;
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