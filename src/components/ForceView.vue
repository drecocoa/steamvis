<template>
  <div class="forceview">
    <div class="ct-container">
        <p>g {{g.toFixed(4)}}</p>
        <ui-slider class="slider" v-model="g" min="-150" max="150" step="1"></ui-slider>
        <!-- <p>k {{k}}</p> -->
        <!-- <ui-slider class="slider" v-model="k" min="0" max="0.04" step="0.005"></ui-slider> -->
        <p>b {{b.toFixed(4)}}</p>
        <ui-slider class="slider" v-model="b" min="0" max="2" step="0.1"></ui-slider>
        <p>theta {{theta.toFixed(4)}}</p>
        <ui-slider class="slider" v-model="theta" min="0" max="4" step="0.1"></ui-slider>
    </div>
    <ui-button @click="addNode" icon="add_location"></ui-button>
    <ui-button @click="addEdge" icon="timeline"></ui-button>

    <div class="ff">
        <svg ref="canvas" class="canvas" viewBox="0 0 800 600" />
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue,Watch } from 'vue-property-decorator';
import { GraphTool,ForceLayout, Graph  } from '@/functions/forcelayout'
import { RectTool } from '../functions/quadtree';

@Component
export default class ForceView extends Vue {
    // private selectedData : GameData[] = GameDB;
    // private svg = (this.$refs.canvas as SVGElement);
    private data:Graph = GraphTool.Create();
    private forceLayout?:ForceLayout;
    k=0.005;
    b=0.1;
    g=-100;
    theta=1;
    mounted(){
        GraphTool.AddNode(this.data,{id:1,x:1,y:1,velocity:{x:0,y:0}});
        GraphTool.AddNode(this.data,{id:2,x:12,y:10,velocity:{x:0,y:0}});
        GraphTool.AddNode(this.data,{id:3,x:80,y:50,velocity:{x:0,y:0}});
        GraphTool.AddNode(this.data,{id:4,x:81,y:60,velocity:{x:0,y:0}});
        GraphTool.AddNode(this.data,{id:5,x:82,y:20,velocity:{x:0,y:0}});

        GraphTool.AddEdge(this.data,1,2,10);
        GraphTool.AddEdge(this.data,3,2,50);
        GraphTool.AddEdge(this.data,4,2,30);
        GraphTool.AddEdge(this.data,5,2,60);
        this.forceLayout = new ForceLayout(this.$refs.canvas as SVGElement,this.data,RectTool.Create(-300,-300,600,600),this.g,this.k,this.b,this.theta);
    }

    addNode(){
        GraphTool.AddNode(this.data,{id:this.data.nodes.length+1,x:Math.random()*200-100,y:Math.random()*200-100,velocity:{x:0,y:0}});
        if(this.forceLayout!==undefined)this.forceLayout.rebuild();
    }

    addEdge(){
        //todo a == b?
        GraphTool.AddEdge(this.data,Math.floor(Math.random()*this.data.nodes.length)+1,Math.floor(Math.random()*this.data.nodes.length)+1,Math.floor(Math.random()*101+1));
        if(this.forceLayout!==undefined)this.forceLayout.rebuild();
    }


    @Watch("k")
    onKChange(){
        if(this.forceLayout===undefined)return;
        this.forceLayout.k = this.k;
    }

    @Watch("b")
    onBChange(){
        if(this.forceLayout===undefined)return;
        this.forceLayout.b = this.b;
    }

    @Watch("g")
    onGChange(){
        if(this.forceLayout===undefined)return;
        this.forceLayout.fg = this.g;
    }

    @Watch("theta")
    onThetaChange(){
        if(this.forceLayout===undefined)return;
        this.forceLayout.theta = this.theta;
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.slider{
    // width:50%;
}
.ff{
    height:70vh;
}
.ct-container{
    // display: flex;
}
.canvas{
    max-width: 100%;
    max-height: 100%;
    //object-fit: contain;
}
</style>
