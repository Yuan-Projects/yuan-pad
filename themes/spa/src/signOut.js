var React = require('react');
var dataProvider = require('./dataProvider.js');

var LogoutButton = React.createClass({
  handleSignOut: function(e) {
    e.preventDefault();
    dataProvider.logout(function(){
      this.props.onUserLogout();
    }.bind(this));
  },
  render: function() {
    return (!this.props.user.admin && !this.props.user.uid) ?
           null :
           (<a href='#' onClick={this.handleSignOut}>{this.props.lang.LOGOUT}</a>);
  }
});

module.exports = LogoutButton;