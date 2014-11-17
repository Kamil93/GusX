<?php
	function getFileList($directory) {
		$result = "";

		if(is_dir($directory)) {

			if($dh = opendir($directory)){
				while(($file = readdir($dh)) != false) {
					if(!($file == "." or $file == "..")) {
						$result = $result . $file . ";";
					}
				}
			}
			
			$result = rtrim($result, ";");
			
			return $result;
		}
	}
?>