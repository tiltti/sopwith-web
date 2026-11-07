// Original UI layout helpers. GPL-2.0-or-later.
(() => {
  function quadMatrix(width,height,points){
    const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=points;
    const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3;
    const dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
    const g=Math.abs(den)<1e-9?0:(dx3*dy2-dx2*dy3)/den,h=Math.abs(den)<1e-9?0:(dx1*dy3-dx3*dy1)/den;
    return [(x1-x0+g*x1)/width,(y1-y0+g*y1)/width,0,g/width,(x3-x0+h*x3)/height,(y3-y0+h*y3)/height,0,h/height,0,0,1,0,x0,y0,0,1];
  }
  function scoreScale(current,available,content){return content<=available+1?current:Math.max(.6,Math.min(current,current*available/content*.98));}
  window.PatrolLayout={quadMatrix,scoreScale};
})();
