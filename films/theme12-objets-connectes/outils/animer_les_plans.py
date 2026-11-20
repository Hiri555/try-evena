import json, os, time, subprocess, urllib.request
KIE=os.environ['KIE']; API="https://api.kie.ai/api/v1/jobs"
UP="https://kieai.redpandaai.co/api/file-stream-upload"
LOOK=("Cinematic documentary photograph. Low-key night lighting, deep indigo shadows, "
      "cyan rim light with warm amber practicals, anamorphic 35mm, shallow depth of field, "
      "fine film grain, muted desaturated palette. No text, no lettering, no watermark, no logos. ")
NOUVEAUX={
 "rideau":"Interior night, seen from inside a modest flat: a hand reaches up to a thin curtain at a window, the street lamp glowing orange outside, a sofa arm and a low table in the dark foreground.",
 "contrat":"Extreme close-up of the signature line at the foot of a printed contract on a desk, a fountain pen lying across it and a round rubber stamp beside it, warm desk-lamp light, the rest dark.",
 "sensible":"Close-up of an administrative form on a desk with several of its fields covered by solid black redaction bars, a hand resting at the edge of the page, cold lamp light from the left.",
 "rue":"Street-level night view along a row of low-rise houses, a few windows lit warm amber, an orange street lamp overhead, wet road reflecting the lights, no people.",
 "archive":"A metal filing cabinet drawer pulled open, packed with upright index cards in rows, a single overhead lamp above, the rest of the archive room in darkness.",
}
# (id, source, duree cible, mouvement)
PLANS=[
 ("s01","antenne",  "The red aviation light on the tower blinks slowly, thin clouds drift behind it, scattered city lights twinkle far below. The tower is rigid."),
 ("s02","banc",     "The small green LEDs on the rows of meters blink out of step with each other, one counter wheel turns a notch, dust floats through the lamp beam. The wall and the meters do not move."),
 ("s03","cartes",   "The tweezers close on one SIM card and lift it clear of the tray, light glinting along its gold contacts. The tray and bench do not move."),
 ("s04","compteur", "The digits on the meter's LCD tick upward one by one, the small status LED pulses, a moth crosses the lamp beam. The wall and the meter body do not move."),
 ("s05","fenetre",  "A human silhouette moves slowly across the lit second-floor window and the curtain sways, the warm lamp inside flickers faintly. The building is rigid, the street is empty."),
 ("s06","interieur","The seated person shifts their shoulders slightly, the cold television light flickers and changes, the ceiling fan turns slowly."),
 ("s07","salle",    "The seated operator leans forward and types, line graphs scroll slowly on the monitors and a cursor blinks. The room stays dark."),
 ("s08","insertion","The gloved hand pushes the SIM card fully into the meter's slot and then withdraws from frame, a small LED on the meter blinks once. The meter stays fixed to the wall."),
 ("s09L","rideau",  "The hand slowly draws the thin curtain across the window, dimming the orange street light. Nothing else moves."),
 ("s09R","bureau",  "A hand brings the rubber stamp down firmly on the top contract, lifts it away and leaves frame, the paper settles. The shelving does not move."),
 ("s10","contrat",  "The pen is lifted off the page and the rubber stamp comes down on the signature line, then lifts. The paper settles. Nothing else moves."),
 ("s11","puce",     "A narrow band of light sweeps slowly across the gold contact pads, revealing the fingerprint on the metal, the tweezers tremble almost imperceptibly. Black background stays pure."),
 ("s12","dossier",  "The finger slides slowly down the column of the record sheet and stops, the paper shifts slightly under it. The lamp light is steady."),
 ("s13","sensible", "A hand slides one more black redaction bar across a field of the form and withdraws. The paper settles. Nothing else moves."),
 ("s14","ingenieur","The hands move across the keyboard typing, the graphs reflected in the glasses update and scroll. The head stays still."),
 ("s15","quartier", "Car headlights travel slowly along two of the lit avenues, a handful of scattered windows switch on and others go dark. The rooftops are rigid."),
 ("s16","rue",      "One by one, three of the warm windows along the row switch on and one switches off. A faint breeze moves a hanging cable. The street stays empty."),
 ("s17","vieux",    "A cobweb in the corner trembles in a draught, dust drifts across the beam, moonlight shifts slowly over the cracked yellowed casing. The wall is still."),
 ("s18","depose",   "The screwdriver turns, the meter loosens and tilts a few degrees away from the wall with its wires pulling taut. The gloved hands keep working."),
 ("s19","registre", "The pen is picked up and writes one line of entries across the ruled page, then rests. The far page edge lifts slightly in a draught."),
 ("s20","archive",  "The drawer slides a little further open and the rows of index cards rock gently, then settle. The lamp light is steady."),
 ("s21","aube",     "The warm line on the horizon brightens and spreads, the shadows on the wall shorten almost imperceptibly, a bird crosses the sky once. The meters are rigid."),
]
TENIR=("Single continuous locked-off take. No cut, no edit, no transition, no camera movement, "
       "no zoom, no pan, no reframing. The camera and the framing stay exactly as in the still "
       "image for the whole shot. No new subject enters frame. No text or captions on screen. "
       "Only this changes: ")
