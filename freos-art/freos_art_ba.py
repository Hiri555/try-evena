import json, os, sys, time, urllib.request
from pathlib import Path
ART = Path('art3'); API='https://api.kie.ai/api/v1'; MODEL='nano-banana-pro'
STYLE=("Studio photograph, square 1:1. Warm cream paper background (#F5F1E8), plain. "
       "Soft diffused daylight from upper left, one gentle contact shadow. "
       "Photorealistic, sharp, medium-format. Identical framing, identical lighting, "
       "identical camera angle and distance in both frames so they can be shown side "
       "by side. No people, no lips, no gums, no skin.")
BASE=("A plain matte ceramic dental study model of an upper and lower set of teeth, "
      "closed, standing centred on a warm cream surface, photographed straight on at "
      "eye level, filling the middle of the frame. ")
SLOTS=[
 {'name':'ba-prima','prompt':BASE+"The ceramic is the same clean off-white as a new "
   "model, but the teeth carry a light to moderate surface film: a soft yellowish "
   "cast across the fronts, slightly browner in the thin grooves between teeth and "
   "in a faint line along the gumline. The kind of everyday staining coffee and tea "
   "leave. Clearly duller than clean, but the model is plainly new and undamaged - "
   "no decay, no cracks, no antique or aged appearance."},
 {'name':'ba-dopo','prompt':BASE+"The teeth are a clean natural off-white ceramic, free "
   "of surface staining, with no brown film at the gumline or between the teeth. Not "
   "bleached or artificially bright - a natural clean tone."},
]
def post(p,pl,k):
    r=urllib.request.Request(API+p,data=json.dumps(pl).encode(),
      headers={'Authorization':'Bearer '+k,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(r,timeout=60) as x: return json.loads(x.read())
def get(p,k):
    r=urllib.request.Request(API+p,headers={'Authorization':'Bearer '+k})
    with urllib.request.urlopen(r,timeout=60) as x: return json.loads(x.read())
def url(d):
    raw=d.get('resultJson')
    if isinstance(raw,str):
        try: raw=json.loads(raw)
        except Exception: return None
    u=(raw or {}).get('resultUrls') or []
    return u[0] if u else None
k=os.environ['KIE_API_KEY']; ART.mkdir(exist_ok=True)
tasks=[]
for s in SLOTS:
    r=post('/jobs/createTask',{'model':MODEL,'input':{'prompt':s['prompt']+' '+STYLE,
        'aspect_ratio':'1:1','output_format':'png'}},k)
    if r.get('code')==200: tasks.append([s,r['data']['taskId']]); print('  queued',s['name'])
    else: print('  !!',s['name'],r.get('msg'))
pend=list(tasks); dl=time.time()+600
while pend and time.time()<dl:
    time.sleep(5); still=[]
    for s,t in pend:
        try: d=(get('/jobs/recordInfo?taskId='+t,k) or {}).get('data') or {}
        except Exception: still.append([s,t]); continue
        st=str(d.get('state') or '').lower()
        if st=='success':
            u=url(d)
            if not u: print('  !!',s['name'],'no url'); continue
            dst=ART/(s['name']+'.png')
            rq=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(rq,timeout=120) as r,open(dst,'wb') as f: f.write(r.read())
            print('  ok     ',s['name'],d.get('costTime'),'s',dst.stat().st_size//1024,'KB')
        elif st in ('fail','failed','error'): print('  !!',s['name'],d.get('failMsg'))
        else: still.append([s,t])
    pend=still
