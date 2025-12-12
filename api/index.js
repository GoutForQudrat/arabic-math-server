const mjAPI = require("mathjax-node");

// إعداد المصنع
mjAPI.config({
  MathJax: {
    // هنا نقول له اسمح لنا نستخدم حزم الرسومات
  }
});
mjAPI.start();

module.exports = (req, res) => {
  // 1. استلام المعادلة من الرابط
  let latex = req.query.latex || "x";

  // 2. تحويل المعادلة لصورة
  mjAPI.typeset({
    math: latex,
    format: "TeX", // نوع الكود المدخل
    svg: true,     // نبيه يخرج صورة فيكتور
    width: 100     // عرض افتراضي
  }, function (data) {
    if (!data.errors) {
      // 3. نجاح! إرسال الصورة
      res.setHeader("Content-Type", "image/svg+xml");
      // هذا السطر يخلي الصورة تتخزن عشان تفتح بسرعة المرة الجاية
      res.setHeader("Cache-Control", "s-maxage=86400"); 
      res.send(data.svg);
    } else {
      // 4. فشل
      res.status(500).send("خطأ في المعادلة");
    }
  });
};
