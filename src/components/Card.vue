<template>
  <div class="card">
    <div class="image" v-bind:style="{backgroundImage: `url(${details.image})`}"/>
    <div class="content">
      <h2>{{details.title}}</h2>
      <p>{{details.description}}</p>
      <a :href="details.link" target="_blank" rel="noopener noreferrer">View Source</a>
      <div class="badges">
        <div v-for="item in details.badges" v-bind:key="item">{{item}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['details'],
  computed: {
    style(){
      return `background-image: ${details.image}`
    }
  }
}
</script>


<style lang="scss" scoped>
  $blue: #427698;
  $orange: #ffb224;

  .card{
    position: relative;
    width: 100%;
    min-height: 10em;
    border-radius: 5px;
    box-sizing: border-box;
    box-shadow: 0 1px 4px 0px rgba(#000, 0.2);
    font-size: 16px;
    margin-bottom: 2em;
    max-width: 60em;
    overflow: hidden;
  }

  .image{
    position: absolute;
    width: 250px;
    height: 100%;
    filter: brightness(98%);
    clip-path: polygon(0% 0%, 175px 0%, 250px 135px, 0 600px);
    height: 100%;
    background-repeat: no-repeat;
    background-size: auto 100%;
  }

  .content{
    padding: 2em;
    margin-left: 250px;
  }

  h2{
    font-size: 22px;
    font-weight: 400;
    color: $blue;
    margin-top: 0;
    margin-bottom: 2rem;
  }

  p{
    margin-bottom: 1.5rem;
    font-size: 14px;
    font-weight: 300;
  }

  a{
    display: inline-block;
    text-decoration: none;
    color: $blue;
    margin-bottom: 1em;
    border-radius: 5px;

    &:hover{
      text-decoration: underline;
    }
  }

  .badges div{
    display: inline-block;
    border: 1px solid $orange;
    font-weight: 300;
    font-size: 12px;
    padding: 5px 6px;
    margin-right: 6px;
    border-radius: 3px;
  }
</style>
