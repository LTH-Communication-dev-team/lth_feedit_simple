<?php
define('PATH_t3lib','../../../../../t3lib/');
define('PATH_tslib','../../../../../typo3/sysext/cms/tslib/');
define('PATH_thisScript', str_replace('//', '/', str_replace('\\', '/',
	(PHP_SAPI == 'fpm-fcgi' || PHP_SAPI == 'cgi' || PHP_SAPI == 'isapi' || PHP_SAPI == 'cgi-fcgi') &&
	($_SERVER['ORIG_PATH_TRANSLATED'] ? $_SERVER['ORIG_PATH_TRANSLATED'] : $_SERVER['PATH_TRANSLATED']) ?
	($_SERVER['ORIG_PATH_TRANSLATED'] ? $_SERVER['ORIG_PATH_TRANSLATED'] : $_SERVER['PATH_TRANSLATED']) :
	($_SERVER['ORIG_SCRIPT_FILENAME'] ? $_SERVER['ORIG_SCRIPT_FILENAME'] : $_SERVER['SCRIPT_FILENAME']))));

define('PATH_site', dirname(PATH_thisScript).'/');

require_once(PATH_tslib.'class.tslib_fe.php');
require_once(PATH_t3lib.'class.t3lib_page.php');
require_once(PATH_t3lib.'class.t3lib_tstemplate.php');
require_once(PATH_t3lib.'class.t3lib_cs.php');
require_once(PATH_tslib.'class.tslib_content.php');
require_ONCE(PATH_tslib.'index_ts.php');

class lth_feedit_simple_getfiles {
    var $cObj;// The backReference to the mother cObj object set at call time
    /**
    * Call it from a USER cObject with 'userFunc = user_randomImage->main_randomImage'
    */
    function main($rfm_subfolder)
    {
	if ($_COOKIE['be_typo_user']) {
	    require_ONCE(PATH_tslib.'index_ts.php');
	    require_once (PATH_t3lib.'class.t3lib_befunc.php');
	    require_once (PATH_t3lib.'class.t3lib_userauth.php');
	    require_once (PATH_t3lib.'class.t3lib_userauthgroup.php');
	    require_once (PATH_t3lib.'class.t3lib_beuserauth.php');
	    require_once (PATH_t3lib.'class.t3lib_tsfebeuserauth.php');

	    // the value this->formfield_status is set to empty in order to disable login-attempts to the backend account through this script
	    // @todo 	Comment says its set to empty, but where does that happen?

	    $GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
	    $GLOBALS['BE_USER']->start();
	    $GLOBALS['BE_USER']->unpack_uc('');
	    $beuserid = $GLOBALS['BE_USER']->user['uid'];
	}
	$GLOBALS['BE_USER'] = t3lib_div::makeInstance('t3lib_tsfeBeUserAuth');
	$beUserId = $GLOBALS['BE_USER']->user['username'];
	return $beUserId.'ll';
    }
}