import router from './src/router';
import Vue from 'vue';

console.log('hi');

new Vue({
  router,
  el: '#app',
  template: '<router-view></router-view>'
});