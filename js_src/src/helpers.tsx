export type ResultRow = {
    body: string,
    parent: string,
    title: string,
    type: string,
    url: string,
    id: string,
    depth: number
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