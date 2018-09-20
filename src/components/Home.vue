<template>
  <div class="page">
    <div class="nav">
      <router-link :to="{name: 'projects'}">Projects</router-link>
      <router-link :to="{name: 'contact'}">Contact</router-link>
    </div>
  </div>
</template>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Josefin+Sans:300');
  $orange: #ffb224;

  body{
    margin: 0;
  }

  .nav{
    display: flex;
    width: 100vw;
    font-family: sans-serif;
    z-index: 10;
    justify-content: flex-end;
    padding-top: 3em;
    box-sizing: border-box;

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
</style>
