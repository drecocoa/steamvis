<template>
  <div class="home">
    <ForceView/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ForceView from '@/components/ForceView.vue'; // @ is an alias to /src

@Component({
  components: {
    ForceView,
  },
})
export default class Force extends Vue {}
</script>
