"use strict";

//var dataActual=[];
var data=[];

var actualVal;
var lineChart;
var i = 0;
var recording = false;
var count1 = 1;
var count2 = 1;

var chartLabels = ['Time', 'Requested Val', 'Actual Val', 'F', 'P', 'I', 'D'];

$(document).ready(function(){
	NetworkTables.addGlobalListener(onValueChanged, true);

	initFromLocalStorage();

	$('#btnSendParms').click(function(){
		sendParms()
	});

	$('#toggleRecording').change(function() {
		count1++;
		if(count1 % 2 === 0){
			recording = true;
		}
		else{
			recording = false;
		}
	});
	$('#toggleStreaming').change(function() {

	   if ($(this).prop('checked')) {
			i = 0;
			data = [];
			window.IntervalId = setInterval(function() {

				i++;

				var y1 = parseFloat($("#val").val());
				var y2 = actualVal;
				var kF = parseFloat($('#kF').val());
				var kP = parseFloat($('#kP').val());
				var kI = parseFloat($('#kI').val());
				var kD = parseFloat($('#kD').val());

				//if (i < 5) { alert(y1 + '   ' + y2 + (i/10.0));}
				data.push([i/10.0, y1, y2, kF, kP, kI, kD]);

				if (i > 100) {
					data.shift();
				}
				if(recording && i % 100 === 0 && i > 0){
	  			saveData();
	  		}
				//file can point to an actual system file or an array
				lineChart.updateOptions( { 'file': data } );
				}, 100);
	   }
	   else {
			clearInterval(window.IntervalId);
	   }
	});

	createchart();
	});
	function saveData(){
		var now = new Date();
		var year = now.getFullYear();
		var month = now.getMonth()+1;
		var day = now.getDate();
		var hour = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();
		var csv = Papa.unparse({
			fields: chartLabels,
			data: data
		});
		var fileName = (year + "-" + month + "-" + day + "_" + hour + "-" + minute + "-" + second + ".csv");
		var prefix = 'data:text/csv;charset=utf-8,';
		var fileData = encodeURI(prefix + csv);
		var link = document.createElement('a');

		link.setAttribute('href', fileData);
		link.setAttribute('download', fileName);
		link.click();
	}

function sendParms() {
	NetworkTables.putValue('/arm/setPoint', $('#val').val());
	NetworkTables.putValue('/arm/kF', $('#kF').val());
	NetworkTables.putValue('/arm/kP', $('#kP').val());
	NetworkTables.putValue('/arm/kI', $('#kI').val());
	NetworkTables.putValue('/arm/kD', $('#kD').val());

	localStorage.setItem('setPoint', $('#val').val());
	localStorage.setItem('kF', $('#kF').val());
	localStorage.setItem('kP', $('#kP').val());
	localStorage.setItem('kI', $('#kI').val());
	localStorage.setItem('kD', $('#kD').val());
}

function initFromLocalStorage() {
	$('#val').val(localStorage.getItem('setPoint'));
	$('#kF').val(localStorage.getItem('kF'));
	$('#kP').val(localStorage.getItem('kP'));
	$('#kI').val(localStorage.getItem('kI'));
	$('#kD').val(localStorage.getItem('kD'));
}

function onValueChanged(key, value, isNew) {

	if (key == '/arm/val') {
		actualVal = Math.abs(parseInt(value));
	}

}


function createchart() {
	lineChart = new Dygraph(document.getElementById("chart"),
							data,
							{
							height: 400,
							width: 950,
							colors: ["rgb(40,220,40)", "rgb(0, 62, 126)"],
							drawPoints: true,
							showRoller: false,
							valueRange: [-20, 110],
							labels: chartLabels
							});

}