import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import Modal from 'react-modal';
import dataProvider from './dataProvider.js';

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

function ReplyModal(props) {
  const [state, setState] = useState({
    rid: '',
    pid: '',
    content: '',
    r_time: ''
  });
  useEffect(() => {
    let commentData = props.comment;
    if (commentData) {
      setState(_.extend({}, state, {
        rid: commentData.reply_id,
        pid: commentData.id,
        content: commentData.reply_content
      }));
    }
  }, [props.comment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!state.pid || !state.content.trim()) return;
    let action = state.rid ? 'updateReply' : 'createReply';
    dataProvider[action](state, res => {
      if (res.statusCode === 200) {
        props.onReplySubmit();
      }
    });
    return false;
  };
  const changeContent = (e) => {
    setState(_.extend({}, state, {content: e.target.value}));
  };
  return (
    <Modal ariaHideApp={false} isOpen={props.modalIsOpen} onRequestClose={props.onRequestClose} style={customStyles} >
      <div>{props.modalErrorMsg}</div>
      <form onSubmit={handleSubmit} action="#" method="post">
        <textarea value={state.content} onChange={changeContent}></textarea>
        <input type="submit" />
      </form>
    </Modal>
  );
}

export default ReplyModal;