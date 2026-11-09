"""Marque les images générées par IA (docs/assets/themes/*.webp) dans leurs métadonnées XMP.

Utilise le vocabulaire IPTC « Digital Source Type » : trainedAlgorithmicMedia = média entièrement généré
par une IA. Les images sont réenregistrées sans perte de qualité visible (WebP qualité 80).
Usage : python3 -I tools/mark_ai_images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
XMP = """<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
    Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
    photoshop:Credit="Image générée par IA – Swiss Knowhow">
   <dc:description><rdf:Alt><rdf:li xml:lang="x-default">Image d'illustration générée par intelligence artificielle. Elle ne représente pas un lieu, une personne ou un événement réel précis.</rdf:li></rdf:Alt></dc:description>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">Swiss Knowhow – Com Consulting Sàrl</rdf:li></rdf:Alt></dc:rights>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>""".encode("utf-8")

for f in sorted((ROOT / "docs" / "assets" / "themes").glob("*.webp")):
    with Image.open(f) as im:
        if b"trainedAlgorithmicMedia" in (im.info.get("xmp") or b""):
            print(f"déjà marquée : {f.name}")
            continue
        im = im.convert("RGB")
    im.save(f, "WEBP", quality=80, method=5, xmp=XMP)
    print(f"marquée : {f.name}")
