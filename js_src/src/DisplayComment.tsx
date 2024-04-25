import React from "react";
import useDataStore from "./datastore";
import { dataToNested } from "./helpers";
import Markdown from "react-markdown"
import SentimentDisplay from "./SentimentDisplay";
import { SentRow } from "./helpers";

const DisplayComment = (props: { commentId: string }) => {
    const data = useDataStore((state) => state.redditData);
    const sentimentData = useDataStore((state) => state.sentData);
    const { nested, parentData } = dataToNested(data);

    const comment = parentData[props.commentId];
    const children = nested[props.commentId];

    let c_score = undefined
    if (sentimentData.length > 0) {
        const com_sent = sentimentData.find((x: SentRow) => x.id === comment.id)
        if (com_sent.label === 'negative') {
            c_score = -1 * com_sent.score
        } else if (com_sent.label === 'positive') {
            c_score = 1 + com_sent.score
        } else {
            c_score = com_sent.score
        }
    }

    let renderedChildren: React.JSX.Element[] = [];
    if (children !== undefined) {
        renderedChildren = children.map((child) => {
            return <DisplayComment commentId={child.id} />;
        });
    }

    return (
        <div className="ms-3 ps-2" style={{ borderLeft: "1px solid black" }}>
            <SentimentDisplay sentiment={c_score} />
            <p><Markdown>{comment.body}</Markdown></p>
            <div>
                {renderedChildren}
            </div>
        </div>
    );
};

export default DisplayComment;