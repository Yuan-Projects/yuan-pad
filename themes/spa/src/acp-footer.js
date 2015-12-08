var React = require('react');

var ACPFooter = React.createClass({
  render: function() {
    if (!this.props.user.admin) return null;
    return (
      <footer>
        <p>
          Powered by <a href="https://github.com/rainyjune/yuan-pad">YuanPad</a>
        </p>
      </footer>
    );
  }
});

module.exports = ACPFooter;