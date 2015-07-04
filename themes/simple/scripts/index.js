$(function() {
  if(self.location!=parent.location){parent.location.replace(self.location);}
  getSysJSON(function(data){
    languageTips=data;
  }, function(xhr, status, error){
    alert(error);
  });
  $('#smileys img').click(function(){
    var imgId = String($(this).attr('id'));
    $('#content').val($('#content').val()+imgId);
  });
  $('#captcha_img').mouseover(function(){$(this).addClass('pointer');});
  $('#captcha_img').click(function(){$(this).attr('src',$(this).attr('src')+'&id='+Math.random());});
  $('<input type="hidden" name="ajax" value="true" />').insertAfter('#pid');
  $(document).keypress(function(e){if(e.ctrlKey && e.which == 13 || e.which == 10) {$("#guestbook").submit();} else if (e.shiftKey && e.which==13 || e.which == 10) {$("#guestbook").submit();}});
  $('#smileys').css('display','block');
  $('#toggleForm').css('display','inline');
  $("#add_table").hide();
  $("#search").click(function(){$(this).val('')});
  $('#post_shortcut').show();
  $("#toggleForm").hover(function(){$(this).addClass("pointer");});
  $("#toggleForm").click( function() {$("#add_table").animate({height: 'show', opacity: 'show'}, 'slow');$('#toggleForm').fadeOut('slow');});
  var post = {
    message:null,
    init:function(){
      $('form#guestbook').submit(function(e){
        e.preventDefault();
        if(post.validate()){
          ajaxNewPost();
        }else{
          post.emptyError();
          post.showError();
        }
      });
    },
    showError:function(){
      $('#returnedError').removeClass('info').fadeIn("slow").addClass('error').html(post.message);
    },
    emptyError:function(){
      $('#returnedError').removeClass('info').removeClass('error').removeClass('success').html('');
    },
    showSuccess:function(){
      $('#returnedError').removeClass('info').addClass('success').html(languageTips.POST_OK).fadeIn("slow").fadeOut("slow");
    },
    showInfo:function(){
      $('#returnedError').addClass('info').html(languageTips.SENDING);
    },
    validate:function(){
      post.message='';
      var user = $.trim($('#user').val());
      var content = $.trim($('#content').val());
      if(!user){
          post.message+=languageTips.USERNAME_NOT_EMPTY+"<br />";
      }else{
          if (user.length < 2) {
              post.message+=languageTips.USERNAME_TOO_SHORT+"<br />";
          }
      }
      if(!content.length){
          post.message+=languageTips.MESSAGE_NOT_EMPTY+'<br />';
      }
      if(document.getElementById('valid_code') && !$.trim($('#valid_code').val())){
          post.message+=languageTips.CAPTCHA_NOT_EMPTY+"<br />";
      }
      if (post.message.length > 0) {
          return false;
      } else {
          return true;
      }
    }
  };
  post.init();

  function refreshPostList() {
    getDataByPage($('#pid').val(), function(data) {
      var tbodyString = [];
      $.each(data.messages,function(i,item){
        var trString="<tr>\n<td>"+ ((item.uid>0)?item.b_username:item.user) +"</td>\n<td><div style='word-wrap: break-word;word-break:break-all;width:450px;'>"+item.post_content+"<br />";
        if(item.reply){
          var _A = [languageTips.ADMIN_NAME_INDEX,item.reply.reply_time,item.reply.reply_content];
          var _B = ['{admin_name}','{reply_time}','{reply_content}'];
          var _C = languageTips.ADMIN_REPLIED;
          for(i=0;i<_A.length;i++){
            var _C=_C.replace(_B[i],_A[i]);
          }
          trString += _C;
        }
        trString+="</div></td>\n<td>"+item.time+"</td>\n</tr>\n";
        tbodyString.unshift(trString);
      });
      $("#main_table tbody").html(tbodyString.join(''));
      if(document.getElementById('pagination')){
        $('span#totalNum').html(data.total);
        $('span#totalPages').html(data.pagenum);
        var pagenumString='';
        for (i=0;i<data.pagenum;i++){
          pagenumString+= "<a href='index.php?pid="+i+"'>";
          if(i==data.current_page){
            pagenumString+= "<font size='+2'>"+ (i+1) +"</font>";
          }else{
            pagenumString+= (i+1);
          }
          pagenumString+="</a>&nbsp;";
        }
        $('span#pagenumString').html(pagenumString);
      }
      prettyPrint();
    });
  }

  function ajaxNewPost() {
    createPost($('form#guestbook'), function beforeSend(xhr){
      post.showInfo();
      $('input#submit').attr('disabled','disabled');
    }, function success(data){
      $('#captcha_img').attr('src',$('#captcha_img').attr('src')+'&id='+Math.random());
      if(data == "OK"){
        document.getElementById('guestbook').reset();
        post.showSuccess();
        refreshPostList();
      }else{
        post.message=data;
        post.showError();
      }
    }, function error(xhr) {
      alert(xhr.statusText);
    },
    function complete(){
      $('input#submit').attr('disabled','');
    });
  }

  //prettyPrint();
});
