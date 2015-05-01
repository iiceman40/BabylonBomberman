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

	/* SCENE SETUP */
	scene = new BABYLON.Scene(engine);
	scene.gravity = new BABYLON.Vector3(0, GRAVITY, 0);
	scene.collisionsEnabled = true;
	scene.clearColor = new BABYLON.Color4(0,0,0,0);

	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", 3.0, 3.0, 800, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());

	/* MATERIALS */
	var materials = new Materials(scene);

	/* GAME */
	var numberOfPlayers = data.numberOfPlayers;
	// TODO separate game and scene objects as much as possible - for example: move the shadow generator to an independent variable instead of passing it as a parameter?
	var game = new Game(scene, mapOptions, materials, camera, numberOfPlayers);

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
		showStats.text(engine.getFps().toFixed());
	});

};