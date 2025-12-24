import { createRouter, createWebHistory } from 'vue-router'
import OrderView from '@/views/order/OrderView.vue'
import OrderStateView from '@/views/order/OrderStateView.vue'
import { useLayoutStore } from '@/stores/layoutStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/account',
            name: 'account',
            component: () => import('../views/order/AccountView.vue'),
        },
        {
            path: '/collection',
            name: 'collection',
            component: () => import('../views/order/CollectionView.vue'),
        },
        {
            path: '/expenseList',
            name: 'expenseList',
            component: () => import('../views/expense/ExpenseListView.vue'),
        },
        {
            path: '/expenseEdit/:seq?',
            name: 'expenseEdit',
            props: true,
            component: () => import('../views/expense/ExpenseEditView.vue'),
        },
        {
            path: '/',
            redirect: '/order',
        },
        {
            path: '/order', // orderId, 수정
            component: OrderView,
        },
        {
            path: '/order/:seq', // orderId, 수정
            component: OrderView,
        },
        {
            path: '/orderState',
            name: 'orderState',
            component: OrderStateView,
        },
        {
            path: '/orderList',
            name: 'orderList',
            component: () => import('../views/order/OrderListView.vue'),
        },
        {
            path: '/supply',
            name: 'supply',
            component: () => import('../views/supply/SupplyView.vue'),
        },
        {
            path: '/supplyEdit/:seq?',
            props: true,
            component: () => import('../views/supply/SupplyEditView.vue'),
        },
        {
            path: '/product',
            name: 'product',
            component: () => import('../views/supply/ProductView.vue'),
        },
        {
            path: '/productEdit/:seq?',
            props: true,
            component: () => import('../views/supply/ProductEditView.vue'),
        },
        {
            path: '/unitEdit',
            component: () => import('../views/UnitEditView.vue'),
        },
        {
            path: '/menu',
            component: () => import('../views/menu/MenuView.vue'),
        },
        {
            path: '/menuEdit',
            component: () => import('../views/menu/MenuEditView.vue'),
        },
        {
            path: '/menuEdit/:seq',
            props: true,
            component: () => import('../views/menu/MenuEditView.vue'),
        },
        {
            path: '/menuCtgEdit',
            component: () => import('../views/menu/MenuCtgEditView.vue'),
        },
        {
            path: '/menuCtgEdit/:seq',
            props: true,
            component: () => import('../views/menu/MenuCtgEditView.vue'),
        },
        {
            path: '/placeCtgEdit',
            component: () => import('../views/store/PlaceCtgEditView.vue'),
        },
        {
            path: '/placeCtgEdit/:seq',
            props: true,
            component: () => import('../views/store/PlaceCtgEditView.vue'),
        },
        {
            path: '/store',
            component: () => import('../views/store/StoreView.vue'),
        },
        {
            path: '/storeEdit',
            component: () => import('../views/store/StoreEditView.vue'),
        },
        {
            path: '/storeEdit/:seq',
            props: true,
            component: () => import('../views/store/StoreEditView.vue'),
        },
        {
            path: '/storeCtgEdit',
            component: () => import('../views/store/StoreCtgEditView.vue'),
        },
        {
            path: '/storeCtgEdit/:seq',
            props: true,
            component: () => import('../views/store/StoreCtgEditView.vue'),
        },
        {
            path: '/test/draggable',
            props: true,
            component: () => import('../views/ztest/VueDraggableView.vue'),
        },
    ],
})

// layout 설정
// path에 따라 자신의 layout을 결정한다.
const layoutRoutePathInfo = {
    admins: [
        '/account',
        '/collection',
        '/expenseList',
        '/expenseEdit',
        '/orderList',
        '/store',
        '/menu',
        '/supply',
        '/supplyEdit',
        '/product',
        '/productEdit',
        '/unitEdit',
    ],
}

router.beforeEach((to, from) => {
    const layoutStore = useLayoutStore()

    if (layoutRoutePathInfo.admins.includes(to.path)) layoutStore.set('admin')
    else layoutStore.set('default')
})

export default router
