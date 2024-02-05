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
      path: '/storeCtg/:name',
      name: 'storeCtg',
      props: true,
      component: () => import('../views/RegStorCtgView.vue'),
    },
  ],
})

export default router
