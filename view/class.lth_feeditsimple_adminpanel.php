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
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/

/**
 * Top menu bar for advanced frontend editing.
 *
 * @author	David Slayback <dave@webempoweredchurch.org>
 * @author	Jeff Segars <jeff@webempoweredchurch.org>
 * @package TYPO3
 * @subpackage feEditSimple
 */

//use TYPO3\CMS\Core\Resource\Collection\FolderBasedFileCollection;
use TYPO3\CMS\Core\Resource\ResourceFactory;

class user_feeditsimple_adminpanel {
	/**
	 * Admin panel related configuration.
	 *
	 * @var		array
	 */
	protected $admPanelTSconfig = array();

	/**
	 * feEditSimple TS configuration
	 *
	 * @var 	array
	 */
	protected $modTSconfig;

	/**
	 * Indicates whether the menu is currently open.
	 *
	 * @var		boolean
	 */
	protected $menuOpen = false;

	/**
	 * contains the menu bar object
	 *
	 * @var		tx_feEditSimple_menu object
	 */
	protected $menuBar = NULL;

	/**
	 * Indicates if mod was disabled
	 *
	 * @var		boolean
	 */
	protected $disabled = false;

	/**
	 * HTML marker template string for the menu
	 * @var		string
	 */
	protected $template = '';


	/**
	 * prefix for all CSS-classes outputted through this file
	 * @var		string
	 */
	protected $cssPrefix = 'feEditSimple';


	public function __construct()
	{
	    if (is_object($GLOBALS['BE_USER']) && $GLOBALS['TSFE']->beUserLogin && t3lib_div::_GP('type')!='200' && t3lib_div::_GP('type')!='225') {
			// set up general configuration
		if (!count($this->admPanelTSconfig)) {
			$this->admPanelTSconfig = t3lib_BEfunc::getModTSconfig($GLOBALS['TSFE']->id, 'admPanel');
			$this->modTSconfig      = t3lib_BEfunc::getModTSconfig($GLOBALS['TSFE']->id, 'FeEdit');
			$GLOBALS['TSFE']->determineId();
		}

			// check if frontend editing is enabled
		if ($this->modTSconfig['properties']['disable'] || (!$GLOBALS['BE_USER']->frontendEdit instanceOf t3lib_FrontendEdit)) {
			$this->disabled = true;
			return;
		}

			// check if the menu is already opened
		if (!isset($GLOBALS['BE_USER']->uc['TSFE_adminConfig']['menuOpen']) || $GLOBALS['BE_USER']->uc['TSFE_adminConfig']['menuOpen']) {
			$this->menuOpen = true;
		}
		$this->backendUser = $GLOBALS['BE_USER'];
			    // run through the actions
		    //$this->actionHandler();
	    }
	}



	/**
	 * Static method for displaying the top menu bar, this is where TYPO3 hooks in.
	 *
	 * @note edited the method to work with better than temporarily solution.
	 *
	 * @return void
	 */
	public static function showMenuBar($params, $parent)
	{
	    if (is_object($GLOBALS['BE_USER']) && $GLOBALS['TSFE']->beUserLogin && t3lib_div::_GP('type')!='200' && t3lib_div::_GP('type')!='225') {
		$adminPanel = t3lib_div::makeInstance('user_feeditsimple_adminpanel');
		$feEditContent = self::processAbsRefPrefix($parent, $adminPanel->display());
		$parent->content = str_replace('</body>', $feEditContent . '</body>', $parent->content);
	    }
	}


