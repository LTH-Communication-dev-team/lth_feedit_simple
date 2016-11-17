<?php
if (!defined ('PATH_typo3conf')) die ('Could not access this script directly!');
class Tx_Contentstage_Eid_ClearCache_FakeBEUSER {
       public function writelog() {}
       public function isInWebMount() {
           return true;
       }
        public function recordEditAccessInternals() {
           return true;
       }
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
    case "updateFeUserSettings":
        updateFeUserSettings($contentToPaste);
	break;
    case "addFileToStorage":
        $content = addFileToStorage($contentToPaste);
	break;
    case "getSysFileId":
        $content = getSysFileId($uid);
	break;
     case "saveUserSettings":
        $content = saveUserSettings($contentToPaste);
	break;
    case "getUserSettings":
        $content = getUserSettings();
	break;   
    case "getNewId":
        $content = getNewId($pageUid, $table);
	break;
    case "getFiles":
	$content = getFiles($pageUid, $contentToPaste);
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
	$content = deletePage($cmd, $pageUid);
	break;
    case "pastePageAfter":
    case "pastePageInto":
	$content = pastePage($cmd, $uid, $pageUid);
	break;   
    case "hidePage":
    case "hidePageInMenu":
	$content = hideShowPage($cmd, $pageUid, 1);
	break;
    case "showPage":
    case "showPageInMenu":
	$content = hideShowPage($cmd, $pageUid, 0);
	break;   
    case "getFormHandler":
        $content = getFormHandler($pageUid);
        break;
    case "loadCategorySelector":
        $content = loadCategorySelector($uid);
        break;
    case "changeCategory":
        $content = changeCategory($uid, $parentUid);
        break;
    case "logout":
        $content = logout($table);
        break;
    case "tmpContent":
        $content = tmpContent($tmpContent);
	break;
    case 'getImgId':
        $content = getImgId($uid, $contentToPaste);
        break;
    case 'updateImageOrientation':
        $content = updateImageOrientation($uid, $pid);
        break;
    case 'moveImage':
        $content = moveImage($uid, $pageUid);
        break;
    case 'updateCopiedPage':
        $content = updateCopiedPage($uid, $pageUid, $contentToPaste);
        break; 
}


if($cmd === 'getFiles') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($content);
} else if($cmd != 'fileupload') {
    echo json_encode($content);
}

global $arrs;
global $globalContent;


function addFileToStorage($filePath)
{
    /*$storageRepository = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('TYPO3\\CMS\\Core\\Resource\\StorageRepository');
    $storage = $storageRepository->findByUid(1);
    $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $newFile, 'crdate' => time()));
    $fileObject = $storage->addFile($newFile, $storage->getRootLevelFolder(), 'newFile');*/
    $fileObject = TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->retrieveFileOrFolderObject($filePath);
}


function getSysFileId($uid)
{
    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("uid", "sys_file", "identifier='".$uid."'");
    $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
    $uid = $row['uid'];
    $GLOBALS['TYPO3_DB']->sql_free_result($res);
    
    $returnArray = [];
    $returnArray["uid"] = $uid;
    return $returnArray;
}


function getUserSettings()
{
    $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
    $GLOBALS['BE_USER']->start();
    $GLOBALS['BE_USER']->unpack_uc('');
    //$beuserId = $GLOBALS['BE_USER']->user['uid'];
    $lang = $GLOBALS['BE_USER']->user['lang'];
    $recursiveDelete = $GLOBALS['BE_USER']->uc['recursiveDelete'];
    $copyLevels = $GLOBALS['BE_USER']->uc['copyLevels'];
    
    $returnArray = [];
    $returnArray["lang"] = $lang;
    $returnArray["recursiveDelete"] = $recursiveDelete;
    $returnArray["copyLevels"] = $copyLevels;
    return $returnArray;
}


