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

	displaySchedule: function(key){
		console.log('in disp db');
		var nrow=$('<tr>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trName+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trDest+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trFstTime+'</td>');
		nrow.append('<td class=\'col-md-1 td-design\'>'+this.trFreq+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trNextArrival+'</td>');
		nrow.append('<td class=\'col-md-1 td-design\'>'+this.trMins+'</td>');
		var ndet=$('<td>');
		ndet.addClass('col-md-1 td-design glyphicon glyphicon-pencil js-edit').data('data-id', key);;
		nrow.append(ndet);
		var ndet1=$('<td>');
		ndet1.addClass('col-md-1 td-design glyphicon glyphicon-remove js-delete').data('data-id', key);;
		nrow.append(ndet1);
		console.log(ndet1.data('data-id'));
		$('#js-trntbl').append(nrow);

	},

	readDBdata: function(trn, key){
		console.log('in read db');
		this.trName=trn.TrnName;
		this.trDest=trn.TrnDest;
		this.trFstTime=trn.TrnFirstTime;
		this.trFreq=trn.TrnFrequency;
		this.trMins=this.calcMinutesTillTrn(this.trFstTime, this.trFreq);
		this.trNextArrival=this.calcNextArrival(this.trMins);
		this.displaySchedule(key);
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
		$('#js-fttErr').text('');
		$('#js-freqErr').text('');
	},

	firstTimeVal: function(){
		return moment(this.trFstTime, "HH:mm", true).isValid();
	},

	frequencyVal: function(){
		return /^\d+$/.test(this.trFreq);		
	}
};

function dispUpdate(){
	clearTimeout(pgUpdate);
	var table = $("table tbody");
    table.find('tr').each(function () {
        var td = $(this).find('td');
		var ftim = td.eq(2).text();
		var freq = td.eq(3).text();
		var mins = ts.calcMinutesTillTrn(ftim, freq);
		td.eq(5).text(mins);
		var nextTrain = ts.calcNextArrival(mins);
		td.eq(4).text(nextTrain);
    });

	pgUpdate=setTimeout(dispUpdate, 10000);
}

var ts=tschedule;

$(document).ready(function(){

	dispUpdate();

	//jQuery to handle new train entry submission

	$('#js-submit').on('click', function(event){

		event.preventDefault();
		var notBlank=true;
		$('#js-addErr').text(' ');
		$('#js-addtrn').find( 'input' ).each(function () {

	      	if ($(this).val().trim().length === 0)
			{
				$('#js-addErr').text('No Fields can be blank');
				notBlank=false;
			}

		});
		if(notBlank){
			console.log(notBlank);
			$('#js-addErr').text(' ');
			ts.trName=$('#js-tname').val().trim();
			ts.trDest=$('#js-tdest').val().trim();
			ts.trFstTime=$('#js-ttime').val().trim();
			ts.trFreq=parseInt($('#js-tfreq').val().trim());
			if(ts.firstTimeVal() && ts.frequencyVal()){
				database.ref().push({
					TrnName: ts.trName,
					TrnDest: ts.trDest,
					TrnFirstTime: ts.trFstTime,
					TrnFrequency: ts.trFreq,
				});	

				ts.resetForm();
			}
			else{
				$('#js-fttErr').text(' ');
				$('#js-freqErr').text(' ');
				if(!ts.firstTimeVal()){
						console.log('Enter Time in required format');
						$('#js-fttErr').text('Enter Time in required format');
					}
				if(!ts.frequencyVal()){
						console.log('Enter Frequncy in minutes');
						$('#js-freqErr').text('Enter Frequncy in minutes');
					}				
				}
		}
		
	});


	database.ref().on("child_added", function(snapshot) {
		if(snapshot.val()){
			var trn=snapshot.val();
			var key=snapshot.key;
			ts.readDBdata(trn, key);
		}
	});	


	//jQuery to handle delete train entry 

	$('#js-trntbl').on('click', '.js-delete', function(){
		console.log('del: '+$(this).data('data-id'));
		var key=$(this).data('data-id');
		database.ref().child(key).remove();
		$(this).closest('tr').remove();
	});


	//jQuery to handle edit button click for a train entry 

	$('#js-trntbl').on('click', '.js-edit', function(){
		console.log('edit: '+$(this).data('data-id'));
		$(this).removeClass('js-edit glyphicon-pencil');
		$(this).addClass('js-done glyphicon-ok');
		var key=$(this).data('data-id');
		var tr=$(this).closest('tr');
		var td=$(this).closest('tr').find('td');
		td.removeClass('td-design').addClass('td-rmpad');
		var tmp;

		td.eq(4).html('');
		td.eq(5).html('');

		for(i=0;i<4;i++){
				td.eq(i).attr('contenteditable', 'true');
				tmp=td.eq(i).text();
				td.eq(i).html('<input class=\'td-edit\' type=text value='+tmp+'>')
		}

		console.log('edit2: '+$(this).data('data-id'));

	});


	//jQuery to handle done button click for a train entry 

	$('#js-trntbl').on('click', '.js-done', function(){
		console.log('done: '+$(this).data('data-id'));
		
		console.log($(this).data('data-id'));
		var key=$(this).data('data-id');
		var tr=$(this).closest('tr');
		var td=$(this).closest('tr').find('td');
		var tmp, tftt, tfrq;

		ts.trFstTime=td.eq(2).find('input').val();
		ts.trFreq=td.eq(3).find('input').val();

		if(ts.firstTimeVal() && ts.frequencyVal()){
			$('#js-editErr').text(' ');
			$(this).removeClass('js-done glyphicon-ok');
			$(this).addClass('js-edit glyphicon-pencil');

			td.removeClass('td-rmpad').addClass('td-design');

			for(i=0;i<4;i++){
					tmp=td.eq(i).find('input').val();
					td.eq(i).attr('contenteditable', 'false');
					td.eq(i).removeClass('td-edit');
					td.eq(i).html(tmp);
			}

			var updates={
				TrnName: td.eq(0).text(),
				TrnDest: td.eq(1).text(),
				TrnFirstTime: td.eq(2).text(),
				TrnFrequency: td.eq(3).text(),			
			};
			console.log('done2: '+$(this).data('data-id'));
			database.ref().child(key).update(updates);
			dispUpdate();
		}
		else{
			$('#js-editErr').text(' ');
			if(!ts.firstTimeVal()){
					console.log('Enter Time in required format');
					$('#js-editErr').text('Enter Time in required format');
				}
			if(!ts.frequencyVal()){
					var tmp=$('#js-editErr').text();
					console.log('Enter Frequncy in minutes');
					$('#js-editErr').text(tmp+' Enter Frequncy in minutes');
				}				
		}




	});

});