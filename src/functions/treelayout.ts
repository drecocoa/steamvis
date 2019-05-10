
export interface TreeNode{
    children:TreeNode[]
    x:number
    y:number
    __layout__?:TreeNodeLayout
}

interface TreeNodeLayout{
    left?:TreeNode
    leftMost:TreeNode
    thread?:TreeNode
    ancestor:TreeNode
    parent?:TreeNode
    sibling:number
    mod:number
    change:number
    shift:number
}

const InitPass = (v:TreeNode)=>{
    if(v.__layout__){

    }else{
        v.__layout__ = {
            sibling:1,
            mod:0,
            change:0,
            shift:0,
            leftMost:v,
            ancestor:v
        };
    }
    if(v.children.length==0)return;
    let first:TreeNode = v.children[0];
    let left:TreeNode = v.children[0];
    let i=1;
    for(let c of v.children){
        c.__layout__ = {
            mod:0,
            change:0,
            shift:0,
            leftMost:first,
            ancestor:c,
            parent:v,
            sibling:i++
        }
        InitPass(c);
        if(first===c)continue;
        c.__layout__.left = left;
        left = c; 
    }
}

const CleanPass = (v:TreeNode)=>{
    delete v.__layout__;
    for(let c of v.children){
        CleanPass(c);
    }
}

const SecondPass = (v:TreeNode,m:number=0,depth:number=0,wdistance:number)=>{
    v.x+= m;
    v.y = depth*wdistance;
    if(!v.__layout__)return;
    for(let c of v.children){
        SecondPass(c,m+(v.__layout__.mod),depth+1,wdistance);
    }
}

const FirstPass = (v:TreeNode, distance:number)=>{
    if(!v.__layout__)return;
    if(v.children.length==0){ //no child , leaf
        if(v.__layout__.left){ //has left sibling
            v.x = v.__layout__.left.x+distance; //□+__distance__=■
        }else{ //left most leaf
            v.x=0; //■
        }
    }else{
        let defaultAncestor = v.children[0];
        for(let w of v.children){
            FirstPass(w,distance); // process child
            defaultAncestor = Apportion(w,defaultAncestor,distance);
        }
        Shift(v);
        const midpoint = (v.children[0].x+v.children[v.children.length-1].x)/2;
        if (v.__layout__.left){
            v.x = v.__layout__.left.x + distance;
            v.__layout__.mod = v.x-midpoint;
        }else{
            v.x = midpoint;
        }
    }
}

const Apportion = (v:TreeNode,ancestor:TreeNode,distance:number):TreeNode =>{
    if(!v.__layout__)return ancestor;
    if(!v.__layout__.left)return ancestor;
    let w = v.__layout__.left;
    let vir =v,vor = v;
    let vil = w;
    let vol = v.__layout__.leftMost;
    let sir = ForceGetL(vir).mod;
    let sor = ForceGetL(vor).mod;
    let sil = ForceGetL(vil).mod;
    let sol = ForceGetL(vol).mod;
    while(NextRight(vil) && NextLeft(vir)){
        vil = NextRight(vil) as TreeNode;
        vir = NextLeft(vir) as TreeNode;

        //todo!!! crash?
        vol = NextLeft(vol) as TreeNode;
        vor = NextRight(vor) as TreeNode;
        ForceGetL(vor).ancestor = v;
        let shift = vil.x+sil-(vir.x+sir)+distance;
        if(shift>0){
            MoveSubTree(Ancestor(vil,v,ancestor),v,shift);
            sir += shift;
            sor += shift;
        }
        sil += ForceGetL(vil).mod
        sir += ForceGetL(vir).mod
        sol += ForceGetL(vol).mod
        sor += ForceGetL(vor).mod
    }
    if(NextRight(vil) &&! NextRight(vor)){
        ForceGetL(vor).thread = NextRight(vil);
        ForceGetL(vor).mod += sil-sor;
    }else{
        if(NextLeft(vir) &&! NextLeft(vol)){
            ForceGetL(vol).thread = NextLeft(vir);
            ForceGetL(vol).mod = sir - sol;
        }
        ancestor = v;
    }
    return ancestor;
}

