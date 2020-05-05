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
	if (flag) logInfo.innerHTML = out;
	return out;
}

function clearRect() {
	context.clearRect(0,0,context.canvas.width,context.canvas.height);
	logInfo.innerHTML = 'холст очищен';
}
function drawScan() {
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	logInfo.innerHTML = 'Скан нарисован';
}
function contur() {
	outlinePoints = [];
	var tStamp = Date.now();
	outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, 0);
	// console.log(outlinePoints);
	logInfo.innerHTML = JSON.stringify(outlinePoints) + ' time: ' + (Date.now() - tStamp) + ' мсек.';
	// res.push({cont: outlinePoints, holes: []});
	res.push([outlinePoints, []]);
	refreshCont();
};

let gco = [
	'source-over','source-atop','source-in','source-out',
	'destination-over','destination-atop','destination-in','destination-out',
	'copy','xor' /*, 'lighter', 'multiply', 'screen', 'overlay', 'darken',
	'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light',
	'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'*/
];

function refreshCont() {
	var tStamp = Date.now(),
		cont = [],
		holes = [];
	console.log(res);
	res.forEach((it, index) => {
		cont.push('<br>' + index + gco.map(pt => '<input type="button" onclick="drawConturs(' + index + ',0,\'' + pt + '\')" value="' + pt + '" />').join('\n') + '<input type="button" onclick="findNextHole(' + index + ')" value="Найти очередную дырку" />');

	});
	outCont.innerHTML = 'внешние контура' + cont.join('\n');
}

function drawConturs(cc, hh, globalCompositeOperation) {
	var out = ['рисуем контур, всего точек: ' + res[cc].length];
	out.push('<br>гистограмма до: ' + rgba_hist());
	console.log('рисуем контур, всего точек', res[cc].length);
	console.log('гистограмма до', rgba_hist());
	context.globalCompositeOperation = globalCompositeOperation;//"source-over";
			//context.fillstyle = "red";
	context.fillStyle = `rgba(255, 255, ${cc}, 1)`;//"#FF0000";
	context.beginPath();
			//for (var cc=0; cc<arr_points.length; cc++){
	var r = res[cc][hh]; // cc - номер внешнего контура // hh - номер дырки
	context.moveTo(r[0], r[1]);
	for(var i=2; i<r.length; i+=2){
		context.lineTo(r[i], r[i+1]);
	}
	context.lineTo(r[0], r[1]);
	context.fill();
			//}
	console.log('гистограмма после', rgba_hist());
	out.push('<br>гистограмма после: ' + rgba_hist());
	logInfo.innerHTML = out.join('\n');

}

function findNextHole(cc){
	outlinePoints = [];
	outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, cc);
	console.log(outlinePoints);
	if (outlinePoints.length==0) {
		console.log('Дырок нет в этом контуре');
		return;
	}
	res[cc][1].push(outlinePoints);
}

function drawAll(){
	context.globalCompositeOperation = "source-over";
	res.forEach((it, index) => {
		let r = it[0];
		context.fillstyle = "red";
		context.beginPath();
		context.moveTo(r[0], r[1]);
		for(var i=2; i<r.length; i+=2){
			context.lineTo(r[i], r[i+1]);
		}
		context.lineTo(r[0], r[1]);
		context.closePath();
		context.stroke();
		context.fillstyle = "blue";
		let holes = it[1] || [];
		holes.forEach((r, index) => {
			// let r = pt[0];
			context.beginPath();
			context.moveTo(r[0], r[1]);
			for(var i=2; i<r.length; i+=2){
				context.lineTo(r[i], r[i+1]);
			}
			context.lineTo(r[0], r[1]);
			context.closePath();
		});
		context.stroke();
	});
}

				
// остальное пока не понятно
			function findHoles(){
				for (var cc=0; cc<res.length; cc++) {
					outlinePoints = [];
					outlinePoints = MarchingSquaresOld.getBlobOutlinePoints(canvas, cc);
					console.log(outlinePoints);
					if (outlinePoints.length==0) continue;
					res[cc].push([outlinePoints]);
				}
			}
				// res = []; //blue = [16,32,64,128];
				// div1 = document.getElementById('div1');

				function drawContur(conturN){
					if(!context || !res || res.length <= conturN || !res[conturN].length) {console.log(`контур ${conturN} не существует`); return};
					//context.globalCompositeOperation = "source-over";
					context.fillstyle = "red";
					var r = res[conturN];
					context.moveTo(r[0], r[1]);
					for(var i=2; i<r.length; i+=2){
						context.lineTo(r[i], r[i+1]);
					}
					context.fill();
					console.log(`контур ${conturN} из ${r.length} точек нарисован`);
				}
				function rgba_flip(){
					/*
					destination-in 
					{
					0,0,0,0: 3616539, 
					255,255,0,255: 128357
					}
					*/					
					var ar = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
					var ad = ar.data;
	        for(i=0;i<ad.length;i+=4){
	        	ad[i] = 255-ad[i]; ad[i+1] = 255-ad[i+1]; ad[i+3] = 255-ad[i+3];
	        };
	        context.putImageData(ar, 0, 0);
	        console.log('поменяли интенсивности точек');
				}
        function points2path(points) {

					var path = new Path2D(),
						i = 0, point;

					while(point = points[i++])
						path.lineTo(point.x, point.y);

					path.closePath();
					return path
				}