	/**
	    * Displays the admin panel out of the template
	    * ...which now becomes a menu
	    *
	    * @return	string
	    */
	public function display()
	{
	    
	    if ($this->disabled) {
		    return;
	    }
            /*$folderIdentifier = 'images';
            $start = 0;
            $maxNumberOfItems = 1000000;
            $useFilters = TRUE;
            $recursive = TRUE;
            $storageUid = 1;
            $iPid = 1;
            
            $depth = 999999;
$queryGenerator = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance( 'TYPO3\\CMS\\Core\\Database\\QueryGenerator' );
$rGetTreeList = $queryGenerator->getTreeList($iPid, $depth, 0, 1); //Will be a string
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("uid,pid,title","pages","uid IN($rGetTreeList)");
            while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
                $uid = $row['uid'];
                $pid = $row['pid'];
                $title = $row['title'];
                $pageArray[] = array('id' => $uid, 'text' => $title, 'type' => '????', 'parent' => $pid);
            }
            echo '<pre>';
           // $finalArray[] = array('id' => 'fileadmin', 'text' => 'fileadmin', 'type' => 'folder', 'children' => $filearray);
           // echo json_encode($filearray);

            print_r($pageArray);
            //print_r($fileObjects);
            //print_r($fileArray);
            echo '</pre>';
*/
            //$storageRepository = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('TYPO3\\CMS\\Core\\Resource\\StorageRepository');
/*
//$fileObjects = [];
$fileObjects = \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFileIdentifiersInFolder('images', $useFilters, $recursive);     
$folderObjects = \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFolderIdentifiersInFolder('images', $useFilters, $recursive);
//$folderObjects['/images/'] = '/images/';
            //$filesAndFolders = array_merge($fileObjects, $folderObjects);
            //asort($fileObjects);
            //$finalarray[] = $this->build_tree($fileObjects);
                
            $fileObjects = array_merge($fileObjects, \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFileIdentifiersInFolder('test', $useFilters, $recursive));
            $folderObjects = array_merge($folderObjects, \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFolderIdentifiersInFolder('test', $useFilters, $recursive));
            
            $fileArray[] = array('id' => '/images', 'text' => 'images', 'type' => 'folder', 'parent' => '#');
            $fileArray[] = array('id' => '/test', 'text' => 'test', 'type' => 'folder', 'parent' => '#');


            asort($folderObjects);
            foreach($folderObjects as $key => $value) {
                $keyArray = explode('/', rtrim($key, '/'));
                $text = array_pop($keyArray);
                $fileArray[] = array('id' => rtrim($key, '/'), 'text' => $text, 'type' => 'folder', 'parent' => implode('/', $keyArray));
            }
            
            asort($fileObjects);
            foreach($fileObjects as $key => $value) {
                $keyArray = explode('/', $key);
                $text = array_pop($keyArray);
                $fileArray[] = array('id' => $key, 'text' => $text, 'type' => 'file', 'parent' => implode('/', $keyArray));
            }
 * 
 */
            //$finalarray = $this->build_tree($fileObjects);
            /*foreach($fileArray as $fileentry) {
                $patharray = array_reverse(explode('/',$fileentry));
                $thisarray = $this->scanpath($patharray);
                $filearray = array_merge_recursive($filearray, $thisarray);
            }*/
            //echo '<pre>';
           // $finalArray[] = array('id' => 'fileadmin', 'text' => 'fileadmin', 'type' => 'folder', 'children' => $filearray);
           // echo json_encode($filearray);

            //print_r($folders);
            //print_r($fileObjects);
            //print_r($fileArray);
            //echo '</pre>';
	    $beUserUid = $GLOBALS["BE_USER"]->user["uid"];
		$be_typo_user = $_COOKIE['be_typo_user'];
		//$res = $GLOBALS['TYPO3_DB']->sql_query("select * from pages where uid=4");
		//$res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('*', 'table', 'uid='.intval($uid), 'groupby', 'orderby', 'limit') or die('175; '.mysql_error());
		/**try {
		    $sql = "CALL sp_lth_feedit_simple_user_sessions('".$beUserUid."','".$be_typo_user."')";
		    //echo $sql;
		    $res = $GLOBALS['TYPO3_DB']->sql_query($sql);
		    $GLOBALS['TYPO3_DB']->sql_free_result($res);
		    } catch(Exception $e) {
			
		    }
		//$res = $GLOBALS['TYPO3_DB']->sql_query("CALL sp_logError('".$var1."', '".$var2."')");
**/

	    // loading template
	    $templateFile = $this->modTSconfig['properties']['skin.']['templateFile'];
	    $templateFile = ($templateFile ? $templateFile : t3lib_extMgm::siteRelPath('lth_feedit_simple') . 'res/template/feedit.tmpl');
	    $templateFile = $GLOBALS['TSFE']->tmpl->getFileName($templateFile);
	    $this->template = $GLOBALS['TSFE']->tmpl->fileContent($templateFile);

	    $markers = array(
		    // have a form for adminPanel processing and saving of vars
		    //'HIDDEN_FORM' => '<form id="TSFE_ADMIN_PANEL_Form" name="TSFE_ADMIN_PANEL_Form" action="' . htmlspecialchars(t3lib_div::getIndpEnv('REQUEST_URI')) . '" method="post">' . $this->getAdmPanelFields() . '</form>',
		    'MENU_BAR'    => $this->buildMenu(),
		    'CSSPREFIX'   => $this->cssPrefix,
	    );

		    // @todo	This code runs after content has been created,
		    // thus we cannot insert data into the head using the page renderer.  Are there any other options?
	    if ($this->menuOpen) {
		    $markers['INCLUDES'] = $this->getIncludes();
	    } else {
		    $markers['INCLUDES'] = $this->getLinkTag(t3lib_extMgm::siteRelPath('lth_feedit_simple') . 'res/css/fe_edit_closed.css');
	    }

	    $content = t3lib_parsehtml::getSubpart($this->template, '###MAIN_TEMPLATE###');
	    return t3lib_parsehtml::substituteMarkerArray($content, $markers, '###|###');
	}
        
        
        protected function scanpath($patharray) {
            $tree = [];
            if(count($patharray)===1) {
                $filename = array_pop($patharray);
                $tree[] = array('id'=>$filename, 'text'=>$filename, 'type'=>'file');
            } else {
                $pathpart = array_pop($patharray);
                $tree[$pathpart]['id'] = $pathpart;
                $tree[$pathpart]['text'] = $pathpart;
                $tree[$pathpart]['type'] = 'folder';
                $tree[$pathpart]['children'] = $this->scanpath($patharray);
                //array_push($tree[$pathpart], 'apple', 'banana');
            }
            return $tree;
        }
        
        
        protected function build_tree($path_list)
        {
            /*
                 * "id" => str_replace('//','/', $dir . '/' . $f),
                    //"text" => str_replace('/','',$f),
                    "text" => $f,
                    "type" => "folder",
                    //"path" => $dir . '/' . $f,
                    "children" => scanFiles($dir . '/' . $f) // 
                 */
            $path_tree = array();
            foreach ($path_list as $path => $id) {
                $list = explode('/', trim($path, '/'));
                $last_dir =& $path_tree;
                foreach ($list as $dir) {
                    $last_dir =& $last_dir[$dir];
                }
                //$last_dir['__title'] = $title;
                $last_dir['id'] = $id;
                $last_dir['text'] = $id;
                $last_dir['type'] = 'file';
            }

            return $path_tree;
        }


