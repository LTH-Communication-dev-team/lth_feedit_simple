$(document).ready(function () {
        
    $('.csc-textpic-text').children().unwrap();

    makeEditable('.csc-default.textpic, .csc-default.text');

    /*var el = document.getElementById('feEditSimple-contentTypeToolbar');
    var sortable = Sortable.create(el, {
        group: {
            name: 'feEditSimpleContentElements',
            pull: 'clone'
        },
        animation: 100
    });*/
    //makeSortable(document.getElementById('feEditSimple-contentTypeToolbar'));
    makeSortable(document.getElementById('feEditSimple-normalColWrapper'), 'connectedSortable');
    if($('#feEditSimple-rightColWrapper').length > 0) {
        makeSortable(document.getElementById('feEditSimple-rightColWrapper'), 'connectedSortable');
    }

    //move data from c... to note-editor...
    $('.note-editor').each(function () {
        $(this).attr('id', 'note-editor-' + $(this).prev().attr('id').replace('c', ''));
        $(this).attr('class', 'note-editor ' + $(this).prev().attr('class').replace('csc-default ', ''));
        $(this).attr('data-imageorient', $(this).prev().attr('data-imageorient'));
    });

    $('#lth_feedit_simple-saveChanges').click(function () {
        saveChanges();
    });

    $('.note-link-text').parent().hide();
    $('.note-link-url').parent().css('position','relative');
    $('.note-link-url').after('<button title="Files and images" type="button" style="position:absolute;top:30px;left:420px;" class="btn editable-filemanager" \
        data-toggle="modal" data-backdrop="static" href="#feeditSimple-modalBox">\
        <i class="icon-folder-open"></i></button>\
        '
    );

    var tmpArray = [];
    $('.note-editor .csc-textpic-image img').each(function() {
        $(this).click(function () {
            imageClick(this);
        });
        var tmpData = $(this).closest('.note-editor').attr('data-orgimages');
        if(tmpData) {
            tmpData += ',';
            tmpData += $(this).attr('id');
        } else {
            tmpData = $(this).attr('id');
        }
        $(this).closest('.note-editor').attr('data-orgimages', tmpData);
        $(this).attr('width','');
        $(this).attr('h','');
        $(this).attr('data-id',$(this).attr('id'));
    });
    $('#imagesFromStart').val(tmpArray.join(','));
    //$modal.on('show', function () { ... }

    $("#feeditSimple-modalBox").on('shown.bs.modal', function (e) {
        if($('.note-link-url').is(':visible')) {
            $(this).find("li[data-type='page']").css('display','block');
        } else {
            $(this).find("li[data-type='page']").css('display','none');
        }
    });
    
    $("#feeditSimple-modalBox").on('show.bs.modal', function (e) {
            
        if ($('#feeditSimple-jstree').length === 0) {
            $(this).find('.modal-body').append('<input type="text" value="" style="box-shadow:inset 0 0 4px #eee; width:120px; margin:0; padding:6px 12px; border-radius:4px; border:1px solid silver; font-size:1.1em;" id="jstree_q" placeholder="Search" />\
                <div style="padding:15px;" id="container" role="main">\
                <div id="feeditSimple-jstree"></div>\
                <div id="data">\
                    <div class="content code" style="display:none;"><textarea id="code" readonly="readonly"></textarea></div>\
                    <div class="content folder" style="display:none;"></div>\
                    <div class="content image" style="display:none; position:relative;">\
                    <img src="" alt="" style="display:block; position:absolute; left:50%; top:50%; padding:0; max-height:90%; max-width:90%;" /></div>\
                </div>\
            </div>');
            //$(this).find('.modal-body').prepend('<ul><li><a href="#"><i class="jstree-icon jstree-themeicon" role="presentation"></i>Web pages</a></li></ul>');
            $(this).find('.modal-header').append('<h3>Link browser</h3>');
            
            $(this).find('.modal-body-right').append('<label>Upload files</label><ul><li>Choose a folder in the list to the left click the button below to select a file to upload</li></ul><span class="btn btn-success fileinput-button disabled">\
                    <i class="glyphicon glyphicon-plus"></i>\
                    <span>' + lth_feedit_simple_messages.select_files + '</span>\
                    <input id="jstree-fileupload" type="file" name="files[]" multiple />\
                </span>\
                <br>\
                <br>\
                <div id="progress" class="progress">\
                    <div class="progress-bar progress-bar-success"></div>\
                </div>');
            
            /*$(this).find('.modal-body').css({
                width: '400px', //probably not needed
                height: '400px' //probably not needed 
            });*/
            
            //jstree($('#modalType').val());
            jstree();
        }
    });

    $('#feeditSimple-userSettingsButton').panelslider({
        side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function () {
            $.ajax({
                type: "POST",
                url: 'index.php',
                dataType: 'json',
                data: {
                    eID: 'lth_feedit_simple',
                    cmd: 'getUserSettings',
                    sid: Math.random()
                },
                success: function (data) {
                    $('.panel-body').load("/typo3conf/ext/lth_feedit_simple/res/template/usersettings.html", function () {
                        $('.panel-header').html('<h1>' + lth_feedit_simple_messages.user_settings + '</h1>');
                        //console.log(data.lang + ';' + data.recursiveDelete + ';' + data.copyLevels);
                        if (data.copyLevels > 10) {
                            data.copyLevels = 10;
                        }
                        $('#lang').val(data.lang);
                        $('#recursiveDelete').prop('checked', data.recursiveDelete);
                        $('#copyLevels').val(data.copyLevels);
                        $('#userSettings .btn').click(function () {
                            saveUserSettings($('#lang').val(), $('#recursiveDelete').prop('checked'), $('#copyLevels').val());
                        });
                    });
                }
            });

        },
        easingOpen: null,
        easingClose: null
    });

    $('#feeditSimple-helpButton').click(function(){
        /*side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function () {
            $('.panel-header').html('<h1>Help</h1>');
            $('.panel-body').load("/typo3conf/ext/lth_feedit_simple/res/template/help.html #tjo");
        },
        easingOpen: null,
        easingClose: null*/
        $("#feeditSimple-modalBox-2").modal({
                persist: true,
                onClose: function (dialog) {
                    dialog.container.fadeOut('slow', function () {
                        $.modal.close();
                    });
                }
        });
        
        $("#feeditSimple-modalBox-2").on('shown.bs.modal', function () {

            $('#feeditSimple-modalBox-2 .modal-body').load( "/typo3conf/ext/lth_feedit_simple/res/template/help.html #lth_feeditsimple_help_container", function() {
                
                $('#feeditSimple-modalBox-2 .modal-body .help_start').show();
                $('#feeditSimple-modalBox-2 .modal-body a').click(function(){
                    $('#feeditSimple-modalBox-2 .modal-body .lth_feeditsimple_hidden').hide(200);
                    $('#feeditSimple-modalBox-2 .modal-body .' + $(this).attr('class')).show(200);
                });
                $('#feeditSimple-modalBox-2 .modal-header').append($('#feeditSimple-modalBox-2 .modal-body .help_header'));
                $('#feeditSimple-modalBox-2 .modal-footer').hide();
            });
        });
    });

    $('#feeditSimple-editPageButton').panelslider({
        side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function () {
            $('.panel-header').html('<h1>Edit page properties</h1>');
            var url = '';
            var pid = $('body').attr('id');
            if (pid === 'new') {
                url = '/typo3/alt_doc.php?edit[pages][' + pid + ']=new';
            } else {
                url = '/typo3/alt_doc.php?edit[pages][' + pid + ']=edit';
            }
            var formToken, title, subtitle, nav_title = '';

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                complete: function (data) {
                    formToken = $(data.responseText).find('input[name="formToken"]').val();
                    title = $(data.responseText).find('input[name="data[pages][' + pid + '][title]"]').val();
                    subtitle = $(data.responseText).find('input[name="data[pages][' + pid + '][subtitle]"]').val();
                    nav_title = $(data.responseText).find('input[name="data[pages][' + pid + '][nav_title]"]').val();
                    $('.panel-header').append('<input type="hidden" name="formToken" value="' + formToken + '" />');
                    $('.panel-body').load("/typo3conf/ext/lth_feedit_simple/res/template/formelement.html?sid=" + Math.random() + " #editPage", function () {
                        $('#inputTitle').val(title);
                        $('#inputSubTitle').val(subtitle);
                        $('#inputNavTitle').val(nav_title);
                        $('#close-panel-bt').click(function () {
                            $.panelslider.close();
                        });
                        $('#save-panel-bt').click(function () {
                            savePageProperties();
                        });
                    });
                }
            });
        },
        easingOpen: null,
        easingClose: null
    });

    
    if($('#feEditSimple-normalColWrapper .csc-default').length == 0) {
        addNoContent('#feEditSimple-normalColWrapper');
    } else {
        //enable bootstrap-contextmenu
        enableContextMenu('.note-editor');
    }

    $('#feeditSimple-toggleHiddenElement').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': lth_feedit_simple_messages.display_hidden_elements_changed};
        toggleHiddenObject('.note-editor.feEditSimple-hidden-1', 'hiddenElement', okMessage);
    });

    $('#feeditSimple-toggleHiddenInMenu').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': lth_feedit_simple_messages.display_hidden_in_menu_changed};
        toggleHiddenObject('.feEditSimple-hiddenInMenu-1', 'hiddenInMenu', okMessage)
    });

    $('#feeditSimple-toggleHiddenPage').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': lth_feedit_simple_messages.display_hidden_pages_changed};
        toggleHiddenObject('.feEditSimple-hiddenPage-1', 'hiddenPage', okMessage);
    });

    
    if($('.Tx-Formhandler').length > 0) {
            $('#feeditSimple-formHandler').click(function () {
                ajaxCall('getFormHandler', '', '', '', $('body').attr('id'), '', '');
            });
        } else {
            $('#feeditSimple-formHandler').prop('disabled', true);
            $('#feeditSimple-formHandler').css('opacity', '0.5');
        }
        
    $('#feeditSimple-addRightColumn').click(function () {
        if($('#feEditSimple-rightColWrapper').length > 0) {
            alert(lth_feedit_simple_messages.there_is_already_a_right_column);
        } else {
            $('#text_wrapper').removeClass('grid-23').addClass('grid-15');
            $('#text_wrapper').after('<div id="content_sidebar_wrapper" class="grid-8 omega">\
            <div id="content_sidebar">\
            <div class="connectedSortable" id="feEditSimple-rightColWrapper">\
            </div>\
            </div>\
            </div>\
            </div>');
            var tempIndex = addNoContent('#feEditSimple-rightColWrapper');
            enableContextMenu(tempIndex);
        }
    });    

    //hide och show hidden content elements at startup
    var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');
    if (displayString) {
        var displayObject = JSON.parse(unescape(displayString));
        if (displayObject['hiddenElement'] === 'none') {
            $('.note-editor.feEditSimple-hidden-1').hide();
        }
        if (displayObject['hiddenInMenu'] === 'none') {
            $('.feEditSimple-hiddenInMenu-1').hide();
        } else {
            $('.feEditSimple-hiddenInMenu-1 a').append('<span class="icon-eye-close"></span>');
        }
        if (displayObject['hiddenPage'] === 'none') {
            $('.feEditSimple-hiddenPage-1').hide();
        } else {
            $('.feEditSimple-hiddenPage-1 a').append('<span class="icon-ban-circle"></span>');
        }
    }

    //
    $('.note-link-btn').prop('disabled', true);
    $('.note-link-btn').addClass('disabled');
    $('.fancybox-enlarge img').unwrap();
    //$('.fancybox-enlarge').removeClass('fancybox-enlarge');
    $('.link-dialog').prependTo('body');
    $('.link-dialog').attr('data-backdrop','static').attr('role','dialog');
        //$('.link-dialog .note-link-text').parent().hide();
    $('.link-dialog .modal-body').prepend('<ul>\
        <li>To make an external link: Type the whole url including http:// (e.g. http://www.kth.se/)</li>\
        <li>To make a mail link: Type the emailaddress (e.g. webmaster@lth.se)</li>\
        <li>To make an internal link to a page or a file: Click the folder button to the rigt of the link-field below</li>\
    </ul>');

    cancelRightClick();

    //Document ready ends********************************************************************************************************************
});


