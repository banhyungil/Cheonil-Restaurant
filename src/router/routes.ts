import AdminLayout from '@/layouts/AdminLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: DefaultLayout,
        children: [
            {
                path: '',
                redirect: '/order',
            },
            {
                path: '/order', // orderId, 수정
                component: () => import('../views/order/OrderView.vue'),
            },
            {
                path: '/order/:seq', // orderId, 수정
                component: () => import('../views/order/OrderView.vue'),
            },
            {
                path: '/orderState',
                name: 'orderState',
                component: () => import('../views/order/OrderStateView.vue'),
            },
            {
                path: '/orderList',
                name: 'orderList',
                component: () => import('../views/order/OrderListView.vue'),
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
        ],
    },
    {
        path: '/admin',
        component: AdminLayout,
        children: [
            { path: '', name: 'account', component: () => import('../views/order/AccountView.vue') },
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
                path: '/expenseEdit:seq?',
                name: 'expenseEdit',
                props: true,
                component: () => import('../views/expense/ExpenseEditView.vue'),
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
        ],
    },
]

export default routes
