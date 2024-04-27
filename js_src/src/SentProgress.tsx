import React from "react";
import useDataStore from "./datastore";

const SentProgress = () => {
    const sentimentData = useDataStore((state) => state.sentimentData);
    const redditData = useDataStore((state) => state.redditData);

    let body = [<> <progress value={0.0}></progress> </>];
    if (redditData === null) {
        body
    } else {
        const total = redditData.length;
        const completed = Object.keys(sentimentData).length;
        const prog: number = completed / total;
        console.log(total)
        console.log(completed)
        body = [<> <progress value={prog}></progress>  </>];
    }
    return (
        <div>
            <h1>Sentiment Analysis Summary</h1>
            {body}
        </div>
    )

}

export default SentProgress
