<?php
if (!defined ('PATH_typo3conf')) die ('Could not access this script directly!');
class Tx_Contentstage_Eid_ClearCache_FakeBEUSER {
       public function writelog() {}
}
tslib_eidtools::connectDB();
//require_once(PATH_t3lib.'class.t3lib_div.php');
//require_once (PATH_t3lib.'class.t3lib_tcemain.php');

$cmd = t3lib_div::_GP('cmd');
$table = t3lib_div::_GP('table');
$uid = t3lib_div::_GP('uid');
$pid = t3lib_div::_GP('pid');
$pageUid = t3lib_div::_GP('pageUid');
$formToken = t3lib_div::_GP('formtoken');
$contentToPaste = t3lib_div::_GP('contentToPaste');
$path = t3lib_div::_GP('path');
$sid = t3lib_div::_GP('sid');
$content = array();
switch($cmd) {
    case "getFiles":
	$content = getFiles();
	break;
    case "getPageTree":
	$content = getPageTree();
	break; 
    case "generateToken":
	$content = generateToken($table, $uid, $formToken);
	break;
    case "moveContent":
	$content = moveContent($cmd, $table, $uid, $pid, $pageUid);
	break;
    case "hideContent":
	$content = hideContent($cmd, $table, $uid);
	break;
    case "showContent":
	$content = showContent($cmd, $table, $uid);
	break;
    case "getAbsolutePath":
	$content = getAbsolutePath();
	break;
    case "fileupload":
	$content = fileupload($path);
	break;
    case "deleteContent":
	$content = deleteContent($uid);
	break;    
    case "pasteContent":
	$content = pasteContent($uid, $table, $pid, $pageUid);
	break;
    case "setClipboard":
	$content = setClipboard($uid, $table, $contentToPaste);
	break;    
    case "deletePage":
	$content = deletePage($cmd,$table,$uid);
	break;
    case "hidePage":
	$content = hideShowPage($cmd,$table,$pageId,1);
	break;
    case "showPage":
	$content = hideShowPage($cmd,$table,$pageId,0);
	break;
    case "hidePageInMenu":
	$content = hideShowPage($cmd,$table,$pageId,1);
	break;
    case "showPageInMenu":
	$content = hideShowPage($cmd,$table,$pageId,0);
	break;    
    case "getPidForNewArticles":
        $content = getPidForNewArticles($pageId);
        break;
    case "loadCategorySelector":
        $content = loadCategorySelector($uid);
        break;
    case "changeCategory":
        $content = changeCategory($uid,$parentUid);
        break;
    case "logout":
        $content = logout($table);
        break;
    case "tmpContent":
        $content = tmpContent($tmpContent);
	break;
}

if($cmd != 'fileupload') {
    echo json_encode($content);
}

global $arrs;
global $globalContent;


function getFiles()
{
    if ($_COOKIE['be_typo_user']) {
        
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserId = $GLOBALS['BE_USER']->user['uid'];
        $beuserFile_mountpoints = $GLOBALS['BE_USER']->user['file_mountpoints'];
        $beuserGroup = $GLOBALS['BE_USER']->user['usergroup'];
        
        //To do: get file_mountpoins from be_user table
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('sf.title, sf.path', 'be_groups b LEFT JOIN sys_filemounts sf ON FIND_IN_SET(sf.uid,b.file_mountpoints)', 'b.uid IN('.$beuserGroup.')');
        while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
            if(isset($row['path'])) {
                $fTitle = $row['title'];
                $fPath = $row['path'];
                $dir = $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/$fPath";
                $response[] = array(
                    "name" => str_replace('/','',$fPath),
                    "type" => "folder",
                    "path" => $dir,
                    "items" => scanFiles($dir)
                );
            }
        }
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
	//$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $fPath, 'crdate' => time()));
	///
        
        // Run the recursive function 
        
        $content = array(
            "root" => $_SERVER['DOCUMENT_ROOT'],
            "name" => "fileadmin",
            "type" => "folder",
            "path" => $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/",
            "items" => $response
        );
        ///
    } else {
        return false;
    }
    
    return $content;
}


