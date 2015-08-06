<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
if(isset($_GET['id'])) {
    $id = $_GET['id'];
    echo $id;
}
var_dump($_GET);
var_dump($_POST);