/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var saveBeforeStopUid = function(input) {
    beforeStopUid = input;
};

var redips = {};

$(document).ready(function()
{
    $('#feeditSimple-helpButton').panelslider({
        side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function() {
            //console.log($('.panel-body').html());
            $('.panel-body').load( "/typo3conf/ext/lth_feedit_simple/res/template/help.html #tjo" );
        },
        easingOpen:null,
        easingClose: null 
    });
    
    $('#feeditSimple-editPageButton').panelslider({
        side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function() {
            var url = '';
            var pid = $('body').attr('id');
            if(pid==='new') {
                url = '/typo3/alt_doc.php?edit[pages]['+pid+']=new';
            } else {
                url = '/typo3/alt_doc.php?edit[pages]['+pid+']=edit';
            }
            var formToken, title, subtitle, nav_title = '';

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                complete: function(data) {
                    formToken = $(data.responseText).find('input[name="formToken"]').val();
                    title = $(data.responseText).find('input[name="data[pages]['+pid+'][title]"]').val();
                    subtitle = $(data.responseText).find('input[name="data[pages]['+pid+'][subtitle]"]').val();
                    nav_title = $(data.responseText).find('input[name="data[pages]['+pid+'][nav_title]"]').val();
                    $('.panel-header').append('<input type="hidden" name="formToken" value="' + formToken + '" />');
                    $('.panel-body').load( "/typo3conf/ext/lth_feedit_simple/res/template/formelement.html?sid=" + Math.random() + " #editPage", function() {
                        $('#inputTitle').val(title);
                        $('#inputSubTitle').val(subtitle);
                        $('#inputNavTitle').val(nav_title);
                        $('#close-panel-bt').click(function() {
                            $.panelslider.close();
                        });
                        $('#save-panel-bt').click(function() {
                            savePageProperties();
                        });
                    });
                }
            });
        },
        easingOpen:null,
        easingClose: null 
    });
    
    
    $('#feeditSimple-cutPageButton').click(function() {
        var uid = $('body').attr('id');
        if(feeditSimpleSetCookie('feeditSimple-copycutpage', 'cut:pages:'+uid,1)) {
            var okMessage = {'header' : 'Cut', 'message': 'Page successfully cut'};
            showMessage(okMessage);
        } else {
            showMessage({'header' : '500', 'message': 'no'});
        }
    });
    
    
    $('#feeditSimple-copyPageButton').click(function() {
        var uid = $('body').attr('id');
        if(feeditSimpleSetCookie('feeditSimple-copycutpage', 'copy:pages:'+uid,1)) {
            var okMessage = {'header' : 'Copy', 'message': 'Page successfully copied'};
            showMessage(okMessage);
        } else {
            showMessage({'header' : '500', 'message': 'no'});
        }
    });
    
    
    $('#feeditSimple-pastePageButton').click(function() {
        if(confirm('Are you sure?')) {
            var cookieContent = feeditSimpleGetCookie('feeditSimple-copycutpage');
            if(cookieContent) {
                var okMessage = {'header' : 'Paste', 'message': 'Page successfully pasted'};
                ajaxCall('pastePage', '', cookieContent, '', $('body').attr('id'), okMessage);
            }
        }
    });
    
    
    $('#feeditSimple-deletePageButton').click(function() {
        if(confirm('Are you sure?')) {
            var okMessage = {'header' : 'Paste', 'message': 'Page successfully pasted'};
            ajaxCall('deletePage', '', '', '', $('body').attr('id'), okMessage);
        }
    });
    
     
    $('#feeditSimple-showPageButton').click(function() {
        var okMessage = {'header' : 'Show', 'message': 'Page successfully show'};
        ajaxCall('showPage', '', '', '', $('body').attr('id'), okMessage);
    });
    
    $('#feeditSimple-hidePageButton').click(function() {
        var okMessage = {'header' : 'Paste', 'message': 'Page successfully hidden'};
        ajaxCall('hidePage', '', '', '', $('body').attr('id'), okMessage);
    });
    
    $('#feeditSimple-showPageInMenuButton').click(function() {
        var okMessage = {'header' : 'Paste', 'message': 'Page successfully show in menu'};
        ajaxCall('showPageInMenu', '', '', '', $('body').attr('id'), okMessage);
    });
    
    $('#feeditSimple-hidePageInMenuButton').click(function() {
        var okMessage = {'header' : 'Paste', 'message': 'Page successfully hide in menu'};
        ajaxCall('hidePageInMenu', '', '', '', $('body').attr('id'), okMessage);
    });
    
        ///////////////
    $('#feeditSimple-toggleHiddenElement').click(function() {
        var okMessage = {'header' : 'Show/Hide', 'message': 'Display hidden elements successfully changed'};
        toggleHiddenObject('.hidden-1', 'hiddenElement', okMessage);
    });
    
    $('#feeditSimple-toggleHiddenInMenu').click(function() {
        var okMessage = {'header' : 'Show/Hide', 'message': 'Display hidden in menu successfully changed'};
        toggleHiddenObject('.feeditSimple-hiddenInMenu-1', 'hiddenInMenu', okMessage)
    });
    
    $('#feeditSimple-toggleHiddenPage').click(function() {
        var okMessage = {'header' : 'Show/Hide', 'message': 'Display hidden pages successfully Changed'};
        toggleHiddenObject('.feeditSimple-hiddenPage-1', 'hiddenPage', okMessage);
    });
    ////////////////////////

    //Hide new content elements row on blur
    $("html").mouseup(function(e)
    {
        var subject = $("#feEditSimple-secondRow");
        if(e.target.id != subject.attr('id') && !subject.has(e.target).length)
        {
            subject.fadeOut();
        }
    });
    //console.log($('#feEditSimple-normalColWrapper').is(':empty'));
    //
    //
    //add empty div if no content
    if($('#feEditSimple-normalColWrapper').is(':empty')) {
        $('#feEditSimple-normalColWrapper').html('<div class="feEditSimple-empty">Empty</div>');
    }
    
    
    //make it possible to make content-elements change place
    $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable({
        connectWith: '.connectedSortable',
        placeholder: 'ui-state-highlight',
        cursor: 'move',
        update: function( event, ui ) {
            if(ui.item.attr('class').indexOf('feEditSimple-contentTypeItem') < 0) {

                var pid = '';
                var pageUid = 0;
                if(!ui.item.context.previousSibling) {
                    // Sorting number is in the top
                    pid = $('body').attr('id').toString(); //pid=6
                    pageUid = pid;
                } else {
                    // Sorting number is inside the list
                    pid = '-'+ui.item.context.previousSibling.id.toString(); //pid = -63
                    pageUid = $('body').attr('id');
                }

                var table = 'tt_content';
                var uid = ui.item.context.id;
                var okMessage = {'header' : 'Move', 'message': 'Content element successfully moved'};
                ajaxCall('moveContent', table, uid, pid, pageUid, okMessage);
            };
        }
    }).disableSelection();
    
    //make it possible to drop new content element
    $('#feEditSimple-contentTypeToolbar > a').draggable({
        helper:'clone',
        connectToSortable:'#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper',
       
        stop: function( e, ui ) {
            
            var templateArray = getContentTemplate(ui.helper.context.rel);
            
            var newUid = templateArray[0];
            var template = templateArray[1];
            var CType = getCtype(ui.helper.context.rel);
            var okMessage = {'header' : 'Move', 'message': 'Content element successfully created'};
            $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').find('.ui-draggable').replaceWith(template);
            makeEditable('#'+newUid+' .lth_feeditsimple_content', CType, okMessage);
            $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable('refresh');
            if(okMessage) {
                showMessage(okMessage);
            }
       }
    });
    
    //make it possible to change place of images
    $('.csc-textpic-imagewrap').sortable({
        connectWith: '.csc-textpic-imagerow',
        placeholder: 'ui-state-highlight',
        cursor: 'move',
        update: function( event, ui ) {
            var okMessage = {'header' : 'Move', 'message': 'Image successfully moved'};
            var idList= new Array();
            $(ui.item.closest('.csc-default')).find('.csc-textpic-image img').each(function(){
                idList.push($(this).attr('id'));
            });
            ajaxCall('moveImage', '', idList.join('_'), '', $('body').attr('id'), okMessage);
        },
        stop: function( event, ui ) {
            /*if(ui.item.attr('class').indexOf('feEditSimple-contentTypeItem') < 0) {

                var pid = '';
                var pageUid = 0;
                if(!ui.item.context.previousSibling) {
                    // Sorting number is in the top
                    pid = $('body').attr('id').toString(); //pid=6
                    pageUid = pid;
                } else {
                    // Sorting number is inside the list
                    pid = '-'+ui.item.context.previousSibling.id.toString(); //pid = -63
                    pageUid = $('body').attr('id');
                }

                var table = 'tt_content';
                var uid = ui.item.context.id;
                var okMessage = {'header' : 'Move', 'message': 'Content element successfully moved'};
                ajaxCall('moveContent', table, uid, pid, pageUid, okMessage);
            };*/
        }
    }).disableSelection();
    
    var okMessage = {'header' : 'Save', 'message': 'Content element successfully updated'};
    
    /*make text elements editable
    $('.csc-default').dblclick(function(e, ui){
        //console.log('dblclick');
        e.stopPropagation();
        $(this).find('.lth_feeditsimple_content').editable('toggle');
    });*/
    
    makeEditable('.lth_feeditsimple_content', 'text', okMessage);
        
    //make image elements editable
    makeEditable('.csc-textpic-image', 'image', okMessage);
    

    $('.feeditSimple-tableWrapper').dblclick(function(e,ui){
        //e.stopPropagation();
        $(this).prepend('<div></div>');
        var tbl = $(this).find('table');
        $(tbl).before('<table id="toolbox"><tbody>' +
                '<tr>' +
                    '<td>' +
                            '<input type="button" value="Merge" class="button" onclick="redips.merge()" title="Merge marked table cells horizontally and verically"/>' +
                    '</td>' +
                    '<td>' +
                            '<input type="button" value="Split H" class="button" onclick="redips.split(\'h\')" title="Split marked table cell horizontally"/>' +
                            '<input type="button" value="Split V" class="button" onclick="redips.split(\'v\')" title="Split marked table cell vertically"/>' +
                    '</td>' +
                    '<td>' +
                            '<input type="button" value="Row +" class="button" onclick="redips.row(\'insert\')" title="Add table row"/>' +
                            '<input type="button" value="Row -" class="button" onclick="redips.row(\'delete\')" title="Delete table row"/>' +
                    '</td>' +
                    '<td>' +
                            '<input type="button" value="Col +" class="button" onclick="redips.column(\'insert\')" title="Add table column"/>' +
                            '<input type="button" value="Col -" class="button" onclick="redips.column(\'delete\')" title="Delete table column"/>' +
                    '</td>' +
                '</tr>' +
            '</tbody>' +
        '</table>');
                
               // REDIPS.table initialization
        //redips.init = function () {
            //console.log('init');
                // define reference to the REDIPS.table object
                var rt = REDIPS.table;
                // activate onmousedown event listener on cells within table with id="feeditSimple-table"
                rt.onmousedown('feeditSimple-table', true);
                // show cellIndex (it is nice for debugging)
                //rt.cell_index(true);
                // define background color for marked cell
                rt.color.cell = '#9BB3DA';
        //};
        appendColumn('feeditSimple-table');
        appendRow('feeditSimple-table');


        // function merges table cells
        redips.merge = function () {
            // first merge cells horizontally and leave cells marked
            REDIPS.table.merge('h', false);
            // and then merge cells vertically and clear cells (second parameter is true by default)
            REDIPS.table.merge('v');
        };


        // function splits table cells if colspan/rowspan is greater then 1
        // mode is 'h' or 'v' (cells should be marked before)
        redips.split = function (mode) {
            REDIPS.table.split(mode);
        };


        // insert/delete table row
        redips.row = function (type) {
            REDIPS.table.row('feeditSimple-table', type);
        };


        // insert/delete table column
        redips.column = function (type) {
                REDIPS.table.column('feeditSimple-table', type);
        };

        $(this).unbind( "dblclick" );
        //makte tables editable
    

        makeEditable('.feeditSimple-table td', 'table', okMessage);
    
    });

    
    //enable bootstrap-contextmenu
    enableBootstrapContextMenu(true);
        
    $('.feeditSimple-mainMenu a').click( function (e) {
        var cmd = $(this).attr('id');
        var pageUid = $('body').attr('id');
        //console.log($(this).attr('id'));
        switch(cmd) {
            case 'feeditSimple-formHandler':
                ajaxCall('getFormHandler', '', '', '', pageUid);
                break;
        }
    });
    /*
     * 
     * @type {String|@exp;c@call;substring}
     * before: function (e, element, target) {
      e.preventDefault();
      if (e.target.tagName == 'SPAN') {
          e.preventDefault();
          this.closemenu();
          return false;
      }
      return true;
  }
     */
    
    //hide och show hidden content elements at startup
    var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');
    //console.log(displayString);
    if(displayString) {
        var displayObject = JSON.parse(unescape(displayString));
        if(displayObject['hiddenElement'] === 'none') {
            $('.lth_feeditsimple_content.hidden-1').closest('.csc-default').css('display', 'none');
        } else {
            $('.lth_feeditsimple_content.hidden-1').closest('.csc-default').css('opacity', '0.5');
            $('.lth_feeditsimple_content.hidden-1').closest('.csc-default').css('-ms-filter', 'alpha(opacity=50)');
        }
        if(displayObject['hiddenInMenu'] === 'none') {
            $('.feeditSimple-hiddenInMenu-1').hide();
        } else {
            $('.feeditSimple-hiddenInMenu-1 a').append('<span class="icon-white-eye-close"></span>');
        }
        if(displayObject['hiddenPage'] === 'none') {
            $('.feeditSimple-hiddenPage-1').hide();
        } else {
            $('.feeditSimple-hiddenPage-1 a').append('<span class="icon-white-ban-circle"></span>');
        }
        
    }
    
    /*$(".csc-default").hover(function(e) { 
        $(this).css("background-color",e.type === "mouseenter"?"yellow":"transparent");
    });*/

    //document ready ends**************************************************************************************************
});


