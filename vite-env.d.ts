/// <reference types="vite/client" />
// vite 타입 참조
interface ImportMetaEnv {
    readonly VITE_WS_PORT: number
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