function cancelRightClick()
{
    //console.log('???');
    $('.csc-textpic-imagewrap img').mousedown(function(e) {
        if( e.button == 2 ) {
          //$('.note-image-popover').hide();
          //console.log(e);
          return false; 
        } 
        return true; 
    });
    $( ".csc-textpic-imagewrap img" ).contextmenu(function(e) {
        //console.log(e.button);
        if( e.button == 2 ) {
            return false;
        }
    });
}


function addNoContent(selector)
{
    var index = $('.note-editor-temp').length;
    $(selector).prepend('<div id="note-editor-temp-'+index+'" class="note-editor-temp"><a href="javascript:" onclick="feeditSimpleContentCommand(\'Text and images\',\'temp-'+index+'\');">Click here to insert content</a></div>');
    return 'note-editor-temp-'+index;
}


function imageClick(that)
{
    $('#chosenImage').attr('data-id', $(that).attr('id'));
    $('#chosenImage').attr('data-src', $(that).attr('src'));
    $('#chosenImage').css('width', $(that).css('width'));
    $('#chosenImage').css('height', $(that).css('height'));
    $('#chosenImage').attr('data-pid', $(that).closest('.note-editor').attr('id').split('-').pop());


    $('.imgSlider').bootstrapSlider({'value':parseInt($(that).css('width'))});
    $('.imgSlider').on("slide", function(slideEvt) {
        //console.log(slideEvt);
        
        var chosenImageSrc = $('#chosenImage').attr('data-src');
        var chosenImageRatio = $('#chosenImage').height() / $('#chosenImage').width();
        var chosenImageId = $('#chosenImage').attr('data-id');
        //console.log($("img[data-type='"+chosenImageId+"']"));
        $("img[data-id='"+chosenImageId+"']").css('width', slideEvt.value);
        $("img[data-id='"+chosenImageId+"']").css('height', chosenImageRatio * slideEvt.value);
    });
}


function uploadFile(dir)
{
    var url = 'typo3conf/ext/lth_feedit_simple/vendor/jqueryfileupload/server/php/';
    $('#jstree-fileupload').fileupload({
        url: url,
        //dataType: 'json',
        autoUpload: true,
        formData: [{ name: 'custom_dir', value: '/fileadmin' + dir + '/' }],
        done: function (e, data) {
            $.each(data.files, function (index, file) {
                $.ajax({
                    url: 'index.php',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        eID: 'lth_feedit_simple',
                        cmd: 'addFileToStorage',
                        contentToPaste: 'fileadmin' + dir + '/' + file.name,
                        sid: Math.random()
                    },
                    success: function (data) {
                        $("#feeditSimple-jstree").jstree(true).create_node('\\'+dir, {"id":"/"+file.name,"text":file.name});
                        $("#feeditSimple-jstree").jstree(true).open_node("#\\"+dir);
                        $('#feeditSimple-jstree').jstree(true).refresh();
                    }
                });
                
            });
            
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }
    }).prop('disabled', !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : 'disabled');
}


