/*global console, Touche*/
function createTouche() {
	console.log("create Gesture");

	var doc = window.document,
		element = doc.getElementById('container');

	Touche(element).tap({
		options: {
			areaThreshold: 5
		},
		end: function(e, data) {
			console.log("tap");
		}
	})
	.tap({
		options: {
			areaThreshold: 5,
			touches: 2
		},
		end: function(e, data) {
			console.log("2-finger tap");
		}
	})
	.doubletap({
		options: {
			timeThreshold: 200
		},
		end: function() {
			console.log("double tap");
		}
	})
	.longtap({
		options: {
			timeThreshold: 800,
			interval: 20
		},
		start: function(event, data) {
			console.log("longtap start", data.percentage);
		},
		update: function(event, data) {
			console.log("longtap update", data.percentage);
		},
		end: function() {
			console.log("longtap");
		},
		cancel: function() {
			console.log("longtap cancelled");
		}
	})
	.swipe({
		options: {
			radiusThreshold: 24
		},
		start: function(e, data) {
			console.log("swipe start", data);
		},
		update: function(e, data) {
			console.log("swipe update", data);
		},
		end: function(e, data) {
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
window.addEventListener('DOMContentLoaded', createTouche, false);