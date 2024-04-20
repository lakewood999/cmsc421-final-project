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
        
        body = [<p> The number of posts we were able to analyze was {analyzed.toString()}. </p>,
                <p> The number of posts with postive sentiment was {pos.toString()}. </p>, 
                <p> The number of posts with neutral sentiment was {neu.toString()}. </p>,
                <p> The number of posts with negative sentiment was {neg.toString()}. </p>]
    } 
    
    
    return (
        <div>
            {body}
        </div>
    )
}

export default SentResultsRender