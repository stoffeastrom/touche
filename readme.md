#Touché

This is a little lightweight gesture library supporting desktop and touch devices.

The api looks like this:
```js
Touche.tap(element, {
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
});

Touche.tap(element, {
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
});

Touche.doubletap(element, {
	options: {
		timeThreshold: 600
	},
	end: function() {
		console.log("double tap");
	},
	cancel: function() {
		console.log("double tap cancelled");
	}
});

Touche.swipe(element, {
	options: {
		radiusThreshold: 24
	},
	start: function(e, data) {
		console.log("swipestart", data);
	},
	update: function(e, data) {
		console.log("swipeupdate", data);
	},
	end: function(e, data) {
		console.log("swipe", data);
	},
	cancel: function() {
		console.log("swipe cancelled");
	}
});

Touche.rotate(element, {
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
});

Touche.pinch(element, {
	options: {
		pinchThreshold: 10
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
```

## How to run the test

You can run the test by either running them in the browser (by opening `test.index.html`) or by command line.
To set up running them from command line, read below.

```
$ git submodule update --recursive
$ npm install -g phantomjs
$ cd test/mocha/mocha-phantomjs
$ npm install
$ cd ../../cli
// *nix:
$ sh run-tests.sh
// windows:
$ run-tests.bat
```