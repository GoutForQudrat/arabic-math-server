const mjAPI = require("mathjax-node");

// تشغيل المحرك بوضع أساسي سريع
mjAPI.config({
  MathJax: {
    // نلغي الإضافات الخارجية عشان ما يعلق
  }
});
mjAPI.start();

module.exports = (req, res) => {
  const latex = req.query.latex || "x";

  mjAPI.typeset({
    math: latex,
    format: "TeX",
    svg: true,
  }, function (data) {
    if (!data.errors) {
      res.setHeader("Content-Type", "image/svg+xml");
      // هذا الكود يخلي المتصفح يحفظ الصورة عشان تفتح بسرعة البرق مستقبلاً
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(data.svg);
    } else {
      res.status(500).send("Error");
    }
  });
};