	/**
	  * Gets the CSS and Javascript includes needed for the top panel
	  * @return		void
	  */
        protected function getIncludes()
	{
	    $extPath = t3lib_extMgm::siteRelPath('lth_feedit_simple');
	    $includes = array(
                
                //bootstrap
		//'bootstrap.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/bootstrap.css'),
		//'bootstrap-responsive.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/bootstrap-responsive.css'),
                //'bootstrap.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/bootstrap.js'),
                
                //bootstrap-datetimepicker
                'datetimepicker.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/datetimepicker.css'),
		'datetimepicker.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/bootstrap-datetimepicker.js'),
 
                //x-editable (bootstrap) 
                //'bootstrap-editable.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/bootstrap-editable.css'),
                //'bootstrap-editable.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/bootstrap-editable.js'),
                
                //Summernote
                'summernote.css' => $this->getLinkTag($extPath . 'vendor/summernote/summernote.css'),
                'summernote.js' => $this->getScriptTag($extPath . 'vendor/summernote/summernote.js'),
                
                //Sortable
                'sortable.js' => $this->getScriptTag($extPath . 'vendor/sortable/sortable.js'),
                
                //wysihtml5
                /*'bootstrap3-wysihtml5.all.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/bootstrap3-wysihtml5.all.js'),
                'bootstrap3-wysihtml5.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/bootstrap3-wysihtml5.css'),
                'bootstrap-theme.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/bootstrap-theme.css'),
                'font-awesome.min.css' => $this->getLinkTag($extPath . 'vendor/x-editable/css/font-awesome.min.css'),
		'wysihtml5-0.3.0.min.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/wysihtml5-0.3.0.min.js'),               
                'bootstrap-wysihtml5-0.0.2.min.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/bootstrap-wysihtml5-0.0.2.js'),
		'wysihtml5.js' => $this->getScriptTag($extPath . 'vendor/x-editable/js/wysihtml5.js'),
                load files needed for jquery file upload
                */
                 
