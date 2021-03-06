<?php
class UserController extends BaseController{
    public $_model;
    
    public function  __construct(){
        global $db_url;
        $this->_model=  YDB::factory($db_url);
    }
  
    /**
     * Returns all the users.
     * 
     */
    public function actionList() {
        isAdminAjaxRequest();
        exitWithResponse(200, $this->_getAllUsers());
    }
    
    protected function _getAllUsers() {
        $user_data=$this->_model->queryAll(parse_tbprefix("SELECT uid, username, email FROM <sysuser> ORDER BY uid DESC"));
        foreach ($user_data as &$user) {
            $user['uid'] = (int)$user['uid'];
            $user['user_type'] = 'regular';
        }
        return $user_data;
    }
  
    /**
     * Sign up.
     */
    public function actionCreate(){
        $currentUser = getCurrentUser();
        if($currentUser['user_type'] !== "guest"){
            exitWithResponse(403);
        }
        issetPostParam(array('user', 'pwd', 'email'));
        if(empty ($_POST['user']) || empty ($_POST['pwd']) || empty ($_POST['email'])){
            exitWithResponse(400, t('FILL_NOT_COMPLETE'));
        }
        if(strlen(trim($_POST['user'])) < 2) {
            exitWithResponse(400, t('USERNAME_TOO_SHORT'));
        }
        if(is_email($_POST['email']) == false){
            exitWithResponse(400, t('EMAIL_INVALID'));
        }
        $user =  $this->_model->escape_string($_POST['user']);
        $pwd =  $this->_model->escape_string($_POST['pwd']);
        $email = $_POST['email'];
        $time = time();
        $user_exists=$this->_model->queryAll(sprintf(parse_tbprefix("SELECT * FROM <sysuser> WHERE username='%s'"),$user));
        
        if($user_exists || $user == ZFramework::app()->admin) {
            exitWithResponse(400, t('USERNAME_NOT_AVAILABLE'));
        }
        $pwd = hashPassword($pwd);
        if($this->_model->query(sprintf(parse_tbprefix("INSERT INTO <sysuser> ( username , password , email , reg_time ) VALUES ( '%s' , '%s' , '%s' , %d )"),$user,$pwd,$email,$time))){
            $uid = $this->_model->insert_id();
            $_SESSION['user'] = $user;
            $_SESSION['uid'] =  $uid;
            $_SESSION['email'] = $email;
            $_SESSION['token'] = getToken();
            setrawcookie('CSRF-TOKEN', $_SESSION['token']);
            exitWithResponse(200, array('uid'=>$uid, 'username'=> $user, 'email'=>$email, 'user_type'=>'regular'));
        } else {
            exitWithResponse(500, $this->_model->error());
        }
    }
    
    /**
     * Get a specified user by uid.
     */
    public function actionShow() {
        issetGETParam('uid', t('PARAM_ERROR'));
        $this->checkUpdate();
        $currentUser = getCurrentUser();
        if (($currentUser['user_type'] !== "admin") && $_GET['uid'] != $currentUser['uid']) {
            exitWithResponse(403);
        }
        $uid = $_GET['uid'];
        $user_data = $this->_model->queryAll(sprintf(parse_tbprefix("SELECT uid, username, email FROM <sysuser> WHERE uid=%d"),$uid));
        if(count($user_data)){
            $result = $user_data[0];
            $result['uid'] = (int)$result['uid'];
            exitWithResponse(200, $result);
        } else {
            exitWithResponse(404, t('USER_NOT_EXISTS'));
        }
    }
    
    protected function checkUpdate() {
        $currentUser = getCurrentUser();
        if($currentUser['user_type'] === "guest") {
            exitWithResponse(401, t('LOGIN_REQUIRED'));
        }
    }

    /**
     * Update user profile.
     */
    public function actionUpdate(){
        issetPostParam(array('uid', 'user', 'pwd', 'email'), t('PARAM_ERROR'));
        $this->checkUpdate();
        $currentUser = getCurrentUser();
        if(($currentUser['user_type'] != "admin") && $_POST['uid'] != $currentUser['uid']) {
            exitWithResponse(403);
        }
        if (!is_email($_POST['email'])) {
            exitWithResponse(400, t('EMAIL_INVALID'));
        }
        $uid = $_POST['uid'];
        if(!empty ($_POST['user']) && !empty ($_POST['email'])){
            $user=  $this->_model->escape_string($_POST['user']);
            $email=$_POST['email'];
            $sql = sprintf(parse_tbprefix("UPDATE <sysuser> SET email = '%s' WHERE uid = %d"), $email, $uid);
            if(!empty ($_POST['pwd'])) {
                $pwd =  hashPassword($this->_model->escape_string($_POST['pwd']));
                $sql = sprintf(parse_tbprefix("UPDATE <sysuser> SET password = '%s' , email = '%s' WHERE uid = %d"),$pwd,$email,$uid);
            }
            if($this->_model->query($sql)){
                if ($_POST['uid'] == $currentUser['uid']) {
                    $_SESSION['email'] = $email;
                }
                exitWithResponse(200, array('uid'=>$uid, 'username'=> $user, 'email'=>$email, 'user_type'=>'regular'));
            } else {
                $exitWithResponse(500, t('USERUPDATEFAILED'));
            }
        } else {
            exitWithResponse(400, t('FILL_NOT_COMPLETE'));
        }
    }
    
