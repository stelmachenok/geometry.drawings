/**
 * Polygon model.
 */

Drawings.Polygon = function Polygon(points) {
    Drawings.Polygon.superclass.constructor.apply(this, [points]);
    this.square = null;
    this.perimeter = null;
    this.type = null;
    this.segments = [];
};

extend(Drawings.Polygon, Drawings.Shape);

Drawings.Polygon.prototype.setSquare = function (square) {
    this.square = square;
};

Drawings.Polygon.prototype.getSquare = function () {
    return this.square;
};

Drawings.Polygon.prototype.setPerimeter = function (perimeter) {
    this.perimeter = perimeter;
};

Drawings.Polygon.prototype.getPerimeter = function () {
    return this.perimeter;
};

Drawings.Polygon.prototype.getPoints = function () {
	return this.points;
}

Drawings.Polygon.prototype.addSegment = function (segment) {
	this.segments.splice(this.segments, 0, segment);
}