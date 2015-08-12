/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//defaults
//$.fn.editable.defaults.mode = 'inline';
/*$.fn.editableform.buttons  = ''+
    '<button type="submit" class="btn btn-primary editable-submit"><i class="icon-ok icon-white"></i></button><br />'+
    '<button type="button" class="btn editable-cancel" style="margin-left:0px;"><i class="icon-remove"></i></button><br />'+
    '<button type="button" class="btn editable-remove"><i class="icon-trash"></i></button>';+
    '<button type="button" class="btn editable-picture"><i class="icon-picture"></i></button><br />';

//Add actions to new buttons
$(document).delegate(".editable-remove",'click',function(e){ 
    //$("#lista .editable-open[data-original-title]").remove();
    //console.log('remove');
});*/

//$(document).delegate(".editable-picture",'click',function(e){
    
        /*find('figure').map(function(){
                                //return $(this).attr('src')
                                if($(this).attr('src').split('/').pop() != imgSrc) {
                                    otherImages += $(this).attr('src').split('/').pop() + ',';
                                }
                            }).get();*/
    ////console.log('picture');
//});
var saveBeforeStopUid = function(input) {
    beforeStopUid = input;
};

$(document).ready(function()
{
    $('.csc-textpic-image').attr('data-type', 'address');
    //Hide new content elements row on blur
    $("html").mouseup(function(e)
    {
        var subject = $("#feEditSimple-secondRow");
        if(e.target.id != subject.attr('id') && !subject.has(e.target).length)
        {
            subject.fadeOut();
        }
    });
    ////console.log($('#feEditSimple-normalColWrapper').is(':empty'));
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
                //function getSortNumber($table,$uid,$pid)
            };
        }
    }).disableSelection();
    
    //make it possible to drop new content element
    $('#feEditSimple-contentTypeToolbar > a').draggable({
        helper:'clone',
        //revert: 'invalid',
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
           //$(ui.helper).remove();
            /*var templateArray = getContentTemplate(ui.item.context.rel);
            var newUid = templateArray[0];
            var template = templateArray[1];
            
            saveBeforeStopUid(newUid);
            
            	    
            
            //$(this).sortable('cancel');
            makeEditable('#'+beforeStopUid+' .lth_feeditsimple_content', cType, okMessage);
            $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable('refresh');*/
       }
   });
     
    
    /*$('#feEditSimple-contentTypeToolbar').sortable({
        connectWith: '#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper',
        placeholder: 'ui-state-highlight',
        cursor: 'move',
        forcePlaceholderSize: false,
        appendTo: '#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper',
        beforeStop : function(event, ui) {
            //console.log(ui);
            
            var templateArray = getContentTemplate(ui.item.context.rel);
            var newUid = templateArray[0];
            var template = templateArray[1];
            
            saveBeforeStopUid(newUid);
            
            if(template) {
                if($(ui.placeholder).next().attr('id')) {                          
                    $(ui.placeholder).next().before(template);
                } else {
                    //sist
                    $(ui.placeholder).parent().append(template);
                }
            } else {
                alert('fel!');
            }		                                                   
	},
        stop : function(event, ui) {
            var cType = getCtype(ui.item.context.rel);
            var okMessage = {'header' : 'Move', 'message': 'Content element successfully created'};
            $(this).sortable('cancel');
            makeEditable('#'+beforeStopUid+' .lth_feeditsimple_content', cType, okMessage);
            $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable('refresh');
            //<div id="c59" class="csc-default">
    //<div id="lth_feeditsimple_img_59" data-type="address" data-pk="img_59" class="lth_feeditsimple_img">
    //<div class="csc-textpic-text">
    //<div id="lth_feeditsimple_59" data-type="wysihtml5" data-pk="59" class="lth_feeditsimple_content">
    //<p>yada</p>
    //</div>
    //</div>
    //</div>
    //</div>
            //$('#feEditSimple-contentTypeToolbar').sortable('refresh');
            //$('#feeditSimple-newElement').editable('toggle');
	}
    }).disableSelection();
    
    $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper, #feEditSimple-contentTypeToolbar').bind('sortstart', function(event, ui) {
        $('.ui-state-highlight').append('<span>Drop content here!</span>');
    });*/
    
    //Create new fields for updating image
    var Address = function (options) {
        this.init('address', options, Address.defaults);
    };

    //inherit from Abstract input
    $.fn.editableutils.inherit(Address, $.fn.editabletypes.abstractinput);

    $.extend(Address.prototype, {
        /** Renders input from tpl
        @method render() **/        
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
          /*
            you may write parsing method to get value by element's html
            e.g. "Moscow, st. Lenina, bld. 15" => {src: "Moscow", title: "Lenina", target: "15"}
            but for complex structures it's not recommended.
            Better set value directly via javascript, e.g. 
            editable({
                value: {
                    src: "Moscow", 
                    title: "Lenina", 
                    target: "15"
                }
            });
          */ 
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
           this.$input.keydown(function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
           });
       }     */  
    });