function getPageTree()
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        $db_mountpointsArray = array();
        $returnArray = array();
        $btitle = '';
        $gtitle = '';
        
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        if($GLOBALS['BE_USER']->user['uid']) {
            $beuserId = intval($GLOBALS['BE_USER']->user['uid']);
        } else {
            return false;
        }
        $content = '';
        
        $res = $GLOBALS['TYPO3_DB']->sql_query("SELECT p.uid, p.title
            FROM be_users b LEFT JOIN be_groups g ON FIND_IN_SET(g.uid, b.usergroup) LEFT JOIN pages p ON FIND_IN_SET(p.uid, g.db_mountpoints)
            WHERE b.uid = $beuserId AND (b.db_mountpoints != '' OR g.db_mountpoints != '') AND p.uid IS NOT NULL
            UNION
            SELECT p.uid, p.title
            FROM be_users b LEFT JOIN pages p ON FIND_IN_SET(p.uid, b.db_mountpoints )
            WHERE b.uid = $beuserId AND (b.db_mountpoints != '') AND p.uid IS NOT NULL"
        );
        while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
            $db_mountpointsArray[$row['uid']] = $row['title'];
        }
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        
        if(is_array($db_mountpointsArray)) {
            $nodeArray = array();
            $db_mountpointsArray = array_unique($db_mountpointsArray);

            foreach($db_mountpointsArray as $key => $value) {
                $nodeArray[] = scanPages($key);
            }
        }
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($nodeArray,true), 'crdate' => time()));

        /*$finalArray = array();
        foreach($nodeArray as $key => $value) {
            array_push($finalArray, $value);
        }*/
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($finalArray,true), 'crdate' => time()));

	//$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $content, 'crdate' => time()));
        $returnArray['content'] = $nodeArray;
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($returnArray['content'],true), 'crdate' => time()));
        $returnArray['result'] = '200';
    } else {
        return false;
    }
    
    
    
    return $returnArray;
}


//*****************************************CONTENT ELEMENTS************************************************************

function deleteContent($uid)
{
    $GLOBALS['TYPO3_DB']->exec_UPDATEquery('tt_content', 'uid='.intval($uid), array('deleted' => 1, 'tstamp' => time()));
    if($GLOBALS['TYPO3_DB']->sql_affected_rows() > 0) {
        return array('result' => 200);
    } else {
        return array('result' => 500);
    }
}


function build_tree($file_path='', $level=0)
{
    foreach ($arrs as $arr) {
        if ($arr['file_path'] != $file_path) {
            $globalContent .= str_repeat("-", $level)." ".$arr['name']."<br />";
            build_tree($arr['file_path'], $level+1);
        }
    }
}


function generateToken($table, $uid, $formToken)
{
    $newformToken = t3lib_div::hmac('editRecord', $formToken);
    $returnArray = array();
    $returnArray['content'] = $newformToken;
    return $returnArray;
}


function getAbsolutePath()
{
    $returnArray = array();
    $returnArray['content'] = '/var/www/html/typo3/';
    return $returnArray;
}


function setClipboard($uid, $table, $contentToPaste)
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');
        
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        if($GLOBALS['BE_USER']->user['uid']) {
            $beuserId = intval($GLOBALS['BE_USER']->user['uid']);
            $time = time();
            try {
                $GLOBALS['TYPO3_DB']->sql_query("UPDATE be_users SET tx_feEditSimple_clipboard = '$contentToPaste', tstamp = $time"
                    . " WHERE uid = $beuserId");
                if($GLOBALS['TYPO3_DB']->sql_affected_rows() > 0) {
                    return array('result' => 200);
                } else {
                    return array('result' => 500);
                }
            } catch(Exception $e) {
                echo 'Message: ' .$e->getMessage();
            }
        } else {
            return false;
        }
    }
}


function getClipboard()
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');
        
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        if($GLOBALS['BE_USER']->user['uid']) {
            $beuserId = intval($GLOBALS['BE_USER']->user['uid']);
            $time = time();
            try {
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('tx_feEditSimple_clipboard', 'be_users', 'uid=' . $beuserId);
                $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
                if(count($row) > 0) {
                    return array('result' => 200, 'content' => $row['tx_feEditSimple_clipboard']);
                } else {
                    return array('result' => 500);
                }
            } catch(Exception $e) {
                echo 'Message: ' .$e->getMessage();
            }
        } else {
            return false;
        }
    }
}


