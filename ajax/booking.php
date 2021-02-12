<?
error_reporting(E_ERROR | E_PARSE);

include($_SERVER['DOCUMENT_ROOT']."/core/db.php");

$method = $_SERVER['REQUEST_METHOD'];
parse_str(file_get_contents('php://input'), $output);

if($method == 'GET') {
	$sql = "SELECT * FROM public.booking WHERE DATE(date) BETWEEN '".date('Y-m-d')."' AND '".date('Y-m-d')."'";
	$arr = $DB->select($sql);

	$res = array_map(function($el) {
		return array_filter($el, function($key) { return in_array($key, ['user_id', 'table_id']); }, ARRAY_FILTER_USE_KEY);
	}, $arr);
}
else if($method == 'POST') {
	$tableId = $output['tableId'];
	$userId = $output['userId'];

	if($tableId && $userId) {
		$sql = "DELETE FROM public.booking WHERE user_id = ".$userId." AND DATE(date) BETWEEN '".date('Y-m-d')."' AND '".date('Y-m-d')."'";
		$DB->exec($sql);

		$sql = "INSERT INTO public.booking (date, user_id, table_id) VALUES ('".date('Y-m-d')."', ".$userId.", ".$tableId.")";
		$res = $DB->exec($sql) > 0 ? 'ok' : 'error';
	}
	else {
		$res = 'error';
	}
}
else if($method == 'DELETE') {
	$tableId = $output['tableId'];
	$userId = $output['userId'];

	if($tableId && $userId) {
		$sql = "DELETE FROM public.booking WHERE table_id = ".$tableId." AND user_id = ".$userId;
		$res = $DB->exec($sql) > 0 ? 'ok' : 'error';
	}
	else {
		$res = 'error';
	}
}

header("Content-Type: application/json");
echo json_encode($res);	