/*
 * $('.bootstrap-wysihtml5-insert-link-url').after('<button title="File or image" type="button" class="btn editable-filemanager">' +
                            '<i class="icon-folder-open"></i></button>');
 */
    Address.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        tpl: '<div class="control-group">' + 
            '<div class="controls">' +
            '<input type="text" id="src" placeholder="Src" name="src" class="input bootstrap-wysihtml5-insert-link-url">' +
            '<button title="File or image" type="button" class="btn editable-filemanager">' +
            '<i class="icon-folder-open"></i></button>' +
            '</div>'+
            '<div class="controls"><input type="text" id="title" placeholder="Title" name="title" class="input"></div>' +
            '<div class="controls"><input type="text" id="target" placeholder="Target" name="target" class="input"></div>' +
            '<div class="controls"><input type="text" id="width" placeholder="Width" name="width" class="input"></div>' +
            '<div class="controls"><input type="text" id="height" placeholder="Height" name="height" class="input"></div>' +
            '<div class="controls"><input type="text" id="process" placeholder="Process" name="process" class="input"></div>' +
            '</div>'
        ,
        inputclass: ''
    });

    $.fn.editabletypes.address = Address;
    
    var okMessage = {'header' : 'Move', 'message': 'Content element successfully updated'};
    
    //make text elements editable
    $('.csc-default').dblclick(function(e, ui){
        //console.log('dblclick');
        e.stopPropagation();
        $(this).find('.lth_feeditsimple_content').editable('toggle');
    });
    
    makeEditable('.lth_feeditsimple_content', 'text', okMessage);
        
    //make image elements editable
    makeEditable('.csc-textpic-image', 'image', okMessage);
    
    //bootstrap-contextmenu
    $('.csc-default').contextmenu({
        target:'#context-menu', 
        before: function(e,context) {
          // execute code before context menu if shown
            //console.log($(e.target));
        },
        onItem: function(context,e) {
            feeditSimpleContentCommand(context, e);// execute on menu item selection
            e.stopPropagation();
            this.closemenu(e);
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
    } else {
        $('.lth_feeditsimple_content.hidden-1').closest('.csc-default').css('display', 'none');
    }
    
    /*$(".csc-default").hover(function(e) { 
        $(this).css("background-color",e.type === "mouseenter"?"yellow":"transparent");
    });*/

    //document ready ends**************************************************************************************************
});


/***************************************************************************************************************************
************************************************************HELP FUNCTIONS**************************************************
****************************************************************************************************************************/

function feeditSimpleContentCommand(context, e)
{
    var cmd = $(e.target).text();
    var uid = context.attr('id').replace('c','');
    var pageUid = $('body').attr('id');
    
    switch(cmd) {
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
            //console.log(cmd.toLowerCase().replace(',','').replace(' ', '-'));
            var okMessage = {'header' : 'Image', 'message': 'Image orientation successfully updated'};
            changeImageOrientation(cmd.toLowerCase().replace(', ','-').replace(' ', '-'), uid, okMessage);
            break;
        default:
            //default code block
    }
}
    