function moveContent($cmd, $table, $uid, $pid, $pageUid, $oldUid = null)
{
    //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => "$cmd, $table, $uid, $pid, $pageUid", 'crdate' => time()));
    $newSorting = null;
    $returnArray = array();
    $uid = str_replace('c','',strtolower($uid));
    $pid = str_replace('c','',strtolower($pid));
            
    // fake tcemain
    $GLOBALS['TCA'][$table]['ctrl']['sortby'] = 'sorting';
    $tce = t3lib_div::makeInstance('t3lib_TCEmain');
    $tce->BE_USER = new Tx_Contentstage_Eid_ClearCache_FakeBEUSER();
    $tce->BE_USER->user = array('username' => 'tx_contentstage_eId');
    $tce->admin = true;
    $tce->stripslashes_values = 0;
    $sortRes = $tce->getSortNumber($table, intval($uid), intval($pid));
    if(is_array($sortRes)) {
        $newSorting = $sortRes['sortNumber'];
    } else {
        $newSorting = $sortRes;
    }

    try {
        $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($uid), array('pid' => intval($pageUid), 'sorting' => intval($newSorting)));
        if($GLOBALS['TYPO3_DB']->sql_affected_rows() > 0) {
            $returnArray['result'] = 200;
        } else {
        $returnArray['result'] = 500;
        }
        if($cmd == 'cut' || $cmd == 'copy') {
            $returnArray = getClipboard();
            $returnArray['oldUid'] = $oldUid;
        }
    } catch(Exception $e) {
        $returnArray['result'] = 500;
        $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => 'feeditSimple ajax row154: ' . $e->getMessage(), 'crdate' => time()));
    }
    return $returnArray;
}


function initTSFE()
{
    $GLOBALS['TSFE'] = t3lib_div::makeInstance('tslib_fe', $GLOBALS['TYPO3_CONF_VARS'], t3lib_div::_GP('id'), '');
    //$GLOBALS['TSFE']->connectToDB();
    $GLOBALS['TSFE']->initFEuser();
    $GLOBALS['TSFE']->checkAlternativeIdMethods();
    $GLOBALS['TSFE']->determineId();
    $GLOBALS['TSFE']->getCompressedTCarray();
    $GLOBALS['TSFE']->initTemplate();
    $GLOBALS['TSFE']->getConfigArray();

            // Get linkVars, absRefPrefix, etc
    TSpagegen::pagegenInit();
}


function pasteContent($uid, $table, $pid, $pageUid)
{
    $uidArray = explode(':', $uid);
    $pasteType = $uidArray[0];
    $uidToPaste = $uidArray[2];
    
    if($pasteType == 'cut') {
        $returnArray = moveContent($pasteType, $table, "c$uidToPaste", "-c$pid", $pageUid, $uidToPaste);
    } else if($pasteType == 'copy') {
        // get original record
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('*', $table, 'uid='.intval($uidToPaste));
        $original_record = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        
        // insert the new record and get the new auto_increment id
        $insertArray = array ('uid' => null);
        $res = $GLOBALS['TYPO3_DB']->exec_INSERTquery($table, $insertArray);
        $newId = mysql_insert_id();

        // generate the query to update the new record with the previous values
        foreach ($original_record as $key => $value) {
            if ($key != 'uid') {
                $updateArray[$key] = $value;
            }
        }
        
        // update the new record
        if(is_array($updateArray)) {
            $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($newId), $updateArray);
        }
        
        // move the new record
        moveContent($pasteType, $table, $newId, $parentUid, $pageUid, $uidToPaste);
    }
    

    /*$tce = t3lib_div::makeInstance('t3lib_TCEmain');
    $tce->stripslashes_values = 0;
    $sortRes = $tce->getSortNumber($table,$uid,'-'.$parentUid);
    
    if(is_array($sortRes)) {
        $newSorting = $sortRes['sortNumber'];
    } else {
        $newSorting = $sortRes;
    }

    $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($uid), array('pid' => $pid, 'sorting' => $newSorting, 'colpos' => $colpos)) or die("88; ".mysql_error());
    
    $returnArray = array();
    $returnArray['colpos'] = $colpos;
    $returnArray['content'] = renderContentElement($table, $uid);
    */
    return $returnArray;
}

function hideContent($cmd, $table, $uid)
{
    try {
        $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($uid), array('hidden' => 1, 'tstamp' => time()));
        if($GLOBALS['TYPO3_DB']->sql_affected_rows() > 0) {
            return array('result' => 200);
        } else {
            return array('result' => 500);
        }
    } catch(Exception $e) {
        return array('result' => 500);
    }
}

