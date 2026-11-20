import subprocess, os
# (id, duree du plan, point d'entree dans le clip de 7,93 s)
CIBLES=[("s01",2.2,1.2),("s02",2.1,1.5),("s03",2.3,1.5),("s04",5.8,0.5),("s05",6.1,0.8),
        ("s06",5.2,1.0),("s07",6.6,0.6),("s08",7.0,0.4),("s09L",6.7,0.6),("s09R",6.7,0.6),
        ("s10",4.1,1.6),("s11",5.8,0.8),("s12",4.7,1.4),("s13",5.1,1.2),("s14",3.3,1.6),
        ("s15",6.3,0.8),("s16",5.0,1.2),("s17",7.9,0.0),("s18",4.3,1.4),("s19",5.6,1.0),
        ("s20",3.8,1.6),("s21",6.0,0.9)]
os.makedirs('assets/clips',exist_ok=True)
def dur(f):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
        '-of','csv=p=0',f],capture_output=True,text=True).stdout.strip())
tot=0; n=0; manque=[]
for pid,plan,ss in CIBLES:
    src=f'clips/{pid}.mp4'
    if not os.path.exists(src): manque.append(pid); continue
    d=dur(src)
    ss=min(ss, max(0.0, d-plan-0.04))
    cible=min(plan+0.08, d-ss)
    # 720p -> 1080p : agrandissement lanczos puis accentuation legere
    vf=("scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,"
        "crop=1920:1080,unsharp=5:5:0.45:5:5:0.0,fps=30")
    cmd=['ffmpeg','-y','-v','error','-ss',f'{ss:.2f}','-i',src,'-t',f'{cible:.2f}','-vf',vf,
         '-an','-c:v','libx264','-preset','medium','-crf','17','-g','1','-pix_fmt','yuv420p',
         '-movflags','+faststart',f'assets/clips/{pid}.mp4']
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode!=0: print('ERR',pid,r.stderr[-250:]); continue
    nd=dur(f'assets/clips/{pid}.mp4'); mo=os.path.getsize(f'assets/clips/{pid}.mp4')/1048576
    tot+=mo; n+=1
    etat='OK ' if nd>=plan-0.01 else 'COURT'
    print(f'{etat} {pid:5s} src {d:5.2f}s  entree {ss:4.2f}  -> {nd:5.2f}s (plan {plan}s)  {mo:5.1f} Mo',flush=True)
print(f'\n{n}/{len(CIBLES)} plans conditionnes, {tot:.0f} Mo')
if manque: print('MANQUENT :', ' '.join(manque))
