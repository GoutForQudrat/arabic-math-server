const {mathjax} = require('mathjax-full/js/mathjax.js');
const {TeX} = require('mathjax-full/js/input/tex.js');
const {SVG} = require('mathjax-full/js/output/svg.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AllPackages} = require('mathjax-full/js/input/tex/AllPackages.js');

// تجهيز المحرك (يشتغل مرة واحدة بس عشان السرعة)
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({packages: AllPackages});
const svg = new SVG({fontCache: 'none'});
const html = mathjax.document('', {InputJax: tex, OutputJax: svg});

module.exports = (req, res) => {
  try {
    const latex = req.query.latex || 'x';
    
    // عملية التحويل
    const node = html.convert(latex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16
    });
    
    const svgString = adaptor.innerHTML(node);
    
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.send(svgString);
    
  } catch (error) {
    res.status(500).send("خطأ: " + error.message);
  }
};
