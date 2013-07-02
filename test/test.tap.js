/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Tap - Mouse', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = false;
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
			context.started = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					areaThreshold: 5,
					which: [1,2]
				},
				start: function () {
					context.started = true;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when clicking in center point with allowed button', function (done) {
			Touche.simulate.gesture(el, null, null, 'mouse', null, null, 1);
			expect(this.called).to.be(true);
			done();
		});

		it('should be cancelled when a native drag gesture starts', function (done) {
			Touche.simulate.gesture(el, null, { mouse: ["down"] }, "mouse", null, null, 0);
			expect(this.started).to.be(true);
			Touche.simulate.gesture(el, null, { drag: ["start"] }, "drag", null, null, 0);
			expect(this.cancelled).to.be(true);
			done();
		});

		afterEach(function() {
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Tap - Touch', function () {
		var el, origUtilsMSPointer, origUtilsTouch;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = true;
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
					areaThreshold: 5
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when tapping in center point, for touch events', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(true);
			done();
		});

		it('should work eventhough browser dont trigger touchend but triggers mouseup', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, null, null, 'mouse', null, null, 1);
			expect(this.called).to.be(true);
			done();
		});

		afterEach(function() {
			Touche(el).off('tap');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Tap - MSPointer', function () {
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
					areaThreshold: 5
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when tapping in center point, for ms pointer events', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], null, 'MSPointer');
			expect(this.called).to.be(true);
			done();
		});

		afterEach(function() {
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});
});