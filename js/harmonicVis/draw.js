var sampleRate = 50;
function updateSampleRate(value)
{
  sampleRate = 50 - value;
}

function createCanvas()
{
  var canvas = document.getElementById("draw-canvas");
  var processing = new Processing(canvas, processingFunction);
  processing.size(window.innerWidth, window.innerHeight / 1.5);
}

function processingFunction(processing)
{
  var sampleMarks = [];
  processing.setup = function()
  {
    $(window).resize(function() {processing.size(window.innerWidth, window.innerHeight / 1.5); sampleMarks = [];});
  }

  var rotation = 0;
  var tickSince = 0;
  var pendulumTick = 0;
  processing.draw = function()
  {
    //Update projection timer
    tickSince++;
    pendulumTick++;
    rotation += .05;

    processing.background(237,245,225);
    processing.strokeWeight(10);
    processing.stroke(5,56,107);
    processing.line(processing.width / 2, processing.height / 8, processing.width / 2, processing.height * 7 / 8);

    processing.stroke(0, 0, 0);
    processing.strokeWeight(2);

    var drawScale = Math.min(processing.width, processing.height) / 5;
    var position = [drawScale * Math.cos(rotation), drawScale * Math.sin(rotation)];
    drawRotator(processing, position, drawScale);

    var pendulumAngle = (Math.PI / 2 * Math.cos(Math.sqrt(1 / drawScale) * (pendulumTick / 2)) / 2) + (Math.PI / 2);
    var pendulumPosition = [drawScale * Math.cos(pendulumAngle), drawScale * Math.sin(pendulumAngle)];
    drawPendulum(processing, pendulumPosition, drawScale);

    if (tickSince / sampleRate >= 1)
    {
      sampleMarks.push(createSampleMark([processing.width / 4 + position[0], processing.height / 2]));
      sampleMarks.push(createSampleMark([processing.width * 3 / 4 + pendulumPosition[0], processing.height / 2]));

      //Reset tick
      console.log(tickSince);
      tickSince = 0;
    }

    var passedMarks = [];
    for (var i = 0; i < sampleMarks.length; i++)
    {
      if (sampleMarks[i].draw(processing) == true)
      {
        passedMarks.push(sampleMarks[i]);
      }
    }
    sampleMarks = passedMarks;
  }
}

var MARK_HORIZONTAL_DELTA = 2;
var MARK_RADIUS = 2;
function createSampleMark(position)
{
  return {
    position: position,
    draw: function(processing){
      processing.strokeWeight(4);
      position[1] += MARK_HORIZONTAL_DELTA;
      if (position[1] - MARK_RADIUS >= processing.height)
      {
        return false;
      }
      else
      {
        processing.ellipse(position[0], position[1], MARK_RADIUS, MARK_RADIUS);
        return true;
      }
    }
  }
}

function drawPendulum(processing, position, drawScale)
{
  processing.ellipse(processing.width * 3 / 4 + position[0], processing.height / 4 + position[1], drawScale / 4, drawScale / 4);
  processing.strokeWeight(4);
  processing.line(processing.width * 3 / 4, processing.height / 4, processing.width * 3 / 4 + position[0], processing.height / 4 + position[1]);
  processing.strokeWeight(1);
  processing.line(processing.width * 3 / 4 + position[0], processing.height / 4 + position[1], processing.width * 3 / 4 + position[0], processing.height / 2);
}

function drawRotator(processing, position, drawScale)
{
  processing.fill(237,245,225);
	processing.ellipse(processing.width / 4, processing.height / 4, drawScale * 2, drawScale * 2);
  processing.fill(255);

  processing.ellipse(processing.width / 4 + position[0], processing.height / 4 + position[1], drawScale / 4, drawScale / 4);
  processing.strokeWeight(4);
  processing.line(processing.width / 4, processing.height / 4, processing.width / 4 + position[0], processing.height / 4 + position[1]);
  processing.strokeWeight(1);
  processing.line(processing.width / 4 + position[0], processing.height / 4 + position[1], processing.width / 4 + position[0], processing.height / 2);
}
