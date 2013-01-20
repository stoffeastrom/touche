/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#DoubleTap - Mouse', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch  = false;
			Touche.utils.msPointer = false;

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
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#DoubleTap - Touch', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch  = true;
			Touche.utils.msPointer = false;

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
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#DoubleTap - MSPointer', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch  = false;
			Touche.utils.msPointer = true;

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
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});
});