function showContent($cmd, $table, $uid)
{
    try {
        $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($uid), array('hidden' => 0, 'tstamp' => time()));
        if($GLOBALS['TYPO3_DB']->sql_affected_rows() > 0) {
            return array('result' => 200);
        } else {
            return array('result' => 500);
        }
    } catch(Exception $e) {
        return array('result' => 500);
    }
}

function fileupload($path)
{
    //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => '461', 'crdate' => time()));
    /*
    * jQuery File Upload Plugin PHP Example 5.14
    * https://github.com/blueimp/jQuery-File-Upload
    *
    * Copyright 2010, Sebastian Tschan
    * https://blueimp.net
    *
    * Licensed under the MIT license:
    * http://www.opensource.org/licenses/MIT
    */

    //error_reporting(E_ALL | E_STRICT);
    $options = array('upload_dir' => '/var/www/html/typo3' . $path, 'upload_url' => $path, 'script_url' => 'index.php?eID=lth_feedit_simple&cmd=fileupload');

    require('/var/www/html/typo3/typo3conf/ext/lth_feedit_simple/vendor/jqueryfileupload/server/UploadHandler.php');
    $returnArray = array();
    $result = new UploadHandler($options);
    //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($result,true), 'crdate' => time()));
    //return $result;
}

function tmpContent($tmpContent)
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
	
	$GLOBALS['TYPO3_DB']->exec_DELETEquery('tx_feEditSimple_tmpcontent', 'cruser_id='.intval($beuserid));
	
	$insertArray = array('cruser_id' => $beuserid, 'crdate' => time(), tstamp => time(), 'tmpcontent' => $tmpContent);
	$res = $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_feEditSimple_tmpcontent', $insertArray) or die("132; ".mysql_error());
    }
}


function copyContentElement($cmd,$table,$uid,$pid,$parentUid)
{
                        
    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('*', $table, 'uid='.intval($uid), '', '', '') or die('139; '.mysql_error());
    $original_record = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
    
    if($parentUid) {
        $parentUidArray = explode(':',$parentUid);
        $parentUid = '-'.$parentUidArray[1];
            // Get sorting values
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('colpos', $table, 'uid='.intval($parentUid), '', '', '') or die('104; '.mysql_error());
        $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        $colpos = $row['colpos'];
    } else {
        $parentUid = 0;
        $colpos = 0;
    }
    
    $GLOBALS['TYPO3_DB']->sql_free_result($res);
    
    $tce = t3lib_div::makeInstance('t3lib_TCEmain');
    $tce->stripslashes_values = 0;
    $sortRes = $tce->getSortNumber($table,0,$parentUid);
    //function       getSortNumber($table, $uid, $pid) {

    if(is_array($sortRes)) {
        $newSorting = $sortRes['sortNumber'];
    } else {
        $newSorting = $sortRes;
    }

        // insert the new record and get the new auto_increment id
    $insertArray = array ('uid' => null);
    $res = $GLOBALS['TYPO3_DB']->exec_INSERTquery($table, $insertArray) or die("126; ".mysql_error());
    $newId = mysql_insert_id();
    
    // generate the query to update the new record with the previous values
    foreach ($original_record as $key => $value) {
        if ($key != 'uid' and $key != 'pid' and $key != 'sorting' and $key != 'colpos') {
                //$query .= '`'.$key.'` = "'.str_replace('"','\"',$value).'", ';
            $updateArray[$key] = $value;
        } else if($key == 'pid') {
            $updateArray[$key] = $pid;
        } else if($key == 'sorting') {
            $updateArray[$key] = $newSorting;
        } else if($key == 'colpos') {
            $updateArray[$key] = $colpos;
        }
    }

    if(is_array($updateArray)) {
        $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($newId), $updateArray) or die("84; ".mysql_error());
    }
    

    $returnArray = array();
    $returnArray['newId'] = $newId;
    $returnArray['colpos'] = $colpos;
    $returnArray['content'] = renderContentElement($table, $newId);
    
    return $returnArray;
}

