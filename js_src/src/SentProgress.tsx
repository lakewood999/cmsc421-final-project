import React, { useEffect, useRef } from "react";
import useDataStore from "./datastore";
import { ResultRow, SentRow } from "./helpers";
import { find_step_sizes } from "./helpers";

const SentProgress = () => {
    const [iters, setIters] = React.useState(0)
    const [errorString, setErrorString] = React.useState(""); // TODO: implement error handling
    
    //const [sents, setSents] = React.useState<any>([])
    const row = useRef(0)
    const sents = useRef<any>([])
    const prev_len = useRef(0)
    const prev_id = useRef("")
    
    const data: ResultRow[] = useDataStore((state) => state.redditData)
    const batches: number = 25

    const setSentData = useDataStore((state) => state.setSentData);
    
    useEffect(() => {
        const aborter = new AbortController()
        
        async function sentApiCallWrapper () {
            if ((data != null)) {
                if (((data.length != prev_len.current) && (iters === batches)) && (data[0].id != prev_id.current)) {
                    setIters(0)
                }
                if (iters < batches) {
                    const len: number = data.length
                    const steps_to_take: number[] = find_step_sizes(len, batches)
                    if (iters == 0) {
                        console.log(steps_to_take)
                        prev_len.current = data.length
                        prev_id.current = data[0].id
                    }
                    const curr_steps: number = steps_to_take[iters]
                    const curr_list: string[] = []
                    for (let i = 0; i < curr_steps; i++) {
                        const line: ResultRow = data[row.current + i]
                        const curr: string = line.body
                        curr_list.push(curr)
                    }
                    try {
                        const response = await fetch("/api/sentiment", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify ({
                                reddit_text: curr_list,
                            }), 
                            signal: aborter.signal
                        })
                        const sentoutput = await response.json()
                        console.log(sentoutput.results);
                        //const toAdd = []
                        for (let i = 0; i < sentoutput.results.length; i++) {
                            const newRow = {id: (sents.current.length + i), body: sentoutput.results[i].body, label: sentoutput.results[i].label, score: sentoutput.results[i].score}
                            //{id: (sents.length + i), body: sentoutput.results[i].body, label: sentoutput.results[i].label, score: sentoutput.results[i].score}
                            //toAdd.push(newRow)
                            sents.current.push(newRow)
                        }
                        //setSents(sents.concat(toAdd));
                        setIters(iters + 1);
                    } catch (error) {
                        if (error.name === 'AbortError') {
                            console.log("Data Race, Aborted Fetch.")
                        }
                        setErrorString("An error occurred. Please try again later.");
                        console.error("Error:", error);
                    }
                    //setRow(row + curr_steps);
                    row.current = row.current + curr_steps
                } else {
                    setSentData(JSON.parse(JSON.stringify(sents.current)));
                    row.current = 0
                    sents.current.length = 0
                    sents.current = []
                }
            }
        }

        sentApiCallWrapper();
        return () => {
            aborter.abort();
        };

    }, [iters, data])
    
    let body = [<> <progress value={0.0}></progress> </>];
    if (data === null) {
        body
    } else if ((data.length > 0) && (iters < batches)) {
        const prog: number = iters/batches;
        body = [<> <progress value={prog}></progress>  </>];
        console.log(iters)
    } else if ((data.length > 0) && (iters >= batches)) { 
        body = [<> <progress value={1.0}></progress> </>];
        console.log(sents.current);
    }
    return (
        <div>
            <h1>Sentiment Analysis</h1>
            {body}
        </div>
    )

}

export default SentProgress