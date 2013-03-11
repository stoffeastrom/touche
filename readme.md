#Touché - [![Build Status](https://travis-ci.org/stoffeastrom/touche.png?branch=gh-pages)](https://travis-ci.org/stoffeastrom/touche)

This is a little lightweight gesture library supporting desktop and touch devices.

The api looks like this:
```js
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
})
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
                Touche(this)[event]( {
                    options: handleObj.data && handleObj.data.options || {},
                    start: function(e, data) {
                        $(e.target).trigger(event + 'start', [data]);
                    },
                    update: function(e, data) {
                        $(e.target).trigger(event + 'update', [data]);
                    },
                    end: function(e, data) {
                        $(e.target).trigger(event, [data]);
                    },
                    cancel: function() {
                        $(e.target).trigger(event + 'cancel');
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

Touché is using grunt to build (concatenate + minify) and running tests. Below is instructions on how to properly set up this project.

```
$ cd touche
$ npm uninstall -g grunt
$ npm install -g grunt-cli
$ npm install -g phantomjs
$ npm install grunt
$ npm install grunt-contrib-jshint
$ npm install grunt-contrib-concat
$ npm install grunt-contrib-uglify
$ npm install grunt-mocha
```

After installing, you can run a few different tasks using grunt:

```
// jshint all test + lib files
$ grunt jshint
// run the test suite
$ grunt test
// generate documentation, requires "jsdoc" to be in path
$ grunt docs
// default: runs jshint, test, concat, min
$ grunt
```

## License

This project is licensed under the MIT License: http://opensource.org/licenses/MIT
