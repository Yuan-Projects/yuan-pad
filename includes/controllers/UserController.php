<?php
class UserController extends BaseController{
  public $_model;
  
  public function  __construct(){
    global $db_url;
    $this->_model=  YDB::factory($db_url);
  }
  
  public function actionIndex(){
    is_admin();
    $current_tab='user';
    $tabs_array=array('overview','siteset','message','ban_ip','user');
    $tabs_name_array=array(t('ACP_OVERVIEW'),t('ACP_CONFSET'),t('ACP_MANAGE_POST'),t('ACP_MANAGE_IP'),  t('USER_ADMIN'));
    $user_data=$this->_model->queryAll(parse_tbprefix("SELECT * FROM <sysuser>"));
    if(defined('API_MODE')){
      header("Content-type: application/json");
      die (function_exists('json_encode') ? json_encode($user_data) : CJSON::encode($user_data));
    }
    $this->render('user_list',array('users'=>$user_data,'tabs_array'=>$tabs_array,'current_tab'=>$current_tab,'tabs_name_array'=>$tabs_name_array,));
  }
  
  public function actionCreate(){
    if(isset ($_SESSION['admin']) || isset ($_SESSION['user'])){
      header("Location:index.php");exit;
    }
    if(isset ($_POST['register'])){
      if(!empty ($_POST['user']) && !empty ($_POST['pwd']) && !empty ($_POST['email'])){
        if(strlen(trim($_POST['user']))>=2){
          $user =  $this->_model->escape_string($_POST['user']);
          $pwd =  $this->_model->escape_string($_POST['pwd']);
          $email = $_POST['email'];
          $time = time();
          if(is_email($email)){
            $user_exists=$this->_model->queryAll(sprintf(parse_tbprefix("SELECT * FROM <sysuser> WHERE username='%s'"),$user));
            if(!$user_exists && $user!= ZFramework::app()->admin){
              if($this->_model->query(sprintf(parse_tbprefix("INSERT INTO <sysuser> ( username , password , email , reg_time ) VALUES ( '%s' , '%s' , '%s' , %d )"),$user,$pwd,$email,$time))){
                $_SESSION['user']=$user;
                $_SESSION['uid']=  $this->_model->insert_id();
                if(defined('API_MODE')){
                  die(json_encode(array('user'=> $user, 'uid'=>$_SESSION['uid'])));
                }
                if(isset ($_POST['ajax'])){
                  die ('OK');
                }
                header("Location:index.php");exit;
              } else {
                die($this->_model->error());
              }
            } else {
              $errorMsg=t('USERNAME_NOT_AVAILABLE');
            }
          } else {
            $errorMsg=t('EMAIL_INVALID');
          }
        } else {
          $errorMsg=t('USERNAME_TOO_SHORT');
        }
      } else {
        $errorMsg=t('FILL_NOT_COMPLETE');
      }
      if(defined('API_MODE')){
        die(json_encode(array('error'=> 'Register Error', 'error_detail'=> $errorMsg)));
      }
      if(isset ($_POST['ajax'])){
        die ($errorMsg);
      }
    }
    include 'themes/'.ZFramework::app()->theme.'/templates/'."register.php";
  }