function renderContentElement($table, $uid)
{
    global $setup;
        
    require_once (PATH_t3lib.'class.t3lib_befunc.php');
    require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
    require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
    require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');
    $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
    $GLOBALS['BE_USER']->OS = TYPO3_OS;
    $GLOBALS['BE_USER']->lockIP = $GLOBALS['TYPO3_CONF_VARS']['BE']['lockIP'];
    $GLOBALS['BE_USER']->workspace = 0;
    $GLOBALS['BE_USER']->start();
    $beuserid = $GLOBALS['BE_USER']->user['uid'];

    $GLOBALS['TSFE']->newCObj();
    if(intval($uid)) {
            $contentElementRow = getRow($table, $uid);
    } else {
            $contentElementRow = array();
            $contentElementRow['uid'] = $uid;
    }

    $cObj = t3lib_div::makeInstance('tslib_cObj');
    //$cObj->start($contentElementRow, 'tt_content');
    //$conf = array('allow' => 'edit, new, delete, hide', 'cut', 'copy');
    $conf = array('allow' => 'move,new,edit,hide,unhide,delete,cut,copy', 'line' => 5, 'label' => '%s', 'onlyCurrentPid' => 1, 'previewBorder' => 4, 'edit.' => Array ( 'displayRecord' => 1 ) );
    
            // @todo	Hack to render editPanel for records other than tt_content.
    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('tmpcontent', 'tx_feEditSimple_tmpcontent', 'cruser_id='.intval($beuserid), '', '', '') or die('261; '.mysql_error());
    $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
    $cObjOutput = $row['tmpcontent'];
    $GLOBALS['TYPO3_DB']->sql_free_result($res);
    if(($table == 'tt_content') && ($uid != 'NEW')) {
        //$cObjOutput = $cObj->cObjGetSingle($setup['tt_content'], $setup['tt_content.']);
	/*$conf['tables'] = 'tt_content';
	$conf['source'] = 602;
	$conf['dontCheckPid'] = 1;
	return $cObj->cObjGetSingle('RECORDS', $conf);*/
    } else {
            
            if ($uid == 'NEW') {
                    $conf['newRecordFromTable'] = $table;
            }
            if (isset($GLOBALS['BE_USER']->frontendEdit->TSFE_EDIT['newRecordInPid'])) {
                    $conf['newRecordInPid'] = $GLOBALS['BE_USER']->frontendEdit->TSFE_EDIT['newRecordInPid'];
            }
            //$cObjOutput = $cObj->editPanel('', $conf, $table . ':' . $uid, $contentElementRow);
    }
    require_once(t3lib_extMgm::extPath('feEditSimple') . 'view/class.tx_feEditSimple_editpanel.php');
    $panelObj = new tx_feEditSimple_editpanel;
    $cObjOutput = $panelObj->editPanel($cObjOutput,$conf,"$table:$uid",$contentElementRow,$table,array('move'=>0,'new'=>1,'edit'=>2,'hide'=>3,'unhide'=>4,'delete'=>5,'cut'=>6,'copy'=>7));
    
/*
            // Set a simplified template file for use in the AJAX response.  No title, meta tags, etc.
            // @todo Should we account for footer data too?
    $pageRenderer = $GLOBALS['TSFE']->getPageRenderer();
    $pageRenderer->setTemplateFile(t3lib_extMgm::extPath('feEditSimple') . 'res/template/content_element.tmpl');
    //$pageRenderer->setCharSet($GLOBALS['TSFE']->metaCharset);
    $pageRenderer->enableConcatenateFiles();

            // Set the BACK_PATH for the pageRenderer concatenation.
            // FIXME should be removed when the sprite manager, RTE, and pageRenderer are on the same path about concatenation.
    $GLOBALS['BACK_PATH'] = TYPO3_mainDir;

    //$header = $this->renderHeaderData();
    $content = $cObjOutput;

    if ($GLOBALS['TSFE']->isINTincScript()) {
            $GLOBALS['TSFE']->content = $content;
            $GLOBALS['TSFE']->INTincScript();
            $content = $GLOBALS['TSFE']->content;
    }

    //$this->ajaxObj->addContent('header', $header);
    //$this->ajaxObj->addContent('content', $content);
    */
    return $cObjOutput;
}

/**
* Gets the database row for a specific content element.
*
* @param	integer		UID of the content element.
* @return	array
*/
function getRow($table, $uid)
{
       $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('*', $table, 'uid=' . $uid);
       $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
       $GLOBALS['TYPO3_DB']->sql_free_result($res);

       return $row;
}

