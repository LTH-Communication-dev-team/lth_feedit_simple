<?php
if (!defined('TYPO3_MODE')) {
  die ('Access denied.');
}
//t3lib_extMgm::addStaticFile($_EXTKEY,'static/lth_feedit_simple_settings/', 'lth_feedit_simple settings');

$tempColumns = array(
   'imagewidth' => array(
      'exclude' => 1,
      'l10n_mode' => 'mergeIfNotBlank',
      'label' => 'Image width',
      'config' => array(
         'default' => '',
         'eval' => 'null',
         'mode' => 'useOrOverridePlaceholder',
         'placeholder' => '__row|uid_local|metadata|imagewidth',
         'size' => 20,
         'type' => 'input'
      )
   ),
    'imageheight' => array(
      'exclude' => 1,
      'l10n_mode' => 'mergeIfNotBlank',
      'label' => 'Image height',
      'config' => array(
         'default' => '',
         'eval' => 'null',
         'mode' => 'useOrOverridePlaceholder',
         'placeholder' => '__row|uid_local|metadata|imageheight',
         'size' => 20,
         'type' => 'input'
      )
   )
);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns('sys_file_reference',$tempColumns,1);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addFieldsToPalette(
        'sys_file_reference',
        'imageoverlayPalette',
        ';;;;3-3-3,--linebreak--,imagewidth,imageheight',
        'after:description'
);