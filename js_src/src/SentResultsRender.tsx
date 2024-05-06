import React, { useEffect, useRef } from "react";
import useDataStore from "./datastore";
import GaugeComponent from "react-gauge-component";

const SentResultsRender = () => {
    const sents = useDataStore((state) => state.sentimentData);
    const sentimentMode = useDataStore((state) => state.sentimentMode);

    let body = [<p> Awaiting sentiment analysis to display results...</p>]
    let gauge = [<p hidden>guage</p>]
    if ((Object.keys(sents).length === 0)) {
        body
    } else {
        let pos: number = 0
        let neg: number = 0
        let neu: number = 0
        let empt: number = 0
        let err: number = 0
        for (const key in sents) {
            const d = sents[key][sentimentMode];
            if (d === undefined) {
                continue;
            }
            if (d.label === 'positive') {
                pos++;
            } else if (d.label === 'negative') {
                neg++;
            } else if (d.label === 'neutral') {
                neu++;
            } else if (d.label === 'Empty') {
                empt++;
            } else if (d.label === 'Error') {
                err++;
            }
        }
        const tot = sents.length
        const analyzed = pos + neg + neu

        const pos_per: number = pos / analyzed
        const neg_per: number = neg / analyzed
        const neu_per: number = neu / analyzed

        let sum_str: string = ""
        if ((neu_per > 0.6) || (Math.abs(pos_per - neg_per) < 0.1)) {
            sum_str = 'mixed'
        } else if (pos_per > neg_per) {
            sum_str = 'positive'
        } else {
            sum_str = 'negative'
        }


        body = [<p> The number of posts/comments we were able to analyze was {analyzed.toString()}. </p>,
        <p> The number of posts/comments with <span style={{ color: "green" }}>postive</span> sentiment was {pos.toString()} ({Math.round((Math.abs(pos_per) + Number.EPSILON) * 100)}%). </p>,
        <p> The number of posts/comments with <span style={{ color: "#CCCC00" }}>neutral</span> sentiment was {neu.toString()} ({Math.round((Math.abs(neu_per) + Number.EPSILON) * 100)}%). </p>,
        <p> The number of posts/comments with <span style={{ color: "red" }}>negative</span> sentiment was {neg.toString()} ({Math.round((Math.abs(neg_per) + Number.EPSILON) * 100)}%). </p>,
        <p> The number of posts/comments we had an <span style={{ color: "gray" }}>error</span> anlayzing was {err.toString()}. </p>,
        <p> Overall, the sentiment was {sum_str} in the posts we analyzed. </p>]


        //recalculate percentages so it doesn't break the gauage while loading
        let p = (pos_per * 100 == 100 ? 99 : pos_per * 100)
        let nt = (p + (neu_per * 100) > p ? (p + (neu_per * 100)) : p + .01)
        let n = 100
        let gaugeValue = pos_per * 100 - .01 < 0 ? nt : pos_per * 100 - .01
        // if p or nt are NaN, set them to 0
        if (isNaN(p)) {
            p = 0
        }
        if (isNaN(nt)) {
            nt = p + .01
        }
        if (isNaN(gaugeValue)) {
            gaugeValue = 0
        }

        //console.log("pos -> " + (p));
        //console.log("neut -> " + (nt));
        //console.log("neg -> " + (n));

        gauge = [<GaugeComponent
            type="semicircle"
            arc={{
                colorArray: ['#00FF15', '#FF2121'],
                padding: 0.04,
                subArcs:
                    [
                        { limit: p },
                        { limit: nt },
                        { limit: n },
                    ]
            }}
            pointer={{ type: "blob", animationDelay: 0 }}
            value={gaugeValue}
        />]
    }

    return (
        <div className="card mb-4 rounded-3 shadow-sm">
            <div className="card-header py-3">
                <h4 className="my-0 fw-normal">Sentiment Analysis Summary</h4>
            </div>
            <div className="card-body">
                <div className="row justify-content-center">
                    <div className="col-md-6 col-sm-12">
                        {gauge}
                    </div>
                </div>
                {body}
            </div>
        </div>
    )
}

export default SentResultsRender
