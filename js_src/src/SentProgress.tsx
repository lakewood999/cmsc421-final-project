import React from "react";
import useDataStore from "./datastore";

const SentProgress = () => {
    const sentimentData = useDataStore((state) => state.sentimentData);
    const redditData = useDataStore((state) => state.redditData);
    const numModes = useDataStore((state) => state.numModes);

    let body = [<div className="progress"><div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}></div></div>];
    if (redditData === null) {
        body
    } else {
        const total = redditData.length * numModes;
        // completed is the number of keys per entry in sentimentData
        const completed = Object.keys(sentimentData).reduce((acc: number, entry: string) => acc + Object.keys(sentimentData[entry]).length, 0);
        // count the number of entries with an empty body in redditData
        const empty = redditData.filter((entry: any) => entry.body === "").length * numModes;
        const prog: number = completed / (total - empty);
        body = [<div className="progress"><div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${prog * 100}%` }} aria-valuenow={prog} aria-valuemin={0} aria-valuemax={100}>{`${Math.round((Math.abs(prog) + Number.EPSILON) * 100)}%`}</div></div>];
    }
    return (
        <div>
            <h1>Sentiment Analysis Summary</h1>
            {body}
        </div>
    )

}

export default SentProgress