function cute()
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
        success: function(data) {
            var filemanager = $('body',$('.fancybox-iframe').contents()).find('.filemanager');
            var breadcrumbs = $('body',$('.fancybox-iframe').contents()).find('.breadcrumbs');
            var fileList = filemanager.find('.data');
            
            var breadcrumbsUrls = [];
            
            // Hiding and showing the search box
            filemanager.find('.search').click(function(){
                var search = $(this);
                search.find('span').hide();
                search.find('input[type=search]').show().focus();
            });
            
            // Hiding and showing upload
            filemanager.find('.uploads a').click(function(){
                var uploads = filemanager.find('.uploads');
                uploads.find('span').hide();
                uploads.find('input[type=file]').show();
            });
            
            filemanager.find('#fileupload').fileupload({
                dataType: 'json',
                /*
                add: function (e, data) {
                    data.context = $('<button/>').text('Upload')
                        .appendTo(document.body)
                        .click(function () {
                            data.context = $('<p/>').text('Uploading...').replaceAll($(this));
                            data.submit();
                        });
                },
                 */
                progressall: function (e, data) {
                    var progress = parseInt(data.loaded / data.total * 100, 10);
                    filemanager.find('#progress .bar').css(
                        'width',
                        progress + '%'
                    );
                },
                done: function (e, data) {
                    if(data.files) {
                        console.log(data.files);
                        $.each(data.files, function (index, file) {
                            console.log(file.name);
                            $('<p/>').text(file.name).appendTo(filemanager.find('.uploads'));
                        });
                    } else {
                        console.log('no'+data.files);
                    }
                },
                fail: function(e, data) {
                    console.log('Fail!');
                }
            });
            
            
            
            // Listening for keyboard input on the search field.
		// We are using the "input" event which detects cut and paste
		// in addition to keyboard input.
            filemanager.find('input[type=search]').on('input', function(e){
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
                }
                else {
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
                //hash = decodeURIComponent(hash).slice(1).split('=');

                //if (hash.length) {
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

                    } else if (nextDir != '') {
                        // if hash is some path
                        // Empty the old result and make the new one
                        fileList.html('');
                        rendered = searchByPath(nextDir.replace('fileadmin','sucker'),'next');
                        if (rendered.length) {
                            currentPath = nextDir;
                            breadcrumbsUrls = generateBreadcrumbs(nextDir);
                            render(rendered);
                        } else {
                            currentPath = nextDir;
                            breadcrumbsUrls = generateBreadcrumbs(nextDir);
                            render(rendered);
                        }
                    } else {
                        // if there is no nextDir
                       
                        rendered = searchByPath(data.path,'');
                        for(var i=0;i<rendered.length;i++){
                            render([rendered[i]]);
                        }
                        //currentPath = convertFileadmin(data.path);
                        //breadcrumbsUrls.push(currentPath);
                    }
                //}
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
                var path = dir.split('/'),
                    demo = [data],
                    flag = 0;
            
                if(type=='next') {
                    demo = demo[0].items;
                }
            
                for(var i=0;i<path.length;i++){
                    for(var j=0;j<demo.length;j++) {
                        if(demo[j].name === path[i]) {
                            flag = 1;
                            demo = demo[j].items;
                            break;
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

                        $(file).find('a').click(function(event) {
                            ////console.log($(this).attr('title'));
                            window.parent.$(".bootstrap-wysihtml5-insert-link-url").val(convertFileadmin($(this).attr('title')));
                            $.fancybox.close();
                        });
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
                
                // Show the generated elements
                fileList.animate({'display':'inline-block'});
            }
            
            function convertFileadmin(fPath)
            {
                ////console.log(fPath);
                if(fPath) {
                    var fPathArray = fPath.split('/fileadmin');
                    fPath = '/fileadmin' + fPathArray[1];
                    return fPath.replace('//','/');
                }
                
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

function getPageTree()
{
    ajaxCall('getPageTree');
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
    //console.log($('#feeditSimple-new').length);
    //<div id="c59" class="csc-default">
    //<div id="lth_feeditsimple_img_59" data-type="address" data-pk="img_59" class="lth_feeditsimple_img">
    //<div class="csc-textpic-text">
    //<div id="lth_feeditsimple_59" data-type="wysihtml5" data-pk="59" class="lth_feeditsimple_content">
    //<p>yada</p>
    //</div>
    //</div>
    //</div>
    //</div>
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
function makeEditable(selector, type, okMessage, disabled)
{
    //console.log(disabled);
    if(disabled===false) {
        disabled = false;
    } else {
        disabled = true;
    }
    var myCustomTemplates = {
        emphasis : function(locale) {
            /*return "<li>" +
            "<div class=\"dropdown\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" id=\"feeditSimple-contentMenu\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\">" +
            "<i class=\"icon-cog\"></i></button>" +
            "<ul class=\"dropdown-menu feeditSimple-content-command\" aria-labelledby=\"feeditSimple-contentMenu\">" +
                "<li><a class=\"feeditSimple-content-command-delete\" href=\"#\">Delete</a></li>" +
                "<li><a class=\"feeditSimple-content-command-cut\" href=\"#\">Cut</a></li>" +
                "<li><a class=\"feeditSimple-content-command-copy\" href=\"#\">Copy</a></li>" +
                "<li><a class=\"feeditSimple-content-command-paste\" href=\"#\">Paste</a></li>" +
                "<li><a class=\"feeditSimple-content-command-hide\" href=\"#\">Hide</a></li>" +
                "<li><a class=\"feeditSimple-content-command-show\" href=\"#\">Show</a></li>" +
                "<li class=\"dropdown-submenu\"><a href=\"#\">Image orientation</a>" +
                    "<ul class=\"dropdown-menu feeditSimple-imageorient\">" +
                    //data[tt_content][1][imageorient]
                        "<li><a class=\"feeditSimple-imageorient-0\" href=\"#\">Above, center</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-1\" href=\"#\">Above, right</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-2\" href=\"#\">Above, left</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-8\" href=\"#\">Below, center</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-9\" href=\"#\">Below, right</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-10\" href=\"#\">Below, left</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-17\" href=\"#\">In text, right</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-18\" href=\"#\">In text, left</a></li>" +
                        "<li>__No wrap:__</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-25\" href=\"#\">Beside Text, Right</a></li>" +
                        "<li><a class=\"feeditSimple-imageorient-26\" href=\"#\">Beside Text, Left</a></li>" +
                    "</ul>" +
                "</li>" +
                "<li class=\"dropdown-submenu\"><a href=\"#\">Image quality and type</a>" +
                    "<ul class=\"dropdown-menu feeditSimple-image_compression\">" +
                    //<select id="tceforms-select-55b9d47044475" name="data[tt_content][1][image_compression]" class="select" onchange="if (this.options[this.selectedIndex].value=='--div--') {this.selectedIndex=0;} TBE_EDITOR.fieldChanged('tt_content','1','image_compression','data[tt_content][1][image_compression]');"><option value="0" selected="selected">Default</option>
                        "<li><a class=\"feeditSimple-image_compression-1\" href=\"#\">None (ignores all other options)</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-10\" href=\"#\">GIF/256</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-11\" href=\"#\">GIF/128</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-12\" href=\"#\">GIF/64</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-13\" href=\"#\">GIF/32</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-14\" href=\"#\">GIF/16</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-15\" href=\"#\">GIF/8</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-39\" href=\"#\">PNG</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-30\" href=\"#\">PNG/256</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-31\" href=\"#\">PNG/128</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-32\" href=\"#\">PNG/64</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-33\" href=\"#\">PNG/32</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-34\" href=\"#\">PNG/16</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-35\" href=\"#\">PNG/8</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-21\" href=\"#\">JPG/Very High</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-22\" href=\"#\">JPG/High</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-24\" href=\"#\">JPG/Medium</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-26\" href=\"#\">JPG/Low</a></li>" +
                        "<li><a class=\"feeditSimple-image_compression-28\" href=\"#\">JPG/Very Low</a></li>" +
                    "</ul>" +
                "</li>" +
                "<li class=\"dropdown-submenu\"><a href=\"#\">Image effect</a>" +
                    "<ul class=\"dropdown-menu feeditSimple-image_effects\">" +
                    //<select id="tceforms-select-55b9d47044c14" name="data[tt_content][1][image_effects]" class="select" onchange="if (this.options[this.selectedIndex].value=='--div--') {this.selectedIndex=0;} TBE_EDITOR.fieldChanged('tt_content','1','image_effects','data[tt_content][1][image_effects]');"><option value="0" selected="selected">None</option>
                        "<li><a class=\"feeditSimple-image_effects-1\" href=\"#\">Rotate 90 CW</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-2\" href=\"#\">Rotate -90 CCW</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-3\" href=\"#\">Rotate 180</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-10\" href=\"#\">Grayscale</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-11\" href=\"#\">Sharpen</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-20\" href=\"#\">Normalize</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-23\" href=\"#\">Contrast</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-25\" href=\"#\">Brighter</a></li>" +
                        "<li><a class=\"feeditSimple-image_effects-26\" href=\"#\">Darker</a></li>" +
                    "</ul>" +
                "</li>" +
            "</ul>" +
            "</div>" + 
            "</li>" +
            "<li>" +*/
            return "<li><div class=\"btn-group\">" +
            "<a class=\"btn feeditSimple-h2\" data-wysihtml5-command=\"formatBlock\" data-wysihtml5-command-value=\"h2\" title=\"H2\" tabindex=\"-1\" unselectable=\"on\">H2</a>" +
            "<a class=\"btn feeditSimple-formatCode\" data-wysihtml5-command=\"formatCode\" data-wysihtml5-command-value=\"code\" title=\"Code\" tabindex=\"-1\" unselectable=\"on\">C</a>" +
            "<a class=\"btn\" data-wysihtml5-command=\"bold\" title=\"CTRL+B\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\">B</a>" +
            "<a class=\"btn\" data-wysihtml5-command=\"italic\" title=\"CTRL+I\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\">I</a>" +
            "</div>" +
            "</li>";
        },
        //<a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" tabindex="-1" href="javascript:;" unselectable="on">Heading 2</a>
        image : function(locale) {
            return "<li>" +
            "<a class=\"btn feeditSimple-insertImage\" data-wysihtml5-command=\"insertImage\" title=\"Insert image\" tabindex=\"-1\" href=\"javascript:;\" unselectable=\"on\"><i class=\"icon-picture\"></i></a>" +
            "</li>";
        }
        
    };

    if(type==='text' || type==='textpic') {
        //console.log(type+selector);
        $(selector).editable({
            mode: 'inline',
            //disabled: true,
            defaultValue: '<p class="feeditSimple-empty">Empty</p>',
            url: 'typo3/alt_doc.php?doSave=1',
            params: function(params) {
                var theImages = '';
                var absolutePath = $('input[name="absolutePath"]').val();
                //console.log($(this).find('img'));
                $(this).closest('.lth_feeditsimple_img').find('img').map(function(){
                    //console.log($(this).attr('src'));
                    //return $(this).attr('src')
                    if(theImages != '') {
                        theImages += ',';
                    }
                    if($(this).find('.feeditSimple-placeHolder')) {
                        theImages += absolutePath + $(this).attr('src');
                    } else {
                        theImages += $(this).attr('src').split('/').pop();
                    }
                }).get();
                
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
            wysihtml5: {
                "emphasis": true,
                "customTemplates": myCustomTemplates,
                "font-styles": false,
                "format-code": true,
                //"html": true, //Button which allows you to edit the generated HTML. Default false
                "image": true, //Button to insert an image. Default true,    
            },
            success: function(response, newValue) {
                console.log(response);
                console.log(newValue);
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
            onblur: 'ignore',
            toggle: 'manual'
        });
        $('.lth_feeditsimple_content').on('hidden', function(e, editable) {
            /*$(".csc-default").hover(function(e) { 
                $(this).css("background-color",e.type === "mouseenter"?"yellow":"transparent");
            });*/
            $(this).closest('.csc-default').find('.csc-textpic-image').editable('option', 'disabled', true);
        });
        $('.lth_feeditsimple_content').on('shown', function(e, editable) {
            //console.log($(this).closest('.csc-default').find('.csc-textpic-image'));
            $(this).closest('.csc-default').find('.csc-textpic-image').editable('option', 'disabled', false);
            /*$(".csc-default").hover(function() {
                $(this).css("background-color","transparent");
                $(this).css("background-color",e.type === "mouseenter"?"transparent":"transparent");
            });*/
            
            var el = this;
            //console.log(editable);
            //console.log(e);
            /*$('.feeditSimple-content-command').find('> li:not(.dropdown-submenu)').each(function() {
                $(this).find('a').click(function() {
                    feeditSimpleContentCommand($(this).attr('class').split('-').pop(), el);
                });
            });*/
            
            //remove empty
            $('body',$('.wysihtml5-sandbox').contents()).find('.feeditSimple-empty').remove();

            
            $('.feeditSimple-insertImage').click(function() {
                if($(this).closest('.csc-default').find('.csc-textpic-imagewrap').length > 0) {
                    //There is an image
                    
                    //<div class="csc-textpic-center-outer"><<div class="csc-textpic-center-inner">
                    //
                    var newIndex = $(this).closest('.csc-default').find('.feeditSimple-placeHolder').length;
                    var afterContent = '<div class="csc-textpic-imagerow csc-textpic-imagerow-last">' +
                        '<div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">' +
                        '<figure class="csc-textpic-image csc-textpic-last csc-textpic-new-' + newIndex + '">' +
                        '<img class="feeditSimple-placeHolder" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="">' +
                        '</figure>' +
                        '</div>' +
                        '</div>';
                    if($(this).closest('.csc-default').find('.csc-textpic-imagerow').length > 0) {
                        //There is more than one image
                        $(this).closest('.csc-default').last('.csc-textpic-imagerow').removeClass('csc-textpic-imagerow-last');
                        $(this).closest('.csc-default').last('.csc-textpic-imagerow').after(afterContent);
                    } else {
                        //There is only one image
                        $(this).closest('.csc-default').find('.csc-textpic-imagewrap').wrap('<div class="csc-textpic-imagerow">' +
                            '<div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">' +
                            '<figure class="csc-textpic-image csc-textpic-last csc-textpic-new-' + newIndex + '">' +
                            '</figure>' +
                            '</div>' +
                            '</div>');
                        $(this).closest('.csc-default').find('.csc-textpic-imagerow').after(afterContent);
                        if($(this).closest('.csc-textpic-above').length > 0) {
                            $(this).closest('.csc-default').find('.csc-textpic-imagerow').wrapAll('<div class="csc-textpic-center-outer"><div class="csc-textpic-center-inner"></div></div>');
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
                    $(this).closest('.csc-textpic-text').toggleClass('csc-textpic csc-textpic-intext-right').prepend(prependContent);
                }
                //make editable
                makeEditable('.csc-textpic-new-' + newIndex, 'image', okMessage, false);
            });           
            
            var id = $(this).closest('.lth_feeditsimple_content').attr('id');
            var ui = $(this).closest('.csc-default');
            //console.log($(this).closest('.csc-default').prev().attr('id'));
            id = id.split('_').pop();
            var url = '';
            var pid = '';
            var pageUid = 0;
            if(!ui.prev().attr('id')) {
                // Sorting number is in the top
                pid = $('body').attr('id').toString(); //pid=6
                pageUid = pid;
            } else {
                // Sorting number is inside the list
                pid = '-' + ui.prev().attr('id').replace('c',''); //pid = -63
                pageUid = $('body').attr('id');
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
                            '<input type="hidden" name="pid" value="' + pid + '" />' +
                            '<input type="hidden" name="absolutePath" />');
                    var urlInput = $('.bootstrap-wysihtml5-insert-link-url').after('<button title="Files and images" type="button" class="btn editable-filemanager">' +
                            '<i class="icon-folder-open"></i></button>' +
                            '<button title="Typo3 page-tree" type="button" class="btn editable-pagebrowser">' +
                            '<i class="icon-list-alt"></i></button>');
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
                                href: 'typo3conf/ext/lth_feedit_simple/vendor/bootstraptreeview/index.html',
                                afterLoad:function() {
                                    getPageTree();
                                }
                            }
                        ]);
                    });
                }
            });
        });
    } else if(type=='image') {
        $(selector).editable({
            //selector: 'img',
            //url: 'typo3/alt_doc.php?doSave=1',
            url: function() {
                var selectedImage = $('.bootstrap-wysihtml5-insert-link-url').val();
                $(this).closest('.feeditSimple-placeHolder').attr('src',selectedImage);
            },
            /*params: function(params) {   
                var uid = $(this).closest('.lth_feeditsimple_img').attr('id');
                uid = uid.split('_').pop();
                params['_savedoc_x'] = 1;
                params['cmd'] = "edit";
                params["data[tt_content]["+uid+"][image]"] = $('input[name="otherImages"]',$(this).closest('.lth_feeditsimple_img')).val() +
                    $('input[name="absolutePath"]',$(this).closest('.lth_feeditsimple_img')).val() + 
                    $('.bootstrap-wysihtml5-insert-link-url').val();
                //params["data[tt_content]["+uid+"][imagewidth]"] =;
                //params["data[tt_content]["+uid+"][imageheight]"] =;
                params['formToken'] = $('input[name="formToken"]',$(this).closest('.lth_feeditsimple_img')).val();
                //params['data[tt_content]['+uid+'][cType]'] = 'textpic';
                //params['data[tt_content]['+uid+'][colPos]'] = 0;
                return params;
            },*/
            disabled: disabled,
            display: function(value, sourceData) {
                //console.log($(this).find('img').attr('src'));
                imgSrc = $(this).find('img').attr('src').split('/').pop();
            },
            /*success: function(response, newValue) {
                ////console.log('Tjo!!!');
                //update image frontend
                $(this).attr('src',$('.bootstrap-wysihtml5-insert-link-url').val());
                //Show message to user
                showMessage(okMessage);
            },
            error: function(response, newValue) {
                if(response.status === 500) {
                    return 'Service unavailable. Please try later.';
                } else {
                    return response.responseText;
                }
            },*/
            //onblur: 'ignore',
            title: 'Enter src, title and target',
            /*toggle: 'dblclick',*/
            /*value: {
                src: imgSrc, 
                title: "Lenina", 
                target: "15"
            }*/
        });

        $('.csc-textpic-image').on('shown', function(e, editable) {
            
            //input-small bootstrap-wysihtml5-insert-link-url
            var id = $(this).closest('.csc-default').attr('id').substring(1);
            //id = id.split('_').pop();
            var that = this;
            var formToken = '';
            
            $.ajax({
                type: 'POST',
                url: 'index.php',
                dataType: 'json',
                data : {
                    eID : 'lth_feedit_simple',
                    cmd : 'getAbsolutePath',
                    sid : Math.random()
                },
                success: function(data) {
                    console.log(data.content);
                    var absolutePath = data.content;
                    $('input[name="absolutePath"]').val(absolutePath);
                    //var otherImages = '';
                    $('.bootstrap-wysihtml5-insert-link-url').val(imgSrc);
                    //console.log($('.editable-filemanager').length);
                    //if($('.editable-filemanager').length==1) {
                    //if($('.editable-filemanager').length === 1) {
                        //$('.bootstrap-wysihtml5-insert-link-url').after('<button title="File or image" type="button" class="btn editable-filemanager">' +
                        //    '<i class="icon-folder-open"></i></button>');
                    //}
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
                                href: 'typo3conf/ext/lth_feedit_simple/vendor/cute/index.html',
                                afterLoad:function() {
                                    cute();
                                }
                            }
                        ]);
                    });
                    //}
                    /*$.ajax({
                        url: '/typo3/alt_doc.php?edit[tt_content]['+id+']=edit',
                        url : function() {
                            
                        },
                        //type: 'post',
                        dataType: 'json',
                        complete: function(data){
                            formToken = $(data.responseText).find('input[name="formToken"]').val();
                            var images = $(that).find('img').map(function(){
                                //return $(this).attr('src')
                                if($(this).attr('src').split('/').pop() != imgSrc) {
                                    otherImages += $(this).attr('src').split('/').pop() + ',';
                                }
                            }).get();

                            $(that).closest('.lth_feeditsimple_img').append('<input type="hidden" name="formToken" value="' + formToken + '" />' +
                                    '<input type="hidden" name="absolutePath" value="' + absolutePath + '" />' +
                                    '<input type="hidden" name="otherImages" value="' + otherImages + '" />');
                                           
                        }
                    });*/
                },
                error: function(data){
                    //console.log(data);
                    showMessage({message : 'no', header : '1276'});
                }
            });

            
        });
    }
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
                makeEditable('#lth_feeditsimple_'+ uid + ' .lth_feeditsimple_content', '', '');
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
            } else if(cmd === 'getPageTree' && data.content && data.result == 200) {
                var arr1 = [];
                //console.log(data.content);
                $.each(data.content, function (index, d) {
                    var tmp = d[0];
                    arr1.push({'href': tmp.href, 'text':tmp.text, 'tags': tmp.tags, 'nodes': tmp.nodes});
                });

                var pageTreeContainer = $('body',$('.fancybox-iframe').contents()).find('.pageTreeContainer');
                var pageTree = pageTreeContainer.find('#pageTree');
                pageTree.treeview({
                    color: "#428bca",
                    enableLinks: true,
                    data: arr1,
                    onNodeSelected: function(event, data) {
                        //console.log(data.nodeId);
                        window.parent.$(".bootstrap-wysihtml5-insert-link-url").val(data.nodeId);
                        $.fancybox.close();
                    }
                });
                pageTree.treeview('collapseAll', { silent: true });
                pageTreeContainer.show();
            }
            
            if(data.result == 200 && okMessage) {
                showMessage(okMessage);
            } else if(okMessage) {
                showMessage({message : '500'+cmd, header : '1361'});
            }
        },
        error: function(data){
            showMessage({message : '500', header : '1365'});
        }
    });
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


