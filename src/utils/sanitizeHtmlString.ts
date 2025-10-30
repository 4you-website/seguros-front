export function sanitizeHtmlString(html: string): string {
    if (!html) return "";

    return html
        // eliminar meta, title, script, style, xml comments, y divs extra de collapses
        .replace(/<meta[^>]*>/gi, "")
        .replace(/<title[^>]*>.*?<\/title>/gi, "")
        .replace(/<!--.*?-->/gs, "")
        .replace(/<div[^>]*data-toggle="collapse"[^>]*>.*?<\/div>/gis, "")
        .replace(/<div[^>]*id="bTexto"[^>]*>/gi, "")
        .replace(/<\/div>\s*$/gi, "")
        // eliminar clases o atributos colapsables de bootstrap
        .replace(/\sclass="[^"]*collapse[^"]*"/gi, "")
        // eliminar atributos inline de estilo peligrosos
        .replace(/style="[^"]*"/gi, "")
        .trim();
}
