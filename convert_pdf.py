import fitz

pdf_path = "assets/img/BANNER ANPAQ  (80 x 150 cm) b.pdf"
out_path = "assets/img/selo-oficial-anpaq-high-res.png"

print(f"Opening {pdf_path}")
doc = fitz.open(pdf_path)
page = doc.load_page(0)
# Use a high DPI to get a great quality image (e.g. 300)
pix = page.get_pixmap(dpi=300)
pix.save(out_path)
print(f"Saved high-res image to {out_path}")
