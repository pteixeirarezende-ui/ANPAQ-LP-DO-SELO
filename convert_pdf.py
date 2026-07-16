import fitz

pdf_path = "assets/img/BANNER ANPAQ  (80 x 150 cm) b.pdf"
out_path = "assets/img/selo-oficial-anpaq-high-res.png"

print(f"Opening {pdf_path}")
doc = fitz.open(pdf_path)
page = doc.load_page(0)

# The original rect is roughly 0, 0, 2268, 4251
# We crop the bottom ~22% to remove the checklist and "ASSOCIE-SE" block
r = page.rect
clip_rect = fitz.Rect(r.x0, r.y0, r.x1, r.y1 * 0.78)

# Use 72 DPI (which outputs ~2268px width) - perfect for retina web displays
pix = page.get_pixmap(dpi=72, clip=clip_rect)
pix.save(out_path)
print(f"Saved high-res image to {out_path}")
