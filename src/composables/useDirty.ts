import _ from 'lodash'

/**
 * TODO
 * refs를 받을때는 어떤 ref가 변경되었는지도 알 필요가 있을듯.
 * */

export function useDirty<T extends readonly Ref<unknown>[]>(refs: T) {
    const origins = refs.map((r) => ref(_.cloneDeep(r.value))) as {
        [K in keyof T]: Ref<T[K] extends Ref<infer U> ? U : never>
    }

    const cIsDirty = computed(() => refs.some((r, i) => !_.isEqual(r.value, origins[i].value)))

    function revert() {
        refs.forEach((r, i) => {
            r.value = _.cloneDeep(origins[i].value)
            console.log(`Reverted ref[${i}]:`, r.value)
        })
    }

    function commit() {
        refs.forEach((r, i) => {
            origins[i].value = _.cloneDeep(r.value)
        })
    }

    return {
        origins,
        cIsDirty,
        commit,
        revert,
    }
}
