import Vue from 'vue';
import Router from 'vue-router';

// Components
import Home from './components/Home';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '*',
    redirect: {
      name: 'home'
    }
  }
];

export default new Router({
  routes,
  mode: 'history'
});