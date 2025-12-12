const {mathjax} = require('mathjax-full/js/mathjax.js');
const {TeX} = require('mathjax-full/js/input/tex.js');
const {SVG} = require('mathjax-full/js/output/svg.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
const {AllPackages} = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

// إعدادات المترجم العربي
const tex = new TeX({
  packages: AllPackages,
  macros: {
    // هنا نعرف أمر جديد اسمه "جذر عربي" يقوم بقلب الجذر ومحتواه مرتين عشان يضبط
    arsqrt: ['\\style{transform: scaleX(-1); display:inline-block;}{\\sqrt{\\style{transform: scaleX(-1); display:inline-block;}{#1}}}', 1]
  }
});

const svg = new SVG({fontCache: 'none'});
const html = mathjax.document('', {InputJax: tex, OutputJax: svg});

module.exports = (req, res) => {
  try {
    let latex = req.query.latex || '1+2';
    
    // 1. تحويل الأرقام الإنجليزية إلى هندية (عربية) تلقائياً
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    latex = latex.replace(/[0-9]/g, function(w) { return arabicDigits[+w] });

    // 2. استبدال أي جذر عادي "sqrt" بجذرنا العربي المطور "arsqrt"
    latex = latex.replace(/\\sqrt/g, '\\arsqrt');

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
    res.status(500).send("Error: " + error.message);
  }
};