function updateFeUserSettings($contentToPaste)
{
    $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
    $GLOBALS['BE_USER']->start();
    
    $beuserId = $GLOBALS['BE_USER']->user['uid'];
    $GLOBALS['TYPO3_DB']->exec_UPDATEquery('be_users', 'uid='.intval($beuserId), array('tx_feEditSimple_usersettings' => $contentToPaste, 'tstamp' => time()));
}


function saveUserSettings($contentToPaste)
{
    $contentToPasteArray = json_decode($contentToPaste, true);

    $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
    $GLOBALS['BE_USER']->start();
    //$GLOBALS['BE_USER']->unpack_uc('');
    
    $GLOBALS['BE_USER']->uc['recursiveDelete'] = $contentToPasteArray[1];
    $GLOBALS['BE_USER']->uc['copyLevels'] = $contentToPasteArray[2];
    
    $GLOBALS['BE_USER']->writeUC();
    
    $beuserId = $GLOBALS['BE_USER']->user['uid'];
    $GLOBALS['TYPO3_DB']->exec_UPDATEquery('be_users', 'uid='.intval($beuserId), array('lang' => $contentToPasteArray[0]));
    $returnArray = [];
    $returnArray["res"] = '200';
    return $returnArray;
}


function getFormHandler($pageUid)
{
    $arraySize = 0;
    $tempArray = array();
    $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('uid, params', 'tx_formhandler_log', 'pid='.intval($pageUid), '');
    $recordsTotal = $GLOBALS["TYPO3_DB"]->sql_num_rows($res);
    while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
        /*$uid = $row['uid'];
        $pid = $row['pid'];
        $params = $row['params'];
        $tempArray = unserialize($params);
        $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($tempArray, true), 'crdate' => time()));
         * $GLOBALS['TYPO3_DB']->exec_SELECTquery($select_fields,$from_table,$where_clause,$groupBy,$orderBy,$limit);
        if($arraySize < count($tempArray)) {
            $arraySize = count($tempArray);
        }
         * [11] => Array
        (
            [epost] => ko@tlth.se
            [institution] => TLTH
            [kost] => 
            [medfoljare] => 
            [mobilnr] => 0709653025
            [namn] => Axel Andersson
            [program] => 
            [randomID] => a7b32f01e3eda2de637f4b767b9f8ca8
            [removeFile] => 
            [removeFileField] => 
            [step-2-next] => Skicka
            [submitField] => 
            [submitted] => 1
        )
        $dataArray[] = array_values($tempArray);*/
        $tempArray = unserialize($row['params']);
        unset($tempArray['randomID']);
        unset($tempArray['removeFile']);
        unset($tempArray['removeFileField']);
        unset($tempArray['step-2-next']);
        unset($tempArray['submitField']);
        unset($tempArray['submitted']);
        if(is_array($tempArray)) $columnsArray[] = array_keys($tempArray);
        $dataArray[] = $tempArray;
        
    }
    
    $tempArray = array();
    if($columnsArray) {
        
        $columnsArray = array_unique($columnsArray);
        $columnsArray = array_filter($columnsArray);
        $dataArray = array_filter($dataArray);
        foreach($columnsArray as $cKey => $cValue) {
            $columnsArray = $cValue;
        }
    }

    $dataTempArray = array();
    foreach($dataArray as $aKey => $aValue) {
        $i = 0;
        //$tempArray['DT_RowId'] = "row_" . $aKey;
        foreach ($columnsArray as $pKey => $pValue) {
            if (isset($aValue[$pValue])) {
                $tempArray[$i] = $aValue[$pValue];
            } else {
                $tempArray[$i] = '';
            }
            $i++;
        }
        array_push($dataTempArray, array_values($tempArray));
    }
    $GLOBALS['TYPO3_DB']->sql_free_result($res);
    
    //"DT_RowId":"row_5","0":"Airi","1":"Satou","2":"Accountant","3":"Tokyo","4":"28th Nov 08","5":"$162,700"},
    //$dataOutArray = array("draw" => 1,"recordsTotal" => $recordsTotal, "recordsFiltered" => $recordsTotal, "data" => $dataTempArray);

    $returnArray['columns'] = $columnsArray;
    $returnArray['data'] = $dataTempArray;
    
    return $returnArray;
}

