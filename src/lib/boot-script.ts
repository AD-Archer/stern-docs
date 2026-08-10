/**
 * The one blocking script on the page. It runs before first paint and settles
 * two things that would otherwise flash:
 *
 *  1. **Embed mode.** App Router layouts can't read searchParams, and the host
 *     page must never see a frame of full-site chrome appear and vanish inside
 *     its own header. So `?embed=1` and `?nav=0` are read here and parked on
 *     <html> as data attributes that globals.css keys off.
 *  2. **Appearance.** Resolved to an explicit `.light`/`.dark` class so nothing
 *     downstream has to care whether the choice came from the URL (`?theme=dark`
 *     — how a host pins the docs to its own theme), from localStorage, or from
 *     the OS.
 *
 * Kept as a hand-minified string because it ships inline on every request.
 */
export const THEME_STORAGE_KEY = "stern-docs:appearance";

export const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,q=new URLSearchParams(location.search),g=function(k){return q.get(k)};
if(g('embed')==='1'||g('embed')==='true')d.setAttribute('data-embed','1');
if(g('nav')==='0')d.setAttribute('data-nav','0');
var f=g('theme'),s=null;try{s=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}
var m=(f==='dark'||f==='light'||f==='auto')?f:((s==='dark'||s==='light')?s:'auto');
if(f)d.setAttribute('data-theme-locked','1');
var r=m==='auto'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):m;
d.classList.remove('dark','light');d.classList.add(r);
d.setAttribute('data-theme-mode',m);
}catch(e){}})();`;
