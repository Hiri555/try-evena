import json, os, time, subprocess, urllib.request
KIE=os.environ['KIE']; API="https://api.kie.ai/api/v1/jobs"
UP="https://kieai.redpandaai.co/api/file-stream-upload"
TENIR=("Single continuous locked-off take. No cut, no edit, no transition, no camera movement, "
       "no zoom, no pan, no reframing. The framing stays exactly as in the still image. "
       "No new subject enters frame. No text on screen. Only this changes: ")
MV={
 "lettre":"The lamp light steadies and a faint draught lifts the end of the string tie. Nothing else moves.",
 "tri":"Envelopes travel slowly along the conveyor from left to right. The hall and the lamps stay still.",
 "cachet":"The brass stamp lifts away from the wax, thin threads of wax stretching and snapping.",
 "carrefour":"Headlights travel along one of the roads and the reflections ripple on the wet asphalt.",
 "poupees":"The overhead lamp sways very slightly and the shadows of the dolls shift with it.",
 "central":"Small status lamps blink in sequence along the equipment racks, running away down the aisle.",
 "formulaire":"The pen tip moves down the column and ticks one more checkbox, then rests.",
}
def post(p,b):
    r=urllib.request.Request(API+p,data=json.dumps(b).encode(),
        headers={'Authorization':'Bearer '+KIE,'Content-Type':'application/json'})
    return json.loads(urllib.request.urlopen(r,timeout=90).read())
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
def coupes(f):
    r=subprocess.run(['ffmpeg','-v','info','-i',f,'-vf','scdet=threshold=16','-f','null','-'],
        capture_output=True,text=True).stderr
    return r.count('scd.time')
def up(n):
    o=subprocess.run(['curl','-s','-m','180','-X','POST',UP,'-H','Authorization: Bearer '+KIE,
        '-F',f'file=@img/{n}.png','-F','uploadPath=images/ss7t'],capture_output=True,text=True).stdout
    return json.loads(o)['data']['downloadUrl']
restants=[(n,0) for n in MV]
debut=time.time()
while restants and time.time()-debut < 3000:
    lot=restants[:4]; restants=restants[4:]
    tasks={}
    for n,essai in lot:
        if os.path.exists(f'clips/{n}.mp4'): continue
        try:
            u=up(n)
            t=post("/createTask",{"model":"veo3_fast","input":{"prompt":TENIR+MV[n],
                "image_urls":[u],"aspect_ratio":"16:9","resolution":"1080p"}})['data']['taskId']
            tasks[n]=(t,essai); print('go',n,essai,flush=True)
        except Exception as e: print('ERR',n,e,flush=True); restants.append((n,essai+1))
    vus=set()
    for _ in range(110):
        if len(vus)==len(tasks): break
        time.sleep(11)
        for n,(t,essai) in tasks.items():
            if n in vus: continue
            try: d=(get("/recordInfo?taskId="+t).get('data') or {})
            except Exception: continue
            st=d.get('state')
            if st=='success':
                vus.add(n)
                r=d.get('resultJson')
                try: r=json.loads(r) if isinstance(r,str) else (r or {})
                except Exception: r={}
                uu=U(r)
                if not uu: print('VIDE',n,flush=True); continue
                urllib.request.urlretrieve(uu[0],f'clips/{n}.mp4')
                c=coupes(f'clips/{n}.mp4')
                if c>0 and essai==0:
                    print('COUPE',n,c,flush=True); os.remove(f'clips/{n}.mp4'); restants.append((n,1))
                else: print('OK',n,'coupes=',c,flush=True)
            elif st=='fail':
                vus.add(n); print('FAIL',n,d.get('failMsg'),flush=True)
                if essai<2: restants.append((n,essai+1))
    if restants: print('reste',len(restants),flush=True); time.sleep(20)
print('TERMINE', len([n for n in MV if os.path.exists(f'clips/{n}.mp4')]),'/',len(MV))
