var Game = function (scene, map, materials, availablePowerUps) {
	var self = this;

	/* LIGHT */
	this.light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(-1, -2, -1), scene);
	this.light.position = new BABYLON.Vector3(40, 50, 40);
	this.light.intensity = 0.5;
	//light.range = 300;
	this.lightBulb = BABYLON.Mesh.CreateSphere("lightBulb", 16, 4, scene);
	this.lightBulb.position = this.light.position;
	this.lightBulb.material = materials.yellow;

	this.hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	this.hemiLight.diffuse = new BABYLON.Color3(0.1, 0.1, 0.1);
	this.hemiLight.specular = new BABYLON.Color3(0.5, 0.5, 0.5);
	this.hemiLight.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);

	/* SHADOW */
	this.shadowGenerator = new BABYLON.ShadowGenerator(8192, this.light);
	this.shadowGenerator.useVarianceShadowMap = false;
	this.shadowGenerator.usePoissonSampling = true;


	/* GROUND */
	this.ground = BABYLON.Mesh.CreateGround("ground", map.width - 5, map.height - 5, 1, scene);
	this.ground.material = materials.portalGround;
	this.ground.receiveShadows = true;
	this.ground.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 1});


	/* WALLS */
	this.wallBottom = BABYLON.Mesh.CreateBox("wallBottom", 1.0, scene);
	this.wallBottom.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
	this.wallBottom.position.z = -map.height / 2 + 2;
	this.wallBottom.material = materials.mat;
	this.wallBottom.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	this.wallBottom.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallBottom);

	this.wallTop = BABYLON.Mesh.CreateBox("wallTop", 1.0, scene);
	this.wallTop.scaling = new BABYLON.Vector3(map.width - 3, 10, 1);
	this.wallTop.position.z = map.height / 2 - 2;
	this.wallTop.material = materials.mat;
	this.wallTop.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	this.wallTop.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallTop);

	this.wallLeft = BABYLON.Mesh.CreateBox("wallLeft", 1.0, scene);
	this.wallLeft.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
	this.wallLeft.position.x = -map.width / 2 + 2;
	this.wallLeft.material = materials.mat;
	this.wallLeft.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	this.wallLeft.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallLeft);

	this.wallRight = BABYLON.Mesh.CreateBox("wallRight", 1.0, scene);
	this.wallRight.scaling = new BABYLON.Vector3(1, 10, map.height - 5);
	this.wallRight.position.x = map.width / 2 - 2;
	this.wallRight.material = materials.mat;
	this.wallRight.setPhysicsState(BABYLON.PhysicsEngine.BoxImpostor, {mass: 0, restitution: 0.1, friction: 0.1});
	this.wallRight.receiveShadows = true;
	this.shadowGenerator.getShadowMap().renderList.push(this.wallRight);

};
