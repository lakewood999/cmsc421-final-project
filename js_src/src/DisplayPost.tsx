import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import DisplayComment from "./DisplayComment";
import Markdown from 'react-markdown'

const DisplayPost = (props: { postId: string }) => {
    const data = useDataStore((state) => state.redditData)
    const { nested, parentData } = dataToNested(data);

    const post = parentData[props.postId]
    const children = nested[props.postId]

    console.log("Rendering post", post.id, children.length);

    return (
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">
                    <a href={`https://reddit.com${post.url}`}>{post.title}</a>
                </h5>
                <div className="card-text">
                    <Markdown>{post.body}</Markdown>
                </div>
                <hr />
                {children.map((child) => {
                    return (
                        <DisplayComment commentId={child.id} />
                    )
                })}
            </div>
        </div>
    )
}

export default DisplayPost;