//todo => type check function (User-Defined Type Guards)
const ForceGetL = (v:TreeNode)=>v.__layout__ as TreeNodeLayout;

const NextLeft =(v:TreeNode)=>{
    if(v.children.length>0){
        return v.children[0];
    }else if(ForceGetL(v).thread){
        return ForceGetL(v).thread;
    }else{
        return undefined;
    }
}

const NextRight =(v:TreeNode)=>{
    if(v.children.length>0){
        return v.children[v.children.length-1];
    }else if(ForceGetL(v).thread){
        return ForceGetL(v).thread;
    }else{
        return undefined;
    }
}

const Ancestor = (vil:TreeNode,v:TreeNode,defaultAncestor:TreeNode)=>{
    if(ForceGetL(v).parent&& (ForceGetL(v).parent as TreeNode).children.indexOf(ForceGetL(vil).ancestor)!=-1){
        return ForceGetL(vil).ancestor;
    }else {
        return defaultAncestor;
    }
}

const MoveSubTree = (wl:TreeNode,wr:TreeNode,shift:number)=>{
    const lwr = ForceGetL(wr);
    const lwl = ForceGetL(wl);
    let subTrees = lwr.sibling-lwl.sibling;
    lwr.change -= shift/subTrees;
    lwr.shift += shift;
    lwl.change += shift/subTrees;
    wr.x += shift;
    lwr.mod += shift;
}


const Shift = (v:TreeNode)=>{
    let shift=0,change = 0;
    for(let i=v.children.length-1;i>=0;--i){
        let w = v.children[i];
        w.x+=shift;
        const layout = (w.__layout__ as TreeNodeLayout);
        layout.mod +=shift;
        change+=layout.change;
        shift+=layout.shift+change;
    }
}



export const TreeLayout = (root:TreeNode,wdistance:number=15,hdistance:number=15)=>{
    InitPass(root);
    console.log(root);
    FirstPass(root,wdistance);
    SecondPass(root,0,0,hdistance);
    console.log(root);
    //CleanPass(root);
}

const RoundMap = (org:{x:number,y:number},maxx:number,radius:number,beginAngle:number=0,endAngle:number=2*Math.PI)=>{
    const angle = (endAngle-beginAngle)*org.x/(maxx+1)+beginAngle;
    return { x: Math.sin(angle)*radius*org.y,y:Math.cos(angle)*radius*org.y };

}

const CreateNodeDOM = (node:TreeNode,maxx:number,r:number,dr:number,center:{x:number,y:number}={x:300,y:300})=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("r",r.toString());
    let a = RoundMap(node,maxx,dr);
    circle.setAttribute("cx",(a.x+center.x).toString());
    circle.setAttribute("cy",(a.y+center.y).toString());
    return circle;
}

const GetMaxX = (node:TreeNode):number=>{
    if(node.children.length==0)return node.x;
    return Math.max(node.x,node.children.map(d=>GetMaxX(d)).reduce((a,b)=>Math.max(a,b)) as number);
}

const DrawLine = (from:{x:number,y:number},to:{x:number,y:number},offset:{x:number,y:number}={x:300,y:300})=>{
    const l = document.createElementNS("http://www.w3.org/2000/svg","path");
    l.setAttribute("d",`M${from.x+offset.x} ${from.y+offset.y} L ${to.x+offset.x} ${to.y+offset.y} `);
    l.setAttribute("stroke","black");
    return l;
}

export const DrawTree = (parent:SVGElement,node:TreeNode,maxx:number=-1,r:number=5,dr:number=5)=>{
    if(maxx==-1)maxx = GetMaxX(node);
    parent.appendChild(CreateNodeDOM(node,maxx,r,dr));
    if(!node.children)return;
    for(let c of node.children){
        parent.appendChild(DrawLine(RoundMap(node,maxx,dr),RoundMap(c,maxx,dr)));
        DrawTree(parent,c,maxx,r,dr);
    }

}