function saveUserSettings(lang, recursiveDelete, copyLevels)
{
    //console.log(lang + ';' +  recursiveDelete + ';' + copyLevels);
    var contentToPaste = [lang, recursiveDelete, copyLevels];
    $.ajax({
        url: 'index.php',
        type: 'post',
        dataType: 'json',
        data: {
            eID: 'lth_feedit_simple',
            cmd: 'saveUserSettings',
            contentToPaste: JSON.stringify(contentToPaste),
            sid: Math.random()
        },
        success: function (data) {
            var okMessage = {'header': 'Save', 'message': 'User settings successfully saved'};
            showMessage(okMessage);
        }
    });
}


function makeEditable(selector)
{
    //console.log(selector);
    $(selector).summernote({
        airMode: true,
        height: 200,
        disableDragAndDrop: true,
        disableResizeImage: true,
        disableResizeEditor: true,
        popover: {
            image: [
                ['remove', ['removeMedia']],
                ['changeImage', ['changeImage']],
                ['changeImageSize', ['changeImageSize']],
                ['moveImageUp', ['moveImageUp']],
                ['moveImageDown', ['moveImageDown']],
                ['link', ['linkDialogShow', 'unlink']]
            ],
            link: [
                ['link', ['linkDialogShow', 'unlink']]
            ],
            air: [
                ['style', ['style']],
                ['font', ['bold', 'clear']],
                ['para', ['ul', 'ol', 'paragraph']],
                //['table', ['table']],
                ['insert', ['link']]
            ]
        },
        styleTags: ['normal','h2','h3','pre']
    }).on('summernote.change', function (customEvent, contents, $editable) {
        addId($(this).attr('id'), '');
    }).on('summernote.editor.media.delete', function (target, editable) {
        addId(editable[0].id, 'deleteImg');
    });
    
    $('.imgSlider').unwrap();
    
    var chosenImageSrc = $('#chosenImage').attr('data-src');
    var chosenImageWidth = $('img[src="' + chosenImageSrc + '"]').css('width');
}


function getImageWidthHeight(factor)
{
    //console.log(((parseInt(factor) / 100)));
    var chosenImageWidth = parseInt($('#chosenImage').css('width')) * ((parseInt(factor) / 100));
    var chosenImageHeight = parseInt($('#chosenImage').css('height')) * ((parseInt(factor) / 100));
    if(chosenImageWidth < 1) {
        chosenImageWidth = 1;
    }
    if(chosenImageHeight < 1) {
        chosenImageHeight = 1;
    }
    //console.log(Math.round(chosenImageWidth));
    return Array(Math.round(chosenImageWidth), Math.round(chosenImageHeight));
}


function sendFile(file, editor, welEditable)
{
    /*data = new FormData();
     data.append("file", file);
     $.ajax({
     data: data,
     type: "POST",
     url: "Your URL POST (php)",
     cache: false,
     contentType: false,
     processData: false,
     success: function(url) {
     editor.insertImage(welEditable, url);
     }
     });*/
    console.log('????');
}


function makeSortable(selector, group)
{
    sortable = Sortable.create(selector, {
        group: group,
        animation: 100,
        delay: 300,
        onEnd: function (evt) {
            //var itemEl = ;  // dragged HTMLElement
            var pid;
            var pageUid;
            var okMessage = {'header': 'Move', 'message': 'Content element successfully moved'};

            var listItem = document.getElementById(evt.item.id);
            var listIndex = $('#' + evt.item.id).parent().find('.note-editor').index(listItem);

            if (listIndex == 0) {
                // Sorting number is in the top
                pid = $('body').attr('id');
                pageUid = pid;
            } else {
                // Sorting number is inside the list
                pid = '-' + $('#' + evt.item.id).parent().find('.note-editor').eq((listIndex - 1)).attr('id').replace('note-editor-', '');
                pageUid = $('body').attr('id');
            }
            ajaxCall('moveContent', 'tt_content', evt.item.id.split('-').pop(), pid, pageUid, okMessage);
        },
        // Element is dropped into the list from another list
        onAdd: function (evt) {
            var colId = $('#' + selector).closest('.connectedSortable').attr('id');
            
            if($('#feEditSimple-normalColWrapper .note-editor').length == 0) {
                addNoContent('#feEditSimple-normalColWrapper');
            } 
            
            if($('#feEditSimple-rightColWrapper .note-editor').length == 0) {
                addNoContent('#feEditSimple-rightColWrapper');
            } 
        }
    });
}


