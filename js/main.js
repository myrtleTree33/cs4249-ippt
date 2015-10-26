'use strict';

var radius = 150;
var canvasCenter = {
  x: canvas.width / 2,
  y: canvas.height / 2
}

var minNeeded = [0,0,0];

var labelPoints = [];
var labels = [
  'Push-ups',
  'Sit-ups',
  '2.4 KM run'
];
var colorsActive = [
  '#ff0000',
  '#00ff00',
  '#0000ff'
]

var colorsInvalid = [
  '#cccccc',
  '#dddddd',
  '#eeeeee'
]

var colors = colorsActive;

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
};

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
    var ratio = angles[i] / 360;
    // var colorTint = colors[i];
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
  var angles = _.map(ratiosInvert, function(rInv) {
    return rInv / ratiosSum * 360;
  });
  return angles;
}

function makePointText(labelPts) {
  console.log('hihi')
  _.each(labelPts, function(pt, i) {
    new PointText({
      point: pt,
      fillColor: colors[i],
      fontSize: 26,
      fontFamily: 'Lato',
      content: labels[i] + "\n" + minNeeded[i]
    });
    console.log("needed: " + minNeeded);
  });
}

var MIN_POINTS = 66;

function getStationPts(angles) {
  var ratios = _.map(angles, function(angle) {
    return angle / 360;
  });

  var eachStationPts = _.map(ratios, function(r, idx) {
    return Math.floor(r * 66);
  });


  if (eachStationPts[0] > 25) {
    return false;
  }
  if (eachStationPts[1] > 25) {
    return false;
  }
  if (eachStationPts[2] > 50) {
    return false;
  }
  console.log(eachStationPts);
  return eachStationPts;
}

function getRunTime(pts) {
  var min = moment.duration({
      seconds: 30,
      minutes: 8
    }),
    max = moment.duration({
      seconds: 10,
      minutes: 16
    }),
    interval = max.subtract(min).as('milliseconds') / 120,
    result = max.subtract(interval * pts, 'milliseconds');
  return moment.utc(result.asMilliseconds()).format('mm:ss');
}

function getPushUpsNeeded(pts) {
  var min = 15,
    max = 60,
    interval = (max - min) / 25;
  return Math.floor(min + pts * interval);
}

function getSitupsNeeded(pts) {
  var min = 14,
    max = 60,
    interval = (max - min) / 25;
  // console.log(pts)
  return Math.floor(min + pts * interval);
}

function displayPts(stationPts) {
  if (!stationPts) {
    // TODO this can be set to invalid here
    // colors = colorsInvalid;
    return; // if invalid do not show
  }
  colors = colorsActive;
  minNeeded[0] = getPushUpsNeeded(stationPts[0]);
  minNeeded[1] = getSitupsNeeded(stationPts[1]);
  minNeeded[2] = getRunTime(stationPts[2]);
}

function onMouseDrag(event) {
  paper.project.activeLayer.removeChildren()
  createTriangle();
  var currPt = event.point;
  var dists = calcDistances(currPt, labelPoints);
  var angles = getAngles(dists);
  drawWidget(angles);
  var stationPts = getStationPts(angles);
  displayPts(stationPts);
  makePointText(labelPoints);
}


// init
(function() {
  createTriangle();
  drawWidget([120,120,120]);
})();