function localDebug($input)
{
    echo '<pre>';
    print_r($input);
    echo '</pre>';
}

function getFiles($pageUid, $modalType)
{
    if ($_COOKIE['be_typo_user']) {
//        $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => PATH_t3lib, 'crdate' => time()));
        require_once ('/var/www/html/typo3/typo3/sysext/backend/Classes/Utility/BackendUtility.php');
        /*require_once ('Backend/Utility/BackendUtility\class.t3lib_userauthgroup.php');
        require_once ('Backend\Utility\BackendUtility\class.t3lib_beuserauth.php');
        require_once ('Backend\Utility\BackendUtility\class.t3lib_tsfebeuserauth.php');*/

        // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
        // @todo 	Comment says its set to empty, but where does that happen?

        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserFile_mountpoints = $GLOBALS['BE_USER']->user['file_mountpoints'];
        $beuserDb_mountpoints = $GLOBALS['BE_USER']->user['db_mountpoints'];
        $beuserGroup = $GLOBALS['BE_USER']->user['usergroup'];
        
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("sf.path, p.uid, p.title",
                "be_users b LEFT JOIN be_groups bg ON FIND_IN_SET(bg.uid, b.usergroup) " .
                "LEFT JOIN sys_filemounts sf ON FIND_IN_SET(sf.uid,bg.file_mountpoints) OR FIND_IN_SET(sf.uid,b.file_mountpoints) " .
                "LEFT JOIN pages p ON FIND_IN_SET(p.uid,b.db_mountpoints) OR FIND_IN_SET(p.uid,bg.db_mountpoints)",
                "b.uid=" . $GLOBALS['BE_USER']->user['uid'] . ' OR b.uid=5');
        $dbArray = array();
        $pArray = array();

        while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
            $pArray[] = $row['path'];
            $dbArray[$row['uid']] = $row['title'];
            /*if(isset($row['path'])) {
                $fTitle = $row['title'];
                $fPath = $row['path'];
                $dir = $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/$fPath";
                $response[] = array(
                    "name" => str_replace('/','',$fPath),
                    "type" => "folder",
                    "path" => $dir,
                    "items" => scanFiles($dir)
                );
            }*/
        }
        $pArray = array_unique(array_filter($pArray));
        $dbArray = array_unique(array_filter($dbArray));
        //localDebug($pArray);
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        
        $storageUid = 1;
        $useFilters = TRUE;
        $recursive = TRUE;
        $fileObjects = [];
        $folderObjects = [];
        
        foreach($pArray as $key => $folderIdentifier) {
            /*$dir = $_SERVER['DOCUMENT_ROOT'] . "/fileadmin$fPath";
            $pResponse[] = array(
                "id" => 'fileadmin' . $fPath,
                "text" => str_replace('/','',$fPath),
                "type" => "folder",
                //"path" => $dir,
                "children" => scanFiles($dir)
            );*/
            $fileArray[] = array('id' => rtrim($folderIdentifier, '/'), 'text' => $folderIdentifier, 'type' => 'folder', 'parent' => '#');

            $fileObjects = array_merge($fileObjects, \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFileIdentifiersInFolder(rtrim($folderIdentifier, '/'), $useFilters, $recursive));
            $folderObjects = array_merge($folderObjects, \TYPO3\CMS\Core\Resource\ResourceFactory::getInstance()->getStorageObject($storageUid)->getFolderIdentifiersInFolder(rtrim($folderIdentifier, '/'), $useFilters, $recursive));
            
        }

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
            $fileArray[] = array('id' => $key, 'text' => $text, 'type' => 'file', 'icon' => 'glyphicon glyphicon-file', 'parent' => implode('/', $keyArray), 'li_attr' => array("data-type" => "file"));
        }
        
        //if($modalType!='changeImage') {
            foreach($dbArray as $key => $value) {
                /*$actual_link = 'http://' . $_SERVER[HTTP_HOST] . '?id=' . $key . '&type=225&no_cache=1&sid=' . time();
                $html = file_get_contents($actual_link);
                //preg_match("/<body[^>]*>(.*?)<\/body>/is", $html, $matches);
                $html = json_decode($html, true);*/
                //array_reduce($html, 'array_merge', array());
                //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $html, 'crdate' => time()));

                /*$dbResponse[] = array(
                    "id" => $key,
                    "text" => $value,
                    "type" => "page",
                    "state" => array("selected" => false),
                    "children" => $html
                );*/

                $depth = 999999;
                $queryGenerator = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance( 'TYPO3\\CMS\\Core\\Database\\QueryGenerator' );
                $rGetTreeList = $queryGenerator->getTreeList($key, $depth, 0, 1); //Will be a string
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery("uid,pid,title","pages","uid IN($rGetTreeList)");
                while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
                    $uid = $row['uid'];
                    $pid = $row['pid'];
                    $title = $row['title'];
                    if($pid == 0) {
                        $pid = '#';
                    }
                    $pageArray[] = array('id' => $uid, 'text' => $title, 'type' => 'page', 'parent' => $pid, 'li_attr' => array("data-type" => "page"));
                }
                $GLOBALS['TYPO3_DB']->sql_free_result($res);
            }
            if($pageArray && $fileArray) {
                $content = array_merge($pageArray, $fileArray);
            } elseif($pageArray) {
                $content = $pageArray;
            } elseif($fileArray) {
                $content = $fileArray;
            }
        /*} else {
            $content = $fileArray;
        }*/
        
       /* $content[] = array(
            //"root" => $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/",
            "id" => "path",
            "text" => "fileadmin",
            "type" => "folder",
            //"path" => $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/",
            "children" => $pResponse
        );*/
        
        
        
        //localDebug($fileArray);

        /*$content[] = array(
            //"root" => $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/",
            "id" => "pages",
            "text" => "Pages",
            "state" => array("selected" => false),
            //"type" => "folder",
            //"path" => $_SERVER['DOCUMENT_ROOT'] . "/fileadmin/",
            "children" => $dbResponse
        );*/
        ///
    } else {
        return false;
    }
    
    return $content;
}


