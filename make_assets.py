"""
One-time brand-asset generator for the portfolio.

Produces:
  assets/og-image.png   1200x630  social link-preview card (Open Graph / Twitter)
  favicon-32.png        32x32     raster favicon fallback
  apple-touch-icon.png  180x180   iOS home-screen / bookmark icon

The "YB" monogram favicon.svg is hand-authored (committed alongside this file).
Run:  python make_assets.py
"""
from PIL import Image, ImageDraw, ImageFont

NAVY = (30, 58, 138)        # --accent  #1e3a8a
NAVY_DARK = (23, 37, 84)    # --accent-dark #172554
INK = (17, 24, 39)
WHITE = (255, 255, 255)
MUTED = (197, 205, 226)     # soft off-white for secondary text

FONTS = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(rf"{FONTS}\{name}", size)


def vgradient(size, top, bottom):
    """Vertical gradient image."""
    w, h = size
    base = Image.new("RGB", size, top)
    grad = Image.new("L", (1, h))
    for y in range(h):
        grad.putpixel((0, y), int(255 * y / max(h - 1, 1)))
    grad = grad.resize(size)
    return Image.composite(Image.new("RGB", size, bottom), base, grad)


def rounded_mask(size, radius):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0], size[1]], radius, fill=255)
    return m


def cover_crop(im, target):
    """Resize+crop `im` to exactly fill `target` (like CSS object-fit: cover)."""
    tw, th = target
    iw, ih = im.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - tw) // 2, (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def make_og():
    W, H = 1200, 630
    card = vgradient((W, H), NAVY, NAVY_DARK)
    draw = ImageDraw.Draw(card)

    # --- right-side headshot in a rounded frame (mirrors the hero) ---
    photo_w, photo_h = 360, 470
    px, py = W - photo_w - 70, (H - photo_h) // 2
    shot = cover_crop(Image.open("assets/headshot.jpg").convert("RGB"), (photo_w, photo_h))
    mask = rounded_mask((photo_w, photo_h), 28)
    # subtle white border behind the photo
    draw.rounded_rectangle([px - 4, py - 4, px + photo_w + 4, py + photo_h + 4],
                           28 + 4, fill=(255, 255, 255))
    card.paste(shot, (px, py), mask)

    # --- left-side text column ---
    x = 80
    eyebrow = font("segoeui.ttf", 26)
    name = font("segoeuib.ttf", 86)
    role = font("segoeui.ttf", 30)
    url = font("segoeuib.ttf", 28)

    draw.text((x, 150), "INFORMATICS @ UW  ·  DATA SCIENCE", font=eyebrow, fill=MUTED)
    draw.text((x, 196), "Yuta", font=name, fill=WHITE)
    draw.text((x, 290), "Banishky", font=name, fill=WHITE)

    role_lines = ["Software developer — AI applications,", "data analysis & full-stack web"]
    ry = 410
    for ln in role_lines:
        draw.text((x, ry), ln, font=role, fill=MUTED)
        ry += 40

    draw.text((x, 500), "yutabanishky.com", font=url, fill=WHITE)

    card.save("assets/og-image.png")
    print("wrote assets/og-image.png", card.size)


def monogram(size, radius_ratio=0.22, fsize_ratio=0.5):
    img = Image.new("RGB", (size, size), NAVY)
    # round the corners by compositing over transparent where saved as PNG
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    grad = vgradient((size, size), NAVY, NAVY_DARK).convert("RGBA")
    mask = rounded_mask((size, size), int(size * radius_ratio))
    out.paste(grad, (0, 0), mask)
    draw = ImageDraw.Draw(out)
    f = font("segoeuib.ttf", int(size * fsize_ratio))
    text = "YB"
    bbox = draw.textbbox((0, 0), text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) / 2 - bbox[0], (size - th) / 2 - bbox[1]), text, font=f, fill=WHITE)
    return out


def make_icons():
    monogram(32).save("favicon-32.png")
    print("wrote favicon-32.png")
    monogram(180).save("apple-touch-icon.png")
    print("wrote apple-touch-icon.png")


if __name__ == "__main__":
    make_og()
    make_icons()
