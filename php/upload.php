<?php  
if(isset($_POST['user'])){
    $saveTo = './users/'.$_POST['user'].'.json';
    if(isset($_POST['data'])){
        if(!is_dir('./users/')) @mkdir('./users/', 0777);
        file_put_contents($saveTo, $_POST['data']);
        echo json_encode(['msg' => 'ok']);
    }else
    if(file_exists($saveTo)){
        echo file_get_contents($saveTo);
    }
}
?>