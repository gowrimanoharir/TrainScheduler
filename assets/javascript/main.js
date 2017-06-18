// Initialize Firebase
firebase.initializeApp(config);


// Create a variable to reference the database
var database = firebase.database();
var pgUpdate = null;


var tschedule = {
	trName: null,
	trDest: null,
	trFstTime: null,
	trFreq: null,
	trNextArrival: null,
	trMins: null,

	displaySchedule: function(){
		console.log('in disp db');
		var nrow=$('<tr>');
		nrow.append('<td class=\'col-md-2\'>'+this.trName+'</td>');
		nrow.append('<td class=\'col-md-2\'>'+this.trDest+'</td>');
		nrow.append('<td class=\'col-md-2\'>'+this.trFstTime+'</td>');
		nrow.append('<td class=\'col-md-2\'>'+this.trFreq+'</td>');
		nrow.append('<td class=\'col-md-2\'>'+this.trNextArrival+'</td>');
		nrow.append('<td class=\'col-md-2\'>'+this.trMins+'</td>');
		$('#js-trntbl').append(nrow);

	},

	readDBdata: function(trn){
		console.log('in read db');
		this.trName=trn.TrnName;
		this.trDest=trn.TrnDest;
		this.trFstTime=trn.TrnFirstTime;
		this.trFreq=trn.TrnFrequency;
		this.trMins=this.calcMinutesTillTrn(this.trFstTime, this.trFreq);
		this.trNextArrival=this.calcNextArrival(this.trMins);
		this.displaySchedule();
	},

	calcMinutesTillTrn: function(ftim, freq){
		var firstTime = moment(ftim, "hh:mm").subtract(1, "years");
		var diffTime = moment().diff(firstTime, "minutes")
		var tmReminder = diffTime%freq;
		return(freq-tmReminder);
	},

	calcNextArrival: function(mins){
		var nextTrain = moment().add(mins, "minutes");
		return(moment(nextTrain).format("hh:mm A"));
	},

	resetForm: function(){
		$('#js-tname').val('');
		$('#js-tdest').val('');
		$('#js-ttime').val('');
		$('#js-tfreq').val('');
	}
};

function dispUpdate(){
	clearTimeout(pgUpdate);
	var table = $("table tbody");
    table.find('tr').each(function () {
        var $tds = $(this).find('td');
		var ftim = $tds.eq(2).text();
		var freq = $tds.eq(3).text();
		var mins = ts.calcMinutesTillTrn(ftim, freq);
		$tds.eq(5).text(mins);
		var nextTrain = ts.calcNextArrival(mins);
		$tds.eq(4).text(nextTrain);
    });

	pgUpdate=setTimeout(dispUpdate, 60000);
}

var ts=tschedule;

$(document).ready(function(){

	$('#js-submit').on('click', function(event){

		event.preventDefault();

		ts.trName=$('#js-tname').val().trim();
		ts.trDest=$('#js-tdest').val().trim();
		ts.trFstTime=$('#js-ttime').val().trim();
		ts.trFreq=$('#js-tfreq').val().trim();

		database.ref().push({
			TrnName: ts.trName,
			TrnDest: ts.trDest,
			TrnFirstTime: ts.trFstTime,
			TrnFrequency: ts.trFreq,
		});	

		ts.resetForm();
	});

	database.ref().on("child_added", function(snapshot) {
		if(snapshot.val()){
			var trn=snapshot.val();
			ts.readDBdata(trn);
		}
	});	

	dispUpdate();

});