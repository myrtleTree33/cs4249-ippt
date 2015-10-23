'use strict';

var radius = 150;
var canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2
}

var labelPoints = [];
var labels = [
  'Push-ups',
  'Sit-ups',
  '2.4 KM run'
];
var colors = [
  '#f00',
  '#0f0',
  '#00f'
]
var distBtwPoints = [];

// Create a triangle shaped path
var createTriangle = function() {
  var triangle = new Path.RegularPolygon(new Point(
    canvasCenter.x, canvasCenter.y, 0), 3, radius);
  triangle.fillColor = '#e9e9ff';
  triangle.selected = true;
  labelPoints = _.pluck(triangle.segments, 'point');
};

var createCircle = function() {
  var myCircle = new Path.Circle(new Point(
    canvasCenter.x,
    canvasCenter.y), radius);
  myCircle.selected = true;
  // myCircle.fillColor = 'black';
};

createTriangle();
// createCircle();

// var start = new Point(view.center.x, view.center.y - 130);
// var through = new Point(view.center.x - 20, view.center.y - 94);
// var to = new Point(view.center.x - 113, view.center.y - 64);

var makePoint = function(angle) {
  var newAngle = angle * Math.PI / 180;
  return new Point(
    canvasCenter.x + radius * Math.cos(newAngle),
    canvasCenter.y + radius * Math.sin(newAngle)
  );
};

var drawSegment = function(startAngle, endAngle, lineColor) {
  var start = makePoint(startAngle);
  var through = makePoint((endAngle - startAngle) / 2 + startAngle);
  var end = makePoint(endAngle);
  var arc = new Path.Arc(start, through, end);
  arc.strokeColor = lineColor;
  arc.strokeWidth = 15;
  arc.selected = true;
  // return {
  //   arc: arc,
  //   midPoint: through
  // };
};

var drawWidget = function(angles) {
  var startAngle = -90;
  for (var i = 0; i < angles.length; i++) {
    var endAngle = startAngle + angles[i];
    drawSegment(startAngle, endAngle, colors[i]);
    startAngle = endAngle + 0;
  }
};

function getAngle(pt1, pt2) {
  var x = pt1.x - pt2.x;
  var y = pt1.y - pt2.y;
  return Math.atan2(y, x);
}

function getValidPt(mousePt, boundaryPt, centerPt) {
  var dist = mousePt.getDistance(centerPt);
  if (dist > radius) {
    return boundaryPt;
  }
  return mousePt;
}

function calcDistances(currPt, labelPoints) {
  var dists = [];
  var centerPt = new Point(
    canvasCenter.x,
    canvasCenter.y
  );
  var angleFromCenter = getAngle(currPt, centerPt);
  var ptOnCircle = new Point(
    centerPt.x + radius * Math.cos(angleFromCenter),
    centerPt.y + radius * Math.sin(angleFromCenter)
  );
  var validPoint = getValidPt(currPt, ptOnCircle, centerPt);
  var rect = new Path.Circle(validPoint, 20);
  rect.fillColor = '#000';
  for (var i = 0; i < labelPoints.length; i++) {
    var dist = Math.min(validPoint.getDistance(labelPoints[i]), 1 * radius);
    if (i == 1) {}
    // var dist = Math.min(currPt.getDistance(labelPoints[i]), 1 * radius);
    dists.push(dist);
  }
  return dists;
}

function getAngles(distances) {
  var total = _.sum(distances);
  var ratiosInvert = _.map(distances, function(dist) {
    return Math.pow(total / dist, 1); // inverted ratio
  });
  var ratiosSum = _.sum(ratiosInvert);

  var ratios = _.map(ratiosInvert, function(rInv) {
    return rInv / ratiosSum;
  });
  console.log(ratios);
  var angles = _.map(ratiosInvert, function(rInv) {
    return rInv / ratiosSum * 360;
  });
  return angles;
}

function makePointText(labelPts) {
  _.each(labelPts, function(pt, i) {
    new PointText({
      point: pt,
      fillColor: colors[i],
      fontSize: 14,
      fontFamily: 'Monospace',
      content: labels[i]
    });
  });
}

function onMouseDrag(event) {
  paper.project.activeLayer.removeChildren()
  var currPt = event.point;
  var dists = calcDistances(currPt, labelPoints);
  var ratios = getAngles(dists);
  drawWidget(ratios);
  makePointText(labelPoints);
}
