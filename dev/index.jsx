import React from "react"
import ReactDOM from "react-dom";
import Remarkable from "remarkable";
import $ from "jquery";

class CommentBox extends React.Component {
    loadCommentsFromServer() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({data: data})
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }

    constructor(props) {
        super(props);
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
        this.state = {
            data: []
        }
    }

    componentDidMount() {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    }

    handleCommentSubmit(comment) {
        var comments = this.state.data;
        comment.id = Date.now();
        var newComments = comments.concat([comment]);
        this.setState({data: newComments});
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                this.setState({data: comments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        })
    }

    render() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        )
    }
}

class CommentList extends React.Component {
    render() {
        var commentNodes = this.props.data.map((comment) => <Comment author={comment.author}
                                                                     key={comment.id}>{comment.text}</Comment>)

        return (
            <div className="commentList">
                {commentNodes}
            </div>
        )
    }

}

class CommentForm extends React.Component {

    constructor(props) {
        super(props);
        this.handleAuthorChange = this.handleAuthorChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            author: '',
            text: ''
        }
    }

    handleAuthorChange(e) {
        this.setState({
            author: e.target.value
        })
    }

    handleTextChange(e) {
        this.setState({
            text: e.target.value
        })
    }

    handleSubmit(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!author || !text) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.setState({author: '', text: ''});
    }

    render() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text" value={this.state.author} onChange={this.handleAuthorChange}
                       placeholder="Your name"/>
                <input type="text" value={this.state.text} onChange={this.handleTextChange}
                       placeholder="Say something"/>
                <input type="submit" value="post"/>
            </form>
        )

    }
}
class Comment extends React.Component {
    rawMarkup() {
        var md = new Remarkable();
        var rawMarkup = md.render(this.props.children.toString());
        return {__html: rawMarkup}
    }

    render() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">{this.props.author}</h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()}></span>
            </div>
        )
    }
}

ReactDOM.render(
    <CommentBox pollInterval="2000" url="/api/comments"/>,
    document.getElementById('container')
)
;