var PowerUp = function (scene, position, players, availablePowerUps) {
	var randomIndex = Math.floor(Math.random() * availablePowerUps.length);
	var powerUpPrototype = availablePowerUps[randomIndex];

	var newPowerUp = powerUpPrototype.createInstance();
	newPowerUp.powerUpEffect = powerUpPrototype.powerUpEffect;
	newPowerUp.position = position;
	newPowerUp.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
	newPowerUp.rotation.x = Math.PI/4;
	newPowerUp.rotation.y = Math.PI/4;
	newPowerUp.actionManager = new BABYLON.ActionManager(scene);

	// power up rotation animation
	var animationPowerUpRotation = new BABYLON.Animation("rotatePowerUp", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var rotationAnimationKeys = [
		{frame: 0, value: 0},
		{frame: 50, value: Math.PI/2},
		{frame: 100, value: Math.PI}
	];
	animationPowerUpRotation.setKeys(rotationAnimationKeys);
	newPowerUp.animations.push(animationPowerUpRotation);

	// power up hover animation
	var animationPowerUpHover = new BABYLON.Animation("hoverPowerUp", "position.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	var hoverAnimationKeys = [
		{frame: 0, value: newPowerUp.position.y},
		{frame: 25, value: 3.5},
		{frame: 50, value: newPowerUp.position.y},
		{frame: 75, value: 3.5},
		{frame: 100, value: newPowerUp.position.y}
	];
	animationPowerUpHover.setKeys(hoverAnimationKeys);

	// Creating an easing function
	var easingFunction = new BABYLON.QuadraticEase();
	// For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
	easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	// Adding the easing function to the animation
	animationPowerUpHover.setEasingFunction(easingFunction);

	newPowerUp.animations.push(animationPowerUpHover);

	// begin all animations
	scene.beginAnimation(newPowerUp, 0, 100, true);

	// setting up the pick up action
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

};
