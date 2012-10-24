	/*global describe, Touche, expect, it*/
	describe('Gesture', function () {
		var doc = window.document,
			body = doc.body,
			el = document.createElement('div'),
			elRect = Touche.getRect(el),
			point;

		body.appendChild(el);

		describe('#Tap', function () {

			el.style.width = "100px";
			el.style.height = "100px";

			beforeEach(function () {
				var context = this;
				this.called = false;
				this.cancelled = false;
				this.gesture = {
					options: {
						areaThreshold: 5
					},
					end: function () {
						context.called = true;
					},
					cancel: function () {
						context.cancelled = true;
					}
				};
				Touche.tap(el, this.gesture);
				Touche.simulate.gesture(el);
			});

			it('should get called when tapping in center point', function () {
				expect(this.called).to.be(true);
			});

			it('should not be cancelled when tapping in center point', function () {
				expect(this.cancelled).to.be(false);
			});


			/*point = new Touche.Point(elRect.x - 20, elRect.y);
			Touche.simulate.gesture(el, [point]);

			it('should be cancelled when tapping outside element and areaThreshold', function() {
				expect(cancelled).to.be(true);
			});

			Touche.cache.get(el).context.removeGestures('tap');*/
		});

		body.removeChild(el);
	});