    /**
     * Remove a user by uid.POST only.
     *
     */
    public function actionDelete(){
        isAdminAjaxRequest();
        issetPostParam('uid');
        $uid = (int)$_POST['uid'];
        $this->_model->query(parse_tbprefix("DELETE FROM <sysuser> WHERE uid=$uid"));
        $this->_model->query(parse_tbprefix("UPDATE <post> SET uid=0 WHERE uid=$uid"));
        exitWithResponse(200, $this->_getAllUsers());
    }
    
    /**
     * Remove all users from database.
     *
     */
    public  function actionDeleteAll(){
        isAdminAjaxRequest();
        $this->_model->query(parse_tbprefix("DELETE FROM <sysuser>"));
        $this->_model->query(parse_tbprefix("UPDATE <post> SET uid = 0"));
        exitWithResponse(200);
    }
    
    /**
     * Remove multiple users.
     */
    public  function actionDelete_multi(){
        isAdminAjaxRequest();
        issetPostParam('select_uid');
        
        $del_ids=$_POST['select_uid'];
        foreach($del_ids as $deleted_id){
            $this->_model->query(parse_tbprefix("DELETE FROM <sysuser> WHERE uid=$deleted_id"));
            $this->_model->query(parse_tbprefix("UPDATE <post> SET uid=0 WHERE uid=$deleted_id"));
        }
        exitWithResponse(200, $this->_getAllUsers());
    }
    
    /**
     * Sign in.
     *
     */
    public function actionLogin(){
        $session_name=session_name();
        $currentUser = getCurrentUser();
        if ($currentUser['user_type'] != "guest") {
            exitWithResponse(304);
        }
        issetPostParam(array('user', 'password'));
        
        $user =  $this->_model->escape_string($_REQUEST['user']);
        $password = $this->_model->escape_string($_REQUEST['password']);
        if(($user==ZFramework::app()->admin) && verifyPassword($password, ZFramework::app()->password)){//Admin user
            $adminEmail = getConfigVar('admin_email');
            $_SESSION['admin']=$_REQUEST['user'];
            $_SESSION['token'] = getToken();
            $_SESSION['email'] = $adminEmail;
            setrawcookie('CSRF-TOKEN', $_SESSION['token']);
            $json_array=array('uid'=> -1, 'user_type'=>'admin','username'=>$_SESSION['admin'], 'email'=>$adminEmail);
            exitWithResponse(200, $json_array);
        } else {//common user
            $user_result =  $this->_model->queryAll(sprintf(parse_tbprefix("SELECT * FROM <sysuser> WHERE username='%s'"),$user));
            $user_result = @$user_result[0];
            if($user_result) {
                if(verifyPassword($password, $user_result['password'])) {
                    $_SESSION['user']=$_REQUEST['user'];
                    $_SESSION['uid']=$user_result['uid'];
                    $_SESSION['token'] = getToken();
                    $_SESSION['email'] = $user_result['email'];
                    setrawcookie('CSRF-TOKEN', $_SESSION['token']);
                    $json_array=array('uid'=>$user_result['uid'], 'user_type'=>'regular', 'username'=>$user_result['username'], 'email'=>$user_result['email']);
                    exitWithResponse(200, $json_array);
                } else {
                    exitWithResponse(401, t('LOGIN_ERROR'));
                }
            } else {
                exitWithResponse(404, t('LOGIN_ERROR'));
            }
        }
    }
    
    /**
     * Sign out.
     *
     */
    public function actionLogout(){
        is_post();
        $currentUser = getCurrentUser();
        if ($currentUser['user_type'] == "guest") {
            exitWithResponse(304);
        }
        if (isTokenValid() == false) {
            exitWithResponse(400);
        }
        // Unset all of the session variables.
        $_SESSION = array();
        
        // If it's desired to kill the session, also delete the session cookie.
        // Note: This will destroy the session, and not just the session data!
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        
        setrawcookie('CSRF-TOKEN', '', time() - 42000);
        
        // Finally, destroy the session.
        session_destroy();
        exitWithResponse(200);
    }
    
    /**
     * Get current user identity.
     */
    public function actionGetUserInfo() {
        exitWithResponse(200, getCurrentUser());
    }
}
