import json, os, time, urllib.request
KIE=os.environ['KIE']; API="https://api.kie.ai/api/v1/jobs"
LOOK=("Cinematic documentary photograph. Low-key night lighting, deep indigo shadows, "
      "cyan rim light with warm amber practicals, anamorphic 35mm, shallow depth of field, "
      "fine film grain, muted desaturated palette. No text, no lettering, no watermark, no logos. ")
PLANS={
 "lettre":"A sealed registered letter lying on a dark wooden desk, thick cream envelope with a red wax seal, a string tie, an angled desk lamp pooling warm light, the rest of the room dark.",
 "tri":"A postal sorting hall at night: a long conveyor carrying envelopes between steel frames, overhead lamps in a receding row, no people, deep shadows at the edges.",
 "cachet":"Extreme macro of a red wax seal on cream paper, the brass stamp lifting away from it, tiny threads of wax still stretching, warm lamp light raking from the left, black background.",
 "carrefour":"A night road junction seen from above: wet asphalt, several roads radiating out, amber street lamps along each one, one road lit brighter than the others, no cars.",
 "poupees":"A row of Russian nesting dolls opened and lined up by size on a dark surface, the smallest one standing apart, one overhead lamp, deep shadow behind them.",
 "central":"A telephone exchange switching room at night: tall rows of equipment racks with small status lamps, thick bundles of cable overhead, one corridor light, the aisle receding into darkness.",
 "formulaire":"Close-up of a printed paper form with a column of small checkboxes, several already ticked in blue ink, a pen resting on the page, warm desk-lamp light, the rest dark.",
}
def post(p,b):
    r=urllib.request.Request(API+p,data=json.dumps(b).encode(),
        headers={'Authorization':'Bearer '+KIE,'Content-Type':'application/json'})
    return json.loads(urllib.request.urlopen(r,timeout=60).read())
def get(p):
    r=urllib.request.Request(API+p,headers={'Authorization':'Bearer '+KIE})
    return json.loads(urllib.request.urlopen(r,timeout=60).read())
def U(o):
    if isinstance(o,dict):
        for k in ('resultUrls','origin_urls','resultUrl','videoUrl'):
            if o.get(k): return o[k] if isinstance(o[k],list) else [o[k]]
        for v in o.values():
            u=U(v)
            if u: return u
tk={}
for n,p in PLANS.items():
    tk[n]=post("/createTask",{"model":"nano-banana-pro","input":{"prompt":LOOK+p,
        "output_format":"png","aspect_ratio":"16:9","resolution":"2K"}})['data']['taskId']
    print('still',n,flush=True)
fini={}
for _ in range(120):
    if len(fini)==len(tk): break
    time.sleep(9)
    for n,t in tk.items():
        if n in fini: continue
        try: d=(get("/recordInfo?taskId="+t).get('data') or {})
        except Exception: continue
        st=d.get('state')
        if st=='success':
            r=d.get('resultJson')
            try: r=json.loads(r) if isinstance(r,str) else (r or {})
            except Exception: r={}
            u=U(r)
            if u: urllib.request.urlretrieve(u[0],f'img/{n}.png'); fini[n]=1; print('OK',n,flush=True)
            else: fini[n]=0; print('VIDE',n,flush=True)
        elif st=='fail': fini[n]=0; print('FAIL',n,d.get('failMsg'),flush=True)
print('TERMINE',sum(fini.values()),'/',len(tk))
