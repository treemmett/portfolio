<template>
  <div class="card">
    <div class="image">
      <img src="https://picsum.photos/960/540"/>
    </div>
    <div class="content">
      <h2>{{details.title}}</h2>
      <p>{{details.description}}</p>
      <div class="badges">
        <div v-for="item in details.badges" v-bind:key="item">{{item}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['details']
}
</script>


<style lang="scss" scoped>
  $blue: #3c6997;
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
    width: 100%;
    height: 100%;
    opacity: 0.85;
    clip-path: polygon(0% 0%, 175px 0%, 250px 135px, 0 600px);

    img{
      position: absolute;
      left: 0;
    }
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
    margin-bottom: 2rem;
    font-size: 14px;
    font-weight: 300;
  }

  .badges div{
    display: inline-block;
    border: 1px solid $orange;
    font-weight: 300;
    font-size: 12px;
    padding: 4px 6px;
    margin-right: 4px;
    border-radius: 3px;
  }
</style>
