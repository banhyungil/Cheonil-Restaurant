import TreeCrawl from 'tree-crawl'
import _ from 'lodash'

function flatten<T extends { children?: T[] }>(tree: T) {
    const result = [tree]
    // const children = tree[key as keyof T] as Array<any>
    if (tree?.children) {
        tree.children.forEach((cTree) => {
            if (cTree.children) result.push(...flatten(cTree))
            else result.push(cTree)
        })
    }

    return result
}

function forEach<T extends { children?: T[] }>(tree: T, callback: (node: T, context: TreeCrawl.Context<T>) => void) {
    TreeCrawl(tree, (node, context) => {
        callback(node, context)
    })
}

function filter<T extends { children?: T[] }>(tree: T, callback: (node: T) => boolean) {
    const list = [] as { node: T; parent: T | null; children?: T[] }[]
    TreeCrawl(tree, (node, context) => {
        if (callback(node)) list.push({ node, parent: context.parent, children: node.children })
    })
    return list
}

function find<T extends { children?: T[] }>(tree: T, callback: (node: T) => boolean) {
    let result = {} as { node: T; parent: T | null; children?: T[] }
    TreeCrawl(tree, (node, context) => {
        if (callback(node)) {
            result = { node, parent: context.parent, children: node.children }
            context.break()
        }
    })
    return result
}

/**
 * node 삭제 (root 노드 제외)
 */
function remove<T extends { children: T[] }>(tree: T, callback: (node: T) => boolean) {
    const list = filter(tree, callback)

    list.forEach(({ node, parent }) => {
        if (parent) _.remove(parent.children, (child) => child == node)
    })
}

/** 노드 순회하면서 새로운 노드를 생성 */
function reduce<T extends { children: T[] }, J extends object | null, K extends J & { children: K[] }>(tree: T, transform: (node: T, isSkip?: boolean) => J) {
    // 새로운 노드로 대체
    const newNode = { children: [], ...transform(tree) } as K

    // 자식 노드가 있는 경우 재귀적으로 처리
    if (tree.children) {
        newNode.children = tree.children.map((child) => reduce(child, transform))
    }

    return newNode
}

export default {
    forEach,
    flatten,
    find,
    filter,
    /** node 삭제 (root 노드 제외) */
    remove,
    reduce,
}