                //load files for bootstrap-treeview
                //'bootstrap-treeview.css' => $this->getLinkTag($extPath . 'vendor/bootstraptreeview/css/bootstrap-treeview.css'),
                //'bootstrap-treeview.js' => $this->getScriptTag($extPath . 'vendor/bootstraptreeview/js/bootstrap-treeview.js'),
                
                //load files for jstree
                'jstree.css' => $this->getLinkTag($extPath . 'vendor/jstree/themes/default/style.min.css'),
                'jstree.min.js' => $this->getScriptTag($extPath . 'vendor/jstree/jstree.min.js'),
                
                //load files for jquery fileupload
                'jquery.ui.widget.js' => $this->getScriptTag($extPath . 'vendor/jqueryfileupload/js/vendor/jquery.ui.widget.js'),
                'jquery.iframe-transport.js' => $this->getScriptTag($extPath . 'vendor/jqueryfileupload/js/jquery.iframe-transport.js'),
                'jquery.fileupload.js' => $this->getScriptTag($extPath . 'vendor/jqueryfileupload/js/jquery.fileupload.js'),
                
                //load files needed for bootstrap-contextmenu
                'bootstrap-contextmenu.js' => $this->getScriptTag($extPath . 'vendor/bootstrapcontextmenu/bootstrap-contextmenu.js'),
                
                //load files needed for datatables
                'jquery.dataTables.min.css' => $this->getLinkTag($extPath . 'vendor/datatables/css/jquery.dataTables.min.css'),
                'buttons.bootstrap.min.css' => $this->getLinkTag($extPath . 'vendor/datatables/css/buttons.bootstrap.min.css'),
                'buttons.dataTables.min.css' => $this->getLinkTag($extPath . 'vendor/datatables/css/buttons.dataTables.min.css'),
                'jquery.dataTables.min.js' => $this->getScriptTag($extPath . 'vendor/datatables/js/jquery.dataTables.min.js'),
                'dataTables.buttons.js' => $this->getScriptTag($extPath . 'vendor/datatables/js/dataTables.buttons.min.js'),
                'jszip.min.js' => $this->getScriptTag('//cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js'),
                'pdfmake.min.js' => $this->getScriptTag('//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/pdfmake.min.js'),
                'vfs_fonts.js' => $this->getScriptTag('//cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/vfs_fonts.js'),
                'buttons.html5.js' => $this->getScriptTag($extPath . 'vendor/datatables/js/buttons.html5.min.js'),
                
                //load files needed for jquery panelslider
                'jquery.panelslider.min.js' => $this->getScriptTag($extPath . 'vendor/jquery-panelslider/jquery.panelslider.min.js'),
                
