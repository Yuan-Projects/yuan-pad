var React = require('react');

var SearchBar = React.createClass({
  handleSearch(e) {
    e.preventDefault();
    var keyword = this.refs.s.value.trim();
    if (!keyword) return ;
    this.props.onSubmit(keyword);
    return false;
  },
  handleChange() {
    this.props.onUserInput(this.refs.s.value.trim());
  },
  render() {
    return (
      <div className="searchbar">
        <form onSubmit={this.handleSearch}>
          <input 
            type="text" 
            size="10" 
            placeholder="Search" 
            ref="s" 
            value={this.props.searchText}
            onChange={this.handleChange}
          />
          <input type="image" src="misc/images/search.gif" alt="Search" ref="searchImg" />
        </form>
      </div>
    );
  }
});

module.exports = SearchBar;