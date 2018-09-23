<template>
  <div class="card">
    <h2>Netlist</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ornare elit elit. Phasellus vehicula mi posuere purus laoreet tempor. Quisque quis justo ac massa luctus euismod at ac urna. Cras non sollicitudin augue. Nam commodo condimentum sem eget porttitor. Ut eu porta mi, quis porta massa. Aliquam tellus nisl, vehicula ac est a, auctor feugiat ex. Nunc pharetra ut nulla laoreet suscipit. Vestibulum eleifend tincidunt urna nec rhoncus.</p>
    <div class="badges">
      <div>HTML</div>
      <div>JS</div>
      <div>ReactJS</div>
      <div>Redux</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  $blue: #3c6997;
  $orange: #ffb224;

  .card{
    width: 100%;
    min-height: 9em;
    border-radius: 5px;
    padding: 2rem;
    box-sizing: border-box;
    box-shadow: 0 1px 4px 0px rgba(#000, 0.2);
    font-size: 16px;
    margin-bottom: 2em;
  }

  h2{
    font-size: 22px;
    font-weight: 400;
    color: $blue;
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
