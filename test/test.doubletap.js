/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#DoubleTap - Mouse', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.pointerEnabled;
			Touche.utils.touch  = false;
			Touche.utils.pointerEnabled = false;

			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this;
			context.called = false;
			context.gesture = {
				options: {
					timeThreshold: 100
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).doubletap(context.gesture);
		});

		it('should get called when tapping in center point', function (done) {
			Touche.simulate.gesture(el, null, null, 'mouse');
			Touche.simulate.gesture(el, null, null, 'mouse');
			expect(this.called).to.be(true);
			done();
		});

		it('should not be called when not inside time threshold', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el);
			setTimeout(function() {
				Touche.simulate.gesture(el, null, null, 'mouse');
				expect(context.called).to.be(false);
				done();
			}, 225);
		});

		afterEach(function() {
			Touche(el).off('doubletap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.pointerEnabled = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#DoubleTap - Touch', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.pointerEnabled;
			Touche.utils.touch  = true;
			Touche.utils.pointerEnabled = false;

			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this;
			context.called = false;
			context.gesture = {
				options: {
					timeThreshold: 100
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).doubletap(context.gesture);
		});

		it('should get called when tapping in center point', function (done) {
			Touche.simulate.gesture(el, null, null, 'touch');
			Touche.simulate.gesture(el, null, null, 'touch');
			expect(this.called).to.be(true);
			done();
		});

		it('should not be called when not inside time threshold', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, null, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, null, 'touch');
				expect(context.called).to.be(false);
				done();
			}, 225);
		});

		afterEach(function() {
			Touche(el).off('doubletap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.pointerEnabled = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#DoubleTap - MSPointer', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.pointerEnabled;
			Touche.utils.touch  = false;
			Touche.utils.pointerEnabled = true;

			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		beforeEach(function () {
			var context = this;
			context.called = false;
			context.gesture = {
				options: {
					timeThreshold: 100
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).doubletap(context.gesture);
		});

		it('should get called when tapping in center point', function (done) {
			Touche.simulate.gesture(el, null, null, 'MSPointer');
			Touche.simulate.gesture(el, null, null, 'MSPointer');
			expect(this.called).to.be(true);
			done();
		});

		it('should not be called when not inside time threshold', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el);
			setTimeout(function() {
				Touche.simulate.gesture(el, null, null, 'MSPointer');
				expect(context.called).to.be(false);
				done();
			}, 225);
		});

		afterEach(function() {
			Touche(el).off('doubletap');
			expect(Touche.cache.data.length).to.be(0);
		});
		
		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.pointerEnabled = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#DoubleTap - Options', function () {
		var el;

		before(function() {
			el = document.createElement('div');
			el.style.position = "absolute";
			el.style.top = "0px";
			el.style.left = "0px";
			el.style.width = "100px";
			el.style.height = "100px";
			body.appendChild(el);
		});

		function bindDoubleTap(name, newValue) {
			var defaultTapOptions = {
					areaThreshold: 5,
					precedence: 6,
					preventDefault: true,
					touches: 1,
					which: 1
				};

			defaultTapOptions[name] = newValue;
			Touche(el).doubletap({
				options: defaultTapOptions
			});
		}

		function getTapGesture() {
			return Touche(el).gestureHandler.gestures.filter(function(gesture) {
				return gesture.type === "tap";
			})[0];
		}

		it("should bind tap gesture with areaThreshold as 10", function () {
			bindDoubleTap("areaThreshold", 10);
			expect(getTapGesture().options.areaThreshold).to.be(10);
		});

		it("should bind tap gesture with preventDefault as false", function () {
			bindDoubleTap("preventDefault", false);
			expect(getTapGesture().options.preventDefault).to.be(false);
		});

		it("should bind tap gesture with touches as 2", function () {
			bindDoubleTap("touches", 2);
			expect(getTapGesture().options.touches).to.be(2);
		});

		it("should bind tap gesture with which as 3", function () {
			bindDoubleTap("which", 3);
			expect(getTapGesture().options.which).to.be(3);
		});

		afterEach(function() {
			Touche(el).off('doubletap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			body.removeChild(el);
		});
	});
});