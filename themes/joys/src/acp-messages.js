let React = require('react');
let dataProvider = require('./dataProvider.js');
let ReplyModal = require('./acp-replyModal.js');
let CommentUpdateModal = require('./acp-updateCommentModal.js');
let FormItemMixin = require('./formItemMixin.js');

class Reply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      b_username: null,
      id: 0,
      ip: "::1",
      post_content: "",
      reply_content: "",
      reply_time: "",
      time: "",
      uid: null,
      uname: "",
      user: ""
    };
  }
  static getDerivedStateFromProps(props, state) {
    let data = props.data;
    if (data) {
      return {
        b_username: data.b_username,
        id: data.id,
        ip: data.ip,
        post_content: data.post_content,
        reply_content: data.reply_content,
        reply_time: data.reply_time,
        time: data.time,
        uid: data.uid,
        uname: data.uname,
        user: data.user
      };
    }
    return null;
  }
  deleteReply = (e) => {
    e.preventDefault();
    if (!confirm(this.props.lang.DEL_REPLY_CONFIRM)) {
      return false;
    }
    dataProvider.deleteReply(this.state.id, response => {
      this.setState({reply_content: ''});
    });
  }
  render() {
    let lang = this.props.lang,
        data = this.state;
    if (!data || !data.reply_content) {
      return null;
    }
    return (
      <div>
        {lang.YOU_REPLIED && lang.YOU_REPLIED.replace('{reply_time}', data.reply_time).replace('{reply_content}', data.reply_content)}
        <span>&nbsp;<a onClick={this.deleteReply} href="#">{lang.DELETE_THIS_REPLY}</a></span>
      </div>
    );
  }
}

class Comment extends React.Component {
  banIP = (e) => {
    let dom = e.target;
    e.preventDefault();
    let ip = this.props.data.ip;
    dataProvider.banIP(ip, () => {
      this.props.onActiveTabChanged('ban_ip');
    });
  }
  deleteComment = (e) => {
    e.preventDefault();
    let data = this.props.data;
    let commentId = data.id;
    let reply = data.reply ? "1" : "0";
    if (!confirm(this.props.lang.DEL_COMMENT_CONFIRM)) {
      return false;
    }
    // TODO
    dataProvider.deleteComment(commentId, reply, response => {
      this.props.onCommentDeleted();
    });
  }
  replyComment = (e) => {
    e.preventDefault();
    this.props.onReplyComment(this.props.data);
  }
  updateComment = (e) => {
    e.preventDefault();
    this.props.onUpdateComment(this.props.data);
  }
  toggleItem = () => {
    this.props.onToggleItem(this.props.data);
  }
  render() {
    let data = this.props.data;
    let lang = this.props.lang;
    return (
      <tr className="row">
        <td className="col-xs-1 col-sm-1 col-md-1">
          <input type='checkbox' checked={this.props.data.checked} onChange={this.toggleItem} />
          <input type='hidden' name={this.props.data.id} value={data.reply ? 1 : 0} />
        </td>
        <td className="col-xs-3 col-sm-3 col-md-3">
          {parseInt(data.uid) ? data.b_username : data.uname}
        </td>
        <td className='col-xs-6 col-sm-6 col-md-6'>
          {data.post_content}<br />{lang.TIME}：{data.time}
          <Reply lang={lang} data={data} />
        </td>
        <td className="col-xs-2 col-sm-2 col-md-2">
          <button className="btn btn-danger btn-sm" onClick={this.deleteComment}>
            <span className="glyphicon glyphicon-remove-circle" aria-hidden="true"></span>
          </button>
          <button className="btn btn-default btn-sm" onClick={this.replyComment}>
            <img src="./themes/spa/images/reply.png" width="12" height="12" />
          </button>
          <button className="btn btn-default btn-sm" onClick={this.updateComment}>
            <span className="glyphicon glyphicon-pencil" aria-hidden="true"></span>
          </button>
          <button className="btn btn-default btn-sm" onClick={this.banIP} data-ip={data.ip}>
            <span className="glyphicon glyphicon-ban-circle" aria-hidden="true"></span>
          </button>
        </td>
      </tr>
    );
  }
}

