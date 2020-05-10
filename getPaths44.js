var image = document.getElementById('img1');
var canvas = document.getElementById('canvas'),
		canvas2 = document.getElementById('canvas2'),
		canvas3 = document.getElementById('canvas3');
var context = canvas.getContext('2d'),
		context2 = canvas2.getContext('2d'),
		context3 = canvas3.getContext('2d');
window.onload = function() {
	canvas.width = image.width; canvas.height = image.height;
	context.imageSmoothingEnabled = false;
	//context.drawImage(image, 1, 1);
	//context.globalCompositeOperation = "source-over";
	//context.fillStyle = `rgba(100,100,100,1)`;
	canvas2.width = 201; canvas2.height = 201;
	//context2.fillRect(0,0,200,200);
	context2.imageSmoothingEnabled = false;
	context2.scale(67, 67);
	canvas3.width = 3; canvas3.height = 3;
	context3.imageSmoothingEnabled = false;
	//context3.globalCompositeOperation = "xor";
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
		var ppoints = points2path2(points);
		context.fill(ppoints); // "{"0,0,0,0":849853,"0,0,0,255":252,"255,255,0,255":223105} time: 7548 мсек."
		//context.stroke(ppoints); // "{"0,0,0,0":849322,"0,0,0,127":538,"0,0,0,128":214,"255,255,0,127":120,"255,255,0,255":222914,"129,129,0,127":5,"128,128,0,128":66,"0,0,0,255":31} time: 7648 мсек."
		holes = [];
		for (j = 0; j < 10; j++) { // цикл по дыркам
			holePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 1);
			if (!holePoints.length) break;
			var phole = points2path2(holePoints);
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
		xor(points); 
		var ppoints = points2path(points);	
		//context.fill(ppoints);
		holes = [];
		for (j = 0; j < 10; j++) { // цикл по дыркам
			startHole = findStart(true);
			holePoints = findPerimeter(true); //holePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 1);
			if (!holePoints.length) break;
			xor(holePoints); 
			var phole = points2path(holePoints); 
			//holes.push(phole);
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
		idx = ((h*width + w)|0)<<2; width4 = width<<2|0;
		//console.log(context.getImageData(w-1, h-1, 3, 3).data);
		context3.putImageData(context.getImageData(w>0?w-1:0, h>0?h-1:0, w>0?3:2, h>0?3:2), w>0?0:1, h>0?0:1);
		//context3.fillStyle = `rgba(100,100,100,0.5)`;
		context3.fillRect(1,1,1,1);
		context2.clearRect(0,0,3,3);
		context2.drawImage(canvas3, 0, 0);
		switch (dir){
			case "направо":
				context3.fillRect(0,1,1,1);
				//context3.putImageData(context.getImageData(w, h, 3, 3), 0, 0);
				//context2.drawImage(canvas3, 0, 0);
				switch (true){
					case h > 0 && ad[idx-width4+3] > hole:
						dir = "вверх"; h--; //console.log('идем слева вверх'); break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; //console.log('идем слева направо'); break;
					case h + 1 < height && ad[idx+width4+3] > hole:
						dir = "вниз"; h++; //console.log('идем слева вниз'); break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; //console.log('идем слева налево'); break;
				}
				break;
			case "вниз":
				context3.fillRect(1,0,1,1);
				//context3.putImageData(context.getImageData(w, h, 3, 3), 0, 0);
				//context2.drawImage(canvas3, 0, 0);
				switch (true){
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; //console.log('идем сверху направо'); break;
					case h + 1 < height && ad[idx+width4+3] > hole:
						dir = "вниз"; h++; //console.log('идем сверху вниз'); break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; //console.log('идем сверху налево'); break;
					case h > 0 && ad[idx-width4+3] > hole:
						dir = "вверх"; h--; //console.log('идем сверху вверх'); break;
				}
				break;
			case "налево":
				context3.fillRect(2,1,1,1);
				//context3.putImageData(context.getImageData(w, h, 3, 3), 0, 0);
				//context2.drawImage(canvas3, 0, 0);
				switch (true){
					case h + 1 < height && ad[idx+width4+3] > hole:
						dir = "вниз"; h++; //console.log('идем справа вниз'); break;
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; //console.log('идем справа налево'); break;
					case h > 0 && ad[idx-width4+3] > hole:
						dir = "вверх"; h--; //console.log('идем справа вверх'); break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; //console.log('идем справа направо'); break;
				}
				break;
			case "вверх":
				context3.fillRect(1,2,1,1);
				//context3.putImageData(context.getImageData(w, h, 3, 3), 0, 0);
				//context2.drawImage(canvas3, 0, 0);
				switch (true){
					case w > 0 && ad[idx-1] > hole:
						dir = "налево"; w--; //console.log('идем снизу налево'); break;
					case h > 0 && ad[idx-width4+3] > hole:
						dir = "вверх"; h--; //console.log('идем снизу вверх'); break;
					case w + 1 < width && ad[idx+7] > hole:
						dir = "направо"; w++; //console.log('идем снизу направо'); break;
					case h + 1 < height && ad[idx+width4+3] > hole:
						dir = "вниз"; h++; //console.log('идем снизу вниз'); break;
				}
				break;
			//if (hole < ad[3+(idx+w)<<2]) return {w: w, h: h};
		}
		points.push({w: w, h: h});
	}
	while (w!=w0 || h!=h0);
	return points;
}

function xor(points) {
	context.moveTo(points[0].w, points[0].h);
	for(var i = 1; i < points.length; i++) {
		context.lineTo(points[i].w, points[i].h);
	}
	context.lineTo(points[0].w, points[0].h);
	//path.closePath();
	//return path
	context.fill();
}

function strokePaths() {
	paths.forEach(it => {
		context.stroke(it.cont);
		it.holes.forEach(h => { context.stroke(h); });
	});
}

function points2path(points) {
	var path = new Path2D();
	path.moveTo(points[0].w, points[0].h);
	for(var i = 1; i < points.length; i++) {
		path.lineTo(points[i].w, points[i].h);
	}
	path.lineTo(points[0].w, points[0].h);
	//path.closePath();
	return path
}

function points2path2(points) {
	var path = new Path2D();
	path.moveTo(points[0], points[1]);
	for(var i = 2; i < points.length; i+=2) {
		path.lineTo(points[i], points[i+1]);
	}
	path.lineTo(points[0], points[1]);
	//path.closePath();
	return path
}
