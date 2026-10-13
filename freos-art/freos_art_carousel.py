import json, os, sys, time, urllib.request
from pathlib import Path
ART=Path('art4'); API='https://api.kie.ai/api/v1'; MODEL='nano-banana-pro'

# Calque du jeu Gel Notturno : fond creme, titre en haut, serif noir gras
# sur une ligne, seconde ligne en italique vert, objet centre dessous.
STYLE=("Square 1:1 editorial product graphic on a warm cream background (#F5F1E8). "
       "At the top, centred, a two-line headline: the first line in heavy black "
       "condensed serif, the second line in italic serif in deep forest green "
       "(#1F3D2E). Generous space under the headline, then the subject centred in "
       "the lower two thirds, studio-lit, soft contact shadow, photorealistic. "
       "Clean, premium, uncluttered. No other text anywhere. No people, no hands, "
       "no lips, no gums, no skin.")

BOX=("a matte deep forest-green carton printed in pale cream with a small outline "
     "tooth icon, the letterspaced serif wordmark FREOS and WHITENING STRIPS under it")

SLOTS=[
 {'name':'c1-macchie','prompt':
   "Headline line one: 'Le macchie non sono nei denti.' Headline line two in green "
   "italic: 'Sono sopra lo smalto.' Subject: a plain matte white ceramic dental "
   "study model of an upper and lower set of teeth, closed, carrying a light "
   "yellowish surface film and a browner line along the gumline."},
 {'name':'c2-perossido','prompt':
   "Headline line one: 'Senza perossido.' Headline line two in green italic: "
   "'Per questo puoi usarle a casa.' Subject: " + BOX + ", standing upright."},
 {'name':'c3-gesto','prompt':
   "Headline line one: 'Trenta minuti al giorno.' Headline line two in green "
   "italic: 'Una sopra, una sotto.' Subject: two thin transparent whitening "
   "strips lying side by side on a cream surface, gently curved."},
 {'name':'c4-scala','prompt':
   "Headline line one: '14 strisce.' Headline line two in green italic: "
   "'Sette trattamenti.' Subject: fourteen small sealed matte forest-green "
   "sachets arranged flat in two neat rows of seven, shot from above."},
 {'name':'c5-smalto','prompt':
   "Headline line one: 'Lavorano sopra lo smalto.' Headline line two in green "
   "italic: 'Non lo attraversano.' Subject: a single transparent whitening strip "
   "peeling away from its matte backing liner, curling at one corner, macro."},
 {'name':'c6-limiti','prompt':
   "Headline line one: 'Quello che non fanno.' Headline line two in green italic: "
   "'Corone, faccette, otturazioni.' Subject: " + BOX + ", lying flat on a cream "
   "surface beside a plain matte white ceramic dental study model."},
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
print('credits %.2f · besoin ~%d' % (get('/chat/credit',k)['data'], len(todo)*18))
tasks=[]
for s in todo:
    r=post('/jobs/createTask',{'model':MODEL,'input':{'prompt':s['prompt']+' '+STYLE,
        'aspect_ratio':'1:1','output_format':'png'}},k)
    if r.get('code')==200: tasks.append([s,r['data']['taskId']]); print('  queued',s['name'])
    else: print('  !!',s['name'],r.get('msg'))
pend=list(tasks); dl=time.time()+900
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
            print('  ok     ',s['name'],d.get('costTime'),'s')
        elif st in ('fail','failed','error'): print('  !!',s['name'],d.get('failMsg'))
        else: still.append([s,t])
    pend=still
    if pend: print('  …',len(pend),'en cours')