function saveChanges()
{
    var saveIdsArray = $('#lth_feedit_simple-saveIds').val().split(',');
    //var deleteIdsArray = $('#lth_feedit_simple-deleteIds').val().split(',');

    $(saveIdsArray).each(function (i, el) {
        //console.log(el);
        var id, extraUrl, pos, url, pid;
        var pid = $('body').attr('id');
        var colId = $('#note-editor-' + el).closest('.connectedSortable').attr('id');
        var colPos = getColpos(colId);
        var formToken;
        var extraUrl = '';

        var imageorientId = $('#note-editor-' + el).attr('data-imageorient');

        if (el == 'new') {
            pos = pid;
            if ($('#' + el).prevAll('.note-editor')) {
                if($('#' + el).prevAll('.note-editor:first').attr('id')) {
                    pid = '-' + $('#' + el).prevAll('.note-editor:first').attr('id').replace('note-editor-', '');
                }
            }
            url = '/typo3/alt_doc.php?edit[tt_content][' + pid + ']=new';
            extraUrl = '&returnNewPageId=1';
            id = 'new';
        } else {
            id = el;
            url = '/typo3/alt_doc.php?edit[tt_content][' + el + ']=edit';
        }

        var params = {};
        var imgIdList = [];

        var imgId, imgWidth, imgHeight, uid_local, imgHref;
        $('#note-editor-' + id).find('.csc-textpic-imagewrap img').each(function (i, el) {
            imgId = $(this).attr('id');
            imgWidth = $(this).css('width');
            imgHeight = $(this).css('height');
            uid_local = $(this).attr('data-uid_local');
            if($(this).parent().attr("href")) imgHref = $(this).parent().attr("href").split('?id=').pop();
            if (imgId.indexOf('new') > 0) {
                imgId = 'NEW' + uniqid();
                //params["cmd[sys_file_reference][" + $('#chosenimage').attr('oldId') + "][delete]"] = 1;
            }

            params["data[sys_file_reference][" + imgId + "][uid_local]"] = 'sys_file_' + uid_local;
            params["data[sys_file_reference][" + imgId + "][uid_local]_list"] = 'sys_file_' + uid_local;
            params["data[sys_file_reference][" + imgId + "][pid]"] = pid;
            params["data[sys_file_reference][" + imgId + "][imagewidth]_hr"] = imgWidth;
            params["data[sys_file_reference][" + imgId + "][imageheight]_hr"] = imgHeight;
            params["uc[inlineView][tt_content][" + id + "][sys_file_reference][" + imgId + "]"] = 1;
            params["data[sys_file_reference][" + imgId + "][link]_hr"] = imgHref;
            params["data[sys_file_reference][" + imgId + "][link]"] = imgHref;
            imgIdList.push(imgId);
        });
        
        var imagesFromStartList = $('#note-editor-'+el).attr('data-orgimages');
        if(imagesFromStartList) {
            var deleteIdsArray = $(imagesFromStartList.split(',')).not(imgIdList).get();
            $(deleteIdsArray).each(function (i, el1) {
                //console.log(el1);
                if(el1) {
                   params["cmd[sys_file_reference][" + el1 + "][delete]"] = 1;
                }
            });
            deleteIdsArray = [];
        }

        $.ajax({
            url: url,
            type: 'post',
            dataType: 'json',
            complete: function (data) {
                formToken = $(data.responseText).find('input[name="formToken"]').val();

                //params['cmd'] = "edit";
                params["data[tt_content][" + id + "][imageorient]"] = imageorientId;

                params["data[tt_content][" + id + "][colPos]"] = colPos;
                params["data[tt_content][" + id + "][pid]"] = pid;
                //params["data[tt_content]["+id+"][header]"] = $('#feeditsimple-elHeader').val();
                params["data[tt_content][" + id + "][CType]"] = 'textpic';
                params["data[tt_content][" + id + "][_TRANSFORM_bodytext]"] = 'RTE';
                var bodytext = $('#note-editor-' + id).find('.lth_feeditsimple_content').html();
                bodytext = bodytext.replace(/<p>&nbsp;<\/p>/gi,'').replace(/<p><\/p>/gi, '').replace(/\n+/g, '\n').replace(/<b><b>/gi, '<b>').replace(/<\/b><\/b>/gi, '</b>');
                //<link 1524 - internal-link "Opens internal link in current window">
                params["data[tt_content][" + id + "][bodytext]"] = bodytext;
                
                if ($('#note-editor-' + id).find('.csc-textpic-imagewrap').length > 0) {
                    params["data[tt_content][" + id + "][image]"] = imgIdList.join();
                }
                params["formToken"] = formToken;
                //console.log(params);
                $.ajax({
                    url: url + '&doSave=1' + extraUrl,
                    type: 'post',
                    dataType: 'json',
                    data: params,
                    complete: function (data) {
                        $('#lth_feedit_simple-saveChanges').prop('disabled', true);
                        var okMessage = {'header': 'Save', 'message': 'Content successfully saved'};
                        showMessage(okMessage);
                        if (id=='new') {
                            var newId = data.responseText.split(']=edit&amp;doSave=1').shift().split('="/typo3/alt_doc.php?&amp;edit[tt_content][').pop();
                            $('#new').attr('id', 'c' + newId);
                            //$('#note-editor-new').attr('data-imageorient', $(this).prev().attr('data-imageorient'));
                            $('#note-editor-new').attr('id', 'note-editor-' + newId);
                            enableContextMenu('#note-editor-' + newId);
                        }
                    }
                });
            }
        });
    });
    $('#lth_feedit_simple-saveIds').val();
}


function addId(id, type)
{
    //console.log(id + ';' + type);
    var tempVal;
    $('#lth_feedit_simple-saveChanges').prop('disabled', false);
    if (type === 'deleteImg') {
        tempVal = $('#lth_feedit_simple-deleteIds').val() + ',' + id.replace('c','');
        $('#lth_feedit_simple-deleteIds').val(array_unique(tempVal.split(',')).join(','));
    } else {
        tempVal = $('#lth_feedit_simple-saveIds').val() + ',' + id.replace('c','');
        $('#lth_feedit_simple-saveIds').val(array_unique(tempVal.split(',')).join(','));
    }
}


function array_unique(list)
{
    var result = [];
    $.each(list, function (i, e) {
        if ($.inArray(e, result) == -1 && e != '')
            result.push(e);
    });
    return result;
}


function jstree()
{
    if($('.note-link-url').is(':visible')) {
            $(this).find("li[data-type='page']").css('display','block');
        }
    //console.log(modalType);
    var to = false;
    $('#jstree_q').keyup(function () {
        if (to) {
            clearTimeout(to);
        }
        to = setTimeout(function () {
            var v = $('#jstree_q').val();
            $('#feeditSimple-jstree').jstree(true).search(v);
        }, 250);
    });

    $('#feeditSimple-jstree').jstree({
        "core": {
            "animation": 0,
            "check_callback": true,
            "themes": {"stripes": true},
            'data': {
                'url': 'index.php?eID=lth_feedit_simple&cmd=getFiles&pageUid=' + $('body').attr('id') + '&sid=' + Math.random(),
                //'url' : 'typo3conf/ext/lth_feedit_simple/vendor/jstree/demo/basic/roorjstree_1.json',
                'data': function (node) {
                    return {'id': node.id};
                }
            }
        },
        "types": {
            "#": {
                "max_children": 100,
                "max_depth": 10,
                "valid_children": ["root"]
            },
            "root": {
                //"icon": "glyphicon glyphicon-file",
                "icon": "glyphicon-folder-close",
                "valid_children": []
            },
            "default": {
                "valid_children": []
            },
            "file": {
                "valid_children": []
            },
            "page": {
                "icon": "/typo3conf/ext/lth_feedit_simple/res/icons/globe.png",
                "valid_children": []
            }
        },
        "plugins": [
            "search", "types", "wholerow" //"state", 
        ]
    }).on('ready.jstree', function (e, data) {
        $(document).on('click', "a.jstree-anchor", function() {
            //$('.jstree-anchor').on('click', 'a', function (e) { //.click(function (e, data) {
            var oldSrc = $('#chosenImage').attr('data-src');
            var pid = $('#chosenImage').attr('data-pid');
            if (!$('.note-link-url').is(':visible')) {
                if(!$(this).parent().hasClass('jstree-leaf')) {
                    $('.fileinput-button').removeClass('disabled');
                } else {
                    //console.log(chosenImage);
                    $('.note-image-popover').hide();
                    addId(pid);
                    //     /test/screencast.jpg_anchor
                    var newSrc = $(this).attr('id').replace('_anchor', '');

                    $('img[src="' + oldSrc + '"]').attr('src', 'fileadmin'+newSrc);

                    $("#feeditSimple-modalBox").modal('hide');

                    $.ajax({
                        url: 'index.php',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            eID: 'lth_feedit_simple',
                            cmd: 'getSysFileId',
                            uid: newSrc,
                            sid: Math.random(),
                        },
                        success: function (data) {
                            //console.log($('img[src="'+newSrc+'"]'));
                            var newId = uniqid() + 'new';
                            $('img[src="fileadmin' + newSrc + '"]').attr('id', newId);
                            $('img[src="fileadmin' + newSrc + '"]').attr('data-uid_local', data.uid);
                            $('img[src="fileadmin' + newSrc + '"]').attr('data-id', newId);
                        },
                        error: function (data) {
                            alert('Something went wrong');
                        }
                    });
                }
            } else {
                if(!$(this).parent().hasClass('jstree-leaf') && $(this).html().indexOf('globe.png') < 0) {
                    $('.fileinput-button').removeClass('disabled');
                } else {
                    //console.log(window.location.host);[data-role="header"]'
                    addId(pid);
                    if($(this).parent("li[data-type='page']").length > 0) {
                        $(".note-link-url").val('http://' + window.location.host + '/?id=' + $(this).attr('id').replace('_anchor', ''));
                    } else {
                        $(".note-link-url").val('fileadmin/' + $(this).attr('id').replace('_anchor', '').replace('/',''));
                    }
                    $('.note-link-btn').prop('disabled', false);
                    $('.note-link-btn').removeClass('disabled');
                    $("#feeditSimple-modalBox").modal('hide');
                }
            }

        });
        $('#jstree-fileupload').click(function() {
            if($("#feeditSimple-jstree").jstree("get_selected").length == 0) {
                return false;
            } else {
                uploadFile($("#feeditSimple-jstree").jstree("get_selected"));
            }
        });
    });
}


