import json,re,unicodedata,sys
mots=json.load(open('vo/mots.json',encoding='utf-8'))
def norm(s):
    s=unicodedata.normalize('NFD',s.lower())
    s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=re.sub(r"['’\-]"," ",s); s=re.sub(r"[^a-z0-9 ]"," ",s)
    return re.sub(r"\s+"," ",s).strip()
blob=[];pos=[]
for i,w in enumerate(mots):
    n=norm(w['t'])
    if not n: continue
    if blob: blob.append(" "); pos.append(i)
    for c in n: blob.append(c); pos.append(i)
blob="".join(blob)
def trouve(ph,apres=0.0):
    q=norm(ph); start=0
    while True:
        k=blob.find(q,start)
        if k<0: return None
        i=pos[k]
        if mots[i]['a']>=apres-1e-6: return round(mots[i]['a'],3)
        start=k+1
DEM=[
 ("ouverture","Voici la trame du TD"),("compte","Avant de decoder, comptons"),
 ("q43","quarante-trois chiffres"),("impair","c'est impair"),
 ("deuxchiffres","deux chiffres hexadecimaux"),("pasgauche","si on part de la gauche"),
 ("suspension","des points de suspension"),("borddroit","c'est le bord droit"),
 ("premierbit","le premier bit emis est a droite"),("schema","Le schema du cours le montre"),
 ("fanionpremier","qui part en premier"),("droiteagauche","on lit de droite a gauche"),
 ("champparchamp","Champ par champ"),("gestes","les memes quatre gestes"),
 ("g1","je repere"),("g2","je convertis"),("g3","j'ouvre la table du cours"),("g4","je lis"),
 ("hex4","un chiffre hexadecimal"),("octet8","Donc un octet, deux chiffres, huit bits"),
 ("champ1","Premier champ, tout a droite"),("fanion","C'est le fanion"),
 ("oct2","Octet suivant, en remontant"),("poidsfort","le bit de poids fort"),
 ("bir","bit indicateur vers l'arriere"),("nsr","numero de sequence arriere"),
 ("nsr8","N S R egale huit"),("derniere","La derniere trame que j'ai bien recue"),
 ("oct3","zero huit encore"),("avant","mais vers l'avant"),("nsa8","N S A egale huit"),
 ("interp1","Interpretation"),("bascule","n'ont pas bascule"),
 ("aucuneerreur","Aucune erreur"),("normal","La liaison tourne normalement"),
 ("octD8","Octet suivant : D huit"),("reserves","Deux bits reserves devant"),
 ("sixbits","six bits d'indicateur de longueur"),("reste","Il reste zero un un zero zero zero"),
 ("v24","soit vingt-quatre"),("tabletype","la table des types de trame"),
 ("tsr","remplissage"),("tse","trame d'etat"),("tsm","trame de message"),
 ("cestTSM","C'est donc une T S M"),("info24","fait vingt-quatre octets"),
 ("n2lu","Le niveau deux est lu"),("crt","la detection d'erreur"),
 ("nonreecrite","dans la partie non reecrite"),
 ("p2start","On continue vers la gauche"),("oct04","Octet suivant : zero quatre"),
 ("ser","C'est l'octet de service"),("porten3","La porte d'entree du niveau trois"),
 ("quartets","en deux quartets"),("ins","l'indicateur de service"),
 ("dss","le domaine de sous-service"),("tabins","Table de l'I N S"),
 ("ssut","S S U T, niveau quatre"),("soussysteme","le sous-systeme utilisateur telephonique"),
 ("tabdss","Table du D S S"),("ba00","les bits B et A sont reserves"),
 ("dcparlent","les bits D et C qui parlent"),("international","reseau international"),
 ("etiq","Maintenant l'etiquette"),("trompe","tout le monde se trompe"),
 ("q40","fait quarante bits"),("dix","dix chiffres hexadecimaux"),
 ("agauchedu","juste a gauche du S E R"),("boutabout","bout a bout en binaire"),
 ("decouper","Le cours dit comment decouper"),("c14cpd","quatorze bits pour le C P D"),
 ("c14cpo","quatorze bits pour le C P O"),("c4scs","quatre bits pour le S C S"),
 ("cic8","completent le C I C"),("v28","ca fait vingt-huit bits"),
 ("sept7","sept chiffres hexadecimaux"),("frontieres","frontieres d'octets"),
 ("parbinaire","passer par le binaire"),("p14a","Les quatorze premiers bits"),
 ("v14203","quatorze mille deux cent trois"),("cpdnom","le code du point de destination"),
 ("destinataire","Le destinataire"),("p14b","Les quatorze bits suivants"),
 ("v7562","Sept mille cinq cent soixante-deux"),("cponom","le code du point d'origine"),
 ("expediteur","L'expediteur"),("interp2","Et l'interpretation"),
 ("estcemoi","est-ce moi"),("distribue","je la distribue"),
 ("achemine","je l'achemine plus loin"),("differents","sont differents"),
 ("p4scs","Quatre bits suivants"),("scsnom","selection du canal semaphore"),
 ("scs7","Il vaut sept"),("versq2","a la question deux"),
 ("huitderniers","les huit derniers bits"),("cicfaible","quatre bits de poids faible du C I C"),
 ("v1639","mille six cent trente-neuf"),
 ("n4","Niveau quatre, toujours vers la gauche"),("oct21CA","Octets deux un et C A"),
 ("structmia","la structure du message initial d'adresse"),("h0bits","quatre bits de H zero"),
 ("catbits","six bits de categorie"),("h0vaut","H zero vaut"),
 ("h0lu","messages d'adresse, emis vers l'avant"),("h1vaut","H un vaut"),
 ("h1lu","avec informations supplementaires"),("cestmia","C'est donc un M I A"),
 ("cat","Categorie : zero zero un zero un zero"),("abonne","abonne demandeur ordinaire"),
 ("particulier","Un particulier"),("oct57C9","cinq sept et C neuf"),
 ("ind12","douze bits d'indicateurs de message"),("nbsig","le nombre de signaux d'adresse"),
 ("v957","Les douze bits valent neuf cinq sept"),("aal","de A a L"),
 ("chaquecase","Chaque case a sa propre table"),("dc01","Les bits D et C valent zero un"),
 ("natcircuit","la rubrique nature du circuit"),("nosat","pas de circuit satellite"),
 ("sat","un circuit satellite fait partie de la connexion"),("lutable","j'ai lu la table"),
 ("formulaire","Le formulaire complet"),("v1100","valent un un zero zero"),
 ("douze","douze chiffres"),("sixoctets","Six octets"),
 ("quartetdroite","le quartet de droite sort en premier"),
 ("d1","Deux deux : deux, deux"),("d2","Sept un : un, sept"),
 ("d3","Quatre sept : sept, quatre"),("d4","Trois zero : zero, trois"),
 ("d5","Cinq zero : zero, cinq"),("d6","Neuf sept : sept, neuf"),
 ("numero","Plus deux cent vingt et un"),("senegal","Un numero senegalais"),
 ("octB0","Reste l'octet B zero"),("premieroctet","le premier octet d'indicateurs"),
 ("q2","Question deux : le trajet"),("scsq2","Le S C S vaut sept"),
 ("carrefour","Un bit par carrefour"),("psa","Au depart, P S A"),
 ("vpts6","mene a P T S six"),("apts6","A P T S six, bit un egale un"),
 ("vpts2","mene a P T S deux"),("apts2","A P T S deux, bit un egale un"),
 ("vpts3","mene a P T S trois"),("apts3","A P T S trois, bit zero egale un"),
 ("vpsb","mene a P S B"),("trajet","Le trajet est donc"),
 ("voila","Voila. La trame est lue"),("retenir","on part du bord droit"),
 ("metier","C'est tout le metier"),
]
T={};prec=0.0;manques=[]
for k,ph in DEM:
    v=trouve(ph,prec)
    if v is None:
        v=trouve(ph,0.0)
        if v is None: manques.append((k,ph)); continue
    T[k]=v; prec=v
print("resolues :",len(T),"/",len(DEM))
if manques:
    print("MANQUES :")
    for k,ph in manques: print("  ",k,"->",ph)
with open('cues.js','w',encoding='utf-8') as f:
    f.write("/* ancres relevees mot a mot sur la bande son — aucune n'est estimee */\nconst T = {\n")
    for k,v in T.items(): f.write("  %s: %s,\n"%(k,v))
    f.write("};\n")
