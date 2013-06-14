/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#2FingerTap - Touch', function () {
		var el, origUtilsTouch, origUtilsMSPointer;

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
					touches: 2
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when tapping in center point with 2 finger', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(true);
			done();
		});

		it('should not get called when tapping in center point with 3 fingers', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50), new Touche.Point(50,50)], null, 'touch');
			expect(this.called).to.be(false);
			done();
		});

		it('should get called when tapping in center point with 2 finger even if they dont hit the touch area exactly the same time', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, null, {
				touch: ['end']
			}, 'touch');
			expect(this.called).to.be(true);
			done();
		});

		it('should not get called when first holding correct amount of fingers and then accidently puts another finger down', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50), new Touche.Point(50,50)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, null, {
				touch: ['end']
			}, 'touch');
			expect(this.called).to.be(false);
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

	describe('#2FingerTap - MSPointer', function () {
		var el, origUtilsTouch, origUtilsMSPointer;

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
			context.cancelled = false;
			context.gesture = {
				options: {
					touches: 2
				},
				end: function () {
					context.called = true;
				}
			};
			Touche(el).tap(context.gesture);
		});

		it('should get called when tapping in center point with 2 finger', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer', null, 1);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer', null, 2);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Up']
			}, 'MSPointer', null, 1);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Up']
			}, 'MSPointer', null, 2);
			expect(this.called).to.be(true);
			done();
		});

		it('should not get called when tapping in center point with 3 fingers', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer', null, 1);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer', null, 2);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer', null, 3);
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Up']
			}, 'MSPointer', null, 1);
			expect(this.called).to.be(false);
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
});