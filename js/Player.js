var Player = function (material, spawnPosition) {
	this.position = spawnPosition;
	this.impostor = this.setPhysicsState(BABYLON.PhysicsEngine.SphereImpostor, {
		mass: 30,
		friction: 1,
		restitution: 0.5
	});

	this.speed = 3;
	this.limit = 1;
	this.range = 5;
	this.activeBombs = 0;

	this.mvtDirection = [0, 0, 0, 0];
	this.material = material;
	this.receiveShadows = true;

};

Player.prototype = BABYLON.Mesh.CreateSphere("player1", 16, 4, scene);
