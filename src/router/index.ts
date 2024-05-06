import { createRouter, createWebHistory } from 'vue-router'
import OrderView from '@/views/OrderView.vue'
import OrderStateView from '@/views/OrderStateView.vue'
import AdminView from '@/views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'order',
      component: OrderView,
    },
    {
      path: '/orderState',
      name: 'orderState',
      component: OrderStateView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
    {
      path: '/store',
      component: () => import('../views/StoreView.vue'),
    },
    {
      path: '/store/:id',
      props: true,
      component: () => import('../views/StoreView.vue'),
    },
    {
      path: '/storeCtg',
      component: () => import('../views/StoreCtgView.vue'),
    },
    {
      path: '/storeCtg/:name',
      props: true,
      component: () => import('../views/StoreCtgView.vue'),
    },
    {
      path: '/menu',
      component: () => import('../views/MenuView.vue'),
    },
    {
      path: '/menu/:id',
      props: true,
      component: () => import('../views/MenuView.vue'),
    },
    {
      path: '/menuCtg',
      component: () => import('../views/MenuCtgView.vue'),
    },
    {
      path: '/menuCtg/:name',
      props: true,
      component: () => import('../views/MenuCtgView.vue'),
    },
    {
      path: '/test',
      name: 'test',
      props: true,
      component: () => import('../components/MenuTab.vue'),
    },
  ],
})

export default router
