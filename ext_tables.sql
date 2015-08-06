#
# Add field to table 'be_groups'
#
CREATE TABLE be_users (
    tx_feEditSimple_usersettings varchar(255) DEFAULT '' NOT NULL,
    tx_feEditSimple_clipboard text
);

#
# Table structure for table 'lth_feedit_simple_user_sessions'
#
DROP TABLE IF EXISTS 'lth_feedit_simple_user_sessions';
CREATE TABLE lth_feedit_simple_user_sessions (
    uid int(11) NOT NULL auto_increment,
    pid int(11) DEFAULT '0' NOT NULL,
    tstamp int(11) DEFAULT '0' NOT NULL,
    crdate int(11) DEFAULT '0' NOT NULL,
    cruser_id int(11) DEFAULT '0' NOT NULL,
    be_typo_user varchar(255) DEFAULT '' NOT NULL,
    be_user_id int(11) DEFAULT '0' NOT NULL,
    PRIMARY KEY (uid)
);