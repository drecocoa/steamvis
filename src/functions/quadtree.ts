export interface Point{
    x:number,
    y:number
};


export interface Rect{
    // cent
    xMin:number,
    yMin:number,
    xMax:number,
    yMax:number,

}


export class RectTool{
    
    static Create(xMin:number,yMin:number,xMax:number,yMax:number):Rect{
        return {xMin:xMin,yMin:yMin,xMax:xMax,yMax:yMax};
    }

    static Center(r:Rect):Point{
        return {x:(r.xMax+r.xMin)/2,y:(r.xMax+r.xMin)/2};
    }


    static Size(r:Rect):number{
        return (r.xMax-r.xMin)*(r.yMax-r.yMin);
    }
    static Contains(r:Rect,p:Point):boolean{
        return p.x>=r.xMin&&p.x<r.xMax&&p.y>=r.yMin&&p.y<r.yMax;
    }

    //  nW  nE
    //  sW  sE
    static Divide(r:Rect):{nW:Rect,nE:Rect,sW:Rect,sE:Rect}{
        let halfX = (r.xMax-r.xMin)/2;
        let halfY = (r.yMax-r.yMin)/2;
        let nW = Object.assign({},r);
        let nE = Object.assign({},r);
        let sW = Object.assign({},r);
        let sE = Object.assign({},r);
        nW.yMax-=halfY;
        nW.xMax-=halfX;

        nE.xMin+=halfX;
        nE.yMax-=halfY;

        sW.xMax-=halfX;
        sW.yMin+=halfY;

        sE.xMin+=halfX;
        sE.yMin+=halfY;

        return {nW:nW,nE:nE,sW:sW,sE:sE};
    }

    static Intersects(a:Rect,b:Rect):boolean{
        let xMin = Math.max(a.xMin,b.xMin);
        let yMin = Math.max(a.yMin,b.yMin);
        let xMax = Math.min(a.xMax,b.xMax);
        let yMax = Math.min(a.yMax,b.yMax);
        return xMin<xMax&&yMin<yMax;
    }
}



export interface QuadTreeNode{
    capacity:number;
    rect:Rect;
    points:Point[];

    mass:Point;
    count:number;

    northWest?:QuadTreeNode;
    northEast?:QuadTreeNode;
    southWest?:QuadTreeNode;
    southEast?:QuadTreeNode;
}


export class QuadTreeTool{

    static Create(r:Rect,capacity:number):QuadTreeNode{
        return {
            capacity:capacity,
            rect:r,
            points:[],
            mass:RectTool.Center(r),
            count:0
        };
    }

    static CalculateMass(root:QuadTreeNode){
        if(root.count==0)return;
        if( root.northEast===undefined||
            root.northWest===undefined||
            root.southEast===undefined||
            root.southWest===undefined){
            root.mass = {x:0,y:0};
            root.points.forEach(p=>{
                root.mass.x += p.x;
                root.mass.y += p.y;
            })
            root.mass.x /= root.count;
            root.mass.y /= root.count;
            return;
        }
        QuadTreeTool.CalculateMass(root.northEast);
        QuadTreeTool.CalculateMass(root.northWest);
        QuadTreeTool.CalculateMass(root.southEast);
        QuadTreeTool.CalculateMass(root.southWest);
        root.mass = {x:0,y:0};
        root.points.forEach(p=>{
            root.mass.x += p.x;
            root.mass.y += p.y;
        })
        if(root.northEast.count!=0){
            root.mass.x += root.northEast.mass.x*root.northEast.count;
            root.mass.y += root.northEast.mass.y*root.northEast.count;
        }
        if(root.northWest.count!=0){
            root.mass.x += root.northWest.mass.x*root.northWest.count;
            root.mass.y += root.northWest.mass.y*root.northWest.count;
        }
        if(root.southEast.count!=0){
            root.mass.x += root.southEast.mass.x*root.southEast.count;
            root.mass.y += root.southEast.mass.y*root.southEast.count;
        }
        if(root.southWest.count!=0){
            root.mass.x += root.southWest.mass.x*root.southWest.count;
            root.mass.y += root.southWest.mass.y*root.southWest.count;
        }
        root.mass.x/=root.count;
        root.mass.y/=root.count;
        return;
    }

    static Insert(root:QuadTreeNode,p:Point):boolean{
        if(!RectTool.Contains(root.rect,p)){
            return false;
        }
        if(root.points===undefined){
            root.points = [];
        }
        root.count++;
        if(root.northEast===undefined&&root.points.length<root.capacity){
            root.points.push(p);
            return true;
        }

        if( root.northEast===undefined||
            root.northWest===undefined||
            root.southEast===undefined||
            root.southWest===undefined)
        {
            let d = RectTool.Divide(root.rect);
            root.northEast = QuadTreeTool.Create(d.nE,root.capacity);
            root.northWest = QuadTreeTool.Create(d.nW,root.capacity);
            root.southEast = QuadTreeTool.Create(d.sE,root.capacity);
            root.southWest = QuadTreeTool.Create(d.sW,root.capacity);
            root.points.forEach(p=>{
                if(QuadTreeTool.Insert(root.northEast!,p))return;
                if(QuadTreeTool.Insert(root.northWest!,p))return;
                if(QuadTreeTool.Insert(root.southEast!,p))return;
                (QuadTreeTool.Insert(root.southWest!,p));
            });
            root.points=[];
        }
        if(QuadTreeTool.Insert(root.northEast,p))return true;
        if(QuadTreeTool.Insert(root.northWest,p))return true;
        if(QuadTreeTool.Insert(root.southEast,p))return true;
        return (QuadTreeTool.Insert(root.southWest,p));
    }
}

