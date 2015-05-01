var viewModel = null;

var GRAVITY = -1;

var mapOptions = {
	height: 60,
	width: 100,
	gridSize: 5
};

var loggedinPlayers  = [];
var availableColors  = ['success', 'info', 'warning', 'danger', 'default'];
var availableAvatars = ['bman_v1', 'bman_v2', 'bman_v3', 'bman_v4'];
var availableThemes  = ['Test Chamber', 'Space Station', 'Castle'];
var availableMaps    = ['Classic', 'Tubes', 'Ramps'];

var playerArray = [
	{name: 'Cute', avatar: 'bman_v1', color: 'success', isActive: true, loggedin: false},
	{name: 'Sad', avatar: 'bman_v4', color: 'warning', isActive: false, loggedin: false},
	{name: 'Angry', avatar: 'bman_v2', color: 'danger', isActive: false, loggedin: false},
	{name: 'Weird', avatar: 'bman_v3', color: 'info', isActive: false, loggedin: false}
];