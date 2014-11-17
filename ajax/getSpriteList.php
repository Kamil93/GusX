<?php
	$target = ctype_alnum($_GET["locname"]) ? $_GET["locname"] : "error";

	if ( $target == "error" ) die;
	
	require_once("../libs/getFileList.php");
	
	$directory = "";
	
	if ( $target == "global" )
		$directory = "../assets/sprites/";
	else
		$directory = "../assets/maps/" . htmlspecialchars($target) . "/sprites/";

	echo getFileList($directory);	
?>