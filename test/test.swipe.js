/*global describe, Touche, expect, it, before, beforeEach, after, afterEach*/
describe('Gesture', function () {
	var body = document.body;

	describe('#Swipe - Mouse', function () {
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
			context.started = false;
			context.updated = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					radiusThreshold: 8
				},
				start: function() {
					context.started = true;
				},
				update: function() {
					context.updated = true;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).swipe(context.gesture);
		});

		it('should get called when swiping and radius threshold is met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				mouse: ['down']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(60,50)], {
				mouse: ['move']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(61,51)], {
				mouse: ['move']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(60,60)], {
				mouse: ['up']
			}, 'mouse');
			expect(this.started).to.be(true);
			expect(this.updated).to.be(true);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not get called when swiping and radius threshold is not met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				mouse: ['down']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(55,50)], {
				mouse: ['move']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(56,51)], {
				mouse: ['move']
			}, 'mouse');
			Touche.simulate.gesture(el, [new Touche.Point(55,55)], {
				mouse: ['up']
			}, 'mouse');
			expect(this.started).to.be(false);
			expect(this.updated).to.be(false);
			expect(this.called).to.be(false);
			expect(this.cancelled).to.be(false);
			done();
		});

		afterEach(function() {
			Touche(el).off('swipe');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Swipe - Touch', function () {
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
			context.started = false;
			context.updated = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					radiusThreshold: 8
				},
				start: function() {
					context.started = true;
				},
				update: function() {
					context.updated = true;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).swipe(context.gesture);
		});

		it('should get called when swiping and radius threshold is met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(60,50)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(61,51)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(60,60)], {
				touch: ['end']
			}, 'touch');
			expect(this.started).to.be(true);
			expect(this.updated).to.be(true);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not get called when swiping and radius threshold is not met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				touch: ['start']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(55,50)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(56,51)], {
				touch: ['move']
			}, 'touch');
			Touche.simulate.gesture(el, [new Touche.Point(55,55)], {
				touch: ['end']
			}, 'touch');
			expect(this.started).to.be(false);
			expect(this.updated).to.be(false);
			expect(this.called).to.be(false);
			expect(this.cancelled).to.be(false);
			done();
		});

		afterEach(function() {
			Touche(el).off('swipe');
			expect(Touche.cache.data.length).to.be(0);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});

	describe('#Swipe - MSPointer', function () {
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
			context.started = false;
			context.updated = false;
			context.called = false;
			context.cancelled = false;
			context.gesture = {
				options: {
					radiusThreshold: 8
				},
				start: function() {
					context.started = true;
				},
				update: function() {
					context.updated = true;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).swipe(context.gesture);
		});

		it('should get called when swiping and radius threshold is met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(60,50)], {
				MSPointer: ['Move']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(61,51)], {
				MSPointer: ['Move']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(60,60)], {
				MSPointer: ['Up']
			}, 'MSPointer');
			expect(this.started).to.be(true);
			expect(this.updated).to.be(true);
			expect(this.called).to.be(true);
			expect(this.cancelled).to.be(false);
			done();
		});

		it('should not get called when swiping and radius threshold is not met', function (done) {
			Touche.simulate.gesture(el, [new Touche.Point(50,50)], {
				MSPointer: ['Down']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(55,50)], {
				MSPointer: ['Move']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(56,51)], {
				MSPointer: ['Move']
			}, 'MSPointer');
			Touche.simulate.gesture(el, [new Touche.Point(55,55)], {
				MSPointer: ['Up']
			}, 'MSPointer');
			expect(this.started).to.be(false);
			expect(this.updated).to.be(false);
			expect(this.called).to.be(false);
			expect(this.cancelled).to.be(false);
			done();
		});

		afterEach(function() {
			Touche(el).off('swipe');
			expect(Touche.cache.data.length).to.be(0);
		});
		
		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			body.removeChild(el);
		});
	});
});