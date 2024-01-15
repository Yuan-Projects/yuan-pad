import { useContext, useState, MouseEvent, FormEvent } from 'react';
import Modal from 'react-modal';
import dataProvider from '../common/dataProvider';
import LanguageContext from '../common/languageContext';

import ModalStyles from './ModalStyles';

function SignIn(props: any) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const language: any = useContext(LanguageContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  function openModal(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setModalIsOpen(true);
  }
  const closeModal = () => setModalIsOpen(false);
  function handleSignIn(loginData: any) {
    dataProvider.signIn(loginData).then((res) => {
      if (res.data.statusCode === 200) {
        setErrorMsg('');
        setModalIsOpen(false);
        props.onCurrentUserUpdated(res.data.response);
      } else if (res.data.statusCode === 304) {
        // The user had signed in before.
      } else {
        //this.setState({errorMsg: res.response});
        setErrorMsg(res.data.response);
      }
    });
  }
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const user = username,
      pwd = password;
    if (!user || !pwd) return;
    handleSignIn({ user, password: pwd });
    return false;
  }
  return (
    <div className="signIn">
      <a href="#" onClick={openModal} role="button" className="btn btn-default">
        {language.LOGIN}
      </a>
      <Modal ariaHideApp={false} isOpen={modalIsOpen} onRequestClose={closeModal} style={ModalStyles}>
        <p>{errorMsg}</p>
        <button onClick={closeModal}>close</button>
        <form onSubmit={handleSubmit} action="#" method="post">
          <div className="form-group">
            <label htmlFor="inputUsername">{language.USERNAME}</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              className="form-control"
              id="inputUsername"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="inputPassword">{language.ADMIN_PWD}</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="form-control"
              id="inputPassword"
              placeholder=""
            />
          </div>
          <button type="submit" className="btn btn-default">
            {language.SUBMIT}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default SignIn;
