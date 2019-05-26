<template>
  <div class="hello">
    <svg ref="canvas" width="600" height="600" />
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue,Watch } from 'vue-property-decorator';
import { DrawTree,TreeNode,TreeLayout } from '@/functions/treelayout'

@Component
export default class TreeView extends Vue {
    // private selectedData : GameData[] = GameDB;
    // private svg = (this.$refs.canvas as SVGElement);
    private data = {
        x:0,
        y:0,
        children:[
            {
                x:0,
                y:0,
                children:[
                    {
                        x:0,
                        y:0,
                        children:[{x:0,y:0,children:[]},{x:0,y:0,children:[]},{x:0,y:0,children:[]},{x:0,y:0,children:[]}]
                    }
                ]
            },
            {
                x:0,
                y:0,
                children:[{x:0,y:0,children:[{x:0,y:0,children:[]},{x:0,y:0,children:[]}]},{x:0,y:0,children:[{x:0,y:0,children:[]}]}]
            }
        ] as TreeNode[],
    }
    mounted(){
        TreeLayout(this.data);
        DrawTree(this.$refs.canvas as SVGElement,this.data);
        
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
