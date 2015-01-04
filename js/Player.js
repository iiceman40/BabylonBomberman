var Player = function(name, material, spawnPosition, scene){
	var self = this;

	// avatar
	this.avatar = BABYLON.Mesh.CreateSphere(name, 16, 4, scene);
	this.avatar.position = spawnPosition;
	this.avatar.impostor = this.avatar.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
		mass: 30,
		friction: 1,
		restitution: 0.5
	});
	this.avatar.material = material;
	this.avatar.receiveShadows = true;
	this.avatar.playerForThisBomb = this;

	// playerForThisBomb stats
	this.name = name;
	this.isDead = false;
	this.speed = 3;
	this.limit = 1;
	this.range = 5;
	this.activeBombs = 0;

	this.mvtDirection = [0, 0, 0, 0];
	
	/*
	 * METHODS
	 */
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
		this.avatar.impostor.body.linearVelocity.scaleEqual(0.8);
		this.avatar.impostor.body.angularVelocity = new OIMO.Vec3();
		this.avatar.impostor.body.angularVelocity.scaleEqual(0);
		this.avatar.applyImpulse(moveVector.normalize().scale(this.speed), this.avatar.position);

	};

	this.chooseDirection = function (direction, value) {
		this.mvtDirection[direction] = value;
	};

	this.placeBomb = function(bombs, bombMaterial, players, shadowGenerator) {
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

			var bomb = new Bomb(scene, bombs, bombMaterial, newBombPosition, this, players, shadowGenerator);
			this.activeBombs += 1;
			bombs.push(bomb);

			return bomb;
		}

		return false;

	};

	this.die = function(players){
		// kill playerForThisBomb
		self.isDead = true;
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