def post(p,b):
    r=urllib.request.Request(API+p,data=json.dumps(b).encode(),
        headers={'Authorization':'Bearer '+KIE,'Content-Type':'application/json'})
    return json.loads(urllib.request.urlopen(r,timeout=90).read())
def get(p):
    r=urllib.request.Request(API+p,headers={'Authorization':'Bearer '+KIE})
    return json.loads(urllib.request.urlopen(r,timeout=60).read())
def trouve_urls(o):
    if isinstance(o,dict):
        for k in ('resultUrls','origin_urls','resultUrl','videoUrl'):
            if o.get(k): return o[k] if isinstance(o[k],list) else [o[k]]
        for v in o.values():
            u=trouve_urls(v)
            if u: return u
    return None
def upload(path):
    out=subprocess.run(['curl','-s','-m','180','-X','POST',UP,'-H','Authorization: Bearer '+KIE,
        '-F','file=@'+path,'-F','uploadPath=images/t12x'],capture_output=True,text=True).stdout
    return json.loads(out)['data']['downloadUrl']
def coupes(f):
    r=subprocess.run(['ffmpeg','-v','info','-i',f,'-vf','scdet=threshold=16','-f','null','-'],
        capture_output=True,text=True).stderr
    return r.count('scd.time')

# ---- 1. les cinq plans manquants ----
os.makedirs('img3',exist_ok=True); os.makedirs('clips',exist_ok=True)
tk={}
for n,p in NOUVEAUX.items():
    if os.path.exists(f'img3/{n}.png'): continue
    tk[n]=post("/createTask",{"model":"nano-banana-pro","input":{"prompt":LOOK+p,
        "output_format":"png","aspect_ratio":"16:9","resolution":"2K"}})['data']['taskId']
    print('still',n,flush=True)
fini=set()
while tk and len(fini)<len(tk):
    time.sleep(9)
    for n,t in tk.items():
        if n in fini: continue
        d=(get("/recordInfo?taskId="+t).get('data') or {})
        if d.get('state')=='success':
            r=json.loads(d['resultJson']); u=trouve_urls(r)[0]
            urllib.request.urlretrieve(u,f'img3/{n}.png'); fini.add(n); print('still OK',n,flush=True)
        elif d.get('state')=='fail': fini.add(n); print('still FAIL',n,flush=True)

SRC={}
for d in ('assets/img','img3'):
    for f in os.listdir(d):
        SRC[os.path.splitext(f)[0]]=os.path.join(d,f)

# ---- 2. les clips, par paquets de 5 ----
urls={}
for sid,src,mv in PLANS:
    if src not in urls:
        urls[src]=upload(SRC[src]); print('up',src,flush=True)

def lance(sid,src,mv,essai):
    extra=" Absolutely no cut anywhere in the shot." if essai else ""
    return post("/createTask",{"model":"veo3_fast","input":{
        "prompt":TENIR+mv+extra,"image_urls":[urls[src]],
        "aspect_ratio":"16:9","resolution":"1080p"}})['data']['taskId']

restants=[(s,c,m,0) for s,c,m in PLANS]; ok=[]
while restants:
    lot=restants[:5]; restants=restants[5:]
    tasks={}
    for sid,src,mv,essai in lot:
        try: tasks[sid]=(lance(sid,src,mv,essai),src,mv,essai); print('go',sid,flush=True)
        except Exception as e: print('ERR',sid,e,flush=True)
    vus=set()
    for _ in range(90):
        if len(vus)==len(tasks): break
        time.sleep(12)
        for sid,(t,src,mv,essai) in tasks.items():
            if sid in vus: continue
            try: d=(get("/recordInfo?taskId="+t).get('data') or {})
            except Exception: continue
            st=d.get('state')
            if st=='success':
                vus.add(sid)
                u=trouve_urls(json.loads(d['resultJson']))
                if not u: print('VIDE',sid,flush=True); continue
                urllib.request.urlretrieve(u[0],f'clips/{sid}.mp4')
                c=coupes(f'clips/{sid}.mp4')
                if c>0 and essai==0:
                    print('COUPE',sid,c,'-> on relance',flush=True)
                    restants.append((sid,src,mv,1))
                else:
                    ok.append(sid); print('OK',sid,'coupes=',c,flush=True)
            elif st=='fail':
                vus.add(sid); print('FAIL',sid,d.get('failMsg'),flush=True)
                if essai==0: restants.append((sid,src,mv,1))
    print('lot fini, reste',len(restants),flush=True)
print('TERMINE',len(ok),'/',len(PLANS))
