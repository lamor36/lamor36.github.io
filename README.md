# CV web · Martín Lamorgese

CV web (ES/EN) publicado en GitHub Pages. **Una sola fuente de datos** genera la web, el PDF y el Word.

## Editar contenido

Todo está en [`data/cv.es.json`](data/cv.es.json) y [`data/cv.en.json`](data/cv.en.json): perfil, aptitudes, experiencia, educación, idiomas.

- Nuevo puesto: añade un objeto al principio de `experience` (`"end": null` = actualidad).
- Contacto: `basics.show` controla qué se publica (teléfono oculto por defecto: el repo es público).
- Foto de perfil (opcional): guarda la imagen en `public/photo.jpg` (cuadrada, ≥ 400 px) y añade `"photo": "assets/photo.jpg"` dentro de `basics` en ambos JSON. Sin ese campo no se muestra nada.
- Nuevo idioma: copia un JSON a `data/cv.<xx>.json`; aparece solo en el selector.

## Desarrollo

```bash
npm install
npm run dev        # build sin PDF + servidor en http://localhost:4173
npm run build      # build completo (HTML + PDF + DOCX) en dist/
```

Diseño: [`src/styles.css`](src/styles.css) (incluye estilos `@media print` para el PDF). Estructura HTML: [`src/template.mjs`](src/template.mjs). Word: [`scripts/docx.mjs`](scripts/docx.mjs).

## Despliegue

Cada push a `main` ejecuta `.github/workflows/deploy.yml`, que construye y publica en GitHub Pages.
Activar una vez: *Settings → Pages → Source: GitHub Actions*.
