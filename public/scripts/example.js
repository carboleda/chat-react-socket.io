// example.js
var CommentList = React.createClass({
	render: function() {
		var commentNodes = this.props.data.map(function(comment){
			return (
				<Comment author={comment.author} key={comment.id}>
					{comment.text}
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

var CommentForm = React.createClass({		
	handleAuthorChange: function(e) {
		this.setState({author: e.target.value});
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author.trim();
		var text = this.state.text.trim();
		if(!author || !text) {
			return;
		}
		//submit to the server and refresh the list using callback of parent component (CommentBox)
		this.props.onCommentSubmit({author: author, text: text});
		this.setState({text: ''});
	},
	getInitialState: function() {
		return {author: '', text: ''};
	},
	render: function() {	
		return (
			<form className="commentForm" onSubmit={this.handleSubmit}>
				<input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange}/>
				<input type="text" placeholder="Say something..." value={this.state.text} onChange={this.handleTextChange}/>
				<input type="submit" value="Post" className="btnPost"/>
			</form>
		);
	}
});

var CommentBox = React.createClass({
	loadCommentsFromServer: function() {
    	var _this = this;
    	socket.on('chat message', function(msg){
    		var data = _this.state.data;
    		data.push(msg);
    		_this.setState({data: data});
	  	});
	},
	handleCommentSubmit: function(comment) {
    	socket.emit('chat message', comment);
	},
	getInitialState: function() {
		return {data: []};
	},
  	componentDidMount: function() {
    	this.loadCommentsFromServer();
    	//setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  	},
	render: function() {
		return (
			<div className="commentBox">
				<h1>Comments</h1>
				<CommentList data={this.state.data}/>
				<CommentForm onCommentSubmit={this.handleCommentSubmit}/>
			</div>
		);
	}
});

var Comment = React.createClass({
	rawMarkup: function() {
    	var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    	return { __html: rawMarkup };
  	},
	render: function() {
		return (
			<div className="comment">
				<strong className="commentAuthor">
					{this.props.author}
				</strong>
				<span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>			
		);
	}
});

ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000}/>,
	document.getElementById('content')
);