/*global console, Touche*/
function createTouche() {
	console.log("create Gesture");

	var doc = window.document,
		element = doc.getElementById('movable');

	function activate() {
		element.className = "active";
	}

	function deActivate() {
		element.className = "non-active";
	}

	Touche(element).tap({
		options: {
			areaThreshold: 5,
			precedence: 5
		},
		end: function(e, data) {
			console.log("tap");
		},
		cancel: function() {
			console.log("tap cancelled");
		}
	})
	.tap({
		options: {
			areaThreshold: 5,
			precedence: 5,
			touches: 2
		},
		end: function(e, data) {
			console.log("2-finger tap");
		},
		cancel: function() {
			console.log("2-finger tap cancelled");
		}
	})
	.doubletap({
		options: {
			timeThreshold: 600
		},
		end: function() {
			console.log("double tap");
		},
		cancel: function() {
			console.log("double tap cancelled");
		}
	})
	.longtap({
		options: {
			timeThreshold: 800,
			interval: 20
		},
		update: function(event, data) {
			console.log("long tap", data.percentage);
		},
		end: function() {
			console.log("long tap");
		},
		cancel: function() {
			console.log("long tap cancelled");
		}
	})
	.swipe({
		options: {
			radiusThreshold: 24
		},
		start: function(e, data) {
			console.log("swipestart1", data);
			activate();
		},
		update: function(e, data) {
			console.log("swipeupdate1", data);
			var x = data.swipe.deltaX, y = data.swipe.deltaY;
			element.style.left = x + "px";
			element.style.top = y + "px";

		},
		end: function(e, data) {
			console.log("swipe1", data);
			deActivate();
			element.style.left = "0px";
			element.style.top = "0px";
		},
		cancel: function() {
			console.log("swipe cancelled");
			deActivate();
		}
	})
	.rotate({
		options: {
			rotationThreshold: 18
		},
		start: function(e, data) {
			console.log("rotatestart", data.rotation);
		},
		update: function(e, data) {
			console.log("rotateupdate", data.rotation);
		},
		end: function(e, data) {
			console.log("rotate");
		},
		cancel: function() {
			console.log("rotate cancelled");
		}
	})
	.pinch({
		options: {
			pinchThreshold: 12
		},
		start: function(e, data) {
			console.log("pinchstart", data.scale);
		},
		update: function(e, data) {
			console.log("pinchupdate", data.scale);
		},
		end: function(e, data) {
			console.log("pinch");
		},
		cancel: function() {
			console.log("pinch cancelled");
		}
	});
}
window.addEventListener('DOMContentLoaded', createTouche, false);