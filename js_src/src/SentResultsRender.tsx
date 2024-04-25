import React, { useEffect, useRef } from "react";
import useDataStore from "./datastore";
import { SentRow } from "./helpers";

const SentResultsRender = () => {    
    let sents: SentRow[] = useDataStore((state) => state.sentData)
    
    useEffect(() => { console.log(sents) }, [sents])

    let body = [<p> Awaiting sentiment analysis to display results...</p>]
    if ((sents === null)) {
        body
    } else if ((sents.length > 0)) {
        let pos: number = 0
        let neg: number = 0
        let neu: number = 0
        let empt: number = 0
        let err: number = 0
        for (let i=0; i < sents.length; i++) {
            if (sents[i].label === "positive") {
                pos++
            } else if (sents[i].label === "negative") {
                neg++
            } else if (sents[i].label === "neutral") {
                neu++
            } else if (sents[i].label === "Empty") {
                empt++
            } else if (sents[i].label === "Error") {
                err++
            }
        }
        const tot = sents.length
        const analyzed = pos + neg + neu

        const pos_per: number = pos/analyzed
        const neg_per: number = neg/analyzed  
        const neu_per: number = neu/analyzed
        
        let sum_str: string = ""
        if ((neu_per > 0.6) || (Math.abs(pos_per - neg_per) < 0.1)) {
            sum_str = 'mixed'
        } else if (pos_per > neg_per) {
            sum_str = 'positive'
        } else {
            sum_str = 'negative'
        }
        
        body = [<p> The number of posts we were able to analyze was {analyzed.toString()}. </p>,
                <p> The number of posts with <span style={{color: "green"}}>postive</span> sentiment was {pos.toString()} ({Math.round((Math.abs(pos_per) + Number.EPSILON) * 100)}%). </p>, 
                <p> The number of posts with <span style={{color: "gray"}}>neutral</span> sentiment was {neu.toString()} ({Math.round((Math.abs(neu_per) + Number.EPSILON) * 100)}%). </p>,
                <p> The number of posts with <span style={{color: "red"}}>negative</span> sentiment was {neg.toString()} ({Math.round((Math.abs(neg_per) + Number.EPSILON) * 100)}%). </p>,
                <p> The number of posts we had an <span style={{color: "#CCCC00"}}>error</span> anlayzing was {err.toString()}. </p>,
                <p> Overall, the sentiment was {sum_str} in the posts we analyzed. </p>]
    } 
    
    
    return (
        <div>
            {body}
        </div>
    )
}

export default SentResultsRender