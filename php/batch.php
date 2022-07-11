<?php
header("Access-Control-Allow-Origin: *");
$list = $_POST['list'];
// $list = ['MS4wLjABAAAA3wrpLWnu3GVl7lXIlvbKvVPbegXxBpERXU_qTvfoDmQ' => 7119102797156535586, 'MS4wLjABAAAAiR0oaZ3OrGNXR_9TqwJzcKXkjlehDlZtYmzT8-DccY_TcgJhYMUG2n08BpI0FJ4o' => 7119102797156535586];
if($list){
	$ch = curl_init();
	$options =  array(
		CURLOPT_HEADER => false,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_TIMEOUT => 30,
		CURLOPT_PROXYAUTH => CURLAUTH_BASIC,
		CURLOPT_SSL_VERIFYPEER => false,
		CURLOPT_SSL_VERIFYHOST => false,
		CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36 Edg/81.0.416.58'
	);
	curl_setopt_array($ch, $options);
	$r = [];

	foreach ($list as $key => $last) {
		curl_setopt($ch, CURLOPT_URL, 'https://www.iesdouyin.com/web/api/v2/aweme/post/?sec_uid='.$key.'&count=10&max_cursor=0&aid=1128&_signature=HunHKQABfpAtN81GL5ujHx7pvd');
		$json = json_decode(curl_exec($ch), true);
		$arr = ['aweme_list' => []];
		foreach($json['aweme_list'] as $item){
			if($item['aweme_id'] > $last){
				$arr['aweme_list'][] = [
					'aweme_id' => $item['aweme_id'],
					'desc' => $item['desc'],
					'desc' => $item['desc'],
					'desc' => $item['desc'],
					'video' => [
						'vid' => $item['video']['vid'],
						'duration' => $item['video']['duration'],
						'cover' => [
							'uri' => $item['video']['cover']['uri'],
							'url_list' => [$item['video']['cover']['url_list'][0]]
						],
						'dynamic_cover' => [
							'uri' => $item['video']['dynamic_cover']['uri']
						],
						'origin_cover' => [
							'uri' => $item['video']['origin_cover']['uri']
						],
						'play_addr' => [
							'url_list' => ['', '', $item['video']['play_addr']['url_list'][2]]
						],
					],
					'statistics' => [
							'comment_count' => $item['statistics']['comment_count'],
							'digg_count' => $item['statistics']['digg_count'],
							'share_count' => $item['statistics']['share_count'],
					],
				];
			}
		}
		$r[$key] = $arr;
	}
	curl_close($ch);
	exit(json_encode($r));
}
