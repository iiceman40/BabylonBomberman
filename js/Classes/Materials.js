var Materials = function(scene) {
	this.mat = new BABYLON.StandardMaterial("mat", scene);
	this.mat.diffuseColor = BABYLON.Color3.FromInts(121, 189, 224);

	this.gray = new BABYLON.StandardMaterial("gray", scene);
	this.gray.diffuseColor = BABYLON.Color3.FromInts(115, 135, 155);
	this.gray.specularPower = 1000;

	this.greenCute = new BABYLON.StandardMaterial("green", scene);
	this.greenCute.diffuseTexture = new BABYLON.Texture("textures/bman_v1_texture.png", scene);
	this.greenCute.diffuseTexture.vOffset = 0.25;

	this.green = new BABYLON.StandardMaterial("green", scene);
	this.green.diffuseColor = BABYLON.Color3.Green();

	this.red = new BABYLON.StandardMaterial("red", scene);
	this.red.diffuseColor = BABYLON.Color3.Red();

	this.blue = new BABYLON.StandardMaterial("blue", scene);
	this.blue.diffuseColor = BABYLON.Color3.Blue();

	this.lightBlue = new BABYLON.StandardMaterial("lightBlue", scene);
	this.lightBlue.diffuseColor = BABYLON.Color3.FromInts(100,150,190);

	this.yellow = new BABYLON.StandardMaterial("yellow", scene);
	this.yellow.diffuseColor = BABYLON.Color3.Yellow();

	this.black = new BABYLON.StandardMaterial("black", scene);
	this.black.diffuseColor = BABYLON.Color3.Black();

	this.glowingPurple = new BABYLON.StandardMaterial("glowingPurple", scene);
	this.glowingPurple.emissiveColor = BABYLON.Color3.Purple();

	this.glowingYellow = new BABYLON.StandardMaterial("glowingYellow", scene);
	this.glowingYellow.emissiveColor = BABYLON.Color3.Yellow();

	this.glowingRed = new BABYLON.StandardMaterial("glowingRed", scene);
	this.glowingRed.emissiveColor = BABYLON.Color3.Red();

	this.portalGround = new BABYLON.StandardMaterial("portalGround", scene);
	this.portalGround.diffuseTexture = new BABYLON.Texture("textures/portal-tile-dark.jpg", scene);
	this.portalGround.diffuseTexture.uScale = 19.0;
	this.portalGround.diffuseTexture.vScale = 11.0;
	this.portalGround.diffuseTexture.uOffset = 0.5;
	this.portalGround.specularColor = BABYLON.Color3.Gray();
	this.portalGround.bumpTexture = new BABYLON.Texture("textures/portal-tile-dark-normalmap.jpg", scene);
	this.portalGround.bumpTexture.uScale = 19.0;
	this.portalGround.bumpTexture.vScale = 11.0;
	this.portalGround.bumpTexture.uOffset = 0.5;

	this.portalBox = new BABYLON.StandardMaterial("portalGround", scene);
	this.portalBox.diffuseTexture = new BABYLON.Texture("textures/portal-tile.jpg", scene);
	this.portalBox.specularColor = BABYLON.Color3.White();
	this.portalBox.bumpTexture = new BABYLON.Texture("textures/portal-tile-normalmap.png", scene);
};