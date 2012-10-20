/*global describe, Touche, expect, it*/
describe('Rect', function() {
	var r = new Touche.Rect(4, 8, 100, 50),
		p1 = new Touche.Point(30, 40),
		p2 = new Touche.Point(2, 2);

	describe('#Constructor', function() {
		it('should set correct `x`', function() {
			expect(r.x).to.be(4);
		});

		it('should set correct `y`', function() {
			expect(r.y).to.be(8);
		});

		it('should set correct `width`', function() {
			expect(r.width).to.be(100);
		});

		it('should set correct `height`', function() {
			expect(r.height).to.be(50);
		});
	});

	describe('#pointInside', function() {
		it('should return `true` when point is inside', function() {
			expect(r.pointInside(p1)).to.be(true);
		});

		it('should return `false` when point is outside', function() {
			expect(r.pointInside(p2)).to.be(false);
		});
	});

	describe('#getRect', function() {
		it('should get a `Rect` instance', function() {
			expect(Touche.getRect(document.createElement('div'))).to.be.a(Touche.Rect);
		});
	});
});