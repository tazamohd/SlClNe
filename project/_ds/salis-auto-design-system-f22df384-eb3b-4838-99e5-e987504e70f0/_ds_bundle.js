/* @ds-bundle: {"format":4,"namespace":"SALISAUTODesignSystem_f22df3","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Pagination","sourcePath":"components/data/Pagination.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"TableHeader","sourcePath":"components/data/Table.jsx"},{"name":"TableBody","sourcePath":"components/data/Table.jsx"},{"name":"TableFooter","sourcePath":"components/data/Table.jsx"},{"name":"TableRow","sourcePath":"components/data/Table.jsx"},{"name":"TableHead","sourcePath":"components/data/Table.jsx"},{"name":"TableCell","sourcePath":"components/data/Table.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"LinearLoader","sourcePath":"components/feedback/LinearLoader.jsx"},{"name":"Progress","sourcePath":"components/feedback/Progress.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Label","sourcePath":"components/forms/Label.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/RadioGroup.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumb","sourcePath":"components/navigation/Breadcrumb.jsx"},{"name":"PageHeader","sourcePath":"components/navigation/PageHeader.jsx"},{"name":"Accordion","sourcePath":"components/surfaces/Accordion.jsx"},{"name":"Avatar","sourcePath":"components/surfaces/Avatar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardHeader","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardTitle","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardDescription","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardContent","sourcePath":"components/surfaces/Card.jsx"},{"name":"CardFooter","sourcePath":"components/surfaces/Card.jsx"},{"name":"Dialog","sourcePath":"components/surfaces/Dialog.jsx"},{"name":"Separator","sourcePath":"components/surfaces/Separator.jsx"},{"name":"StatCard","sourcePath":"components/surfaces/StatCard.jsx"},{"name":"Tabs","sourcePath":"components/surfaces/Tabs.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"1a098b33cd03","components/data/Pagination.jsx":"594b4589dd6c","components/data/Table.jsx":"a07701b2ef2f","components/feedback/Alert.jsx":"0bccb8fcf138","components/feedback/Badge.jsx":"93fa7b059ced","components/feedback/EmptyState.jsx":"07d29c7387b8","components/feedback/LinearLoader.jsx":"6f289397c665","components/feedback/Progress.jsx":"a708bde049b2","components/feedback/Skeleton.jsx":"1c7d8131579d","components/feedback/StatusBadge.jsx":"d060c8061565","components/feedback/Toast.jsx":"95251ba01168","components/feedback/Tooltip.jsx":"e1daa30e3d10","components/forms/Checkbox.jsx":"59ad255cee7e","components/forms/Input.jsx":"73766aeac85b","components/forms/Label.jsx":"b59ccf5e872c","components/forms/RadioGroup.jsx":"256e480cd151","components/forms/Select.jsx":"a56e53ab3397","components/forms/Switch.jsx":"40b6e9b3f23b","components/forms/Textarea.jsx":"f242f6806528","components/navigation/Breadcrumb.jsx":"5227dc838471","components/navigation/PageHeader.jsx":"b37db8a29bc0","components/surfaces/Accordion.jsx":"cccac401c3df","components/surfaces/Avatar.jsx":"76ec66577b6b","components/surfaces/Card.jsx":"b07dd7d6f2da","components/surfaces/Dialog.jsx":"5831daf53790","components/surfaces/Separator.jsx":"8eab47af4b41","components/surfaces/StatCard.jsx":"f02be3b02e51","components/surfaces/Tabs.jsx":"91829a2d6a3e","ui_kits/gms-admin/App.jsx":"53e67ed27ce5","ui_kits/gms-admin/CustomersScreen.jsx":"027c15872e08","ui_kits/gms-admin/DashboardScreen.jsx":"289e2bc15210","ui_kits/gms-admin/JobCardsScreen.jsx":"989586d6eb65","ui_kits/gms-admin/LoginScreen.jsx":"df3b86b9f920","ui_kits/gms-admin/Shell.jsx":"606a68b6e8aa","ui_kits/gms-admin/icons.jsx":"4fd59959ac9c"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SALISAUTODesignSystem_f22df3 = window.SALISAUTODesignSystem_f22df3 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `.sa-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;border-radius:var(--radius-md,8px);font-family:var(--font-action,Poppins,sans-serif);font-weight:500;cursor:pointer;transition:all .2s ease;border:none;text-decoration:none;box-sizing:border-box}
.sa-btn:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg-page,#F8FAFC),0 0 0 4px var(--ring,#0A5ED7)}
.sa-btn:disabled{pointer-events:none;opacity:.5}
.sa-btn svg,.sa-btn i{width:16px;height:16px;flex-shrink:0}
.sa-btn-primary{background:var(--salis-gradient);color:#fff;box-shadow:var(--shadow-sm)}
.sa-btn-primary:hover{background:var(--salis-gradient-hover);transform:translateY(-1px);box-shadow:var(--glow-blue)}
.sa-btn-secondary{background:transparent;color:var(--salis-blue);border:1.5px solid var(--salis-blue)}
.sa-btn-secondary:hover{background:rgba(10,94,215,.1)}
.sa-btn-outline{background:var(--surface-card);color:var(--text-primary);border:2px solid var(--border-default);box-shadow:var(--shadow-sm)}
.sa-btn-outline:hover{background:var(--surface-inset);border-color:var(--border-strong)}
.sa-btn-ghost{background:transparent;color:var(--text-primary)}
.sa-btn-ghost:hover{background:rgba(10,94,215,.08);color:var(--salis-blue)}
.sa-btn-danger{background:var(--salis-orange);color:#fff;box-shadow:var(--shadow-sm)}
.sa-btn-danger:hover{background:var(--salis-orange-hover)}
.sa-btn-link{background:none;color:var(--salis-blue);height:auto!important;padding:0!important}
.sa-btn-link:hover{text-decoration:underline}`;
if (typeof document !== "undefined" && !document.getElementById("sa-btn-css")) {
  const s = document.createElement("style");
  s.id = "sa-btn-css";
  s.textContent = css;
  document.head.appendChild(s);
}
const SIZES = {
  sm: {
    height: 36,
    padding: "0 16px",
    fontSize: 14,
    borderRadius: 6
  },
  default: {
    height: 44,
    padding: "0 24px",
    fontSize: 16
  },
  lg: {
    height: 48,
    padding: "0 32px",
    fontSize: 18
  },
  icon: {
    height: 44,
    width: 44,
    padding: 0
  }
};
function Button({
  variant = "primary",
  size = "default",
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    className: "sa-btn sa-btn-" + variant,
    style: {
      ...SIZES[size],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/data/Pagination.jsx
try { (() => {
if (typeof document !== "undefined" && !document.getElementById("sa-pgn-css")) {
  const s = document.createElement("style");
  s.id = "sa-pgn-css";
  s.textContent = `.sa-pgn{display:flex;align-items:center;justify-content:space-between;gap:12px;font-family:var(--font-ui,Inter,sans-serif);flex-wrap:wrap}
.sa-pgn-info{font-size:12px;color:var(--text-muted,#64748B)}
.sa-pgn-nav{display:flex;align-items:center;gap:4px}
.sa-pgn-btn{min-width:36px;height:36px;padding:0 8px;border-radius:var(--radius-md,8px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);color:var(--text-primary,#0F172A);font-size:13px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease}
.sa-pgn-btn:hover:not(:disabled):not(.on){border-color:var(--salis-blue,#0A5ED7);color:var(--salis-blue,#0A5ED7)}
.sa-pgn-btn.on{background:var(--salis-gradient,linear-gradient(135deg,#0A5ED7,#0BB3FF));color:#fff;border-color:transparent}
.sa-pgn-btn:disabled{opacity:.4;cursor:not-allowed}`;
  document.head.appendChild(s);
}
const Chev = ({
  flip
}) => /*#__PURE__*/React.createElement("svg", {
  width: "16",
  height: "16",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: flip ? {
    transform: "rotate(180deg)"
  } : null
}, /*#__PURE__*/React.createElement("path", {
  d: "m15 18-6-6 6-6"
}));
function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  style
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const go = p => {
    if (p >= 1 && p <= pages && onPageChange) onPageChange(p);
  };
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1,
    to = Math.min(page * pageSize, total);
  let nums = [];
  for (let i = 1; i <= pages; i++) {
    if (pages <= 7 || i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "sa-pgn",
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "sa-pgn-info"
  }, "Showing ", from, "\u2013", to, " of ", total), /*#__PURE__*/React.createElement("div", {
    className: "sa-pgn-nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "sa-pgn-btn",
    onClick: () => go(page - 1),
    disabled: page <= 1,
    "aria-label": "Previous page"
  }, /*#__PURE__*/React.createElement(Chev, null)), nums.map((n, i) => n === "…" ? /*#__PURE__*/React.createElement("span", {
    key: "e" + i,
    style: {
      padding: "0 4px",
      color: "var(--text-faint,#9BA4B0)"
    }
  }, "\u2026") : /*#__PURE__*/React.createElement("button", {
    key: n,
    className: "sa-pgn-btn" + (n === page ? " on" : ""),
    onClick: () => go(n)
  }, n)), /*#__PURE__*/React.createElement("button", {
    className: "sa-pgn-btn",
    onClick: () => go(page + 1),
    disabled: page >= pages,
    "aria-label": "Next page"
  }, /*#__PURE__*/React.createElement(Chev, {
    flip: true
  }))));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-table-css")) {
  const s = document.createElement("style");
  s.id = "sa-table-css";
  s.textContent = `.sa-table-wrap{position:relative;width:100%;overflow-x:auto}
.sa-table{width:100%;border-collapse:collapse;font-family:var(--font-ui,Inter,sans-serif);font-size:14px;color:var(--text-primary,#0F172A)}
.sa-table thead th{height:48px;padding:0 16px;text-align:left;vertical-align:middle;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:var(--text-muted,#64748B);border-bottom:1px solid var(--border-default,#E2E8F0);white-space:nowrap}
.sa-table tbody tr{border-bottom:1px solid var(--border-default,#E2E8F0);transition:background .15s ease}
.sa-table tbody tr:last-child{border-bottom:none}
.sa-table tbody tr:hover{background:rgba(10,94,215,.04)}
.sa-table td{padding:14px 16px;vertical-align:middle}
.sa-table tfoot{border-top:1px solid var(--border-default,#E2E8F0);font-weight:500;background:var(--surface-inset,#F8FAFC)}`;
  document.head.appendChild(s);
}
function Table({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "sa-table-wrap",
    style: style
  }, /*#__PURE__*/React.createElement("table", _extends({
    className: "sa-table"
  }, rest), children));
}
function TableHeader(p) {
  return /*#__PURE__*/React.createElement("thead", p);
}
function TableBody(p) {
  return /*#__PURE__*/React.createElement("tbody", p);
}
function TableFooter(p) {
  return /*#__PURE__*/React.createElement("tfoot", p);
}
function TableRow(p) {
  return /*#__PURE__*/React.createElement("tr", p);
}
function TableHead(p) {
  return /*#__PURE__*/React.createElement("th", p);
}
function TableCell(p) {
  return /*#__PURE__*/React.createElement("td", p);
}
Object.assign(__ds_scope, { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-alert-css")) {
  const s = document.createElement("style");
  s.id = "sa-alert-css";
  s.textContent = `.sa-alert{position:relative;width:100%;box-sizing:border-box;border-radius:var(--radius-lg,12px);border:1px solid;padding:12px 16px;display:flex;gap:12px;font-family:var(--font-ui,Inter,sans-serif);font-size:14px}
.sa-alert-icon{flex-shrink:0;display:flex;margin-top:1px}.sa-alert-icon svg,.sa-alert-icon i{width:18px;height:18px}
.sa-alert-title{font-weight:600;margin:0 0 2px;font-size:14px}
.sa-alert-desc{margin:0;font-size:13px;opacity:.85}
.sa-alert-default{background:var(--surface-card,#fff);border-color:var(--border-default,#E2E8F0);color:var(--text-primary,#0F172A)}
.sa-alert-info{background:rgba(11,179,255,.08);border-color:rgba(11,179,255,.35);color:var(--salis-blue,#0A5ED7)}
.sa-alert-warning{background:rgba(249,115,22,.08);border-color:rgba(249,115,22,.4);color:var(--salis-orange-hover,#EA580C)}`;
  document.head.appendChild(s);
}
const IC = {
  info: /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 16v-4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 8h.01"
  })),
  warning: /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 9v4"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17h.01"
  }))
};
function Alert({
  variant = "default",
  title,
  children,
  icon,
  style,
  ...rest
}) {
  const ic = icon !== undefined ? icon : IC[variant];
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-alert sa-alert-" + variant,
    style: style
  }, rest), ic && /*#__PURE__*/React.createElement("span", {
    className: "sa-alert-icon"
  }, ic), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "sa-alert-title"
  }, title), children && /*#__PURE__*/React.createElement("p", {
    className: "sa-alert-desc"
  }, children)));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-badge-css")) {
  const s = document.createElement("style");
  s.id = "sa-badge-css";
  s.textContent = `.sa-badge{display:inline-flex;align-items:center;gap:4px;border-radius:9999px;padding:2px 10px;font-family:var(--font-ui,Inter,sans-serif);font-size:12px;font-weight:600;border:1px solid transparent;transition:background .15s ease;white-space:nowrap}
.sa-badge-default{background:var(--salis-blue,#0A5ED7);color:#fff}
.sa-badge-secondary{background:var(--salis-blue-bright,#0BB3FF);color:#fff}
.sa-badge-destructive{background:var(--salis-orange,#F97316);color:#fff}
.sa-badge-outline{background:transparent;color:var(--text-primary,#0F172A);border-color:var(--border-default,#E2E8F0)}
.sa-badge-navy{background:var(--salis-navy,#0B1F3B);color:#fff}`;
  document.head.appendChild(s);
}
function Badge({
  variant = "default",
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "sa-badge sa-badge-" + variant
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-empty-css")) {
  const s = document.createElement("style");
  s.id = "sa-empty-css";
  s.textContent = `.sa-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px 16px;text-align:center;font-family:var(--font-ui,Inter,sans-serif)}
.sa-empty-icon{width:96px;height:96px;margin-bottom:24px;color:var(--text-faint,#9BA4B0);opacity:.4;display:flex;align-items:center;justify-content:center}
.sa-empty-icon svg,.sa-empty-icon i{width:96px;height:96px;stroke-width:1}
.sa-empty-title{font-size:20px;font-weight:600;color:var(--text-primary,#0F172A);margin:0 0 8px}
.sa-empty-desc{font-size:14px;color:var(--text-muted,#64748B);margin:0 0 24px;max-width:28rem}`;
  document.head.appendChild(s);
}
function EmptyState({
  icon,
  title,
  description,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-empty",
    style: style
  }, rest), icon && /*#__PURE__*/React.createElement("div", {
    className: "sa-empty-icon"
  }, icon), /*#__PURE__*/React.createElement("p", {
    className: "sa-empty-title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "sa-empty-desc"
  }, description), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/LinearLoader.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-ll-css")) {
  const s = document.createElement("style");
  s.id = "sa-ll-css";
  s.textContent = `@keyframes sa-ll{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
.sa-linear-loader{height:4px;width:100%;background:rgba(10,94,215,.12);overflow:hidden;border-radius:9999px}
.sa-linear-loader i{display:block;width:40%;height:100%;background:var(--salis-gradient,linear-gradient(135deg,#0A5ED7,#0BB3FF));animation:sa-ll 1.5s ease-in-out infinite}`;
  document.head.appendChild(s);
}
function LinearLoader(props) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-linear-loader",
    role: "status",
    "aria-label": "Loading"
  }, props), /*#__PURE__*/React.createElement("i", null));
}
Object.assign(__ds_scope, { LinearLoader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/LinearLoader.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Progress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-prog-css")) {
  const s = document.createElement("style");
  s.id = "sa-prog-css";
  s.textContent = `.sa-progress{width:100%;height:8px;border-radius:9999px;background:rgba(10,94,215,.1);overflow:hidden}
.sa-progress i{display:block;height:100%;background:var(--salis-gradient-r,linear-gradient(90deg,#0A5ED7,#0BB3FF));border-radius:9999px;transition:width .5s var(--ease,ease)}
.sa-progress.warn i{background:var(--salis-orange,#F97316)}`;
  document.head.appendChild(s);
}
function Progress({
  value = 0,
  warning,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-progress" + (warning ? " warn" : ""),
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    style: style
  }, rest), /*#__PURE__*/React.createElement("i", {
    style: {
      width: Math.min(100, Math.max(0, value)) + "%"
    }
  }));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Progress.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-skel-css")) {
  const s = document.createElement("style");
  s.id = "sa-skel-css";
  s.textContent = `@keyframes sa-pulse{0%,100%{opacity:1}50%{opacity:.5}}
.sa-skeleton{background:var(--border-default,#E2E8F0);border-radius:var(--radius-md,8px);animation:sa-pulse 2s cubic-bezier(.4,0,.6,1) infinite}`;
  document.head.appendChild(s);
}
function Skeleton({
  width,
  height = 16,
  circle,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-skeleton",
    style: {
      width,
      height,
      borderRadius: circle ? "9999px" : undefined,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-status-css")) {
  const s = document.createElement("style");
  s.id = "sa-status-css";
  s.textContent = `.sa-status{display:inline-flex;align-items:center;border-radius:9999px;padding:2px 10px;font-family:var(--font-ui,Inter,sans-serif);font-size:12px;font-weight:500;text-transform:capitalize;white-space:nowrap}`;
  document.head.appendChild(s);
}
/* Domain status → semantic variant. Blue = success (green is forbidden). Extend the map, never fork the component. */
const MAP = {
  completed: "success",
  paid: "success",
  delivered: "success",
  active: "success",
  resolved: "success",
  approved: "success",
  signed: "success",
  in_progress: "info",
  repair: "info",
  assigned: "info",
  sent: "info",
  scheduled: "info",
  shipped: "info",
  processing: "info",
  pending: "warning",
  waiting: "warning",
  draft: "warning",
  on_hold: "warning",
  cancelled: "destructive",
  canceled: "destructive",
  unpaid: "destructive",
  overdue: "destructive",
  failed: "destructive",
  rejected: "destructive",
  expired: "destructive"
};
const COLORS = {
  success: ["rgba(10,94,215,.12)", "var(--success,#0A5ED7)"],
  info: ["rgba(11,179,255,.12)", "#0891b2"],
  warning: ["rgba(249,115,22,.12)", "var(--warning,#F97316)"],
  destructive: ["rgba(249,115,22,.12)", "#EA580C"],
  neutral: ["var(--border-default,#E2E8F0)", "var(--text-muted,#64748B)"]
};
const STRONG = {
  success: "var(--success,#0A5ED7)",
  info: "var(--info,#0BB3FF)",
  warning: "var(--warning,#F97316)",
  destructive: "#EA580C",
  neutral: "var(--text-muted,#64748B)"
};
function StatusBadge({
  status,
  variant,
  tone = "subtle",
  children,
  style,
  ...rest
}) {
  const norm = (status || "").toLowerCase().replace(/\s+/g, "_");
  const v = variant || MAP[norm] || "neutral";
  const label = children || (status ? status.replace(/_/g, " ") : "Unknown");
  const st = tone === "strong" ? {
    background: STRONG[v],
    color: "#fff"
  } : {
    background: COLORS[v][0],
    color: COLORS[v][1]
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "sa-status",
    style: {
      ...st,
      ...style
    }
  }, rest), label);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-toast-css")) {
  const s = document.createElement("style");
  s.id = "sa-toast-css";
  s.textContent = `.sa-toast{position:relative;display:flex;align-items:flex-start;gap:12px;width:360px;max-width:100%;box-sizing:border-box;border-radius:var(--radius-lg,12px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);padding:14px 16px;box-shadow:var(--shadow-lg);font-family:var(--font-ui,Inter,sans-serif);animation:salis-slide-up .3s ease-out both}
.sa-toast-title{font-size:14px;font-weight:600;color:var(--text-primary,#0F172A);margin:0}
.sa-toast-desc{font-size:13px;color:var(--text-muted,#64748B);margin:2px 0 0}
.sa-toast-destructive{border-color:rgba(249,115,22,.5);background:var(--salis-orange,#F97316)}
.sa-toast-destructive .sa-toast-title,.sa-toast-destructive .sa-toast-desc{color:#fff}
.sa-toast-close{margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-faint,#9BA4B0);padding:2px;border-radius:4px;display:flex;flex-shrink:0}
.sa-toast-close:hover{color:var(--text-primary,#0F172A)}
.sa-toast-destructive .sa-toast-close{color:rgba(255,255,255,.8)}`;
  document.head.appendChild(s);
}
function Toast({
  variant = "default",
  title,
  description,
  onClose,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-toast" + (variant === "destructive" ? " sa-toast-destructive" : ""),
    role: "status",
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "sa-toast-title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "sa-toast-desc"
  }, description)), onClose && /*#__PURE__*/React.createElement("button", {
    className: "sa-toast-close",
    onClick: onClose,
    "aria-label": "Dismiss"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
if (typeof document !== "undefined" && !document.getElementById("sa-tt-css")) {
  const s = document.createElement("style");
  s.id = "sa-tt-css";
  s.textContent = `.sa-tt{position:relative;display:inline-flex}
.sa-tt-bubble{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);background:var(--salis-navy,#0B1F3B);color:#fff;font-family:var(--font-ui,Inter,sans-serif);font-size:12px;font-weight:500;padding:6px 10px;border-radius:6px;white-space:nowrap;opacity:0;pointer-events:none;transition:all .15s ease;z-index:50;box-shadow:var(--shadow)}
.sa-tt-bubble:after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:var(--salis-navy,#0B1F3B)}
.sa-tt:hover .sa-tt-bubble,.sa-tt:focus-within .sa-tt-bubble{opacity:1;transform:translateX(-50%) translateY(0)}`;
  document.head.appendChild(s);
}
function Tooltip({
  content,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "sa-tt",
    style: style
  }, children, /*#__PURE__*/React.createElement("span", {
    className: "sa-tt-bubble",
    role: "tooltip"
  }, content));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
if (typeof document !== "undefined" && !document.getElementById("sa-chk-css")) {
  const s = document.createElement("style");
  s.id = "sa-chk-css";
  s.textContent = `.sa-chk{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:var(--font-ui,Inter,sans-serif);font-size:14px;color:var(--text-primary,#0F172A);user-select:none}
.sa-chk-box{width:16px;height:16px;border-radius:4px;border:1px solid var(--salis-blue,#0A5ED7);background:var(--surface-card,#fff);display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease;flex-shrink:0;box-shadow:var(--shadow-sm)}
.sa-chk-box.on{background:var(--salis-blue,#0A5ED7);border-color:var(--salis-blue,#0A5ED7)}
.sa-chk input{position:absolute;opacity:0;width:0;height:0}
.sa-chk input:focus-visible+.sa-chk-box{box-shadow:0 0 0 2px var(--bg-page,#F8FAFC),0 0 0 4px var(--ring,#0A5ED7)}
.sa-chk.dis{cursor:not-allowed;opacity:.5}`;
  document.head.appendChild(s);
}
function Checkbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  style,
  ...rest
}) {
  const [un, setUn] = useState(defaultChecked);
  const on = checked !== undefined ? checked : un;
  const toggle = e => {
    const v = e.target.checked;
    if (checked === undefined) setUn(v);
    onCheckedChange && onCheckedChange(v);
  };
  return /*#__PURE__*/React.createElement("label", {
    className: "sa-chk" + (disabled ? " dis" : ""),
    style: style
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: on,
    disabled: disabled,
    onChange: toggle
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "sa-chk-box" + (on ? " on" : "")
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5"
  }))), label && /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const css = `.sa-input-wrap{position:relative;display:flex;align-items:center;width:100%}
.sa-input{width:100%;box-sizing:border-box;border-radius:var(--radius-md,8px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);color:var(--text-primary,#0F172A);font-family:var(--font-ui,Inter,sans-serif);font-size:14px;box-shadow:var(--shadow-sm);transition:all .2s ease;outline:none}
.sa-input::placeholder{color:var(--text-faint,#9BA4B0)}
.sa-input:focus{border-color:var(--ring,#0A5ED7);box-shadow:0 0 0 3px rgba(10,94,215,.2)}
.sa-input:disabled{cursor:not-allowed;opacity:.5}
.sa-input-icon{position:absolute;left:12px;color:var(--text-muted,#64748B);display:flex;pointer-events:none}
.sa-input-icon svg,.sa-input-icon i{width:20px;height:20px}`;
if (typeof document !== "undefined" && !document.getElementById("sa-input-css")) {
  const s = document.createElement("style");
  s.id = "sa-input-css";
  s.textContent = css;
  document.head.appendChild(s);
}
const H = {
  sm: 36,
  default: 44,
  lg: 48
};
function Input({
  size = "default",
  icon,
  style,
  wrapStyle,
  ...rest
}) {
  const inp = /*#__PURE__*/React.createElement("input", _extends({
    className: "sa-input",
    style: {
      height: H[size],
      padding: icon ? "0 12px 0 40px" : "0 12px",
      ...style
    }
  }, rest));
  if (!icon) return inp;
  return /*#__PURE__*/React.createElement("span", {
    className: "sa-input-wrap",
    style: wrapStyle
  }, /*#__PURE__*/React.createElement("span", {
    className: "sa-input-icon"
  }, icon), inp);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Label.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-lbl-css")) {
  const s = document.createElement("style");
  s.id = "sa-lbl-css";
  s.textContent = `.sa-label{display:inline-block;font-family:var(--font-action,Poppins,sans-serif);font-size:12px;font-weight:500;letter-spacing:0.025em;color:var(--text-primary,#0F172A);margin-bottom:6px}
.sa-label.req:after{content:' *';color:var(--salis-orange,#F97316)}`;
  document.head.appendChild(s);
}
function Label({
  required,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    className: "sa-label" + (required ? " req" : "")
  }, rest), children);
}
Object.assign(__ds_scope, { Label });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Label.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
const {
  useState
} = React;
if (typeof document !== "undefined" && !document.getElementById("sa-radio-css")) {
  const s = document.createElement("style");
  s.id = "sa-radio-css";
  s.textContent = `.sa-radio{display:inline-flex;align-items:center;gap:8px;cursor:pointer;font-family:var(--font-ui,Inter,sans-serif);font-size:14px;color:var(--text-primary,#0F172A);user-select:none}
.sa-radio-dot{width:16px;height:16px;border-radius:9999px;border:1px solid var(--salis-blue,#0A5ED7);background:var(--surface-card,#fff);display:inline-flex;align-items:center;justify-content:center;transition:all .15s ease;flex-shrink:0}
.sa-radio-dot i{width:8px;height:8px;border-radius:9999px;background:var(--salis-blue,#0A5ED7);transform:scale(0);transition:transform .15s ease}
.sa-radio-dot.on i{transform:scale(1)}
.sa-radio input{position:absolute;opacity:0;width:0;height:0}
.sa-radio input:focus-visible+.sa-radio-dot{box-shadow:0 0 0 2px var(--bg-page,#F8FAFC),0 0 0 4px var(--ring,#0A5ED7)}
.sa-radio.dis{cursor:not-allowed;opacity:.5}
.sa-radio-group{display:flex;flex-direction:column;gap:8px}`;
  document.head.appendChild(s);
}
function RadioGroup({
  value,
  defaultValue,
  onValueChange,
  options = [],
  name,
  direction = "column",
  disabled,
  style
}) {
  const [un, setUn] = useState(defaultValue);
  const cur = value !== undefined ? value : un;
  const pick = v => {
    if (value === undefined) setUn(v);
    onValueChange && onValueChange(v);
  };
  const gn = name || "sa-rg";
  return /*#__PURE__*/React.createElement("div", {
    className: "sa-radio-group",
    role: "radiogroup",
    style: {
      flexDirection: direction,
      ...style
    }
  }, options.map(o => {
    const opt = typeof o === "string" ? {
      value: o,
      label: o
    } : o;
    const on = cur === opt.value;
    return /*#__PURE__*/React.createElement("label", {
      key: opt.value,
      className: "sa-radio" + (disabled || opt.disabled ? " dis" : "")
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: gn,
      checked: on,
      disabled: disabled || opt.disabled,
      onChange: () => pick(opt.value)
    }), /*#__PURE__*/React.createElement("span", {
      className: "sa-radio-dot" + (on ? " on" : "")
    }, /*#__PURE__*/React.createElement("i", null)), /*#__PURE__*/React.createElement("span", null, opt.label));
  }));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-sel-css")) {
  const s = document.createElement("style");
  s.id = "sa-sel-css";
  s.textContent = `.sa-select-wrap{position:relative;display:inline-flex;width:100%}
.sa-select{width:100%;appearance:none;box-sizing:border-box;border-radius:var(--radius-md,8px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);color:var(--text-primary,#0F172A);font-family:var(--font-ui,Inter,sans-serif);font-size:14px;padding:0 36px 0 12px;box-shadow:var(--shadow-sm);transition:all .2s ease;outline:none;cursor:pointer}
.sa-select:focus{border-color:var(--ring,#0A5ED7);box-shadow:0 0 0 3px rgba(10,94,215,.2)}
.sa-select:disabled{cursor:not-allowed;opacity:.5}
.sa-select-chev{position:absolute;right:10px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-muted,#64748B);display:flex}`;
  document.head.appendChild(s);
}
const H = {
  sm: 36,
  default: 44,
  lg: 48
};
function Select({
  size = "default",
  children,
  style,
  wrapStyle,
  placeholder,
  ...rest
}) {
  const {
    width,
    minWidth,
    maxWidth,
    flex,
    margin,
    ...inner
  } = style || {};
  return /*#__PURE__*/React.createElement("span", {
    className: "sa-select-wrap",
    style: {
      ...(width !== undefined && {
        width
      }),
      ...(minWidth !== undefined && {
        minWidth
      }),
      ...(maxWidth !== undefined && {
        maxWidth
      }),
      ...(flex !== undefined && {
        flex
      }),
      ...(margin !== undefined && {
        margin
      }),
      ...wrapStyle
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    className: "sa-select",
    style: {
      height: H[size],
      ...inner
    }
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true,
    hidden: true
  }, placeholder), children), /*#__PURE__*/React.createElement("span", {
    className: "sa-select-chev"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
const {
  useState
} = React;
if (typeof document !== "undefined" && !document.getElementById("sa-sw-css")) {
  const s = document.createElement("style");
  s.id = "sa-sw-css";
  s.textContent = `.sa-switch{position:relative;display:inline-flex;align-items:center;width:44px;height:24px;border-radius:9999px;background:var(--border-strong,#C9D1DA);cursor:pointer;transition:background .2s ease;border:none;padding:0;flex-shrink:0}
.sa-switch.on{background:var(--salis-blue,#0A5ED7)}
.sa-switch i{position:absolute;left:2px;width:20px;height:20px;border-radius:9999px;background:#fff;box-shadow:var(--shadow-sm);transition:transform .2s ease}
.sa-switch.on i{transform:translateX(20px)}
.sa-switch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--bg-page,#F8FAFC),0 0 0 4px var(--ring,#0A5ED7)}
.sa-switch:disabled{cursor:not-allowed;opacity:.5}
.sa-switch-row{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-ui,Inter,sans-serif);font-size:14px;color:var(--text-primary,#0F172A)}`;
  document.head.appendChild(s);
}
function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  label,
  disabled,
  style
}) {
  const [un, setUn] = useState(defaultChecked);
  const on = checked !== undefined ? checked : un;
  const toggle = () => {
    const v = !on;
    if (checked === undefined) setUn(v);
    onCheckedChange && onCheckedChange(v);
  };
  const btn = /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "switch",
    "aria-checked": on,
    className: "sa-switch" + (on ? " on" : ""),
    disabled: disabled,
    onClick: toggle,
    style: label ? undefined : style
  }, /*#__PURE__*/React.createElement("i", null));
  return label ? /*#__PURE__*/React.createElement("span", {
    className: "sa-switch-row",
    style: style
  }, btn, /*#__PURE__*/React.createElement("span", null, label)) : btn;
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-ta-css")) {
  const s = document.createElement("style");
  s.id = "sa-ta-css";
  s.textContent = `.sa-textarea{width:100%;box-sizing:border-box;min-height:60px;border-radius:var(--radius-md,8px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);color:var(--text-primary,#0F172A);font-family:var(--font-ui,Inter,sans-serif);font-size:14px;padding:8px 12px;box-shadow:var(--shadow-sm);transition:all .2s ease;outline:none;resize:vertical}
.sa-textarea::placeholder{color:var(--text-faint,#9BA4B0)}
.sa-textarea:focus{border-color:var(--ring,#0A5ED7);box-shadow:0 0 0 3px rgba(10,94,215,.2)}
.sa-textarea:disabled{cursor:not-allowed;opacity:.5}`;
  document.head.appendChild(s);
}
function Textarea(props) {
  return /*#__PURE__*/React.createElement("textarea", _extends({
    className: "sa-textarea"
  }, props));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumb.jsx
try { (() => {
if (typeof document !== "undefined" && !document.getElementById("sa-bc-css")) {
  const s = document.createElement("style");
  s.id = "sa-bc-css";
  s.textContent = `.sa-bc{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-family:var(--font-ui,Inter,sans-serif);font-size:14px;list-style:none;margin:0;padding:0}
.sa-bc a{color:var(--text-muted,#64748B);text-decoration:none;transition:color .15s ease}
.sa-bc a:hover{color:var(--salis-blue,#0A5ED7)}
.sa-bc-cur{color:var(--text-primary,#0F172A);font-weight:500}
.sa-bc-sep{display:flex;color:var(--text-faint,#9BA4B0)}`;
  document.head.appendChild(s);
}
const Chev = /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "14",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "m9 18 6-6-6-6"
}));
function Breadcrumb({
  items = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Breadcrumb"
  }, /*#__PURE__*/React.createElement("ol", {
    className: "sa-bc",
    style: style
  }, items.map((it, i) => {
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("li", null, last ? /*#__PURE__*/React.createElement("span", {
      className: "sa-bc-cur",
      "aria-current": "page"
    }, it.label) : /*#__PURE__*/React.createElement("a", {
      href: it.href || "#",
      onClick: it.onClick
    }, it.label)), !last && /*#__PURE__*/React.createElement("li", {
      className: "sa-bc-sep",
      "aria-hidden": "true"
    }, Chev));
  })));
}
Object.assign(__ds_scope, { Breadcrumb });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumb.jsx", error: String((e && e.message) || e) }); }

