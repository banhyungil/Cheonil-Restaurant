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
      component: () => import('../views/order/ExpenseListView.vue'),
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
      path: '/order/:id', // orderId, 수정
      props: true,
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
      path: '/menuCtgEdit/:name',
      props: true,
      component: () => import('../views/menu/MenuCtgEditView.vue'),
    },
    {
      path: '/placeCtgEdit',
      component: () => import('../views/store/PlaceCtgEditView.vue'),
    },
    {
      path: '/placeCtgEdit/:name',
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
      path: '/storeEdit/:name',
      props: true,
      component: () => import('../views/store/StoreEditView.vue'),
    },
    {
      path: '/storeCtgEdit',
      component: () => import('../views/store/StoreCtgEditView.vue'),
    },
    {
      path: '/storeCtgEdit/:name',
      props: true,
      component: () => import('../views/store/StoreCtgEditView.vue'),
    },
    {
      path: '/test',
      name: 'test',
      props: true,
      component: () => import('../components/MenuTab.vue'),
    },
  ],
})

// layout 설정
// path에 따라 자신의 layout을 결정한다.
const layoutRoutePathDict = {
  default: ['/order'],
  admin: ['/account', '/collection', '/expenseList', '/orderList', '/store', '/menu'],
}
router.getRoutes().forEach((route) => {
  Object.entries(layoutRoutePathDict).forEach(([key, paths]) => {
    if (paths.includes(route.path)) {
      route.meta.layout = key
    }
  })
})

router.beforeEach((to, from) => {
  const layoutStore = useLayoutStore()

  if (to.meta.layout == 'default') layoutStore.set('default')
  else if (to.meta.layout == 'admin') layoutStore.set('admin')
})

export default router
