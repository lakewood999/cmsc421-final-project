import React from "react";
import useDataStore from "./datastore";

const SentProgress = () => {
    const sentimentData = useDataStore((state) => state.sentimentData);
    const redditData = useDataStore((state) => state.redditData);
    const numModes = useDataStore((state) => state.numModes);

    let body = [<> <progress value={0.0}></progress> </>];
    if (redditData === null) {
        body
    } else {
        const total = redditData.length * numModes;
        // completed is the number of keys per entry in sentimentData
        const completed = Object.keys(sentimentData).reduce((acc: number, entry: string) => acc + Object.keys(sentimentData[entry]).length, 0);
        console.log(total)
        console.log(completed)
        const prog: number = completed / total;
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
