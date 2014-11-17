<?php
	$target = ctype_alnum($_GET["locname"]) ? $_GET["locname"] : "error";

	if ( $target == "error" ) die;
	
	require_once("../libs/getFileList.php");
	
	$result = "";
	$directory = "";
	
	if ( $target == "global" )
		$directory = "../assets/objects/";
	else
		$directory = "../assets/maps/" . htmlspecialchars($target) . "/objects/";

	$result = getFileList($directory);
	
	$array = explode(";", $result);

	$result = "{";
	
	for ( $i=0; $i<count($array); $i++ ) {
		$result .= '"' . $array[$i] . '":' . file_get_contents($directory . "/" . $array[$i]);
		if ( $i < count($array)-1 ) $result .= ","; 
	}
	
	$result .= "}";
	
	echo $result;
?>