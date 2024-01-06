import { forwardRef, MouseEvent, useRef, useImperativeHandle, useContext } from 'react';
import LanguageContext from '../common/languageContext';

const Captcha = forwardRef((props: any, ref) => {
  const lang: any = useContext(LanguageContext);
  const picRef = useRef<HTMLImageElement>(null);
  const refreshCaptch = (e: MouseEvent) => {
    e.preventDefault();
    refresh();
  };
  const refresh = () => {
    const img = picRef.current as HTMLImageElement;
    const url = img.getAttribute('data-src');
    img.src = url + '&v=' + Math.random();
  };
  useImperativeHandle(ref, () => ({refresh}), []);
  return (
    <div className="form-group">
      <label htmlFor="inputCaptcha" className="col-sm-2 col-lg-2 control-label">{lang.CAPTCHA}</label>
      <div className="col-sm-5 col-lg-5">
        <input
          id="inputCaptcha"
          type="text" 
          maxLength={10}
          size={20}
          className="form-control"
          value={props.valid_code}
          onChange={props.onCaptchaChange}
        />
        <img
          className="captchaImg"
          ref={picRef}
          src="index.php?action=captcha"
          data-src="index.php?action=captcha"
          onClick={refreshCaptch}
          alt="Captcha"
          title={lang.CLICK_TO_REFRESH}
        />
      </div>
    </div>
  );
});

export default Captcha;