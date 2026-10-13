import json, os, time, urllib.request
from pathlib import Path
ART=Path('art5'); API='https://api.kie.ai/api/v1'; MODEL='nano-banana-pro'
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
SLOTS=[
 {'name':'ba-mouth','prompt':
   "A vertical before-and-after of the SAME single woman's lower face, nose to "
   "chin, natural everyday smile, identical framing and lighting in both halves. "
   "TOP half labelled 'PRIMA' in the upper left in small white letterspaced "
   "capitals: teeth with a light natural yellowish tint. BOTTOM half labelled "
   "'DOPO' in the upper left in small white letterspaced capitals: the same teeth "
   "visibly cleaner and brighter, natural not artificial. A thin dark forest-green "
   "band runs across the very bottom with the small cream text "
   "'*I risultati individuali possono variare'. Realistic skin, soft studio light, "
   "warm cream surroundings. Photorealistic, premium."},
 {'name':'benefit-1','prompt':
   "Square 1:1, warm cream background (#F5F1E8). Centred, a close-up of the lower "
   "half of a woman's face with a confident natural smile, clean bright teeth, "
   "nose to chin. Across the top a two-line headline: 'Lo sbiancamento che fai' in "
   "heavy black condensed serif, and below it 'a casa tua.' in italic deep forest "
   "green (#1F3D2E). Realistic skin, soft daylight. Premium editorial. Only that text."},
]
k=os.environ['KIE_API_KEY']; ART.mkdir(exist_ok=True)
todo=[s for s in SLOTS if not (ART/(s['name']+'.png')).exists()]
tasks=[]
for s in todo:
    ar='3:4' if s['name']=='ba-mouth' else '1:1'
    r=post('/jobs/createTask',{'model':MODEL,'input':{'prompt':s['prompt'],
        'aspect_ratio':ar,'output_format':'png'}},k)
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
