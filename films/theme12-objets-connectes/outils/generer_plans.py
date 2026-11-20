import json, os, time, urllib.request
KIE = os.environ['KIE']; API = "https://api.kie.ai/api/v1/jobs"
LOOK = ("Cinematic documentary photograph. Low-key night lighting, deep indigo shadows, "
        "cyan rim light with warm amber practicals, anamorphic 35mm, shallow depth of field, "
        "fine film grain, muted desaturated palette. No text, no lettering, no watermark, no logos. ")
PLANS = {
 "compteur": "Tight close-up of a modern communicating electricity meter bolted to a rough plastered wall, its small LCD glowing pale cyan, a sealed terminal cover, a single status LED, conduit and cable entering from below. Night, a work lamp raking from the left.",
 "quartier": "High aerial view of a dense low-rise neighbourhood at night, flat rooftops stretching to the horizon, orange street lamps marking the avenues, scattered lit windows, deep blue darkness between the blocks.",
 "cartes":   "Overhead close-up of a sheet of industrial M2M SIM cards laid on a dark metal workbench, gold contact pads catching cyan light, a pair of tweezers and an antistatic bag beside them.",
 "salle":    "A network supervision room at night seen from behind: a wall of dark monitors showing faint maps and graphs in cyan and amber, one operator silhouetted in a chair, desk lamps, cables, the room otherwise unlit.",
 "fenetre":  "Night exterior of a modest four-storey apartment building, exactly one window on the second floor lit warm amber with a human silhouette crossing behind the curtain, every other window dark, satellite dishes and a water tank on the roof, cool blue night air.",
 "puce":     "Extreme macro of the gold contact pads of an industrial M2M SIM card held in fine tweezers, dust and a faint fingerprint on the metal, cold cyan rim light, pure black background, razor-thin depth of field.",
 "banc":     "A basement utility room: a bank of about forty electricity meters mounted in neat rows on a bare concrete wall, tiny green LEDs glowing, bundles of grey cable in trunking, one caged overhead lamp, wide angle.",
 "depose":   "Close-up of a technician's gloved hands unscrewing an electricity meter off a wall at night, the meter half detached with its wires exposed, a screwdriver in frame, a work lamp throwing hard light from the left.",
 "registre": "Overhead shot of an open paper ledger with ruled columns on a worn wooden desk, rows of handwritten entries in blue ink, a pen resting across it, an angled desk lamp pooling warm light, the rest of the room in darkness.",
 "antenne":  "A telecom tower carrying panel antennas at blue hour, silhouetted against a deep indigo sky, a single red aviation light burning, low-rise city rooftops below, wide shot.",
}
def post(p,b):
    r=urllib.request.Request(API+p,data=json.dumps(b).encode(),headers={'Authorization':'Bearer '+KIE,'Content-Type':'application/json'})
    return json.loads(urllib.request.urlopen(r,timeout=60).read())
def get(p):
    r=urllib.request.Request(API+p,headers={'Authorization':'Bearer '+KIE})
    return json.loads(urllib.request.urlopen(r,timeout=60).read())
tasks={}
for n,p in PLANS.items():
    res=post("/createTask",{"model":"nano-banana-pro","input":{"prompt":LOOK+p,"output_format":"png","aspect_ratio":"16:9","resolution":"2K"}})
    tasks[n]=res['data']['taskId']; print(n,tasks[n],flush=True)
os.makedirs('img2',exist_ok=True); done={}
for _ in range(110):
    if len(done)==len(tasks): break
    time.sleep(9)
    for n,t in tasks.items():
        if n in done: continue
        try: s=get("/recordInfo?taskId="+t)
        except Exception as e: continue
        d=s.get('data') or {}; st=d.get('state') or d.get('status')
        if st in ('success','SUCCESS'):
            r=d.get('resultJson'); r=json.loads(r) if isinstance(r,str) else (r or {})
            u=(r.get('resultUrls') or [None])[0]
            if u: urllib.request.urlretrieve(u,f'img2/{n}.png'); done[n]=u; print('OK',n,flush=True)
        elif st in ('fail','FAIL','failed'): done[n]=None; print('FAIL',n,d.get('failMsg'),flush=True)
print('done', len([v for v in done.values() if v]), '/', len(tasks))
