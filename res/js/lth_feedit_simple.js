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

    //$('.note-link-url').wrap('<div style="width:548px;"><div style="float:left;"></div></div>');
    $('.note-link-url').after('<button title="Files and images" type="button" style="position:absolute;top:113px;left:440px;" class="btn editable-filemanager" \
        data-toggle="modal" data-backdrop="static" href="#feeditSimple-modalBox">\
        <i class="icon-folder-open"></i></button>\
        '
    );
    

    var tmpArray = [];
    $('.note-editor .csc-textpic-image img').each(function() {
        $(this).click(function () {
            $('#chosenImage').attr('data-src', $(this).attr('src'));
            $('#chosenImage').css('width', $(this).css('width'));
            $('#chosenImage').css('height', $(this).css('height'));
            $('#chosenImage').attr('data-pid', $(this).closest('.note-editor').attr('id').split('-').pop());
            
            $('.imgSlider').slider({'value':parseInt($(this).css('width'))});
    $('.imgSlider').on("slide", function(slideEvt) {
        var chosenImageSrc = $('#chosenImage').attr('data-src');
        var chosenImageRatio = $('#chosenImage').height() / $('#chosenImage').width();
        console.log(chosenImageRatio);
        $('img[src="' + chosenImageSrc + '"]').css('width', slideEvt.value);
        $('img[src="' + chosenImageSrc + '"]').css('height', chosenImageRatio * slideEvt.value);
        //$('.note-editor img[src="' + chosenImageSrc + '"]').parent().css({'width':slideEvt.value+'%'});
        //$('.note-editor img[src="' + chosenImageSrc + '"]').parent().css({'height':slideEvt.value+'%'});
        //console.log(slideEvt.value);
    });
    $('.imgSlider').on('slideStop', function () {
        var chosenImageSrc = $('#chosenImage').attr('data-src');
        addId($('img[src="' + chosenImageSrc + '"]').closest('.note-editor').attr('id').split('-').pop());
    });

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
    });
    $('#imagesFromStart').val(tmpArray.join(','));

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
            $(this).find('.modal-body-left').append('<span class="btn btn-success fileinput-button disabled">\
                    <i class="glyphicon glyphicon-plus"></i>\
                    <span>Select files...</span>\
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
            
            jstree($('#modalType').val());    
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
                        $('.panel-header').html('<h1>User settings</h1>');
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

    $('#feeditSimple-helpButton').panelslider({
        side: 'right',
        duration: 200,
        clickClose: true,
        onOpen: function () {
            $('.panel-header').html('<h1>Help</h1>');
            $('.panel-body').load("/typo3conf/ext/lth_feedit_simple/res/template/help.html #tjo");
        },
        easingOpen: null,
        easingClose: null
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
        $('#note-editor-noNormalContent').show();
        enableBootstrapContextMenu(false, '#note-editor-noNormalContent', '#context-menu-no-content');
    } else {
        //enable bootstrap-contextmenu
        enableBootstrapContextMenu(true, '.note-editor', '#context-menu');
    }

    $('#feeditSimple-toggleHiddenElement').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': 'Display hidden elements successfully changed'};
        toggleHiddenObject('.note-editor.feEditSimple-hidden-1', 'hiddenElement', okMessage);
    });

    $('#feeditSimple-toggleHiddenInMenu').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': 'Display hidden in menu successfully changed'};
        toggleHiddenObject('.feEditSimple-hiddenInMenu-1', 'hiddenInMenu', okMessage)
    });

    $('#feeditSimple-toggleHiddenPage').click(function () {
        var okMessage = {'header': 'Show/Hide', 'message': 'Display hidden pages successfully Changed'};
        toggleHiddenObject('.feEditSimple-hiddenPage-1', 'hiddenPage', okMessage);
    });

    $('#feeditSimple-formHandler').click(function () {
        ajaxCall('getFormHandler', '', '', '', $('body').attr('id'), '', '');
    });
    
    $('#feeditSimple-addRightColumn').click(function () {
        if($('#feEditSimple-rightColWrapper').length > 0) {
            alert('There is already a right column');
        } else {
            $('#text_wrapper').removeClass('grid-23').addClass('grid-15');
            $('#feEditSimple-normalColWrapper').after('<div class="connectedSortable" id="feEditSimple-rightColWrapper">\
                <div id="content_sidebar_wrapper" class="grid-8 omega"><div id="content_sidebar">\
                <div id="new" class="csc-default">\
                <div class="lth_feeditsimple_content">New element...\
                </div>\
                </div>\
                </div>\
                </div>');
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

    $('.link-dialog').attr('data-backdrop','static').attr('role','dialog');
    $('.fancybox-enlarge img').unwrap();
    //$('.fancybox-enlarge').removeClass('fancybox-enlarge');
    
    //Document ready ends********************************************************************************************************************
});


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
                //['color', ['color']],
                ['font', ['bold', 'clear']],
                ['para', ['ul', 'paragraph']],
                //['table', ['table']],
                ['insert', ['link']]
            ]
        }
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
    console.log(((parseInt(factor) / 100)));
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
        /*group: {
            name: 'feEditSimpleContentArea',
            put: ['feEditSimpleContentElements']
        },*/
        group: group,
        animation: 100,
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
            /*var template = getContentTemplate(String(evt.item.outerHTML));

            var okMessage = {'header': 'New element', 'message': 'Content element successfully created'};
            $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').find('.feEditSimple-contentTypeItem').replaceWith(template);
            makeEditable('#new');
            $('#new').next().attr('id', 'note-editor-new');
            makeSortable(selector);
            if (okMessage) {
                showMessage(okMessage);
            }
            $('.feEditSimple-secondRow').fadeOut();*/
            
            if($('#feEditSimple-normalColWrapper .note-editor').length == 0) {
                $('#note-editor-noNormalContent').show();
                enableBootstrapContextMenu(false, '#note-editor-noNormalContent', '#context-menu-no-content');
            } else {
                $('#note-editor-noNormalContent').hide();
            }
            if($('#feEditSimple-rightColWrapper .note-editor').length == 0) {
                $('#note-editor-noRightContent').show();
                enableBootstrapContextMenu(false, '#note-editor-noRightContent', '#context-menu-no-content');
            } else {
                $('#note-editor-noRightContent').hide();
            }
        }
    });
}


