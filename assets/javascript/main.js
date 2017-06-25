//Add firebase config info here


// Initialize Firebase
firebase.initializeApp(config);


// Create a variable to reference the database
var database = firebase.database();

//Create a variable to have hold setTimeout used to update next train time details
var pgUpdate = null;

//Object to storeerror message text
var errorMsgs ={
	errFreq: 'Enter Frequency in minutes.',
	errFstTime: 'Enter First Train Time in required format.',
	errBlank: 'Please enter data in blank fields.'
}

//Object to store Train properties and functions
var tschedule = {
	//Variables to hold values displayed in train table at any time
	trName: null,
	trDest: null,
	trFstTime: null,
	trFreq: null,
	trNextArrival: null,
	trMins: null,

	//function to display the data read from the database in the train table
	displaySchedule: function(key){
		//Create a new row and add field values 
		var nrow=$('<tr>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trName+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trDest+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trFstTime+'</td>');
		nrow.append('<td class=\'col-md-1 td-design\'>'+this.trFreq+'</td>');
		nrow.append('<td class=\'col-md-2 td-design\'>'+this.trNextArrival+'</td>');
		nrow.append('<td class=\'col-md-1 td-design\'>'+this.trMins+'</td>');

		//add edit and delete icons along with database key info as data attribute for reference
		var ndet=$('<td>');
		ndet.addClass('col-md-1 td-design glyphicon glyphicon-pencil js-edit').data('data-id', key);;
		nrow.append(ndet);
		var ndet1=$('<td>');
		ndet1.addClass('col-md-1 td-design glyphicon glyphicon-remove js-delete').data('data-id', key);;
		nrow.append(ndet1);

		//add new row to the table
		$('#js-trntbl').append(nrow);

	},

	//function to read from the database object and next train info
	readDBdata: function(trn, key){
		this.trName=trn.TrnName;
		this.trDest=trn.TrnDest;
		this.trFstTime=trn.TrnFirstTime;
		this.trFreq=trn.TrnFrequency;
		this.trMins=this.calcMinutesTillTrn(this.trFstTime, this.trFreq);
		this.trNextArrival=this.calcNextArrival(this.trMins);
		this.displaySchedule(key);
	},

	//function to calculate the minutes till next train
	calcMinutesTillTrn: function(ftim, freq){
		var firstTime = moment(ftim, "hh:mm").subtract(1, "years");
		var diffTime = moment().diff(firstTime, "minutes")
		var tmReminder = diffTime%freq;
		return(freq-tmReminder);
	},

	//function to calculate the time of next train
	calcNextArrival: function(mins){
		var nextTrain = moment().add(mins, "minutes");
		return(moment(nextTrain).format("hh:mm A"));
	},

	//function to reset input boxes in the form after submission
	resetForm: function(){
		$('#js-tname').val('');
		$('#js-tdest').val('');
		$('#js-ttime').val('');
		$('#js-tfreq').val('');
		$('#js-fttErr').text('');
		$('#js-freqErr').text('');
	},

	//function to validate the user inputs on submit
	submitBlanksVal: function(){
			if(!this.firstTimeVal()){
				console.log('Enter Time in required format');
				$('#js-fttErr').text(errorMsgs.errFstTime);
			}
			if(!this.frequencyVal()){
				console.log('Enter Frequncy in minutes');
				$('#js-freqErr').text(errorMsgs.errFreq);
			}
			if(this.trName == '' || this.trDest == '')
			{
				$('#js-addErr').text(errorMsgs.errBlank);
			}
			
	},		

	//function to validate the user inputs on edit
	editBlanksVal: function(){
			var tmp='';
			if(!this.firstTimeVal()){
				tmp=$('#js-editErr').text();
				console.log('Enter Time in required format');
				$('#js-editErr').text(tmp+' '+errorMsgs.errFstTime);
			}
			if(!this.frequencyVal()){
				tmp=$('#js-editErr').text();
				console.log('Enter Frequency in minutes');
				$('#js-editErr').text(tmp+' '+errorMsgs.errFreq);
			}	
			if(this.trName == '' || this.trDest == '')
			{	
				tmp=$('#js-editErr').text();
				$('#js-editErr').text(tmp+' '+errorMsgs.errBlank);
			}
	},

	//function to validate the first train time is in required format
	firstTimeVal: function(){
		return moment(this.trFstTime, "HH:mm", true).isValid();
	},

	//function to validate the frequancy is positive integer > 0
	frequencyVal: function(){
		return (/^\d+$/.test(this.trFreq) && this.trFreq>0);		
	}
};

//function to refresh the display of next train time and minutes remaining every 10 seconds
function dispUpdate(){
	clearTimeout(pgUpdate);
	var table = $("table tbody");
    table.find('tr').each(function () {
        var td = $(this).find('td');
		var ftim = td.eq(2).text();
		var freq = td.eq(3).text();
		var mins = tschedule.calcMinutesTillTrn(ftim, freq);
		if(isNaN(mins)){
			td.eq(5).text(' ');
		}
		else{
			td.eq(5).text(mins);
		}
		var nextTrain = tschedule.calcNextArrival(mins);
		td.eq(4).text(nextTrain);
    });

	pgUpdate=setTimeout(dispUpdate, 10000);
}


$(document).ready(function(){

	//read firebase data base to display data on initial load and everytime a new record is added
	database.ref().on("child_added", function(snapshot) {
		var ts=tschedule;
		if(snapshot.val()){
			var trn=snapshot.val();
			var key=snapshot.key;
			ts.readDBdata(trn, key);
		}
	});	
	
	//call display updated to refresh display of next train info every 10 seconds
	dispUpdate();

	//jQuery to handle new train entry submission

	$('#js-submit').on('click', function(event){

		//prevent form submission, initial train object and clear error text
		event.preventDefault();
		var ts=tschedule;
		$('#js-addErr').text(' ');
		$('#js-fttErr').text(' ');
		$('#js-freqErr').text(' ');

		//assign input values to train object variables
		ts.trName=$('#js-tname').val().trim();
		ts.trDest=$('#js-tdest').val().trim();
		ts.trFstTime=$('#js-ttime').val().trim();
		ts.trFreq=parseInt($('#js-tfreq').val().trim());

		//check if user input passes validation if so then add to the DB
		if(ts.firstTimeVal() && ts.frequencyVal() && ts.trName != '' && ts.trDest !='')
		{
			database.ref().push({
				TrnName: ts.trName,
				TrnDest: ts.trDest,
				TrnFirstTime: ts.trFstTime,
				TrnFrequency: ts.trFreq,
			});	

			//call reset form to clear the input fields
			ts.resetForm();
		}
		else{
			//call submit val function to display error messages when validation fails
			ts.submitBlanksVal();
		}
		
	});



	//jQuery to handle delete train entry 

	$('#js-trntbl').on('click', '.js-delete', function(){
		console.log('del: '+$(this).data('data-id'));
		var key=$(this).data('data-id');
		database.ref().child(key).remove();
		$(this).closest('tr').remove();
	});


	//jQuery to handle edit button click for a train entry to enable user to edit the data inline

	$('#js-trntbl').on('click', '.js-edit', function(){
		var ts=tschedule;

		//Change the edit icon to ok icon
		$(this).removeClass('js-edit glyphicon-pencil').addClass('js-done glyphicon-ok');

		//change column header to save changes so user will know
		$('table th').eq(6).text('Save Changes');

		//identify the table rows and details, change classes as needed
		var key=$(this).data('data-id');
		var tr=$(this).closest('tr');
		var td=$(this).closest('tr').find('td');
		tr.addClass('tr-edit');
		td.removeClass('td-design').addClass('td-rmpad');
		var tmp;

		//loop through the td elements to change it to editable input box
		for(i=0;i<4;i++){
				td.eq(i).attr('contenteditable', 'true');
				tmp=td.eq(i).text();
				td.eq(i).html('<input class=\'td-edit\' type=text value='+tmp+'>')
		}

	});


	//jQuery to handle done button click to save changes for a train entry 

	$('#js-trntbl').on('click', '.js-done', function(){
		var ts=tschedule;
		
		//identify the table rows and details 
		var key=$(this).data('data-id');
		var tr=$(this).closest('tr');
		var td=$(this).closest('tr').find('td');
		var tmp;
		ts.trName=td.eq(0).find('input').val().trim();
		ts.trDest=td.eq(1).find('input').val().trim();
		ts.trFstTime=td.eq(2).find('input').val().trim();
		ts.trFreq=td.eq(3).find('input').val().trim();


		//validate user inputs before accepting changes
		if(ts.firstTimeVal() && ts.frequencyVal() && ts.trName != '' && ts.trDest !=''){
			$('#js-editErr').text(' ');

			//Change the ok icon back to edit icon and column header to edit			
			$(this).removeClass('js-done glyphicon-ok').addClass('js-edit glyphicon-pencil');
			$('table th').eq(6).text('Edit');

			//change classes back as needed
			tr.removeClass('tr-edit');
			td.removeClass('td-rmpad').addClass('td-design');

			//loop through the td elements to change it back to non-editable text display
			for(i=0;i<4;i++){
					tmp=td.eq(i).find('input').val();
					td.eq(i).attr('contenteditable', 'false');
					td.eq(i).removeClass('td-edit');
					td.eq(i).html(tmp);
			}

			//read current field values and update to the database
			var updates={
				TrnName: td.eq(0).text(),
				TrnDest: td.eq(1).text(),
				TrnFirstTime: td.eq(2).text(),
				TrnFrequency: td.eq(3).text(),			
			};
			database.ref().child(key).update(updates);

			//update the display
			dispUpdate();
		}
		else{
			//call edit val function to display error messages when validation fails
			$('#js-editErr').text(' ');
			ts.editBlanksVal();
		}
	});

});