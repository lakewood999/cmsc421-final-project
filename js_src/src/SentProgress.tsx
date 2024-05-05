import React from "react";
import useDataStore from "./datastore";

const SentProgress = () => {
    const sentimentData = useDataStore((state) => state.sentimentData);
    const redditData = useDataStore((state) => state.redditData);

    if (redditData === null) {
        return null;
    }

    //let body = [<div className="progress"><div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}></div></div>];
    const total = redditData.length;
    const modes: { [key: string]: string } = {
        "flair": "Flair",
        "hf": "HuggingFace",
        "nltk": "NLTK"
    };
    const colors = ["", "bg-success", "bg-info", "bg-warning", "bg-danger"]
    const completedByMode = Object.keys(modes).map((mode) => {
        const completed = Object.keys(sentimentData).reduce((acc: number, entry: string) => {
            return acc + (sentimentData[entry][mode] ? 1 : 0);
        }, 0);
        return completed;
    })
    // count the number of entries with an empty body in redditData
    const empty = redditData.filter((entry: any) => entry.body === "").length;
    const progPerMode = completedByMode.map((completed: number) => completed / (total - empty));
    const numModes = Object.keys(modes).length;
    return <div className="progress">
        {
            Object.keys(modes).map((mode, idx) => {
                return <div
                    key={mode}
                    className={`progress-bar progress-bar-striped progress-bar-animated ${colors[idx]}`}
                    role="progressbar"
                    style={{ width: `${progPerMode[idx] * 100 * 1 / numModes}%` }}
                    aria-valuenow={progPerMode[idx]}
                    aria-valuemin={0}
                    aria-valuemax={100}>
                    {`${modes[mode]}: ${Math.round((Math.abs(progPerMode[idx]) + Number.EPSILON) * 100)}%`}
                </div>
            })
        }
    </div>;
}

export default SentProgress
