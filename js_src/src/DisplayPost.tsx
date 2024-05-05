import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import DisplayComment from "./DisplayComment";
import Markdown from 'react-markdown'
import SentimentDisplay from "./SentimentDisplay";

const DisplayPost = (props: { postId: string, idx: number }) => {
    const data = useDataStore((state) => state.redditData);
    const { nested, parentData } = dataToNested(data);

    const [showComments, setShowComments] = React.useState((props.idx === 0) ? true : false);

    const post = parentData[props.postId]
    const children = nested[props.postId]

    const sentiment_display = (post.body === '') ?
        null : <SentimentDisplay objId={props.postId} />;

    return (
        <div className="card mb-3">
            <div className="card-header">
                <h5 className="card-title">
                    {sentiment_display}
                    <a href={`https://reddit.com${post.url}`}>{post.title}</a>
                </h5>
            </div>
            <ul className="list-group list-group-flush">
                <li className="list-group-item">
                    <Markdown>{post.body === '' ? "<No body text found>" : post.body}</Markdown>
                </li>
                <li className="list-group-item">
                    <button className="btn btn-primary mb-3" onClick={() => setShowComments(!showComments)} data-bs-toggle="collapse" data-bs-target={`#comments-of-${props.postId}`}>
                        {showComments ? "Hide" : "Show"} Comments
                    </button>
                    <div className={`collapse ${(showComments ? "show" : "")}`} id={`comments-of-${props.postId}`}>
                        {children.map((child) => {
                            return (
                                <DisplayComment commentId={child.id} />
                            )
                        })}
                    </div>
                </li>
            </ul>
        </div>
    )
}

export default DisplayPost;
