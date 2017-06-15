var tschedule = {
	trName: null,
	trDest: null,
	trTime: null,
	trFreq: null,
	trMins: null,

	displaySchedule: function(){
		var nrow=$('<tr>');
		var ndet=$('<td>');
		ndet.addClass('col-md-2');
		nrow.append('<td>'+this.trName+'</td>');
		nrow.append('<td>'+this.trDest+'</td>');
		nrow.append('<td>'+this.trFreq+'</td>');
		nrow.append('<td>'+this.trTime+'</td>');
		$('#js-trntbl').append(nrow);

	}
};

$(document).ready(function(){
	var ts=tschedule;
	$('#js-submit').on('click', function(event){

		event.preventDefault();
		ts.trName=$('#js-tname').val();
		ts.trDest=$('#js-tdest').val();
		ts.trTime=$('#js-ttime').val();
		ts.trFreq=$('#js-tfreq').val();
		ts.displaySchedule();
	});
});