/***************************************************************************************************************************
************************************************************HELP FUNCTIONS**************************************************
****************************************************************************************************************************/

function enableBootstrapContextMenu()
{
    $('.csc-default').contextmenu({
        target:'#context-menu', 
        before: function(e,context) {
            return true;
        },
        onItem: function(context,e) {
            feeditSimpleContentCommand(context, e);// execute on menu item selection
            e.stopPropagation();
            this.closemenu(e);
        }
    });
}


function disableBootstrapContextMenu()
{
    $('.csc-default').attr("disabled", true);
}
    
    
// append row to the HTML table
function appendRow(tableId)
{
    var tbl = document.getElementById(tableId), // table reference
        row = tbl.insertRow(0),      // append table row
        i;
    // insert table cells to the new row
    for (i = 0; i < tbl.rows[1].cells.length; i++) {
        //createCell(row.insertCell(i), i, 'row');
        cell = row.insertCell(i);
        cell.innerHTML = '<a href="javascript:" class="feeditSimple-markColumn"><span class="icon-arrow-down"></span></a>';
    }
    var rt = REDIPS.table;
    $('.feeditSimple-markColumn').click(function() {
        $('#'+tableId+' td, th').each(function(){
            rt.mark(false,this);
        });
        var index = $(this).parent().index();
        for (i = 2; i < tbl.rows.length; i++) {
            rt.mark(true, tbl, i, index);
        }
    });
}


// append column to the HTML table
function appendColumn(tableId)
{
    var tbl = document.getElementById(tableId), // table reference
        i;
    // open loop for each row and append cell
    for (i = 0; i < tbl.rows.length; i++) {
        //createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), i, 'col');
        cell = tbl.rows[i].insertCell(0);
        cell.innerHTML = '<a href="javascript:" class="feeditSimple-markRow"><span class="icon-arrow-right"></span></a>';
    }
    var rt = REDIPS.table;
    $('.feeditSimple-markRow').click(function() {
        $('#'+tableId+' td, th').each(function(){
            rt.mark(false,this);
        });
        //console.log($(this).parent().parent().index());
        var index = $(this).parent().parent().index() + 2;

        for (i = 0; i < tbl.rows[0].cells.length; i++) {
            rt.mark(true, tbl, index, i);
        }
    });
}


function convertFileadmin(fPath)
{
    //console.log(fPath);
    if(fPath) {
        var fPathArray = fPath.split('/fileadmin');
        fPath = '/fileadmin' + fPathArray[1];
        return fPath.replace('//','/');
    }

}
            

