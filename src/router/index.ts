import { createRouter, createWebHistory } from 'vue-router'
import OrderView from '@/views/order/OrderView.vue'
import OrderStateView from '@/views/order/OrderStateView.vue'
import { useLayoutStore, type Layout } from '@/stores/layoutStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/account',
            name: 'account',
            meta: { layout: 'admin' },
            component: () => import('../views/order/AccountView.vue'),
        },
        {
            path: '/collection',
            name: 'collection',
            meta: { layout: 'admin' },
            component: () => import('../views/order/CollectionView.vue'),
        },
        {
            path: '/expenseList',
            name: 'expenseList',
            meta: { layout: 'admin' },
            component: () => import('../views/expense/ExpenseListView.vue'),
        },
        {
            path: '/expenseEdit/:seq?',
            name: 'expenseEdit',
            meta: { layout: 'admin' },
            props: true,
            component: () => import('../views/expense/ExpenseEditView.vue'),
        },
        {
            path: '/',
            redirect: '/order',
        },
        {
            path: '/order', // orderId, 수정
            meta: { layout: 'default' },
            component: OrderView,
        },
        {
            path: '/order/:seq', // orderId, 수정
            meta: { layout: 'default' },
            component: OrderView,
        },
        {
            path: '/orderState',
            name: 'orderState',
            meta: { layout: 'default' },
            component: OrderStateView,
        },
        {
            path: '/orderList',
            name: 'orderList',
            meta: { layout: 'admin' },
            component: () => import('../views/order/OrderListView.vue'),
        },
        {
            path: '/supply',
            name: 'supply',
            meta: { layout: 'admin' },
            component: () => import('../views/supply/SupplyView.vue'),
        },
        {
            path: '/supplyEdit/:seq?',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/supply/SupplyEditView.vue'),
        },
        {
            path: '/product',
            name: 'product',
            meta: { layout: 'admin' },
            component: () => import('../views/supply/ProductView.vue'),
        },
        {
            path: '/productEdit/:seq?',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/supply/ProductEditView.vue'),
        },
        {
            path: '/unitEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/UnitEditView.vue'),
        },
        {
            path: '/menu',
            meta: { layout: 'admin' },
            component: () => import('../views/menu/MenuView.vue'),
        },
        {
            path: '/menuEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/menu/MenuEditView.vue'),
        },
        {
            path: '/menuEdit/:seq',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/menu/MenuEditView.vue'),
        },
        {
            path: '/menuCtgEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/menu/MenuCtgEditView.vue'),
        },
        {
            path: '/menuCtgEdit/:seq',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/menu/MenuCtgEditView.vue'),
        },
        {
            path: '/placeCtgEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/store/PlaceCtgEditView.vue'),
        },
        {
            path: '/placeCtgEdit/:seq',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/store/PlaceCtgEditView.vue'),
        },
        {
            path: '/store',
            meta: { layout: 'admin' },
            component: () => import('../views/store/StoreView.vue'),
        },
        {
            path: '/storeEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/store/StoreEditView.vue'),
        },
        {
            path: '/storeEdit/:seq',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/store/StoreEditView.vue'),
        },
        {
            path: '/storeCtgEdit',
            meta: { layout: 'admin' },
            component: () => import('../views/store/StoreCtgEditView.vue'),
        },
        {
            path: '/storeCtgEdit/:seq',
            props: true,
            meta: { layout: 'admin' },
            component: () => import('../views/store/StoreCtgEditView.vue'),
        },
        {
            path: '/test/draggable',
            props: true,
            meta: { layout: 'default' },
            component: () => import('../views/ztest/VueDraggableView.vue'),
        },
    ],
})

// layout 설정
// 각 route의 meta.layout에 따라 레이아웃을 결정한다.
router.beforeEach((to, from) => {
    const layoutStore = useLayoutStore()
    const layout = to.meta.layout || 'default'
    layoutStore.set(layout as Layout)
})

export default router
