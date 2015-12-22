var React = require('react');
var Modal = require('react-modal');
var dataProvider = require('./dataProvider.js');

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

var UpdateCommentModal = React.createClass({
  getInitialState() {
    return {
      mid: '',
      update_content: '',
    };
  },
  componentWillReceiveProps(nextProps) {
    var commentData = nextProps.comment;
    if (commentData) {
      this.setState({
        mid: commentData.id,
        update_content: commentData.post_content
      });
    }
  },
  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.mid || !this.state.update_content.trim()) return;
    dataProvider.updateComment(this.state, res => {
      if (res.statusCode === 200) {
        this.props.onCommentUpdated();
      }
    }, function(e){
      debugger;
    }.bind(this));
    return false;
  },
  changeContent(e) {
    this.setState({update_content: e.target.value});
  },
  render(){
    return (
      <Modal isOpen={this.props.commentModalIsOpen} onRequestClose={this.props.onRequestClose} style={customStyles} >
        <div>{this.props.commentErrorMsg}</div>
        <form onSubmit={this.handleSubmit} action="#" method="post">
          <textarea value={this.state.update_content} onChange={this.changeContent}></textarea>
          <input type="submit" />
        </form>
      </Modal>
    );
  }
});

module.exports = UpdateCommentModal;