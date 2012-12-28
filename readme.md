#Touché

[![Build Status](https://travis-ci.org/stoffeastrom/touche.png?branch=gh-pages)](https://travis-ci.org/stoffeastrom/touche)

This is a little lightweight gesture library supporting desktop and touch devices.

The api looks like this:
```js
Touche(element).tap({
	options: {
		areaThreshold: 5
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
	},
	update: function(e, data) {
		console.log("swipeupdate1", data);
	},
	end: function(e, data) {
		console.log("swipe1", data);
	},
	cancel: function() {
		console.log("swipe cancelled");
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

/*
* If you are using jquery you could just
* wrap Touche in the special event api like below.
*/

/*
* jquery special event wrapper.
*/
(function() {
    $.each([
        'tap',
        'doubletap',
        'longtap',
        'swipe',
        'pinch',
        'rotate'
    ], function(_, event) {
        $.event.special[event] = {
            add: function(handleObj) {
                var el = $(this);
                Touche(el[0])[event]( {
                    options: handleObj.data && handleObj.data.options || {},
                    start: function(e, data) {
                        el.trigger(event + 'start', [data]);
                    },
                    update: function(e, data) {
                        el.trigger(event + 'update', [data]);
                    },
                    end: function(e, data) {
                        el.trigger(event, [data]);
                    },
                    cancel: function() {
                        el.trigger(event + 'cancel');
                    }
                });
            },
            remove: function(handleObj) {
                Touche(this).off(event);
            }
        };
    });
})();
```

## Setting up the build environment

Touché is using grunt.js to build (concatenate + minify) and running tests. Below is instructions on how to properly set up this project.

```
$ cd touche
$ npm install -g grunt
$ npm install -g phantomjs
$ npm install
```

After installing, you can run a few different tasks using grunt:

```
// lint all test + lib files
$ grunt lint
// run the test suite
$ grunt mocha
// generate documentation, requires "jsdoc" to be in path
$ grunt doc
// default: runs lint, mocha, concat, min
$ grunt
```
