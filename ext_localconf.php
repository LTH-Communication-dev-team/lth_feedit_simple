<?php
if (!defined ('TYPO3_MODE')) die ('Access denied.');

	// @note Changed to hook to place Code before </body> directly before output
$TYPO3_CONF_VARS['SC_OPTIONS']['tslib/class.tslib_fe.php']['contentPostProc-output'][] = 'EXT:lth_feedit_simple/view/class.lth_feeditsimple_adminpanel.php:user_feeditsimple_adminpanel->showMenuBar';

	// Add AJAX support
$TYPO3_CONF_VARS['FE']['eID_include']['lth_feedit_simple'] = 'EXT:lth_feedit_simple/service/ajax.php';

t3lib_extMgm::addTypoScript('lth_feedit_simple', 'setup', '
    #############################################
    ## TypoScript added by extension "FE Editing Advanced"
    #############################################

    [globalVar = BE_USER|user|uid > 0]
    page.headTag = <head><meta http-equiv="X-UA-Compatible" content="IE=9" />
    styles.content.get.stdWrap {
        #prepend = TEXT
        #prepend.value = 0
        #prepend.dataWrap = |-pages-{TSFE:id}
        #prepend.wrap3 = <div class="feEditSimple-firstWrapper" id="feEditSimple-firstWrapper-colPos-|"></div>
	#prepend.required=1
        dataWrap = <div class="connectedSortable" id="feEditSimple-normalColWrapper">|</div>
    }
    
    styles.content.getRight.stdWrap {
	required=1
        dataWrap = <div class="connectedSortable" id="feEditSimple-rightColWrapper">|</div>
    }
    
    styles.content.getLeft.stdWrap {
	required=1
        dataWrap = <div class="connectedSortable" id="feEditSimple-leftColWrapper">|</div>
    }
    
    
    lib.left-nav.includeNotInMenu = 1
    lib.main-nav.includeNotInMenu = 1

    #styles.content.getRight.stdWrap < styles.content.get.stdWrap
    #styles.content.getRight.stdWrap.prepend.value = 2

    [global]
    ', 43); // add this code AFTER the "css_styled_content" code (43) (because CSC empties styles > and would delete our changes)

	// Settings needed to be forced for showing hidden records to work
/*t3lib_extMgm::addUserTSConfig('
	admPanel {
            override.preview.showHiddenRecords = 1
            override.preview.showHiddenPages = 0
	}
');*/