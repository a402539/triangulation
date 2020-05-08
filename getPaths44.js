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
	paths = [], startContur = {w: 0, h: 0}, startHole = {w: 0, h: 0};

function rgba_hist() {
	var tStamp = Date.now();
	var ar = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	var ad = ar.data;
	var ap = new Set();
	for(var i=0; i<ad.length; i+=4){
		if (ap.hasOwnProperty([ad[i],ad[i+1],ad[i+2],ad[i+3]])) {ap[[ad[i],ad[i+1],ad[i+2],ad[i+3]]]++;}
		else {ap[[ad[i],ad[i+1],ad[i+2],ad[i+3]]]=1;}
	}
	var out = JSON.stringify(ap) + ' time: ' + (Date.now() - tStamp) + ' мсек.';
	return out;
}

function rgba_(r,g,b,a) {
	var tStamp = Date.now();
	width = context.canvas.width;
	var ar = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
	var ad = ar.data;
	var ap = [];
	for(var i=0; i<ad.length; i+=4){
		i4 = i<<2;
		if (ad[i]==r && ad[i+1] == g && ad[i+2] == b && ad[i+3]==a) {ap.push([i4,(i4-i4%width)/width|0,i4%width|0]);};// if(ap.length==10) break;};
	}
	//var out = JSON.stringify(ap) + ' time: ' + (Date.now() - tStamp) + ' мсек.';
	return ap;//out;
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
	context.fillStyle = `rgba(0, 0, 0, 1)`;
	var i, j, holes = [], points = [], holePoints = [];
	for (i = 0; i < 10; i++) { // цикл по внешним контурам
		points = MarchingSquaresOld.getBlobOutlinePoints(canvas, 0);
		if (!points.length) break;
		//rgba_hist();
		//rgba_(255,255,0,255);
		var ppoints = points2path(points);
		context.fill(ppoints); // "{"0,0,0,0":849853,"0,0,0,255":252,"255,255,0,255":223105} time: 7548 мсек."
		//context.stroke(ppoints); // "{"0,0,0,0":849322,"0,0,0,127":538,"0,0,0,128":214,"255,255,0,127":120,"255,255,0,255":222914,"129,129,0,127":5,"128,128,0,128":66,"0,0,0,255":31} time: 7648 мсек."
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
	//console.log(' time: ' + (Date.now() - tStamp) + ' мсек.');
	strokePaths();
	console.log(' time1: ' + (Date.now() - tStamp) + ' мсек.');
}

function conturNew() {
	var tStamp = Date.now();
	context.globalCompositeOperation = "xor";
	context.fillStyle = `rgba(0, 0, 0, 1)`;
	var i, j, holes = [], points = [], holePoints = [];
	for (i = 0; i < 10; i++) { // цикл по внешним контурам
		startContur = findStart(false);
		points = findPerimeter(false); //MarchingSquaresOld.getBlobOutlinePoints(canvas, 0);
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
	strokePaths();
	console.log(' time1: ' + (Date.now() - tStamp) + ' мсек.');
}
function findStart(hole){
	var h0 = (hole)?startHole.h:startContur.h,
			w0 = (hole)?startHole.w:startContur.w,
			width = canvas.width,
			height = canvas.height,
			ar = context.getImageData(0, 0, width, height),
			ad = ar.data;
	for (var h=h0; h<height; h++){           // сверху вниз
		for (var w=(h=h0)?w0:0; w<width; w++){ // слева направо
			idx = ((h*width + w)|0)<<2;
			if (ad[idx+3] > hole)
				return {w: w, h: h};
		}
	}
	return {w: w0, h: h0};
}

function findPerimeter(hole){
	var h0 = (hole)?startHole.h:startContur.h,
			w0 = (hole)?startHole.w:startContur.w,
			width = canvas.width,
			height = canvas.height,
			ar = context.getImageData(0, 0, width, height),
			ad = ar.data;
	h = h0;           // сверху вниз
	w = w0; // слева направо
	points = [{w: w, h: h}];
	dir = "направо"; //"вниз", "налево", "вверх"
	do {
		idx = ((h*width + w)|0)<<2;
		switch (dir){
			case "направо":
				switch (true){
					case h > 0 && ad[idx-width+3] > hole:
						dir = "вверх"; h--; break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; break;
					case h + 1 < height && ad[idx+width+3] > hole:
						dir = "вниз"; h++; break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; break;
				}
				break;
			case "вниз":
				switch (true){
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; break;
					case h + 1 < height && ad[idx+width+3] > hole:
						dir = "вниз"; h++; break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; break;
					case h > 0 && ad[idx-width+3] > hole:
						dir = "вверх"; h--; break;
				}
				break;
			case "налево":
				switch (true){
					case h + 1 < height && ad[idx+width+3] > hole:
						dir = "вниз"; h++; break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; break;
					case h > 0 && ad[idx-width+3] > hole:
						dir = "вверх"; h--; break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; break;
				}
				break;
			case "вверх":
				switch (true){
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; break;
					case h > 0 && ad[idx-width+3] > hole:
						dir = "вверх"; h--; break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; break;
					case h + 1 < height && ad[idx+width+3] > hole:
						dir = "вниз"; h++; break;
				}
				break;
			//if (hole < ad[3+(idx+w)<<2]) return {w: w, h: h};
		}
		points.push({w: w, h: h});
	}
	while (w!=w0 || h!=h0);
	return points;
}

function strokePaths() {
	paths.forEach(it => {
		context.stroke(it.cont);
		it.holes.forEach(h => { context.stroke(h); });
	});
}

function points2path(points) {
	var path = new Path2D();
	path.moveTo(points[0], points[1]);
	for(var i = 2; i < points.length; i += 2) {
		path.lineTo(points[i], points[i+1]);
	}
	path.lineTo(points[0], points[1]);
	//path.closePath();
	return path
}