//display message to user
function showMessage(message)
{
    if (message['header'] == 'warning') {
        var content = '<div class="typo3-message message-warning" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">Warning</div></div>';
        content += '<div class="message-body">' + message['message'] + '</div></div>';
    } else if (message['header'] == 'error') {
        var content = '<div class="typo3-message message-error" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">Error</div></div>';
        content += '<div class="message-body">' + message['message'] + '</div></div>';
    } else {
        var content = '<div class="typo3-message message-ok" style="width: 400px">';
        content += '<div onclick="hideMessage(\'.typo3-message\');return false;" class="t3-icon t3-icon-actions t3-icon-actions-message t3-icon-actions-message-close t3-icon-message-ok-close" id=""></div>';
        content += '<div class="header-container"><div class="message-header">' + message['header'] + '</div></div>';
        content += '<div class="message-body">' + message['message'] + '</div></div>';
    }
    $('.feEditSimple-fourthRow').html(content);
    $('.feEditSimple-fourthRow').slideDown('slow').delay(1500).slideUp('slow');
}


function getColpos(columnId)
{
    var columnType = columnId.split('-').pop();
    var colPos = '0';
    switch (columnType) {
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


function feeditSimpleGetCookie(cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) != -1)
            return c.substring(name.length, c.length);
    }
    return "";
}


function feeditSimpleSetCookie(name, value, expires, domain, secure)
{
    try {
        if (expires) {
            var d = new Date();
            var n = d.getTimezoneOffset();
            d.setTime(d.getTime() + (Math.abs(n) * 60 * 1000) + (60 * 60 * 100));
        }
        var cookieStr = name + "=" + value;
        if (expires) {
            cookieStr += "; expires=" + d.toGMTString();
        }
        cookieStr += "; path=/";
        if (domain) {
            cookieStr += "; domain=" + domain;
        }
        ;
        if (secure) {
            cookieStr += "; secure";
        }
        document.cookie = cookieStr;
        return true;
    } catch (e) {
        return false;
    }
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
    var templateArray = {'textpic': '<div id="new" class="csc-default" title="">\
        <div contentEditable=true class="lth_feeditsimple_content" data-text="Enter text here: Please save the element to insert images etc"></div>\
        </div>'
    };
    var CType;

    if(rel.indexOf('=') > 0) {
        CType = getCtype(rel);
    } else {
        CType = rel;
    }
    //console.log(CType);
    if (CType) {
        return templateArray[CType];
    } else {
        return false;
    }
}


function enableContextMenu(selector)
{
    //console.log(selector);
    var hideTest = '0';
    var showTest = '0';
    $.contextMenu({
        selector: selector, 
        callback: function(key, options) {
            //var m = "clicked: " + key;
            //window.console && console.log(m) || alert(m);
            var keyArray = key.split('_');
            var uid = $(this).attr('id').replace('note-editor-','');
            //var imageOrientationId = $(this).attr('data-imageorient');
            feeditSimpleContentCommand(keyArray[0], uid, keyArray[1]);
        },
        items: {
            "new_content": {
                "name": "New content element after this",
                "icon": "add",
                "items": {
                    "Text and images": {"name": "Text and images"}
                },
                "disabled": function(){ return $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }
            },
            "Insert image_": {"name": "Insert image", "disabled": function(){ return $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }},
            /*"Cut": {"name": "Cut"},
            "Copy": {"name": "Copy"},
            "Paste": {"name": "Paste"},*/
            "Hide": {"name": "Hide","disabled": function(){ return $(this).hasClass('feEditSimple-hidden-1') || $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }},
            "Show": {"name": "Show","disabled": function(){ return $(this).hasClass('feEditSimple-hidden-0') || $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }},
            "Delete": {"name": "Delete", "icon": "delete", "disabled": function(){ return $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }},
            "image_orientation": {
                "name": "Image orientation",
                "items": {
                    "Above, center_0": {"name": "Above, center"},
                    "Above, right_1": {"name": "Above, right"},
                    "Above, left_2": {"name": "Above, left"},
                    "Below, center_8": {"name": "Below, center"},
                    "Below, right_9": {"name": "Below, right"},
                    "Below, left_10": {"name": "Below, left"},
                    "In text, right_17": {"name": "In text, right"},
                    "In text, left_18": {"name": "In text, left"},
                    "Beside Text, Right_25": {"name": "Beside Text, Right"},
                    "Beside Text, Left_26": {"name": "Beside Text, Left"}
                },
                "disabled": function(){ return $(this).closest('.note-editor').attr('id').split('-').pop() == 'new'; }
            },
        }
    });
}


