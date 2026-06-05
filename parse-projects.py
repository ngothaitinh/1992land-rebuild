import re

files = {
    "THANH_PHU": r"C:/Users/ASUS/.claude/projects/C--Users-ASUS-Desktop-1992-1992land-rebuild/ac697616-9926-4910-90bc-41e652e3bce1/tool-results/bzuffcepc.txt",
    "LA_HOME": r"C:/Users/ASUS/.claude/projects/C--Users-ASUS-Desktop-1992-1992land-rebuild/ac697616-9926-4910-90bc-41e652e3bce1/tool-results/bgm6ouybr.txt",
}

for label, path in files.items():
    with open(path, encoding="utf-8") as f:
        html = f.read()

    print(f"\n{'='*20} {label} {'='*20}")

    # Title
    m = re.search(r"<title>(.*?)</title>", html)
    print("Title:", m.group(1) if m else "N/A")

    # Meta description
    m = re.search(r'name=["\']description["\'][^>]*content=["\']([^"\']{0,400})', html)
    if not m:
        m = re.search(r'content=["\']([^"\']{0,400})["\'][^>]*name=["\']description["\']', html)
    print("Meta desc:", m.group(1) if m else "N/A")

    # OG image
    m = re.search(r'property=["\']og:image["\'][^>]*content=["\']([^"\']+)', html)
    if not m:
        m = re.search(r'content=["\']([^"\']+)["\'][^>]*property=["\']og:image["\']', html)
    print("OG image:", m.group(1) if m else "N/A")

    # All tpiland images (unique, first 8)
    imgs = list(dict.fromkeys(re.findall(
        r"https://tpiland\.com/wp-content/uploads/[^\s\"<>\']+\.(?:jpg|jpeg|png|webp)",
        html
    )))
    print("All images:")
    for img in imgs[:8]:
        print(" ", img)

    # Spec rows
    specs = re.findall(
        r"(?:Di[eệ]n t[ií]ch|Gi[aá] b[aá]n|V[iị] tr[ií]|Ch[uủ] [dđ][aầ]u t[uư]|Ti[eế]n [dđ][oộ]|Ph[aá]p l[yý]|Lo[aạ]i h[iì]nh|Quy m[oô]|T[eổ]ng di[eệ]n|S[oố] l[uư][oợ]ng|T[aầ]ng|Block|M[aậ]t [dđ][oộ]|H[aạ] t[aầ]ng)[^<]{0,200}",
        html
    )
    print("Specs:")
    for s in specs[:15]:
        print(" -", s.strip()[:150])
