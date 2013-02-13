$(document).ready(function () {
  // fine uploader
  $('.fine-uploader').fineUploader({
    request: {
      endpoint: 'ajax/upload'
    },
    text: {
      uploadButton: '<i class="iconic-upload icon-white"></i> Select Files'
    },
    template: '<div class="qq-uploader span12">' +
                '<pre class="qq-upload-drop-area span12"><span>{dragZoneText}</span></pre>' +
                '<div class="qq-upload-button btn btn-success" style="width: auto;">{uploadButtonText}</div>' +
                '<span class="qq-drop-processing"><span>{dropProcessingText}</span><span class="qq-drop-processing-spinner"></span></span>' +
                '<ul class="qq-upload-list" style="margin-top: 10px; text-align: center;"></ul>' +
              '</div>',
    debug: true
  }).on('complete', function(event, id, fileName, responseJSON) {
    if (responseJSON.success) {
      // add hidden input to form for file upload
      $('<input>').attr({type:'hidden', id:'attachments[]', name:'attachments[]', value:responseJSON.fileName}).appendTo("#feedback-form");
    }
  });

  // build selection form updater
  $('#build-select').change(function() {
    // set params
    $("#username").val($.readCookie("mm_feedback_name")); // Set username to cookie value (could do this elsewhere)
    $("#offset").val("0");
    $("#limit").val("50");
    $("#build").val($(this).attr('value'));
    // reset list and get feedback
    $.getFeedback(true);
  });

  submitted = false;

  // location selection error checker 
  $('#location').change(function() {
    $.checkForm();
  });

  // type selection error checker 
  $('#type').change(function() {
    $.checkForm();
  });

  // button click event handler
  $("#btn-submit").bind('click', function() {
    submitted = true;
    if($.checkForm()) {
      $("#feedback-form").submit();
    }
  });

  // more button click event handler
  $("#btn-more").bind('click', function() {
    // update list but don't reset it
    $.getFeedback(false);
  });

  // edit button click event handler
  $(".editbtn").live('click', function() {
    // get values from dom
    item = $(this).parent().parent();
    id = $(item).attr('data-id');
    type = $(item).find(".feedbacktype").html();
    loc = $(item).find(".feedbacklocation").html();
    text = $(item).find(".feedbacktext").html();
    // replace <br/> with /r/n
    text = text.replace(/<br\s*[\/]?>/gi,"\r\n");
    // set form values
    $("#id").val(id);
    $("select#location option:contains("+loc+")").attr('selected', true);
    $("select#type option:contains("+type+")").attr('selected', true);
    $("#text").val(text);
    // remove attachment inputs
    $("#attachments\\[\\]").remove();
  });

  // submit new feedback
  $("#feedback-form").submit(function(e) {
    e.preventDefault();

    formdata = $(this).serializeArray();
    $.ajax({
      type: 'POST',
      url: '/ajax/add',
      data: formdata,
      dataType: 'json',
      success: function(data) {
        // if updating, remove previous one
        id = $("#id").val();
        if(id != "") {
          $(".feedbackitem[data-id=\""+id+"\"]").remove();
        }
        // amend feedback
        $.addToList(data, true);
        // clear form
        $("#id").val("");
        $("#text").val("");
        $("#attachments\\[\\]").remove();
        $('.fine-uploader').fineUploader('reset');
        // display success message
        $(".alert-success").slideDown().slideDown().delay(3000).slideUp();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $.consoleLog(jqXHR);
        $.consoleLog(textStatus);
        $.consoleLog(errorThrown);
      }
    });
  });

});


/* Globally defined functions */

// Page initialising
$.initCurrentPage = function() {
  $('#username').val($.readCookie("mm_feedback_name"));
  $.getFeedback();
}

