import { QuadTreeNode,QuadTreeTool,RectTool, Rect, Point } from './quadtree'


interface DrawStyle{
    r:number|((node:Node)=>number);
    offset:Point;
    lineColor:string|((from:Node,to:Node)=>string);
    fillColor:string|((node:Node)=>string);
    lineStyle:"line"|"curve"
    beginAngle:number
    endAngle:number

    __depthr__:any
}


interface Float2{
    x:number,
    y:number
};

export interface Node extends Float2{
    id:number;
    velocity:Float2;
}

export interface Graph{
    nodes: Node[];    
    edges: number[][];
}
export class GraphTool{

    static Create():Graph{
        return {
            nodes:[],    
            edges:[],
        }
    }
    static AddNode(g:Graph,node: Node): void {
        g.nodes.push(node);
        g.edges.forEach(d=>d.push(Infinity));
        g.edges.push(new Array<number>(g.nodes.length).fill(Infinity));
    }

    static AddEdge(g:Graph,from: number, to: number,weight:number=0): void {
        let fi = g.nodes.findIndex(d=>d.id==from);
        let ti = g.nodes.findIndex(d=>d.id==to);
        if(fi==-1||ti==-1)return;
        g.edges[fi][ti]=weight;
        g.edges[ti][fi]=weight;
    }

}

const Distance = (a:Float2,b:Float2):number=>{
    return Math.sqrt((b.x-a.x)*(b.x-a.x)+(b.y-a.y)*(b.y-a.y));
}


const DistanceP = (a:Float2,b:Float2):number=>{
    return Math.sqrt((b.x-a.x)*(b.x-a.x)+(b.y-a.y)*(b.y-a.y));
}

const CalForce = (root:QuadTreeNode,from:Float2,force:Float2,fg:number,theta:number)=>{
    var dis = Distance(root.mass,from);
    if(dis==0)return;
    // console.log(((root.rect.xMax-root.rect.xMin)/dis));
    if(root.northEast===undefined||((root.rect.xMax-root.rect.xMin)/dis <=theta)){
        if(root.count==0){
            return;
        };
        //let dis3 = dis*dis*dis;
        force.x +=  fg*(root.mass.x-from.x)*root.count/dis/dis/dis;
        force.y +=  fg*(root.mass.y-from.y)*root.count/dis/dis/dis;
        //if(root.count>2)
        //    console.log(root.count)
    }else{
        CalForce(root.northEast!,from,force,fg,theta);
        CalForce(root.northWest!,from,force,fg,theta);
        CalForce(root.southEast!,from,force,fg,theta);
        CalForce(root.southWest!,from,force,fg,theta);
    }
}

export const UpdateLayout = (g:Graph,r:Rect,passNode:any,fg:number,k:number,b:number,theta:number,dT:number=1):void=>{
    let q:QuadTreeNode = QuadTreeTool.Create(r,1);
    //construct quadtree
    g.nodes.forEach(n=>QuadTreeTool.Insert(q,n));
    QuadTreeTool.CalculateMass(q);
    // console.log(q);
    g.nodes.forEach((n,i)=>{
        if(passNode==n)return;
        let f = {x:0,y:0};
        //calculate spring forces
        g.edges[i].forEach((s,j)=>{
            if(s==Infinity)return;
            if(i==j)return;
            let n2 = g.nodes[j];
            let d = Distance(n,n2);
            if(d==0)return;
            f.x -= k*(s/d-1)*(n2.x-n.x);
            f.y -= k*(s/d-1)*(n2.y-n.y);
        });
        //calculate air resistance
        f.x += -n.velocity.x*b;
        f.y += -n.velocity.y*b;
        //calculate charged particles
        CalForce(q,n,f,fg,theta);
        n.x+=dT*n.velocity.x;
        n.y+=dT*n.velocity.y;
        n.velocity.x+=dT*f.x;
        n.velocity.y+=dT*f.y;
    })
    
}
const CreateNodeDOM = (node:Node,style:DrawStyle)=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    if(typeof style.r ==="number"){
        circle.setAttribute("r",style.r.toString());
    }else{
        circle.setAttribute("r",style.r(node).toString());
    }
    circle.setAttribute("cx",(style.offset.x).toString());
    circle.setAttribute("cy",(style.offset.y).toString());
    if(typeof style.fillColor ==="string"){
        circle.setAttribute("fill",style.fillColor);
    }else{
        circle.setAttribute("fill",style.fillColor(node));
    }
    circle.dataset.id = node.id.toString();
    return circle;
}

const UpdateLink = (l:SVGPathElement,from:Node,to:Node,style:DrawStyle)=>{
    const offset = style.offset;
    if(style.lineStyle=="curve"){
        const centery = (from.y+to.y)/2+offset.y;
        l.setAttribute("d",`M${from.x+offset.x} ${from.y+offset.y} C ${from.x+offset.x} ${centery}, ${to.x+offset.x} ${centery}, ${to.x+offset.x} ${to.y+offset.y} `);
    }else{
        l.setAttribute("d",`M${from.x+offset.x} ${from.y+offset.y} L ${to.x+offset.x} ${to.y+offset.y} `);
    }
}

