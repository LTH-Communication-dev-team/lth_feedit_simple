<?php
/***************************************************************
*  Copyright notice
*
*  (c) 2009 David Slayback <dave@webempoweredchurch.org>
*  (c) 2009 Jeff Segars <jeff@webempoweredchurch.org>
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*  A copy is found in the textfile GPL.txt and important notices to the license
*  from the author is found in LICENSE.txt distributed with these scripts.
*
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.	 See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/

/**
 * Menu for advanced frontend editing.
 * This class is responsible for building the HTML of the items on top of the FE editing
 * but does not worry about the overall (rights etc)
 * 
 * This class delivers four main functions
 *   => init() sets up the paths and templates
 *   => addToolbar() and addItem() to add sections to the menu, and items to the sections
 *   => build() which renders the sections and items added previously 
 *
 * @author	David Slayback <dave@webempoweredchurch.org>
 * @author	Jeff Segars <jeff@webempoweredchurch.org>
 * @package TYPO3
 * @subpackage feEditSimple
 */

class lth_feeditsimple_menu {

	/**
	 * local copy of cObject to perform various template operations
	 * @var		tslib_content
	 */
	protected $cObj = NULL;
	/**
	 * the ID of the current page (references pages::uid)
	 * @var 	int
	 */
	protected $pid = 0;
	
	/**
	 * the name of the current user (FE takes precedence over BE)
	 * @todo	why is this needed?
	 * @var 	string
	 */
	protected $username = '';
	
	/**
	 * the path to the images
	 * @var 	string
	 */
	protected $imagePath = '';

	/**
	 * the array with the TSconfig
	 * @var 	array
	 */
	protected $modTSconfig = '';

	/**
	 * HTML marker template string for the edit panel
	 * @var		string
	 */
	protected $template = '';


	/**
	 * flag whether the menu is opened
	 * @var		boolean
	 */
	protected $menuOpen = false;


	/**
	 * prefix for all CSS-classes outputted through this file
	 * @var		string
	 */
	protected $cssPrefix = 'feEditSimple';


	/**
	 * holds all the sections of the menu
	 * @var		array
	 */
	protected $sections = array();
	
	
	/**
	 * holds all the sections of the menu, and in each section the items for the section
	 * @var		array
	 */
	protected $itemList = array();


	/**
	 * note: don't know when this is needed currently
	 *
	 */
	protected $userList = false;
        

	/**
	 * Initializes the menu.
	 *
	 * @return	void
	 * @todo	Any reason this isn't a constructor?
	 */
	public function init() {

                $this->cObj = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('TYPO3\\CMS\\Frontend\\ContentObject\\ContentObjectRenderer');
		$this->pid  = intval($GLOBALS['TSFE']->id);
		$this->modTSconfig = \TYPO3\CMS\Backend\Utility\BackendUtility::getModTSconfig($this->pid, 'FeEdit');

			// TODO: do we need this?
		//$this->getUserListing();

			// check if the menu is opened
		if (!isset($GLOBALS['BE_USER']->uc['TSFE_adminConfig']['menuOpen'])
			|| ($GLOBALS['BE_USER']->uc['TSFE_adminConfig']['menuOpen'] == true)) {
			$this->menuOpen = true;
		}

		$this->username = ($GLOBALS['TSFE']->fe_user->user['username'] ? $GLOBALS['TSFE']->fe_user->user['username'] : $GLOBALS['BE_USER']->user['username']);

			// setting the base path for the icons
		$this->imagePath = $this->modTSconfig['properties']['skin.']['imagePath'];
		$this->imagePath = ($this->imagePath ? $this->imagePath : \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::siteRelPath('lth_feedit_simple') . 'res/icons/');

			// loading template
		$templateFile = $this->modTSconfig['properties']['skin.']['templateFile'];
		$templateFile = ($templateFile ? $templateFile : \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::siteRelPath('lth_feedit_simple') . 'res/template/feedit.tmpl');
		$templateFile = $GLOBALS['TSFE']->tmpl->getFileName($templateFile);
		$templateFile = $GLOBALS['TSFE']->tmpl->fileContent($templateFile);
		$this->template =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($templateFile, '###MENU_' . ($this->menuOpen ? 'OPENED' : 'CLOSED' ) . '###');
	}

