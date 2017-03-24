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
				var kF = parseFloat($('#fGain').val());
				var kP = parseFloat($('#pGain').val());
				var kI = parseFloat($('#iGain').val());
				var kD = parseFloat($('#dGain').val());

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
	NetworkTables.putValue('/arm/fGain', $('#fGain').val());
	NetworkTables.putValue('/arm/pGain', $('#pGain').val());
	NetworkTables.putValue('/arm/iGain', $('#iGain').val());
	NetworkTables.putValue('/arm/dGain', $('#dGain').val());

	localStorage.setItem('setPoint', $('#val').val());
	localStorage.setItem('fGain', $('#fGain').val());
	localStorage.setItem('pGain', $('#pGain').val());
	localStorage.setItem('iGain', $('#iGain').val());
	localStorage.setItem('dGain', $('#dGain').val());
}

function initFromLocalStorage() {
	$('#val').val(localStorage.getItem('setPoint'));
	$('#fGain').val(localStorage.getItem('fGain'));
	$('#pGain').val(localStorage.getItem('pGain'));
	$('#iGain').val(localStorage.getItem('iGain'));
	$('#dGain').val(localStorage.getItem('dGain'));
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