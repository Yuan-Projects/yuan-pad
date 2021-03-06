<?php
class ConfigController extends BaseController{
    public $_model;

    public function  __construct(){
        global $db_url;
        $this->_model=  YDB::factory($db_url);
    }
    
    
    /**
     * Returns all site configuration except admin password and filter words.
     *
     */
    public function actionShow() {
        $result = $this->_model->queryAll(parse_tbprefix("SELECT * FROM <sysvar> WHERE varname != 'password' AND varname != 'filter_words'"));
        $formatedResult = array();
        foreach($result as $v) {
            $formatedResult[$v['varname']] = $v['varvalue'];
        }
        exitWithResponse(200, $formatedResult);
    }
    
    /**
     * Returns all site configuration except admin password.
     *
     */
    public function actionShowAll() {
        isAdminAjaxRequest();
        $result = $this->_model->queryAll(parse_tbprefix("SELECT * FROM <sysvar> WHERE varname != 'password'"));
        $formatedResult = array();
        foreach($result as $v) {
            $formatedResult[$v['varname']] = $v['varvalue'];
        }
        exitWithResponse(200, $formatedResult);
    }
    
    /**
     * Returns translations according to the site language set.
     */
    public function actionGetTranslations() {
        exitWithResponse(200, getLangArray());
    }
    
    /**
     *
     * Update site configurations.
     * 
     */
    public function actionUpdate(){
        isAdminAjaxRequest();
        is_post();

        $this->set_board_name();
        $this->set_site_close();
        $this->set_close_reason();
        $this->set_admin_email();
        $this->set_copyright_info();
        $this->set_filter_words();
        $this->set_valid_code_open();
        $this->set_page_on();
        $this->set_num_perpage();
        $this->set_theme();
        $this->set_admin_password();
        $this->set_lang();
        $this->set_date_format();
        $this->set_time_zone();

        $this->set_filter_type();
        $this->set_allowed_tags();

        exitWithResponse(200);
    }
    private function set_board_name(){
        $board_name=$_POST['board_name']?maple_quotes($_POST['board_name']):'YuanPad';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='board_name'"),$board_name));
    }

    private function set_site_close(){
        $site_close=$_POST['site_close']?(int)$_POST['site_close']:0;
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='site_close'"),$site_close));
    }

    private function set_close_reason(){
        $close_reason=maple_quotes($_POST['close_reason']);
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='close_reason'"),$close_reason));
    }

    private function set_admin_email(){
        $admin_email=$_POST['admin_email']?maple_quotes($_POST['admin_email']):'rainyjune@live.cn';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='admin_email'"),$admin_email));
    }

    private function set_copyright_info(){
        @$copyright_info=$_POST['copyright_info']?maple_quotes($_POST['copyright_info']):'Copyright &copy; MySite';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='copyright_info'"),$copyright_info));
    }

    private function set_filter_words(){
        $filter_words=$_POST['filter_words']?  fix_filter_string($_POST['filter_words']):'';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='filter_words'"),$filter_words));
    }

    private function set_valid_code_open(){
        $valid_code_open=(int)$_POST['valid_code_open'];
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='valid_code_open'"),$valid_code_open));
    }

    private function set_page_on(){
        $page_on=(int)$_POST['page_on'];
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='page_on'"),$page_on));
    }

    private function set_num_perpage(){
        $num_perpage=(int)$_POST['num_perpage'];
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='num_perpage'"),$num_perpage));
    }

    private function set_theme(){
        $theme=in_array($_POST['theme'], get_all_themes())?$_POST['theme']:'simple';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='theme'"),$theme));
    }

    private function set_time_zone(){
        $timezone=(isset($_POST['timezone']) && in_array($_POST['timezone'],array_keys(get_all_timezone())))?$_POST['timezone']:'0';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='timezone'"),$timezone));
    }

    private function set_lang(){
        $lang=(isset($_POST['lang']) && in_array($_POST['lang'],  get_all_langs()))?$_POST['lang']:'en';
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='lang'"),$lang));
    }

    private function set_admin_password(){
        if (isset($_POST['password']) && !empty($_POST['password'])) {
            $password = maple_quotes($_POST['password']);
            $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='password'"), hashPassword($password)));
        }
    }

    private function set_filter_type(){
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='filter_type'"),  $this->_model->escape_string($_POST['filter_type'])));
    }

    private function set_allowed_tags(){
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='allowed_tags'"),  $this->_model->escape_string($_POST['allowed_tags'])));
    }
    
    private function set_date_format() {
        $this->_model->query(sprintf(parse_tbprefix("UPDATE <sysvar> SET varvalue='%s' WHERE varname='dateformat'"),$_POST['dateformat']));
    }
}
