import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import DisplayComment from "./DisplayComment";
import Markdown from 'react-markdown'
import SentimentDisplay from "./SentimentDisplay";

const DisplayPost = (props: { postId: string }) => {
    const data = useDataStore((state) => state.redditData);
    const sentimentData = useDataStore((state) => state.sentimentData);
    const { nested, parentData } = dataToNested(data);

    const post = parentData[props.postId]
    const children = nested[props.postId]

    const sentiment_display = (post.body === '') ?
        null : <SentimentDisplay sentiment={sentimentData[post.id]} />;

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
                    {children.map((child) => {
                        return (
                            <DisplayComment commentId={child.id} />
                        )
                    })}
                </li>
            </ul>
        </div>
    )
}

export default DisplayPost;
