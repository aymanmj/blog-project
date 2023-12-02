exports.get401 = (req, res, next) => {
  res
    .status(401)
    .render("401", { pageTitle: "Unauthorized Access", path: "/401" });
};

exports.get404 = (req, res, next) => {
  res.status(404).render("404", { pageTitle: "Page Not Found", path: "/404" });
};
