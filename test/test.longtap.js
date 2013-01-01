/*global describe, Touche, expect, it, before, beforeEach, after*/
describe('Gesture', function () {
	var body = document.body;

	describe('#LongTap - Mouse', function () {
		var el, origUtilsTouch, origUtilsMSPointer;

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
			context.called = false;
			context.intervalCount = 0;
			context.cancelled = false;
			context.gesture = {
				options: {
					timeThreshold: 200,
					interval: 10
				},
				start: function() {
					context.intervalCount++;
				},
				update: function() {
					context.intervalCount++;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).longtap(context.gesture);
		});

		it('should get called when tapping in center point and time threshold is met, update should get called 20 times, for mouse events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				mouse: ['down']
			}, 'mouse');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					mouse: ['up']
				}, 'mouse');
				expect(context.called).to.be(true);
				expect(context.intervalCount).to.be(20);
				expect(context.cancelled).to.be(false);
				done();
			}, 225);
		});

		it('should be cancelled when tapping in center point and time threshold is not met, for mouse events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				mouse: ['down']
			}, 'mouse');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					mouse: ['up']
				}, 'mouse');
				expect(context.called).to.be(false);
				expect(context.cancelled).to.be(true);
				done();
			}, 100);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche(el).off('longtap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});

	describe('#LongTap - Touch', function () {
		var el, origUtilsTouch, origUtilsMSPointer;

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
			context.intervalCount = 0;
			context.cancelled = false;
			context.gesture = {
				options: {
					timeThreshold: 200,
					interval: 10
				},
				start: function() {
					context.intervalCount++;
				},
				update: function() {
					context.intervalCount++;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).longtap(context.gesture);
		});

		it('should get called when tapping in center point and time threshold is met, update should get called 20 times, for touch events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				touch: ['start']
			}, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					touch: ['end']
				}, 'touch');
				expect(context.called).to.be(true);
				expect(context.intervalCount).to.be(20);
				expect(context.cancelled).to.be(false);
				done();
			}, 225);
		});

		it('should be cancelled when tapping in center point and time threshold is not met, for touch events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				touch: ['start']
			}, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					touch: ['end']
				}, 'touch');
				expect(context.called).to.be(false);
				expect(context.cancelled).to.be(true);
				done();
			}, 100);
		});

		it('should be cancelled when tapping in center point and using more than one finger, for touch events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				touch: ['start']
			}, 'touch');
			setTimeout(function() {
				Touche.simulate.gesture(el, [new Touche.Point(50,50), new Touche.Point(50,50)], {
					touch: ['move']
				}, 'touch');
				expect(context.called).to.be(false);
				expect(context.cancelled).to.be(true);
				done();
			}, 25);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche(el).off('longtap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});

	describe('#LongTap - MSPointer', function () {
		var el, origUtilsTouch, origUtilsMSPointer;

		before(function() {
			origUtilsTouch = Touche.utils.touch;
			origUtilsMSPointer = Touche.utils.msPointer;
			Touche.utils.touch = false;
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
			context.intervalCount = 0;
			context.cancelled = false;
			context.gesture = {
				options: {
					timeThreshold: 200,
					interval: 10
				},
				start: function() {
					context.intervalCount++;
				},
				update: function() {
					context.intervalCount++;
				},
				end: function () {
					context.called = true;
				},
				cancel: function () {
					context.cancelled = true;
				}
			};
			Touche(el).longtap(context.gesture);
		});

		it('should get called when tapping in center point and time threshold is met, update should get called 20 times, for ms pointer events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				MSPointer: ['Down']
			}, 'MSPointer');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					MSPointer: ['Up']
				}, 'MSPointer');
				expect(context.called).to.be(true);
				expect(context.intervalCount).to.be(20);
				expect(context.cancelled).to.be(false);
				done();
			}, 225);
		});

		it('should be cancelled when tapping in center point and time threshold is not met, for ms pointer events', function (done) {
			this.timeout(250);
			var context = this;
			Touche.simulate.gesture(el, null, {
				MSPointer: ['Down']
			}, 'MSPointer');
			setTimeout(function() {
				Touche.simulate.gesture(el, null, {
					MSPointer: ['Up']
				}, 'MSPointer');
				expect(context.called).to.be(false);
				expect(context.cancelled).to.be(true);
				done();
			}, 100);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			Touche(el).off('longtap');
			expect(Touche.cache.data.length).to.be(0);
			body.removeChild(el);
		});
	});
});