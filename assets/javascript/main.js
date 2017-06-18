// Initialize Firebase
var config = {
apiKey: "AIzaSyBKY4W79RYm1ZBBT8ABhd4tJBtH2wa4RDU",
authDomain: "train-scheduler-21ec5.firebaseapp.com",
databaseURL: "https://train-scheduler-21ec5.firebaseio.com",
projectId: "train-scheduler-21ec5",
storageBucket: "train-scheduler-21ec5.appspot.com",
messagingSenderId: "525124097857"
};
firebase.initializeApp(config);


// Create a variable to reference the database
var database = firebase.database();

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
		this.trMins=this.calcMinutesTillTrn();
		this.trNextArrival=this.calcNextArrival();
		this.displaySchedule();
	},

	calcMinutesTillTrn: function(){
		var firstTime = moment(this.trFstTime, "hh:mm").subtract(1, "years");
		var diffTime = moment().diff(firstTime, "minutes")
		var tmReminder = diffTime%this.trFreq;
		return(this.trFreq-tmReminder);
	},

	calcNextArrival: function(){
		var nextTrain = moment().add(this.trMins, "minutes");
		return(moment(nextTrain).format("hh:mm A"));
	},

	resetForm: function(){
		$('#js-tname').val('');
		$('#js-tdest').val('');
		$('#js-ttime').val('');
		$('#js-tfreq').val('');
	}
};

$(document).ready(function(){
	var ts=tschedule;
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
});