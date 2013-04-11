/*global console, Touche*/
function bindGestures() {
	console.log("binding gestures...");

	var doc = window.document,
		element = doc.getElementById('container');

	Touche(document.getElementById("dragtap")).tap({
		options: {
			preventDefault: false
		},
		start: function(event, data) {
			console.log("dragtap started");
		},
		end: function(event, data) {
			console.log("dragtap");
		},
		cancel: function(event, data) {
			console.log("dragtap cancelled");
		}
	});

	Touche(element).tap({
		options: {
			areaThreshold: 5,
			preventDefault: false
		},
		end: function(event, data) {
			console.log("tap", data);
		}
	})
	.tap({
		options: {
			areaThreshold: 5,
			touches: 2,
			preventDefault: false
		},
		end: function(event, data) {
			console.log("2-finger tap", data);
		}
	})
	.doubletap({
		options: {
			timeThreshold: 200,
			preventDefault: false
		},
		end: function(event, data) {
			console.log("double tap", data);
		}
	})
	.longtap({
		options: {
			timeThreshold: 800,
			interval: 20,
			preventDefault: false
		},
		start: function(event, data) {
			console.log("longtap start", data.percentage, data);
		},
		update: function(event, data) {
			console.log("longtap update", data.percentage, data);
		},
		end: function(event, data) {
			console.log("longtap", data.percentage, data);
		},
		cancel: function() {
			console.log("longtap cancelled");
		}
	})
	.swipe({
		options: {
			radiusThreshold: 24,
			preventDefault: false
		},
		start: function(event, data) {
			console.log("swipe start", data);
		},
		update: function(event, data) {
			console.log("swipe update", data);
		},
		end: function(event, data) {
			console.log("swipe", data);
		},
		cancel: function() {
			console.log("swipe cancelled");
		}
	})/*
	.rotate({
		options: {
			rotationThreshold: 18
		},
		start: function(e, data) {
			console.log("rotate start", data.rotation);
		},
		update: function(e, data) {
			console.log("rotate update", data.rotation);
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
			console.log("pinch start", data.scale, +new Date());
		},
		update: function(e, data) {
			console.log("pinch update", data.scale, +new Date());
		},
		end: function(e, data) {
			console.log("pinch", +new Date());
		},
		cancel: function() {
			console.log("pinch cancelled", +new Date());
		}
	})*/;
}
window.addEventListener('DOMContentLoaded', bindGestures, false);