// components/navigation/PageHeader.jsx
try { (() => {
if (typeof document !== "undefined" && !document.getElementById("sa-ph-css")) {
  const s = document.createElement("style");
  s.id = "sa-ph-css";
  s.textContent = `.sa-ph{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin-bottom:32px;font-family:var(--font-ui,Inter,sans-serif)}
.sa-ph-left{display:flex;align-items:center;gap:12px}
.sa-ph-tile{position:relative;flex-shrink:0}
.sa-ph-halo{position:absolute;inset:0;background:var(--salis-blue,#0A5ED7);border-radius:12px;filter:blur(8px);opacity:.2}
.sa-ph-ic{position:relative;padding:12px;border-radius:12px;background:var(--salis-gradient,linear-gradient(135deg,#0A5ED7,#0BB3FF));box-shadow:var(--shadow-lg);display:flex;color:#fff}
.sa-ph-ic svg,.sa-ph-ic i{width:24px;height:24px}
.sa-ph-title{font-size:30px;font-weight:700;letter-spacing:-0.02em;color:var(--text-heading,#0B1F3B);margin:0;line-height:1.2}
.sa-ph-desc{font-size:14px;color:var(--text-muted,#64748B);margin:4px 0 0}
.sa-ph-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}`;
  document.head.appendChild(s);
}
const Sparkles = /*#__PURE__*/React.createElement("svg", {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}, /*#__PURE__*/React.createElement("path", {
  d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
}));
function PageHeader({
  title,
  description,
  icon,
  actions,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sa-ph"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sa-ph-left"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sa-ph-tile"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sa-ph-halo"
  }), /*#__PURE__*/React.createElement("span", {
    className: "sa-ph-ic"
  }, icon || Sparkles)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "sa-ph-title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "sa-ph-desc"
  }, description))), actions && /*#__PURE__*/React.createElement("div", {
    className: "sa-ph-actions"
  }, actions)), children);
}
Object.assign(__ds_scope, { PageHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/PageHeader.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Accordion.jsx
try { (() => {
const {
  useState
} = React;
if (typeof document !== "undefined" && !document.getElementById("sa-acc-css")) {
  const s = document.createElement("style");
  s.id = "sa-acc-css";
  s.textContent = `.sa-acc{border-bottom:1px solid var(--border-default,#E2E8F0);font-family:var(--font-ui,Inter,sans-serif)}
.sa-acc-trigger{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;background:none;border:none;cursor:pointer;padding:14px 4px;font-size:14px;font-weight:500;color:var(--text-primary,#0F172A);text-align:left;transition:color .15s ease}
.sa-acc-trigger:hover{color:var(--salis-blue,#0A5ED7)}
.sa-acc-trigger svg{transition:transform .2s ease;color:var(--text-muted,#64748B);flex-shrink:0}
.sa-acc-trigger.on svg{transform:rotate(180deg)}
.sa-acc-content{padding:0 4px 14px;font-size:14px;color:var(--text-muted,#64748B);animation:salis-slide-up .2s ease-out both}`;
  document.head.appendChild(s);
}
function Accordion({
  items = [],
  defaultOpen,
  style
}) {
  const [open, setOpen] = useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, items.map((it, i) => {
    const on = open === i;
    return /*#__PURE__*/React.createElement("div", {
      className: "sa-acc",
      key: i
    }, /*#__PURE__*/React.createElement("button", {
      className: "sa-acc-trigger" + (on ? " on" : ""),
      onClick: () => setOpen(on ? null : i),
      "aria-expanded": on
    }, it.title, /*#__PURE__*/React.createElement("svg", {
      width: "16",
      height: "16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "m6 9 6 6 6-6"
    }))), on && /*#__PURE__*/React.createElement("div", {
      className: "sa-acc-content"
    }, it.content));
  }));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-av-css")) {
  const s = document.createElement("style");
  s.id = "sa-av-css";
  s.textContent = `.sa-avatar{position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:9999px;overflow:hidden;background:var(--salis-gradient,linear-gradient(135deg,#0A5ED7,#0BB3FF));color:#fff;font-family:var(--font-ui,Inter,sans-serif);font-weight:700;flex-shrink:0;user-select:none}
.sa-avatar img{width:100%;height:100%;object-fit:cover}`;
  document.head.appendChild(s);
}
function Avatar({
  src,
  name = "",
  size = 40,
  style,
  ...rest
}) {
  const initial = (name.trim()[0] || "U").toUpperCase();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "sa-avatar",
    style: {
      width: size,
      height: size,
      fontSize: size * 0.4,
      ...style
    },
    title: name
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initial);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-card-css")) {
  const s = document.createElement("style");
  s.id = "sa-card-css";
  s.textContent = `.sa-card{border-radius:var(--radius-lg,12px);border:1px solid var(--border-default,#E2E8F0);background:var(--surface-card,#fff);color:var(--text-primary,#0F172A);box-shadow:var(--shadow-sm);font-family:var(--font-ui,Inter,sans-serif);box-sizing:border-box}
.sa-card.hoverable{transition:all .2s ease}
.sa-card.hoverable:hover{transform:translateY(-2px);box-shadow:var(--glow-blue-lg);border-color:rgba(10,94,215,.3)}
.sa-card-header{display:flex;flex-direction:column;gap:6px;padding:24px}
.sa-card-title{font-weight:600;line-height:1;letter-spacing:-0.01em;font-size:16px;color:var(--text-heading,#0B1F3B);margin:0}
.sa-card-desc{font-size:14px;color:var(--text-muted,#64748B);margin:0}
.sa-card-content{padding:0 24px 24px}
.sa-card-footer{display:flex;align-items:center;padding:0 24px 24px;gap:8px}`;
  document.head.appendChild(s);
}
function Card({
  hoverable,
  children,
  className,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-card" + (hoverable ? " hoverable" : "") + (className ? " " + className : "")
  }, rest), children);
}
function CardHeader(p) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-card-header"
  }, p));
}
function CardTitle(p) {
  return /*#__PURE__*/React.createElement("h3", _extends({
    className: "sa-card-title"
  }, p));
}
function CardDescription(p) {
  return /*#__PURE__*/React.createElement("p", _extends({
    className: "sa-card-desc"
  }, p));
}
function CardContent(p) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-card-content"
  }, p));
}
function CardFooter(p) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-card-footer"
  }, p));
}
Object.assign(__ds_scope, { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Dialog.jsx
try { (() => {
if (typeof document !== "undefined" && !document.getElementById("sa-dlg-css")) {
  const s = document.createElement("style");
  s.id = "sa-dlg-css";
  s.textContent = `.sa-dlg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(2px);z-index:100;animation:salis-fade-in .2s ease-out both}
.sa-dlg{position:fixed;inset:0;margin:auto;height:fit-content;max-height:85vh;overflow:auto;z-index:101;width:calc(100% - 32px);max-width:480px;box-sizing:border-box;background:var(--surface-card,#fff);border:1px solid var(--border-default,#E2E8F0);border-radius:var(--radius-lg,12px);box-shadow:var(--shadow-lg);padding:24px;font-family:var(--font-ui,Inter,sans-serif);animation:sa-dlg-in .25s ease-out both}
@keyframes sa-dlg-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.sa-dlg-title{font-size:18px;font-weight:600;color:var(--text-heading,#0B1F3B);margin:0;letter-spacing:-0.01em}
.sa-dlg-desc{font-size:14px;color:var(--text-muted,#64748B);margin:6px 0 0}
.sa-dlg-body{margin-top:16px}
.sa-dlg-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:24px}
.sa-dlg-x{position:absolute;top:16px;right:16px;background:none;border:none;cursor:pointer;color:var(--text-faint,#9BA4B0);padding:4px;border-radius:6px;display:flex;transition:all .15s ease}
.sa-dlg-x:hover{color:var(--text-primary,#0F172A);background:var(--surface-inset,#F8FAFC)}`;
  document.head.appendChild(s);
}
function Dialog({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  width = 480,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sa-dlg-overlay",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "sa-dlg",
    role: "dialog",
    "aria-modal": "true",
    style: {
      maxWidth: width,
      ...style
    }
  }, onClose && /*#__PURE__*/React.createElement("button", {
    className: "sa-dlg-x",
    onClick: onClose,
    "aria-label": "Close"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6 6 18"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m6 6 12 12"
  }))), title && /*#__PURE__*/React.createElement("h2", {
    className: "sa-dlg-title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "sa-dlg-desc"
  }, description), children && /*#__PURE__*/React.createElement("div", {
    className: "sa-dlg-body"
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    className: "sa-dlg-footer"
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Separator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Separator({
  vertical,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "separator",
    style: {
      background: "var(--border-default,#E2E8F0)",
      flexShrink: 0,
      ...(vertical ? {
        width: 1,
        alignSelf: "stretch"
      } : {
        height: 1,
        width: "100%"
      }),
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Separator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Separator.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
if (typeof document !== "undefined" && !document.getElementById("sa-stat-css")) {
  const s = document.createElement("style");
  s.id = "sa-stat-css";
  s.textContent = `.sa-stat{position:relative;height:100%;box-sizing:border-box;background:var(--surface-card,#fff);border-radius:var(--radius-xl,16px);padding:24px;border:1px solid var(--border-default,#E2E8F0);box-shadow:var(--shadow-sm);transition:all .2s ease;font-family:var(--font-ui,Inter,sans-serif)}
.sa-stat:hover{box-shadow:var(--shadow-lg);border-color:rgba(10,94,215,.3)}
.sa-stat-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.sa-stat-label{display:flex;align-items:center;gap:8px;color:var(--text-muted,#64748B);font-size:14px;font-weight:500}
.sa-stat-cap{padding:8px;border-radius:12px;display:flex}.sa-stat-cap svg,.sa-stat-cap i{width:20px;height:20px}
.sa-stat-value{font-family:var(--font-display,Montserrat,sans-serif);font-weight:900;font-size:30px;color:var(--text-heading,#0B1F3B);letter-spacing:-0.02em;margin:12px 0 4px}
.sa-stat-orb{width:56px;height:56px;border-radius:9999px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sa-stat-orb svg,.sa-stat-orb i{width:28px;height:28px;color:#fff}
.sa-stat-trend{display:inline-flex;align-items:center;gap:2px;font-size:12px;font-weight:600}
.sa-stat-bar{margin-top:16px;height:4px;background:rgba(10,94,215,.1);border-radius:9999px;overflow:hidden}
.sa-stat-bar i{display:block;height:100%;background:var(--salis-gradient-r,linear-gradient(90deg,#0A5ED7,#0BB3FF));border-radius:9999px}`;
  document.head.appendChild(s);
}
const ORBS = {
  blue: "linear-gradient(135deg,#0A5ED7,#0BB3FF)",
  bright: "linear-gradient(135deg,#0BB3FF,#06B6D4)",
  navy: "linear-gradient(135deg,#0B1F3B,#1e3a5f)",
  orange: "linear-gradient(135deg,#F97316,#FB923C)"
};
const CAPS = {
  blue: ["rgba(10,94,215,.1)", "#0A5ED7"],
  bright: ["rgba(11,179,255,.1)", "#0BB3FF"],
  navy: ["rgba(11,31,59,.1)", "#0B1F3B"],
  orange: ["rgba(249,115,22,.1)", "#F97316"]
};
function StatCard({
  label,
  value,
  icon,
  orbIcon,
  accent = "blue",
  trend,
  trendLabel,
  progress,
  children,
  style,
  ...rest
}) {
  const up = typeof trend === "number" && trend > 0;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "sa-stat",
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "sa-stat-top"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sa-stat-label"
  }, icon && /*#__PURE__*/React.createElement("span", {
    className: "sa-stat-cap",
    style: {
      background: CAPS[accent][0],
      color: CAPS[accent][1]
    }
  }, icon), /*#__PURE__*/React.createElement("span", null, label)), /*#__PURE__*/React.createElement("div", {
    className: "sa-stat-value"
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap"
    }
  }, typeof trend === "number" && trend !== 0 && /*#__PURE__*/React.createElement("span", {
    className: "sa-stat-trend",
    style: {
      color: up ? "var(--salis-blue,#0A5ED7)" : "var(--salis-orange,#F97316)"
    }
  }, up ? "↗" : "↘", " ", up ? "+" : "", trend, "%"), trendLabel && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-faint,#9BA4B0)"
    }
  }, trendLabel), children)), orbIcon && /*#__PURE__*/React.createElement("div", {
    className: "sa-stat-orb",
    style: {
      background: ORBS[accent],
      boxShadow: "0 10px 15px -3px " + CAPS[accent][0]
    }
  }, orbIcon)), typeof progress === "number" && /*#__PURE__*/React.createElement("div", {
    className: "sa-stat-bar"
  }, /*#__PURE__*/React.createElement("i", {
    style: {
      width: progress + "%"
    }
  })));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tabs.jsx
try { (() => {
const {
  useState
} = React;
if (typeof document !== "undefined" && !document.getElementById("sa-tabs-css")) {
  const s = document.createElement("style");
  s.id = "sa-tabs-css";
  s.textContent = `.sa-tabs-list{display:inline-flex;align-items:center;gap:2px;background:var(--surface-inset,#F8FAFC);border:1px solid var(--border-default,#E2E8F0);border-radius:var(--radius-md,8px);padding:4px}
.sa-tab{border:none;background:transparent;cursor:pointer;padding:6px 14px;border-radius:6px;font-family:var(--font-action,Poppins,sans-serif);font-size:13px;font-weight:500;color:var(--text-muted,#64748B);transition:all .15s ease;white-space:nowrap}
.sa-tab:hover{color:var(--text-primary,#0F172A)}
.sa-tab.on{background:var(--surface-card,#fff);color:var(--salis-blue,#0A5ED7);box-shadow:var(--shadow-sm)}
.sa-tab:focus-visible{outline:none;box-shadow:0 0 0 2px var(--ring,#0A5ED7)}`;
  document.head.appendChild(s);
}
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onValueChange,
  children,
  style
}) {
  const first = tabs[0] && (typeof tabs[0] === "string" ? tabs[0] : tabs[0].value);
  const [un, setUn] = useState(defaultValue || first);
  const cur = value !== undefined ? value : un;
  const pick = v => {
    if (value === undefined) setUn(v);
    onValueChange && onValueChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "sa-tabs-list",
    role: "tablist"
  }, tabs.map(t => {
    const tab = typeof t === "string" ? {
      value: t,
      label: t
    } : t;
    return /*#__PURE__*/React.createElement("button", {
      key: tab.value,
      role: "tab",
      "aria-selected": cur === tab.value,
      className: "sa-tab" + (cur === tab.value ? " on" : ""),
      onClick: () => pick(tab.value)
    }, tab.label);
  })), typeof children === "function" ? children(cur) : children);
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/App.jsx
try { (() => {
const {
  PageHeader: APageHeader,
  EmptyState: AEmptyState,
  Button: AButton
} = window.SALISAUTODesignSystem_f22df3;
const TITLES = {
  appointments: ["Calendar", "Appointments"],
  estimates: ["Receipt", "Estimates"],
  vehicles: ["Car", "Vehicles"],
  "fleet-management": ["Truck", "Fleet Management"],
  inventory: ["Package", "Inventory"],
  technicians: ["HardHat", "Technicians"],
  invoices: ["FileText", "Invoices"],
  payments: ["CreditCard", "Payments"],
  reports: ["BarChart3", "Reports"],
  subscription: ["CreditCard", "Subscription"],
  settings: ["Settings", "Settings"],
  backup: ["Database", "Backup & Export"],
  profile: ["User", "Profile"]
};
function StubScreen({
  route,
  onNav
}) {
  const [ic, title] = TITLES[route] || ["ClipboardList", route];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(APageHeader, {
    title: title,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 24
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "kit-panel"
  }, /*#__PURE__*/React.createElement(AEmptyState, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: ic,
      size: 96,
      strokeWidth: 1
    }),
    title: "The " + title + " screen isn't recreated in this kit",
    description: "It exists in SALIS AUTO but this UI kit currently covers Login, Dashboard, Job Cards and Customers.",
    action: /*#__PURE__*/React.createElement(AButton, {
      onClick: () => onNav("dashboard")
    }, "Back to Dashboard")
  })));
}
function App() {
  const [dark, setDark] = React.useState(false);
  const [route, setRoute] = React.useState("login");
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  if (route === "login") return /*#__PURE__*/React.createElement(LoginScreen, {
    dark: dark,
    onToggleDark: () => setDark(d => !d),
    onLogin: () => setRoute("dashboard")
  });
  let screen;
  if (route === "dashboard") screen = /*#__PURE__*/React.createElement(DashboardScreen, {
    onNav: setRoute
  });else if (route === "job-cards") screen = /*#__PURE__*/React.createElement(JobCardsScreen, null);else if (route === "customers") screen = /*#__PURE__*/React.createElement(CustomersScreen, null);else screen = /*#__PURE__*/React.createElement(StubScreen, {
    route: route,
    onNav: setRoute
  });
  return /*#__PURE__*/React.createElement(Shell, {
    route: route,
    onNav: setRoute,
    onLogout: () => setRoute("login"),
    dark: dark,
    onToggleDark: () => setDark(d => !d)
  }, screen);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/CustomersScreen.jsx
try { (() => {
const {
  Button: CButton,
  Input: CInput,
  Select: CSelect,
  Avatar: CAvatar,
  Badge: CBadge,
  StatusBadge: CStatusBadge,
  PageHeader: CPageHeader,
  Tabs: CTabs,
  Card: CCard,
  EmptyState: CEmptyState
} = window.SALISAUTODesignSystem_f22df3;
const CUSTOMERS = [{
  id: 1,
  name: "Ahmed Al-Rashid",
  phone: "+966 50 123 4567",
  email: "ahmed.rashid@gmail.com",
  garage: "Al-Malaz Branch",
  vehicles: [["Toyota Camry 2022", "4821 KSA"], ["Toyota Land Cruiser 2019", "8834 KSA"]],
  invoices: [["INV-1042", 480, "paid"], ["INV-0991", 1220, "paid"]],
  notes: ["Prefers WhatsApp updates.", "Loyalty member since 2023."]
}, {
  id: 2,
  name: "Fatima Al-Zahrani",
  phone: "+966 55 987 2210",
  email: "fatima.z@outlook.com",
  garage: "Al-Olaya Branch",
  vehicles: [["Nissan Patrol 2021", "7743 RUH"]],
  invoices: [["INV-1038", 1240.5, "unpaid"]],
  notes: ["Fleet contact for Zahrani Trading Co."]
}, {
  id: 3,
  name: "Omar Al-Ghamdi",
  phone: "+966 54 402 8890",
  email: "omar.ghamdi@gmail.com",
  garage: "Al-Malaz Branch",
  vehicles: [["Hyundai Sonata 2023", "1109 JED"]],
  invoices: [["INV-1029", 96, "paid"]],
  notes: []
}, {
  id: 4,
  name: "Sara Al-Mutairi",
  phone: "+966 56 771 3345",
  email: "sara.mutairi@icloud.com",
  garage: "Al-Olaya Branch",
  vehicles: [["Ford Explorer 2022", "9012 DMM"]],
  invoices: [["INV-1015", 340, "overdue"]],
  notes: ["Requested Hijri-date invoices."]
}];
function CustomersScreen() {
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState(1);
  const list = CUSTOMERS.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
  const cur = CUSTOMERS.find(c => c.id === sel) || list[0];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(CPageHeader, {
    title: "Customers",
    description: "Customer profiles, vehicles and service history",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Users",
      size: 24
    }),
    actions: /*#__PURE__*/React.createElement(CButton, {
      size: "sm"
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 16
    }), "Add Customer")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280
    }
  }, /*#__PURE__*/React.createElement(CInput, {
    size: "sm",
    placeholder: "Search customers...",
    value: q,
    onChange: e => setQ(e.target.value),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Search",
      size: 16
    })
  })), /*#__PURE__*/React.createElement(CSelect, {
    size: "sm",
    defaultValue: "all",
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Garages"), /*#__PURE__*/React.createElement("option", null, "Al-Malaz Branch"), /*#__PURE__*/React.createElement("option", null, "Al-Olaya Branch"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: 24,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, list.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.id,
    className: "kit-custcard" + (c.id === sel ? " on" : ""),
    onClick: () => setSel(c.id)
  }, /*#__PURE__*/React.createElement(CAvatar, {
    name: c.name,
    size: 36
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0,
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-primary)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "block",
      fontSize: 12,
      color: "var(--text-muted)",
      fontFamily: "var(--font-mono)"
    }
  }, c.phone)), /*#__PURE__*/React.createElement(CBadge, {
    variant: "outline"
  }, c.vehicles.length, " \uD83D\uDE97"))), list.length === 0 && /*#__PURE__*/React.createElement(CEmptyState, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Users",
      size: 96,
      strokeWidth: 1
    }),
    title: "No customers found",
    description: "Try a different search term."
  })), cur && /*#__PURE__*/React.createElement(CCard, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24,
      display: "flex",
      alignItems: "center",
      gap: 16,
      borderBottom: "1px solid var(--border-default)"
    }
  }, /*#__PURE__*/React.createElement(CAvatar, {
    name: cur.name,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "var(--text-heading)"
    }
  }, cur.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 16,
      marginTop: 6,
      flexWrap: "wrap",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Phone",
    size: 14
  }), cur.phone), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Mail",
    size: 14
  }), cur.email), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Building2",
    size: 14
  }), cur.garage))), /*#__PURE__*/React.createElement(CButton, {
    variant: "outline",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "MessageSquare",
    size: 14
  }), "Message")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, /*#__PURE__*/React.createElement(CTabs, {
    tabs: [{
      value: "veh",
      label: "Vehicles"
    }, {
      value: "inv",
      label: "Invoices"
    }, {
      value: "notes",
      label: "Notes"
    }],
    defaultValue: "veh"
  }, active => /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, active === "veh" && cur.vehicles.map(v => /*#__PURE__*/React.createElement("div", {
    key: v[1],
    className: "kit-rowline"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 10,
      background: "rgba(10,94,215,.1)",
      color: "#0A5ED7",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Car",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-primary)"
    }
  }, v[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, v[1]), /*#__PURE__*/React.createElement(CButton, {
    variant: "ghost",
    size: "sm"
  }, "View"))), active === "inv" && cur.invoices.map(iv => /*#__PURE__*/React.createElement("div", {
    key: iv[0],
    className: "kit-rowline"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 10,
      background: "rgba(11,179,255,.1)",
      color: "#0BB3FF",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "FileText",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-primary)"
    }
  }, iv[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      color: "var(--text-primary)"
    }
  }, "$", iv[1].toLocaleString("en-US", {
    minimumFractionDigits: 2
  })), /*#__PURE__*/React.createElement(CStatusBadge, {
    status: iv[2]
  }))), active === "notes" && (cur.notes.length ? cur.notes.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    className: "kit-rowline"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 10,
      background: "rgba(11,31,59,.08)",
      color: "#0B1F3B",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ClipboardList",
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      color: "var(--text-body)"
    }
  }, n))) : /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-faint)",
      margin: "8px 0"
    }
  }, "No notes yet."))))))));
}
window.CustomersScreen = CustomersScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/CustomersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/DashboardScreen.jsx
try { (() => {
const {
  Button: DButton,
  Badge: DBadge,
  Card: DCard,
  Pagination: DPagination
} = window.SALISAUTODesignSystem_f22df3;
const DASH_JOBS = [{
  id: "A3F8B2C1",
  cust: "Ahmed Al-Rashid",
  veh: "Toyota Camry 2022",
  svc: "maintenance",
  st: "in_progress",
  pr: "medium"
}, {
  id: "B7E4D9A2",
  cust: "Fatima Al-Zahrani",
  veh: "Nissan Patrol 2021",
  svc: "repair",
  st: "pending",
  pr: "high"
}, {
  id: "C2A9F4E3",
  cust: "Omar Al-Ghamdi",
  veh: "Hyundai Sonata 2023",
  svc: "diagnostic",
  st: "completed",
  pr: "low"
}, {
  id: "D8C1B6F4",
  cust: "Mohammed Hassan",
  veh: "Lexus ES 350 2020",
  svc: "inspection",
  st: "in_progress",
  pr: "urgent"
}, {
  id: "E5D7A3B5",
  cust: "Sara Al-Mutairi",
  veh: "Ford Explorer 2022",
  svc: "tire_service",
  st: "delivered",
  pr: "low"
}];
const SVC_BADGE = {
  maintenance: ["rgba(10,94,215,.1)", "#0A5ED7", "🔧"],
  repair: ["rgba(249,115,22,.1)", "#F97316", "⚙️"],
  diagnostic: ["rgba(11,179,255,.1)", "#0BB3FF", "🔍"],
  inspection: ["rgba(10,94,215,.1)", "#0A5ED7", "✓"],
  tire_service: ["rgba(100,116,139,.1)", "#64748B", "⭕"]
};
const ST_BADGE = {
  pending: ["rgba(249,115,22,.1)", "#F97316", "⏳"],
  assigned: ["rgba(11,179,255,.1)", "#0BB3FF", "👤"],
  in_progress: ["rgba(10,94,215,.1)", "#0A5ED7", "🔄"],
  completed: ["rgba(10,94,215,.1)", "#0A5ED7", "✅"],
  delivered: ["rgba(11,31,59,.1)", "#0B1F3B", "🚗"],
  cancelled: ["rgba(249,115,22,.1)", "#F97316", "❌"]
};
const PR_BADGE = {
  urgent: ["#F97316", "🔥"],
  high: ["#F97316", "⚡"],
  medium: ["#0BB3FF", "⭐"],
  low: ["#0A5ED7", "💙"]
};
function EmojiPill({
  map,
  k
}) {
  const c = map[k] || ["rgba(100,116,139,.1)", "#64748B", "○"];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: 9999,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 500,
      background: c[0],
      color: c[1],
      textTransform: "capitalize",
      whiteSpace: "nowrap"
    }
  }, c[2], " ", k.replace(/_/g, " "));
}
function PrPill({
  k
}) {
  const c = PR_BADGE[k];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      borderRadius: 9999,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 600,
      background: c[0],
      color: "#fff",
      textTransform: "capitalize"
    }
  }, c[1], " ", k);
}
function MetricCard({
  capBg,
  capColor,
  icon,
  label,
  value,
  children,
  orb,
  ring,
  bar
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "kit-metric"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 12,
      background: capBg,
      color: capColor,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: "var(--text-muted)"
    }
  }, label)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 30,
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      color: "var(--text-heading)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
      flexWrap: "wrap"
    }
  }, children))), orb), bar !== undefined && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      height: 4,
      background: "rgba(10,94,215,.1)",
      borderRadius: 9999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: bar + "%",
      background: "var(--salis-gradient-r)",
      borderRadius: 9999
    }
  })));
}
function Trend({
  v
}) {
  const up = v > 0;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      fontSize: 12,
      fontWeight: 600,
      color: up ? "#0A5ED7" : "#F97316"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: up ? "ArrowUpRight" : "ArrowDownRight",
    size: 14
  }), up ? "+" : "", v, "%");
}
function Spark({
  color,
  pts
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: "80",
    height: "32",
    viewBox: "0 0 80 32"
  }, /*#__PURE__*/React.createElement("polyline", {
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    points: pts
  }));
}
function Orb({
  grad,
  icon,
  shadow
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: grad,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      boxShadow: "0 10px 15px -3px " + shadow,
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 28
  }));
}
function RevenueChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 600 260",
    style: {
      width: "100%",
      height: "auto",
      display: "block"
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "revGrad",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#0A5ED7",
    stopOpacity: "0.4"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#0A5ED7",
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: "M20,121 C57,112 95,94 132,94 C169,94 207,106 244,106 C281,106 319,81 356,69 C393,57 431,55 468,49 C505,43 543,29 580,22 L580,220 L20,220 Z",
    fill: "url(#revGrad)"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M20,121 C57,112 95,94 132,94 C169,94 207,106 244,106 C281,106 319,81 356,69 C393,57 431,55 468,49 C505,43 543,29 580,22",
    fill: "none",
    stroke: "#0A5ED7",
    strokeWidth: "2.5"
  }), months.map((m, i) => /*#__PURE__*/React.createElement("text", {
    key: m,
    x: 20 + i * 112,
    y: "244",
    fontSize: "11",
    fill: "#64748B",
    textAnchor: "middle",
    fontFamily: "Inter,sans-serif"
  }, m)));
}
function StatusDonut() {
  const data = [["Completed", 6, "#0A5ED7"], ["In Progress", 9, "#0BB3FF"], ["Pending", 5, "#F97316"], ["Delivered", 4, "#0B1F3B"], ["Cancelled", 3, "#64748B"]];
  const total = data.reduce((s, d) => s + d[1], 0);
  let acc = 0;
  const stops = data.map(d => {
    const from = acc / total * 100;
    acc += d[1];
    return `${d[2]} ${from}% ${acc / total * 100}%`;
  }).join(",");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180,
      height: 180,
      borderRadius: "50%",
      background: `conic-gradient(${stops})`,
      position: "relative",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 36,
      borderRadius: "50%",
      background: "var(--surface-card)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      fontSize: 28,
      color: "var(--text-heading)"
    }
  }, total), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-muted)"
    }
  }, "jobs"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d[0],
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 3,
      background: d[2]
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-body)",
      minWidth: 90
    }
  }, d[0]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 12,
      color: "var(--text-muted)"
    }
  }, d[1])))));
}
function DashboardScreen({
  onNav
}) {
  const pipeline = [["Clock", "Check-In", 5, "linear-gradient(135deg,#F97316,#FB923C)"], ["Wrench", "In Repair", 9, "linear-gradient(135deg,#0A5ED7,#0BB3FF)"], ["AlertCircle", "QC", 6, "linear-gradient(135deg,#0BB3FF,#06B6D4)"], ["CheckCircle", "Done", 6, "linear-gradient(135deg,#0A5ED7,#0BB3FF)"], ["Car", "Delivered", 4, "linear-gradient(135deg,#0B1F3B,#1e3a5f)"], ["Activity", "Total", 27, "linear-gradient(135deg,#64748B,#94A3B8)"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 24,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "#0A5ED7",
      borderRadius: 16,
      filter: "blur(12px)",
      opacity: .3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      padding: 12,
      borderRadius: 16,
      background: "var(--salis-gradient)",
      boxShadow: "0 20px 25px -5px rgba(10,94,215,.25)",
      color: "#fff",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Sparkles",
    size: 32
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 48,
      lineHeight: 1.1,
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      background: "var(--salis-gradient-r)",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent"
    }
  }, "Dashboard"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontWeight: 300,
      color: "var(--text-muted)"
    }
  }, "Welcome back, ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: "var(--text-heading)"
    }
  }, "Khalid Al-Amri")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(DButton, {
    variant: "outline",
    size: "sm",
    onClick: () => onNav("job-cards"),
    style: {
      color: "var(--salis-blue)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "FileText",
    size: 16
  }), "New Job Card"), /*#__PURE__*/React.createElement(DButton, {
    size: "sm",
    onClick: () => onNav("vehicles")
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Car",
    size: 16
  }), "Add Vehicle"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(MetricCard, {
    capBg: "rgba(10,94,215,.1)",
    capColor: "#0A5ED7",
    icon: "DollarSign",
    label: "Total Revenue",
    value: "$128,450",
    orb: /*#__PURE__*/React.createElement(Orb, {
      grad: "linear-gradient(135deg,#0A5ED7,#0BB3FF)",
      icon: "TrendingUp",
      shadow: "rgba(10,94,215,.2)"
    }),
    bar: 75
  }, /*#__PURE__*/React.createElement(Trend, {
    v: 12
  }), /*#__PURE__*/React.createElement(Spark, {
    color: "#0A5ED7",
    pts: "0,26 13,22 26,24 40,16 53,18 66,8 80,4"
  })), /*#__PURE__*/React.createElement(MetricCard, {
    capBg: "rgba(11,179,255,.1)",
    capColor: "#0BB3FF",
    icon: "Wrench",
    label: "Active Jobs",
    value: "14",
    orb: /*#__PURE__*/React.createElement(Orb, {
      grad: "linear-gradient(135deg,#0BB3FF,#06B6D4)",
      icon: "Gauge",
      shadow: "rgba(11,179,255,.2)"
    })
  }, /*#__PURE__*/React.createElement(DBadge, {
    style: {
      background: "rgba(249,115,22,.1)",
      color: "#F97316",
      border: "1px solid rgba(249,115,22,.3)"
    }
  }, "5 pending"), /*#__PURE__*/React.createElement(DBadge, {
    style: {
      background: "rgba(11,179,255,.1)",
      color: "#0BB3FF",
      border: "1px solid rgba(11,179,255,.3)"
    }
  }, "9 active")), /*#__PURE__*/React.createElement(MetricCard, {
    capBg: "rgba(11,31,59,.1)",
    capColor: "#0B1F3B",
    icon: "Users",
    label: "Customers",
    value: "248",
    orb: /*#__PURE__*/React.createElement(Orb, {
      grad: "linear-gradient(135deg,#0B1F3B,#1e3a5f)",
      icon: "Target",
      shadow: "rgba(11,31,59,.2)"
    })
  }, /*#__PURE__*/React.createElement(Trend, {
    v: 8
  }), /*#__PURE__*/React.createElement(Spark, {
    color: "#0B1F3B",
    pts: "0,24 13,20 26,22 40,14 53,16 66,10 80,6"
  })), /*#__PURE__*/React.createElement(MetricCard, {
    capBg: "rgba(249,115,22,.1)",
    capColor: "#F97316",
    icon: "Package",
    label: "Inventory",
    value: "86%",
    orb: /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        width: 56,
        height: 56,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "56",
      height: "56",
      style: {
        transform: "rotate(-90deg)"
      }
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "28",
      cy: "28",
      r: "24",
      stroke: "rgba(249,115,22,.2)",
      strokeWidth: "6",
      fill: "none"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "28",
      cy: "28",
      r: "24",
      stroke: "#F97316",
      strokeWidth: "6",
      fill: "none",
      strokeDasharray: "129 150",
      strokeLinecap: "round"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F97316"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "ShieldCheck",
      size: 20
    })))
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#F97316"
    }
  }, "142/165 in stock"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(6,1fr)",
      gap: 16
    }
  }, pipeline.map(p => /*#__PURE__*/React.createElement("div", {
    key: p[1],
    className: "kit-pipe"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 12,
      borderRadius: 12,
      background: p[3],
      color: "#fff",
      display: "flex",
      boxShadow: "var(--shadow-lg)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p[0],
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: 24,
      fontFamily: "var(--font-display)",
      fontWeight: 900,
      color: "var(--text-heading)"
    }
  }, p[2]), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "4px 0 0",
      fontSize: 12,
      fontWeight: 500,
      color: "var(--text-muted)"
    }
  }, p[1]))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 12,
      background: "var(--salis-gradient)",
      color: "#fff",
      display: "flex",
      boxShadow: "0 10px 15px -3px rgba(10,94,215,.25)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "TrendingUp",
    size: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "var(--text-heading)"
    }
  }, "Revenue Trend")), /*#__PURE__*/React.createElement(RevenueChart, null)), /*#__PURE__*/React.createElement("div", {
    className: "kit-panel"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 12,
      background: "var(--salis-gradient)",
      color: "#fff",
      display: "flex",
      boxShadow: "0 10px 15px -3px rgba(10,94,215,.25)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "BarChart3",
    size: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "var(--text-heading)"
    }
  }, "Job Status")), /*#__PURE__*/React.createElement(StatusDonut, null))), /*#__PURE__*/React.createElement("div", {
    className: "kit-panel",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px 12px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      padding: 8,
      borderRadius: 12,
      background: "var(--salis-gradient)",
      color: "#fff",
      display: "flex",
      boxShadow: "0 10px 15px -3px rgba(10,94,215,.25)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ClipboardList",
    size: 20
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 20,
      fontWeight: 700,
      color: "var(--text-heading)"
    }
  }, "Latest Job Cards")), /*#__PURE__*/React.createElement(DButton, {
    variant: "ghost",
    size: "sm",
    onClick: () => onNav("job-cards")
  }, "View All", /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowUpRight",
    size: 14
  }))), /*#__PURE__*/React.createElement("table", {
    className: "kit-table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Job Card"), /*#__PURE__*/React.createElement("th", null, "Customer"), /*#__PURE__*/React.createElement("th", null, "Vehicle"), /*#__PURE__*/React.createElement("th", null, "Service"), /*#__PURE__*/React.createElement("th", null, "Priority"), /*#__PURE__*/React.createElement("th", null, "Status"))), /*#__PURE__*/React.createElement("tbody", null, DASH_JOBS.map(j => /*#__PURE__*/React.createElement("tr", {
    key: j.id
  }, /*#__PURE__*/React.createElement("td", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13
    }
  }, j.id), /*#__PURE__*/React.createElement("td", null, j.cust), /*#__PURE__*/React.createElement("td", null, j.veh), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(EmojiPill, {
    map: SVC_BADGE,
    k: j.svc
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(PrPill, {
    k: j.pr
  })), /*#__PURE__*/React.createElement("td", null, /*#__PURE__*/React.createElement(EmojiPill, {
    map: ST_BADGE,
    k: j.st
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 24px 20px"
    }
  }, /*#__PURE__*/React.createElement(DPagination, {
    page: 1,
    pageSize: 5,
    total: 27
  }))));
}
window.DashboardScreen = DashboardScreen;
Object.assign(window, {
  EmojiPill,
  PrPill,
  SVC_BADGE,
  ST_BADGE
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/DashboardScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/JobCardsScreen.jsx
try { (() => {
const {
  Button: JButton,
  Select: JSelect,
  Input: JInput,
  Label: JLabel,
  Textarea: JTextarea,
  Dialog: JDialog,
  StatusBadge: JStatusBadge,
  PageHeader: JPageHeader,
  Table: JTable,
  TableHeader: JTableHeader,
  TableBody: JTableBody,
  TableRow: JTableRow,
  TableHead: JTableHead,
  TableCell: JTableCell,
  Card: JCard,
  Pagination: JPagination,
  Toast: JToast
} = window.SALISAUTODesignSystem_f22df3;
const JC_INIT = [{
  id: "A3F8B2C1",
  cust: "Ahmed Al-Rashid",
  veh: "Toyota Camry 2022 · 4821 KSA",
  svc: "Maintenance",
  pr: "medium",
  st: "in_progress",
  cost: 480
}, {
  id: "B7E4D9A2",
  cust: "Fatima Al-Zahrani",
  veh: "Nissan Patrol 2021 · 7743 RUH",
  svc: "Repair",
  pr: "high",
  st: "pending",
  cost: 1240.5
}, {
  id: "C2A9F4E3",
  cust: "Omar Al-Ghamdi",
  veh: "Hyundai Sonata 2023 · 1109 JED",
  svc: "Diagnostic",
  pr: "low",
  st: "completed",
  cost: 96
}, {
  id: "D8C1B6F4",
  cust: "Mohammed Hassan",
  veh: "Lexus ES 350 2020 · 3356 KSA",
  svc: "Inspection",
  pr: "urgent",
  st: "assigned",
  cost: 210
}, {
  id: "E5D7A3B5",
  cust: "Sara Al-Mutairi",
  veh: "Ford Explorer 2022 · 9012 DMM",
  svc: "Tire Service",
  pr: "low",
  st: "delivered",
  cost: 340
}];
const JC_PR = {
  low: ["rgba(100,116,139,.1)", "#64748B"],
  medium: ["rgba(10,94,215,.1)", "#0A5ED7"],
  high: ["rgba(249,115,22,.1)", "#F97316"],
  urgent: ["#F97316", "#fff"]
};
function JobCardsScreen() {
  const [rows, setRows] = React.useState(JC_INIT);
  const [status, setStatus] = React.useState("all");
  const [prio, setPrio] = React.useState("all");
  const [garage, setGarage] = React.useState("all");
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [form, setForm] = React.useState({
    cust: "",
    make: "",
    model: "",
    year: "",
    plate: "",
    svc: "Maintenance",
    pr: "medium",
    desc: ""
  });
  const f = (k, v) => setForm(p => ({
    ...p,
    [k]: v
  }));
  const filtered = rows.filter(r => (status === "all" || r.st === status) && (prio === "all" || r.pr === prio));
  const create = () => {
    if (!form.cust || !form.make || !form.plate) {
      setToast({
        v: "destructive",
        t: "Error",
        d: "Please fill in all required fields"
      });
      return;
    }
    const id = Math.random().toString(16).slice(2, 10).toUpperCase();
    setRows(p => [{
      id,
      cust: form.cust,
      veh: `${form.make} ${form.model} ${form.year} · ${form.plate}`,
      svc: form.svc,
      pr: form.pr,
      st: "pending",
      cost: 0
    }, ...p]);
    setOpen(false);
    setToast({
      v: "default",
      t: "Success",
      d: "Job card created successfully"
    });
    setForm({
      cust: "",
      make: "",
      model: "",
      year: "",
      plate: "",
      svc: "Maintenance",
      pr: "medium",
      desc: ""
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JPageHeader, {
    title: "Job Cards",
    description: "Manage service and repair work orders",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Wrench",
      size: 24
    }),
    actions: /*#__PURE__*/React.createElement(JButton, {
      size: "sm",
      onClick: () => setOpen(true)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 16
    }), "New Job Card")
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 12,
      marginBottom: 16,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Filter",
    size: 14
  }), "Filters"), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: garage,
    onChange: e => setGarage(e.target.value),
    style: {
      width: 180
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Garages"), /*#__PURE__*/React.createElement("option", {
    value: "malaz"
  }, "Al-Malaz Branch"), /*#__PURE__*/React.createElement("option", {
    value: "olaya"
  }, "Al-Olaya Branch")), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: status,
    onChange: e => setStatus(e.target.value),
    style: {
      width: 160
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Statuses"), /*#__PURE__*/React.createElement("option", {
    value: "pending"
  }, "Pending"), /*#__PURE__*/React.createElement("option", {
    value: "assigned"
  }, "Assigned"), /*#__PURE__*/React.createElement("option", {
    value: "in_progress"
  }, "In Progress"), /*#__PURE__*/React.createElement("option", {
    value: "completed"
  }, "Completed"), /*#__PURE__*/React.createElement("option", {
    value: "delivered"
  }, "Delivered")), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: prio,
    onChange: e => setPrio(e.target.value),
    style: {
      width: 150
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "All Priorities"), /*#__PURE__*/React.createElement("option", {
    value: "low"
  }, "Low"), /*#__PURE__*/React.createElement("option", {
    value: "medium"
  }, "Medium"), /*#__PURE__*/React.createElement("option", {
    value: "high"
  }, "High"), /*#__PURE__*/React.createElement("option", {
    value: "urgent"
  }, "Urgent"))), /*#__PURE__*/React.createElement(JCard, {
    style: {
      padding: "4px 0"
    }
  }, /*#__PURE__*/React.createElement(JTable, null, /*#__PURE__*/React.createElement(JTableHeader, null, /*#__PURE__*/React.createElement(JTableRow, null, /*#__PURE__*/React.createElement(JTableHead, null, "Job Card"), /*#__PURE__*/React.createElement(JTableHead, null, "Customer"), /*#__PURE__*/React.createElement(JTableHead, null, "Vehicle"), /*#__PURE__*/React.createElement(JTableHead, null, "Service"), /*#__PURE__*/React.createElement(JTableHead, null, "Priority"), /*#__PURE__*/React.createElement(JTableHead, null, "Status"), /*#__PURE__*/React.createElement(JTableHead, {
    style: {
      textAlign: "right"
    }
  }, "Total"), /*#__PURE__*/React.createElement(JTableHead, null))), /*#__PURE__*/React.createElement(JTableBody, null, filtered.map(r => /*#__PURE__*/React.createElement(JTableRow, {
    key: r.id
  }, /*#__PURE__*/React.createElement(JTableCell, {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13
    }
  }, r.id), /*#__PURE__*/React.createElement(JTableCell, {
    style: {
      fontWeight: 500
    }
  }, r.cust), /*#__PURE__*/React.createElement(JTableCell, {
    style: {
      color: "var(--text-muted)"
    }
  }, r.veh), /*#__PURE__*/React.createElement(JTableCell, null, r.svc), /*#__PURE__*/React.createElement(JTableCell, null, /*#__PURE__*/React.createElement("span", {
    style: {
      borderRadius: 9999,
      padding: "2px 10px",
      fontSize: 12,
      fontWeight: 500,
      textTransform: "capitalize",
      background: JC_PR[r.pr][0],
      color: JC_PR[r.pr][1]
    }
  }, r.pr)), /*#__PURE__*/React.createElement(JTableCell, null, /*#__PURE__*/React.createElement(JStatusBadge, {
    status: r.st
  })), /*#__PURE__*/React.createElement(JTableCell, {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 13,
      textAlign: "right"
    }
  }, r.cost ? "$" + r.cost.toLocaleString("en-US", {
    minimumFractionDigits: 2
  }) : "—"), /*#__PURE__*/React.createElement(JTableCell, null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    "aria-label": "View"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Eye",
    size: 15
  })), /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    "aria-label": "Edit"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Edit",
    size: 15
  })))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 16px"
    }
  }, /*#__PURE__*/React.createElement(JPagination, {
    page: 1,
    pageSize: 10,
    total: filtered.length
  }))), /*#__PURE__*/React.createElement(JDialog, {
    open: open,
    onClose: () => setOpen(false),
    title: "Create Job Card",
    description: "Register a new service or repair work order.",
    width: 520,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(JButton, {
      variant: "outline",
      onClick: () => setOpen(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(JButton, {
      onClick: create
    }, "Create Job Card"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px 16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1"
    }
  }, /*#__PURE__*/React.createElement(JLabel, {
    required: true
  }, "Customer"), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: form.cust,
    onChange: e => f("cust", e.target.value),
    placeholder: "Select customer"
  }, /*#__PURE__*/React.createElement("option", null, "Ahmed Al-Rashid"), /*#__PURE__*/React.createElement("option", null, "Fatima Al-Zahrani"), /*#__PURE__*/React.createElement("option", null, "Omar Al-Ghamdi"), /*#__PURE__*/React.createElement("option", null, "Mohammed Hassan"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, {
    required: true
  }, "Make"), /*#__PURE__*/React.createElement(JInput, {
    size: "sm",
    value: form.make,
    onChange: e => f("make", e.target.value),
    placeholder: "Toyota"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, null, "Model"), /*#__PURE__*/React.createElement(JInput, {
    size: "sm",
    value: form.model,
    onChange: e => f("model", e.target.value),
    placeholder: "Camry"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, null, "Year"), /*#__PURE__*/React.createElement(JInput, {
    size: "sm",
    value: form.year,
    onChange: e => f("year", e.target.value),
    placeholder: "2022"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, {
    required: true
  }, "License Plate"), /*#__PURE__*/React.createElement(JInput, {
    size: "sm",
    value: form.plate,
    onChange: e => f("plate", e.target.value),
    placeholder: "4821 KSA"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, null, "Service Type"), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: form.svc,
    onChange: e => f("svc", e.target.value)
  }, /*#__PURE__*/React.createElement("option", null, "Maintenance"), /*#__PURE__*/React.createElement("option", null, "Repair"), /*#__PURE__*/React.createElement("option", null, "Diagnostic"), /*#__PURE__*/React.createElement("option", null, "Inspection"), /*#__PURE__*/React.createElement("option", null, "Tire Service"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(JLabel, null, "Priority"), /*#__PURE__*/React.createElement(JSelect, {
    size: "sm",
    value: form.pr,
    onChange: e => f("pr", e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "low"
  }, "Low"), /*#__PURE__*/React.createElement("option", {
    value: "medium"
  }, "Medium"), /*#__PURE__*/React.createElement("option", {
    value: "high"
  }, "High"), /*#__PURE__*/React.createElement("option", {
    value: "urgent"
  }, "Urgent"))), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1/-1"
    }
  }, /*#__PURE__*/React.createElement(JLabel, null, "Description"), /*#__PURE__*/React.createElement(JTextarea, {
    rows: "2",
    value: form.desc,
    onChange: e => f("desc", e.target.value),
    placeholder: "Describe the issue reported by the customer..."
  })))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement(JToast, {
    variant: toast.v,
    title: toast.t,
    description: toast.d,
    onClose: () => setToast(null)
  })));
}
window.JobCardsScreen = JobCardsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/JobCardsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/LoginScreen.jsx
try { (() => {
const {
  Button: SButton,
  Input: SInput,
  Label: SLabel,
  Card: SCard,
  CardHeader: SCardHeader,
  CardTitle: SCardTitle,
  CardDescription: SCardDescription,
  CardContent: SCardContent,
  Toast: SToast
} = window.SALISAUTODesignSystem_f22df3;
function LoginScreen({
  onLogin,
  dark,
  onToggleDark
}) {
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const submit = e => {
    e.preventDefault();
    if (!email || !pw) {
      setToast({
        v: "destructive",
        t: "Error",
        d: "Please fill in all fields"
      });
      return;
    }
    setToast({
      v: "default",
      t: "Success",
      d: "Logged in successfully"
    });
    setTimeout(onLogin, 600);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      background: "var(--bg-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 800,
      height: 800,
      borderRadius: "50%",
      background: "radial-gradient(circle,rgba(10,94,215,.1),transparent 65%)",
      filter: "blur(64px)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 600,
      height: 600,
      borderRadius: "50%",
      background: "radial-gradient(circle,rgba(11,179,255,.1),transparent 65%)",
      filter: "blur(64px)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: 400,
      height: 400,
      borderRadius: "50%",
      background: "radial-gradient(circle,rgba(249,115,22,.05),transparent 65%)",
      filter: "blur(64px)"
    }
  })), /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    style: {
      position: "fixed",
      top: 16,
      right: 16,
      zIndex: 50
    },
    onClick: onToggleDark,
    "aria-label": "Toggle theme"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dark ? "Sun" : "Moon",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 448,
      padding: 16,
      position: "relative",
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-glass"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 24px 0",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: -16,
      background: "var(--salis-gradient)",
      borderRadius: 16,
      filter: "blur(24px)",
      opacity: .2
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-blue-orange.png",
    alt: "SALIS AUTO",
    style: {
      position: "relative",
      width: 176,
      height: "auto",
      filter: "drop-shadow(0 4px 8px rgba(0,0,0,.15))"
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: 24,
      color: "var(--text-heading)"
    }
  }, "Sign In"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "8px 0 0",
      fontFamily: "var(--font-action)",
      fontSize: 14,
      color: "var(--text-muted)"
    }
  }, "Enter your credentials to access your account"))), /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    style: {
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    htmlFor: "email",
    style: {
      fontFamily: "var(--font-action)"
    }
  }, "Email"), /*#__PURE__*/React.createElement(SInput, {
    id: "email",
    type: "email",
    size: "lg",
    placeholder: "your@email.com",
    value: email,
    onChange: e => setEmail(e.target.value),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Mail",
      size: 20
    }),
    style: {
      fontFamily: "var(--font-action)"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SLabel, {
    htmlFor: "pw",
    style: {
      fontFamily: "var(--font-action)"
    }
  }, "Password"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(SInput, {
    id: "pw",
    type: show ? "text" : "password",
    size: "lg",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    value: pw,
    onChange: e => setPw(e.target.value),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Lock",
      size: 20
    }),
    style: {
      paddingRight: 40,
      fontFamily: "var(--font-action)"
    }
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => setShow(!show),
    "aria-label": show ? "Hide password" : "Show password",
    style: {
      position: "absolute",
      right: 12,
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "var(--text-muted)",
      display: "flex",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: show ? "EyeOff" : "Eye",
    size: 20
  })))), /*#__PURE__*/React.createElement(SButton, {
    type: "submit",
    size: "lg",
    style: {
      width: "100%",
      fontWeight: 600
    }
  }, "Sign In"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      textAlign: "center",
      fontSize: 14,
      fontFamily: "var(--font-action)",
      color: "var(--text-muted)"
    }
  }, "Don't have an account? ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => e.preventDefault(),
    style: {
      fontWeight: 600
    }
  }, "Register"))))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement(SToast, {
    variant: toast.v,
    title: toast.t,
    description: toast.d,
    onClose: () => setToast(null)
  })));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/Shell.jsx
