$(document).ready(function () {
  // submit settings
  $("#feedback-settings").submit(function(e) {
    e.preventDefault();
    formdata = $(this).serializeArray();
    $.ajax({
      type: 'POST',
      url: '/ajax/settings',
      data: formdata,
      dataType: 'json',
      success: function(data) {
        $.refreshTypes(data.types);
        $.refreshLocations(data.locations);
        // display success message
        $(".alert-success").slideDown();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $.consoleLog(jqXHR);
        $.consoleLog(textStatus);
        $.consoleLog(errorThrown);
      }
    });
  });
});

$.refreshTypes = function(types) {
  t = [];
  $.each(types, function() {
    $.consoleLog(this.title);
    t.push(this.title);
  });
  $("#types").val(t.join("\r\n"));
}

$.refreshLocations = function(locationgroups) {
  l = [];
  $.each(locationgroups, function(group, locations) {
    l.push(":"+group);
    $.each(locations, function(id, location) {
      l.push(location);
    });
  });
  $("#locations").val(l.join("\r\n"));
}