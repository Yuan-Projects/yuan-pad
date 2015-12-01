var React = require('react');
    
var CloseSearchButton = React.createClass({
  handleCloseSearch: function(e) {
    e.preventDefault();
    this.props.onCloseSearch();
  },
  render: function() {
    return (
      <a href="javascript:void(0)" onClick={this.handleCloseSearch}>Close</a>
    );
  }
});

var PaginationItem = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    var pageNumber = e.target.getAttribute("data-pagenumber");
    console.log("You chosed the page number: ", pageNumber);
    if (parseInt(pageNumber) == this.props.currentPage) {
      console.log('The same page , we do nothing...');
      return false;
    }
    this.props.onPageChanged(pageNumber);
    return false;
  },
  render: function() {
    return (
      <a 
        className={(() => { if (this.props.currentPage === this.props.pageNumber) { return "pagination-item currentPage" } else { return "pagination-item"}})()} 
        href="javascript:void(0);" 
        data-pagenumber={this.props.pageNumber}
        onClick = {this.handleClick}
        >{this.props.text}</a>
    );
  }
});

var Pagination = React.createClass({
  handlePageChange: function(pageNumber) {
    this.props.onPageChanged(pageNumber);
  },
  render: function() {
    //console.log("The pagination feature was enabled, the total pages: ", this.props.total);
    var items = [];
    for (var i = 0; i < this.props.total; i++) {
      items.push(<PaginationItem onPageChanged={this.handlePageChange} currentPage={this.props.currentPage} pageNumber={i} text={i+1} key={i} />);
    }
    return (
      <div className="pagination">
        {items}
      </div>
    );
  }
});

var CommentStatistics = React.createClass({
  rawMarkup: function() {
    var pagenavText, text;
    if (this.props.commentsDataType === 1) {
      pagenavText = this.props.lang.PAGE_NAV;
      text = pagenavText ? pagenavText.replace('{num_of_post}', this.props.total).replace('{num_of_page}', this.props.pagenum) : '';
    } else if (this.props.commentsDataType === 2) {
      if ( this.props.total ) {
        pagenavText = this.props.lang.SEARCH_FOUND;
        text = pagenavText ? pagenavText.replace('{result_num}', this.props.total) : '';
      } else {
        text = this.props.lang.SEARCH_NOTFOUND;
      }
    }
    return { __html: text };
  },
  handleCloseSearch: function() {
    this.props.onCloseSearch();
  },
  handlePageChange: function(pageNumber) {
    this.props.onPageChanged(pageNumber);
  },
  render: function() {
    var closeSearchBtn = (this.props.commentsDataType === 2) ? <CloseSearchButton onCloseSearch={this.handleCloseSearch} /> : '';
    //console.log('closeSearchBtn:', closeSearchBtn);
    
    var pagination = (this.props.appConfig.page_on) ? <Pagination onPageChanged={this.handlePageChange} currentPage = {this.props.currentPage}  total={Math.ceil(this.props.total/this.props.appConfig.num_perpage)} /> : "";
    return (
      <div className="statistics">
        {closeSearchBtn}
        <p dangerouslySetInnerHTML={this.rawMarkup()} />
        {pagination}
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var lang = this.props.lang;
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment 
          author={comment.uname} 
          key={comment.id} 
          reply_content = {comment.reply_content}
          reply_time = {comment.reply_time}
          time={comment.time}
          lang = {lang}>
          {comment.post_content}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var Reply = React.createClass({
  rawMarkup: function() {
    // TODO: Get the actual admini user name.
    return { __html: this.props.lang.ADMIN_REPLIED.replace('{admin_name}', 'ADMIN')
                      .replace('{reply_time}', this.props.date)
                      .replace('{reply_content}', this.props.content)};
  },
  render: function() {
    return (
      <div className="reply" dangerouslySetInnerHTML={this.rawMarkup()}>
      </div>
    );
  }
});

var Comment = React.createClass({
  rawMarkup: function() {
    return { __html: this.props.children.toString() };
  },
  render: function() {
    var reply = this.props.reply_content ? <Reply lang={this.props.lang} content={this.props.reply_content} date={this.props.reply_time} /> : '';
    return (
      <div className="comment">
        <span className="commentAuthor">
          {this.props.author}
        </span> 
        <span className="commentDate">{this.props.time}</span>
        <div className="commentText" dangerouslySetInnerHTML={this.rawMarkup()} />
        {reply}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.user.value.trim();
    var text = this.refs.content.value.trim();
    if (!author || !text) return;
    
    this.props.onCommentSubmit({ user: author, content: text}); 
    
    this.refs.user.value = ''; 
    this.refs.content.value = ''; 
    return false;
  },
  render: function() {
    var userInputType = "text";
    var userInputValue = "anonymous";
    var labelContent = "";
    
    var currentUser = this.props.user;
    console.log('currentUser:', currentUser);
    if (currentUser) {
      userInputType = "hidden";
      if (currentUser.admin) {
        userInputValue = currentUser.admin;
        labelContent = currentUser.admin;
      } else if (currentUser.user) {
        userInputValue = currentUser.user;
        labelContent = currentUser.user;
      }
    }
    
    return (
      <form onSubmit={this.handleSubmit} className="commentForm">
        <table>
          <tbody>
            <tr>
              <td>{this.props.lang.NICKNAME}</td>
              <td>
                <input ref="user" type={userInputType} maxLength="10" defaultValue={userInputValue} />
                <label htmlFor="user">{labelContent}</label>
              </td>
            </tr>
            <tr>
              <td>{this.props.lang.CONTENT}</td>
              <td><textarea ref="content" placeholder="Say something..."></textarea></td>
            </tr>
            <tr>
              <td colSpan="2">
                <input name="submit" type="submit" value={this.props.lang.SUBMIT} />
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    );
  }
});
    
var CommentBox = React.createClass({
  handleCommentSubmit: function(comment) {
    this.props.onCommentSubmit(comment);
  },
  handleCloseSearch: function() {
    this.props.onCloseSearch();
  },
  handlePageChange: function(pageNumber) {
    this.props.onPageChanged(pageNumber);
  },
  render: function() {
    var commentForm = this.props.commentsDataType === 1 ? <CommentForm user={this.props.user} lang={this.props.lang} onCommentSubmit={this.handleCommentSubmit}/> : '';
    return (
      <div className="commentBox">
        <h1>{this.props.lang.WELCOME_POST}</h1>
        <CommentStatistics 
          onCloseSearch={this.handleCloseSearch}
          onPageChanged={this.handlePageChange}
          commentsDataType={this.props.commentsDataType} 
          lang={this.props.lang} 
          appConfig={this.props.appConfig}
          current_page={this.props.comments.current_page} 
          total={this.props.comments.total} 
          currentPage = {this.props.currentPage}
          pagenum={this.props.comments.pagenum} /> 
        <CommentList 
          commentsDataType={this.props.commentsDataType} 
          lang={this.props.lang}
          appConfig={this.props.appConfig}
          data={this.props.comments.comments} />
        {commentForm}
      </div>
    );
  }
});
module.exports = CommentBox;