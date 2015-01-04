$(document).ready(function () {

	/* CONSTANTS */
	var map = {
		height: 60,
		width: 100
	};

	/* SCENE SETUP */
	// Get the canvas element from our HTML above
	var canvas = document.getElementById("renderCanvas");
	// Load the BABYLON 3D engine
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);
	scene.enablePhysics(new BABYLON.Vector3(0, -50, 0), new BABYLON.OimoJSPlugin());
	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", -1.57079633, 0, 80, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());

	/* MATERIALS */
	var materials = new Materials(scene);

	/* PLAYERS */
	var players = [];
	players.push(new Player('Player1', materials.green, new BABYLON.Vector3(-map.width / 2 + 5, 10, map.height / 2 - 5), scene));
	players.push(new Player('Player2', materials.blue, new BABYLON.Vector3(map.width / 2 - 5, 10, -map.height / 2 + 5), scene));
	players.push(new Player('Player3', materials.red, new BABYLON.Vector3(-map.width / 2 + 5, 10, -map.height / 2 + 5), scene));
	players.push(new Player('Player4', materials.yellow, new BABYLON.Vector3(map.width / 2 - 5, 10, map.height / 2 - 5), scene));

	/* GAME */
	var game = new Game(scene, map, materials, players);

	/* RENDERING */
	stats = $('#stats');
	statsVisible = false;
	stats.click(function () {
		if (statsVisible) {
			statsVisible = false;
			scene.debugLayer.hide();
		} else {
			statsVisible = true;
			scene.debugLayer.show();
		}
	});
	var showStats = stats;

	engine.runRenderLoop(function () {
		scene.render();
		showStats.text((BABYLON.Tools.GetFps().toFixed()));
	});

	scene.registerBeforeRender(function () {
		game.update();
	});

	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () {
		engine.resize();
	});


});