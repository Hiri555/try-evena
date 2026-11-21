#!/usr/bin/env python3
"""Verifie le decodage de la trame du TD contre les tables du cours.

La chaine de l'enonce compte 43 chiffres entre les fanions : un nombre impair.
Elle ne peut donc pas s'aligner en octets depuis la gauche. On aligne depuis
la droite, ce qui est aussi le sens de lecture (premier bit emis a droite).
"""
S = "2B0975030477122C957CA21667762B77B04D808087E"
B = lambda v, n: format(v, "0" + str(n) + "b")

assert len(S) % 2 == 1, "la chaine de l'enonce a bien un nombre impair de chiffres"
tete, reste = S[0], S[1:]
oct_ = [reste[i:i+2] for i in range(0, len(reste), 2)]
O = oct_[::-1]                      # O[0] = l'octet le plus a droite

print("demi-octet orphelin a gauche (partie non reecrite) :", tete)
print("octets, gauche -> droite :", " ".join(oct_), "\n")

b = int(O[1], 16); print("O1  BIR|NSR  %s -> BIR=%d  NSR=%d" % (O[1], b >> 7, b & 0x7F))
b = int(O[2], 16); print("O2  BIA|NSA  %s -> BIA=%d  NSA=%d" % (O[2], b >> 7, b & 0x7F))
b = int(O[3], 16); print("O3  res|INL  %s -> reserve=%s  INL=%d" % (O[3], B(b >> 6, 2), b & 0x3F))
b = int(O[4], 16); print("O4  SER      %s -> DSS=%s  INS=%s" % (O[4], B(b >> 4, 4), B(b & 0xF, 4)))

v = 0
for i, k in enumerate(range(5, 10)):
    v |= int(O[k], 16) << (8 * i)
print("\netiquette 40 bits :", " ".join(O[5:10][::-1]), "=", B(v, 40))
print("   CPD  bits 0-13  =", v & 0x3FFF)
print("   CPO  bits 14-27 =", (v >> 14) & 0x3FFF)
print("   SCS  bits 28-31 =", (v >> 28) & 0xF, "=", B((v >> 28) & 0xF, 4))
print("   CIC  = 8 bits hauts + SCS =", (((v >> 32) & 0xFF) << 4) | ((v >> 28) & 0xF))

v = int(O[11], 16) << 8 | int(O[10], 16)
print("\nentete %s %s -> H0=%s  H1=%s  categorie=%s  reserve=%s" % (
      O[11], O[10], B(v & 0xF, 4), B((v >> 4) & 0xF, 4), B((v >> 8) & 0x3F, 6), B((v >> 14) & 3, 2)))
v = int(O[13], 16) << 8 | int(O[12], 16)
print("indicateurs %s %s -> 957 ? %s   nombre de signaux = %d" % (
      O[13], O[12], format(v & 0xFFF, "03X"), (v >> 12) & 0xF))
d = []
for k in range(14, 20):
    b = int(O[k], 16); d += [b & 0xF, b >> 4]
print("numero %s -> +%s" % (" ".join(O[14:20][::-1]), "".join(map(str, d))))
print("O20 premier octet d'indicateurs :", O[20], "=", B(int(O[20], 16), 8))