const ACPMessages = FormItemMixin(class ACPMessages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      modalIsOpen: false,
      modalType: '', // "reply" or "update" 
      modalCommentModel: null,
      modalErrorMsg: ''
    };
  }
  getMixinAttr() {
    return 'comments';
  }
  getItemKey() {
    return 'id';
  }
  setMixState(data) {
    this.setState({comments: data});
  }
  deleteAllComments = (e) => {
    e.preventDefault();
    if (!confirm(this.props.lang.DEL_ALL_CONFIRM)) {
      return false;
    }
    dataProvider.deleteAllComments(res => {
      if (res.statusCode === 200) {
        this.setState({comments: []});
      } else {
        alert('Error');
      }
    });
  }
  /**
   * Tested 1
   */
  deleteAllReplies = (e) => {
    e.preventDefault();
    if (!confirm(this.props.lang.DEL_ALL_REPLY_CONFIRM)) {
      return false;
    }
    dataProvider.deleteAllReplies(res => {
      if (res.statusCode === 200) {
        this.loadCommentsFromServer();
      } else {
        alert('ERROR')
      }
    });
  }
  deleteSelected = (e) => {
    e.preventDefault();
    let checkedItems = this.getCheckedItems();
    if (checkedItems.length === 0) {
      return false;
    }
    if (!confirm(this.props.lang.DEL_SELECTEDCOMMENTS_CONFIRM)) {
      return false;
    }
    dataProvider.deleteMutiComments(checkedItems, res => {
      if (res.statusCode === 200) {
        this.loadCommentsFromServer();
      } else {
        alert('delete error');
      }
    });
  }
  handleReplyComment = (commentTobeReplied) => {
    this.openModal('reply', commentTobeReplied);
  }
  closeModal = () => {
    this.setState({
      modalIsOpen: false,
      modalType: '', 
      modalCommentModel: null,
      modalErrorMsg: ''
    });
  }
  openModal(type = 'reply', commentData) {
    this.setState({
      modalIsOpen: true,
      modalType: type, 
      modalCommentModel: commentData,
      modalErrorMsg: ''
    });
  }
  handleReplyFormSubmitted() {
    this.closeModal();
    this.loadCommentsFromServer();
  }
  handleUpdateComment = (commentTobeUpdated) => {
    this.openModal('update', commentTobeUpdated);
  }
  handleCommentUpdated() {
    this.closeModal();
    this.loadCommentsFromServer();
  }
  loadCommentsFromServer() {
    dataProvider.loadAllCommentsFromServer(res => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        let data = res.response.comments;
        this.addSelectedFlag(data)
        this.setState({comments: data});
      } else {
        // TODO .
        alert('error');
      }
    });
  }
  componentDidMount() {
    this.loadCommentsFromServer();
  }
  handleToggleItem = (item) => {
    this.toggle(item);
  }
  handleCommentDeleted() {
    this.loadCommentsFromServer();
    this.props.onCommentDeleted();
  }
  render() {
    let state = this.state,
        props = this.props,
        lang = props.lang;
    
    let modalProps = {
      comment: state.modalCommentModel,
      modalErrorMsg: state.modalErrorMsg,
      onRequestClose: this.closeModal
    };
    return (
      <div className={props.activeTab === "message" ? "message_container selectTag" : "message_container"}>
        <form onSubmit={this.deleteSelected} action="#" method="post">
          <table className="table table-striped table-hover">
            <thead>
              <tr className="header row">
                <th className="col-xs-1 col-sm-1 col-md-1"><input type="checkbox" onClick={this.toggleInputClicked} /></th>
                <th className="col-xs-3 col-sm-3 col-md-3">{lang.NICKNAME}</th>
                <th className="col-xs-6 col-sm-6 col-md-6">{lang.MESSAGE}</th>
                <th className="col-xs-2 col-sm-2 col-md-2">{lang.OPERATION}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let comments = state.comments, commentArr = [];
                let createComment = function(comment) {
                  commentArr.push(
                    <Comment
                      lang={lang}
                      data={comment}
                      key={comment.id}
                      onActiveTabChanged={props.onActiveTabChanged}
                      onReplyComment={this.handleReplyComment}
                      onCommentDeleted={this.handleCommentDeleted}
                      onUpdateComment={this.handleUpdateComment}
                      onToggleItem={this.handleToggleItem}
                    />
                  );
                };
                comments && comments.map(createComment, this);
                return commentArr;
              })()}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan='4'>
                  <input type='submit' value={lang.DELETE_CHECKED} />
                  <button onClick={this.deleteAllComments}>{lang.DELETE_ALL}</button>
                  <button onClick={this.deleteAllReplies}>{lang.DELETE_ALL_REPLY}</button>
                </td>
              </tr>
            </tfoot>
          </table>
        </form>
        <ReplyModal
          {...modalProps}
          ref="replyModal"
          modalIsOpen = {state.modalIsOpen && state.modalType === "reply"}
          onReplySubmit={this.handleReplyFormSubmitted}
        />
        <CommentUpdateModal
          {...modalProps}
          ref="updateModal"
          modalIsOpen = {state.modalIsOpen && state.modalType === "update"}
          onCommentUpdated={this.handleCommentUpdated}
        />
      </div>
    );
  }
});

module.exports = ACPMessages;