function build_tree($path_list)
{
    $path_tree = array();
    foreach ($path_list as $path => $id) {
        $list = explode('/', trim($path, '/'));
        $last_dir = &$path_tree;
        foreach ($list as $dir) {
            $last_dir['id'] = $dir;
            $last_dir['text'] = $dir;
            $last_dir['type'] = 'folder';
            $last_dir =& $last_dir['children'][$dir];
        }
        //$last_dir['__title'] = $title;
        $last_dir['id'] = $id;
        $last_dir['text'] = $id;
        $last_dir['type'] = 'file';
    }
    return $path_tree;
}
        

function getPageTree()
{
    if ($_COOKIE['be_typo_user']) {
        require_once ('/var/www/html/typo3/typo3/sysext/backend/Classes/Utility/BackendUtility.php');

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


/*function build_tree($file_path='', $level=0)
{
    foreach ($arrs as $arr) {
        if ($arr['file_path'] != $file_path) {
            $globalContent .= str_repeat("-", $level)." ".$arr['name']."<br />";
            build_tree($arr['file_path'], $level+1);
        }
    }
}
*/

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
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');

        if($GLOBALS['BE_USER']->user['uid']) {
            $beuserId = intval($GLOBALS['BE_USER']->user['uid']);
            $time = time();
            try {
                $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('tx_feEditSimple_clipboard', 'be_users', 'uid=' . intval($beuserId));
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
        echo $e->getMessage();
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
        $newId = $GLOBALS['TYPO3_DB']->sql_insert_id();

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


function deletePage($cmd, $pageUid)
{
    if ($_COOKIE['be_typo_user']) {
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        if($beuserid) {
            // get the pid of the current page   
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('pid', 'pages', 'uid='.intval($pageUid). ' AND pid != 0');
            $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
            $pid = $row['pid'];
            $GLOBALS['TYPO3_DB']->sql_free_result($res);

            if($pid) {
                /*Set deleted to 1
                $updateArray = array ('deleted' => 1, 'tstamp' => time());
                $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery('pages', 'uid='.intval($pageUid), $updateArray);*/
                if (!is_object($GLOBALS['LANG'])) {
                    $GLOBALS['LANG'] = t3lib_div::makeInstance('language');
                    $GLOBALS['LANG']->csConvObj = t3lib_div::makeInstance('t3lib_cs');
                }
                $GLOBALS['TCA']['pages'] = array('exist' => TRUE);
                $localTCE = getLocalTCE();
                $cmd = array();
                $cmd['pages'][$pageUid]['delete'] = 1;
                $localTCE->start(array(), $cmd);
                $localTCE->process_cmdmap();
                $returnArray['pid'] = $pid;
                $returnArray['result'] = 200;
            } else {
                $returnArray['result'] = 500;
            }
        } else {
            $returnArray['result'] = 'No user logged in.';
        }
    } else {
        $returnArray['result'] = 'No user logged in.';
    }
    return $returnArray;
        
}


function pastePage($cmd, $uid, $pageUid)
{
    if ($_COOKIE['be_typo_user']) {
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $GLOBALS['BE_USER']->admin = true;
        $GLOBALS['PAGES_TYPES']['default']['allowedTables'] = 'pages,tt_content';
        $GLOBALS['TCA']['pages']['ctrl']['versioningWS_alwaysAllowLiveEdit'] = TRUE;

        $beuserId = $GLOBALS['BE_USER']->user['uid'];
        $beuserUsername = $GLOBALS['BE_USER']->user['username'];
        
        $returnArray = array();
        
        if($beuserId) {
            $uidArray = explode(':', $uid);
            $pasteType = str_replace('cut', 'move', $uidArray[0]);
            $uidToPaste = $uidArray[2];
            if($cmd === 'pastePageAfter') {
                $pageUid = -$pageUid;
            } 
            
            try {
                // fake tcemain
                $GLOBALS['TCA']['pages']['ctrl']['sortby'] = 'sorting';
                //$GLOBALS['LANG'] = array();
                if (!is_object($GLOBALS['LANG'])) {
                    $GLOBALS['LANG'] = t3lib_div::makeInstance('language');
                    $GLOBALS['LANG']->csConvObj = t3lib_div::makeInstance('t3lib_cs');
                }

                $GLOBALS['TCA']['pages']['columns']['tstamp'] = TRUE;
                $GLOBALS['TCA']['pages']['columns']['crdate'] = TRUE;
                $GLOBALS['TCA']['pages']['columns']['cruser_id'] = TRUE;
                $GLOBALS['TCA']['pages']['columns']['editlock']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['hidden']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['title']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['doktype']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['TSconfig']['config'] = array('type' =>  'text');
                $GLOBALS['TCA']['pages']['columns']['storage_pid']['config'] = array('type' =>  'group');
                $GLOBALS['TCA']['pages']['columns']['is_siteroot']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['php_tree_stop']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['tx_impexp_origuid']['config'] = array('type' =>  'passthrough');
                $GLOBALS['TCA']['pages']['columns']['url']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['starttime']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['endtime']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['urltype']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['shortcut']['config'] = array('type' =>  'group');
                $GLOBALS['TCA']['pages']['columns']['shortcut_mode']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['no_cache']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['fe_group']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['subtitle']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['layout']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['url_scheme']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['target']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['media']['config'] = array('type' =>  'inline');
                $GLOBALS['TCA']['pages']['columns']['lastUpdated']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['keywords']['config'] = array('type' =>  'text');
                $GLOBALS['TCA']['pages']['columns']['cache_timeout']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['newUntil']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['description']['config'] = array('type' =>  'text');
                $GLOBALS['TCA']['pages']['columns']['no_search']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['abstract']['config'] = array('type' =>  'text');
                $GLOBALS['TCA']['pages']['columns']['module']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['extendToSubpages']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['author']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['author_email']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['nav_title']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['nav_hide']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['content_from_pid']['config'] = array('type' =>  'group');
                $GLOBALS['TCA']['pages']['columns']['mount_pid']['config'] = array('type' =>  'group');
                $GLOBALS['TCA']['pages']['columns']['mount_pid_ol']['config'] = array('type' =>  'radio');
                $GLOBALS['TCA']['pages']['columns']['alias']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['l18n_cfg']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['fe_login_mode']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['backend_layout']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['backend_layout_next_level']['config'] = array('type' =>  'select');
                $GLOBALS['TCA']['pages']['columns']['tx_realurl_pathsegment']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['tx_realurl_pathoverride']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['tx_realurl_exclude']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['tx_realurl_nocache']['config'] = array('type' =>  'check');
                $GLOBALS['TCA']['pages']['columns']['lft']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['rgt']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['root']['config'] = array('type' =>  'input');

                $GLOBALS['TCA']['pages']['columns']['cache_tags']['config'] = array('type' =>  'input');
                $GLOBALS['TCA']['pages']['columns']['categories']['config'] = array('type' =>  'select');


                $localTCE = getLocalTCE();
                $cmd = array();
                $cmd['pages'][$uidToPaste][$pasteType] = $pageUid;
                $localTCE->start(array(), $cmd, $GLOBALS['BE_USER']);
                $localTCE->process_cmdmap();
                if($pasteType === 'move') {
                    $returnArray['oldUid'] = $uidToPaste;
                }
                $returnArray['result'] = 200;
            } catch(Exception $e) {
                echo 'Message: ' .$e->getMessage();
                $returnArray['result'] = 500;
            }
        } else {
            $returnArray['result'] = 'No user logged in.';
        }
    } else {
        $returnArray['result'] = 'No user logged in.';
    }
    return $returnArray;
        
}


function updateCopiedPage($uid, $pageUid, $contentToPaste)
{
    if ($_COOKIE['be_typo_user']) {
        $uidArray = explode(':', $uid);
        $uidToPaste = $uidArray[2];
        
        if($contentToPaste === 'pastePageAfter') {
            $pageUid = -$pageUid;
        } 
            
        $noOfDuplicates1 = 0;
        $noOfDuplicates2 = 0;
        $noOfDuplicatesFinal = 0;
        if($pageUid < 0) {
            $where1 = 'pid = (SELECT pid FROM pages WHERE uid = ' . intval($uidToPaste) . ') AND title = (SELECT title FROM pages WHERE deleted=0 AND uid = ' . intval($uidToPaste) . ' LIMIT 0,1) AND deleted = 0';
        } else {
            $where1 = 'pid='.intval($pageUid) . ' AND title = (SELECT title FROM pages WHERE deleted=0 AND pid = (SELECT pid FROM pages WHERE uid = ' . intval($uidToPaste) . ') LIMIT 0,1) AND deleted = 0';
        }
        
        $res1 = $GLOBALS['TYPO3_DB']->exec_SELECTquery(
            'uid, title',
            'pages',
            $where1,
            '',
            'uid'
        );
        if($res1) {

            $noOfDuplicates1 = $GLOBALS['TYPO3_DB']->sql_num_rows($res1);
            if($noOfDuplicates1 > 1) {
                while ($row1 = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res1)) {
                    $uid1 = $row1['uid'];
                    $title1 = $row1['title'];
                }

                $where2 = 'pid=(SELECT pid FROM pages WHERE uid = ' . intval($uidToPaste) . ')' .
                        ' AND title LIKE CONCAT((SELECT title FROM pages WHERE deleted=0 AND uid = ' . intval($uidToPaste) . '),\' (copy%\')' .
                        ' AND deleted = 0';
                //echo $where2.$title1;
                $res2 = $GLOBALS['TYPO3_DB']->exec_SELECTquery(
                    'uid, title',
                    'pages',
                    $where2
                );
            }
            if($res2) {
                $noOfDuplicates2 = $GLOBALS['TYPO3_DB']->sql_num_rows($res2);
            }
            $GLOBALS['TYPO3_DB']->sql_free_result($res1);
            $GLOBALS['TYPO3_DB']->sql_free_result($res2);
            $noOfDuplicatesFinal = (string)$noOfDuplicates1+$noOfDuplicates2-1;
            if($noOfDuplicatesFinal > 0 && $title1) {
                $updateArray = array('title' => $title1 . ' (copy ' .  $noOfDuplicatesFinal . ')', 'tstamp' => time());
                $GLOBALS['TYPO3_DB']->exec_UPDATEquery('pages', 'uid='.intval($uid1), $updateArray);
            }
        }
    }
}


/**
* Returns a instance of TCEmain for handling local datamaps/cmdmaps
*
* @param boolean $stripslashesValues If TRUE, incoming values in the data-array have their slashes stripped.
* @param boolean $dontProcessTransformations If set, then transformations are NOT performed on the input.
* @return DataHandler
*/
function getLocalTCE($stripslashesValues = FALSE, $dontProcessTransformations = TRUE) {
       $copyTCE = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('TYPO3\\CMS\\Core\\DataHandling\\DataHandler');
       $copyTCE->stripslashes_values = $stripslashesValues;
       $copyTCE->copyTree = 9; //$this->copyTree;
       $copyTCE->admin = 1;
       // Copy forth the cached TSconfig
       //$copyTCE->cachedTSconfig = $this->cachedTSconfig;
       // Transformations should NOT be carried out during copy
       $copyTCE->dontProcessTransformations = $dontProcessTransformations;
       $copyTCE->bypassWorkspaceRestrictions = TRUE;
       return $copyTCE;
}


function hideShowPage($cmd, $pageUid, $type)
{
    if ($_COOKIE['be_typo_user']) {
        $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
        $GLOBALS['BE_USER']->start();
        $GLOBALS['BE_USER']->unpack_uc('');
        $beuserid = $GLOBALS['BE_USER']->user['uid'];
        
        $returnArray = array();
        
        if($beuserid) {
            // get the pid of the current page   
            $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('pid', 'pages', 'uid='.intval($pageUid). ' AND pid != 0');
            $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
            $pid = $row['pid'];
            $GLOBALS['TYPO3_DB']->sql_free_result($res);
            
            //Set hidden or nav_hide to 0 or 1
            if($cmd === 'hidePageInMenu' or $cmd === 'showPageInMenu') {
                $updateArray = array ('nav_hide' => $type, 'tstamp' => time());
            } else if($cmd === 'hidePage' or $cmd === 'showPage') {
                $updateArray = array ('hidden' => $type, 'tstamp' => time());
            }   
            $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery('pages', 'uid='.intval($pageUid), $updateArray);

            $returnArray['pid'] = $pid;
            $returnArray['result'] = 200;
        } else {
            $returnArray['result'] = 'No user logged in.';
        }
    } else {
        $returnArray['result'] = 'No user logged in.';
    }
    
    return $returnArray;
}


function getImgId($uid, $contentToPaste)
{
    /*$res = $GLOBALS['TYPO3_DB']->exec_SELECTquery(
        uid,
        "sys_file",
        "identifier = '$contentToPaste'");
    $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
    $uid = $row['uid'];
    $GLOBALS['TYPO3_DB']->sql_free_result($res);*/
    
    $returnArray = array();
    $returnArray['content'] = uniqid('NEW', true);
    return $returnArray;
}


function updateImageOrientation($imageOrientationId, $cUid)
{
    $updateArray = array(
        'imageorient' => $imageOrientationId,
        'tstamp' => time()
    );
    $GLOBALS['TYPO3_DB']->exec_UPDATEquery('tt_content', 'uid='.intval($cUid), $updateArray);
    
    $returnArray = array();
    $returnArray['content'] = 'ok';
    return $returnArray;
}


function moveImage($uid, $pageUid)
{
    $uidArray = explode('_', $uid);
    $i=1;
    foreach($uidArray as $key => $value) {
        //$GLOBALS['TYPO3_DB']->store_lastBuiltQuery = 1;
        //echo $value;
        $updateArray = array(
            'sorting_foreign' => $i,
            'tstamp' => time()
        );
        $GLOBALS['TYPO3_DB']->exec_UPDATEquery('sys_file_reference', 'uid = '.intval($value), $updateArray);
        //echo $GLOBALS['TYPO3_DB']->debug_lastBuiltQuery;
        $i++;
    }
    
    
    $returnArray = array();
    $returnArray['result'] = 200;
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
        
        $res = $GLOBALS['TYPO3_DB']->exec_UPDATEquery('be_users', 'uid='.intval($beuserid), $values) or die("1378; ".mysql_error());
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
                    "id" => str_replace('//','/', $dir . '/' . $f),
                    //"text" => str_replace('/','',$f),
                    "text" => $f,
                    "type" => "folder",
                    //"path" => $dir . '/' . $f,
                    "children" => scanFiles($dir . '/' . $f) // Recursively get the contents of the folder
                );
            } else {
                // It is a file
                //$id = 'fileadmin' . array_pop(explode('fileadmin', str_replace('//','/',$dir . $f)));
                $ext = strpos($f, '.') !== FALSE ? substr($f, strrpos($f, '.') + 1) : '';
                $files[] = array(
                    //"id" => str_replace('/','',$f),
                    "id" => $f,
                    //"text" => str_replace('/','',$f),
                    "text" => $f,
                    "type" => 'file',
                    'icon' => 'file file-'.substr($f, strrpos($f,'.') + 1),
                    //"path" => $dir . '/' . $f,
                    //"size" => filesize($dir . '/' . $f) // Gets the size of this file
                );
            }
        }
    }
    return $files;
}

