let React = require('react');
let Modal = require('react-modal');
let dataProvider = require('./dataProvider.js');

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

class ReplyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rid: '',
      pid: '',
      content: '',
      r_time: ''
    };
  }
  static getDerivedStateFromProps(props, state) {
    let commentData = props.comment;
    if (commentData) {
      return {
        rid: commentData.reply_id,
        pid: commentData.id,
        content: commentData.reply_content
      };
    }
    return null;
  }
  handleSubmit = (e) => {
    e.preventDefault();
    if (!this.state.pid || !this.state.content.trim()) return;
    let action = this.state.rid ? 'updateReply' : 'createReply';
    dataProvider[action](this.state, res => {
      if (res.statusCode === 200) {
        this.props.onReplySubmit();
      }
    });
    return false;
  }
  changeContent = (e) => {
    this.setState({content: e.target.value});
  }
  render(){
    return (
      <Modal isOpen={this.props.modalIsOpen} onRequestClose={this.props.onRequestClose} style={customStyles} >
        <div>{this.props.modalErrorMsg}</div>
        <form onSubmit={this.handleSubmit} action="#" method="post">
          <textarea value={this.state.content} onChange={this.changeContent}></textarea>
          <input type="submit" />
        </form>
      </Modal>
    );
  }
}

module.exports = ReplyModal;