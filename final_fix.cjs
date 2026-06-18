const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

// Replace remaining 'initial' etc in status mapping
c = c.replace(/case 'initial':/g, "case 'nuevo lead':");
c = c.replace(/case 'development':/g, "case 'en desarrollo':");
c = c.replace(/case 'billed':/g, "case 'cobrado':");
c = c.replace(/case 'finished':/g, "case 'finalizado':");

c = c.replace(/=== 'initial'/g, "=== 'nuevo lead'");
c = c.replace(/=== 'development'/g, "=== 'en desarrollo'");
c = c.replace(/=== 'billed'/g, "=== 'cobrado'");
c = c.replace(/=== 'finished'/g, "=== 'finalizado'");

// Fix Project types
c = c.replace(/<Project\[\]>/g, "<any[]>");
c = c.replace(/<Project \| null>/g, "<any>");
c = c.replace(/Project\['status'\]/g, "any");

// Remove Proyectos menu item
c = c.replace(/<button[^>]*>\s*<Briefcase[^>]*\/>\s*<span[^>]*>Proyectos<\/span>\s*<\/button>/g, "");
// Another pass for the side menu item
c = c.replace(/onClick=\{\(\) => setActiveTab\('dashboard'\)\}[^>]*>\s*<Briefcase[^>]*\/>\s*<span[^>]*>Proyectos<\/span>\s*<\/button>/g, "");

// Make Product Modal use ProductForm
// First, find the modal block and replace it. Since it's large, we can just find `isProductModalOpen && (` and replace the whole thing or inject ProductForm.
// Easiest is to replace the start of the modal with our component.
const productModalRegex = /\{isProductModalOpen && \(\s*<div className="fixed inset-0[^]*?<\/div>\s*\)\}/;
if (productModalRegex.test(c)) {
  c = c.replace(productModalRegex, `{isProductModalOpen && (
        <ProductForm
          product={editingProduct}
          onSave={async (prod) => {
            if (editingProduct) {
              const res = await fetch(\`/api/products/\${editingProduct.id}\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prod)
              });
              if (res.ok) {
                const updated = await res.json();
                setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                alert("Producto actualizado");
                setIsProductModalOpen(false);
              }
            } else {
              const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(prod)
              });
              if (res.ok) {
                const saved = await res.json();
                setProducts(prev => [...prev, saved]);
                alert("Producto creado");
                setIsProductModalOpen(false);
              } else {
                alert("Error al guardar (¿SKU repetido?)");
              }
            }
          }}
          onCancel={() => setIsProductModalOpen(false)}
          existingSkus={products.map(p => p.sku.toLowerCase())}
          departmentContext={currentUser?.department || 'Bazar'}
        />
      )}`);
}

fs.writeFileSync('src/App.tsx', c);