function feeditSimpleContentCommand(cmd, uid, imageOrientationId)
{
    //var cmd = $(e.target).text();
    
    //var uid = context.attr('id').split('-').pop();
    var pageUid = $('body').attr('id');
    //console.log(cmd+uid+pageUid);
    var colId = $('#note-editor-' + uid).closest('.connectedSortable').attr('id');

    switch (cmd) {
        case 'Delete':
            if (confirm('Are you sure?') && uid != 'new') {
                var okMessage = {'header': 'Delete', 'message': 'Content element successfully deleted'};
                $('#note-editor-' + uid).remove();
                $('#c' + uid).remove();
                ajaxCall('deleteContent', 'tt_content', uid, '', '', okMessage, colId);
            } else {
                return false;
            }
            break;
        case 'Cut':
            if (feeditSimpleSetCookie('feeditSimple-copycutitem', 'cut:tt_content:' + uid, 1)) {
                var content = $('#c' + uid)[0].outerHTML;
                $('#note-editor-' + uid).remove();
                $('#c' + uid).remove();
                var okMessage = {'header': 'Cut', 'message': 'Content element successfully cut'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header': '500', 'message': 'no'});
            }
            break;
        case 'Copy':
            if (feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:tt_content:' + uid, 1)) {
                var content = $('#c' + uid).outerHTML;
                var okMessage = {'header': 'Copy', 'message': 'Content element successfully copied'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header': '500', 'message': 'no'});
            }
            break;
        case 'Paste':
            var pasteContent = feeditSimpleGetCookie('feeditSimple-copycutitem');
            if (pasteContent) {
                var okMessage = {'header': 'Paste', 'message': 'Content element successfully pasted'};
                ajaxCall('pasteContent', 'tt_content', pasteContent, uid, pageUid, okMessage);
            } else {
                showMessage({'header': '500', 'message': 'no'});
            }
            break;
        case 'Hide':
            var okMessage = {'header': 'Hide', 'message': 'Content element successfully hidden'};
            ajaxCall('hideContent', 'tt_content', uid, '', '', okMessage);
            break;
        case 'Show':
            var okMessage = {'header': 'Show', 'message': 'Content element successfully displayed'};
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
            if($('#note-editor-' + uid).find('.csc-textpic-imagewrap').length > 0) {
                //changeImageOrientation(cmd.toLowerCase().replace(', ', '-').replace(' ', '-'), uid, imageOrientationId);
                var okMessage = {'header': 'Image', 'message': 'Image successfully replaces'};
                insertImage(uid, 'replace', imageOrientationId);
            } else {
                alert('No image!');
            }
            break;
        case 'Insert image':
            var okMessage = {'header': 'Image', 'message': 'Image successfully inserted'};
            insertImage(uid, 'new', imageOrientationId);
            break;
         case 'Text and images':
            var okMessage = {'header': 'Image', 'message': 'Content element successfully inserted'};
            var template = getContentTemplate('textpic');

            var okMessage = {'header': 'New element', 'message': 'Content element successfully created'};
                        
            $('#note-editor-'+uid).after(template);
            makeEditable('#new');
            enableContextMenu('#note-editor-new');
            $('#new').next().attr('id', 'note-editor-new');
            makeSortable(document.getElementById('feEditSimple-normalColWrapper'), 'connectedSortable');
            if($('#feEditSimple-rightColWrapper').length > 0) {
                makeSortable(document.getElementById('feEditSimple-rightColWrapper'), 'connectedSortable');
            }
            $('#note-editor-' + uid).closest('.connectedSortable').find('.note-editor-temp').remove();
            break;           
        default:
            //default code block
    }
}


function insertImage(uid, type, imageOrientationId)
{
    //console.log(imageOrientationId + ';' + uid);
    if(imageOrientationId == '') {
        //console.log('???');
        imageOrientationId = $('#note-editor-' + uid).attr('data-imageorient');
        console.log(imageOrientationId);
        if(!imageOrientationId) {
            imageOrientationId = '17';
        }
    }
    var noOfImages = $('#note-editor-' + uid).find('.csc-textpic-image').length;
    var innerContainer = $('#note-editor-' + uid + ' .note-editable');
    var image;
    
    $.get('/typo3conf/ext/lth_feedit_simple/res/template/contentelement.html', function (response) {
        var responseContent = $(response).filter("[data-imageOrient='" + imageOrientationId + "']").html();
        if (innerContainer.find('.csc-textpicHeader').length > 0) {
            var header = $(innerContainer).find('.csc-textpicHeader').text();
        } else if (innerContainer.prev('h2').length > 0) {
            var header = $(innerContainer).prev('h2').text();
        }

        //Replace content in template
        var content = '<div class="lth_feeditsimple_content">' + $(innerContainer).find('.lth_feeditsimple_content').html() + '</div>';
        
        var newImage = '<figure class="csc-textpic-image csc-textpic-last">\
            <img id="new' + noOfImages + '" data-id="new' + noOfImages + '" class="feeditSimple-placeHolder" style="height:100px; width:100px;" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="" />\
            </figure>';
        
        if(noOfImages == 0 && type == 'new') {
            image = newImage;
        } else if(noOfImages > 0 && type == 'new') {
            $(innerContainer).find('.csc-textpic-imagerow').removeClass('csc-textpic-imagerow-last');
            if(noOfImages == 1) {
                $(innerContainer).find('.csc-textpic-image').wrap('<div class="csc-textpic-imagerow">\
                    <div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">\
                    </div>\
                    </div>');
            }
            $(innerContainer).find('.csc-textpic-imagerow').last().after('<div class="csc-textpic-imagerow csc-textpic-imagerow-last">\
            <div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">' + newImage + '\
            </div>\
            </div>');
            
        }
        
        if(noOfImages > 0) {
            image = $(innerContainer).find('.csc-textpic-imagewrap').html();
        }

        responseContent = responseContent.replace('###IMAGE###', image);
        responseContent = responseContent.replace('###CONTENT###', content);
        
        if (header) {
            //there is a header :( and we have to deal with it
            if ($(responseContent).find('.csc-textpicHeader').length > 0 && innerContainer.prev('h2').length > 0) {
                //There is a header in the template and a header ouside in the original
                //put header in the template and remove the outside header
                responseContent = responseContent.replace('###HEADER###', '<h2>' + header + '</h2>');
                $(innerContainer).prev('h2').remove();
            } else if ($(responseContent).find('.csc-textpicHeader').length > 0 && innerContainer.prev('h2').length == 0) {
                //put header in the template
                responseContent = responseContent.replace('###HEADER###', '<h2>' + header + '</h2>');
            } else if ($(responseContent).find('.csc-textpicHeader').length == 0 && innerContainer.prev('h2').length == 0) {
                //put header in outer container and remove template header
                $(innerContainer).prepend('<h2>' + header + '</h2>');
                $(responseContent).find('.csc-textpicHeader').remove();
            }
        } else {
            //remove template header

            responseContent = responseContent.replace('<div class="csc-textpicHeader">###HEADER###</div>', '');
            //responseContent = responseContent.replace('###HEADER###', '<h2>' + header + '</h2>');
        }
        
        $(innerContainer).html(responseContent);
        $('#note-editor-' + uid).attr('data-imageorient', imageOrientationId);

        //$('[id="new' + newIndex + '"]').click(function () {*/
        if(type=='new') {
            $('#new' + noOfImages).click(function () {
                $('#chosenImage').attr('data-src', $(this).attr('src'));
                $('#chosenImage').attr('data-pid', $(this).closest('.note-editor').attr('id').split('-').pop());
                imageClick($(this));
            });
        }
        //make editable
        makeEditable('#c' + uid);
        cancelRightClick();
    });
}


function ajaxCall(cmd, table, uid, pid, pageUid, okMessage, contentToPaste)
{
    $.ajax({
        type: "POST",
        url: 'index.php',
        dataType: 'json',
        data: {
            eID: 'lth_feedit_simple',
            cmd: cmd,
            table: table,
            uid: uid,
            pid: pid,
            pageUid: pageUid,
            contentToPaste: contentToPaste,
            sid: Math.random()
        },
        success: function (data) {
            if (cmd == 'pasteContent' && data.content && data.result == 200) {
                //console.log($('#c'+pid).length);
                //$('#c'+pid).toggle();
                $('#c' + pid).next().after(data.content);
                var uidArray = uid.split(':');
                makeEditable('#c' + uidArray.pop(), '');
                if($('#feEditSimple-rightColWrapper').length > 0) {
                    makeSortable(document.getElementById('feEditSimple-rightColWrapper'), 'connectedSortable');
                }
                if (data.oldUid) {
                    feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:' + table + ':' + data.oldUid, 1);
                }
            } else if (cmd === 'deleteContent' && data.result == 200) {
                if($('#'+contentToPaste).find('.note-editor').length==0) {
                    addNoContent('#'+contentToPaste);
                }
            } else if (cmd === 'hideContent' && data.result == 200) {
                $('#note-editor-' + uid).removeClass('feEditSimple-hidden-0');
                $('#note-editor-' + uid).addClass('feEditSimple-hidden-1');                
                var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');
                if (displayString) {
                    var displayObject = JSON.parse(unescape(displayString));
                    if (displayObject['hiddenElement'] === 'none') {
                        $('#note-editor-' + uid).hide();
                    }
                }
             } else if (cmd === 'showContent' && data.result == 200) {
                $('#note-editor-' + uid).removeClass('feEditSimple-hidden-1');
                $('#note-editor-' + uid).addClass('feEditSimple-hidden-0');
             } else if (cmd === 'pastePageAfter' || cmd === 'pastePageInto') {
                if (data.oldUid) {
                    feeditSimpleSetCookie('feeditSimple-copycutpage', 'copy:pages:' + data.oldUid, 1);
                } else {
                    $.ajax({
                        url: 'index.php',
                        type: 'post',
                        dataType: 'json',
                        data: {
                            eID: 'lth_feedit_simple',
                            contentToPaste: cmd,
                            cmd: 'updateCopiedPage',
                            uid: uid,
                            pageUid: pageUid,
                            sid: Math.random(),
                        },
                        success: function (data) {
                            if (confirm('Page successfully pasted. You have to reload the page to see the changes. Do you want to do this?')) {
                                location.reload(true);
                            }
                        },
                        error: function (data) {
                            alert('Something went wrong');
                        }
                    });
                }
            } else if (cmd === 'deletePage') {
                location.replace('index.php?id=' + data.pid);
            } else if (cmd === 'hidePage' || cmd === 'hidePageInMenu') {
                location.replace('index.php?id=' + data.pid);
            } else if ((cmd === 'getPageTree') && data.content && data.result == 200) {
                var arr1 = [];

                $.each(data.content, function (index, d) {

                    //console.log(d);
                    var tmp = d[0];
                    //console.log(tmp.uid);
                    arr1.push({'href': tmp.href, 'text': tmp.text, 'uid': tmp.uid, 'nodes': tmp.nodes});
                });

                var pageTreeContainer = $('body', $('.fancybox-iframe').contents()).find('.pageTreeContainer');
                var pageTree = pageTreeContainer.find('#pageTree');

                //Add close fancybox
                $(pageTreeContainer).find('.close').click(function () {
                    $.fancybox.close();
                });

                pageTree.treeview({
                    color: "#428bca",
                    enableLinks: true,
                    data: arr1,
                    onNodeSelected: function (event, data) {
                        //console.log(data);
                        window.parent.$(".bootstrap-wysihtml5-insert-link-url").val('/?id=' + data.uid);
                        $.fancybox.close();
                    }
                });

                pageTree.treeview('collapseAll', {silent: true});
                pageTreeContainer.show();
            } else if (cmd === 'getFormHandler') {
                if (!data.columns) {
                    alert('no data');
                    return false;
                }
                var resultColumns = [];
                var tableContent = '<thead><tr>';
                $.each(data.columns, function (i, value) {

                    var obj = {sTitle: value};

                    resultColumns.push(obj);
                    tableContent += '<th>' + value + '</th>';
                });
                //console.log(data.data);
                tableContent += '</tr></thead>';
                tableContent += '<tbody></tbody>';
                $('#feeditSimple-modalBox-2 .modal-body').html('<table id="feeditSimple-formhandlerTable" class="display" width="100%"></table>');

                $('#feeditSimple-modalBox-2 .modal-header h3').html('Formhandler admin');
                $('#feeditSimple-modalBox-2 .modal-footer').html('');

                $('#feeditSimple-formhandlerTable').DataTable({
                    "aaData": data.data,
                    "aoColumns": resultColumns,
                    dom: 'Bfrtip',
                    buttons: [
                        {
                            extend: 'collection',
                            text: 'Export',
                            buttons: [
                                'excel',
                                'csv'
                            ]
                        },
                        'colvis'
                    ]
                });
                
                /*
                 * buttons: ['copyHtml5',
                        'excelHtml5',
                        'csvHtml5',
                        'pdfHtml5',
                        'colvis'
                        {
                            extend: 'colvis',
                            //columns: ':not(:first-child)'
                        }
                    ]
                 */

                $("#feeditSimple-modalBox-2").modal({
                    persist: true,
                    onClose: function (dialog) {
                        dialog.container.fadeOut('slow', function () {
                            $.modal.close();
                        });
                    }
                });

                $("#feeditSimple-modalBox-2").on('shown', function () {
                    var tableWidth = $('#feeditSimple-formhandlerTable').width() + 50;
                    if (!tableWidth) {
                        tableWidth = '800';
                        //tableHeight = '800';
                    }
                    $(this).css('width', tableWidth + 'px');
                    //console.log($(this).find('.modal-body'));
                });
            } else if (cmd === 'getImgId') {
                //console.log(contentToPaste);
                $("#" + uid).attr('src', '/fileadmin' + contentToPaste);
                $("#" + uid).attr('id', data.content);
                $(".bootstrap-wysihtml5-insert-link-url").val('/fileadmin' + contentToPaste);
                $.fancybox.close();
            }

            if (data.result == 200 && okMessage) {
                showMessage(okMessage);
            }
        },
        error: function (err) {
            console.log(err);
            showMessage({message: '500', header: '1676'});
        }
    });
}


function toggleHiddenObject(inputClass, myType, okMessage)
{
    var displayString = feeditSimpleGetCookie('feeditSimple-usersettings');
    if (displayString) {
        var displayObject = JSON.parse(unescape(displayString));
        //console.log(inputClass+','+myType + ',' + displayObject[myType]);

        if (displayObject[myType] == 'none' && inputClass === 'hiddenElement') {
            displayObject[myType] = 'block';
            $(inputClass).css('opacity', '0.5');
            $(inputClass).css('-ms-filter', 'alpha(opacity=50)');

            $(inputClass).css('display', 'block');
            $('#' + myType).css('display', 'inline-block');
        } else if (inputClass === 'hiddenElement') {
            displayObject[myType] = 'none';
            $(inputClass).css('display', 'none');
            $('#' + myType).css('display', 'none');
        } else {
            if (displayObject[myType] === 'block') {
                displayObject[myType] = 'none';
                $(inputClass).hide();
                $('#' + myType).css('display', 'none');
            } else {
                displayObject[myType] = 'block';
                $(inputClass).show();
                $('#' + myType).css('display', 'inline-block');

            }
            if (myType === 'hiddenPage') {
                $('.feEditSimple-hiddenPage-1 a').find('.icon-ban-circle').remove();
                $('.feEditSimple-hiddenPage-1 a').append('<span class="icon-ban-circle"></span>');
            } else {
                $('.feEditSimple-hiddenInMenu-1 a').find('.icon-eye-close').remove();
                $('.feEditSimple-hiddenInMenu-1 a').append('<span class="icon-eye-close"></span>');
            }
        }
        feeditSimpleSetCookie('feeditSimple-usersettings', JSON.stringify(displayObject), 0);
        //showMessage(okMessage);
    } else {

    }
}


function uniqid(prefix, more_entropy)
{
    //  discuss at: http://phpjs.org/functions/uniqid/
    // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //  revised by: Kankrelune (http://www.webfaktory.info/)
    //        note: Uses an internal counter (in php_js global) to avoid collision
    //        test: skip
    //   example 1: uniqid();
    //   returns 1: 'a30285b160c14'
    //   example 2: uniqid('foo');
    //   returns 2: 'fooa30285b1cd361'
    //   example 3: uniqid('bar', true);
    //   returns 3: 'bara20285b23dfd1.31879087'

    if (typeof prefix === 'undefined') {
        prefix = '';
    }

    var retId;
    var formatSeed = function (seed, reqWidth) {
        seed = parseInt(seed, 10)
                .toString(16); // to hex str
        if (reqWidth < seed.length) { // so long we split
            return seed.slice(seed.length - reqWidth);
        }
        if (reqWidth > seed.length) { // so short we pad
            return Array(1 + (reqWidth - seed.length))
                    .join('0') + seed;
        }
        return seed;
    };

    // BEGIN REDUNDANT
    if (!this.php_js) {
        this.php_js = {};
    }
    // END REDUNDANT
    if (!this.php_js.uniqidSeed) { // init seed with big random int
        this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
    }
    this.php_js.uniqidSeed++;

    retId = prefix; // start with prefix, add current milliseconds hex string
    retId += formatSeed(parseInt(new Date()
            .getTime() / 1000, 10), 8);
    retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
    if (more_entropy) {
        // for more entropy we add a float lower to 10
        retId += (Math.random() * 10)
                .toFixed(8)
                .toString();
    }

    return retId;
}


//(function ($) {

// Extends plugins for adding changeImage.
//  - plugin is external module for customizing.
$.extend($.summernote.plugins, {
    /**
     * @param {Object} context - context object has status of editor.
     */
    'changeImage': function (context) {
        var ui = $.summernote.ui;
        context.memo('button.changeImage', function () {
            var button = ui.button({
                //className: 'note-btn-bold',
                contents: '<i class="note-icon-pencil" />',
                click: function (e) {
                    $('#modalType').val('changeImage');
                    $('.note-image-popover').hide();
                    $('#feeditSimple-modalBox').modal('show');
                }
            });
            var $changeImage = button.render();
            return $changeImage;
        });
    },
    'changeImageSize': function (context) {
        var ui = $.summernote.ui;
        context.memo('button.changeImageSize', function () {
            var button = ui.button({
                contents: '<input class="imgSlider" data-slider-id="ex1Slider" type="text" data-slider-min="10" data-slider-max="700" data-slider-step="1" />'
            });
            var $changeImageSize = button.render();
            return $changeImageSize;
        });
    },
    'moveImageUp': function (context) {
        var ui = $.summernote.ui;
        context.memo('button.moveImageUp', function () {
            var button = ui.button({
                contents: 'Up',
                click: function (e) {
                    var imageArray = [];
                    var chosenImageIndex;
                    var chosenImageSrc = $('#chosenImage').attr('data-src');
                    var i = 0;
                    $('img[src="' + chosenImageSrc + '"]').closest('.note-editor').find('.csc-textpic-image img').each(function () {
                        if ($(this).attr('src') === chosenImageSrc) {
                            chosenImageIndex = i;
                        }
                        imageArray.push($(this).attr('id'));
                        i++;
                    });
                    var previousSiblingId = imageArray[chosenImageIndex - 1];
                    var chosenImageId = imageArray[chosenImageIndex];

                    var chosenImageWidth = $('[id="' + chosenImageId + '"]').css('width');
                    var chosenImageHeight = $('[id="' + chosenImageId + '"]').css('height');
                    var chosenImageUidLocal = $('[id="' + chosenImageId + '"]').attr('data-uid_local');

                    var previousSiblingSrc = $('[id="' + previousSiblingId + '"]').attr('src');
                    var previousSiblingWidth = $('[id="' + previousSiblingId + '"]').css('width');
                    var previousSiblingHeight = $('[id="' + previousSiblingId + '"]').css('height');
                    var previousSiblingUidLocal = $('[id="' + previousSiblingId + '"]').attr('data-uid_local');

                    if (!previousSiblingId) {
                        alert('The image is on top!');
                    } else {
                        $('[id="' + previousSiblingId + '"]').attr('src', chosenImageSrc);
                        $('[id="' + chosenImageId + '"]').attr('src', previousSiblingSrc);
                        
                        $('img[src="' + previousSiblingSrc + '"]').attr('id', previousSiblingId);
                        $('img[src="' + previousSiblingSrc + '"]').css('width', previousSiblingWidth);
                        $('img[src="' + previousSiblingSrc + '"]').css('height', previousSiblingHeight);
                        $('img[src="' + previousSiblingSrc + '"]').attr('data-uid_local', previousSiblingUidLocal);
                        
                        $('img[src="' + chosenImageSrc + '"]').attr('id', chosenImageId);
                        $('img[src="' + chosenImageSrc + '"]').css('width', chosenImageWidth);
                        $('img[src="' + chosenImageSrc + '"]').css('height', chosenImageHeight);
                        $('img[src="' + chosenImageSrc + '"]').attr('data-uid_local', chosenImageUidLocal);
                        
                        $('.note-image-popover').hide();
                        addId($('img[id="' + chosenImageId + '"]').closest('.note-editor').attr('id').split('-').pop());
                    }
                }
            });

            var $moveImageUp = button.render();
            return $moveImageUp;
        });
    },
    'moveImageDown': function (context) {
        var ui = $.summernote.ui;
        context.memo('button.moveImageDown', function () {
            var button = ui.button({
                contents: 'Down',
                click: function (e) {
                    var imageArray = [];
                    var chosenImageIndex;
                    var chosenImageSrc = $('#chosenImage').attr('data-src');
                    var i = 0;
                    $('img[src="' + chosenImageSrc + '"]').closest('.note-editor').find('.csc-textpic-image img').each(function () {
                        if ($(this).attr('src') === chosenImageSrc) {
                            chosenImageIndex = i;
                        }
                        imageArray.push($(this).attr('id'));
                        i++;
                    });
                    var nextSiblingId = imageArray[chosenImageIndex + 1];
                    var chosenImageId = imageArray[chosenImageIndex];
                    
                    var chosenImageWidth = $('[id="' + chosenImageId + '"]').css('width');
                    var chosenImageHeight = $('[id="' + chosenImageId + '"]').css('height');
                    var chosenImageUidLocal = $('[id="' + chosenImageId + '"]').attr('data-uid_local');
                    
                    var nextSiblingSrc = $('[id="' + nextSiblingId + '"]').attr('src');
                    var nextSiblingWidth = $('[id="' + nextSiblingId + '"]').css('width');
                    var nextSiblingHeight = $('[id="' + nextSiblingId + '"]').css('height');
                    var nextSiblingUidLocal = $('[id="' + nextSiblingId + '"]').attr('data-uid_local');

                    if (!nextSiblingId) {
                        alert('The image is in bottom!');
                    } else {
                        $('[id="' + nextSiblingId + '"]').attr('src', chosenImageSrc);
                        $('[id="' + chosenImageId + '"]').attr('src', nextSiblingSrc);
                        
                        $('img[src="' + nextSiblingSrc + '"]').attr('id', nextSiblingId);
                        $('img[src="' + nextSiblingSrc + '"]').css('width', nextSiblingWidth);
                        $('img[src="' + nextSiblingSrc + '"]').css('height', nextSiblingHeight);
                        $('img[src="' + nextSiblingSrc + '"]').attr('data-uid_local', nextSiblingUidLocal);

                        $('img[src="' + chosenImageSrc + '"]').attr('id', chosenImageId);
                        $('img[src="' + chosenImageSrc + '"]').css('width', chosenImageWidth);
                        $('img[src="' + chosenImageSrc + '"]').css('height', chosenImageHeight);
                        $('img[src="' + chosenImageSrc + '"]').attr('data-uid_local', chosenImageUidLocal);
                        
                        $('.note-image-popover').hide();
                        addId($('img[id="' + chosenImageId + '"]').closest('.note-editor').attr('id').split('-').pop());
                    }
                }
            });
            var $moveImageDown = button.render();
            return $moveImageDown;
        });
    }
});

$.fn.outerHTML = function () {
    return $('<div />').append(this.eq(0).clone()).html();
};