try { (() => {
const {
  Avatar,
  Button,
  Input,
  Badge
} = window.SALISAUTODesignSystem_f22df3;
const NAV = [{
  label: "Overview",
  icon: "Home",
  items: [{
    l: "Dashboard",
    r: "dashboard"
  }]
}, {
  label: "Operations",
  icon: "Wrench",
  items: [{
    l: "Job Cards",
    r: "job-cards"
  }, {
    l: "Appointments",
    r: "appointments"
  }, {
    l: "Estimates",
    r: "estimates"
  }]
}, {
  label: "Customers & Vehicles",
  icon: "Users",
  items: [{
    l: "Customers",
    r: "customers"
  }, {
    l: "Vehicles",
    r: "vehicles"
  }, {
    l: "Fleet Management",
    r: "fleet-management"
  }]
}, {
  label: "Inventory",
  icon: "Package",
  items: [{
    l: "Inventory",
    r: "inventory"
  }]
}, {
  label: "Team",
  icon: "HardHat",
  items: [{
    l: "Technicians",
    r: "technicians"
  }]
}, {
  label: "Finance",
  icon: "CreditCard",
  items: [{
    l: "Invoices",
    r: "invoices"
  }, {
    l: "Payments",
    r: "payments"
  }, {
    l: "Reports",
    r: "reports"
  }]
}, {
  label: "System",
  icon: "Settings",
  items: [{
    l: "Subscription",
    r: "subscription"
  }, {
    l: "Settings",
    r: "settings"
  }, {
    l: "Backup & Export",
    r: "backup"
  }, {
    l: "Profile",
    r: "profile"
  }]
}];
window.KIT_NAV = NAV;
function Sidebar({
  route,
  onNav,
  onLogout
}) {
  const [open, setOpen] = React.useState(NAV.map(g => g.label));
  const toggle = l => setOpen(p => p.includes(l) ? p.filter(x => x !== l) : [...p, l]);
  return /*#__PURE__*/React.createElement("aside", {
    className: "kit-sidebar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "12px 12px 4px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kit-usercard"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Khalid Al-Amri",
    size: 28,
    style: {
      fontSize: 10,
      fontWeight: 700
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 12,
      fontWeight: 600,
      color: "var(--text-primary)",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, "Khalid Al-Amri"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "kit-rolebadge"
  }, "ADMIN"), /*#__PURE__*/React.createElement("span", {
    className: "kit-planbadge"
  }, "PRO"))))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: 12,
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, NAV.map(g => {
    const isOpen = open.includes(g.label);
    return /*#__PURE__*/React.createElement("div", {
      key: g.label
    }, /*#__PURE__*/React.createElement("button", {
      className: "kit-navgroup",
      onClick: () => toggle(g.label)
    }, /*#__PURE__*/React.createElement("span", null, g.label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: isOpen ? "ChevronDown" : "ChevronRight",
      size: 12,
      style: {
        color: "var(--text-muted)"
      }
    })), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        marginTop: 2
      }
    }, g.items.map(it => /*#__PURE__*/React.createElement("button", {
      key: it.r,
      className: "kit-navitem" + (route === it.r ? " on" : ""),
      onClick: () => onNav(it.r)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: g.icon,
      size: 14
    }), /*#__PURE__*/React.createElement("span", null, it.l)))));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 12,
      borderTop: "1px solid var(--border-default)",
      display: "flex",
      flexDirection: "column",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "kit-langbtn"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Globe",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "English")), /*#__PURE__*/React.createElement("button", {
    className: "kit-logout",
    onClick: onLogout
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "LogOut",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Logout"))));
}
function TopBar({
  dark,
  onToggleDark
}) {
  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  return /*#__PURE__*/React.createElement("header", {
    className: "kit-topbar"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Search",
    size: 16,
    style: {
      position: "absolute",
      left: 10,
      color: "var(--text-muted)",
      zIndex: 1
    }
  }), /*#__PURE__*/React.createElement("input", {
    className: "kit-search",
    placeholder: "Search customers, vehicles, parts..."
  })), /*#__PURE__*/React.createElement("button", {
    className: "kit-qa"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Zap",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Quick Actions"), /*#__PURE__*/React.createElement("kbd", null, isMac ? "⌘K" : "Ctrl+K")), /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    onClick: onToggleDark,
    "aria-label": "Toggle theme"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: dark ? "Sun" : "Moon",
    size: 16
  })), /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    style: {
      position: "relative"
    },
    "aria-label": "Notifications"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Bell",
    size: 16
  }), /*#__PURE__*/React.createElement("span", {
    className: "kit-dot"
  })), /*#__PURE__*/React.createElement("button", {
    className: "kit-iconbtn",
    "aria-label": "Chat"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "MessageSquare",
    size: 16
  })));
}
function Blobs() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      pointerEvents: "none",
      zIndex: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 600,
      height: 600,
      borderRadius: "50%",
      background: "radial-gradient(circle,rgba(10,94,215,.05),transparent 70%)",
      filter: "blur(64px)"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: 400,
      height: 400,
      borderRadius: "50%",
      background: "radial-gradient(circle,rgba(11,179,255,.05),transparent 70%)",
      filter: "blur(64px)"
    }
  }));
}
function Shell({
  route,
  onNav,
  onLogout,
  dark,
  onToggleDark,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100vh",
      background: "var(--bg-page)"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    route: route,
    onNav: onNav,
    onLogout: onLogout
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    dark: dark,
    onToggleDark: onToggleDark
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflow: "auto",
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Blobs, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      zIndex: 1,
      padding: 24
    }
  }, children))));
}
Object.assign(window, {
  Shell,
  Sidebar,
  TopBar,
  Blobs
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/Shell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/gms-admin/icons.jsx
try { (() => {
function nodeToHtml(n) {
  if (!Array.isArray(n)) return "";
  const [t, a, c] = n;
  const at = Object.entries(a || {}).map(([k, v]) => `${k}="${v}"`).join(" ");
  return `<${t} ${at}>${(c || []).map(nodeToHtml).join("")}</${t}>`;
}
function iconSvg(name, size = 16, sw = 2) {
  const L = window.lucide;
  if (!L || !L.icons) return "";
  const node = L.icons[name];
  if (!node) return "";
  let attrs = {},
    children;
  if (typeof node[0] === "string" && node[0].toLowerCase() === "svg") {
    attrs = node[1] || {};
    children = node[2] || [];
  } else children = node;
  const a = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    ...attrs,
    width: size,
    height: size,
    "stroke-width": sw
  };
  return `<svg ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}>${children.map(nodeToHtml).join("")}</svg>`;
}
function Icon({
  name,
  size = 16,
  strokeWidth = 2,
  color,
  style
}) {
  const html = React.useMemo(() => iconSvg(name, size, strokeWidth), [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 0,
      flexShrink: 0,
      color,
      ...style
    },
    "aria-hidden": "true",
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
}
window.Icon = Icon;
window.iconSvg = iconSvg;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/gms-admin/icons.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.TableHeader = __ds_scope.TableHeader;

__ds_ns.TableBody = __ds_scope.TableBody;

__ds_ns.TableFooter = __ds_scope.TableFooter;

__ds_ns.TableRow = __ds_scope.TableRow;

__ds_ns.TableHead = __ds_scope.TableHead;

__ds_ns.TableCell = __ds_scope.TableCell;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.LinearLoader = __ds_scope.LinearLoader;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumb = __ds_scope.Breadcrumb;

__ds_ns.PageHeader = __ds_scope.PageHeader;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CardHeader = __ds_scope.CardHeader;

__ds_ns.CardTitle = __ds_scope.CardTitle;

__ds_ns.CardDescription = __ds_scope.CardDescription;

__ds_ns.CardContent = __ds_scope.CardContent;

__ds_ns.CardFooter = __ds_scope.CardFooter;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Separator = __ds_scope.Separator;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
