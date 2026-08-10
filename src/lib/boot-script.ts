/**
 * The one blocking script on the page. It runs before first paint and settles
 * embed mode, which nothing else can settle in time.
 *
 * App Router layouts can't read searchParams, and a host page must never see a
 * frame of full-site chrome appear and then vanish inside its own header. So
 * `?embed=1` and `?nav=0` are read here and parked on <html> as data attributes
 * that globals.css keys off.
 *
 * Kept as a hand-minified string because it ships inline on every request.
 */
export const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,q=new URLSearchParams(location.search),g=function(k){return q.get(k)};
if(g('embed')==='1'||g('embed')==='true')d.setAttribute('data-embed','1');
if(g('nav')==='0')d.setAttribute('data-nav','0');
}catch(e){}})();`;
