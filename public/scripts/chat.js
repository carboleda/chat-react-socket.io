// example.js
//variable for save timeout reference and clear each time that stop typing
var typingTimeout;
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
	//handle keydown event for emit when start typing
	handleTypingStart: function(e) {
		//console.log(e);
		//when start typing first time, emit to all user connected
		if(!this.state.isTyping) {
			socket.emit('typing on', {author: this.state.author.trim()});
		}
		this.setState({isTyping: true, lastTyped: new Date().getTime()});
	},
	//handle keyup event for emit when end typing
	handleTypingStop: function(e) {
		//console.log(e);
		var _this = this;
		//if already had a reference to timeout
		if(typingTimeout) {
			//it is call clearTimeout to remove it
			clearTimeout(typingTimeout);
		}
		//programming a new timeout
		typingTimeout = setTimeout(function() {
			//if has passed more that 500 miliseconds since last time that typed
			if((new Date().getTime() - _this.state.lastTyped) >= 500) {
				//console.log('Typing stopped');
				//change typing state and emit typing off
				_this.setState({isTyping: false});
				socket.emit('typing off');
			}
		}, 500);
	},
	getInitialState: function() {
		console.log('getInitialState');
		var author = window.sessionStorage.getItem('author');
		return {author: author, text: '', userTyping: '', lastTyped: 0, isTyping: false};
	},
	rawMarkup: function() {
		//console.log(this.state.userTyping);
    	var rawMarkup = marked(this.state.userTyping, {sanitize: true});
    	return { __html: rawMarkup };
  	},
  	componentDidMount: function() {
  		var _this = this;
  		//event for receive each time that some user has begun typing
    	socket.on('typing on', function(typing){
			//console.log('typing on', typing);
    		_this.setState({userTyping: typing});
	  	});
	  	//event for receive each time that some user has stopped typing
    	socket.on('typing off', function(){
			//console.log('typing off');
    		_this.setState({userTyping: ''});
	  	});
  	},
	render: function() {	
		return (
			<div>
				<span className="typingMessaje" dangerouslySetInnerHTML={this.rawMarkup()} />
				<br/>
				<form className="commentForm" onSubmit={this.handleSubmit}>				
					<input type="text" placeholder="Say something..." value={this.state.text} 
						onChange={this.handleTextChange}
						onKeyDown={this.handleTypingStart}
						onKeyUp={this.handleTypingStop}/>
					<input type="submit" value="Post" className="btnPost"/>
				</form>
			</div>
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
				<h1>Messages</h1>
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






var LoginBox = React.createClass({
	handleAuthorChange: function(e) {
		this.setState({author: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var author = this.state.author.trim();
		if(author) {
			window.sessionStorage.setItem('author', author);

			ReactDOM.render(
				<CommentBox url="/api/comments" pollInterval={2000}/>,
				document.getElementById('content')
			);
		}
		return false;
	},
	getInitialState: function() {
		return {author: ''};
	},
	render: function() {
		return (
			<div className="centerDiv">
				<h1>Chat with React and Socket.io</h1>
				<form className="loginBox" onSubmit={this.handleSubmit}>			
					<input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange}/>
				</form>
			</div>
		);	
	}
});

ReactDOM.render(
	<LoginBox/>,
	document.getElementById('content')
);

/*
ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000}/>,
	document.getElementById('content')
);
*/