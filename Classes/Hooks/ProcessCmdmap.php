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
    
    function processCmdmap_preProcess($command, $table, $id, $value, $dataHandler)
    {
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => "$command, $table, $id, $value" . $dataHandler->getPid($table, $id), 'crdate' => time()));
        $rootLine;
        $domain;
        $domainStartPage;
        $startPageId;
        $tx_newfields_hamburgerroot;
        
        $this->orgPid = $dataHandler->getPid($table, $id);

        if($table=='pages' && ($command=='delete' || $command=='move')) {
            //$this->clearCacheStartPage($id);
        }
        if($table=='pages') {
            $this->clearRealurlCache($id);
        }
    }
    
    
    function processCmdmap_postProcess($command, $table, $id, $value, $dataHandler)
    {
        if(($table=='tt_content' || $table=='pages') && $command=='move') {
            $oTce = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('t3lib_TCEmain');
            $oTce->start(array(), array());
            $oTce->clear_cache('pages', $this->orgPid);
        }
    }
    
    
    /*public function processDatamap_postProcessFieldArray($status, $table, $id, &$fieldArray, &$pObj)
    {
        
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($status,true), 'crdate' => time()));
        if($table == 'pages' && $status =='update') {
            $this->clearCacheStartPage($id);
            $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($id);
            if($rootLine) $domain = \TYPO3\CMS\Backend\Utility\BackendUtility::firstDomainRecord($rootLine);
            if($domain) {
                //$this->purge('http://' . rtrim($domain, '/') . '/');
                $this->purge('http://' . rtrim($domain, '/') . '/?type=200');
            }
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => 'http://' . rtrim($domain, '/') . '/?type=200' . "$table, $id", 'crdate' => time()));
        }
    }*/
    
    
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
        
        //
        //$GLOBALS['BE_USER']->uc['TSFE_adminConfig']['preview_showHiddenPages'] = 1;
    }
    
    
    public function clearCachePostProc($_params, $pObj)
    {
        $pagePath;
        $domain;
        $rootLine;
        $pid;
        $fullPath;
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($_params, true), 'crdate' => time()));
        if($_params['uid_page'] || $_params['cacheCmd']) {
            if($_params['table']==='tt_content') {
                $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($_params['uid_page']);
            } elseif($_params['table']==='pages') {
                $pid = $this->getPagePid($_params['uid_page']);
                $this->clearRealurlCache(intval($_params['uid_page']));
                if($pid) $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($pid);
            } elseif($_params['cacheCmd']) {
                /*$pid = $this->getPagePid($_params['cacheCmd']);
                if($pid) $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($pid);
                $_params['uid_page'] = $_params['cacheCmd'];*/
                $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($_params['cacheCmd']);
                $_params['uid_page'] = $_params['cacheCmd'];
            }
            if($rootLine) $domain = \TYPO3\CMS\Backend\Utility\BackendUtility::firstDomainRecord($rootLine); 
            if($domain) $pagePath = \TYPO3\CMS\Backend\Utility\BackendUtility::getRecordPath($_params['uid_page'],'','');
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $domain.$pagePath, 'crdate' => time()));

            if($pagePath) {
                $fullPathArray = $this->getFullPath($pagePath, $domain, $_params['cacheCmd']);
                $fullPath = $fullPathArray[0];
                if($_params['table']==='tt_content' || $_params['cacheCmd']) {
                    $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => rtrim($fullPath, '/') . '/', 'crdate' => time()));
                    $this->purge(rtrim($fullPath, '/') . '/');
                } elseif($_params['table']==='pages') {
                    $this->banDown(rtrim($fullPath, '/') . '/');
                    //$this->clearCacheStartPage($_params['uid_page']);
                    $domainPath = $fullPathArray[1];
                    $this->purge($domainPath);
                }
            }
        }
        //
    }
    
    
    /*function processDatamap_afterDatabaseOperations()
    {
                $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => "???", 'crdate' => time()));

    }*/
    
    
    function clearCacheStartPage($id)
    {
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('tx_newfields_hamburgerroot','pages','uid='.intval($id));
        $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        $tx_newfields_hamburgerroot = $row['tx_newfields_hamburgerroot'];
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        if($tx_newfields_hamburgerroot > 0) {
            $startPageId = $tx_newfields_hamburgerroot;
        } else {
            $rootLine = \TYPO3\CMS\Backend\Utility\BackendUtility::BEgetRootLine($id);
            if($rootLine) $domain = \TYPO3\CMS\Backend\Utility\BackendUtility::firstDomainRecord($rootLine);
            if($domain) {
                $domainStartPage = \TYPO3\CMS\Backend\Utility\BackendUtility::getDomainStartPage($domain);
                $pagePath = \TYPO3\CMS\Backend\Utility\BackendUtility::getRecordPath($id,'','');
            }
            if($domainStartPage) $startPageId = $domainStartPage;
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => print_r($domainStartPage,true), 'crdate' => time()));
        }
        if($startPageId) {
            $oTce = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance('t3lib_TCEmain');
            $oTce->start(array(), array());
            $oTce->clear_cache('pages', $startPageId);
        }
    }
    
    
    function clearRealurlCache($id)
    {
        
        if($id) {
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $id, 'crdate' => time()));
            //$GLOBALS['TYPO3_DB']->store_lastBuiltQuery = 1;
            $GLOBALS['TYPO3_DB']->exec_DELETEquery('tx_realurl_pathcache', 'page_id=' . intval($id));
            //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $GLOBALS['TYPO3_DB']->debug_lastBuiltQuery, 'crdate' => time()));
            $GLOBALS['TYPO3_DB']->exec_DELETEquery('tx_realurl_urldecodecache', 'page_id=' . intval($id));
            $GLOBALS['TYPO3_DB']->exec_DELETEquery('tx_realurl_urlencodecache', 'page_id=' . intval($id));
        }
    }
    
        
    function getFullPath($pagePath, $domain, $cacheCmd)
    {
        $pagePathArray = explode('/', $pagePath);
        //print_r($pagePathArray);
        array_shift($pagePathArray);
        array_shift($pagePathArray);
        array_shift($pagePathArray);
        $pagePathArray = array_map('trim',$pagePathArray);
        
        //if($cacheCmd) array_shift($pagePathArray);
        $pagePath = strtolower(implode('/', $pagePathArray));
        $pagePath = str_replace('å','aa',$pagePath);
        $pagePath = str_replace('ä','ae',$pagePath);
        $pagePath = str_replace('ö','oe',$pagePath);
        $pagePath = str_replace(' & ','-',$pagePath);
        $pagePath = str_replace(' - ','-',$pagePath);
        $pagePath = str_replace(' -','-',$pagePath);
        $pagePath = str_replace('- ','-',$pagePath);
        $pagePath = str_replace('_','-',$pagePath);
        //$GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $pagePath, 'crdate' => time()));
        $fullPath = 'http://' . rtrim($domain,'/') . '/' . ltrim($pagePath, '/');
        $domainPath = 'http://' . rtrim($domain,'/') . '/?type=200';
        return array($fullPath, $domainPath);
    }
    
    
    function purge($pageUrl)
    {
	try {
            if($pageUrl) {
                //echo str_replace(' ', '-', rtrim($pageUrl, '/'));
                $curl = curl_init(str_replace(' ', '-', rtrim($pageUrl, '/')));
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BAN");                
                $res = curl_exec($curl);
                
                //echo str_replace(' ', '-', rtrim($pageUrl, '/')) . '/';
                $curl = curl_init(str_replace(' ', '-', rtrim($pageUrl, '/')) . '/');
                curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BAN");
                $res = curl_exec($curl);
                

                //$res = curl_exec($curl);
                if(curl_exec($curl) === false)
                {
                   // echo 'Curl error: ' . curl_error($curl);
                }
                else
                {
                    //echo 'Operation completed without any errors';
                }
            }
            
            

            
            
            /*$curl = curl_init($pageUrl . '/');
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BAN");
            $res = curl_exec($curl);*/
            
	} catch(Exception $e) {
            $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $pageUrl, 'crdate' => time()));
	}
    }
    
    
    function banDown($pageUrl)
    {
        try {
            //echo $pageUrl;
	    $curl = curl_init($pageUrl);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BANDOWN");
            $res = curl_exec($curl);
	} catch(Exception $e) {
            $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $pageUrl, 'crdate' => time()));
	}
    }
    
    
    function banDomain($pageUrl)
    {
	try {
	    $curl = curl_init($pageUrl);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BANDOMAIN");
            $res = curl_exec($curl);
	} catch(Exception $e) {
            $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $pageUrl, 'crdate' => time()));
	}
    }
    
    
    function banPath($pageUrl)
    {
	try {
	    $curl = curl_init($pageUrl);
	    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
	    curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "BANPATH");
            $res = curl_exec($curl);
	} catch(Exception $e) {
            $GLOBALS['TYPO3_DB']->exec_INSERTquery('tx_devlog', array('msg' => $pageUrl, 'crdate' => time()));
	}
    }
    
    
    function getPagePid($uid)
    {
        $res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('pid', 'pages', 'uid='.intval($uid));
        $row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);
        $pid = $row['pid'];
        $GLOBALS['TYPO3_DB']->sql_free_result($res);
        if(intval($pid)===0) return intval($uid);
        return $pid;
    }
    
    
}