  public function actionUpdate(){
    global $API_CODE;
    if(defined('API_MODE')){
      if(!isset ($_SESSION['admin']) && !isset ($_SESSION['uid'])) {
        $error_array=array('error_code'=>'401','error'=>$API_CODE['401'],'error_detail'=>t('LOGIN_REQUIRED'));
      } elseif(!isset ($_GET['uid'])) {
        $error_array=array('error_code'=>'400','error'=>$API_CODE['400'],'error_detail'=>t('PARAM_ERROR'));
      } elseif ((!isset($_SESSION['admin']) && $_GET['uid']!=$_SESSION['uid'])) {
        $error_array=array('error_code'=>'400','error'=>$API_CODE['400'],'error_detail'=>t('PARAM_ERROR'));
      }
      if(isset ($error_array)) {
        die (function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
      }
    }
    if((!isset($_SESSION['admin']) && !isset($_SESSION['uid'])) || !isset($_GET['uid']) || (!isset($_SESSION['admin']) && $_GET['uid']!=$_SESSION['uid'])){
      header("Location:index.php");exit;
    }
    $uid=$_GET['uid'];
    if(isset ($_POST['user'])) {
      if(!empty ($_POST['user']) && !empty ($_POST['pwd']) && !empty ($_POST['email'])){
        $user=  $this->_model->escape_string($_POST['user']);
        $pwd=  $this->_model->escape_string($_POST['pwd']);
        $email=$_POST['email'];
        if(is_email($email)){
          if($this->_model->query(sprintf(parse_tbprefix("UPDATE <sysuser> SET password = '%s' , email = '%s' WHERE uid = %d"),$pwd,$email,$uid))){
            if(defined('API_MODE')) {
              $json_array=array('status'=>'OK');
              die (function_exists('json_encode') ? json_encode($json_array) : CJSON::encode($json_array));
            }
            header("Location:index.php");exit;
          } else {
            $errorMsg=t('USERUPDATEFAILED');
            if(defined('API_MODE')){
              $error_array=array('error_code'=>'500','error'=>$API_CODE['500'],'error_detail'=>$errorMsg);
              die(function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
            }
          }
        } else {
          $errorMsg=t('EMAIL_INVALID');
        }
      } else {
        $errorMsg=t('FILL_NOT_COMPLETE');
      }
      if(defined('API_MODE') && isset ($errorMsg)){
        $error_array=array('error_code'=>'400','error'=>$API_CODE['400'],'error_detail'=>$errorMsg);
        die(function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
      }
    }
    $user_data=  $this->_model->queryAll(sprintf(parse_tbprefix("SELECT * FROM <sysuser> WHERE uid=%d"),$uid));
    $user_data=$user_data[0];
    if(defined('API_MODE')){
      if($user_data){
        die (function_exists('json_encode') ? json_encode($user_data) : CJSON::encode($user_data));
      } else {
        $error_array=array('error_code'=>'404','error'=>$API_CODE['404'],'error_detail'=>t('USER_NOT_EXISTS'));
        die(function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
      }
    }
    include 'themes/'.ZFramework::app()->theme.'/templates/'."user_update.php";
  }
    
  public function actionDelete(){
    is_admin();
    $uid=isset ($_POST['uid'])?(int)$_POST['uid']:null;
    if(!$uid){
      header("Location:index.php?controller=user");exit;
    }
    $this->_model->query(parse_tbprefix("DELETE FROM <sysuser> WHERE uid=$uid"));
    $this->_model->query(parse_tbprefix("UPDATE <post> SET uid=0 WHERE uid=$uid"));
    if (defined('API_MODE')) {
      header("Content-type: application/json");
      $result=array('status'=>'OK');
      die(function_exists('json_encode') ? json_encode($result) : CJSON::encode($result));
    }
    header("Location:index.php?controller=user&randomvalue=".rand());
  }
    
  public  function actionDeleteAll(){
    is_admin();
    $this->_model->query(parse_tbprefix("DELETE FROM <sysuser>"));
    $this->_model->query(parse_tbprefix("UPDATE <post> SET uid = 0"));
    header("location:index.php?controller=user");
  }
    
  public  function actionDelete_multi(){
    is_admin();
    if(!isset($_POST['select_uid'])){header("location:index.php?controller=user");exit;}
    $del_ids=$_POST['select_uid'];
    foreach($del_ids as $deleted_id){
      $this->_model->query(parse_tbprefix("DELETE FROM <sysuser> WHERE uid=$deleted_id"));
      $this->_model->query(parse_tbprefix("UPDATE <post> SET uid=0 WHERE uid=$deleted_id"));
    }
    header("Location:index.php?controller=user&randomvalue=".rand());
  }
    
  public function actionLogin(){
    global $API_CODE;
    $session_name=session_name();
    if (isset($_SESSION['admin'])){//admin logged in
      if(defined('API_MODE')){
        header("Content-type: application/json");
        $json_array=array('admin'=>$_SESSION['admin'],'session_name'=>$session_name,'session_value'=>session_id());
        die (function_exists('json_encode') ? json_encode($json_array) : CJSON::encode($json_array));
      }
      header("Location:index.php?action=control_panel");exit;
    }
    if (isset($_SESSION['user'])){//common user logged in
      if(defined('API_MODE')){
        $json_array=array('user'=>$_SESSION['user'],'uid'=>$_SESSION['uid'],'session_name'=>$session_name,'session_value'=>session_id());
        die (function_exists('json_encode') ? json_encode($json_array) : CJSON::encode($json_array));
      }
      header("Location:index.php");exit;
    }
    if(isset($_REQUEST['user']) && isset($_REQUEST['password'])){// The login form submitted
      $user=  $this->_model->escape_string($_REQUEST['user']);
      $password=$this->_model->escape_string($_REQUEST['password']);
      if( ($user==ZFramework::app()->admin) && ($password==ZFramework::app()->password) ){//Admin user
        $_SESSION['admin']=$_REQUEST['user'];
        if(defined('API_MODE')){
          header("Content-type: application/json");
          $json_array=array('admin'=>$_SESSION['admin'],'session_name'=>$session_name,'session_value'=>session_id());
          die (function_exists('json_encode') ? json_encode($json_array) : CJSON::encode($json_array));
        }
        header("Location:index.php?action=control_panel");
        exit;
      } else {//common user
        $user_result=  $this->_model->queryAll(sprintf(parse_tbprefix("SELECT * FROM <sysuser> WHERE username='%s' AND password='%s'"),$user,$password));
        $user_result=@$user_result[0];
        if($user_result){
          $_SESSION['user']=$_REQUEST['user'];
          $_SESSION['uid']=$user_result['uid'];
          if(defined('API_MODE')){
            header("Content-type: application/json");
            $json_array=array('user'=>$_REQUEST['user'],'uid'=>$user_result['uid'],'session_name'=>$session_name,'session_value'=>session_id());
            die (function_exists('json_encode') ? json_encode($json_array) : CJSON::encode($json_array));
          }
          header("Location:index.php");exit;
        } else {
          $errormsg=t('LOGIN_ERROR');
        }
      }
    }
    if(defined('API_MODE')){
      if(isset ($errormsg)){
        $error_array=array('error_code'=>'403','error'=>$API_CODE['403'],'error_detail'=>$errormsg);
        die (function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
      } else {
        $error_array=array('error_code'=>'401','error'=>$API_CODE['401'],'error_detail'=>t('LOGIN_REQUIRED'));
        die (function_exists('json_encode') ? json_encode($error_array) : CJSON::encode($error_array));
      }
    }
    include 'themes/'.ZFramework::app()->theme.'/templates/'."login.php";
  }
    
  public function actionLogout(){
    if(isset ($_SESSION['user'])){
      unset ($_SESSION['user']);
      session_destroy();
    }
    if(isset($_SESSION['admin'])){
      if(is_flatfile ()) {
        delete_backup_files();
      }
      unset($_SESSION['admin']);
      session_destroy();
    }
    if(defined('API_MODE')){
      die('OK');
    }
    header("Location:index.php");
  }
    
  public function actionGetUserInfo() {
    header("Content-type: application/json");
    echo json_encode($_SESSION);
  }
}
