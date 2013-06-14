/*global describe, Touche, expect, it, before, after*/
describe('Touché - user api', function() {

	describe('#on', function() {
		var doc = window.document;

		it('should add correct gesture to Touché', function () {
			['tap', 'doubletap', 'longtap', 'swipe'].forEach(function(gesture) {
				Touche(doc).on(gesture);
				expect(Touche.cache.get(doc).gestures[0]).to.be.a(Touche._gestures[gesture]);
				Touche(doc).off();
			});
		});

		it('should get correct default options for gesture', function () {
			['tap', 'doubletap', 'longtap', 'swipe'].forEach(function(gesture) {
				Touche(doc).on(gesture);
				var defaults = Touche._gestures[gesture].prototype.defaults;
				Object.keys(defaults).forEach(function(key) {
					expect(defaults[key]).to.be.equal(Touche.cache.get(doc).gestures[0].options[key]);
				});
				Touche(doc).off();
			});
		});

		it('should be able to set preventDefault option for gesture', function () {
			['tap', 'doubletap', 'longtap', 'swipe'].forEach(function(gesture) {
				Touche(doc).on(gesture, {
					options: {
						preventDefault: false
					}
				});
				var defaults = Touche._gestures[gesture].prototype.defaults;
				Object.keys(defaults).forEach(function(key) {
					if(key === 'preventDefault') {
						expect(Touche.cache.get(doc).gestures[0].options[key]).to.be(false);
					} else {
						expect(defaults[key]).to.be.equal(Touche.cache.get(doc).gestures[0].options[key]);
					}
				});
				Touche(doc).off();
			});
		});

		/*it("should be able to set preventDefault for the bounded tap in doubletap", function() {
			var dt = Touche.gestures.get("doubletap").augment(function(DoubleTap){
				this.end = function() {
					expect(this.options.preventDefault).to.be(false);
				};

				function DoubleTapTest() {
					DoubleTap.apply(this, arguments);
				}
				return DoubleTapTest;
			});
			Touche.gestures.add('doubletaptest', dt);
			Touche(doc).on("doubletaptest", {
				options: {
					preventDefault: false
				}
			});
			Touche.simulate.gesture(doc, null, null, 'mouse');
		});*/

		after(function() {
			Touche(doc).off();
			expect(Touche.cache.data.length).to.be(0);
		});
	});

	describe('#off', function() {
		var el, body = document.body, origUtilsMSPointer, origUtilsTouch;

		before(function () {
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

			var context = this;
			context.gestures = {};

			context.gestures.tap = {
				called: false,
				gesture: {
					end: function() {
						context.gestures.tap.called = true;
					}
				}
			};
			context.gestures.doubletap = {
				called: false,
				gesture: {
					id: 'mydoubletap',
					options: {
						timeThreshold: 200
					},
					end: function() {
						context.gestures.doubletap.called = true;
					}
				}
			};
			Touche(el)
				.tap(context.gestures.tap.gesture)
				.doubletap(context.gestures.doubletap.gesture);
		});

		it('should be able to unbind doubletap without unbinding tap on same element', function () {
			var context = this;
			context.timeout(500);
			Touche.simulate.gesture(el, null, null, 'mouse', null, null, 0);
			setTimeout(function(){
				expect(context.gestures.tap.called).to.be(true);
				expect(context.gestures.doubletap.called).to.be(false);
				context.gestures.tap.called = false;
				context.gestures.doubletap.called = false;
				Touche.simulate.gesture(el, null, null, 'mouse', null, null, 0);
				Touche.simulate.gesture(el, null, null, 'mouse', null, null, 0);
				expect(context.gestures.tap.called).to.be(false);
				expect(context.gestures.doubletap.called).to.be(true);
				Touche(el).off('doubletap', context.gestures.doubletap.gesture.id);
				context.gestures.tap.called = false;
				context.gestures.doubletap.called = false;
				Touche.simulate.gesture(el, null, null, 'mouse', null, null, 0);
				Touche.simulate.gesture(el, null, null, 'mouse', null, null, 0);
				expect(context.gestures.tap.called).to.be(true);
				expect(context.gestures.doubletap.called).to.be(false);
			},350);
		});

		after(function() {
			Touche.utils.touch = origUtilsTouch;
			Touche.utils.msPointer = origUtilsMSPointer;
			Touche(el).off();
			expect(Touche.cache.data.length).to.be(0);
		});
	});
});