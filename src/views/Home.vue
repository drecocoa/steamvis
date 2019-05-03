<template>
  <div class="home">
    <SteamView/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import SteamView from '@/components/SteamView.vue'; // @ is an alias to /src

@Component({
  components: {
    SteamView,
  },
})
export default class Home extends Vue {}
</script>