function loadCategorySelector($uid)
{
    $uidArray=explode(':',$uid);
    $tt_newsid = $uid;
    $tt_newsUid = $uidArray[1];
    $tt_news_categorymounts = null;
    $content = null;
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        if($beuserid) {
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('tt_news_categorymounts', 'be_users', 'uid='.intval($beuserid), '', '', '') or die('175; '.mysql_error());
            $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
            $tt_news_categorymounts = $row['tt_news_categorymounts'];
            $content .= "<div>";
            if($tt_news_categorymounts) {
                $content .= "<div style=\"float:left;width:225px;\">My categories that are not already selected<br />";
                $content .= "<select id=\"tt_news_categorymounts\" name=\"\" size=\"10\" style=\"width:200px;\">";
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("DISTINCT TC.uid,TC.pid,TC.hidden,TC.sorting,TC.title", "tt_news_cat_mm TCM join tt_news_cat TC on TCM.uid_foreign=TC.uid", "TC.uid IN($tt_news_categorymounts) AND TC.uid NOT IN(SELECT uid_foreign FROM tt_news_cat_mm WHERE uid_local=".intval($tt_newsUid).")", "", "TC.title", "") or die('179; '.mysql_error());
                while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
                    $uid = $row['uid'];
                    $pid = $row['pid'];
                    $title = $row['title'];
                    $content .= "<option value=\"$uid\">$title</option>";
                }
                $content .= "</select></div>";
            }
            
            $content .= "<div style=\"float:left;padding-top:100px;height:200px;\"><input type=\"Button\" value=\">>\" onclick=\"parent.moveItemBetweenListboxes('#tt_news_categorymounts','#uid_foreign','$tt_newsid');return false;\" />";
            $content .= "<br /><input type=\"Button\" value=\"<<\" onclick=\"parent.moveItemBetweenListboxes('#uid_foreign','#tt_news_categorymounts','');return false;\" /></div>";
            
            if($tt_newsid) {
                $content .= "<div style=\"float:left;width:225px;\">The categories of the news-item ($tt_newsid)</br />";
                $content .= "<select id=\"uid_foreign\" name=\"\" size=\"10\" style=\"width:200px;\">";
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("TCM.uid_foreign,TCM.sorting,TC.title", "tt_news_cat_mm TCM join tt_news_cat TC on TCM.uid_foreign=TC.uid", "TCM.uid_local=".intval($tt_newsUid)." AND TCM.uid_foreign IN($tt_news_categorymounts)", "", "TCM.sorting", "") or die("175; ".mysql_error());
                while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
                    $uid_foreign = $row['uid_foreign'];
                    $title = $row['title'];
                    $content .= "<option value=\"$tt_newsUid:$uid_foreign\">$title</option>";
                }
                $content .= "</select></div>";
            }
            $content .= "</div>";
        }
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        echo $content;
    }
}

function changeCategory($uid,$pid)
{
    $returnArray = array();
    
    if(stristr($uid,':')) {
        $uidArray = explode(':',$uid);
        $uid_local = $uidArray[0];
        $uid_foreign = $uidArray[1];
        //Remove from tt_news_cat_mm
        $GLOBALS['TYPO3_DB']->exec_DELETEquery('tt_news_cat_mm', 'uid_local='.intval($uid_local).' AND uid_foreign='.intval($uid_foreign));
      //  echo 'del?';
    } else {
        //Add to tt_news_cat_mm
        $pidArray = explode(':',$pid);
        $uid_local = $pidArray[1];
        $uid_foreign = $uid;
        $GLOBALS['TYPO3_DB']->exec_INSERTquery('tt_news_cat_mm', array('uid_local' => $uid_local, 'uid_foreign' => $uid_foreign));
//        echo 'insert?'.$uid.stristr($uid,':');
    }
    
    $returnArray['uid'] = uid;
    $returnArray['pid'] = $pid;
    return $returnArray;
}

