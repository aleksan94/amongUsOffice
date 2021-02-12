<?
error_reporting(E_ERROR | E_PARSE);

include($_SERVER['DOCUMENT_ROOT']."/core/db.php");

$method = $_SERVER['REQUEST_METHOD'];
parse_str(file_get_contents('php://input'), $output);

if($method == 'GET') {
	$sql = "SELECT * FROM public.user";
	$arr = $DB->select($sql);

	$res = array_map(function($el) {
		return array_filter($el, function($key) { return in_array($key, ['id', 'login', 'avatar']); }, ARRAY_FILTER_USE_KEY);
	}, $arr);
}

header("Content-Type: application/json");
echo json_encode($res);	

