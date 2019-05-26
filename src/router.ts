import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Tree from './views/Tree.vue'
import Force from './views/Force.vue'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/tree',
      name: 'tree',
      component: Tree
    },
    {
      path: '/force',
      name: 'force',
      component: Force
    }
  ]
})
