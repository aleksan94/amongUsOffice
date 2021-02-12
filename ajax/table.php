<?
include($_SERVER['DOCUMENT_ROOT']."/core/db.php");

$sql = "SELECT * FROM public.table";
$arr = $DB->select($sql);
$arr = array_map(function($el) {
	return ['id' => $el['id'], 'coords' => [$el['coord_x1'], $el['coord_y1'], $el['coord_x2'], $el['coord_y2']]];
}, $arr);

header("Content-Type: application/json");
echo json_encode($arr);