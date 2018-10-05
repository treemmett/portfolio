import Home from './src/components/Home';
import Vue from 'vue';
import vueScroll from 'vue-smooth-scroll';

Vue.use(vueScroll);

new Vue({
  el: '#app',
  components: {Home},
  template: '<home/>'
});