function getPidForNewArticles($pageId)
{
    if ($_COOKIE['be_typo_user']) {
        /*require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];*/
        
        //Get tt_content from pageid
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('pi_flexform', 'tt_content', 'deleted=0 AND list_type=9 AND pid='.intval($pageId), '', '', '1') or die('68; '.mysql_error());
        $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        $pi_flexform = $row['pi_flexform'];
        if($pi_flexform) {
            $xml = simplexml_load_string($pi_flexform);
            //$PIDitemDisplay = $xml->data->sheet[3]->language->field[2]->value;
            $test = $xml->data->sheet[3]->language;
            foreach ($test->field as $n) {
                foreach($n->attributes() as $name => $val) {
                    if ($val == 'pages') {
                        $pages = $n->value;
                    }
                }
            }
            if($pages) {
                $pagesArray = explode("\n", $pages);
                $firstpage = $pagesArray[0];
                
                //Get tt_news from folder above
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('uid', 'tt_news', 'deleted=0 AND pid='.intval($firstpage), '', '', '1') or die('86; '.mysql_error());
                $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
                if($row) {
                    $uid = $row['uid'];
                } else {
                    $GLOBALS['TYPO3_DB']->exec_INSERTquery('tt_news', array('pid' => $firstpage, 'hidden' => 1, 'editlock' => 1, 'title' => 'Needed for the system, do not edit or delete.'));
                    $uid = $GLOBALS['TYPO3_DB']->sql_insert_id();
                }
            }
        }
    }
        
        /*Get options from user
        if($beuserid) {
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('TSconfig', 'be_users', 'uid='.intval($beuserid), '', '', '') or die('48; '.mysql_error());
            $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
            $TSconfig = $row['TSconfig'];
            
            if($TSconfig) {
                $TSconfigArray = explode("\n",$TSconfig);
                foreach($TSconfigArray as $key => $value) {
                    if(stristr($value,'mod.extendfeadv.pidForNewArticles')) {
                        $value = str_replace(' ','',$value);
                        $valueArray = explode('=',$value);
                        $pidForNewArticles = $valueArray[1];
                    }
                }
                if($pidForNewArticles) {
                    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('uid', 'tt_news', 'pid='.intval($pidForNewArticles), '', '', '0,1') or die('62; '.mysql_error());
                    $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
                    if($row) {
                        $uid = $row['uid'];
                    } else {
                        $GLOBALS['TYPO3_DB']->exec_INSERTquery('tt_news', array('pid' => $pidForNewArticles, 'hidden' => 1, 'editlock' => 1, 'title' => 'Needed for the system, do not edit or delete.'));
                        $uid = $GLOBALS['TYPO3_DB']->sql_insert_id();
                    }
                }
            }
            $GLOBALS['TYPO3_DB']->sql_free_result($res);
        }
    } else {
        $content = 'Aja baja!';
    }*/
        
    $returnArray = array();
    $returnArray['pidForNewArticles'] = $uid;
    
    return $returnArray;
    
}

function deletePage($cmd,$table,$uid)
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        if($beuserid) {
            //if($GLOBALS['BE_USER']->isInWebMount($uid) or $GLOBALS['BE_USER']->user['admin']) {
                // get the pid of the current page   
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("pid", $table, "uid=".intval($uid). " AND pid != 0") or die('355; '.mysql_error());
                $row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res);
                $pid = $row['pid'];
                
                $GLOBALS['TYPO3_DB']->sql_free_result($res);

                if($pid) {
                            //Set deleted to 1
                    $values = array ('deleted' => 1, 'tstamp' => time());
                    $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($uid), $values) or die("363; ".mysql_error());

                    
                    $returnArray['pid'] = $pid;
                    $returnArray['msg'] = $pid.$table.intval($uid);
                    
                } else {
                    $returnArray['msg'] = 'Root?'.$table.$uid.$pid;
                }
            /*} else {
                $returnArray['msg'] = 'No access.';
            }*/
        } else {
            $returnArray['msg'] = 'No user logged in.';
        }
    } else {
        $returnArray['msg'] = 'No user logged in.';
    }
    return $returnArray;
        
}

function hideShowPage($cmd,$table,$pageId,$type)
{
    if ($_COOKIE['be_typo_user']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        if($beuserid) {
            if($GLOBALS['BE_USER']->isInWebMount($pageId)) {
                            //Set hidden to 0 or 1
                
                if($cmd=='hidePageInMenu' or $cmd == 'showPageInMenu') {
                    $values = array ('nav_hide' => $type, 'tstamp' => time());
                } else if($cmd=='hidePage' or $cmd =='showPage') {
                    $values = array ('hidden' => $type, 'tstamp' => time());
                }   
                $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery($table, 'uid='.intval($pageId), $values) or die("289; ".mysql_error());
                    
                $returnArray['pid'] = $pid;
                $returnArray['msg'] = $pid.$table.intval($uid);
            } else {
                $returnArray['msg'] = 'No access.';
            }
        } else {
            $returnArray['msg'] = 'No user logged in.';
        }
    } else {
        $returnArray['msg'] = 'No user logged in.';
    }
    
    return $returnArray;
}

