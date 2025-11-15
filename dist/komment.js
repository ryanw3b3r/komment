var ve = Object.defineProperty;
var he = (s, t, e) => t in s ? ve(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var A = (s, t, e) => he(s, typeof t != "symbol" ? t + "" : t, e);
import { ref as v, computed as S, defineComponent as D, onMounted as j, onUnmounted as H, createElementBlock as E, openBlock as w, normalizeStyle as I, createElementVNode as m, createVNode as pe, Transition as ye, withCtx as ge, createCommentVNode as P, withModifiers as W, toDisplayString as T, watch as J, nextTick as N, withDirectives as ee, vModelText as te, createTextVNode as q, createBlock as G, normalizeClass as Q, Fragment as xe, renderList as we, unref as O, withKeys as be, createApp as Ee, h as Ce } from "vue";
function Pe(s) {
  const t = v([]), e = v(!1), n = v(null), o = v(null), i = s.apiEndpoint || "http://localhost:3001/api/comments", c = S(() => window.location.pathname);
  async function y() {
    e.value = !0, n.value = null;
    try {
      const f = await (await fetch(
        `${i}?pageUrl=${encodeURIComponent(c.value)}`
      )).json();
      if (f.success && f.data)
        t.value = f.data;
      else
        throw new Error(f.error || "Failed to fetch comments");
    } catch (u) {
      n.value = u instanceof Error ? u.message : "Unknown error", console.error("Failed to fetch comments:", u);
    } finally {
      e.value = !1;
    }
  }
  async function x(u) {
    e.value = !0, n.value = null;
    try {
      const k = await (await fetch(i, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(u)
      })).json();
      if (k.success && k.data)
        return t.value.push(k.data), k.data;
      throw new Error(k.error || "Failed to save comment");
    } catch (f) {
      return n.value = f instanceof Error ? f.message : "Unknown error", console.error("Failed to save comment:", f), null;
    } finally {
      e.value = !1;
    }
  }
  async function b(u, f) {
    e.value = !0, n.value = null;
    try {
      const p = await (await fetch(`${i}/${u}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: f })
      })).json();
      if (p.success && p.data) {
        const $ = t.value.findIndex((L) => L.id === u);
        return $ !== -1 && (t.value[$] = p.data), p.data;
      } else
        throw new Error(p.error || "Failed to update comment");
    } catch (k) {
      return n.value = k instanceof Error ? k.message : "Unknown error", console.error("Failed to update comment:", k), null;
    } finally {
      e.value = !1;
    }
  }
  async function l(u) {
    try {
      return (await (await fetch(`${i}/${u}`, {
        method: "DELETE"
      })).json()).success ? (t.value = t.value.filter((p) => p.id !== u), !0) : !1;
    } catch (f) {
      return console.error("Failed to delete comment:", f), !1;
    }
  }
  function r() {
    if (s.enableLiveUpdates)
      try {
        const u = `${i}/stream?pageUrl=${encodeURIComponent(
          c.value
        )}`;
        o.value = new EventSource(u), o.value.addEventListener("comment-added", (f) => {
          const k = JSON.parse(f.data);
          t.value.find((p) => p.id === k.id) || t.value.push(k);
        }), o.value.addEventListener("comment-updated", (f) => {
          const k = JSON.parse(f.data), p = t.value.findIndex(($) => $.id === k.id);
          p !== -1 && (t.value[p] = k);
        }), o.value.addEventListener("comment-deleted", (f) => {
          const { id: k } = JSON.parse(f.data);
          t.value = t.value.filter((p) => p.id !== k);
        }), o.value.onerror = () => {
          console.warn("SSE connection error, will retry...");
        };
      } catch (u) {
        console.error("Failed to setup live updates:", u);
      }
  }
  function g() {
    o.value && (o.value.close(), o.value = null);
  }
  return {
    comments: t,
    isLoading: e,
    error: n,
    fetchComments: y,
    saveComment: x,
    updateComment: b,
    deleteComment: l,
    setupLiveUpdates: r,
    cleanup: g
  };
}
function $e(s) {
  return !s || s === document.body ? void 0 : s.id ? `#${s.id}` : ((e) => {
    const n = [];
    let o = e;
    for (; o && o !== document.body; ) {
      const c = (o.parentElement ? Array.from(o.parentElement.children) : []).indexOf(o) + 1, y = `${o.tagName.toLowerCase()}:nth-child(${c})`;
      n.unshift(y), o = o.parentElement;
    }
    return n;
  })(s).join(" > ");
}
function Le(s) {
  if (!s) return null;
  const t = (n) => {
    const { width: o, height: i } = n.getBoundingClientRect(), { display: c, visibility: y, opacity: x } = window.getComputedStyle(n);
    return o > 0 && i > 0 && c !== "none" && y !== "hidden" && x !== "0";
  }, e = (n) => {
    let o = n;
    for (; o && o !== document.body; ) {
      if (t(o)) return o;
      o = o.parentElement;
    }
    return n;
  };
  try {
    const n = document.querySelector(s);
    return n ? e(n) : null;
  } catch {
    return null;
  }
}
const Se = 20, Te = 10;
class oe {
  constructor(t = Se, e = Te) {
    A(this, "viewportBounds");
    A(this, "offset");
    A(this, "padding");
    this.viewportBounds = {
      width: window.innerWidth,
      height: window.innerHeight
    }, this.offset = t, this.padding = e;
  }
  calculatePopupPosition(t, e) {
    const n = this.toViewportCoords(t);
    let o = this.offsetPosition(n, this.offset, this.offset);
    return this.fitsRight(o, e) || (o.x = n.x - e.width - this.offset), this.fitsWithinHorizontalBounds(o.x, e.width) || (o.x = Math.max(this.padding, Math.min(
      o.x,
      this.viewportBounds.width - e.width - this.padding
    ))), this.fitsBottom(o, e) || (o.y = n.y - e.height - this.offset), this.fitsWithinVerticalBounds(o.y, e.height) || (o.y = Math.max(this.padding, Math.min(
      o.y,
      this.viewportBounds.height - e.height - this.padding
    ))), this.toPageCoords(o);
  }
  calculateTooltipOffset(t, e) {
    const n = this.toViewportCoords(t), o = [
      () => this.tryRight(n, e),
      () => this.tryLeft(n, e),
      () => this.tryBelow(n, e),
      () => this.tryAbove(n, e)
    ];
    for (const i of o) {
      const c = i();
      if (c.fits)
        return this.formatOffset(c.offset);
    }
    return this.formatOffset({ x: this.offset, y: 0 });
  }
  calculateLabelPosition(t, e) {
    const n = t;
    let o = this.offsetPosition(n, 15, 15);
    return this.fitsRight(o, e) || (o.x = n.x - e.width - 15), o.x = Math.max(this.padding, Math.min(
      o.x,
      this.viewportBounds.width - e.width - this.padding
    )), this.fitsBottom(o, e) || (o.y = n.y - e.height - 15), o.y = Math.max(this.padding, Math.min(
      o.y,
      this.viewportBounds.height - e.height - this.padding
    )), o;
  }
  tryRight(t, e) {
    const n = t.x + this.offset, o = t.y;
    return {
      fits: this.fitsInViewport({ x: n, y: o }, e),
      offset: { x: this.offset, y: 0 }
    };
  }
  tryLeft(t, e) {
    const n = t.x - e.width - this.offset, o = t.y;
    return {
      fits: this.fitsInViewport({ x: n, y: o }, e),
      offset: { x: -(e.width + this.offset), y: 0 }
    };
  }
  tryBelow(t, e) {
    const n = t.x - e.width / 2, o = t.y + this.offset;
    return {
      fits: this.fitsInViewport({ x: n, y: o }, e),
      offset: { x: -(e.width / 2), y: this.offset }
    };
  }
  tryAbove(t, e) {
    const n = t.x - e.width / 2, o = t.y - e.height - this.offset;
    return {
      fits: this.fitsInViewport({ x: n, y: o }, e),
      offset: { x: -(e.width / 2), y: -(e.height + this.offset) }
    };
  }
  fitsInViewport(t, e) {
    return this.fitsWithinHorizontalBounds(t.x, e.width) && this.fitsWithinVerticalBounds(t.y, e.height);
  }
  fitsRight(t, e) {
    return t.x + e.width <= this.viewportBounds.width - this.padding;
  }
  fitsBottom(t, e) {
    return t.y + e.height <= this.viewportBounds.height - this.padding;
  }
  fitsWithinHorizontalBounds(t, e) {
    return t >= this.padding && t + e <= this.viewportBounds.width - this.padding;
  }
  fitsWithinVerticalBounds(t, e) {
    return t >= this.padding && t + e <= this.viewportBounds.height - this.padding;
  }
  offsetPosition(t, e, n) {
    return { x: t.x + e, y: t.y + n };
  }
  toViewportCoords(t) {
    return {
      x: t.x - window.scrollX,
      y: t.y - window.scrollY
    };
  }
  toPageCoords(t) {
    return {
      x: t.x + window.scrollX,
      y: t.y + window.scrollY
    };
  }
  formatOffset(t) {
    return {
      left: `${t.x}px`,
      top: `${t.y}px`
    };
  }
}
const z = {
  POPUP: { width: 400, height: 300 },
  TOOLTIP: { width: 350, height: 200 },
  LABEL: { width: 120, height: 30 }
}, F = {
  USER_NAME: "komment-user-name"
}, Z = {
  TEXTAREA: "komment-textarea"
}, Me = { class: "km:flex km:justify-between km:items-start km:mb-2" }, Be = { class: "km:flex-1" }, Ve = {
  key: 0,
  class: "km:text-sm km:font-semibold km:text-gray-900"
}, Ue = { class: "km:text-xs km:text-gray-500" }, Ae = { class: "km:text-sm km:text-gray-700 km:whitespace-pre-wrap km:break-words km:mb-2" }, Oe = /* @__PURE__ */ D({
  __name: "CommentMarker",
  props: {
    comment: {}
  },
  emits: ["delete", "edit", "hover", "unhover"],
  setup(s, { emit: t }) {
    const e = s, n = t, o = new oe(), i = v(!1), c = v(null), y = v(0), x = S(() => (y.value, (() => {
      if (!e.comment.elementSelector) return null;
      const C = Le(e.comment.elementSelector);
      if (!C) return null;
      const B = C.getBoundingClientRect(), V = e.comment.elementOffset || { x: 0, y: 0 };
      return {
        x: B.left + V.x + window.scrollX,
        y: B.top + V.y + window.scrollY
      };
    })() || { x: e.comment.x, y: e.comment.y })), b = S(
      () => o.calculateTooltipOffset(x.value, z.TOOLTIP)
    );
    function l(M) {
      return new Date(M).toLocaleString();
    }
    function r() {
      n("edit", e.comment), i.value = !1;
    }
    function g() {
      confirm("Are you sure you want to delete this comment?") && n("delete", e.comment.id);
    }
    const u = () => {
      c.value && (clearTimeout(c.value), c.value = null);
    };
    function f() {
      u(), i.value = !0, n("hover");
    }
    function k() {
      c.value = window.setTimeout(() => {
        i.value = !1, n("unhover"), c.value = null;
      }, 200);
    }
    function p() {
      u();
    }
    function $() {
      i.value = !1, n("unhover");
    }
    const L = () => y.value++;
    return j(() => {
      window.addEventListener("resize", L), L();
    }), H(() => {
      u(), window.removeEventListener("resize", L);
    }), (M, C) => (w(), E("div", {
      class: "km:absolute km:z-[9997]",
      style: I({
        left: `${x.value.x}px`,
        top: `${x.value.y}px`,
        transform: "translate(-50%, -50%)"
      }),
      onMouseenter: f,
      onMouseleave: k
    }, [
      m("div", {
        class: "km:w-8 km:h-8 km:bg-blue-500 km:rounded-full km:shadow-lg km:cursor-pointer km:flex km:items-center km:justify-center km:text-white km:font-bold km:text-sm km:hover:scale-110 km:transition-transform",
        onClick: r
      }, [...C[0] || (C[0] = [
        m("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class: "km:w-5 km:h-5",
          viewBox: "0 0 20 20",
          fill: "currentColor"
        }, [
          m("path", {
            "fill-rule": "evenodd",
            d: "M18 10c0 3.866-3.582 8-8 8s-8-4.134-8-8 3.582-8 8-8 8 4.134 8 8zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z",
            "clip-rule": "evenodd"
          })
        ], -1)
      ])]),
      pe(ye, {
        "enter-active-class": "km:transition km:duration-200 km:ease-out",
        "enter-from-class": "km:opacity-0 km:scale-95",
        "enter-to-class": "km:opacity-100 km:scale-100",
        "leave-active-class": "km:transition km:duration-100 km:ease-in",
        "leave-from-class": "km:opacity-100 km:scale-100",
        "leave-to-class": "km:opacity-0 km:scale-95"
      }, {
        default: ge(() => [
          i.value ? (w(), E("div", {
            key: 0,
            class: "km:absolute km:z-[9998] km:min-w-[250px] km:max-w-[350px] km:bg-white km:rounded-lg km:shadow-xl km:p-4 km:border km:border-gray-200 km:cursor-pointer",
            style: I({
              left: b.value.left,
              top: b.value.top
            }),
            onClick: W(r, ["stop"]),
            onMouseenter: p,
            onMouseleave: $
          }, [
            m("div", Me, [
              m("div", Be, [
                s.comment.author ? (w(), E("div", Ve, T(s.comment.author), 1)) : P("", !0),
                m("div", Ue, T(l(s.comment.timestamp)), 1)
              ]),
              m("button", {
                onClick: W(g, ["stop"]),
                class: "km:text-gray-400 km:cursor-pointer km:hover:text-red-500 km:transition-colors km:p-1",
                title: "Delete comment"
              }, [...C[1] || (C[1] = [
                m("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  class: "km:h-5 km:w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor"
                }, [
                  m("path", {
                    "fill-rule": "evenodd",
                    d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                    "clip-rule": "evenodd"
                  })
                ], -1)
              ])])
            ]),
            m("div", Ae, T(s.comment.text), 1)
          ], 36)) : P("", !0)
        ]),
        _: 1
      })
    ], 36));
  }
}), _ = (s, t) => {
  const e = s.__vccOpts || s;
  for (const [n, o] of t)
    e[n] = o;
  return e;
}, ze = /* @__PURE__ */ _(Oe, [["__scopeId", "data-v-ef945c0b"]]), Ie = ["disabled"], Ne = { class: "km:flex km:justify-end km:gap-2 km:mt-4" }, Re = ["disabled"], Fe = ["disabled"], De = /* @__PURE__ */ D({
  __name: "CommentPopup",
  props: {
    modelValue: {},
    position: {},
    isLoading: { type: Boolean }
  },
  emits: ["update:modelValue", "save", "cancel", "hover", "unhover"],
  setup(s, { emit: t }) {
    const e = s, n = t, o = v(null), i = v(null), c = v(e.modelValue);
    J(
      () => e.modelValue,
      (l) => {
        c.value = l;
      }
    ), J(c, (l) => {
      n("update:modelValue", l), y();
    });
    function y() {
      N(() => {
        o.value && (o.value.style.height = "auto", o.value.style.height = `${o.value.scrollHeight}px`);
      });
    }
    function x(l) {
      i.value && !i.value.contains(l.target) && n("cancel");
    }
    function b(l) {
      l.key === "Escape" ? n("cancel") : l.key === "Enter" && (l.metaKey || l.ctrlKey) && n("save");
    }
    return j(() => {
      document.addEventListener("mousedown", x), document.addEventListener("keydown", b), N(() => {
        var l;
        (l = o.value) == null || l.focus();
      });
    }), H(() => {
      document.removeEventListener("mousedown", x), document.removeEventListener("keydown", b);
    }), (l, r) => (w(), E("div", {
      ref_key: "popupRef",
      ref: i,
      class: "km:fixed km:z-[10000] km:bg-white km:rounded-lg km:shadow-2xl km:p-4 km:border km:border-gray-200 km:min-w-[320px] km:max-w-[400px]",
      style: I({
        left: `${s.position.x}px`,
        top: `${s.position.y}px`
      }),
      onMouseenter: r[3] || (r[3] = (g) => n("hover")),
      onMouseleave: r[4] || (r[4] = (g) => n("unhover"))
    }, [
      r[5] || (r[5] = m("div", { class: "km:mb-3" }, [
        m("h3", { class: "km:text-sm km:font-semibold km:text-gray-900" }, "Add Comment"),
        m("p", { class: "km:text-xs km:text-gray-500 km:mt-1" }, " Enter your feedback or comment below ")
      ], -1)),
      ee(m("textarea", {
        ref_key: "textareaRef",
        ref: o,
        "onUpdate:modelValue": r[0] || (r[0] = (g) => c.value = g),
        class: "komment-textarea km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:text-gray-900 km:resize-none focus:km:outline-none focus:km:ring-2 focus:km:ring-blue-500 focus:km:border-transparent km:min-h-[80px] km:max-h-[300px]",
        placeholder: "Type your comment here...",
        disabled: s.isLoading
      }, null, 8, Ie), [
        [te, c.value]
      ]),
      r[6] || (r[6] = m("div", { class: "km:text-xs km:text-gray-400 km:mt-2" }, [
        m("kbd", { class: "km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300" }, "Esc"),
        q(" to cancel, "),
        m("kbd", { class: "km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300" }, "Cmd/Ctrl+Enter"),
        q(" to save ")
      ], -1)),
      m("div", Ne, [
        m("button", {
          onClick: r[1] || (r[1] = (g) => n("cancel")),
          disabled: s.isLoading,
          class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-gray-700 km:bg-white km:border km:border-gray-300 km:rounded-md km:cursor-pointer km:hover:bg-gray-50 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
        }, " Cancel ", 8, Re),
        m("button", {
          onClick: r[2] || (r[2] = (g) => n("save")),
          disabled: s.isLoading || !c.value.trim(),
          class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
        }, T(s.isLoading ? "Saving..." : "Save"), 9, Fe)
      ])
    ], 36));
  }
}), je = /* @__PURE__ */ _(De, [["__scopeId", "data-v-839823fb"]]), He = {
  key: 0,
  class: "komment-container"
}, _e = {
  key: 3,
  class: "km:fixed km:bottom-20 km:right-4 km:z-[10001] km:px-4 km:py-3 km:bg-red-500 km:text-white km:rounded km:shadow-lg"
}, Ke = {
  key: 4,
  class: "km:fixed km:inset-0 km:z-[10002] km:flex km:items-center km:justify-center km:bg-black/50"
}, Xe = { class: "km:bg-white km:rounded-lg km:shadow-2xl km:p-6 km:max-w-md km:w-full km:mx-4" }, Ye = { class: "km:flex km:justify-end km:gap-2" }, We = ["disabled"], Je = {
  key: 5,
  class: "km:fixed km:bottom-4 km:left-4 km:z-[9999] km:bg-white km:rounded-lg km:shadow-md km:px-3 km:py-2 km:flex km:items-center km:gap-2"
}, qe = { class: "km:text-sm km:text-gray-700" }, Ge = /* @__PURE__ */ D({
  __name: "Komment",
  props: {
    apiEndpoint: { default: "http://localhost:3001/api/comments" },
    autoEnable: { type: Boolean, default: !0 },
    forceEnable: { type: Boolean, default: !1 },
    author: {},
    enableLiveUpdates: { type: Boolean, default: !0 },
    buttonPosition: { default: "bottom-right" }
  },
  setup(s) {
    const t = s, e = new oe(), n = v(!1), o = v(!1), i = v(!1), c = v(!1), y = v({ x: 0, y: 0 }), x = v({ x: 0, y: 0 }), b = v({ x: 0, y: 0 }), l = v(""), r = v(""), g = v(null), u = v(!1), f = v({}), {
      comments: k,
      isLoading: p,
      error: $,
      fetchComments: L,
      saveComment: M,
      updateComment: C,
      deleteComment: B,
      setupLiveUpdates: V,
      cleanup: ne
    } = Pe(t), se = S(() => t.forceEnable ? !0 : t.autoEnable ? process.env.NODE_ENV !== "production" : !1), re = S(() => o.value ? "Finish" : "Comment"), ae = S(() => ({
      "top-left": "km:fixed km:top-4 km:left-4",
      "top-right": "km:fixed km:top-4 km:right-4",
      "bottom-left": "km:fixed km:bottom-4 km:left-4",
      "bottom-right": "km:fixed km:bottom-4 km:right-4"
    })[t.buttonPosition]), K = S(() => r.value || t.author || "Anonymous");
    function ie() {
      o.value = !o.value, o.value ? (!localStorage.getItem(F.USER_NAME) && !r.value && (c.value = !0), document.body.style.overflow = "hidden", document.addEventListener("mousemove", R)) : (document.body.style.overflow = "", document.removeEventListener("mousemove", R), i.value = !1, l.value = "");
    }
    function R(d) {
      x.value = { x: d.clientX, y: d.clientY }, b.value = e.calculateLabelPosition(
        x.value,
        z.LABEL
      );
    }
    function le(d) {
      if (!o.value) return;
      const a = () => {
        const h = document.elementFromPoint(
          d.clientX,
          d.clientY
        ), U = $e(h);
        if (!h) return { selector: U };
        const Y = h.getBoundingClientRect();
        return {
          selector: U,
          offset: {
            x: d.clientX - Y.left,
            y: d.clientY - Y.top
          }
        };
      };
      f.value = a(), y.value = e.calculatePopupPosition(
        { x: d.clientX, y: d.clientY },
        z.POPUP
      ), i.value = !0, N(() => {
        var h;
        (h = document.querySelector(`.${Z.TEXTAREA}`)) == null || h.focus();
      });
    }
    async function me() {
      if (l.value.trim())
        if (g.value)
          await C(
            g.value,
            l.value.trim()
          ) && (i.value = !1, l.value = "", g.value = null);
        else {
          const d = {
            x: y.value.x,
            y: y.value.y,
            text: l.value.trim(),
            author: K.value,
            pageUrl: window.location.pathname,
            elementSelector: f.value.selector,
            elementOffset: f.value.offset
          };
          await M(d) && (i.value = !1, l.value = "", f.value = {});
        }
    }
    function ue() {
      const d = localStorage.getItem(F.USER_NAME);
      if (d) {
        r.value = d;
        return;
      }
      c.value = !0;
    }
    function X(d) {
      r.value = d, localStorage.setItem(F.USER_NAME, d), c.value = !1;
    }
    function de() {
      c.value = !0;
    }
    function ce() {
      i.value = !1, l.value = "", g.value = null;
    }
    function fe(d) {
      y.value = e.calculatePopupPosition(
        { x: d.x, y: d.y },
        z.POPUP
      ), l.value = d.text, g.value = d.id, i.value = !0, N(() => {
        var a;
        (a = document.querySelector(`.${Z.TEXTAREA}`)) == null || a.focus();
      });
    }
    function ke(d) {
      B(d);
    }
    return j(async () => {
      se.value && (n.value = !0, ue(), await L(), V());
    }), H(() => {
      ne(), document.removeEventListener("mousemove", R), document.body.style.overflow = "";
    }), (d, a) => n.value ? (w(), E("div", He, [
      m("button", {
        onClick: ie,
        onMouseenter: a[0] || (a[0] = (h) => u.value = !0),
        onMouseleave: a[1] || (a[1] = (h) => u.value = !1),
        class: Q([
          "km:z-[9999] km:px-6 km:py-3 km:rounded-full km:shadow-lg km:cursor-pointer",
          "km:font-semibold km:text-white km:transition-all km:duration-200",
          "km:hover:scale-105 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2",
          o.value ? "km:bg-red-500 km:hover:bg-red-600 km:focus:ring-red-500" : "km:bg-blue-500 km:hover:bg-blue-600 km:focus:ring-blue-500",
          ae.value
        ])
      }, T(re.value), 35),
      o.value ? (w(), E("div", {
        key: 0,
        onClick: le,
        class: Q([
          "km:fixed km:inset-0 km:z-[9995] km:bg-white/30",
          "km:cursor-crosshair km:**:cursor-crosshair"
        ])
      }, [
        !i.value && !u.value ? (w(), E("div", {
          key: 0,
          class: "km:fixed km:pointer-events-none km:z-[9999] km:px-3 km:py-1 km:bg-gray-900 km:text-white km:text-sm km:rounded km:shadow-lg",
          style: I({
            left: `${b.value.x}px`,
            top: `${b.value.y}px`
          })
        }, " add comment ", 4)) : P("", !0)
      ])) : P("", !0),
      o.value ? (w(!0), E(xe, { key: 1 }, we(O(k), (h) => (w(), G(ze, {
        key: h.id,
        comment: h,
        onDelete: ke,
        onEdit: fe,
        onHover: a[2] || (a[2] = (U) => u.value = !0),
        onUnhover: a[3] || (a[3] = (U) => u.value = !1)
      }, null, 8, ["comment"]))), 128)) : P("", !0),
      i.value ? (w(), G(je, {
        key: 2,
        modelValue: l.value,
        "onUpdate:modelValue": a[4] || (a[4] = (h) => l.value = h),
        position: y.value,
        "is-loading": O(p),
        onSave: me,
        onCancel: ce,
        onHover: a[5] || (a[5] = (h) => u.value = !0),
        onUnhover: a[6] || (a[6] = (h) => u.value = !1)
      }, null, 8, ["modelValue", "position", "is-loading"])) : P("", !0),
      O($) ? (w(), E("div", _e, T(O($)), 1)) : P("", !0),
      c.value ? (w(), E("div", Ke, [
        m("div", Xe, [
          a[10] || (a[10] = m("h2", { class: "km:text-xl km:font-bold km:text-gray-900 km:mb-2" }, " Welcome to Komment! ", -1)),
          a[11] || (a[11] = m("p", { class: "km:text-sm km:text-gray-600 km:mb-4" }, " Please enter your name to start commenting: ", -1)),
          ee(m("input", {
            ref: "nameInput",
            "onUpdate:modelValue": a[7] || (a[7] = (h) => r.value = h),
            type: "text",
            placeholder: "Your name...",
            class: "km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:focus:outline-none km:focus:ring-2 km:focus:ring-blue-500 km:mb-4",
            onKeyup: a[8] || (a[8] = be((h) => r.value.trim() && X(r.value.trim()), ["enter"]))
          }, null, 544), [
            [te, r.value]
          ]),
          m("div", Ye, [
            m("button", {
              onClick: a[9] || (a[9] = (h) => X(r.value.trim() || "Anonymous")),
              disabled: !r.value.trim(),
              class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2 km:focus:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
            }, " Start Commenting ", 8, We)
          ])
        ])
      ])) : P("", !0),
      o.value ? P("", !0) : (w(), E("div", Je, [
        m("span", qe, T(K.value), 1),
        m("button", {
          onClick: de,
          class: "km:text-xs km:text-blue-500 km:cursor-pointer km:hover:text-blue-700 km:underline",
          title: "Change name"
        }, " change ")
      ]))
    ])) : P("", !0);
  }
}), Qe = /* @__PURE__ */ _(Ge, [["__scopeId", "data-v-0d8cab6b"]]);
function tt(s = {}) {
  return {
    install(t) {
      const e = document.createElement("div");
      e.id = "komment-root", document.body.appendChild(e);
      const n = Ee({
        render() {
          return Ce(Qe, s);
        }
      });
      n.mount(e), t.config.globalProperties.$komment = n;
    }
  };
}
export {
  ze as CommentMarker,
  je as CommentPopup,
  Qe as Komment,
  tt as KommentPlugin,
  tt as createKomment,
  Pe as useComments
};