function scanPages($db_mountpoint)
{
    /*$res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('node.uid, node.title, node.lft, node.rgt, node.pid', 
        'pages AS node JOIN pages AS parent ON node.lft BETWEEN parent.lft AND parent.rgt',
        'parent.uid = ' . intval($db_mountpoint) . ' AND node.deleted=0 AND node.hidden=0', '', 'node.lft', '');*/
    $iPid = $db_mountpoint;
$depth = 999999;
$queryGenerator = \TYPO3\CMS\Linkvalidator::makeInstance( 'TYPO3\\CMS\\Linkvalidator\\LinkAnalyzer' );
//TYPO3\CMS\Linkvalidator
$rGetTreeList = $queryGenerator->extGetTreeList($iPid, $depth, 0, 1); //Will be a string
$aPids = explode(',',$rGetTreeList);
        // Build array
    $treeArray = array();
    //while ($row = $GLOBALS["TYPO3_DB"]->sql_fetch_assoc($res)) {
    foreach($aPids as $key => $value) {
    $uid= $value[0];
    $title = $value[1];
        $treeArray[] = array('href' => '#', 'text' => $title
            . '<span class="icon share-icon glyphicon glyphicon-share"><a href="javascript:" onclick="parent.movePage(' . $uid . ',this);";>before</a></span>'
            . '<span class="icon unshare-icon glyphicon glyphicon-unshare"><a href="javascript:" onclick="parent.movePage(' . $uid . ',this);";>after</a></span>');
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
        $tmp = array_push($link,  array ('href'=>$arrValues['href'], 'text' => $arrValues['text'], 'nodeId' => $arrValues['uid'], 'nodes'=>array()));
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