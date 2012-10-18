describe('Point', function() {
	var p1 = new Touche.Point(4, 10),
		p2 = new Touche.Point(6, 20);

	describe('#Constructor', function() {
		it("should set correct x", function() {
			expect(p1.x).to.be(4);
		});

		it("should set correct y", function() {
			expect(p1.y).to.be(10);
		});
	});

	describe('#distanceTo', function() {
		it("should return correct distance", function() {
			expect(p1.distanceTo(p2)).to.be(10.198039027185569);
		});
	});
});