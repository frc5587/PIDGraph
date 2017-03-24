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
	// sets a function that will be called when any NetworkTables key/value changes
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

				if (i > 120) {
					data.shift();
				}
				if(recording && i % 120 === 0 && i > 0){
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
	//NetworkTables.addKeyListener('velocity', onVelocityChanged, true);
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

	Lockr.set('setPoint', $('#val').val());
	Lockr.set('fGain', $('#fGain').val());
	Lockr.set('pGain', $('#pGain').val());
	Lockr.set('iGain', $('#iGain').val());
	Lockr.set('dGain', $('#dGain').val());
}

function initFromLocalStorage() {
	$('#val').val(Lockr.get('setPoint'));
	$('#fGain').val(Lockr.get('fGain'));
	$('#pGain').val(Lockr.get('pGain'));
	$('#iGain').val(Lockr.get('iGain'));
	$('#dGain').val(Lockr.get('dGain'));
}

function onValueChanged(key, value, isNew) {

	// key thing here: we're using the various NetworkTable keys as
	// the id of the elements that we're appending, for simplicity. However,
	// the key names aren't always valid HTML identifiers, so we use
	// the NetworkTables.keyToId() function to convert them appropriately

	if (isNew) {
		var tr = $('<tr/>').appendTo($('#nt > tbody:last'));
		$('<td/>').text(key).appendTo(tr);
		$('<td></td>').attr('id', NetworkTables.keyToId(key))
					   .text(value)
					   .appendTo(tr);
	} else {

		// similarly, use keySelector to convert the key to a valid jQuery
		// selector. This should work for class names also, not just for ids
		$('#' + NetworkTables.keySelector(key)).text(value);
	}
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
							valueRange: [-10, 100],
							labels: chartLabels
							});

}
