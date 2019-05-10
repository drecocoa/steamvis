<template>
  <div class="home">
    <TreeView/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TreeView from '@/components/TreeView.vue'; // @ is an alias to /src

@Component({
  components: {
    TreeView,
  },
})
export default class Tree extends Vue {}
</script>
