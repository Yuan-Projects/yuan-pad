<?php
/**
 * Abstract class for all databases
 *
 * @author rainyjune
 * @license MIT
 * @link https://github.com/rainyjune/yuan-pad 
 */
abstract  class YDBBase {
    abstract public function query($sql);
    abstract public function queryAll($sql);
    abstract public function queryWithLimit($sql, $offset, $row_count);
    abstract public function insert_id();
    abstract public function error();
    abstract public function server_version();
    abstract public function escape_string($item);
    abstract public function num_rows($result);
    abstract public function num_fields($result);
    abstract public function affected_rows();
    abstract public function table_exists($table_name);
    abstract public function close();
}
