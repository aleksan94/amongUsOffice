<?
class DataBase
{
	private $pdo;
	
	function __construct($db_host, $db_name, $db_user, $db_pass)
	{
		$dsn = "pgsql:host={$db_host};dbname={$db_name};user={$db_user};password={$db_pass}";
		$this->pdo = new PDO($dsn);
	}

	public function query($sql) {
		return $this->pdo->query($sql);
	}

	public function exec($sql) {
		return $this->pdo->exec($sql);
	}

	public function select($sql) {
		$res = [];
		foreach($this->pdo->query($sql, PDO::FETCH_ASSOC) as $row) {
			$res[] = $row;
		}
		return $res;
	}

	public function insert($sql) {
		return $this->exec($sql);
	}

	public function update($sql) {
		return $this->exec($sql);
	}

	public function delete($sql) {
		return $this->exec($sql);
	}
}

$conf = parse_ini_file("conf.ini");
$DB = new DataBase($conf['db_host'], $conf['db_name'], $conf['db_user'], $conf['db_pass']);