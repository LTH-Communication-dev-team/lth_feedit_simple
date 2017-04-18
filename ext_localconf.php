<?php
if (!defined ('TYPO3_MODE')) die ('Access denied.');

	// @note Changed to hook to place Code before </body> directly before output
$TYPO3_CONF_VARS['SC_OPTIONS']['tslib/class.tslib_fe.php']['contentPostProc-output'][] = 'EXT:lth_feedit_simple/view/class.lth_feeditsimple_adminpanel.php:user_feeditsimple_adminpanel->showMenuBar';

	// Add AJAX support
$TYPO3_CONF_VARS['FE']['eID_include']['lth_feedit_simple'] = 'EXT:lth_feedit_simple/service/ajax.php';

/*\TYPO3\CMS\Extbase\Utility\ExtensionUtility::registerModule(
    'lth.' . $_EXTKEY
);*/

$feeditsimpleUsersettings = $_COOKIE['feeditSimple-usersettings'];
$userSettingsArray = json_decode($feeditsimpleUsersettings, TRUE);

//login hook
//$GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['t3lib/class.t3lib_tcemain.php']['processCmdmapClass'][] = 'LTH\\get_menu\\Hooks\\ProcessCmdmap';
//$TYPO3_CONF_VARS['SC_OPTIONS']['t3lib/class.t3lib_userauth.php']['postUserLookUp'][] = 'LTH\\lth_feedit_simple\\Hooks\\ProcessCmdmap->postUserLookUp';

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScript('lth_feedit_simple', 'setup', '
    #############################################
    ## TypoScript added by extension "lth_feedit_simple"
    #############################################
    
[globalVar = GP:type = ]
    styles.content.get.stdWrap.dataWrap = <div class="connectedSortable" id="feEditSimple-normalColWrapper">|</div>
    
    styles.content.getRight.stdWrap.dataWrap = <div class="connectedSortable" id="feEditSimple-rightColWrapper">|</div>
    styles.content.getRight.stdWrap.required=1

    styles.content.getLeft.stdWrap.dataWrap = <div class="connectedSortable" id="feEditSimple-leftColWrapper">|</div>
    styles.content.getLeft.stdWrap.required=1
    
    #lib.left-nav.includeNotInMenu = 1
    #lib.main-nav.includeNotInMenu = 1
[global]
', 43); // add this code AFTER the "css_styled_content" code (43) (because CSC empties styles > and would delete our changes)

	// Settings needed to be forced for showing hidden records to work
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addUserTSConfig('
        admPanel {
            enable.edit = 1
            hide = 1
            #override {
                #preview = 1
                #preview.showHiddenPages = 1
                #preview.showHiddenRecords = 1
            #}
        }
        options.enableBookmarks = 1
');

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig('
    TCEFORM.tt_content {
        # Disable fields that specify/change image dimensions
        imagewidth.disabled = 1
        imageheight.disabled = 1
        section_frame.disabled = 1

        # Limit column selection
        imagecols.keepItems = 1, 2, 3, 4
        imagecols.types.textpic.keepItems = 1, 2
    }
    TCEMAIN.table.pages.disableHideAtCopy = 1
');