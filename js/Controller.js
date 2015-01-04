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
	scene.enablePhysics(new BABYLON.Vector3(0, -100, 0), new BABYLON.OimoJSPlugin());
	// Camera attached to the canvas
	var camera = new BABYLON.ArcRotateCamera("cam", -1.57079633, 0, 80, new BABYLON.Vector3(0, 0, 0), scene);
	camera.attachControl(engine.getRenderingCanvas());

	/* MATERIALS */
	var materials = new Materials(scene);

	/* PLAYERS */
	// TODO move player initialization to Game class
	var players = [];
	var playerStartPositions = [
		new BABYLON.Vector3(-map.width / 2 + 5, 10, map.height / 2 - 5),
		new BABYLON.Vector3(map.width / 2 - 5, 10, -map.height / 2 + 5),
		new BABYLON.Vector3(-map.width / 2 + 5, 10, -map.height / 2 + 5),
		new BABYLON.Vector3(map.width / 2 - 5, 10, map.height / 2 - 5)
	];
	var playerMaterials = [
		materials.green,
		materials.blue,
		materials.red,
		materials.yellow
	];
	for (var i = 0; i < Math.min( parseInt(QueryString.players), 4 ); i++) {
		players.push(new Player('Player' + (i+1), playerMaterials[i], playerStartPositions[i], scene, materials.glowingPurple));
	}

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

/*
 * HELPER FUNCTIONS
 */
var QueryString = function () {
	// This function is anonymous, is executed immediately and
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
} ();