<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
    <title><?php echo t('WELCOME',array('{site_name}'=>ZFramework::app()->board_name));?></title>
    <link rel="stylesheet" href="./themes/spa/css/style.css">
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="./themes/spa/css/bootstrap.min.css">
    <!-- Optional theme -->
    <link rel="stylesheet" href="./themes/spa/css/bootstrap-theme.min.css">
    <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
      <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
  </head>
  <body>
    <div id="content" class="container-fluid"></div>
    <script src="./themes/spa/build/index.js"></script>
  </body>
</html>
