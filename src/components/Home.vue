<template>
  <div class="page">
    <nav>
      <a href="#projects" v-smooth-scroll>Projects</a>
      <a href="#contact" v-smooth-scroll>Contact</a>
    </nav>

    <header>
      <h1>I'm Tregan Emmett, a full-stack web developer based in Salt Lake City, Utah.</h1>
      <a :href="resume" target="_blank" rel="noopener noreferrer">Download Resume</a>
    </header>

    <div id="projects">
      <card v-for="details in cards" v-bind:key="details.title" :details="details"/>
    </div>

    <div id="contact">
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

// Resume link
import resume from '../assets/resume.pdf';

export default {
  data(){
    return {
      resume,
      cards: [
        {
          title: 'Netlist',
          image: netlistImg,
          link: 'https://github.com/treemmett/netlist',
          description: 'Netlist is an app designed to help system administrators document and maintain servers and VM\'s. It keeps track of which location a server is in, the hardware installed, updates, and what services run on the server. It uses LDAP for authentication. Front end is built using React and Redux, back end is ran in Node.js and MongoDB.',
          badges: [
            'ReactJS',
            'Vue.js',
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
          description: 'A WebExtension designed to help Xactware tech support agents on their calls. It features various tools to automatically query and make changes to customer accounts by tying into the XactAnalysis platform.',
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

  nav{
    display: flex;
    width: 100vw;
    font-family: sans-serif;
    z-index: 10;
    justify-content: flex-end;
    padding: 3em 0;
    box-sizing: border-box;
    font-size: 16px;

    a{
      text-decoration: none;
      color: #555;
      margin-right: 4em;
      font-size: 18px;
      transition: color 0.25s ease;
      font-family: 'Josefin Sans', 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-weight: 300;

      &:hover{
        color: $orange;
      }
    }
  }

  header{
    max-width: 60em;
    margin: 0 auto;
    padding: 0 2em;

    h1{
      font-size: 22px;
      max-width: 75%;
      margin: 0 0 1em 0;
      font-size: 36px;
      line-height: 60px;
      letter-spacing: 1px;

      @media screen and (max-width: 700px){
        max-width: 100%;
        font-size: 24px;
        line-height: 40px;
      }
    }

    a{
      text-decoration: none;
      border: 1px solid transparent;
      color: $orange;
      padding: 10px;
      border-radius: 1000px;
      transition: color 0.15s ease, background-color 0.15s ease;
      border-color: $orange;
      
      &:hover{
        background-color: $orange;
        color: #fff;
      }
    }
  }

  #projects{
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2em;
    margin: 0 auto;
    margin-bottom: 3em;
    max-width: 60em;
  }

  #contact{
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
