import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import Markdown from 'react-markdown'
import SentimentDisplay from "./SentimentDisplay";

const DisplayComment = (props: { commentId: string }) => {
    const data = useDataStore((state) => state.redditData);
    const { nested, parentData } = dataToNested(data);

    const comment = parentData[props.commentId];
    const children = nested[props.commentId];

    let renderedChildren: React.JSX.Element[] = [];
    if (children !== undefined) {
        renderedChildren = children.map((child) => {
            return <DisplayComment commentId={child.id} />;
        });
    }

    return (
        <div className="ms-3 ps-2" style={{ borderLeft: "1px solid black" }}>
            <SentimentDisplay objId={comment.id} />
            <p><Markdown>{comment.body}</Markdown></p>
            <div>
                {renderedChildren}
            </div>
        </div>
    );
};

export default DisplayComment;
