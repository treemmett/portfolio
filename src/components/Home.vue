<template>
  <div class="page">
    <div class="nav">
      <router-link :to="{name: 'projects'}">Projects</router-link>
      <router-link :to="{name: 'contact'}">Contact</router-link>
    </div>

    <div class="projects">
      <card v-for="details in cards" v-bind:key="details.title" :details="details"/>
    </div>

    <div class="contact">
      <span>Ready to talk? <a href="mailto:hello@tregan.me">Say Hello</a></span>
    </div>
  </div>
</template>

<script>
import Card from './Card';

// Load images for cards
import netlistImg from '../assets/netlist.png';
import hireboardImg from '../assets/hireboard.png';
import xacttoolsImg from '../assets/xacttools.png';

export default {
  data(){
    return {
      cards: [
        {
          title: 'Netlist',
          image: netlistImg,
          link: 'https://github.com/treemmett/netlist',
          description: 'Netlist is an app designed to help system administrators document and maintain servers and VM\'s. It keeps track of which location a server is in, the hardware installed, updates, and what services run on the server. It uses LDAP for authentication. Front end is built using React and Redux, back end is ran in Node.js and MongoDB.',
          badges: [
            'ReactJS',
            'Redux',
            'Sass',
            'Node.js',
            'MongoDB',
          ]
        },
        {
          title: 'New Hire Board',
          image: hireboardImg,
          link: 'https://github.com/treemmett/hireboard',
          description: 'This app is displayed on the main display in the dōTERRA Help Desk. It\'s designed to help the IT team keep track of their weekly new hires. It uses WebSockets to update the main display in real time when there is a change on the admin side.',
          badges: [
            'ReactJS',
            'WebSocket',
            'Redux',
            'Sass',
            'Node.js',
            'MongoDB',
          ]
        },
        {
          title: 'XactTools',
          image: xacttoolsImg,
          link: 'https://github.com/treemmett/xacttools',
          description: 'A WebExtension designed to Xactware help tech support agents on their calls. It features various tools to automatically query and make changes to customer accounts by tying into the XactAnalysis platform.',
          badges: [
            'HTML',
            'JavaScript',
            'WebExtension',
            'Electron'
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
    color: #555;
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
    margin-bottom: 5em;
  }

  .contact{
    text-align: center;
    margin-bottom: 5em;
    font-size: 20px;

    a{
      text-decoration: none;
      color: #59a5d8;

      &:hover{
        text-decoration: underline;
      }
    }
  }
</style>
