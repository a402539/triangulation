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
	res = [];

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
	for (var cc=0; cc<20; cc++){ // цикл по внешним контурам
		// console.log(`контур ${cc}`); //rgba_hist();
    outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 0); // console.log(outlinePoints); // внешний контур
		if (outlinePoints.length==0) break;
		res.push([outlinePoints]);
		drawConturs(outlinePoints); // скрыть найденный внешний контур
		for (hh=0; hh<20; hh++){ // цикл по дыркам
      outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 1); // console.log(outlinePoints); // дырка
			if (outlinePoints.length==0) break;
			res[cc].push(outlinePoints);
			drawConturs(outlinePoints); // скрыть найденную дырку
		}
	}
	console.log(' time: ' + (Date.now() - tStamp) + ' мсек.');
	strokeConturs();
}

function drawConturs(p){
	//if (p.length < 3) {console.log(`нет точек в контуре ${cc}`); return;}
	// console.log(`рисуем контур, всего точек ${p.length}`);
	//console.log('гистограмма до'); rgba_hist();
	context.globalCompositeOperation = "xor";//globalCompositeOperation;//"source-over";
	//context.fillstyle = "red";
  context.fillStyle = `rgba(255, 255, 1, 1)`;//"#FF0000";
	context.beginPath();
	context.moveTo(p[0], p[1]);
	for(var i=2; i<p.length; i+=2){
		context.lineTo(p[i], p[i+1]);
	}
	context.lineTo(p[0], p[1]);
	context.fill();
	//console.log('гистограмма после'); rgba_hist();
}

function strokeConturs(){
	for (cc=0; cc<res.length; cc++){
		for (hh=0; hh<res[cc].length; hh++){
			p = res[cc][hh];
      context.fillStyle = `green`;//"#FF0000";
			context.beginPath();
			context.moveTo(p[0], p[1]);
			for(var i=2; i<p.length; i+=2){
				context.lineTo(p[i], p[i+1]);
			}
			context.lineTo(p[0], p[1]);
			context.stroke();
			
		}
	}
}
function points2path(points) {

	var path = new Path2D(),
		i = 0, point;

	while(point = points[i++])
		path.lineTo(point.x, point.y);

	path.closePath();
	return path
}
