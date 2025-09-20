import { onUnmounted } from 'vue'

interface Options {
    target: MaybeRef<HTMLElement | null>
    callback: (event: MouseEvent | TouchEvent) => void
    disabled?: MaybeRef<boolean>
}
export function useClickOutside({ target, callback, disabled }: Options) {
    const listener = (event: MouseEvent | TouchEvent) => {
        const el = unref(target)
        if (!el || el.contains(event.target as Node) || unref(disabled)) return
        callback(event)
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    const inst = getCurrentInstance()
    if (inst) {
        onUnmounted(() => {
            clear()
        })
    }

    function clear() {
        document.removeEventListener('mousedown', listener)
        document.removeEventListener('touchstart', listener)
    }

    return { clear }
}
