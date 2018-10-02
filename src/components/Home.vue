<template>
  <div class="page">
    <div class="nav">
      <router-link :to="{name: 'projects'}">Projects</router-link>
      <router-link :to="{name: 'contact'}">Contact</router-link>
    </div>

    <div class="projects">
      <card v-for="details in cards" v-bind:key="details.title" :details="details"/>
    </div>

  </div>
</template>

<script>
import Card from './Card';

export default {
  data(){
    return {
      cards: [
        {
          title: 'Netlist',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ornare elit elit. Phasellus vehicula mi posuere purus laoreet tempor. Quisque quis justo ac massa luctus euismod at ac urna. Cras non sollicitudin augue. Nam commodo condimentum sem eget porttitor. Ut eu porta mi, quis porta massa. Aliquam tellus nisl, vehicula ac est a, auctor feugiat ex. Nunc pharetra ut nulla laoreet suscipit. Vestibulum eleifend tincidunt urna nec rhoncus.',
          badges: [
            'ReactJS',
            'Redux',
            'Vue.js',
            'Sass'
          ]
        }
      ]
    }
  },
  components: {
    Card
  }  
}
</script>


<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Josefin+Sans:300|Montserrat:300,400');
  $orange: #ffb224;

  body{
    margin: 0;
    font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .nav{
    display: flex;
    width: 100vw;
    font-family: sans-serif;
    z-index: 10;
    justify-content: flex-end;
    margin: 3em 0;
    box-sizing: border-box;
    font-size: 16px;

    a{
      text-decoration: none;
      color: #555;
      margin-right: 4em;
      font-size: 18px;
      transition: color 0.25s ease;
      font-family: 'Josefin Sans', Arial, Helvetica, sans-serif;
      font-weight: 300;

      &:hover{
        color: $orange;
      }
    }
  }

  .projects{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 2em;
  }
</style>