                //load files needed for redips
                'redips-table-min.js' => $this->getScriptTag($extPath . 'vendor/redips/redips-table-min.js'),
                
                //load files needed for bootstrap slider
                'bootstrap-slider.min.js' => $this->getScriptTag($extPath . 'vendor/bootstrap-slider/bootstrap-slider.min.js'),
                'bootstrap-slider.min.css' => $this->getLinkTag($extPath . 'vendor/bootstrap-slider/css/bootstrap-slider.min.css'),

                // load files needed for extension itself
                'lth_feedit_simple.css' => $this->getLinkTag($extPath . 'res/css/lth_feedit_simple.css'), 		
		'lth_feedit_simple.js' => $this->getScriptTag($extPath . 'res/js/lth_feedit_simple.js'),
	    );
            return implode(chr(10), $includes);
        }
	/**
	 * Builds the menu. Can hook in CSS and own menu here.
	 *
	 * @return	string		HTML to display the menu
	 */
	function buildMenu() {
		$content = '';

			// Allow to hook in the buildMenu process here,
			// this way you can exchange the menu building completely
		if (is_array($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['EXT:lth_feedit_simple/view/class.tx_feEditSimple_adminpanel.php']['buildMenu'])) {
			$_params = array(
				'input' => &$input,
				'pObj' => &$this
			);
			foreach ($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['EXT:lth_feedit_simple/view/class.tx_feEditSimple_adminpanel.php']['buildMenu'] as $_funcRef) {
				$content = t3lib_div::callUserFunction($_funcRef, $_params, $this);
			}
		}

		if (!$content && !$this->modTSconfig['properties']['menuBar.']['disable']) {
			$this->menuBar = t3lib_div::makeInstance('lth_feeditsimple_menu');

				// add sections for menu
			$this->menuBar->addToolbar('Actions',        'actionToolbar', false, '', true);
			$this->menuBar->addToolbar('ContextActions', 'contextToolbar', false, '', true);
			$this->menuBar->addToolbar('ContentType',    'contentTypeToolbar');
			$this->menuBar->addToolbar('Clipboard',      'clipboardToolbar', false, 'style="display:none;"');

				// build the menus here
			// @todo need to check permissions here too
			$tsMenuBar  = $this->modTSconfig['properties']['menuBar.'];
			$menuConfig = t3lib_div::trimExplode(',', ($tsMenuBar['config'] ? $tsMenuBar['config'] : 'action,type,clipboard,context'));
			if (in_array('action', $menuConfig)) {
				$tsActions = t3lib_div::trimExplode(',', $tsMenuBar['actionMenu'], true);
				//@todo	Dead code so not yet localized.
				if (in_array('page', $tsActions)) {
					$this->menuBar->addItem('Actions', 'Page', 'fePageFunctions', '', 'Page functions', '');
				}
				if (in_array('file', $tsActions)) {
					$this->menuBar->addItem('Actions', 'File', 'feFileFunctions', '', 'File functions', '');
				}
				if (in_array('user', $tsActions)) {
					$this->menuBar->addItem('Actions', 'User', 'feUserFunctions', '', 'User functions');
				}
				if (in_array('events', $tsActions)) {
					$this->menuBar->addItem('Actions', 'Events', 'feEventFunctions', '', 'Event functions');
				}
				if (in_array('addplugin', $tsActions)) {
					$this->menuBar->addItem('Actions', 'Add Plugin', 'feAddPlugin', '', 'Add Plugin', '');
				}
				if (count($tsActions)) {
					$this->menuBar->addItem('Actions', '', '', '', '', '', 'spacer');
				}
			}

			// render new content element icons
			$this->renderNewContentElementIcons($menuConfig, $tsMenuBar);

			if (in_array('context', $menuConfig)) {
				$tsContext = t3lib_div::trimExplode(',', $tsMenuBar['contextMenu']);
				if (in_array('preview', $tsContext)) {
					$this->menuBar->addItem('ContextActions', $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:previewTitle'), '', '', $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:previewTooltip'), '', 'button disabled');
				}
				/*if (in_array('logout', $tsContext)) {
					$this->menuBar->addItem('ContextActions', $GLOBALS['LANG']->sL('LLL:EXT:lang/locallang_common.xml:logout'), $action='', $image='', $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:logoutTooltip'), $onClick='', $btnClass='', $labelClass='', t3lib_div::getIndpEnv('TYPO3_SITE_URL') . 'typo3/logout.php?redirect=' . t3lib_div::getIndpEnv('TYPO3_REQUEST_URL'));
				}
				if (in_array('close', $tsContext)) {
					$this->menuBar->addItem('ContextActions', $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:statusDeactivateEditing'), '', $image='', $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:closeTooltip'), ' onclick="' . htmlspecialchars('document.TSFE_ADMIN_PANEL_Form.elements[\'TSFE_ADMIN_PANEL[menuOpen]\'].value=0; document.TSFE_ADMIN_PANEL_Form.submit(); return false;') . '"');
				}*/
			}
			if (in_array('clipboard', $menuConfig)) {
				$this->menuBar->addItem($GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:clipboardTitle'), '', '', '', $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:clipboardTooltip'), '', 'spacer');
			}
			$content = $this->menuBar->build();
		}
		return $content;
	}


	/**
	 * renders all icons on the menu bar to add new content elements
	 *
	 * @param	$menuConfig
	 * @param	$tsMenuBar
	 */
	protected function renderNewContentElementIcons($menuConfig, $tsMenuBar) {
		// get new content elements from cms wizard
		$newCE = t3lib_div::makeInstance('lth_feeditsimple_newcontentelements');
		$newCE->main();

		foreach ($newCE->menuItems as $group => $items) {
			foreach ($items['ce'] as $ce) {
 				$this->menuBar->addItem(
 					'ContentType',
 					$ce['title'],
 					'',
 					TYPO3_mainDir . $ce['icon'],
 					$ce['description'] . ' ' . $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:dragWidgets'),
 					'',
 					$this->cssPrefix . '-contentTypeItem',
 					$this->cssPrefix . '-buttonLabel',
					'',
 					substr($ce['params'], 1)
 				);
			}
		}
	}


	/**
	 * Creates a script tag for the given src to include an external JS file.
	 *
	 * @param	string	The src attribute.
	 * @param	string	The type attribute ('text/javascript' by default).
	 * @return	string	the HTML tag, ready to output
	 */
	protected function getScriptTag($src, $type = 'text/javascript') {
		return '<script type="' . $type . '" src="' . $src . '"></script>';
	}


	/**
	 * Creates a link tag for the given href to include e.g. a CSS file.
	 *
	 * @param	string	The href attribute - the path to the CSS file.
	 * @param	string	The type attribute - (text/css by default)
	 * @param	string	The rel attribute ('stylesheet' by default).
	 * @param	string	The media attribute ('media' by default).
	 * @return	string	the HTML tag, ready to output
	 */
	protected function getLinkTag($href, $type = 'text/css', $rel = 'stylesheet', $media = 'screen') {
		return '<link rel="' . $rel . '" type="' . $type . '" media="' . $media . '" href="' . $href . '" />';
	}

	/**
	 * Generates general configuration Javascript, mimicing pieces of what is
	 * set for the backend in typo3/backend.php.
	 *
	 * @return	string
	 */
	protected function getConfigurationJavascript() {
		$pathTYPO3 = TYPO3_mainDir;

		// General TYPO3 configuration. Mirrors data available in backend context.
		$configuration = array(
			'siteUrl' => t3lib_div::getIndpEnv('TYPO3_SITE_URL'),
			'PATH_typo3' => $pathTYPO3,
			'PATH_typo3_enc' => rawurlencode($pathTYPO3),
			'TYPO3_mainDir' => TYPO3_mainDir
		);

		$editWindowConfiguration = array(
			'height' => (int) $this->modTSconfig['properties']['editWindow.']['height'],
			'width' => (int) $this->modTSconfig['properties']['editWindow.']['width']
		);

		$labels = array(
			'dropMessage' => $GLOBALS['LANG']->sL('LLL:EXT:lth_feedit_simple/locallang.xml:js.dropMessage'),
			'loadingMessage' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.loadingMessage'),
			'ajaxError' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.ajaxError'),
			'generalError' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.generalError'),
			'alreadyProcessingAction' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.alreadyProcessingAction'),
			'newContentElement' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.newContentElement').'<span onclick="closeIframe();return false;" class="fancybox-close"></span><span onclick="loadHelp();return false;" class="help-button">',
			'newPage' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.newPage'),
			'editContentElement' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.editContentElement').'<span onclick="closeIframe();return false;" class="fancybox-close"></span><span onclick="loadHelp();return false;" class="help-button">',
			'editPageProperties' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.editPageProperties'),
			'confirmDelete' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.confirmDelete'),
			'hideNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.hideNotification'),
			'unhideNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.unhideNotification'),
			'moveNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.moveNotification'),
			'saveNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.saveNotification'),
			'closeNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.closeNotification'),
			'copyNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.copyNotification'),
			'cutNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.cutNotification'),
			'pasteNotification' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.pasteNotification'),
			'updatingContent' => $GLOBALS['LANG']->sL('LLL:EXT:feEditSimple/locallang.xml:js.updatingContent')
		);

			// Convert labels/settings back to UTF-8 since json_encode() only works with UTF-8:
		if ($GLOBALS['LANG']->charSet !== 'utf-8') {
			$GLOBALS['LANG']->csConvObj->convArray($configuration, $GLOBALS['LANG']->charSet, 'utf-8');
			$GLOBALS['LANG']->csConvObj->convArray($editWindowConfiguration, $GLOBALS['LANG']->charSet, 'utf-8');
			$GLOBALS['LANG']->csConvObj->convArray($labels, $GLOBALS['LANG']->charSet, 'utf-8');
		}

		if ($GLOBALS['TSFE']->absRefPrefix) {
			$ajaxRequestUrl = $GLOBALS['TSFE']->absRefPrefix . 'index.php';
		} else {
			$ajaxRequestUrl = 'index.php';
		}


		$javascript = '
			var TYPO3 = {};

			Ext.BLANK_IMAGE_URL = "' .
				// t3lib_div::locationHeaderUrl() will include '/typo3/' in the URL
				htmlspecialchars(t3lib_div::locationHeaderUrl('gfx/clear.gif')) .
			'";

			TYPO3.configuration = ' . json_encode($configuration) . ';
			TYPO3.LLL = {
				feEditSimple : ' . json_encode($labels) . '
			};
			TYPO3.configuration.feEditSimple = {
				editWindow : ' . json_encode($editWindowConfiguration) . ',
				ajaxRequestUrl : "' . $ajaxRequestUrl . '"
			};
			/**
			 * TypoSetup object.
			 */
			function typoSetup() {
				this.PATH_typo3 = TYPO3.configuration.PATH_typo3;
				this.PATH_typo3_enc = TYPO3.configuration.PATH_typo3_enc;
			}
			var TS = new typoSetup();';

		$javascript = t3lib_div::wrapJS($javascript);

		return $javascript;
	}

	/**
	 * Performs absRefPrefix replacement on the specified content.
	 *
	 * @param tslib_fe $TSFE
	 * @param string $content
	 * @return string
	 */
	protected static function processAbsRefPrefix($TSFE, $content) {
		$originalContent = $TSFE->content;
		$TSFE->content  = $content;

		$TSFE->setAbsRefPrefix();

		$content = $TSFE->content;
		$TSFE->content = $originalContent;

		return $content;
	}


}