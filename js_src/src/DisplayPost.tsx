import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import DisplayComment from "./DisplayComment";
import Markdown from "react-markdown"
import SentimentDisplay from "./SentimentDisplay";
import { SentRow } from "./helpers";

const DisplayPost = (props: { postId: string }) => {
    const data = useDataStore((state) => state.redditData);
    const sentimentData = useDataStore((state) => state.sentData);
    const { nested, parentData } = dataToNested(data);

    const post = parentData[props.postId]
    const children = nested[props.postId]

    let p_score = undefined
    if (sentimentData.length > 0) {
        const post_sent = sentimentData.find((x: SentRow) => x.id === post.id)
        if (post_sent.label === 'negative') {
            p_score = -1 * post_sent.score
        } else if (post_sent.label === 'positive') {
            p_score = 1 + post_sent.score
        } else {
            p_score = post_sent.score
        }
    }
    
    const sentiment_display = (post.body === '') ?
        null : <SentimentDisplay sentiment={p_score} />;

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