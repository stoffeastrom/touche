#touche

This is a little lightweight gesture library supporting desktop and touch devices.

The api looks like this:

	Touche.tap(element, {
		end: function(e, data) {
			console.log("tap");
		}
	});

	Touche.tap(element, {
		options: {
			areaThreshold: 5,
			precedence: 5,
			touches: 2
		},
		end: function(e, data) {
			console.log("2-finger tap");
		}
	});

	Touche.doubletap(element, {
		options: {
			timeThreshold: 600
		},
		end: function() {
			console.log("double tap");
		}
	});

	Touche.swipe(element, {
		options: {
			radiusThreshold: 12
		},
		start: function(e, data) {
			console.log("swipestart1", data);
		},
		update: function(e, data) {
			console.log("swipeupdate1", data);
		},
		end: function(e, data) {
			console.log("swipe1", data);
		}
	});

	Touche.rotate(element, {
		options: {
			rotationThreshold: 10
		},
		start: function(e, data) {
			console.log("rotatestart", data.rotation);
		},
		update: function(e, data) {
			console.log("rotateupdate", data.rotation);
		},
		end: function(e, data) {
			console.log("rotate");
		}
	});