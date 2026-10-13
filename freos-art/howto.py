import json, os, sys, time, urllib.request
from pathlib import Path
ART=Path('art5'); API='https://api.kie.ai/api/v1'; MODEL='nano-banana-pro'

STYLE=("Square 1:1. Warm cream background (#F5F1E8). Soft diffused daylight, "
       "one gentle shadow. Photorealistic, premium, editorial. The headline text "
       "is set at the top: first part heavy black condensed serif, accent words in "
       "italic deep forest green (#1F3D2E). Only the text described, nothing else.")

SLOTS=[
 # 3-step how-to, close-up mouth (no full face, lower-face crop), original model
 {'name':'how-1','prompt':
   "Headline: 'Passo 1 — Applica' with 'Applica' in green italic. Below it, a "
   "clean close-up of the lower half of a woman's face, natural everyday smile, "
   "placing a thin transparent whitening strip across her upper front teeth with "
   "both hands. Realistic skin, soft natural light. Framed from nose to chin only."},
 {'name':'how-2','prompt':
   "Headline: 'Passo 2 — Trenta minuti' with 'Trenta minuti' in green italic. "
   "Below it, a simple minimalist line-drawn clock icon showing thirty minutes, in "
   "deep forest green on the cream background, centred, with a small transparent "
   "whitening strip resting beside it. No face."},
 {'name':'how-3','prompt':
   "Headline: 'Passo 3 — Sorridi' with 'Sorridi' in green italic. Below it, a "
   "clean close-up of the lower half of a woman's face with a relaxed natural "
   "smile showing clean teeth, no strip. Realistic skin, soft light, framed from "
   "nose to chin only."},
]

def post(p,pl,k):
    r=urllib.request.Request(API+p,data=json.dumps(pl).encode(),
      headers={'Authorization':'Bearer '+k,'Content-Type':'application/json'},method='POST')
    with urllib.request.urlopen(r,timeout=60) as x: return json.loads(x.read())
def get(p,k):
    r=urllib.request.Request(API+p,headers={'Authorization':'Bearer '+k})
    with urllib.request.urlopen(r,timeout=60) as x: return json.loads(x.read())
def first(d):
    raw=d.get('resultJson')
    if isinstance(raw,str):
        try: raw=json.loads(raw)
        except Exception: return None
    u=(raw or {}).get('resultUrls') or []
    return u[0] if u else None

k=os.environ['KIE_API_KEY']; ART.mkdir(exist_ok=True)
todo=[s for s in SLOTS if not (ART/(s['name']+'.png')).exists()]
print('credits %.2f' % get('/chat/credit',k)['data'])
tasks=[]
for s in todo:
    r=post('/jobs/createTask',{'model':MODEL,'input':{'prompt':s['prompt']+' '+STYLE,
        'aspect_ratio':'1:1','output_format':'png'}},k)
    if r.get('code')==200: tasks.append([s,r['data']['taskId']]); print('  queued',s['name'])
    else: print('  !!',s['name'],r.get('msg'))
pend=list(tasks); dl=time.time()+700
while pend and time.time()<dl:
    time.sleep(5); still=[]
    for s,t in pend:
        try: d=(get('/jobs/recordInfo?taskId='+t,k) or {}).get('data') or {}
        except Exception: still.append([s,t]); continue
        st=str(d.get('state') or '').lower()
        if st=='success':
            u=first(d)
            if not u: print('  !!',s['name'],'no url'); continue
            dst=ART/(s['name']+'.png')
            rq=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(rq,timeout=120) as r,open(dst,'wb') as f: f.write(r.read())
            print('  ok     ',s['name'])
        elif st in ('fail','failed','error'): print('  !!',s['name'],str(d.get('failMsg'))[:80])
        else: still.append([s,t])
    pend=still
    if pend: print('  …',len(pend))
