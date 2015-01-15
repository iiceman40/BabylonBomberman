var canvas, engine, scene;

$(document).ready(function () {

	// Get the canvas element from our HTML above
	canvas = document.getElementById("renderCanvas");
	// Load the BABYLON 3D engine
	engine = new BABYLON.Engine(canvas, true);

	// Watch for browser/canvas resize events
	window.addEventListener("resize", function () {
		engine.resize();
	});

});

var createGame = function(data){

	/* CONSTANTS */
	var map = {
		height: 60,
		width: 100
	};

	/* SCENE SETUP */
	scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(0,0,0,0);
	scene.enablePhysics(new BABYLON.Vector3(0, -100, 0), new BABYLON.OimoJSPlugin());
	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", 3.0, 3.0, 800, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());

	/* MATERIALS */
	var materials = new Materials(scene);

	/* GAME */
	var numberOfPlayers = data.numberOfPlayers;
	var game = new Game(scene, map, materials, camera, numberOfPlayers);

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

};