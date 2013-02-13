$(document).ready(function () {
  TableTools.BUTTONS.download = {
    "sAction": "text",
    "sTag": "default",
    "sFieldBoundary": "",
    "sFieldSeperator": "\t",
    "sNewLine": "<br>",
    "sToolTip": "",
    "sButtonClass": "DTTT_button_text",
    "sButtonClassHover": "DTTT_button_text_hover",
    "sButtonText": "Download",
    "mColumns": "all",
    "bHeader": true,
    "bFooter": true,
    "sDiv": "",
    "fnMouseover": null,
    "fnMouseout": null,
    "fnClick": function( nButton, oConfig ) {
      var oParams = this.s.dt.oApi._fnAjaxParameters( this.s.dt );
      var iframe = document.createElement('iframe');
      var build = $('#build-select').attr('value');
      iframe.style.height = "0px";
      iframe.style.width = "0px";
      iframe.src = oConfig.sUrl+build+"?"+$.param(oParams);
      document.body.appendChild( iframe );
    },
    "fnSelect": null,
    "fnComplete": null,
    "fnInit": null
  };

  /*
  Usage options here:
    http://www.datatables.net/usage/options
  Table tools plugin (used for export options) here:
    http://www.datatables.net/extras/tabletools/initialisation
  */
  var oTable = $('#export_table').dataTable({
    "bProcessing": true,
    "bServerSide": true,
    "iDisplayLength": 50,
    "sAjaxSource": "/json/e/all",
    "aaSorting": [[7, "desc"]],
    "oTableTools": {
      "sSwfPath": "./assets/DataTables-1.9.4/extras/TableTools/media/swf/copy_csv_xls_pdf.swf",
      "aButtons": [
        {
          "sExtends": "download",
          "sButtonText": "Save as Excel",
          "sUrl": "/excel/"
        }
      ]
    },
    "sDom": "<'row'<'span12'T><'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>",
    "sPaginationType": "bootstrap",
    "oLanguage": {
      "sLengthMenu": "_MENU_ records per page"
    },
    "bAutoWidth": false
  });

  //refresh datatable on build change
  $('#build-select').change(function() {
    oTable.fnReloadAjax("/json/e/"+$(this).attr('value'));
  });

});

$.extractUrls = function(sValue) {
  var regex = /href=["']([^"]*)["']/g;
  var matches;
  var urls = [];
  while(matches = regex.exec(sValue)) {
    urls.push(matches[1]);
  }
  if(urls.length > 0) {
    return urls.join(", ");
  } else {
    return sValue;
  }
}