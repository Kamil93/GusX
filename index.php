<!DOCTYPE html>

<html>
	<head>
		<script>
			window.conn_to_id = "<?php echo($_GET["conntoid"]); ?>";
		</script>
	
		<script type="text/javascript" src="config.js"></script>
		
		<script type="text/javascript" src="libs/jquery-2.1.1.min.js"></script>
		<script type="text/javascript" src="libs/jquery.waitforimages.js"></script>
		
		<script type="text/javascript" src="libs/json5.js"></script>
		<script type="text/javascript" src="libs/fpsmeter.min.js"></script>
		<script type="text/javascript" src="libs/base64.js"></script>
		<script type="text/javascript" src="libs/canvas2image.js"></script>
		<script type="text/javascript" src="libs/bin-packing/js/packer.growing.js"></script>
		<script type="text/javascript" src="libs/bitset/bitset.js"></script>
		<script type="text/javascript" src="libs/uuid.js"></script>
		
		<script type="text/javascript" src="http://cdn.peerjs.com/0.3/peer.min.js"></script>
		
		<script type="text/javascript" src="libs/pixi/bin/pixi.dev.js"></script>
		<script type="text/javascript" src="classes/pixi/OccFilter.js"></script>
		<script type="text/javascript" src="classes/pixi/Texture.js"></script>
		<script type="text/javascript" src="classes/pixi/Sprite.js"></script>
		<script type="text/javascript" src="classes/pixi/SpriteSet.js"></script>
		<script type="text/javascript" src="classes/pixi/Level.js"></script>
		<script type="text/javascript" src="classes/pixi/Light.js"></script>
		<script type="text/javascript" src="classes/pixi/LightManager.js"></script>
		<script type="text/javascript" src="classes/pixi/MapGfx.js"></script>
		
		<script type="text/javascript" src="classes/CTools.js"></script>
		<script type="text/javascript" src="classes/CCamera.js"></script>
		<script type="text/javascript" src="classes/CShape.js"></script>
		<script type="text/javascript" src="classes/CShapeBox.js"></script>
		<script type="text/javascript" src="classes/CShapeParticleSensor.js"></script>
		<script type="text/javascript" src="classes/CScriptAction.js"></script>
		<script type="text/javascript" src="classes/CScriptEvent.js"></script>
		<script type="text/javascript" src="classes/CScriptTimerEvent.js"></script>
		<script type="text/javascript" src="classes/CObject.js"></script>
		<script type="text/javascript" src="classes/CObjectSync.js"></script>
		<script type="text/javascript" src="classes/CObjectDefine.js"></script>
		<script type="text/javascript" src="classes/CObjectGetSet.js"></script>
		<script type="text/javascript" src="classes/CObjectCol.js"></script>
		<script type="text/javascript" src="classes/CNinjaRope.js"></script>
		<script type="text/javascript" src="classes/CNinjaRopeSync.js"></script>
		<script type="text/javascript" src="classes/CPlayer.js"></script>
		<script type="text/javascript" src="classes/CPlayerSync.js"></script>
		<script type="text/javascript" src="classes/CGrid.js"></script>
		<script type="text/javascript" src="classes/CGridTest.js"></script>
		<script type="text/javascript" src="classes/CLineTest.js"></script>
		<script type="text/javascript" src="classes/CMap.js"></script>
		<script type="text/javascript" src="classes/CMapPhysic.js"></script>
		<script type="text/javascript" src="classes/CMapMaterial.js"></script>
		<script type="text/javascript" src="classes/CGame.js"></script>
		
		<script type="text/javascript" src="classes/main/CWSClient.js"></script>
		<script type="text/javascript" src="classes/main/CPeerJS.js"></script>
		
		<script type="text/javascript" src="classes/main/CGusX.js"></script>
		<script type="text/javascript" src="classes/main/CClient.js"></script>
		<script type="text/javascript" src="classes/main/CBrowserHost.js"></script>
		
		<script type="text/javascript" src="main.js"></script>
		
		<link type="text/css" rel="stylesheet" href="styles/main.css"> 
	</head>
	
	<body onload="start();">
		<div id="data" style="position: fixed; top: 0px; background-color: rgba(0,0,0,0.0); width: 100%; color:white; text-align: center; font-family: 'Courier New', monospace;">
			<span id="predic">0</span>
			<span id="ping">ping</span>
			<span id="v">0;0</span>
		</div>
		<div id="log" style="position: fixed; right: 50px; width: 550px; max-height: 500px; overflow-y: auto; background-color: gray;">
		</div>
		<canvas id="playground" width=640 height=480>
			<span>Twoja przeglądarka nie wspiera elementu Canvas.</span>
		</canvas>
		<button id="save">Save PNG</button>
		<script>
			$(document).ready(function() {
				$("button#save").click(function() {
					Canvas2Image.saveAsPNG(document.getElementById("playground")); 
				});
			});
		</script>
	</body>
</html>