function toggleHiddenObject(inputClass, myType)
{
    //$('.'+inputClass).toggle();
    var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');  
    if(displayString) {
        var displayObject = JSON.parse(unescape(displayString));
        //console.log(inputClass+','+myType + ',' + displayObject[myType]);

        if(displayObject[myType]=='none') {
            displayObject[myType] = 'block';
            $(inputClass).closest('.csc-default').css('opacity', '0.5');
            $(inputClass).closest('.csc-default').css('-ms-filter', 'alpha(opacity=50)');

            $(inputClass).closest('.csc-default').css('display','block');
            $('#'+myType).css('display','inline-block');
        } else {
            displayObject[myType] = 'none';
            $(inputClass).closest('.csc-default').css('display','none');
            $('#'+myType).css('display','none');
        }
        feeditSimpleSetCookie('feeditSimple-usersettings', JSON.stringify(displayObject),0);
    }
}


function changeImageOrientation(cmd, uid, okMessage)
{
    console.log(cmd + uid);
    
    try {
        var outerContainer = $('#c'+uid);
        var innerContainer = $(outerContainer).find('.lth_feeditsimple_img');
        $.get('/typo3conf/ext/lth_feedit_simple/res/template/contentelement.html', function( response ) {
            //console.log($(parentElement).find('.csc-textpicHeader'));
            if(innerContainer.find('.csc-textpicHeader').length > 0) {
                var header = $(innerContainer).find('.csc-textpicHeader').text();
            } else if(innerContainer.prev('h2').length > 0) {
                var header = $(innerContainer).prev('h2').text();
            }
            
            //Replace content in template
            var image = $(innerContainer).find('.csc-textpic-image').html();
            var content = $(innerContainer).find('.lth_feeditsimple_content').html();
            var responseContent = $(response).filter("#"+cmd).html();
            responseContent = responseContent.replace('###IMAGE###', image);
            responseContent = responseContent.replace('###CONTENT###', content);
            console.log(responseContent);
            responseContent = responseContent.replace('lth_feeditsimple_###UID###', 'lth_feeditsimple_' + uid);
            console.log(responseContent);
 
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
            //replace the content
            $(innerContainer).html(responseContent);
            //restore editable
            makeEditable('#lth_feeditsimple_'+ uid, 'textpic', '');
            makeEditable('#lth_feeditsimple_'+ uid, 'image', '');
            showMessage(okMessage);
        });
    }
    catch(err) {
        //console.log(err);
        showMessage({'header' : '500', 'message': err});
    }
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