function toggleItem(selector, eType)
{
    $(selector).toggle();
}


function newContent()
{
    if ($('#new').length > 0) {
        alert('Just one new element at the time!')
    } else {
        $('.feEditSimple-secondRow').fadeIn();
    }
}


function saveChanges()
{
    var saveIdsArray = $('#lth_feedit_simple-saveIds').val().split(',');
    //var deleteIdsArray = $('#lth_feedit_simple-deleteIds').val().split(',');

    $(saveIdsArray).each(function (i, el) {
        ///console.log(el);
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

        var imgId, imgWidth, imgHeight, uid_local;
        $('#note-editor-' + id).find('.csc-textpic-image img').each(function (i, el) {
            imgId = $(this).attr('id');
            imgWidth = $(this).css('width');
            imgHeight = $(this).css('height');
            uid_local = $(this).attr('data-uid_local');
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
            imgIdList.push(imgId);
        });
        
        var imagesFromStartList = $('#note-editor-'+el).attr('data-orgimages');
        if(imagesFromStartList) {
            var deleteIdsArray = $(imagesFromStartList.split(',')).not(imgIdList).get();
            $(deleteIdsArray).each(function (i, el1) {
                console.log(el1);
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
                /*params["data[tt_content][" + id + "][bodytext]"] = $('#note-editor-' + id).find('.lth_feeditsimple_content').html().replace(/(<a.*\?id\=)(.*?)(">)(.*?)(<\/a>)/g,
                        function (match, $1, $2, $3, $4, $5) {
                            return '<link ' + $2 + ' - internal-link "Opens internal link in current window">' + $4 + '</link>';
                        });*/
                var bodytext = $('#note-editor-' + id).find('.lth_feeditsimple_content').html();
                bodytext = bodytext.replace(/<p>&nbsp;<\/p>/gi,'').replace(/<p><\/p>/gi, '').replace(/\n+/g, '\n').replace(/<b><b>/gi, '<b>').replace(/<\/b><\/b>/gi, '</b>');
                params["data[tt_content][" + id + "][bodytext]"] = bodytext;
                
                if ($('#note-editor-' + id).find('.csc-textpic-imagewrap').length > 0) {
                    params["data[tt_content][" + id + "][image]"] = imgIdList.join();
                }
                params["formToken"] = formToken;
                //console.log(params);
                //http://130.235.208.15/typo3/alt_doc.php?edit[tt_content][-343]=new&defVals[tt_content][colPos]=0&defVals[tt_content][sys_language_uid]=0&returnUrl=%2Ftypo3%2Fsysext%2Fcms%2Flayout%2Fdb_layout.php%3Fid%3D6&defVals[tt_content][CType]=textpic&defVals[tt_content][imageorient]=17
                $.ajax({
                    url: url + '&doSave=1' + extraUrl,
                    type: 'post',
                    dataType: 'json',
                    data: params,
                    complete: function (data) {
                        //console.log('tjo');
                        $('#lth_feedit_simple-saveChanges').prop('disabled', true);
                        var okMessage = {'header': 'Save', 'message': 'Content successfully saved'};
                        showMessage(okMessage);
                        if (id === 'new') {
                            var newId = data.responseText.split(']=edit&amp;doSave=1').shift().split('="/typo3/alt_doc.php?&amp;edit[tt_content][').pop();
                            $('#new').attr('id', 'c' + newId);
                            $('#note-editor-new').attr('id', 'note-editor-' + newId)
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


function jstree(modalType)
{
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
                'url': 'index.php?eID=lth_feedit_simple&cmd=getFiles&contentToPaste=' + modalType + '&pageUid=' + $('body').attr('id') + '&sid=' + Math.random(),
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
            if (modalType === 'changeImage') {
                var oldSrc = $('#chosenImage').attr('data-src');
                var pid = $('#chosenImage').attr('data-pid');
                
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
                            $('img[src="fileadmin' + newSrc + '"]').attr('id', uniqid() + 'new');
                            $('img[src="fileadmin' + newSrc + '"]').attr('data-uid_local', data.uid);
                        },
                        error: function (data) {
                            alert('Something went wrong');
                        }
                    });
                }
            } else {
                //console.log(window.location.host);
                $(".note-link-url").val('http://' + window.location.host + '/?id=' + $(this).attr('id').replace('_anchor', ''));
                $('.note-link-btn').prop('disabled', false);
                $("#feeditSimple-modalBox").modal('hide');
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
    var templateArray = {'textpic': '<div id="new" class="csc-default">\
        <div class="lth_feeditsimple_content">New element...\
        </div>\
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


function enableBootstrapContextMenu(content, selector, target)
{
    if(content) {
        $(selector).contextmenu({
            target: target,
            before: function (e, context) {
                return true;
            },
            onItem: function (context, e) {
                feeditSimpleContentCommand(context, e);// execute on menu item selection
                e.stopPropagation();
                this.closemenu(e);
            }
        });
    } else {
        $(selector).contextmenu({
            target: target,
            before: function (e, context) {
                return true;
            },
            onItem: function (context, e) {
                feeditSimpleContentCommand(context, e);// execute on menu item selection
                e.stopPropagation();
                this.closemenu(e);
            }
        });
    }
}


function disableBootstrapContextMenu()
{
    $('.csc-default').attr("disabled", true);
}


function feeditSimpleContentCommand(context, e)
{
    var cmd = $(e.target).text();
    var uid = context.attr('id').split('-').pop();
    var pageUid = $('body').attr('id');
    //console.log(cmd+uid+pageUid);

    switch (cmd) {
        case 'Edit':
            //console.log
            $(context).find('.lth_feeditsimple_content').editable('toggle');
            break;
        case 'Delete':
            //console.log(context);
            if (confirm('Are you sure?')) {
                var okMessage = {'header': 'Delete', 'message': 'Content element successfully deleted'};
                $(context).remove();
                $('#c' + uid).remove();
                ajaxCall('deleteContent', 'tt_content', uid, '', '', okMessage);
            } else {
                return false;
            }
            break;
        case 'Cut':
            if (feeditSimpleSetCookie('feeditSimple-copycutitem', 'cut:tt_content:' + uid, 1)) {
                var content = $(context).html();
                $(context).remove();
                var okMessage = {'header': 'Cut', 'message': 'Content element successfully cut'};
                ajaxCall('setClipboard', 'tt_content', uid, '', '', okMessage, content);
            } else {
                showMessage({'header': '500', 'message': 'no'});
            }
            break;
        case 'Copy':
            if (feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:tt_content:' + uid, 1)) {
                var content = $(context).html();
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
            var imageOrientationId = e.target.className.split('-').pop();
            //console.log(imageOrientationId);
            //console.log(cmd.toLowerCase().replace(',','').replace(' ', '-'));
            //var okMessage = {'header': 'Image', 'message': 'Image orientation successfully updated'};
            changeImageOrientation(cmd.toLowerCase().replace(', ', '-').replace(' ', '-'), uid, imageOrientationId);
            break;
        case 'Insert image':
            var okMessage = {'header': 'Image', 'message': 'Image successfully inserted'};
            insertImage(uid, okMessage);
            break;
         case 'Text and images':
            var okMessage = {'header': 'Image', 'message': 'Content element successfully inserted'};
            //insertImage(uid, okMessage);
            var template = getContentTemplate('textpic');

            var okMessage = {'header': 'New element', 'message': 'Content element successfully created'};
                        
            $('#note-editor-'+uid).after(template);
            $('#note-editor-noNormalContent').hide();
            makeEditable('#new');
            $('#new').next().attr('id', 'note-editor-new');
            makeSortable(document.getElementById('feEditSimple-normalColWrapper'), 'connectedSortable');
            if($('#feEditSimple-rightColWrapper').length > 0) {
                makeSortable(document.getElementById('feEditSimple-rightColWrapper'), 'connectedSortable');
            }
            if (okMessage) {
                showMessage(okMessage);
            }
            //$('.feEditSimple-secondRow').fadeOut();
            //e.stopPropagation();
            break;           
        default:
            //default code block
    }
    $('#context-menu').hide();
}


function insertImage(uid, okMessage)
{
    //console.log(uid);
    var newIndex = $('#note-editor-' + uid).find('.feeditSimple-placeHolder').length;
    var imageOrient = $('#note-editor-' + uid).attr('data-imageOrient');
    
    if ($('#note-editor-' + uid).find('.csc-textpic-imagewrap').length > 0) {
        //There is an image
        var responseContent;
        $.get('/typo3conf/ext/lth_feedit_simple/res/template/contentelement.html', function (response) {
            responseContent = $(response).filter('div[data-imageOrient="' + imageOrient + '"]').html();
            console.log(response);
        });

        var afterContent = '<div class="csc-textpic-imagerow csc-textpic-imagerow-last">\
            <div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">\
            <figure class="csc-textpic-image csc-textpic-last">\
            <img id="new' + newIndex + '" class="feeditSimple-placeHolder" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="" />\
            </figure>\
            </div>\
            </div>';
        if ($('#note-editor-' + uid).find('.csc-textpic-imagerow').length > 0) {
            //There is more than one image
            console.log('There are more than image');
            $('#note-editor-' + uid).find('.csc-textpic-imagerow').removeClass('csc-textpic-imagerow-last');
            $('#note-editor-' + uid).find('.csc-textpic-imagerow').last().after(afterContent);
        } else {
            //There is only one image
            console.log(uid + 'There is only one image');
            $('#note-editor-' + uid).find('.csc-textpic-imagewrap').wrap('<div class="csc-textpic-imagerow">\
                <div class="csc-textpic-imagecolumn csc-textpic-firstcol csc-textpic-lastcol">\
                </div>\
                </div>');
            $('#note-editor-' + uid).find('.csc-textpic-imagerow').after(afterContent);
            if ($('#note-editor-' + uid).find('.csc-textpic-above').length > 0) {
                $('#note-editor-' + uid).find('.csc-textpic-imagerow').wrapAll('<div class="csc-textpic-center-outer"><div class="csc-textpic-center-inner"></div></div>');
            }
        }
    } else {
        console.log('There is no image');
        //There is no image
        /*
         * 
         <figure class="csc-textpic-image csc-textpic-last"><img src="fileadmin/_processed_/csm_aaron_fc6c628549.jpg" width="75" height="50" id="27" alt="" draggable="false"></figure></div></div></div><p>&nbsp;</p><p>New elttttttttttttttttttttttttttttttttttttement...        </p><p>&nbsp;</p></div>
         */
        var prependContent = '<div class="csc-textpic-imagewrap" data-csc-images="1" data-csc-cols="2">\
            <div class="csc-textpic-center-outer">\
            <div class="csc-textpic-center-inner">\
            <figure class="csc-textpic-image csc-textpic-last">\
            <img id="new' + newIndex + '" class="feeditSimple-placeHolder" src="typo3conf/ext/lth_feedit_simple/res/icons/placeholder.png" alt="" />\
            </figure>\
            </div>\
            </div>\
            </div>';
        $('#note-editor-' + uid).find('.note-editable').prepend(prependContent).wrapInner('<div class="csc-textpic csc-textpic-center csc-textpic-above csc-textpic-equalheight"></div>');
    }

    $('[id="new' + newIndex + '"]').click(function () {
        $('#chosenImage').attr('data-src', $(this).attr('src'));
        $('#chosenImage').attr('data-pid', $(this).closest('.note-editor').attr('id').split('-').pop());    
    });
    //make editable???
    makeEditable('#c' + uid);
}


function changeImageOrientation(cmd, uid, imageOrientationId)
{
    //console.log(cmd + uid);

    try {
        var innerContainer = $('#note-editor-' + uid + ' .note-editable');

        //console.log(innerContainer);
        $.get('/typo3conf/ext/lth_feedit_simple/res/template/contentelement.html', function (response) {
            //console.log($(innerContainer).find('.csc-textpicHeader'));
            if (innerContainer.find('.csc-textpicHeader').length > 0) {
                var header = $(innerContainer).find('.csc-textpicHeader').text();
            } else if (innerContainer.prev('h2').length > 0) {
                var header = $(innerContainer).prev('h2').text();
            }

            //Replace content in template
            var content = '<div class="lth_feeditsimple_content">' + $(innerContainer).find('.lth_feeditsimple_content').html() + '</div>';

            var image = $(innerContainer).find('.csc-textpic-imagewrap').outerHTML();

            var responseContent = $(response).filter("#" + cmd).html();

            responseContent = responseContent.replace('###IMAGE###', image);

            //responseContent = responseContent.replace('###IMAGE###', image);
            responseContent = responseContent.replace('###CONTENT###', content);
            //console.log(responseContent);

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
            //console.log(imageorient);
            $(innerContainer).html(responseContent);
            $('#note-editor-' + uid).attr('data-imageorient', imageOrientationId);

            //showMessage(okMessage);
            addId('c' + uid);
            //makeEditable('#c'+uid);
            //     makeEditable('.csc-default.textpic, .csc-default.text');

            /*$.ajax({
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
             });*/

        });
    } catch (err) {
        //console.log(err);
        showMessage({'header': '500', 'message': err});
    }
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
                //$('#c'+pid).toggle();
                $('#c' + pid).after(data.content);
                makeEditable('#lth_feeditsimple_' + uid + ' .lth_feeditsimple_content', '');
                $('#feEditSimple-normalColWrapper, #feEditSimple-rightColWrapper').sortable('refresh');
                if (data.oldUid) {
                    feeditSimpleSetCookie('feeditSimple-copycutitem', 'copy:' + table + ':' + data.oldUid, 1);
                }
            } else if (cmd === 'hideContent' && data.result == 200) {
                $('#c' + uid).css('opacity', '0.5');
                $('#c' + uid).css('-ms-filter', 'alpha(opacity=50)');
            } else if (cmd === 'showContent' && data.result == 200) {
                $('#c' + uid).css('opacity', '');
                $('#c' + uid).css('-ms-filter', '');
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
                    //var tableHeight = $('#feeditSimple-formhandlerTable').height()+200;
                    if (!tableWidth) {
                        tableWidth = '800';
                        //tableHeight = '800';
                    }
                    $(this).css('width', tableWidth + 'px');
                    //console.log($(this).find('.modal-body'));
                    //$(this).find('.dataTables_wrapper').css('height', tableHeight + 'px');
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
            } else if (okMessage) {
                showMessage({message: '500' + cmd + data.result, header: '1671'});
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
                        $('img[src="' + previousSiblingSrc + '"]').attr('css', previousSiblingWidth);
                        $('img[src="' + previousSiblingSrc + '"]').attr('css', previousSiblingHeight);
                        $('img[src="' + previousSiblingSrc + '"]').attr('data-uid_local', previousSiblingUidLocal);
                        
                        $('img[src="' + chosenImageSrc + '"]').attr('id', chosenImageId);
                        $('img[src="' + chosenImageSrc + '"]').attr('css', chosenImageWidth);
                        $('img[src="' + chosenImageSrc + '"]').attr('css', chosenImageHeight);
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