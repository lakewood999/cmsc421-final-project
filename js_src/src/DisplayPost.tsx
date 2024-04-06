import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import DisplayComment from "./DisplayComment";

const DisplayPost = (props: { postId: string }) => {
    const data = useDataStore((state) => state.redditData)
    const {nested, parentData} = dataToNested(data);

    const post = parentData[props.postId]
    const children = nested[props.postId]

    console.log("Rendering post", post.id, children.length);

    return (
        <div>
            <h2><a href={`https://reddit.com${post.url}`}>{post.title}</a></h2>
            <p>{post.body}</p>
            <hr/>
            {children.map((child) => {
                return (
                    <DisplayComment commentId={child.id} />
                )
            })}
        </div>
    )
}

export default DisplayPost;