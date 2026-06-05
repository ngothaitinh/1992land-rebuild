import ftplib, os, sys

HOST = "160.191.88.139"
USER = "huutho1992"
PASS = "jREuNUORAF"
LOCAL_BASE = r"C:\Users\ASUS\Desktop\1992\1992land-rebuild\out"
REMOTE_BASE = "/public_html"

ftp = ftplib.FTP()
ftp.connect(HOST, 21)
ftp.login(USER, PASS)
ftp.set_pasv(True)

def ensure_dir(ftp, d):
    try: ftp.mkd(d)
    except: pass

count = errors = 0
for root, dirs, files in os.walk(LOCAL_BASE):
    rel = os.path.relpath(root, LOCAL_BASE).replace("\\", "/")
    remote_dir = REMOTE_BASE if rel == "." else f"{REMOTE_BASE}/{rel}"
    ensure_dir(ftp, remote_dir)
    for fname in files:
        rpath = f"{remote_dir}/{fname}"
        try:
            with open(os.path.join(root, fname), "rb") as f:
                ftp.storbinary(f"STOR {rpath}", f)
            count += 1
        except Exception as e:
            errors += 1
            print(f"ERR {rpath}: {e}", file=sys.stderr)

ftp.quit()
print(f"Done: {count} OK, {errors} errors")
