"""Minimal Wikimedia Commons API client (rate-limit aware)."""
import json, re, time, urllib.parse, urllib.request, urllib.error

UA = "DocumentaryResearchTool/1.0 (licensed-media lookup; python-urllib)"
API = "https://commons.wikimedia.org/w/api.php"


def http(url, tries=6):
    for k in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120).read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and k < tries - 1:
                wait = int(e.headers.get("Retry-After") or 0) or 5 * 2 ** k
                time.sleep(min(wait, 90)); continue
            raise


def api(**params):
    params.setdefault("format", "json")
    return json.loads(http(API + "?" + urllib.parse.urlencode(params)))


def strip(h):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", h or "")).strip()


def fileinfo(titles, width=None):
    p = dict(action="query", prop="imageinfo", iiprop="url|size|mime|extmetadata", titles="|".join(titles))
    if width: p["iiurlwidth"] = width  # use standard sizes only: 250, 330, 500, 960, 1280, 1920, 3840
    out = []
    for pg in api(**p)["query"]["pages"].values():
        if "imageinfo" not in pg: continue
        i = pg["imageinfo"][0]; m = i.get("extmetadata", {})
        g = lambda k: strip(m.get(k, {}).get("value", ""))
        out.append(dict(title=pg["title"], url=i["url"], thumb=i.get("thumburl"), width=i["width"], height=i["height"],
                        mime=i.get("mime"), duration=i.get("duration"), page="https://commons.wikimedia.org/wiki/" + urllib.parse.quote(pg["title"].replace(" ", "_")),
                        artist=g("Artist"), credit=g("Credit"), license=g("LicenseShortName"), licenseUrl=g("LicenseUrl"),
                        attribution=g("Attribution"), attributionRequired=g("AttributionRequired"), date=g("DateTimeOriginal"),
                        description=g("ImageDescription")[:400], restrictions=g("Restrictions"), usage=g("UsageTerms")))
    return out


def search(q, limit=50):
    r = api(action="query", list="search", srnamespace=6, srlimit=limit, srsearch=q)
    return [x["title"] for x in r["query"]["search"]]


def category(cat, limit=200, kind="file"):
    r = api(action="query", list="categorymembers", cmtitle=cat, cmlimit=limit, cmtype=kind)
    return [x["title"] for x in r["query"]["categorymembers"]]


def download(url, dest):
    data = http(url)
    open(dest, "wb").write(data)
    return len(data)
