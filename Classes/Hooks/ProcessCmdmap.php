<?php
namespace LTH\lth_feedit_simple\Hooks;

$orgPid;

class ProcessCmdmap {
   /**
    *
    * @param string $table the table of the record
    * @param integer $id the ID of the record
    * @param array $record The accordant database record
    * @param boolean $recordWasDeleted can be set so that other hooks or
    * @param DataHandler $tcemainObj reference to the main tcemain object
    * @return   void
    */
    
   
    
    public function postUserLookUp($_params, $pObj)
    {
        //date_default_timezone_set("Europe/Stockholm");
        //$uid = $pObj->user['uid'];
        $ses_name = $pObj->user['ses_name'];
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($pObj,true), 'crdate' => time()));
        if($ses_name) {
            if (!isset($_COOKIE['feeditSimple-session'])) {
                setcookie("feeditSimple-session","session",time()+(3600*3),"/");
            }
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => 'set', 'crdate' => time()));
        } else {
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => 'delete', 'crdate' => time()));
            //setcookie("feeditSimple-session", '', '/');
            if (isset($_COOKIE['feeditSimple-session'])) {
                unset($_COOKIE['feeditSimple-session']);
                setcookie("feeditSimple-session","session",time()-3600,"/");
            }
        }
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $_COOKIE["feeditSimple-usersettings"], 'crdate' => time()));
        //
        //$GLOBALS['BE_USER']->uc['TSFE_adminConfig']['preview_showHiddenPages'] = 1;
    }   
}