        /*function insertButtons()
        {
            $content = '';
            $content .= "<div onclick=\"toggleItem('.feEditSimple-leftMenu');\" class=\"lth_feedit_simple-editButton toggleMenuButton\"></div>";
            return $content;
        }
        
        function leftMenu()
        {
            $content = '';
            $content .= "<div class=\"feEditSimple-leftMenu\"></div>";
            return $content;
        }*/
        
        function insertMenu()
        {
            /*if(!$feeditsimpleUsersettings) {
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("tx_feEditSimple_usersettings", "be_users", "uid=" . intval($GLOBALS['BE_USER']->user['uid']));
                $row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res);
                $feeditsimpleUsersettings = $row['tx_feEditSimple_usersettings'];
                $GLOBALS['TYPO3_DB']->sql_free_result($res);    
            }*/
            
            $pageUid = $GLOBALS['TSFE']->id;
            $userSettingsArray = array();
            if(isset($_COOKIE['feeditSimple-usersettings'])) {
                $feeditsimpleUsersettings = $_COOKIE['feeditSimple-usersettings'];
                //echo $feeditsimpleUsersettings;
                $userSettingsArray = json_decode($feeditsimpleUsersettings, TRUE);
            } else {
                $userSettings = $this->getUserSettings($GLOBALS['BE_USER']->user['uid']);
                if($userSettings) {
                    $feeditsimpleUsersettings = $userSettings;
                    $userSettingsArray = json_decode($feeditsimpleUsersettings, TRUE);
                    try {
                        setcookie("feeditSimple-usersettings", $feeditsimpleUsersettings, "0", "/");
                    }
                    //catch exception
                    catch(Exception $e) {
                        echo 'Message: ' .$e->getMessage();
                    }
                } else {
                    $userSettingsArray["hiddenElement"] = "None";
                    $userSettingsArray["hiddenInMenu"] = "None";
                    $userSettingsArray["hiddenPage"] = "None";
                    $feeditsimpleUsersettings = json_encode($userSettingsArray);
                    try {
                        setcookie("feeditSimple-usersettings", $feeditsimpleUsersettings, "0", "/");
                        $updateArray = array('tx_feEditSimple_usersettings' => $feeditsimpleUsersettings, 'tstamp' => time());
                        $GLOBALS['TYPO3_DB']->exec_UPDATEquery('be_users', 'uid='.intval($GLOBALS['BE_USER']->user['uid']), $updateArray);
                    }
                    //catch exception
                    catch(Exception $e) {
                        echo 'Message: ' .$e->getMessage();
                    }
                }
            }
           
            $hidden = $GLOBALS['TSFE']->page['hidden'];
            $nav_hide = $GLOBALS['TSFE']->page['nav_hide'];
            $pastePage = '';
            $content = '';
            $content .= $extraCSS;
            /*
             * lth_feedit_simple_top_menu
             * <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <b class="caret"></b></a>
             */
            if($_COOKIE['feeditSimple-copycutpage']) {
                $pastePage = '<li><a id="feeditSimple-pastePageAfterButton" title="' . 
                    $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pagePastePageAfterTooltip').'" href="javascript:">' .
                    $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pagePastePageAfter').
                    '</a></li>';
                $pastePage .= '<li><a id="feeditSimple-pastePageIntoButton" title="' . 
                    $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pagePastePageIntoTooltip').'" href="javascript:">' .
                    $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pagePastePageInto').
                    '</a></li>';
            }
            $content .= '
            <ul class="nav navbar-nav feeditSimple-mainMenu">
                
               <!-- <li id="" class="dropdown" title="">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageTooltip').'">
                        <span class="icon-edit"></span>
                        '.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:page').'
                    </a>
                    <ul class="dropdown-menu">
                        <li><a id="feeditSimple-editPageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageEditPageTooltip').'" href="#feeditSimple-sidePanel">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageEditPage').'</a></li>
                        <li><a id="feeditSimple-cutPageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageCutPageTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageCutPage').'</a></li>
                        <li><a id="feeditSimple-copyPageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageCopyPageTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageCopyPage').'</a></li>'
                    . $pastePage
                    .  '<li><a id="feeditSimple-deletePageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageDeletePageTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageDeletePage').'</a></li>';
                        if($hidden) {
                            $content .= '<li><a id="feeditSimple-showPageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageShowPageTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageShowPage').'</a></li>';
                        } else {
                            $content .= '<li><a id="feeditSimple-hidePageButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageHidePageTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageHidePage').'</a></li>';
                        }
                        if($nav_hide) {
                            $content .= '<li><a id="feeditSimple-showPageInMenuButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageShowPageInMenuTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageShowPageInMenu').'</a></li>';
                        } else {
                            $content .= '<li><a id="feeditSimple-hidePageInMenuButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageHidePageInMenuTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pageHidePageInMenu').'</a></li>';
                        }
                    $content .= '</ul>
                </li> -->

		<li id="" class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:addTooltip').'">
                        <span class="icon-plus"></span>
                        <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:add').'</span>
                    </a>
                    <ul class="dropdown-menu">
                           <!--  <li><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newPageTooltip').'" href="#" onclick="newPage();return false;">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newPage').'</a></li>
                            <li><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newContentTooltip').'" href="#" onclick="newContent();return false;">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newContent').'</a></li> -->
                          <!--  <li id="lth_feedit_simple_create_news"><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newNewsTooltip').'" href="#" onclick="createNews();return false;">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newNews').'</a></li> -->
                            <li><a id="feeditSimple-addRightColumn" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newInsertRightColumnTooltip').'" href="javascript:">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:newInsertRightColumn').'</a></li>
                    </ul>
                </li>
             
                <li id="" class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:toolTooltip').'">
                        <span class="icon-cog"></span>
                        <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:tool').'</span>
                    </a>
                        <ul class="dropdown-menu">
                            <!-- <li><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:toolFileManagerTooltip').'" href="javascript:;">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:toolFileManager').'</a></li> -->
                            <li><a id="feeditSimple-formHandler" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:toolMailFormManagerTooltip').'" href="javascript:;">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:toolMailFormManager').'</a></li>
                        </ul>
                </li>                

                <li id="" class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayTooltip').'">
                        <span class="icon-eye-open"></span>
                        <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:display').'</span>
                    </a>
                        <ul class="dropdown-menu">
                            <li><a id="feeditSimple-toggleHiddenElement" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenContent'.$userSettingsArray['hiddenElement'].'Tooltip').'" href="javascript:"><span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenContent'.$userSettingsArray['hiddenElement']).'</span></a></li>
                            <li><a id="feeditSimple-toggleHiddenInMenu" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenInMenu'.$userSettingsArray['hiddenInMenu'].'Tooltip').'" href="javascript:"><span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenInMenu'.$userSettingsArray['hiddenInMenu']).'</span></a></li>
                            <li><a id="feeditSimple-toggleHiddenPage" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenPage'.$userSettingsArray['hiddenPage'].'Tooltip').'" href="javascript:"><span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:displayHiddenPage'.$userSettingsArray['hiddenPage']).'</span></a></li>
                        </ul>
                </li>
             
                <li id="" class="dropdown">
                    <a id="feeditSimple-helpButton" href="javascript:" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:helpTooltip').'");return false;" href="#">
                        <span class="icon-question-sign"></span>
                        <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:help').'</span>
                    </a>
                </li>
                
                ';
                        
                /*$hiddenStyle = ' style="display:none;"';
                if ($_COOKIE['lth_feedit_simple_copycutitem']) {
                    $hiddenStyle ='';
                }
                $content .= '<li id="lth_feedit_simple_top_menu_paste" class="top_menu_item"'.$hiddenStyle.'>
                    <a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:pasteTooltip').'" onclick="pasteAction(\'\');return false;" href="#">
                    <span class="icon-download-alt"></span>
                    <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:paste').'</span>
                    </a>
                </li>';
		
		$content .= '<li id="lth_feedit_simple_top_menu_hide_content_elements_row" class="top_menu_item"'.$hiddenStyle.'>
                    <a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:hideContentElementsRowTooltip').'" onclick="hideContentElementsRow(\'\');return false;" href="#">
                    <span class="icon-remove"></span>
                    <span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:hideContentElementsRow').'</span>
                    </a>
                </li>';*/
                    
                    $location = \TYPO3\CMS\Backend\Utility\BackendUtility::getModuleUrl('record_edit', array(
                    'edit[pages]['.$this->pid.']' => 'edit',
                    //'defVals[tt_content][colPos]' => 0,
                    //'defVals[tt_content][sys_language_uid]' => 0,
                    'noView' => 1,
                    'feEdit' => 0,
                    'returnUrl' => 'sysext/backend/Resources/Private/Templates/Close.html'
                ));
                   // echo $location;
                
                $content .= '<li id="" class="">
                    <div id="msg-div"></div>
                </li>
                
                <li id="" class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userTooltip').'">
                        <span class="icon-user"></span>
                        ' . $GLOBALS['BE_USER']->user['username'] . '
                    </a>
                    <ul class="dropdown-menu">
                        <!-- <li><a id="feeditSimple-userSettingsButton" title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userSettingsTooltip').'" href="#feeditSimple-sidePanel">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userSettings').'</a></li> -->
                        <li><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userBackendTooltip').'" href="/typo3/">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userBackend').'</a></li>
                        <li><a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userLogoutTooltip').'" href="/typo3/logout.php?redirect='.\TYPO3\CMS\Core\Utility\GeneralUtility::getIndpEnv('TYPO3_REQUEST_URL').'">'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:userLogout').'</a></li>
                    </ul>
                </li>
                
                <li id="" class="" style="padding-top:4px;margin-left:20px;">
                    <button type="button" id="lth_feedit_simple-saveChanges" class="btn btn-success btn-xs" disabled>' . $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:saveButton').'</button>
                </li>
                
                <li id="feEditSimple-logo">
                    <a title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:topLogoTooltip').'" href="http://typo3.org">
                    <span class="feEditSimple-logo"></span></a>
                </li>
                
                
            </ul>
		<input type="hidden" name="TSFE_ADMIN_PANEL[preview_showHiddenPages]" value="' . ($GLOBALS['BE_USER']->uc['TSFE_adminConfig']['preview_showHiddenPages'] ? 1 : 0) . '" id="preview_showHiddenPages" />
		<input type="hidden" name="TSFE_ADMIN_PANEL[preview_showHiddenRecords]" value="' . ($GLOBALS['BE_USER']->uc['TSFE_adminConfig']['preview_showHiddenRecords'] ? 1 : 0) . '" id="preview_showHiddenRecords" />
                 <input type="hidden" name="beUserLang" id="beUserLang" value="' . $GLOBALS['BE_USER']->uc['lang'] . '"/>
                 <input type="hidden" id="lth_feedit_simple-location" name="lth_feedit_simple-location" value="' . $location . '"/>
                  ';

                /* <div class="btn-group btn-toggle"> 
    <button class="btn btn-xs btn-default">ON</button>
    <button class="btn btn-xs btn-primary active">OFF</button>
  </div>
                $content .= "<script>$('.btn-toggle').click(function() {
        console.log('???');
    $(this).find('.btn').toggleClass('active');  
    
    if ($(this).find('.btn-primary').size()>0) {
    	$(this).find('.btn').toggleClass('btn-primary');
    }
    if ($(this).find('.btn-danger').size()>0) {
    	$(this).find('.btn').toggleClass('btn-danger');
    }
    if ($(this).find('.btn-success').size()>0) {
    	$(this).find('.btn').toggleClass('btn-success');
    }
    if ($(this).find('.btn-info').size()>0) {
    	$(this).find('.btn').toggleClass('btn-info');
    }
    
    $(this).find('.btn').toggleClass('btn-default');
       
});</script>";*/
            return $content;
        }
        
                        /*<li id="lth_feedit_simple_top_menu_hiddencontent" class="top_menu_item">
                    <div title="'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:showhiddenTooltip').'">
			<input id="feEditSimple-showHiddenContent-input" type="checkbox" value="1">
			<span>'.$GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:showhidden').'</span>
                    </div>
                </li>*/

	/**
	 * This actually renders the top menu (depending on the state whether it's opened or not)
	 * and takes care of the templating and HTML
	 * 
	 * called from tx_feeditsimple_adminpanel->buildMenu()
	 *
	 * @return	string the ready to go HTML
	 */
	public function build() {
		$this->init();
                

		$markers = array(
			'EXTPATH'   => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::siteRelPath('lth_feedit_simple'),
			'CSSPREFIX' => $this->cssPrefix
		);

			// if the menu is not open, then just show "Activate editing" box
		if (!$this->menuOpen) {
				$markers['OPEN_EDIT_MODE'] = $this->getLL('statusActivateEditing');
				$markers['OPEN_EDIT_MODE_TOOLTIP'] = $this->getLL('openTooltip');
		} else {
				// otherwise, the menu is open

				// @todo Temporary code to draw and "Edit Page" button.
				// @todo does not work by now
			$data = $GLOBALS['TSFE']->page;
			$this->cObj->start($data, 'pages');
			$conf = array(
				'allow' => 'edit,new,delete,hide',
				'template' => 'EXT:lth_feedit_simple/res/template/page_buttons.tmpl'
			);
			$markers['PAGE_EDIT_PANEL'] = $this->insertMenu();
                        //$markers['PAGE_EDIT_PANEL'] = $this->cObj->editPanel('', $conf);

				// show all sections and accompanying items that are in the first row
			$sectionParts  =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($this->template, '###SECTIONS_FIRST_ROW###');
			$templateSection    =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($sectionParts, '###SECTION###');
			$templateSingleItem =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($sectionParts, '###SINGLE_ITEM###');
			$templateSeparator  =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($sectionParts, '###SEPARATOR###');

			$subparts = array(
				'SECTIONS_FIRST_ROW'  => '',
				'SECTIONS_SECOND_ROW' => '',
				'USERLISTING' => '',
			);
			
			// loop through each section and render the section and the items
			foreach ($this->sections as $section) {
				$items = $this->itemList[$section['name']];
				if (!count($items)) {
					continue;
				}
				$sectionMarkers = array(
					'CSSID'     => $section['id'],
					'INLINECSS' => $section['inlineCSS'],
					'ITEMS'     => ''
				);
				foreach ($items as $item) {
					$itemMarkers = array(
						'SEPARATOR' => ($section['useSeparator'] ? $templateSeparator : ''),
						'NAME'      => $item
					);
					$sectionMarkers['ITEMS'] .=  \TYPO3\CMS\Core\Html\HtmlParser::substituteMarkerArray($templateSingleItem, $itemMarkers, '###ITEM_|###');
				}
				if ($section['isInFirstRow']) {
					$subparts['SECTIONS_FIRST_ROW'] .=  \TYPO3\CMS\Core\Html\HtmlParser::substituteMarkerArray($templateSection, $sectionMarkers, '###SECTION_|###');
				} else {
					$subparts['SECTIONS_SECOND_ROW'] .=  \TYPO3\CMS\Core\Html\HtmlParser::substituteMarkerArray($templateSection, $sectionMarkers, '###SECTION_|###');
				}
			}

				// add section = showing users online
			if ($this->userList) {
				$userMarkers = array('USER_LIST' => $this->userList, 'USER_LABEL' => $this->getLL('usersOnPage'));
				$subparts['USERLISTING'] =  \TYPO3\CMS\Core\Html\HtmlParser::getSubpart($this->template, '###USERLISTING###');
				$subparts['USERLISTING'] =  \TYPO3\CMS\Core\Html\HtmlParser::substituteMarkerArray($subparts['USERLISTING'], $userMarkers, '###|###');
			}

			// replace each subpart
			foreach ($subparts as $subpartKey => $subpartContent) {
				$this->template = $this->cObj->substituteSubpart($this->template, '###' . $subpartKey . '###', $subpartContent);
			}
		}

		$content =  \TYPO3\CMS\Core\Html\HtmlParser::substituteMarkerArray($this->template, $markers, '###|###');

			// hook to add additional menu features, including a sidebar
		if (is_array($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['EXT:lth_feedit_simple/view/class.lth_feeditsimple_menu.php']['build'])) {
			$_params = array(
				'menuOut' => &$content,	// deprecated, should use "content" now
				'content' => &$content,
				'isMenuOpen' => $menuOpen,
				'pObj' => &$this
			);
			foreach ($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['EXT:lth_feedit_simple/view/class.lth_feeditsimple_menu.php']['build'] as $_funcRef) {
				$content = \TYPO3\CMS\Core\Utility\GeneralUtility::callUserFunction($_funcRef, $_params, $this);
			}
		}
		return $content;
	}


	/***
	  * API functions to add sections to the toolbar and items to the sections
	  * 
	  * these two functions add the content that later buildMenu() renders
	  */
	/**
	 * adds an item to the toolbar on top by taking all the need components and build the HTML element
	 * 
	 * is usually called by feeditsimple_adminpanel
	 * 
	 * @param	$name	name of the section, later used in the addItem() function to put the item to right spot
	 * @param	$id	the ID of the HTML element used 
	 * @param	$useSeparator	whether to use the template with the separator
	 * @param	$inlineCSS		whether to add inline CSS to the element
	 * @param	$isInFirstRow	whether this section should be put in the first row or in second row
	 * @return	void
	 */
	public function addToolbar($name, $id = 0, $useSeparator = false, $inlineCSS = '', $isInFirstRow = false) {
		$this->sections[] = array(
			'name'         => $name,
			'id'           => $this->cssPrefix . '-' . ($id ? $id : lcfirst($name)),
			'useSeparator' => $useSeparator,
			'inlineCSS'    => $inlineCSS,
			'isInFirstRow' => $isInFirstRow
		);
	}


	/**
	 * adds an item to the toolbar on top by taking all the need components and build the HTML element
	 * 
	 * is usually called by feeditsimple_adminpanel
	 * 
	 * @param	$section	the section the item is placed in
	 * @param	$name	the name of the item
	 * @param	$action	the action the item is called (used as an ID for the HTML)
	 * @param	$image	the image associated with the item
	 * @param	$title	the value of the title attribute for the anchor tag, optional
	 * @param	$onClick	additional Javascript (note: needs the onclick="" as well in the parameter)
	 * @param	$btnClass	the additional class for the whole button
	 * @param	$labelClass	the additional class for the label (is inside a <span> tag)
	 * @param	$hrefParams	the additional parameters added to the href="" attribute of the link, not used but sent to the server when adding this element to the page.
	 * @param	$rel	The rel attribute.
	 * @return	void
	 */
	public function addItem($section, $name, $action, $image, $title = '', $onClick = '', $btnClass = '', $labelClass = '', $hrefParams = '', $rel = '') {

		$ATagParams = array();
		$ATagParams[] = 'href="' . (strlen($hrefParams) ? $hrefParams : '#') . '"';
		
		if (strlen($action)) {
			$ATagParams[] = 'id="' . $action . '"';
		}
		$ATagParams[] = 'class="' . $this->cssPrefix . '-button' . (strlen($btnClass) ? ' ' . $btnClass : '') . '"';
		if (strlen($title)) {
			$ATagParams[] = 'title="' . $title . '"';
		}
		if (strlen($onClick)) {
			$ATagParams[] = $onClick;
		}
		if (strlen($rel)) {
			$ATagParams[] = 'rel="' . $rel . '"';
		}
		if (strlen($image)) {
			$imageTag = '<img src="' . $this->imagePath . $image . '" class="' . $this->cssPrefix . '-buttonImage" alt="" />';
		}
		$label = '<span class="' . $this->cssPrefix . '-buttonText' . (strlen($labelClass) ? ' ' . $labelClass : '') . '">' . $name . '</span>';

		$this->itemList[$section][] = '<a ' . implode(' ', $ATagParams) . '>' . $imageTag . $label . '</a>';
	}


	/**
	 * returns a label from the Locallang TSFE file, based on the key
	 * this is mainly a shortcut version to not write the LL file with it all the time
	 * @
	 * @return	string	the localized label
	 */
	protected function getLL($key) {
            return $GLOBALS['LANG']->sL('LLL:EXT:lang/locallang_tsfe.xml:' . $key, true);
	}

        
        protected function getUserSettings($userId)
        {
            $userSettings;
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("tx_feEditSimple_usersettings", "be_users", "uid=" . intval($userId));
            $row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res);
            $userSettings = $row['tx_feEditSimple_usersettings'];
            $GLOBALS['TYPO3_DB']->sql_free_result($res);
            return $userSettings;
        }

	/**
	 * returns a list of all users editing something currently
	 * 
	 * @note don't know when and how we need this, also, this method needs cleanup, badly!
	 *
	 * @return	void	all the info is stored in $this->userList
	 */
	protected function getUserListing() {
		$records = $GLOBALS['TYPO3_DB']->exec_SELECTgetRows(
			'locks.*, user.realName',
			'sys_lockedrecords AS locks LEFT JOIN be_users AS user ON locks.userid=user.uid',
			'locks.userid!='.intval($GLOBALS['BE_USER']->user['uid']).'
			AND locks.tstamp > '.($GLOBALS['EXEC_TIME']-2*3600) .' 
			AND ( (locks.record_pid='.intval($this->pid) .' AND	 locks.record_table!=\'pages\') OR
			(locks.record_uid='.intval($this->pid) .' AND  locks.record_table=\'pages\') )'
			);
		$oldUser = 0;
		$user = 0;
		$userList = array();
		$openedRecords = array();
		if (is_array($records)) {
			foreach($records AS $lockedRecord) {
				$user = $lockedRecord['userid'];
				
				if($user != $oldUser) {
					$userList[$user] = ($lockedRecord['realName'] != '' ? $lockedRecord['realName'] : $lockedRecord['username']);
					$openedRecords[$user] = array('page' => 99999999999, 'content' => 99999999999, 'data' =>99999999999);		
				}
				switch ($lockedRecord['record_table']) {
					case 'pages':
						if( $lockedRecord['tstamp'] < $openedRecords[$user]['page'] ) {
							$openedRecords[$user]['page'] = $lockedRecord['tstamp'];
						}
						break;
					case 'tt_content':
						if( $lockedRecord['tstamp'] < $openedRecords[$user]['content'] ) {
							$openedRecords[$user]['content'] = $lockedRecord['tstamp'];
						}
					default:
						if( $lockedRecord['tstamp'] < $openedRecords[$user]['data'] ) {
							$openedRecords[$user]['data'] = $lockedRecord['tstamp'];
						}
						break;
				}
				$oldUser = $user;	
			}
		}
		$renderedListing = array();
		foreach($userList AS $userID => $userName) {
			if ($openedRecords[$userID]['page'] < 99999999999) {
				$time = $openedRecords[$userID]['page'];
				$openedRecords[$userID]['page'] = 'Page-Information (since ';
				$openedRecords[$userID]['page'] .= t3lib_BEfunc::calcAge($GLOBALS['EXEC_TIME']-$time, $GLOBALS['LANG']->sL('LLL:EXT:lang/locallang_core.php:labels.minutesHoursDaysYears'));
				$openedRecords[$userID]['page'] .= ')';
			} else {
				unset($openedRecords[$userID]['page']);
			}
			if ($openedRecords[$userID]['content'] < 99999999999) {
				$time = $openedRecords[$userID]['content'];
				$openedRecords[$userID]['content'] = 'Contents (since ';
				$openedRecords[$userID]['content'] .= t3lib_BEfunc::calcAge($GLOBALS['EXEC_TIME']-$time, $GLOBALS['LANG']->sL('LLL:EXT:lang/locallang_core.php:labels.minutesHoursDaysYears'));
				$openedRecords[$userID]['content'] .= ')';
			} else {
				unset($openedRecords[$userID]['content']);
			}
			if ($openedRecords[$userID]['data'] < 99999999999) {
				$time = $openedRecords[$userID]['data'];
				$openedRecords[$userID]['data'] = 'Data (since ';
				$openedRecords[$userID]['data'] .= t3lib_BEfunc::calcAge($GLOBALS['EXEC_TIME']-$time, $GLOBALS['LANG']->sL('LLL:EXT:lang/locallang_core.php:labels.minutesHoursDaysYears'));
				$openedRecords[$userID]['data'] .= ')';
			} else {
				unset($openedRecords[$userID]['data']);
			}
			$message = $userName. ' currently editing: '. implode(', ',$openedRecords[$userID]);
		
			$renderedListing[$userID] = '<span title="'. $message . '">';
			$renderedListing[$userID] .= $userName;
			$renderedListing[$userID] .= '</span>';
		}
		
		$this->userList = implode(', ',$renderedListing);
	}
       
}

if (defined('TYPO3_MODE') && $TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/lth_feedit_simple/view/class.lth_feeditsimple_menu.php']) {
	include_once($TYPO3_CONF_VARS[TYPO3_MODE]['XCLASS']['ext/lth_feedit_simple/view/class.lth_feeditsimple_menu.php']);
}