import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import routes from './routes'

const createHistory = import.meta.env.DEV ? createMemoryHistory : createWebHistory
const router = createRouter({
    history: createHistory(import.meta.env.BASE_URL),
    routes,
})

// layout 설정
// path에 따라 자신의 layout을 결정한다.
// const layoutRoutePathInfo = {
//     admins: ['/account', '/collection', '/expenseList', '/orderList', '/store', '/menu', '/supply', '/supplyEdit', '/product', '/productEdit', '/unitEdit'],
// }

// router.beforeEach((to, from) => {
//     const layoutStore = useLayoutStore()

//     if (layoutRoutePathInfo.admins.includes(to.path)) layoutStore.set('admin')
//     else layoutStore.set('default')
// })

export default router
