// ---------------------------------------------------------------

jQuery(document).ready(function() {
    jQuery("time.timeago").timeago();
});

setInterval(function () {jQuery("time.timeago").timeago();}, 60000);

var todo = [];

// ---------------------------------------------------------------

function actAnalyze() {
    $('#btnAnalyze').attr('disabled','disabled');
    $('#btnReset').attr('disabled','disabled');
    $('#textLocal').attr('disabled','disabled');
    $("#tblPilots > tbody").html("");


    var local = $('#textLocal').val()
    local = local.replace("\r\n", "\n");
    names = local.split("\n");

    todo = [];
    for (i in names) {
	name = names[i].trim();
	if (name == '') {
	    continue;
	}
	todo.push(name);
    }
    todo = todo.slice(0, 300);
    next();
}


function actReset() {
    $('#textLocal').val('');
    $('#textLocal').removeAttr('disabled');
}

// ---------------------------------------------------------------

function next() {
    if (todo.length == 0) {
	$('#textLocal').val('');
	$('#textLocal').removeAttr('disabled');
	$('#btnReset').removeAttr('disabled');
	$('#btnAnalyze').removeAttr('disabled');
	return;
    }

    update(todo.splice(0,1));
}

function update(name) {
    $.ajax({
	async: true,
	url: "lookup.php?name=" + encodeURIComponent(name),
	mimeType: "application/json",
	dataType: 'json',
	error: function(xhr, status, error) {
	    insert(name, false);
	    next();
	},
	success: function(json) {
	    insert(name, json);
	    next();
	},
    });

}

function insert(name, json) {
    if (json == false) {
	empty = "<tr><td><img src='img/error.png'></img></td><td>" + name + "</td><td colspan='5' class='text-muted'><i>Failed to retrieve details, sorry.</i></td></tr>";
	$('#tblPilots > tbody:last-child').append(empty);
	return;
    }

    row = "";
    row = row + "<tr>";

    row = row + "<td><img src='http://image.eveonline.com/Character/" + json['character_id'] + "_32.jpg' width='20' height='20'></img></td>";

    row = row + "<td><a href='http://evewho.com/pilot/" + encodeURIComponent(json['character_name']) + "'>" + json['character_name'] + "</a></td>";

    time = json['birth']
    time = time.replace(' ', 'T');
    time = time + 'Z';
    diff = (new Date() - new Date(time))/1000;
    if (diff < (60 * 60 * 24 * 30)) {
	row = row + "<td><time class='timeago text-success' datetime='" + time + "'></time></td>";
    } else if (diff < (60 * 60 * 24 * 30 * 3)) {
	row = row + "<td><time class='timeago text-warning' datetime='" + time + "'></time></td>";
    } else {
	row = row + "<td><time class='timeago text-danger' datetime='" + time + "'></time></td>";
    }

    if (json['security_status'] < 0) {
        row = row + "<td class='text-danger'>" + json['security_status'] + "</td>";
    } else {
        row = row + "<td class='text-success'>" + json['security_status'] + "</td>";
    }

    if (json['corporation_history'].length == 0) {
	row = row + "<td class='text-success'>" + json['corporation_history'].length + "</td>";
    } else if (json['corporation_history'].length < 3) {
	row = row + "<td class='text-warning'>" + json['corporation_history'].length + "</td>";
    } else {
	row = row + "<td class='text-danger'>" + json['corporation_history'].length + "</td>";
    }

    row = row + "<td><a href='http://evewho.com/corp/" + encodeURIComponent(json['corporation_name']) + "'>" + json['corporation_name'] + "</a></td>";

    if (json['alliance_id'] == 0) {
	row = row + "<td class='text-muted'><i>None</i></td>";
    } else {
	row = row + "<td><a href='http://evewho.com/alli/" + encodeURIComponent(json['alliance_name']) + "'>" + json['alliance_name'] + "</a></td>";
    }


    row = row + "</tr>";

    $('#tblPilots > tbody:last-child').append(row);

    jQuery("time.timeago").timeago();
}
