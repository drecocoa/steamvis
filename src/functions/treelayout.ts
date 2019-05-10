
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

interface Point{
    x:number,
    y:number
};

interface DrawStyle{
    r:number|((node:TreeNode,depth:number)=>number);
    dr:number|((depth:number)=>number);
    offset:Point;
    lineColor:string|((depth:number)=>string);
    fillColor:string|((node:TreeNode,depth:number)=>string);
    lineStyle:"stright"|"curve"
    beginAngle:number
    endAngle:number

    __depthr__:any
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
        const shift = vil.x+sil-(vir.x+sir)+distance;
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


export const TreeLayout = (root:TreeNode)=>{
    const wdistance:number=1;
    const hdistance:number=1;
    InitPass(root);
    FirstPass(root,wdistance);
    SecondPass(root,0,0,hdistance);
    CleanPass(root);
}


const RoundMap = (org:Point,maxx:Point,style:DrawStyle)=>{
    const angle = (style.endAngle-style.beginAngle)*org.x/(maxx.x+1)+style.beginAngle;
    
    let radius:number=1;
    if(typeof style.dr ==="number"){
        radius = style.dr;
    }else{
        //todo better solution
        const depth =(org.y/maxx.y);
        if(style.__depthr__.last===undefined){
            style.__depthr__.last = 0;
        }
        if(style.__depthr__[depth]){
            radius = style.__depthr__[depth];
        }else{
            radius = style.__depthr__.last+style.dr(depth);
            style.__depthr__[depth]=radius;
            style.__depthr__.last=radius;
        }
    }


    return { x: Math.sin(angle)*radius,y:Math.cos(angle)*radius};
    //return {x:org.x,y:org.y};
}

const CreateNodeDOM = (node:TreeNode,maxx:Point,style:DrawStyle)=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    const d=(node.y/maxx.y);
    if(typeof style.r ==="number"){
        circle.setAttribute("r",style.r.toString());
    }else{
        circle.setAttribute("r",style.r(node,d).toString());
    }
    const a = RoundMap(node,maxx,style);
    circle.setAttribute("cx",(a.x+style.offset.x).toString());
    circle.setAttribute("cy",(a.y+style.offset.y).toString());
    if(typeof style.fillColor ==="string"){
        circle.setAttribute("fill",style.fillColor);
    }else{
        circle.setAttribute("fill",style.fillColor(node,d));
    }
    return circle;
}

const GetMaxXY = (node:TreeNode):Point=>{
    if(node.children.length==0)return {x:node.x,y:node.y};
    const obj =node.children.map(d=>GetMaxXY(d)).reduce((a,b)=>({x:Math.max(a.x,b.x),y:Math.max(a.y,b.y)}));
    return {x:Math.max(node.x,obj.x),y:obj.y};
}


const DrawLink = (from:Point,to:Point,depth:number,style:DrawStyle)=>{
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
        l.setAttribute("stroke",style.lineColor(depth));
    }
    return l;
}

const DrawTreeInner = (parent:SVGElement,node:TreeNode,style:DrawStyle,maxx:Point={x:-1,y:-1})=>{
    if(maxx.x==-1){
        maxx = GetMaxXY(node);
        console.log(maxx);
    }
    for(let c of node.children){
        parent.appendChild(DrawLink(RoundMap(node,maxx,style),RoundMap(c,maxx,style),c.y/maxx.y,style));
        DrawTreeInner(parent,c,style,maxx);
    }
    parent.appendChild(CreateNodeDOM(node,maxx,style));
}

export const DrawTree = (parent:SVGElement,node:TreeNode,style:{
    r?:number|((node:TreeNode,depth:number)=>number),
    dr?:number,
    offset?:Point,
    lineColor?:string|((depth:number)=>string),
    fillColor?:string|((node:TreeNode,depth:number)=>string),
    lineStyle?:"stright"|"curve"
    beginAngle?:number
    endAngle?:number
    }={})=>{
    //todo move out?
    const st:DrawStyle = {
        r:(node:TreeNode,d:number)=>{
            return 6*(1-d)+5;
        },
        dr:(d:number)=>{
            return d==0?1:90*d;
        },
        offset:{x:300,y:300},
        lineColor:(d:number)=>{
            const c1 = Math.floor((d*0.6+0.25)*255).toString(16);
            const c2 = Math.floor((d*0.4+0.1)*255).toString(16);
            return `#${c1}${c1}${c2}`;
        },
        fillColor:(node:TreeNode,d:number)=>{
            const c1 = Math.floor((d*0.5+0.25)*255).toString(16);
            const c2 = Math.floor((d*0.4+0.1)*255).toString(16);
            return `#${c1}${c2}${c1}`;
        },
        lineStyle:"curve",
        beginAngle:0,
        endAngle:Math.PI*2,
        __depthr__:{}
    }
    if(style.r)st.r = style.r;
    if(style.dr)st.dr = style.dr;
    if(style.offset)st.offset = style.offset;
    if(style.lineColor)st.lineColor = style.lineColor;
    if(style.fillColor)st.fillColor = style.fillColor;
    if(style.lineStyle)st.lineStyle = style.lineStyle;
    if(style.beginAngle)st.beginAngle = style.beginAngle;
    if(style.endAngle)st.endAngle = style.endAngle;

    DrawTreeInner(parent,node,st);
}