const CreateLink = (from:Node,to:Node,style:DrawStyle)=>{
    const l = document.createElementNS("http://www.w3.org/2000/svg","path");
    const offset = style.offset;
    if(style.lineStyle=="curve"){
        const centery = (from.y+to.y)/2+offset.y;
        l.setAttribute("d",`M${from.x+offset.x} ${from.y+offset.y} C ${from.x+offset.x} ${centery}, ${to.x+offset.x} ${centery}, ${to.x+offset.x} ${to.y+offset.y} `);
    }else{
        l.setAttribute("d",`M${from.x+offset.x} ${from.y+offset.y} L ${to.x+offset.x} ${to.y+offset.y} `);
    }
    l.setAttribute("fill","transparent");
    
    if(typeof style.lineColor ==="string"){
        l.setAttribute("stroke",style.lineColor);
    }else{
        l.setAttribute("stroke",style.lineColor(from,to));
    }
    return l;
}

export class ForceLayout{
    st:DrawStyle = {
        r:5,
        offset:{x:300,y:300},
        lineColor:"#b0bec5",
        fillColor: (n)=>{
            const a = ["#ff8a80","#ff80ab","#ea80fc","#b388ff","#8c9eff","#82b1ff","#80d8ff","#84ffff","#a7ffeb","#b9f6ca","#ccff90","#f4ff81","#ffff8d","#ffe57f","#ffd180","#ff9e80"];
            return a[n.id%a.length];
        },
        lineStyle:"line",
        beginAngle:0,
        endAngle:Math.PI*2,
        __depthr__:{}
    }

    previousTime = 0;
    bindEle:any = {};
    bindLine:any = {};
    g:Graph;
    parent:SVGElement;
    r:Rect;
    bx =0;
    by =0;
    fg:number;
    k:number;
    b:number;
    theta:number;
    dT:number=1;
    currentTarget:any = null;
    constructor(parent:SVGElement,g:Graph,r:Rect,fg:number,k:number,b:number,theta:number,dT:number=1){
        this.g = g;
        this.parent = parent;
        this.r = r;
        this.fg = fg;
        this.k = k;
        this.b = b;
        this.theta = theta;
        this.rebuild();
        parent.addEventListener("mousedown",this.listener);
        parent.addEventListener("mousemove",this.listener);
        parent.addEventListener("mouseup",this.listener);
        this.animationFrame(0.1);
    }
    Bind(){

    }

    rebuild = ()=>{
        this.parent.innerHTML = "";
        this.g.edges.forEach((n,i)=>{
            n.forEach((v,j)=>{
                if(v==Infinity)return;
                if(i>=j)return;
                this.bindLine[i+"."+j]=CreateLink(this.g.nodes[i],this.g.nodes[j],this.st);
                this.parent.appendChild(this.bindLine[i+"."+j]);
            })
        });
        this.g.nodes.forEach(n=>{
            this.bindEle[n.id]=CreateNodeDOM(n,this.st);
            this.parent.appendChild(this.bindEle[n.id]);
        })
    }
    listener = (ev:MouseEvent)=>{
        
        switch(ev.type){
            case 'mousedown':
                if(ev.target==null)break;
                const c = ev.target as HTMLElement;
                if(c.dataset.id===undefined)break;
                let id = parseInt(c.dataset.id);
                const n = this.g.nodes.find(d=>d.id==id);
                if(n===undefined)break;
                this.currentTarget = n;
                this.bx = ev.offsetX;
                this.by = ev.offsetY;
                break;
            case 'mousemove':
                if(this.currentTarget!=null){
                    const n = this.currentTarget as Node;
                    n.x += ev.offsetX-this.bx;
                    n.y += ev.offsetY-this.by;
                    n.velocity.x =0;
                    n.velocity.y =0;
                    this.bx = ev.offsetX;
                    this.by = ev.offsetY;
                    // c.setAttribute("transform",`translate(${n.x.toFixed(6)} ${n.y.toFixed(6)})`)
                }
                break;
            case 'mouseup':
                if(this.currentTarget!=null){
                    const n = this.currentTarget as Node;
                    n.velocity.x =0;
                    n.velocity.y =0;
                    this.currentTarget = null;
                }
                break;
        }
    }

    frameCount = 0;
    animationFrame = (time:number):void=>{
        const deltaTime = time-this.previousTime;
        this.frameCount++;
        // if(this.frameCount%100==0){
        //     console.time("layout");
        // }else if(this.frameCount%100==99){
        //     console.timeEnd("layout");
        // }
        UpdateLayout(this.g,this.r,this.currentTarget,this.fg,this.k,this.b,this.theta,this.dT);
        this.g.nodes.forEach(n=>{
            const c = this.bindEle[n.id];
            c.setAttribute("transform",`translate(${n.x.toFixed(6)} ${n.y.toFixed(6)})`)
        })
        this.g.edges.forEach((n,i)=>{
            n.forEach((v,j)=>{
                if(v==Infinity)return;
                if(i>=j)return;
                UpdateLink(this.bindLine[i+"."+j],this.g.nodes[i],this.g.nodes[j],this.st);
            })
        })
        this.previousTime = time;
        window.requestAnimationFrame(this.animationFrame);
    }


}