export type ResultRow = {
    body: string,
    parent: string,
    title: string,
    type: string,
    url: string,
    id: string,
    depth: number
}

export type SentRow = {
    body: string
    label: string
    score: number
}

// TODO: We need to cache dataToNested

/**
 * From a raw set of rows from the API, builds out a nested structure for
 * easy display. Format is a dict that has key of parent name and a list of children
 * and another dict that has key of parent and the parent's data.
 * 
 * @param data 
 * @returns 
 */
export function dataToNested(data: ResultRow[]) {
    let nested: {[key: string]: ResultRow[]} = {}
    let parentData: {[key: string]: ResultRow } = {}
    for (const row of data) {
        if (row.type === "post") {
            nested[row.id] = []
            parentData[row.id] = {...row, depth: 0}
        } else {
            // handle the comments
            if (!nested.hasOwnProperty(row.parent)) {
                nested[row.parent] = []
            }
            const mod_row = {...row, depth: parentData[row.parent].depth + 1}
            nested[row.parent].push(mod_row)
            parentData[row.id] = mod_row
        }
    }
    return {nested, parentData}
}

export function find_step_sizes(total: number, batch: number) {
    const step_list: number[] = []
    let factor: number = 1
    while (total - factor*batch > 0) {
        factor = factor + 1
    }
    const extra = total - factor*batch
    for (let i=0; i < 25; i++) {
        if (i < (25 + extra)) {
            step_list.push(factor)
        } else {
            step_list.push(factor - 1)
        }
    }
    return step_list
}