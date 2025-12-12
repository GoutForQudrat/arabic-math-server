const {mathjax} = require('mathjax-full/js/mathjax.js');
const {TeX} = require('mathjax-full/js/input/tex.js');
const {SVG} = require('mathjax-full/js/output/svg.js');
const {liteAdaptor} = require('mathjax-full/js/adaptors/liteAdaptor.js');
const {RegisterHTMLHandler} = require('mathjax-full/js/handlers/html.js');
// تحميل الحزم الضرورية
require('mathjax-full/js/input/tex/graphics/GraphicsConfiguration.js');
const {AllPackages} = require('mathjax-full/js/input/tex/AllPackages.js');

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages
});

const svg = new SVG({fontCache: 'none'});
const html = mathjax.document('', {InputJax: tex, OutputJax: svg});

module.exports = (req, res) => {
  try {
    let latex = req.query.latex || '1';
    
    // 1. الأرقام الهندية
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    latex = latex.replace(/[0-9]/g, w => arabicDigits[+w]);

    // 2. الجذر المقلوب (الحل السحري)
    // نضيف \require{graphics} في بداية كل طلب
    if (!latex.includes("graphics")) {
       latex = "\\require{graphics} " + latex;
    }
    
    // نستبدل \sqrt{...} بـ \reflectbox{\sqrt{\reflectbox{...}}}
    // ملاحظة: هذا يشتغل مع الجذور البسيطة اللي ما فيها أقواس متداخلة
    // إذا معادلاتك بسيطة، هذا بيمشي تمام
    
    // التعديل اليدوي من طرفك في الرابط أضمن:
    // أنتِ ارسلي الرابط كذا: \reflectbox{\sqrt{\reflectbox{36}}}
    // والسيرفر بس بيضيف الأرقام الهندية ويشغل الرسومات
    
    const node = html.convert(latex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16
    });
    
    const svgString = adaptor.innerHTML(node);
    
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "s-maxage=86400");
    res.send(svgString);
    
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};
