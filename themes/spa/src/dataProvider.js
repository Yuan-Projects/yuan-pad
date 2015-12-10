// TODO => POST
function banIP(ip, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: 'api.php?controller=badip&action=create',
    data: {ip: ip},
    dataType: 'json',
    success: successCallback,
    error: errorCallback
  });
}

function login(credentials, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=user&action=login",
    data: credentials,
    dataType: 'json',
    success: successCallback,
    error: errorCallback
  });
}

function loadUserDataFromServer(uid, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'api.php?controller=user&action=update&uid=' + uid,
    dataType: 'json',
    cache: false,
    success: successCallback,
    error: errorCallback
  });
}

function getUserInfo(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'index.php?controller=user&action=getUserInfo',
    dataType: 'json',
    cache: false,
    success: successCallback,
    error: errorCallback
  });
}

function getAppConfig(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'index.php',
    data: {action: "getAppConfig",t:Date.now()},
    cache: false,
    dataType: "json",
    success: successCallback,
    error:  errorCallback
  });
}

function logout(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'api.php',
    data: {controller: 'user', action: "logout"},
    cache: false,
    success: successCallback,
    error: errorCallback
  });
}

function updateUser(userData, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=user&action=update&uid=" + userData.uid,
    data: userData,
    dataType: 'json',
    success: successCallback,
    error: errorCallback
  });
}

function signUp(userData, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=user&action=create",
    data: userData,
    dataType: 'json',
    success: successCallback,
    error: errorCallback
  });
}

function loadCommentsFromServer(pageId, successCallback, errorCallback) {
  yuanjs.ajax({
    url: 'index.php',
    dataType: 'json',
    method: 'GET',
    cache: false,
    data: {"ajax": true, pid: pageId},
    success: successCallback,
    error: errorCallback
  });
}

function search(keyword, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=search",
    data: {s:keyword},
    dataType: 'json',
    success: successCallback,
    error: errorCallback,
  });
}

function createPost(comment, successCallback, errorCallback) {
  comment.ajax = true;
    yuanjs.ajax({
      type: "POST",
      url: "./index.php?controller=post&action=create",
      data: comment,
      success: successCallback,
      error: errorCallback
    });
}

function getACPData(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'api.php',
    data: {action: "control_panel",t:Date.now()},
    cache: false,
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

function updateSiteConfig(configObj, successCallback, errorCallback) {
  yuanjs.ajax({
      type: "POST",
      url: "api.php?controller=config&action=update",
      data: configObj,
      dataType: "json",
      success: successCallback,
      error: errorCallback
    });
}

function getAllUsers(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'api.php',
    data: {controller: "user", action: "index",t:Date.now()},
    cache: false,
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

function deleteAllReplies(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "GET",
    url: 'api.php',
    data: {controller: "reply", action: "reply"},
    //dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

function deleteAllComments(successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: 'api.php',
    data: {controller: "post", action: "deleteAll"},
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

function deleteComment(commentId, reply, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: 'api.php?controller=post&action=delete',
    data: {mid: commentId, reply: reply},
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

function deleteMutiComments(dataObj, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=post&action=delete_multi_messages",
    data: dataObj,
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

// TODO
function deleteReply(commentId, successCallback, errorCallback) {
  yuanjs.ajax({
    type: "POST",
    url: "api.php?controller=reply&action=delete",
    data: {mid: commentId},
    dataType: "json",
    success: successCallback,
    error: errorCallback
  });
}

module.exports = {
  banIP: banIP,
  createPost: createPost,
  deleteAllComments: deleteAllComments,
  deleteAllReplies: deleteAllReplies,
  deleteComment: deleteComment,
  deleteMutiComments: deleteMutiComments,
  deleteReply: deleteReply,
  getACPData: getACPData,
  getAllUsers: getAllUsers,
  login: login,
  logout: logout,
  signUp: signUp,
  updateUser: updateUser,
  loadCommentsFromServer: loadCommentsFromServer,
  loadUserDataFromServer: loadUserDataFromServer,
  getUserInfo: getUserInfo,
  getAppConfig: getAppConfig,
  search: search,
  updateSiteConfig: updateSiteConfig
};