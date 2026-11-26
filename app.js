const seed = [
 {id:"meg-001",title:"5-Bedroom Fully Detached Luxury Duplex",location:"Megamound Estate, Lekki, Lagos",price:"₦480,000,000",status:"available",beds:"5 Bedrooms",baths:"6 Bathrooms",details:"Brand-new residence with smart-home features, private swimming pool, fitted kitchen, BQ and premium finishes. Located on Roland Odewale Street, opposite The County Apartment, inside Megamound Estate.",image:""}
];
let properties = seed;
const escapeHtml = (s="") => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(filter="available"){
 const grid=document.getElementById("property-grid"),empty=document.getElementById("empty-state"); if(!grid)return;
 const items=properties.filter(p=>p.status===filter);
 grid.innerHTML=items.map(p=>`<article class="property-card"><div class="property-image">${p.image?`<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}" loading="lazy">`:""}<span class="property-tag">${filter==="sold"?"Sold portfolio":"For sale"}</span></div><div class="property-body"><h3>${escapeHtml(p.title)}</h3><div class="property-location">⌖ ${escapeHtml(p.location)}</div><div class="property-price">${escapeHtml(p.price||"Price on request")}</div><div class="property-meta"><span>${escapeHtml(p.beds||"")}</span><span>${escapeHtml(p.baths||"")}</span></div><p class="property-location">${escapeHtml(p.details||"Contact us for full details.")}</p><a class="text-link" href="https://wa.me/2348102090360?text=${encodeURIComponent("Hello Joshlene Homes, I would like details about "+p.title)}" target="_blank" rel="noopener">Enquire about property ↗</a></div></article>`).join("");
 empty.hidden=items.length>0;
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");render(b.dataset.filter)}));
const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector(".nav"); if(toggle)toggle.addEventListener("click",()=>{nav.classList.toggle("open");toggle.setAttribute("aria-expanded",nav.classList.contains("open"))});
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
const year=document.getElementById("year");if(year)year.textContent=new Date().getFullYear();
fetch("/api/properties").then(r=>{if(!r.ok)throw new Error("API unavailable");return r.json()}).then(data=>{if(Array.isArray(data))properties=data;render()}).catch(()=>render());