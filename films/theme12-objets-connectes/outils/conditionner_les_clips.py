import subprocess, os
# ordre chronologique : (clip source, duree du plan, point d'entree)
CIBLES=[("s08",5.6,0.3),("s03",3.2,1.2),("s01",5.0,0.6),("s09L",6.6,0.6),("s09R",6.6,0.6),
        ("s10",2.7,1.8),("s04",6.2,0.4),("s05",5.8,0.9),("s06",5.0,1.0),("s11",5.6,0.9),
        ("s12",5.2,1.0),("s13",3.2,1.6),("s14",3.6,1.5),("s15",4.8,1.2),("s16",5.2,1.1),
        ("s02",4.0,1.2),("s17",4.4,1.4),("s18",4.4,1.3),("s07",4.9,1.0),("s19",4.6,1.3),
        ("s20",4.3,1.3),("s21",5.8,0.9)]
os.makedirs('assets/clips',exist_ok=True)
def dur(f):
    return float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration',
        '-of','csv=p=0',f],capture_output=True,text=True).stdout.strip())
tot=0;n=0;manque=[]
for pid,plan,ss in CIBLES:
    src=f'clips/{pid}.mp4'
    if not os.path.exists(src): manque.append(pid); continue
    d=dur(src); ss=min(ss,max(0.0,d-plan-0.04)); cible=min(plan+0.08,d-ss)
    vf=("scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,"
        "crop=1920:1080,unsharp=5:5:0.45:5:5:0.0,fps=30")
    r=subprocess.run(['ffmpeg','-y','-v','error','-ss',f'{ss:.2f}','-i',src,'-t',f'{cible:.2f}',
        '-vf',vf,'-an','-c:v','libx264','-preset','medium','-crf','17','-g','1',
        '-pix_fmt','yuv420p','-movflags','+faststart',f'assets/clips/{pid}.mp4'],
        capture_output=True,text=True)
    if r.returncode!=0: print('ERR',pid,r.stderr[-200:]); continue
    nd=dur(f'assets/clips/{pid}.mp4'); mo=os.path.getsize(f'assets/clips/{pid}.mp4')/1048576
    tot+=mo;n+=1
    print(f"{'OK ' if nd>=plan-0.01 else 'COURT'} {pid:5s} -> {nd:5.2f}s (plan {plan}s)  {mo:5.1f} Mo")
print(f'\n{n}/{len(CIBLES)} plans, {tot:.0f} Mo')
if manque: print('MANQUENT :',' '.join(manque))