// get feedback list via ajax
$.getFeedback = function(reset) {
  username = $.readCookie("mm_feedback_name");
  offset = $("#offset").val();
  limit = $("#limit").val();
  build = $("#build").val();
  url = '/json/u/'+username+'/'+build+'/'+offset+'/'+limit;
  $.ajax({
    url: url,
    dataType: 'json',
    success: function(data) {
      if(reset) {
        $.clearList();
      }
      // add items to list
      $.each(data, function() {
        $.addToList(this, false);
      });
      // update offset, show/hide more button
      $("#offset").val(parseInt(offset)+parseInt(limit));
      if(data.length == limit) {
        $("#btn-more").show();
      } else {
        $("#btn-more").hide();
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.consoleLog(jqXHR);
      $.consoleLog(textStatus);
      $.consoleLog(errorThrown);
    }
  });
}


// check form items are valid
$.checkForm = function() {
  valid = true;
  if(!$.checkFormItem($("#location"), $("#errorlocation"))) { valid = false; }
  if(!$.checkFormItem($("#type"), $("#errortype"))) { valid = false; }
  if(!$.checkFormItem($("#text"), $("#errortext"))) { valid = false; }

  if(!valid) {
    // display errors only after initial submission
    if(submitted) {
      $(".alert-error").slideDown();
    }
  } else {
    $(".alert-error").slideUp();
  }

  return valid;
}

// check for blank input values
$.checkFormItem = function(item, erroritem) {
  if($(item).val() === '') {
    erroritem.show();
    return false;
  } else {
    erroritem.hide();
    return true;
  }
}

// remove all items from the list bar the first hidden item used as a template
$.clearList = function() {
  $("#feedbacklist").html($("#feedbacklist").children(":first"));
}

$.addToList = function(data, insert) {
  // get placeholder html
  html = $("#feedbacklist").children(":first").clone();
  $(html).attr('data-id', data.id);
  $(html).find(".feedbacktype").html(data.type);
  $(html).find(".feedbacklocation").html(data.location);
  $(html).find(".feedbackbuild").html(data.build);
  // replace text line breaks with <br/>
  text = data.text.replace(/\r\n/g,"<br/>");
  $(html).find(".feedbacktext").html(text);

  // add attachment thumbs
  $.each(data.attachments, function() {
    // get attachment placeholder html
    attachtml = $(html).find(".attachment:first").clone();
    thumbnailhtml = $(attachtml).children(".thumbnail");
    // get attachment file extension
    ext = $.getFileExtension(this);
    // is it an image?
    if(ext == 'gif' || ext == 'png' || ext == 'jpg' || ext ==  'jpeg') {
      // setup modal display for images
      id = $.getModalId(this);
      $(thumbnailhtml).attr({"href":"#"+id, "rel":"leanModal", "name":id});
      $(thumbnailhtml).html($.getThumbnailImage(data.username, this));
      // lean modal
      $(html).append($.getAttachmentModal(data.username, id, this));
      $(thumbnailhtml).leanModal({top:100, overlay:0.4, closeButton:".modalclose"});
    } else {
      // link to other files
      $(thumbnailhtml).attr("href", "/uploads/"+data.username+"/"+this);
      $(thumbnailhtml).html($.getThumbnailFile());
    }
    // add to the ul
    $(html).find(".thumbnails:first").append(attachtml);
    // display
    attachtml.show();
  });
  
  // insert at the top or append to the end
  if (insert) {
    $("#feedbacklist").children(":first").after(html);
    $(html).slideDown();
  } else {
    $("#feedbacklist").append(html);
    $(html).show();
  }
}

// build a html thumbnail item
$.getThumbnailImage = function(username, filename) {
  return $("<img>").attr("src", "/uploads/"+username+"/thumbs/"+filename);
}

$.getThumbnailFile = function() {
  return $("<i>").attr("class", "iconic-document-alt-stroke");
}

$.getAttachmentModal = function(username, id, filename) {
  div = $("<div>").attr({"id": id, "class": "leanmodalitem", "style": "display:none;"});
  img = $("<img>").attr("src", "/uploads/"+username+"/"+filename);
  span = $("<span>").attr("class", "modalclose");
  return $(div).append(img, span);
}

$.getModalId = function(filename) {
  return filename.split('.').shift().replace(/ /g, "_");
}

$.getFileExtension = function(filename) {
  return filename.split('.').pop().toLowerCase();
}
