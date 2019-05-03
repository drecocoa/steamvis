<template>
  <div class="hello">
    <h1>{{ 123 }}</h1>
    <ui-textfield
        v-model="search">
        Search
    </ui-textfield>
    <h3>Max Display</h3>
    <ui-slider discrete v-model="maxCount" min="1" max="400" ></ui-slider>
    <h3>Order By</h3>
    <ui-chip-set choice v-model="orderValue">
        <ui-chip v-for="(item, index) in orderList"
            :key="index"
            class="demo-chip">
            <ui-chip-text>{{ item }}</ui-chip-text>
        </ui-chip>
    </ui-chip-set>
    <h3>Color By</h3>
    <ui-chip-set choice v-model="colorValue">
        <ui-chip v-for="(item, index) in colorList"
            :key="index"
            class="demo-chip">
            <ui-chip-text>{{ item }}</ui-chip-text>
        </ui-chip>
    </ui-chip-set>
    <h3>Filter By</h3>
    <ui-chip-set filter v-model="selectedValue">
        <ui-chip v-for="(item, index) in filterList"
            :key="index"
            class="demo-chip">
            <ui-chip-checkmark></ui-chip-checkmark>
            <ui-chip-text>{{ item }}</ui-chip-text>
        </ui-chip>
    </ui-chip-set>
    <ui-card v-if="selectedGame">
        <ui-card-content class="demo-card__primary-action" v-ripple>
            <div class="demo-card__music-row">
            <!-- <ui-card-media square class="demo-card__media demo-card__media--music"></ui-card-media> -->
            <div class="demo-card__music-info">
                <div class="demo-card__music-title" >{{selectedGame.name}}</div>
                <div class="demo-card__music-artist">Id:{{selectedGame.id}}</div>
                <div class="demo-card__music-year">Release:{{selectedGame.release}}</div>
                <div class="demo-card__music-year">Recommend:{{selectedGame.recommend}}</div>
                <div class="demo-card__music-year">Purchase:{{selectedGame.owner}}</div>

            </div>
            </div>
        </ui-card-content>
    </ui-card>
    <svg ref="canvas" width="600" height="600" />
  </div>
</template>

<script lang="ts">


import { Component, Prop, Vue,Watch } from 'vue-property-decorator';
import * as d3 from 'd3'

//data source https://data.world/craigkelly/steam-game-data
const db = require('@/assets/data/games_features');
const GameDB : GameData[] = db as GameData[];
class GameData
{
    id!:number;
    name!:string;
    release!:string;
    age!:number;
    critic!:number;
    recommend!:number;
    owner!:number;
    ownervariance!:number;
    player!:number;
    playervariance!:number;
    free!:boolean;
    single!:boolean;
    multi!:boolean;
    indie!:boolean;
}

@Component
export default class SteamView extends Vue {
    // private selectedData : GameData[] = GameDB;
    private selectedGame : any  = null;
    private orderList = ['id','id(desc)','recommend','recommend(desc)','owner','owner(desc)'];
    private orderValue = 3;
    private colorList = ['Random','Free', 'SinglePlayer', 'MultiPlayer', 'IndieGame'];
    private colorValue = 0;
    private filterList = ['Free', 'SinglePlayer', 'MultiPlayer', 'IndieGame'];
    private selectedValue:number[] =  [];
    private search : string = "";
    private maxCount : number = 200;
    private svg = d3.select(this.$refs.canvas as HTMLElement);
    private force = d3.forceSimulation()
        .force("collide",d3.forceCollide(((d:any)=>d.radius)))
        .force("center",d3.forceCenter(300,300))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0))
        .alphaTarget(1)
        .on("tick", this.tick);
    canvas : any;
    mounted(){
        console.log(GameDB);
        this.svg = d3.select(this.$refs.canvas as HTMLElement);
        this.rerender();
    }
    get selectedData () {
        let d = GameDB;
        if(this.orderValue==1){
            d = d.reverse();
        }else if(this.orderValue==2){
            d.sort((a,b)=>a.recommend-b.recommend);
        }else if(this.orderValue==3){
            d.sort((a,b)=>b.recommend-a.recommend);
        }else if(this.orderValue==4){
            d.sort((a,b)=>a.owner-b.owner);
        }else if(this.orderValue==5){
            d.sort((a,b)=>b.owner-a.owner);
        }
        if(this.selectedValue.indexOf(0)!=-1){
            d = d.filter(i=>i.free);
        }
        if(this.selectedValue.indexOf(1)!=-1){
            d = d.filter(i=>i.single);
        }
        if(this.selectedValue.indexOf(2)!=-1){
            d = d.filter(i=>i.multi);
        }
        if(this.selectedValue.indexOf(3)!=-1){
            d = d.filter(i=>i.indie);
        }
        if(this.search&&this.search.length>0){
            const st = this.search.toLowerCase();
            d = d.filter(i=>i.name.toLowerCase().indexOf(st)!=-1);
        }
        console.log(d.length);
        return d.slice(0,this.maxCount);
    }
    @Watch("colorValue")
    colorChanged(){
        this.rerender();
    }
    @Watch("selectedData")
    rerender(){
        let scaleByOwn = d3.scaleLinear()
        .domain([d3.min(this.selectedData,d=>d.owner) as number,d3.max(this.selectedData,d=>d.owner) as number])
        .range([4, 80]);
        var color = d3.scaleOrdinal(d3.schemeCategory10);
        //var nodes = d3.range(200).map(function() { return {radius: Math.random() * 12 + 4}; });
        var nodes = this.selectedData.map((d,i)=>{
            let c = (()=>{if(this.colorValue==1)
                    return d.free?"red":"blue";
                else if(this.colorValue==2)
                    return d.single?"red":"blue";
                else if(this.colorValue==3)
                    return d.multi?"red":"blue";
                else if(this.colorValue==4)
                    return d.indie?"red":"blue";
                return color((i % 10).toString());})();
            return ({...d,bind:i, radius: scaleByOwn(d.owner),color:c})
        });
        // console.log(nodes);
        
        // this.force.stop();
        //canvas = d3.select("svg");
    
        var tt = this.svg.selectAll("circle")
        .data(nodes,(d:any)=>d.id+","+d.color);
        tt.exit().transition()
        .attr("r", 0)
        .remove();
        tt.enter().append("circle")
        .attr("r", function(d) { return d.radius; })
        .style("fill", (d, i)=> 
            d.color
        )
        .on('click',this.click)
        .call((d3.drag()
        .on("start", this.dragstarted)
        .on("drag", this.dragged)
        .on("end", this.dragended)
        ) as any);
        
        this.force.nodes(nodes);
        this.force.alpha(1).restart();
    }

    click(obj:any){
        // console.log(obj);
        this.selectedGame = this.selectedData[obj.bind];
    }
    tick(){
        this.svg.selectAll("circle")
        .attr("cx", function(d:any) { return d.x; })
        .attr("cy", function(d:any) { return d.y; });
    }

    dragstarted(d:any) {
        if (!d3.event.active) this.force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    dragged(d:any) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    
    dragended(d:any) {
        if (!d3.event.active) this.force.alphaTarget(0);
        d.fx = null;
        d.fy = null;
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
