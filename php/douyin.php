<?php
// $_POST['data'] = '{"type":"add","list":{"a":{"name":"a"}}}';
	header('Access-Control-Allow-Origin: *');
	$json = file_exists('list.json') ? json_decode(file_get_contents('list.json'), true) : [];
	if(!isset($_POST['data'])){
		exit(json_encode($json));
	}
	$data = json_decode($_POST['data'], true);
		$type = $data['type'];
		$i = 0;
	foreach ($data['list'] as $id => $v) {
		$exists = isset($json[$id]);
		if($type == 'add'){
			if(!$exists){
				$json[$id] = $v;
				$i++;
			}
		}else{
			if($exists){
				unset($json[$id]);
				$i++;
			}
		}
	}
	if($i > 0){
		file_put_contents('list.json', json_encode($json));
	}
	echo json_encode(['msg' => 'ok']);
?>	