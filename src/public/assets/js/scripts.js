

$.logInUser = function() { 
	// Check to see if there is a cookie for this user
	$.consoleLog("Logging user in.");
	if ($.readCookie("mm_feedback_name") == null) {
		$.consoleLog(" > No cookie, fetching credentials from intranet.");
		// No cookie, time to check login credentials
		$.ajax({
      url: 'http://intranet/_ajax/user/',
      dataType: 'jsonp',
      jsonp: 'callback',
      jsonpCallback: 'user',
		}).done(function(data) {
			// Success, let's have sexy time
			if (data.name != "") {
				// Data returned, user logged in
				$.consoleLog(" > User is logged in.");
				// Save each piece of data to a cookie, store for 1 day
				$.each(data, function(k, v) {
					$.createCookie("mm_feedback_"+k, v, 1);
				});
				 // Perform post-login tasks
				 $.init();
			} else {
				// Oh shiteballs, they're not logged in - no more sexytime. Let's get them to login so we can GET IT OWHHNNN.
				$.consoleLog(" > User is logged out.");
				window.location.href = "http://intranet/account/in/";
				$.eraseCookie();
			}
		}).fail(function(data) {
			// Cocksticks, this is burning.
			$.consoleLog(" > FAILED: Fetching user credentials from intranet.");
			$.showFatalError('Failed to fetch user credentials from intranet.');
			$.eraseCookie("mm_feedback_user");
		});
	} else {
		// Perform post-login tasks
		$.consoleLog(" > Cookie already set.");
		$.init();
	}
};

// Initialise 
$.init = function() { 
	$.consoleLog("Initialising post-login tasks.");
	$.getBuildList();
	$.initPage();
}

// Fatal error 
$.showFatalError = function(msg) { 
	$('.main-content').html('<div class="row-fluid"><div class="span12"><h1>Fatal Error :(</h1></div><p>'+msg+'</p></div>').show();
}

// Get build names from http://builds.medmol.local/builds.json
$.getBuildList = function() { 
	if ($('#build-select').length > 0) {
		$.consoleLog("Fetching latest build list.");
		$.ajax({
			url: 'http://builds.medmol.local/builds.json',
			dataType: 'jsonp',
			jsonp: 'callback',
			jsonpCallback: 'buildlist',
			success: function(data) {
				$.each(data, function() {
					$('#build-select').append($("<option></option>").attr({value: this.name}).text(this.name));
				});
				$.consoleLog("COMPLETE: Build list fetching.");
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$.consoleLog("FAILED: Fetching latest build list.");
				$.consoleLog(jqXHR);
				$.consoleLog(textStatus);
				$.consoleLog(errorThrown);
			}
		});
	}
}

// Page initialising
$.initPage = function() {
	// Update main nav based on admin level
	$('.loggedin').show();
  group_id = $.readCookie("mm_feedback_group_id");
	if(group_id == 1 || group_id == 7 || group_id == 8) {
		$('.adminonly').show();
	}
	// Show logged in elements
	$('.loggedin').show();
	// Update navigation 
  $("#profile-name").html("Signed in as <strong>"+$.readCookie("mm_feedback_screen_name")+"</strong>");
  $("#profile-link").attr("href", "http://intranet/whos_who/profile/"+$.readCookie("mm_feedback_name"));
	$('.mainnavitem a[href="/' + location.pathname.split("/")[1] + '"]').parent().addClass('active');
	// Show content
	$('.main-content').show();
	// Update current page (this should be present on JS for each page)
	if (typeof $.initCurrentPage == 'function') { $.initCurrentPage(); }
}

$.createCookie = function(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

$.readCookie = function(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

$.eraseCookie = function(name) {
	$.createCookie(name,"",-1);
}

$.consoleLog = function(message) {
  if ("console" in window) { console.log(message); }
}