function logout($url)
{
    if ($_COOKIE['be_typo_user'] and $_COOKIE['lth_feedit_simple_usersettings']) {
        require_once (PATH_t3lib.'class.t3lib_befunc.php');
        require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
        require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
        require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        $values = array ('tx_feEditSimple_usersettings' => $_COOKIE['lth_feedit_simple_usersettings'], 'tstamp' => time());
        
        $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery('be_users', 'uid='.intval($beuserid), $values) or die("289; ".mysql_error());
        $returnArray['url'] = $url;
        return $returnArray;
    }
}


// This function scanFiless the files folder recursively, and builds a large array
function scanFiles($dir)
{
    $files = array();
    // Is there actually such a folder/file?
    if(file_exists($dir)){
        foreach(scandir($dir) as $f) {
            if(!$f || $f[0] == '.') {
                continue; // Ignore hidden files
            }
            if(is_dir($dir . '/' . $f)) {
                // The path is a folder
                $files[] = array(
                    "name" => str_replace('/','',$f),
                    "type" => "folder",
                    "path" => $dir . '/' . $f,
                    "items" => scanFiles($dir . '/' . $f) // Recursively get the contents of the folder
                );
            } else {
                // It is a file
                $files[] = array(
                    "name" => str_replace('/','',$f),
                    "type" => "file",
                    "path" => $dir . '/' . $f,
                    "size" => filesize($dir . '/' . $f) // Gets the size of this file
                );
            }
        }
    }
    return $files;
}

function scanPages($db_mountpoint)
{
    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('node.uid, node.title, node.lft, node.rgt, node.pid', 
        'pages AS node JOIN pages AS parent ON node.lft BETWEEN parent.lft AND parent.rgt',
        'parent.uid = ' . intval($db_mountpoint) . ' AND node.deleted=0 AND node.hidden=0', '', 'node.lft', '');
        // Build array
    $treeArray = array();
    while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
        $treeArray[] = array('href' => '#', 'text' => $row['title'], 'lft' => $row['lft'], 'rgt' => $row['rgt'], 'uid' => $row['uid'], 'pid' => $row['pid']);
    }
    $GLOBALS['TYPO3_DB']->sql_free_result($res);
    
    $treeStuff = nest($treeArray);
    
    $treeStuff = array_filter_recursive($treeStuff);
    
    return $treeStuff;
}

function array_filter_recursive($input) 
  { 
    foreach ($input as &$value) 
    { 
      if (is_array($value)) 
      { 
        $value = array_filter_recursive($value); 
      } 
    } 
    
    return array_filter($input); 
  } 

function nest($arrData) 
{ 
    $stack = array();
    $arraySet = array();

    foreach( $arrData as $intKey => $arrValues) {
        $stackSize = count($stack); //how many opened tags?
       
        while($stackSize > 0 && $stack[$stackSize-1]['rgt'] < $arrValues['lft']) {
            array_pop($stack); //close sibling and his childrens
            $stackSize--;
        }

        $link =& $arraySet;
        for($i=0; $i < $stackSize; $i++) {
            $link =& $link[$stack[$i]['index']]["nodes"]; //navigate to the proper children array
        }
        $tmp = array_push($link,  array ('href'=>$arrValues['href'], 'text' => $arrValues['text'], 'uid' => $arrValues['uid'], 'nodes'=>array()));
        array_push($stack, array('index' => $tmp-1, 'rgt' => $arrValues['rgt'], 'tags' => count($tmp)));

    }

    return $arraySet; 
}  

function createTree($category, $lft = 0, $rgt = null) {
    $tree = array();
    foreach ($category as $cat => $range) {
        
        if ($range['lft'] == $lft + 1 && (is_null($rgt) || $range['rgt'] < $rgt)) {
            $tree[$cat] = createTree($category, $range['lft'], $range['rgt']);
            $lft = $range['rgt'];
        }
    }
    return $tree;
}

/*
 * var defaultData = [
          {
            text: 'Parent 1',
            href: '#parent1',
            tags: ['4'],
            nodes: [
              {
                text: 'Child 1',
                href: '#child1',
                tags: ['2'],
                nodes: [
                  {
                    text: 'Grandchild 1',
                    href: '#grandchild1',
                    tags: ['0']
                  },
                  {
                    text: 'Grandchild 2',
                    href: '#grandchild2',
                    tags: ['0']
                  }
                ]
              },
              {
                text: 'Child 2',
                href: '#child2',
                tags: ['0']
              }
            ]
          },
 */