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

Touche.longtap(element, {
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

/*
* If you are using jquery you could just
* wrap Touche in the special event api like below
*/

/*
* jquery special event wrapper
*/
(function() {
    $.each({
        tap: 'tap',
        doubletap: 'tap',
        longtap: 'tap',
        swipe: 'swipe',
        pinch: 'pinch',
        rotate: 'rotate'
    }, function(event, sourceEvent) {
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
                Touche.cache.get(this).context.cancelGestures(sourceEvent);
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