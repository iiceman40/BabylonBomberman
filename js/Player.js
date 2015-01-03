var Player = function(name, material, spawnPosition, scene){

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
	this.avatar.player = this;

	// player stats
	this.name = name;
	this.isDead = false;
	this.speed = 3;
	this.limit = 1;
	this.range = 5;
	this.activeBombs = 0;

	this.mvtDirection = [0, 0, 0, 0];
	
	// METHODS
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

};