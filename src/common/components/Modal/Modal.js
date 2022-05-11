import React from 'react';
import PropTypes from 'prop-types';
import style from './Modal.module.scss';
import { FormattedMessage } from 'react-intl';


export default class Modal extends React.PureComponent {

    static propTypes = {
        type:PropTypes.oneOf(['alert', 'popup']),
        buttons:PropTypes.object,
        content:PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.node
        ]),
	    clickaway:PropTypes.bool
    };

    static defaultProps = {
        type:'popup',
    	clickaway:false,
        buttons:{
            "确认":true
        }
    };

    handleClose () {
        this.props.onClose(this.props.id);
    }

    clickAnywhere=(event)=>{
        if (event.target === this.refs.element) {
            this.handleClose();
        }
    };

    render() {

        const {buttons, content,clickaway,type} = this.props;
 	    const clickAnywhere = clickaway ? this.clickAnywhere : undefined;

        return (
          <div className={style.popupBox}>
              <div ref="element" onClick={clickAnywhere} className={style.maskLayer}></div>
              <div className={style.commonBox}>
                  {
                      type === 'alert' &&
                      <div className={style.alertBox}>
                          <div className={style.alertTitle}>{content}</div>
                          <div className={style.alertContent+' '+style.fatherBox}>
                              { Object.keys(buttons).map((btn,i) => {
                                  const onClick = buttons[btn];
                                  const handle = ()=>{
                                      if (onClick === true) {
                                          this.handleClose()
                                      }else {
                                          if (onClick()) {
                                              this.handleClose()
                                          }
                                      }
                                  };
                                  return (
                                      <div key={i} onClick={handle} className={i===1? style.highlighted : style.childBox} >
                                          <FormattedMessage id={btn}/>
                                      </div>
                                  )

                              })}
                          </div>
                      </div>
                  }
                  {
                      type === 'popup' &&
                      content
                  }
              </div>
          </div>
        );

    }

}