function feeditSimpleContentCommand(context, e)
{
    var cmd = $(e.target).text();
    var uid = context.attr('id').replace('c','');
    var pageUid = $('body').attr('id');
    
    switch(cmd) {
        case 'Edit':
            //console.log
            $(context).find('.lth_feeditsimple_content').editable('toggle');
            break;
        case 'Delete':
            //console.log(context);
            if(confirm('Are you sure?')) {
                var okMessage = {'header' : 'Delete', 'message': 'Content element successfully deleted'};
                $(context).remove();
                ajaxCall('deleteContent', 'tt_content', uid, '', '', okMessage);
            } else {
                return false;
            }
            break;
        case 'Cut':
            if(feeditSimpleSetCookie('feeditSimple-copycutitem', 'cut:tt_content:'+uid,1)) {
                var content = $(context).html();
                $(context).remove();
                var okMessage = {'header' : 'Cut', 'message': 'Content element successfully cut'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        case 'Copy':
            if(feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:tt_content:'+uid,1)) {
                var content = $(context).html();
                var okMessage = {'header' : 'Copy', 'message': 'Content element successfully copied'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        case 'Paste':
            var pasteContent = feeditSimpleGetCookie('feeditSimple-copycutitem');
            if(pasteContent) {
                var okMessage = {'header' : 'Paste', 'message': 'Content element successfully pasted'};
                ajaxCall('pasteContent', 'tt_content', pasteContent, uid, pageUid, okMessage);
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        case 'Hide':
            var okMessage = {'header' : 'Hide', 'message': 'Content element successfully hidden'};
            ajaxCall('hideContent', 'tt_content', uid, '', '', okMessage);
            break;
        case 'Show':
            var okMessage = {'header' : 'Show', 'message': 'Content element successfully displayed'};
            ajaxCall('showContent', 'tt_content', uid, '', '', okMessage);
            break;
        case 'Above, center':
        case 'Above, left':
        case 'Above, right':
        case 'Below, center':
        case 'Below, right':
        case 'Below, left':
        case 'In text, right':
        case 'In text, left':
        case 'Beside Text, Right':
        case 'Beside Text, Left':
            var imageOrientationId = e.target.className.split('-').pop();
            //console.log(imageOrientationId);
            //console.log(cmd.toLowerCase().replace(',','').replace(' ', '-'));
            var okMessage = {'header' : 'Image', 'message': 'Image orientation successfully updated'};
            changeImageOrientation(cmd.toLowerCase().replace(', ','-').replace(' ', '-'), uid, imageOrientationId, okMessage);
            break;
        case 'Insert image':
            var okMessage = {'header' : 'Image', 'message': 'Image successfully inserted'};
            insertImage(uid, okMessage);
            break;
        default:
            //default code block
    }
    $('#context-menu').hide();
}

function cute(imgId)
{
    $.ajax({
        type : "POST",
        url : 'index.php',
        data: {
            eID : 'lth_feedit_simple',
            cmd : 'getFiles',
            sid : Math.random(),
        },
        dataType: "json",
        error: function() {
            console.log('error');
        },
        success: function(data) {
            //console.log(data);
            var filemanager = $('body',$('.fancybox-iframe').contents()).find('.filemanager');
            var breadcrumbs = $('body',$('.fancybox-iframe').contents()).find('.breadcrumbs');
            var fileList = filemanager.find('.data');
            var breadcrumbsUrls = [];
            
            //Add close fancybox
            $(filemanager).find('.close').click(function() {
                $.fancybox.close();
            });

            // Hiding and showing the search box
            filemanager.find('.search').click(function(){
                var search = $(this);
                search.find('span').hide();
                search.find('input[type=search]').show().focus();
            });
            
            // Hiding and showing upload
            filemanager.find('.upload-icon').click(function() {
                filemanager.find('.uploads').toggle();
            });
            
            //handle fileuplad
            // Initialize the jQuery File Upload widget:
            
            filemanager.find('#fileupload').fileupload({
                // Uncomment the following to send cross-domain cookies:
                //xhrFields: {withCredentials: true},
                //url: 'typo3conf/ext/lth_feedit_simple/vendor/jqueryfileupload/server/php/'
                //url: 'index.php?eID=lth_feedit_simple&cmd=fileupload&path=' + getPath(breadcrumbs) + '&sid=' + Math.random()
            });

            // Enable iframe cross-domain access via redirect option:
            filemanager.find('#fileupload').fileupload(
                'option',
                'redirect',
                window.location.href.replace(
                    /\/[^\/]*$/,
                    'typo3conf/ext/lth_feedit_simple/vendor/jqueryfileupload/js/cors/result.html?%s'
                )
            );

            // Load existing files:
            filemanager.find('#fileupload').addClass('fileupload-processing');

            /*$.ajax({
                // Uncomment the following to send cross-domain cookies:
                //xhrFields: {withCredentials: true},
                url: $(filemanager).find('#fileupload').fileupload('option', 'url'),
                dataType: 'json',
                context: filemanager.find('#fileupload')[0]
            }).always(function () {
                $(this).removeClass('fileupload-processing');
            }).done(function (result) {
                //console.log(result);
                $(this).fileupload('option', 'done')
                    .call(this, $.Event('done'), {result: result});
            });*/
    
            filemanager.find('#fileupload').bind('fileuploaddone', function (e, results) {
                results.result.files.forEach(function(d) {
                    //console.log(d.name + d.url + d.size);
                    var dArray = d.url.split('/');
                    dArray.pop();
                    var thePath = data.root + dArray.join('/') + '/';
                    thePath = thePath.replace('//', '/');
                    //console.log(thePath.replace('//', '/'));
                    var resArray = $.grep(data.items, function(n, i) {
                        if(n.path === thePath) {
                            n.items.push({'name':d.name, 'path':data.root + d.url, 'size': d.size, 'type': 'file'});
                            //return n.path === thePath.replace('//', '/');
                        }
                    });
                    
                    var file = $('<li class="files">' +
                        '<a href="#" title="' + d.url + '" class="files">' +
                        '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: ' +
                        'center center;background-size: cover; background-repeat:no-repeat;background-image: url(' + d.url + ');"></div>' +
                        '<span class="name">' + d.name + '</span>' +
                        '<span class="details">' + d.size + '</span></a></li>');
                
                    file.appendTo(fileList);
                    addClickToFile(file);
                });
            });
            
            // Listening for keyboard input on the search field.
		// We are using the "input" event which detects cut and paste
		// in addition to keyboard input.
            filemanager.find('input[type=search]').on('input', function(e) {
                folders = [];
                files = [];
                var value = this.value.trim();
                if(value.length) {
                    filemanager.addClass('searching');
                    // Update the hash on every key stroke
                    //window.location.hash = 'search=' + value.trim();
                } else {
                    filemanager.removeClass('searching');
                    //window.location.hash = encodeURIComponent(currentPath);
                }
            }).on('keyup', function(e){
                // Clicking 'ESC' button triggers focusout and cancels the search
                var search = $(this);
                if(e.keyCode == 27) {
                    search.trigger('focusout');
                }
            }).focusout(function(e){
                // Cancel the search
                var search = $(this);
                if(!search.val().trim().length) {
                    //window.location.hash = encodeURIComponent(currentPath);
                    search.hide();
                    search.parent().find('span').show();
                }
            });
            
            fileList.on('click', 'li.folders', function(e){
                e.preventDefault();

                var nextDir = $(this).find('a.folders').attr('href');

                if(filemanager.hasClass('searching')) {
                    // Building the breadcrumbs
                    breadcrumbsUrls = generateBreadcrumbs(nextDir);

                    filemanager.removeClass('searching');
                    filemanager.find('input[type=search]').val('').hide();
                    filemanager.find('span').show();
                } else {
                    breadcrumbsUrls.push(nextDir);
                }

                //window.location.hash = encodeURIComponent(nextDir);
                currentPath = nextDir;
            });

            // Clicking on breadcrumbs
            breadcrumbs.on('click', 'a', function(e){
                e.preventDefault();
                var index = breadcrumbs.find('a').index($(this)),
                        nextDir = breadcrumbsUrls[index];
                breadcrumbsUrls.length = Number(index);

                //window.location.hash = encodeURIComponent(nextDir);

            });
            
            //$(window).on('hashchange', function(){

            goto('');

                // We are triggering the event. This will execute 
                // this function on page load, so that we show the correct folder:

            //}).trigger('hashchange');
                
            breadcrumbsUrls.push(data.path);
            //render([data], filemanager, fileList, breadcrumbs, breadcrumbsUrls);
            
            // Navigates to the given path
            function goto(nextDir)
            {
                
                var currentPath = '';

                var rendered = '';

                // if hash has search in it
                if (nextDir === 'search') {
                    filemanager.addClass('searching');
                    rendered = searchData(data, nextDir.toLowerCase());
                    if (rendered.length) {
                        currentPath = nextDir;
                        render(rendered);
                    } else {
                        render(rendered);
                    }
                } else if (nextDir != '' && nextDir != '/fileadmin') {
                    
                    filemanager.find('.upload-icon').show();
                    // if hash is some path
                    // Empty the old result and make the new one
                    fileList.html('');
                    rendered = searchByPath(nextDir,'next');
                    if (rendered.length) {
                        //currentPath = nextDir;
                        breadcrumbsUrls = generateBreadcrumbs(nextDir);
                        render(rendered);
                    } /*else {
                        currentPath = nextDir;
                        breadcrumbsUrls = generateBreadcrumbs(nextDir);
                        render(rendered);
                    }*/
                    //console.log($(filemanager).find('#fileupload').attr('action'));
                    $(filemanager).find('#fileupload').attr('action', '/index.php?eID=lth_feedit_simple&cmd=fileupload&path=' + getPath(breadcrumbs) + '&sid=' + Math.random());
                } else {
                    // if there is no nextDir
                    //console.log(data.path);
                    filemanager.find('.upload-icon').hide();
                    fileList.html('');
                    breadcrumbsUrls = generateBreadcrumbs('/fileadmin');
                    rendered = searchByPath(data.path, '');
                    for(var i=0;i<rendered.length;i++){
                        render([rendered[i]]);
                    }
                    //currentPath = convertFileadmin(data.path);
                    //breadcrumbsUrls.push(currentPath);
                }
            }

            // Splits a file path and turns it into clickable breadcrumbs
            function generateBreadcrumbs(nextDir)
            {
                var path = nextDir.split('/').slice(0);
                for(var i=1;i<path.length;i++){
                        path[i] = path[i-1]+ '/' +path[i];
                }
                return path;
            }

            // Locates a file by path
            function searchByPath(dir, type)
            {
                //console.log(dir + ';' + type);
                var path = dir.split('/'),
                    demo = [data],
                    flag = 0;

                if(type === 'next') {
                    demo = demo[0].items;
                }
                
                
                for(var i=0;i<path.length;i++) {
                    if(demo) {
                        for(var j=0;j<demo.length;j++) {
                            if(demo[j].name === path[i]) {
                                flag = 1;
                                demo = demo[j].items;
                                break;
                            }
                        }
                    }
                }
                
                demo = flag ? demo : [];
                return demo;
            }

            // Recursively search through the file tree
            function searchData(data, searchTerms)
            {
                data.forEach(function(d){
                    if(d.type === 'folder') {

                        searchData(d.items,searchTerms);

                        if(d.name.toLowerCase().match(searchTerms)) {
                                folders.push(d);
                        }
                    } else if(d.type === 'file') {
                        if(d.name.toLowerCase().match(searchTerms)) {
                                files.push(d);
                        }
                    }
                });
                return {folders: folders, files: files};
            }


            // Render the HTML for the file manager
            function render(data)
            {
                var scannedFolders = [],
                    scannedFiles = [],
                    fPath = '';

                if(Array.isArray(data)) {
                    
                    data.forEach(function (d) {
                        if (d.type === 'folder') {
                            scannedFolders.push(d);
                        }
                        else if (d.type === 'file') {
                            scannedFiles.push(d);
                        }
                    });
                } else if(typeof data === 'object') {
                    scannedFolders = data.folders;
                    scannedFiles = data.files;
                }

                if(!scannedFolders.length && !scannedFiles.length) {
                    filemanager.find('.nothingfound').show();
                } else {
                    filemanager.find('.nothingfound').hide();
                }

                if(scannedFolders.length) {
                    scannedFolders.forEach(function(f) {
                        var itemsLength = f.items.length,
                            name = escapeHTML(f.name),
                            icon = '<span class="icon folder"></span>';

                        if(itemsLength) {
                            icon = '<span class="icon folder full"></span>';
                        }
                        if(itemsLength == 1) {
                            itemsLength += ' item';
                        } else if(itemsLength > 1) {
                            itemsLength += ' items';
                        } else {
                            itemsLength = 'Empty';
                        }
                        fPath = convertFileadmin(f.path);
                        var folder = $('<li class="folders"><a href="#" title="'+ fPath + '">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');

                        folder.appendTo(fileList);
                    });

                    $(fileList).find('.folders a').click(function() {
                        goto($(this).attr('title'));
                    });
                }

                if(scannedFiles.length) {
                    scannedFiles.forEach(function(f) {
                        var fileSize = bytesToSize(f.size),
                                name = escapeHTML(f.name),
                                fileType = name.split('.'),
                                icon = '<span class="icon file"></span>';

                        fileType = fileType[fileType.length-1];

                        if (fileType == "jpg") {
                                icon = '<div style="display:inline-block;margin:20px 30px 0px 25px;border-radius:8px;width:60px;height:70px;background-position: center center;background-size: cover; background-repeat:no-repeat;background-image: url(' + convertFileadmin(f.path) + ');"></div>';
                        } else {
                                icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';
                        }
                        //icon = '<span class="icon file f-'+fileType+'">.'+fileType+'</span>';
                        var file = $('<li class="files"><a href="#" title="'+ convertFileadmin(f.path) + '" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
                        file.appendTo(fileList);

                        addClickToFile(file, imgId);
                    });

                }

                // Generate the breadcrumbs
                var url = '';
                if(filemanager.hasClass('searching')){
                    url = '<span>Search results: </span>';
                    fileList.removeClass('animated');
                } else {
                    fileList.addClass('animated');
                    breadcrumbsUrls.forEach(function (u, i) {
                        var name = u.split('/');
                        if (i !== breadcrumbsUrls.length - 1) {
                            url += '<a href="#" title="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> <span class="arrow">|</span> ';
                        } else {
                            url += '<span class="folderName">' + name[name.length-1] + '</span>';
                        }
                    });
                }
                breadcrumbs.text('').append(url);
                $(breadcrumbs).find('a').click(function() {
                    goto($(this).attr('title'));
                });
                //console.log('802');
                // Show the generated elements
                fileList.animate({'display':'inline-block'});
            }


            // This function escapes special html characters in names
            function escapeHTML(text)
            {
                return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
            }

            // Convert file sizes from bytes to human readable units
            function bytesToSize(bytes)
            {
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0) return '0 Bytes';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
            }
        },
    });
}


function addClickToFile(file, imgId)
{
    $(file).find('a').click(function(event) {
        //console.log($("#"+imgId).attr('src'));
        ajaxCall('getImgId', '', imgId, '', '', '', $(this).attr('title').replace('/fileadmin', '').replace('//', '/'));
    });
}


function toggleItem(selector,eType)
{
    $(selector).toggle();
}


function newContent()
{
    $('.feEditSimple-secondRow').fadeIn();
}


//extract cType
function getCtype(rel)
{
    var CType = rel.split('&').shift().toString().split('=').pop().toString();
    return CType;
}


//get template for new content element
function getContentTemplate(rel)
{
    //array={key1: 'value1',key2:'value2'};
    var noOfNewIds = $('#feeditSimple-new').length;
    var templateArray = {'textpic': '<div id="feeditSimple-new-' + noOfNewIds + '" class="csc-default">' +
        //'<div id="lth_feeditsimple_img_NEW" data-pk="img_NEW" class="lth_feeditsimple_img">' +
        '<div class="csc-textpic-text">' +
        '<div id="lth_feeditsimple_NEW" data-type="wysihtml5" data-pk="NEW" class="lth_feeditsimple_content">' +
        //'<p class="feEditSimple-empty">Empty</p>' +
        '</div>' +
        '</div>' +
        //'</div>' +
        '<input type="hidden" name="CType" value="textpic" />' +
        '</div>'
    };
    /*
     * 
     * @type {@exp;rel@call;split@call;shift@call;toString@call;split@call;pop@call;toString}
     * <div id="c59" class="csc-default"><div id="lth_feeditsimple_img_59" data-type="address" data-pk="img_59" class="lth_feeditsimple_img"><div class="csc-textpic-text"><div id="lth_feeditsimple_59" data-type="wysihtml5" data-pk="59" class="lth_feeditsimple_content editable editable-click"><p>yada</p></div></div></div></div>
     */
    var CType = getCtype(rel);
    if(CType) {
        return Array('feeditSimple-new-' + noOfNewIds, templateArray[CType]);
    } else {
        return false;
    }
}


var imgSrc = '';
//params for editable
function makeEditable(selector, type, okMessage)
{
    var myCustomTemplates = {
        emphasis : function(locale) {
            return "<li><div class=\"btn-group\">" +
            "<a class=\"btn feeditSimple-h2\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"h2\" title=\"H2\" tabindex=\"-1\" unselectable=\"on\">H2</a>" +
            "<a class=\"btn feeditSimple-formatCode\" data-wysihtml5-command=\"formatCode\" data-wysihtml5-command-value=\"code\" title=\"Code\" tabindex=\"-1\" unselectable=\"on\">C</a>" +
            "<a class=\"btn\" data-wysihtml5-command=\"bold\" title=\"CTRL+B\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\">B</a>" +
            "<a class=\"btn\" data-wysihtml5-command=\"italic\" title=\"CTRL+I\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\">I</a>" +
            "</div>" +
            "</li>";
        }/*,
        image : function(locale) {
            return "<li>" +
            "<a class=\"btn feeditSimple-insertImage\" data-wysihtml5-command=\"insertImage\" title=\"Insert image\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\"><i class=\"icon-picture\"></i></a>" +
            "</li>";
        }*/
        
    };

    if(type==='text' || type==='textpic') {
        //console.log(type+selector);
        $(selector).editable({
            //mode: 'inline',
            //disabled: true,
            defaultValue: '<p class="feeditSimple-empty">Empty</p>',
            url: 'typo3/alt_doc.php?doSave=1',
            params: function(params) {
                var colId = $(this).closest('.connectedSortable').attr('id');
                var colPos = getColpos(colId);
                
                var uid = $(this).attr('id');
                uid = uid.split('_').pop();
                //console.log(uid);
                params['_saveandclosedok_x'] = 1;
                //_savedoc_x
                params['cmd'] = "edit";
                params["record"] = $('input[name="record"]',this).val();
                params["data[tt_content]["+uid+"][colPos]"] = colPos;
                params["data[tt_content]["+uid+"][pid]"] = $('input[name="pid"]').val();
                params["data[tt_content]["+uid+"][header]"] = $('#feeditsimple-elHeader').val();
                params["data[tt_content]["+uid+"][CType]"] = $('input[name="CType"]').val();
                params["data[tt_content]["+uid+"][bodytext]"] = params.value;
                params["formToken"] = $('input[name="formToken"]',this).val();
                return params;
            },
            wysihtml5: {
                "emphasis": true,
                "customTemplates": myCustomTemplates,
                "font-styles": false,
                "format-code": true,
                //"html": true, //Button which allows you to edit the generated HTML. Default false
                "image": true, //Button to insert an image. Default true,    
            },
            success: function(response, newValue) {
                //console.log(response);
                //console.log(newValue);
                //To do remove placeholder class
                showMessage(okMessage);
            },
            error: function(response, newValue) {
                if(response.status === 500) {
                    return 'Service unavailable. Please try later.';
                } else {
                    return response.responseText;
                }
            },
            //onblur: 'ignore',
            toggle: 'dblclick',
            inputclass: 'feeditSimple-textarea'
        });

        $(selector).on('shown', function(e, editable) {
            if(!editable) {
                return false;
            }
            
            //Disable rightclick
            disableBootstrapContextMenu();
            
            //remove empty
            $('body',$('.wysihtml5-sandbox').contents()).find('.feeditSimple-empty').remove();
            
            var id = $(this).closest('.lth_feeditsimple_content').attr('id');
            var ui = $(this).closest('.csc-default');
            
            id = id.split('_').pop();
            var url = '';
            var pid = '';
            //var pageUid = 0;
            if(!ui.prev().attr('id')) {
                // Sorting number is in the top
                pid = $('body').attr('id').toString(); //pid=6
                //pageUid = pid;
            } else {
                // Sorting number is inside the list
                pid = '-' + ui.prev().attr('id').replace('c',''); //pid = -63
                //pageUid = $('body').attr('id');
            }
            if(id==='new') {
                url = '/typo3/alt_doc.php?edit[tt_content]['+pid+']=new';
            } else {
                url = '/typo3/alt_doc.php?edit[tt_content]['+id+']=edit';
            }
            var that = this;
            var formToken = '';

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                complete: function(data) {
                    formToken = $(data.responseText).find('input[name="formToken"]').val();
                    $(that).append('<input type="hidden" name="formToken" value="' + formToken + '" />' +
                        '<input type="hidden" name="pid" id="pid" value="' + pid + '" />');
                    if($('.editable-filemanager').length < 0) {
                        $('.bootstrap-wysihtml5-insert-link-url').after('<button title="Files and images" type="button" class="btn editable-filemanager">' +
                            '<i class="icon-folder-open"></i></button>' +
                            '<button title="Typo3 page-tree" type="button" class="btn editable-pagebrowser">' +
                            '<i class="icon-list-alt"></i></button>');
                    }
                    $('.editable-filemanager').click(function() {
                        $.fancybox.open([
                            {
                                maxWidth: 800,
                                maxHeight: 600,
                                fitToView: false,
                                width: '70%',
                                height: '70%',
                                autoSize: false,
                                closeClick: false,
                                openEffect: 'none',
                                closeEffect: 'none',
                                type: 'iframe',
                                modal: false,
                                closeBtn: false,
                                href: 'typo3conf/ext/lth_feedit_simple/vendor/cute/index.html',
                                afterLoad:function() {
                                    cute();
                                }
                            }
                        ]);
                    });

                    
                    $('.editable-pagebrowser').click(function() {
                        $.fancybox.open([
                            {
                                maxWidth: 500,
                                maxHeight: 900,
                                fitToView: false,
                                width: '40%',
                                height: '70%',
                                autoSize: false,
                                closeClick: false,
                                openEffect: 'none',
                                closeEffect: 'none',
                                type: 'iframe',
                                modal: false,
                                closeBtn: false,
                                href: 'typo3conf/ext/lth_feedit_simple/vendor/bootstraptreeview/index.html',
                                afterLoad:function() {
                                    ajaxCall('getPageTree', 'tt_content', id, '', $('body').attr('id'));
                                }
                            }
                        ]);
                    });
                }
            });
            e.stopPropagation();
        });
    } else if(type=='image') {
        createAddress();
        $(selector).editable({
            //selector: 'img',
            /*url: function() {
                var selectedImage = $('#feeditSimple-imageSrc').val();
                var title = $('#feeditSimple-imageTitle').val();
                var target = $('#feeditSimple-imageTarget').val();
                var width = $('#feeditSimple-imageWidth').val();
                var height = $('#feeditSimple-imageHeight').val();
                
                $(this).closest('.feeditSimple-placeHolder').attr('src',selectedImage);
                //console.log('1345');
                return 'typo3/alt_doc.php?doSave=1';
            },*/
            send: 'always',
            url: 'typo3/alt_doc.php?doSave=1',
            params: function(params) {
                var theImages = new Array();
                var theTitles = new Array();
                var theRemoves = new Array();
                var imagewidth = '';
                var imageheight = '';
                var idToRemove = 0;
                
                $(this).closest('.csc-textpic').find('img').map(function(){
                    if($(this).hasClass('feeditSimple-remove')) {
                        theRemoves.push($(this).attr('id'));
                    } else {
                        theImages.push($(this).attr('id'));
                        theTitles.push($(this).attr('title'));
                        //theSysRefs.push($(this).attr(''));
                        imagewidth = $(this).width();
                        imageheight = $(this).height();
                    }
                }).get();
                
                var colId = $(this).closest('.connectedSortable').attr('id');
                var colPos = getColpos(colId);
                
                var uid = $(this).closest('.csc-default').attr('id').replace('c','');
                //uid = uid.split('_').pop();
                //console.log(uid);
                params['_saveandclosedok_x'] = 1;
                //_savedoc_x
                params['cmd'] = "edit";
                params["record"] = $('input[name="record"]',this).val();
                params["data[tt_content]["+uid+"][colPos]"] = colPos;
                params["data[tt_content]["+uid+"][pid]"] = $('input[name="pid"]').val();
                params["data[tt_content]["+uid+"][CType]"] = $('input[name="CType"]').val();
                params["data[tt_content]["+uid+"][image]"] = glueTogether(',', theImages);
                theRemoves.forEach(function(d) {
                    params["cmd[sys_file_reference]["+d+"][delete]"] = 1;
                });
                params["data[tt_content]["+uid+"][title]"] = glueTogether(',', theTitles);
                params["data[tt_content]["+uid+"][imagewidth]"] = imagewidth;
                params["data[tt_content]["+uid+"][imageheight]"] = imageheight;
                params["data[tt_content]["+uid+"][imageorient]"] = $('input[name="imageorient"]',this).val();
                params["data[tt_content]["+uid+"][image_compression]"] = $('input[name="image_compression"]',this).val();
                params["formToken"] = $('input[name="formToken"]',this).val();
                return params;
            },
            display: function(value, sourceData) {
                //console.log($(this));
                //imgSrc = $(this).find('img').attr('src').split('/').pop();
            },
            container: 'body',
            success: function(response, newValue) {
                //console.log(response);
                //update image frontend
                //$(this).find('img').attr('src',$('#feeditSimple-imageSrc').val());
                //Show message to user
                showMessage(okMessage);
            },
            error: function(response, newValue) {
                //console.log('no');
                if(response.status === 500) {
                    return 'Service unavailable. Please try later.';
                } else {
                    return response.responseText;
                }
            },
            //onblur: 'ignore',
            title: 'Enter src, title and target',
            toggle: 'dblclick'
            /*value: {
                src: imgSrc, 
                title: "Lenina", 
                target: "15"
            }*/
        });

        $(selector).on('shown', function(e, editable) {
            if(!editable) {
                return false;
            }
            
            //Disable rightclick
            disableBootstrapContextMenu();
            
            var id = $(this).closest('.csc-default').attr('id');
            var imgId = $(this).find('img').attr('id');
            var ui = $(this).closest('.csc-default');
            //console.log($(this).closest('.csc-default').prev().attr('id'));
            id = id.replace('c', '');
            var url = '';
            var pid = '';
            //var pageUid = 0;
            if(!ui.prev().attr('id')) {
                // Sorting number is in the top
                pid = $('body').attr('id').toString(); //pid=6
                //pageUid = pid;
            } else {
                // Sorting number is inside the list
                pid = '-' + ui.prev().attr('id').replace('c',''); //pid = -63
                //pageUid = $('body').attr('id');
            }
            
            var src = $(this).find('img').attr('src');
            var title = $(this).find('img').attr('title');
            var target = $(this).find('img').attr('target');
            var height = $(this).find('img').height();
            var width = $(this).find('img').width();
  
            if(id==='new') {
                url = '/typo3/alt_doc.php?edit[tt_content]['+pid+']=new';
            } else {
                url = '/typo3/alt_doc.php?edit[tt_content]['+id+']=edit';
            }
            var that = this;
            var formToken, imageorient, image_compression = '';
            
            //prevent close editable on dblclick
            $('.editable-popup').dblclick(function() {
                return false;
            });
            
            $.ajax({
                type: 'POST',
                url: url,
                dataType: 'json',
                complete: function(data) {
                    formToken = $(data.responseText).find('input[name="formToken"]').val();
                    imageorient = $(data.responseText).find('select[name="data[tt_content]['+id+'][imageorient]"]').val();
                    image_compression = $(data.responseText).find('select[name="data[tt_content]['+id+'][image_compression]"]').val();
                    //console.log(imageorient + ';' + image_compression);
                    $(that).append('<input type="hidden" name="formToken" value="' + formToken + '" />' +
                        '<input type="hidden" name="pid" id="pid" value="' + pid + '" />' +
                        '<input type="hidden" name="imageorient" id="imageorient" value="' + imageorient + '" />' +
                        '<input type="hidden" name="image_compression" id="image_compression" value="' + image_compression + '" />' +
                        '<input type="hidden" name="absolutePath" id="absolutePath" />');
                    if($('.editable-filemanager').length < 0) {
                        $('.bootstrap-wysihtml5-insert-link-url').after('<button title="Files and images" type="button" class="btn editable-filemanager">' +
                            '<i class="icon-folder-open"></i></button>' +
                            '<button title="Typo3 page-tree" type="button" class="btn editable-pagebrowser">' +
                            '<i class="icon-list-alt"></i></button>');
                    }
                    
                    $('#feeditSimple-imageSrc').val(src);
                    $('#feeditSimple-imageTitle').val(title);
                    $('#feeditSimple-imageTarget').val(target);
                    $('#feeditSimple-imageHeight').val(height);
                    $('#feeditSimple-imageWidth').val(width);
                    
                    $('.editable-filemanager').click(function(that) {
                        $.fancybox.open([
                            {
                                maxWidth: 800,
                                maxHeight: 600,
                                fitToView: false,
                                width: '70%',
                                height: '70%',
                                autoSize: false,
                                closeClick: false,
                                openEffect: 'none',
                                closeEffect: 'none',
                                type: 'iframe',
                                modal: false,
                                closeBtn: false,
                                href: 'typo3conf/ext/lth_feedit_simple/vendor/cute/index.html',
                                afterLoad:function() {
                                    cute(imgId);
                                }
                            }
                        ]);
                    });
                                        
                    $('.editable-delete-image').click(function(e) {
                        if(confirm('Are you sure?')) {
                            //var cscDefault = $(imgOrg).closest('.csc-default');
                            //var noOfRows = $(cscDefault).find('.csc-textpic-imagerow').length;
                            $('#'+imgId).addClass('feeditSimple-remove');
                            $('.editableform').editable().submit();
                            if($('#'+imgId).closest('.csc-textpic-imagerow').length === 0) {
                                //There is one image only
                                //console.log('one');
                                $('#'+imgId).closest('.csc-textpic-imagewrap').remove();
                            } else {
                                //console.log('more');
                                //There are more than one image
                                $('#'+imgId).closest('.csc-textpic-imagerow').remove();
                            }
                            //$.fancybox.close();
                        }
                        //e.stopPropagation();
                    });
                    
                    $('.feeditSimple-plus').click(function(e) {
                        var currentVal = parseInt($(this).prev().val());
                        if (!isNaN(currentVal)) {
                            if($('#feeditSimple-keepRatio').prop('checked')) {
                                $('#feeditSimple-imageWidth').val( function(i, oldval) {
                                    return parseInt( oldval, 10) + 1;
                                });
                                $(that).closest('.csc-default').find('img').width($('#feeditSimple-imageWidth').val());
                                $('#feeditSimple-imageHeight').val( function(i, oldval) {
                                    return parseInt( oldval, 10) + 1;
                                });
                                $(that).closest('.csc-default').find('img').height($('#feeditSimple-imageHeight').val());
                            } else {
                                $(this).prev().val(currentVal + 1);
                                if($(this).attr('id').indexOf('width') > 0) {
                                    $(that).closest('.csc-default').find('img').width(currentVal + 1);
                                } else {
                                    $(that).closest('.csc-default').find('img').height(currentVal + 1);
                                }
                            }
                        }
                        //e.stopPropagation();
                    });
                    
                    $('.feeditSimple-minus').click(function(e) {
                        var currentVal = parseInt($(this).prev().prev().val());
                        //console.log(currentVal);
                        if (!isNaN(currentVal)) {
                            if($('#feeditSimple-keepRatio').prop('checked')) {
                                $('#feeditSimple-imageWidth').val( function(i, oldval) {
                                    return parseInt( oldval, 10)- 1;
                                });
                                $(that).closest('.csc-default').find('img').width($('#feeditSimple-imageWidth').val());
                                $('#feeditSimple-imageHeight').val( function(i, oldval) {
                                    return parseInt( oldval, 10) - 1;
                                });
                                $(that).closest('.csc-default').find('img').height($('#feeditSimple-imageHeight').val());
                            } else {
                                $(this).prev().prev().val(currentVal - 1);
                                if($(this).attr('id').indexOf('width') > 0) {
                                    $(that).closest('.csc-default').find('img').width(currentVal - 1);
                                } else {
                                    $(that).closest('.csc-default').find('img').height(currentVal - 1);
                                }
                            }
                        }
                        //e.stopPropagation();
                    });
                }/*,
                error: function(xhr, status, error) {
                    //var err = xhr.responseText + ")");
                    console.log(xhr.responseText);
                    showMessage({message : 'no', header : '1590'});
                }*/
            }); 
            //e.stopPropagation();
        });
    } else if(type === 'table') {
        ////////////////////////
        //console.log(type+selector);
        $(selector).editable({
            //mode: 'inline',
            //disabled: true,
            //defaultValue: '<p class="feeditSimple-empty">Empty</p>',
            url: 'typo3/alt_doc.php?doSave=1',
            //onblur: 'ignore',
            toggle: 'dblclick',
            wysihtml5: {
                "emphasis": true,
                "customTemplates": myCustomTemplates,
                "font-styles": false,
                "format-code": true,
                //"html": true, //Button which allows you to edit the generated HTML. Default false
                "image": true, //Button to insert an image. Default true,    
            },
            params: function(params) {
                
                var colId = $(this).closest('.connectedSortable').attr('id');
                var colPos = getColpos(colId);
                
                var uid = $(this).attr('id');
                uid = uid.split('_').pop();
                //console.log(uid);
                params['_saveandclosedok_x'] = 1;
                //_savedoc_x
                params['cmd'] = "edit";
                params["record"] = $('input[name="record"]',this).val();
                params["data[tt_content]["+uid+"][colPos]"] = colPos;
                params["data[tt_content]["+uid+"][pid]"] = $('input[name="pid"]').val();
                params["data[tt_content]["+uid+"][header]"] = $('#feeditsimple-elHeader').val();
                params["data[tt_content]["+uid+"][CType]"] = $('input[name="CType"]').val();
                params["data[tt_content]["+uid+"][bodytext]"] = params.value;
                params["data[tt_content]["+uid+"][image]"] = theImages;
                params["formToken"] = $('input[name="formToken"]',this).val();
                return params;
            },
            success: function(response, newValue) {
                //console.log(response);
                //console.log(newValue);
                //To do remove placeholder class
                showMessage(okMessage);
            },
            error: function(response, newValue) {
                if(response.status === 500) {
                    return 'Service unavailable. Please try later.';
                } else {
                    return response.responseText;
                }
            },
            //inputclass: 'feeditSimple-textarea'
        });
        
        
        $(selector).on('shown', function(e, editable) {
            //console.log(selector);
            //Disable rightclick
            disableBootstrapContextMenu();
        });
    }
    
    $(selector).on('hidden', function(e, editable) {
        if(!editable) {
            return false;
        }
        $('.csc-default').attr("disabled", false);
    });
}


(function () {
	this.uniqid = function (pr, en) {
		var pr = pr || '', en = en || false, result;
  
		this.seed = function (s, w) {
			s = parseInt(s, 10).toString(16);
			return w < s.length ? s.slice(s.length - w) : (w > s.length) ? new Array(1 + (w - s.length)).join('0') + s : s;
		};

		result = pr + this.seed(parseInt(new Date().getTime() / 1000, 10), 8) + this.seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5);
  
		if (en) result += (Math.random() * 10).toFixed(8).toString();

		return result;
	};
})();


function insertImage(uid, okMessage)
{
    //console.log(uid);
    if($('#c'+uid).find('.csc-textpic-imagewrap').length > 0) {
        //
        //There is an image
        //<div class="csc-textpic-center-outer"><<div class="csc-textpic-center-inner">
        //
        var newIndex = $('#c'+uid).find('.feeditSimple-placeHolder').length;
        var afterContent = '<div class="csc-textpic-imagerow csc-textpic-imagerow-last">' +
            '<div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">' +
            '<figure class="csc-textpic-image csc-textpic-last csc-textpic-new-' + newIndex + '">' +
            '<img id="csc-textpic-new-' + newIndex + '" class="feeditSimple-placeHolder" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="">' +
            '</figure>' +
            '</div>' +
            '</div>';
        if($('#c'+uid).find('.csc-textpic-imagerow').length > 0) {
            //There is more than one image
            //console.log('There are more than image');
            $('#c'+uid).find('.csc-textpic-imagerow').removeClass('csc-textpic-imagerow-last');
            $('#c'+uid).find('.csc-textpic-imagerow').last().after(afterContent);
        } else {
            //There is only one image
            //console.log('There is only one image');
            $('#c'+uid).find('.csc-textpic-imagewrap').wrap('<div class="csc-textpic-imagerow">' +
                '<div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">' +
                '<figure class="csc-textpic-image csc-textpic-last csc-textpic-new-' + newIndex + '">' +
                '</figure>' +
                '</div>' +
                '</div>');
            $('#c'+uid).find('.csc-textpic-imagerow').after(afterContent);
            if($('#c'+uid).find('.csc-textpic-above').length > 0) {
                $('#c'+uid).find('.csc-textpic-imagerow').wrapAll('<div class="csc-textpic-center-outer"><div class="csc-textpic-center-inner"></div></div>');
            }
        }
    } else {
        //console.log('There is no image');
        //There is no image
        var prependContent = '<div class="csc-textpic-imagewrap">' +
            '<figure class="csc-textpic-image csc-textpic-last csc-textpic-new-' + newIndex + '">' +
            '<img class="feeditSimple-placeHolder" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="">' +
            '</figure>' +
            '</div>';
        $('#c'+uid).find('.csc-textpic-text').toggleClass('csc-textpic csc-textpic-intext-right').prepend(prependContent);
    }
    //make editable
    makeEditable('.csc-textpic-new-' + newIndex, 'image', okMessage);
}

 function getColpos(columnId)
 {
    var columnType = columnId.split('-').pop();
    var colPos = '0';
    switch(columnType) {
        case 'normalColWrapper':
            colPos = '0';
            break;
        case 'rightColWrapper':
            colPos = '2';
            break;
        default:
            colPos = '0';
    }
    return colPos;
}

//call ajax.php
function ajaxCall(cmd, table, uid, pid, pageUid, okMessage, contentToPaste)
{
    $.ajax({
        type : "POST",
        url : 'index.php',
        dataType: 'json',
        data: {
            eID : 'lth_feedit_simple',
            cmd : cmd,
            table : table,
            uid : uid,
            pid : pid,
            pageUid : pageUid,
            contentToPaste : contentToPaste,
            sid : Math.random()
        },
        success: function(data) {
            if(cmd == 'pasteContent' && data.content && data.result == 200) {
                //$('#c'+pid).toggle();
                $('#c'+pid).after(data.content);
                makeEditable('#lth_feeditsimple_'+ uid + ' .lth_feeditsimple_content', '');
                $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable('refresh');
                if(data.oldUid) {
                    feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:'+table+':'+data.oldUid,1);
                }
            } else if(cmd === 'hideContent' && data.result == 200) {
                $('#c'+uid).css('opacity', '0.5');
                $('#c'+uid).css('-ms-filter', 'alpha(opacity=50)');
            } else if(cmd === 'showContent' && data.result == 200) {
                $('#c'+uid).css('opacity', '');
                $('#c'+uid).css('-ms-filter', '');
            } else if(cmd === 'pastePage') {
                if(data.oldUid) {
                    feeditSimpleSetCookie('feeditSimple-copycutpage', 'copy:pages:'+data.oldUid,1);
                }
                if(confirm('Page successfully pasted. You have to reload the page to see the changes. Do you want to do this?')) {
                    location.reload(true);
                }
            } else if(cmd === 'deletePage') {
                location.replace('index.php?id='+data.pid);
            }  else if(cmd === 'hidePage' || cmd === 'hidePageInMenu') {
                location.replace('index.php?id='+data.pid);
            } else if((cmd === 'getPageTree') && data.content && data.result == 200) {
                var arr1 = [];
                
                $.each(data.content, function (index, d) {
                    
                    //console.log(d);
                    var tmp = d[0];
                    //console.log(tmp.uid);
                    arr1.push({'href': tmp.href, 'text':tmp.text, 'uid': tmp.uid, 'nodes': tmp.nodes});
                });

                var pageTreeContainer = $('body',$('.fancybox-iframe').contents()).find('.pageTreeContainer');
                var pageTree = pageTreeContainer.find('#pageTree');
                
                //Add close fancybox
                $(pageTreeContainer).find('.close').click(function() {
                    $.fancybox.close();
                });
                
                pageTree.treeview({
                    color: "#428bca",
                    enableLinks: true,
                    data: arr1,
                    onNodeSelected: function(event, data) {
                        //console.log(data);
                        window.parent.$(".bootstrap-wysihtml5-insert-link-url").val('/?id=' + data.uid);
                        $.fancybox.close();
                    }
                });
                
                pageTree.treeview('collapseAll', { silent: true });
                pageTreeContainer.show();
            } else if(cmd === 'getFormHandler') {
                var resultColumns = [];
                var tableContent = '<thead><tr>';
                $.each(data.columns, function(i, value){

                    var obj = { sTitle: value };

                    resultColumns.push(obj);
                    tableContent += '<th>'+value+'</th>';
                });
                //console.log(data.data);
                tableContent += '</tr></thead>';
                tableContent += '<tbody></tbody>';
                $('.modal-body').html('<table id="feeditSimple-formhandlerTable" class="display" width="100%"></table>');

                $('#feeditSimple-formhandlerTable').DataTable({
                    /*"aaData": data.data,
                    "aoColumns": [ resultColumns ],
                    "sPaginationType": "full_numbers",
                    "aaSorting": [[0, "asc"]],
                    "bJQueryUI": true,
                    "bDestroy": true,*/
                    "aaData": data.data,
                    "aoColumns": resultColumns,
                    dom: 'Bfrtip',
                    buttons: [
                        'copyHtml5',
                        'excelHtml5',
                        'csvHtml5',
                        'pdfHtml5'
                    ]
                });
                
                $("#feeditSimple-modalBox").modal({
                    persist: true,
                    onClose: function (dialog) {
                        dialog.container.fadeOut('slow', function () {
                            $.modal.close();
                        });
                    }
                });
        
                $("#feeditSimple-modalBox").on('shown', function() {
                    var tableWidth = $('#feeditSimple-formhandlerTable').width() + 50;
                    //var tableHeight = $('#feeditSimple-formhandlerTable').height()+200;
                    if(!tableWidth) {
                        tableWidth = '800';
                        //tableHeight = '800';
                    }
                    $(this).css('width', tableWidth + 'px');
                    //console.log($(this).find('.modal-body'));
                    //$(this).find('.dataTables_wrapper').css('height', tableHeight + 'px');
                });
            } else if(cmd === 'getImgId') {
                //console.log(contentToPaste);
                $("#"+uid).attr('src', '/fileadmin' + contentToPaste);
                $("#"+uid).attr('id', data.content);
                $(".bootstrap-wysihtml5-insert-link-url").val('/fileadmin' + contentToPaste);
                $.fancybox.close();
            }
            
            if(data.result == 200 && okMessage) {
                showMessage(okMessage);
            } else if(okMessage) {
                showMessage({message : '500'+cmd+data.result, header : '1671'});
            }
        },
        error: function(err) {
            console.log(err);
            showMessage({message : '500', header : '1676'});
        }
    });
}


function movePage(pageUid, that)
{
    console.log(pageUid + $(that).text());
}


//display message to user
function showMessage(message)
{
    if(message['header'] == 'warning') {
        var content = '<div class="typo3-message message-warning" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">Warning</div></div>';
        content += '<div class="message-body">'+message['message']+'</div></div>';
    } else if(message['header'] == 'error') {
        var content = '<div class="typo3-message message-error" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">Error</div></div>';
        content += '<div class="message-body">'+message['message']+'</div></div>';
    } else {
        var content = '<div class="typo3-message message-ok" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">'+message['header']+'</div></div>';
        content += '<div class="message-body">'+message['message']+'</div></div>';
    }
    $('.feEditSimple-fourthRow').html(content);
    $('.feEditSimple-fourthRow').slideDown('slow').delay(1500).slideUp('slow');
}

function hideMessage(input)
{
    
}

/*function feeditSimpleContentCommand_old(cmd, el)
{
    var uid = $(el).attr('id').split('_').pop();
    var pageUid = $('body').attr('id');
    
    switch(cmd) {
        case 'delete':
            
            FrontendEditing.editPanels.removeKey(this.parent.record);
                this.parent.removeContent();
                var noColumn = $("#content_sidebar_wrapper").find(".feEditAdvanced-allWrapper").length;
                if(noColumn==0 && $("#content_sidebar_wrapper").length>0) {
                    removeRightColumn();
                }
            break;
        case 'cut':
            if(feeditSimpleSetCookie('feeditSimple-copycutitem', 'cut:tt_content:'+uid,1)) {
                var content = $(el).closest('.csc-default').html();
                $(el).remove();
                var okMessage = {'header' : 'Cut', 'message': 'Content element successfully cut'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        case 'copy':
            if(feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:tt_content:'+uid,1)) {
                var content = $(el).closest('.csc-default').html();
                var okMessage = {'header' : 'Copy', 'message': 'Content element successfully copied'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        case 'paste':
            var pasteContent = feeditSimpleGetCookie('feeditSimple-copycutitem');
            if(pasteContent) {
                var okMessage = {'header' : 'Paste', 'message': 'Content element successfully pasted'};
                ajaxCall('pasteContent', 'tt_content', pasteContent, uid, pageUid, okMessage, el.html());
            } else {
                showMessage({'header' : '500', 'message': 'no'});
            }
            break;
        default:
            //default code block
    }
}
*/

function feeditSimpleGetCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}


function feeditSimpleSetCookie(name, value, expires, domain, secure)
{
    try {
        if(expires) {
            var d = new Date();
            var n = d.getTimezoneOffset();
            d.setTime(d.getTime() + (Math.abs(n)*60*1000) + (60*60*1000));
        }
        var cookieStr = name + "=" + value;
        if(expires) {
            cookieStr += "; expires=" + d.toGMTString();
        }
        cookieStr += "; path=/";
        if(domain) {
            cookieStr += "; domain=" + domain;
        };
        if(secure) {
            cookieStr += "; secure";
        }
        document.cookie = cookieStr;
        return true;
    } catch(e) {
        return false;
    }
}


function toggleHiddenObject(inputClass, myType, okMessage)
{
    var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');
    if(displayString) {
        var displayObject = JSON.parse(unescape(displayString));
        //console.log(inputClass+','+myType + ',' + displayObject[myType]);

        if(displayObject[myType]=='none' && inputClass === 'hiddenElement') {
            displayObject[myType] = 'block';
            $(inputClass).closest('.csc-default').css('opacity', '0.5');
            $(inputClass).closest('.csc-default').css('-ms-filter', 'alpha(opacity=50)');

            $(inputClass).closest('.csc-default').css('display','block');
            $('#'+myType).css('display','inline-block');
        } else if(inputClass === 'hiddenElement') {
            displayObject[myType] = 'none';
            $(inputClass).closest('.csc-default').css('display','none');
            $('#'+myType).css('display','none');
        } else {
            if(displayObject[myType] === 'block') {
                displayObject[myType] = 'none';
                $(inputClass).hide();
                $('#'+myType).css('display','none');
            } else {
                displayObject[myType] = 'block';
                $(inputClass).show();
                $('#'+myType).css('display','inline-block');
            }
        }
        feeditSimpleSetCookie('feeditSimple-usersettings', JSON.stringify(displayObject),0);
        //showMessage(okMessage);
    } else {
        
    }
}


function changeImageOrientation(cmd, uid, imageOrientationId, okMessage)
{
    //console.log(cmd + uid);
    
    try {
        var innerContainer = $('#c'+uid);
        //var innerContainer = $(outerContainer).find('.lth_feeditsimple_img');
        //console.log(innerContainer);
        $.get('/typo3conf/ext/lth_feedit_simple/res/template/contentelement.html', function( response ) {
            //console.log($(innerContainer).find('.csc-textpicHeader'));
            if(innerContainer.find('.csc-textpicHeader').length > 0) {
                var header = $(innerContainer).find('.csc-textpicHeader').text();
            } else if(innerContainer.prev('h2').length > 0) {
                var header = $(innerContainer).prev('h2').text();
            }
            
            //Replace content in template
            var content = $(innerContainer).find('.lth_feeditsimple_content').html();
            //console.log($(innerContainer).find('.csc-textpic-image').html());
            var responseContent = $(response).filter("#"+cmd).html();
            //$(innerContainer).find('.csc-textpic-imagewrap').each(function(){
                //console.log('???2117');
                responseContent = responseContent.replace('###IMAGE###', $(innerContainer).find('.csc-textpic-imagewrap').html());
            //});
            //responseContent = responseContent.replace('###IMAGE###', image);
            responseContent = responseContent.replace('###CONTENT###', content);
            //console.log(responseContent);
            responseContent = responseContent.replace('lth_feeditsimple_###UID###', 'lth_feeditsimple_' + uid);
            //console.log(responseContent);
 
            if(header) {
                //there is a header :( and we have to deal with it
                if($(responseContent).find('.csc-textpicHeader').length > 0 && innerContainer.prev('h2').length > 0) {
                    //There is a header in the template and a header ouside in the original
                    //put header in the template and remove the outside header
                    responseContent = responseContent.replace('###HEADER###', '<h2>' + header + '</h2>');
                    $(innerContainer).prev('h2').remove();
                } else if($(responseContent).find('.csc-textpicHeader').length > 0 && innerContainer.prev('h2').length == 0) {
                    //put header in the template
                    responseContent = responseContent.replace('###HEADER###', '<h2>' + header + '</h2>');
                } else if($(responseContent).find('.csc-textpicHeader').length == 0 && innerContainer.prev('h2').length == 0) {
                    //put header in outer container and remove template header
                    $(outerContainer).prepend('<h2>' + header + '</h2>');
                    $(responseContent).find('.csc-textpicHeader').remove();
                }
            } else {
                //remove template header
                $(responseContent).find('.csc-textpicHeader').remove();
            }
            
            $.ajax({
                url: 'index.php',
                type: 'post',
                dataType: 'json',
                data: {
                    eID : 'lth_feedit_simple',
                    cmd : 'updateImageOrientation',
                    uid : imageOrientationId,
                    pid : uid,
                    sid : Math.random(),
                },
                success: function(data) {
                    //replace the content
                    $(innerContainer).html(responseContent);
                    showMessage(okMessage);
                },
                error: function(data) {
                    alert('Something went wrong');
                }
            });
            
        });
    } catch(err) {
        //console.log(err);
        showMessage({'header' : '500', 'message': err});
    }
}


function savePageProperties()
{
    var pid = $('body').attr('id');
    var params = {};
    params['_saveandclosedok_x'] = 1;
                //_savedoc_x
    params['cmd'] = "edit";
    //params["data[tt_content]["+uid+"][colPos]"] = colPos;
    params["data[pages]["+pid+"][subtitle]"] = $('#inputSubTitle').val();
    params["data[pages]["+pid+"][nav_title]"] = $('#inputNavTitle').val();
    params["data[pages]["+pid+"][title]"] = $('#inputTitle').val();
    params["formToken"] = $('input[name="formToken"]').val();
    //console.log(params);
    $.ajax({
        url: 'typo3/alt_doc.php?doSave=1',
        data: params,
        type: 'post',
        dataType: 'json',
        complete: function(data) {
            if(confirm('??')) {
                location.reload(true);
            } else {
                $.panelslider.close();
            }
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function getPath(breadcrumbs)
{
    //console.log($(breadcrumbs).children('a').last().attr('title'));
    if($(breadcrumbs).length > 0) {
        var path = '';
        if($(breadcrumbs).length === 0) {
            path = '/uploads/';
        } else {
            path = $(breadcrumbs).children('a').last().attr('title') + '/';
        }
        return(path);
    } else { 
        return '/uploads/';
    }
}

function glueTogether(glue, theArray)
{
    if(theArray.length > 0) {
        return theArray.join(glue);
    } else {
        return '';
    }
}


function createAddress()
{
    $('.csc-textpic-image').attr('data-type', 'address');
    
    //Create new fields for updating image
    var Address = function (options) {
        this.init('address', options, Address.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Address, $.fn.editabletypes.abstractinput);

    $.extend(Address.prototype, {
        /** Renders input from tpl @method render() **/        
        render: function() {
           this.$input = this.$tpl.find('input');
        },
        
        /**    Default method to show value in element. Can be overwritten by display option.
        @method value2html(value, element)  **/
        value2html: function(value, element) {
            if(!value) {
                $(element).empty();
                return; 
            }
            var html = $('<div>').text(value.src).html() + ', ' + 
                    $('<div>').text(value.title).html() + ', ' + 
                    $('<div>').text(value.target).html() + ', ' + 
                    $('<div>').text(value.width).html() + ', ' +
                    $('<div>').text(value.height).html() + ', ' +
                    $('<div>').text(value.process).html();
            $(element).html(html); 
        },
        
        /**        Gets value from element's html
                @method html2value(html) **/        
        html2value: function(html) {        
          
          return null;  
        },
      
       /**        Converts value to string.         It is used in internal comparing (not for sending to server).
                @method value2str(value)         **/
       value2str: function(value) {
           var str = '';
           if(value) {
               for(var k in value) {
                   str = str + k + ':' + value[k] + ';';  
               }
           }
           return str;
       }, 
       
       /*        Converts string to value. Used for reading value from 'data-value' attribute.
                @method str2value(str)         */
       str2value: function(str) {
           /*
           this is mainly for parsing value defined in data-value attribute. 
           If you will always set value by javascript, no need to overwrite it
           */
           return str;
       },                
       
       /**        Sets value of input.
                @method value2input(value) 
        @param {mixed} value       **/         
       value2input: function(value) {
           if(!value) {
             return;
           }
           this.$input.filter('[name="src"]').val(value.src);
           this.$input.filter('[name="title"]').val(value.title);
           this.$input.filter('[name="target"]').val(value.target);
           this.$input.filter('[name="width"]').val(value.width);
           this.$input.filter('[name="height"]').val(value.height);
           this.$input.filter('[name="process"]').val(value.process);
       },       
       
       /**        Returns value of input.
                @method input2value()        **/          
       input2value: function() { 
           return {
              src: this.$input.filter('[name="src"]').val(), 
              title: this.$input.filter('[name="title"]').val(), 
              target: this.$input.filter('[name="target"]').val(),
              width: this.$input.filter('[name="width"]').val(),
              height: this.$input.filter('[name="height"]').val(),
              process: this.$input.filter('[name="process"]').val()
           };
       },        
       
        /**        Activates input: sets focus on the first field.
                @method activate()        **/        
        activate: function() {
            this.$input.filter('[name="src"]').focus();
        },  
       
       /**        Attaches handler to submit form in case of 'showbuttons=false' mode
                @method autosubmit()        **/       
       /*autosubmit: function() {
          /* this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
           });
       }     */  
    });

    Address.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="form-horizontal">' +
                
            '<div class="control-group">' +
            
            '<label class="control-label" for="src">Src</label>' +
            '<div class="controls">' +
            '<input type="text" id="feeditSimple-imageSrc" placeholder="Src" name="src" class="input bootstrap-wysihtml5-insert-link-url" />' +
            '<button title="File or image" type="button" class="btn editable-filemanager"><i class="icon-folder-open"></i></button>' +
            '<button title="Delete image" type="button" class="btn editable-delete-image"><i class="icon-trash"></i></button>' +
            '</div>'+            
            
            '<label class="control-label ">Title</label>' +
            '<div class="controls"><input type="text" id="feeditSimple-imageTitle" placeholder="Title" name="title" class="input feeditSimple-imgTitle" /></div>' +

            '<label class="control-label ">Width</label>' +
            '<div class="controls">' + 
            '<input type="text" readonly="readonly" id="feeditSimple-imageWidth" name="width" class="input-mini" />' +
            '<a id="plus-width" href="javascript:" class="feeditSimple-plus"><i class="icon-plus"></i></a>' +
            '<a id="minus-width" href="javascript:" class="feeditSimple-minus"><i class="icon-minus"></i></a>' +
            '</div>' +
            
            '<label class="control-label ">Height</label>' +
            '<div class="controls">' +
            '<input type="text" readonly="readonly" id="feeditSimple-imageHeight" name="height" class="input-mini" />' +
            '<a id="plus-height" href="javascript:" class="feeditSimple-plus"><i class="icon-plus"></i></a>' +
            '<a id="minus-height" href="javascript:" class="feeditSimple-minus"><i class="icon-minus"></i></a>' +
            '</div>' +
            
            '<label class="control-label ">Keep ratio</label>' +
            '<div class="controls">' +
                '<input type="checkbox" name="feeditSimple-keepRatio" id="feeditSimple-keepRatio" checked="checked" />' +
            '</div>' +
            
            
            '<label class="control-label ">Quality and type</label>' +
            '<div class="controls">' +
                '<select id="image_compression" name="image_compression">' +
                    '<option value="0" selected="selected">Default</option>' +
                    '<option value="1">None (ignores all other options)</option>' +
                    '<option value="10">GIF/256</option>' +
                    '<option value="11">GIF/128</option>' +
                    '<option value="12">GIF/64</option>' +
                    '<option value="13">GIF/32</option>' +
                    '<option value="14">GIF/16</option>' +
                    '<option value="15">GIF/8</option>' +
                    '<option value="39">PNG</option>' +
                    '<option value="30">PNG/256</option>' +
                    '<option value="31">PNG/128</option>' +
                    '<option value="32">PNG/64</option>' +
                    '<option value="33">PNG/32</option>' +
                    '<option value="34">PNG/16</option>' +
                    '<option value="35">PNG/8</option>' +
                    '<option value="21">JPG/Very High</option>' +
                    '<option value="22">JPG/High</option>' +
                    '<option value="24">JPG/Medium</option>' +
                    '<option value="26">JPG/Low</option>' +
                    '<option value="28">JPG/Very Low</option>' +
                "</select>" +
            '</div>' +
            
            '</div>' +
            
            '</div>',
        inputclass: ''
    });

    $.fn.editabletypes.address = Address;
}
//<div class="csc-textpicHeader csc-textpicHeader-###UID###"><h2>###HEADER###</h2></div>


//***************************************************************EXTEND X-EDITABLE**********************************************************/
    //Add Code button
(function(wysihtml5) {
var undef;

wysihtml5.commands.formatCode = {
    exec: function(composer) {
    var pre = this.state(composer);
    if (pre) {
      // caret is already within a <pre><code>...</code></pre>
      composer.selection.executeAndRestore(function() {
        var code = pre.querySelector("code");
        wysihtml5.dom.replaceWithChildNodes(pre);
        if (code) {
          wysihtml5.dom.replaceWithChildNodes(pre);
        }
      });
    } else {
      // Wrap in <pre><code>...</code></pre>
      var range = composer.selection.getRange(),
          selectedNodes = range.extractContents(),
          pre = composer.doc.createElement("pre"),
          code = composer.doc.createElement("code");
      pre.appendChild(code);
      code.appendChild(selectedNodes);
      range.insertNode(pre);
      composer.selection.selectNode(pre);
    }
    },
    state: function(composer) {
        var selectedNode = composer.selection.getSelectedNode();
        return wysihtml5.dom.getParentElement(selectedNode, { nodeName: "CODE" }) && wysihtml5.dom.getParentElement(selectedNode, { nodeName: "PRE" });
    }
};
})(wysihtml5);


//old code
/*   
                if (!activeButton) {
                    //self.editor.currentView.element.focus(false);
                    //caretBookmark = self.editor.composer.selection.getBookmark();
                    insertLinkModal.appendTo('body').modal('show');
                    insertLinkModal.on('click.dismiss.modal', '[data-dismiss="modal"]', function(e) {
                        e.stopPropagation();
                    });
                    return false;
                }
                else {
                    return true;
                }
            });*/
        
        //wysihtml5Editor.composer.commands.exec("createLink", "alert('uu');");
/*function getSettings(id,elHeader)
{
    var content = '<input type="text" class="input-small" value="'+elHeader+'" id="feeditsimple-elHeader" placeholder="Header">' +
        '<select multiple="multiple">' +
        '<option>1</option><option>2</option>' +
        '</select>';
    return content;
            
    
     * <span class="t3-tceforms-input-wrapper" onmouseover="if (document.getElementById('tceforms-textfield-55af658b26bbd').value) 
     * {this.className='t3-tceforms-input-wrapper-hover';} else {this.className='t3-tceforms-input-wrapper';};" 
     * onmouseout="this.className='t3-tceforms-input-wrapper';">
     * <span tag="a" class="t3-icon t3-icon-actions t3-icon-actions-input 
     * t3-icon-input-clear t3-tceforms-input-clearer" 
     * onclick="document.getElementById('tceforms-textfield-55af658b26bbd').value='';
     * document.getElementById('tceforms-textfield-55af658b26bbd').focus();typo3form.fieldGet('data[tt_content][1][header]','','',1,'');
     * TBE_EDITOR.fieldChanged('tt_content','1','header','data[tt_content][1][header]');">&nbsp;</span>
     * <input type="text" id="tceforms-textfield-55af658b26bbd" 
     * class="formField tceforms-textfield hasDefaultValue" 
     * name="data[tt_content][1][header]_hr" 
     * value="" style="width: 460px; " maxlength="256" 
     * onchange="typo3form.fieldGet('data[tt_content][1][header]','','',1,'');
     * TBE_EDITOR.fieldChanged('tt_content','1','header','data[tt_content][1][header]');">
     * <input type="hidden" name="data[tt_content][1][header]" value=""></span>
     * <span class="t3-form-palette-field class-main5"><img name="cm_tt_content_1_image" src="clear.gif" class="t3-form-palette-icon-contentchanged" alt=""><img name="req_tt_content_1_image" src="clear.gif" class="t3-form-palette-icon-required" alt=""><input type="hidden" name="data[tt_content][1][image]_mul" value="0"><table border="0" cellpadding="0" cellspacing="0" width="1">
			
			<tbody><tr>
				<td valign="top"><select id="tceforms-multiselect-55af658bc8d7f" size="3" class="formField tceforms-multiselect" multiple="multiple" name="data[tt_content][1][image]_list" style="width:310px;"></select><span class="filetypes">GIF JPG JPEG PNG </span></td>
				<td valign="top" class="icons"><a href="#" onclick="setFormValueManipulate('data[tt_content][1][image]','Up'); return false;"><span title="Move selected items upwards" class="t3-icon t3-icon-actions t3-icon-actions-move t3-icon-move-up">&nbsp;</span></a><br><a href="#" onclick="setFormValueManipulate('data[tt_content][1][image]','Down'); return false;"><span title="Move selected items downwards" class="t3-icon t3-icon-actions t3-icon-actions-move t3-icon-move-down">&nbsp;</span></a><br><a href="#" onclick="setFormValueManipulate('data[tt_content][1][image]','Remove'); return false"><span title="Remove selected items" class="t3-icon t3-icon-actions t3-icon-actions-selection t3-icon-selection-delete">&nbsp;</span></a></td>
				<td valign="top" class="icons"><a href="#" onclick="setFormValueOpenBrowser('file','data[tt_content][1][image]|||gif,jpg,jpeg,png|'); return false;"><span title="Browse for files" class="t3-icon t3-icon-actions t3-icon-actions-insert t3-icon-insert-record">&nbsp;</span></a></td>
				<td valign="top" class="thumbnails"></td>
			</tr>
		</tbody></table><input type="hidden" name="data[tt_content][1][image]" value=""></span>
     
}*/

/*$('.lth_feeditsimple_content').on('hidden', function(e, editable) {
        var container = $('.feEditSimple-thirdRow');
        var formEl = container.find('.navbar-form');
        var elHeader = $('#feeditsimple-elHeader').val();
        var id = $(this).closest('.lth_feeditsimple_content').attr('id');
        id = id.split('_').pop();
        if(elHeader!='' && $('#c'+id+' h2').length>0) {
            $('#c'+id+' h2').html(elHeader);
        } else if(elHeader!='') {
            $('#c'+id).prepend('<h2>'+elHeader+'</h2>');
        }
        formEl.html('');
        container.hide();
    });*/
/*
* var aaData = [
            [ "Trident", "Internet Explorer 4.0", "Win 95+", 4, "X" ],
            [ "Trident", "Internet Explorer 5.0", "Win 95+", 5, "C" ],
            [ "Trident", "Internet Explorer 5.5", "Win 95+", 5.5, "A" ],
            [ "Trident", "Internet Explorer 6.0", "Win 98+", 6, "A" ],
            [ "Trident", "Internet Explorer 7.0", "Win XP SP2+", 7, "A" ],
            [ "Gecko", "Firefox 1.5", "Win 98+ / OSX.2+", 1.8, "A" ],
            [ "Gecko", "Firefox 2", "Win 98+ / OSX.2+", 1.8, "A" ],
            [ "Gecko", "Firefox 3", "Win 2k+ / OSX.3+", 1.9, "A" ],
            [ "Webkit", "Safari 1.2", "OSX.3", 125.5, "A" ],
            [ "Webkit", "Safari 1.3", "OSX.3", 312.8, "A" ],
            [ "Webkit", "Safari 2.0", "OSX.4+", 419.3, "A" ],
            [ "Webkit", "Safari 3.0", "OSX.4+", 522.1, "A" ]
        ];
        var aoColumns = [
            { "sTitle": "Engine" },
            { "sTitle": "Browser" },
            { "sTitle": "Platform" },
            { "sTitle": "Version", "sClass": "center" },
            {
                "sTitle": "Grade",
                "sClass": "center",
                "fnRender": function(obj) {
                    var sReturn = obj.aData[ obj.iDataColumn ];
                    if ( sReturn == "A" ) {
                        sReturn = "<b>A</b>";
                    }
                    return sReturn;
                }
            }
        ];
 */