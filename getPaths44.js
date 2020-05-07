var image = document.getElementById('img1');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
window.onload = function() {
	canvas.width = image.width; canvas.height = image.height;
}

var logInfo = document.getElementById('logInfo'),
	outCont = document.getElementById('outCont'),
	holesCont = document.getElementById('holesCont');

var outlinePoints = [],
	paths = [];

function rgba_hist(flag) {
	if (context.canvas.width==0 || context.canvas.height==0) return;
	var tStamp = Date.now();
	var ar = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	var ad = ar.data;
	var ap = new Set();
	for(var i=0; i<ad.length; i+=4){
		if (ap.hasOwnProperty([ad[i],ad[i+1],ad[i+2],ad[i+3]])) {ap[[ad[i],ad[i+1],ad[i+2],ad[i+3]]]++;}
		else {ap[[ad[i],ad[i+1],ad[i+2],ad[i+3]]]=1;}
	}
	// console.log(ap, iStamp);
	var out = JSON.stringify(ap) + ' time: ' + (Date.now() - tStamp) + ' мсек.';
	// if (flag) logInfo.innerHTML = out;
	return out;
}

function clearRect() {
	context.clearRect(0,0,context.canvas.width,context.canvas.height);
	// logInfo.innerHTML = 'холст очищен';
}
function drawScan() {
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	// logInfo.innerHTML = 'Скан нарисован';
}
function contur() {
	var tStamp = Date.now();
	context.globalCompositeOperation = "xor";
	context.fillStyle = `rgba(255, 255, 1, 1)`;
	var i, j, holes = [], points = [], holePoints = [];
	for (i = 0; i < 10; i++) { // цикл по внешним контурам
		points = MarchingSquaresOld.getBlobOutlinePoints(canvas, 0);
		if (!points.length) break;
		var ppoints = points2path(points);
		context.fill(ppoints);
		holes = [];
		for (j = 0; j < 10; j++) { // цикл по дыркам
			holePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 1);
			if (!holePoints.length) break;
			var phole = points2path(holePoints);
			holes.push(phole);
			context.fill(phole);
		}
		paths.push({cont: ppoints, holes: holes});
	}
	console.log(' time: ' + (Date.now() - tStamp) + ' мсек.');
	strokePaths();
	console.log(' time1: ' + (Date.now() - tStamp) + ' мсек.');
}

function strokePaths() {
	paths.forEach(it => {
		context.stroke(it.cont);
		it.holes.forEach(h => { context.stroke(h); });
	});
}

function points2path(points) {
	var path = new Path2D();

	for(var i = 0; i < points.length; i += 2) {
		path.lineTo(points[i], points[i+1]);
	}
	path.closePath();
	return path
}
