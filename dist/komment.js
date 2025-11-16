var be = Object.defineProperty;
var Ee = (s, t, e) => t in s ? be(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var V = (s, t, e) => Ee(s, typeof t != "symbol" ? t + "" : t, e);
import { ref as k, computed as $, defineComponent as W, onMounted as X, onUnmounted as J, createElementBlock as L, openBlock as w, normalizeStyle as R, createElementVNode as l, createVNode as Ce, Transition as Le, withCtx as Pe, createCommentVNode as S, withModifiers as oe, toDisplayString as O, watch as ne, nextTick as Y, withDirectives as me, vModelText as ue, createTextVNode as se, createBlock as re, normalizeClass as ie, Fragment as Se, renderList as Te, unref as I, withKeys as $e, createApp as Oe, h as Be } from "vue";
function Ue(s) {
  const t = k([]), e = k(!1), n = k(null), o = k(null), r = s.apiEndpoint || "http://localhost:3001/api/comments", u = $(() => window.location.pathname);
  async function h(f, v) {
    e.value = !0, n.value = null;
    try {
      return await f();
    } catch (c) {
      return n.value = c instanceof Error ? c.message : v, console.error(v, c), null;
    } finally {
      e.value = !1;
    }
  }
  async function y() {
    await h(async () => {
      const v = await (await fetch(
        `${r}?pageUrl=${encodeURIComponent(u.value)}`
      )).json();
      if (v.success && v.data)
        t.value = v.data;
      else
        throw new Error(v.error || "Failed to fetch comments");
    }, "Failed to fetch comments");
  }
  async function b(f) {
    return h(async () => {
      const c = await (await fetch(r, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(f)
      })).json();
      if (c.success && c.data)
        return t.value.push(c.data), c.data;
      throw new Error(c.error || "Failed to save comment");
    }, "Failed to save comment");
  }
  async function m(f, v) {
    return h(async () => {
      const p = await (await fetch(`${r}/${f}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: v })
      })).json();
      if (p.success && p.data) {
        const E = t.value.findIndex((T) => T.id === f);
        return E !== -1 && (t.value[E] = p.data), p.data;
      } else
        throw new Error(p.error || "Failed to update comment");
    }, "Failed to update comment");
  }
  async function a(f) {
    return h(async () => {
      const c = await (await fetch(`${r}/${f}`, {
        method: "DELETE"
      })).json();
      if (c.success) {
        const p = t.value.find((E) => E.id === f);
        return t.value = t.value.filter((E) => E.id !== f), p || null;
      } else
        throw new Error(c.error || "Failed to delete comment");
    }, "Failed to delete comment");
  }
  function x() {
    if (s.enableLiveUpdates)
      try {
        const f = `${r}/stream?pageUrl=${encodeURIComponent(
          u.value
        )}`;
        o.value = new EventSource(f), o.value.addEventListener("comment-added", (v) => {
          const c = JSON.parse(v.data);
          t.value.find((p) => p.id === c.id) || t.value.push(c);
        }), o.value.addEventListener("comment-updated", (v) => {
          const c = JSON.parse(v.data), p = t.value.findIndex((E) => E.id === c.id);
          p !== -1 && (t.value[p] = c);
        }), o.value.addEventListener("comment-deleted", (v) => {
          const { id: c } = JSON.parse(v.data);
          t.value = t.value.filter((p) => p.id !== c);
        }), o.value.onerror = () => {
          console.warn("SSE connection error, will retry...");
        };
      } catch (f) {
        console.error("Failed to setup live updates:", f);
      }
  }
  function C() {
    o.value && (o.value.close(), o.value = null);
  }
  return {
    comments: t,
    isLoading: e,
    error: n,
    fetchComments: y,
    saveComment: b,
    updateComment: m,
    deleteComment: a,
    setupLiveUpdates: x,
    cleanup: C
  };
}
function Me(s) {
  return !s || s === document.body ? void 0 : s.id ? `#${s.id}` : ((e) => {
    const n = [];
    let o = e;
    for (; o && o !== document.body; ) {
      const u = (o.parentElement ? Array.from(o.parentElement.children) : []).indexOf(o) + 1, h = `${o.tagName.toLowerCase()}:nth-child(${u})`;
      n.unshift(h), o = o.parentElement;
    }
    return n;
  })(s).join(" > ");
}
function Ae(s) {
  if (!s) return null;
  const t = (n) => {
    const { width: o, height: r } = n.getBoundingClientRect(), { display: u, visibility: h, opacity: y } = window.getComputedStyle(n);
    return o > 0 && r > 0 && u !== "none" && h !== "hidden" && y !== "0";
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
const N = {
  POPUP: { width: 400, height: 300 },
  TOOLTIP: { width: 350, height: 200 },
  LABEL: { width: 120, height: 30 }
}, j = {
  USER_NAME: "komment-user-name"
}, Ve = {
  TEXTAREA: "komment-textarea"
}, ae = {
  TOOLTIP_HIDE_DELAY: 200,
  DEBOUNCE_DELAY: 16
  // ~60fps
}, Ie = {
  CURSOR_LABEL: 15
}, Ne = 20, Re = 10;
class ze {
  /**
   * Create a new ViewportPositioner
   * @param offset - Default offset from cursor/anchor point (default: 20px)
   * @param padding - Minimum padding from viewport edges (default: 10px)
   */
  constructor(t = Ne, e = Re) {
    V(this, "viewportBounds");
    V(this, "offset");
    V(this, "padding");
    this.viewportBounds = {
      width: window.innerWidth,
      height: window.innerHeight
    }, this.offset = t, this.padding = e;
  }
  /**
   * Calculate optimal position for a popup element
   * Prefers placing to the right and below cursor, adjusts if doesn't fit
   * @param cursorPosition - Cursor position in page coordinates
   * @param dimensions - Popup width and height
   * @returns Optimal position in page coordinates
   */
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
  /**
   * Calculate tooltip offset from marker position
   * Tries placements in order: right, left, below, above
   * @param markerPosition - Marker position in page coordinates
   * @param dimensions - Tooltip width and height
   * @returns CSS offset values (left, top) relative to marker
   */
  calculateTooltipOffset(t, e) {
    const n = this.toViewportCoords(t), o = [
      () => this.tryRight(n, e),
      () => this.tryLeft(n, e),
      () => this.tryBelow(n, e),
      () => this.tryAbove(n, e)
    ];
    for (const r of o) {
      const u = r();
      if (u.fits)
        return this.formatOffset(u.offset);
    }
    return this.formatOffset({ x: this.offset, y: 0 });
  }
  /**
   * Calculate position for cursor label
   * Similar to popup but with smaller default offset
   * @param cursorPosition - Cursor position in viewport coordinates
   * @param dimensions - Label width and height
   * @param offset - Distance from cursor (default: 15px)
   * @returns Optimal position in viewport coordinates
   */
  calculateLabelPosition(t, e, n = 15) {
    const o = t;
    let r = this.offsetPosition(o, n, n);
    return this.fitsRight(r, e) || (r.x = o.x - e.width - n), r.x = Math.max(this.padding, Math.min(
      r.x,
      this.viewportBounds.width - e.width - this.padding
    )), this.fitsBottom(r, e) || (r.y = o.y - e.height - n), r.y = Math.max(this.padding, Math.min(
      r.y,
      this.viewportBounds.height - e.height - this.padding
    )), r;
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
let K = null;
function de() {
  return K || (K = new ze()), K;
}
const De = { class: "km:flex km:justify-between km:items-start km:mb-2" }, Fe = { class: "km:flex-1" }, _e = {
  key: 0,
  class: "km:text-sm km:font-semibold km:text-gray-900"
}, He = { class: "km:text-xs km:text-gray-500" }, je = { class: "km:text-sm km:text-gray-700 km:whitespace-pre-wrap km:break-words km:mb-2" }, Ke = /* @__PURE__ */ W({
  __name: "CommentMarker",
  props: {
    comment: {}
  },
  emits: ["delete", "edit", "hover", "unhover"],
  setup(s, { emit: t }) {
    const e = s, n = t, o = de(), r = k(!1), u = k(null), h = k(0), y = k(null), b = $(() => (h.value, (() => {
      if (!e.comment.elementSelector)
        return null;
      const P = Ae(e.comment.elementSelector);
      if (!P)
        return null;
      const U = P.getBoundingClientRect(), M = e.comment.elementOffset || { x: 0, y: 0 };
      return {
        x: U.left + M.x,
        y: U.top + M.y
      };
    })() || { x: e.comment.x, y: e.comment.y })), m = $(
      () => o.calculateTooltipOffset(b.value, N.TOOLTIP)
    );
    function a(B) {
      return new Date(B).toLocaleString();
    }
    function x() {
      n("edit", e.comment), r.value = !1;
    }
    function C() {
      confirm("Are you sure you want to delete this comment?") && n("delete", e.comment.id);
    }
    const f = () => {
      u.value && (clearTimeout(u.value), u.value = null);
    };
    function v() {
      f(), r.value = !0, n("hover");
    }
    function c() {
      u.value = window.setTimeout(() => {
        r.value = !1, n("unhover"), u.value = null;
      }, ae.TOOLTIP_HIDE_DELAY);
    }
    function p() {
      f();
    }
    function E() {
      r.value = !1, n("unhover");
    }
    const T = () => {
      y.value && clearTimeout(y.value), y.value = window.setTimeout(() => {
        h.value++, y.value = null;
      }, ae.DEBOUNCE_DELAY);
    }, z = () => {
      h.value++;
    };
    return X(() => {
      window.addEventListener("resize", T), window.addEventListener("scroll", T, !0), z();
    }), J(() => {
      f(), y.value && clearTimeout(y.value), window.removeEventListener("resize", T), window.removeEventListener("scroll", T, !0);
    }), (B, P) => (w(), L("div", {
      class: "km:fixed km:z-[9997]",
      style: R({
        left: `${b.value.x}px`,
        top: `${b.value.y}px`,
        transform: "translate(-50%, -50%)"
      }),
      onMouseenter: v,
      onMouseleave: c
    }, [
      l("div", {
        class: "km:w-8 km:h-8 km:bg-blue-500 km:rounded-full km:shadow-lg km:cursor-pointer km:flex km:items-center km:justify-center km:text-white km:font-bold km:text-sm km:hover:scale-110 km:transition-transform",
        onClick: x
      }, [...P[0] || (P[0] = [
        l("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          class: "km:w-5 km:h-5",
          viewBox: "0 0 20 20",
          fill: "currentColor"
        }, [
          l("path", {
            "fill-rule": "evenodd",
            d: "M18 10c0 3.866-3.582 8-8 8s-8-4.134-8-8 3.582-8 8-8 8 4.134 8 8zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z",
            "clip-rule": "evenodd"
          })
        ], -1)
      ])]),
      Ce(Le, {
        "enter-active-class": "km:transition km:duration-200 km:ease-out",
        "enter-from-class": "km:opacity-0 km:scale-95",
        "enter-to-class": "km:opacity-100 km:scale-100",
        "leave-active-class": "km:transition km:duration-100 km:ease-in",
        "leave-from-class": "km:opacity-100 km:scale-100",
        "leave-to-class": "km:opacity-0 km:scale-95"
      }, {
        default: Pe(() => [
          r.value ? (w(), L("div", {
            key: 0,
            class: "km:absolute km:z-[9998] km:min-w-[250px] km:max-w-[350px] km:bg-white km:rounded-lg km:shadow-xl km:p-4 km:border km:border-gray-200 km:cursor-pointer",
            style: R({
              left: m.value.left,
              top: m.value.top
            }),
            onClick: oe(x, ["stop"]),
            onMouseenter: p,
            onMouseleave: E
          }, [
            l("div", De, [
              l("div", Fe, [
                s.comment.author ? (w(), L("div", _e, O(s.comment.author), 1)) : S("", !0),
                l("div", He, O(a(s.comment.timestamp)), 1)
              ]),
              l("button", {
                onClick: oe(C, ["stop"]),
                class: "km:text-gray-400 km:cursor-pointer km:hover:text-red-500 km:transition-colors km:p-1",
                title: "Delete comment"
              }, [...P[1] || (P[1] = [
                l("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  class: "km:h-5 km:w-5",
                  viewBox: "0 0 20 20",
                  fill: "currentColor"
                }, [
                  l("path", {
                    "fill-rule": "evenodd",
                    d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z",
                    "clip-rule": "evenodd"
                  })
                ], -1)
              ])])
            ]),
            l("div", je, O(s.comment.text), 1)
          ], 36)) : S("", !0)
        ]),
        _: 1
      })
    ], 36));
  }
}), q = (s, t) => {
  const e = s.__vccOpts || s;
  for (const [n, o] of t)
    e[n] = o;
  return e;
}, Ye = /* @__PURE__ */ q(Ke, [["__scopeId", "data-v-33964e7b"]]), We = ["disabled"], Xe = { class: "km:flex km:justify-end km:gap-2 km:mt-4" }, Je = ["disabled"], qe = ["disabled"], Ge = /* @__PURE__ */ W({
  __name: "CommentPopup",
  props: {
    modelValue: {},
    position: {},
    isLoading: { type: Boolean }
  },
  emits: ["update:modelValue", "save", "cancel", "hover", "unhover"],
  setup(s, { emit: t }) {
    const e = s, n = t, o = k(null), r = k(null), u = k(e.modelValue);
    ne(
      () => e.modelValue,
      (m) => {
        u.value = m;
      }
    ), ne(u, (m) => {
      n("update:modelValue", m), h();
    });
    function h() {
      Y(() => {
        o.value && (o.value.style.height = "auto", o.value.style.height = `${o.value.scrollHeight}px`);
      });
    }
    function y(m) {
      r.value && !r.value.contains(m.target) && n("cancel");
    }
    function b(m) {
      m.key === "Escape" ? n("cancel") : m.key === "Enter" && (m.metaKey || m.ctrlKey) && n("save");
    }
    return X(() => {
      document.addEventListener("mousedown", y), document.addEventListener("keydown", b), Y(() => {
        var m;
        (m = o.value) == null || m.focus();
      });
    }), J(() => {
      document.removeEventListener("mousedown", y), document.removeEventListener("keydown", b);
    }), (m, a) => (w(), L("div", {
      ref_key: "popupRef",
      ref: r,
      class: "km:fixed km:z-[10000] km:bg-white km:rounded-lg km:shadow-2xl km:p-4 km:border km:border-gray-200 km:min-w-[320px] km:max-w-[400px]",
      style: R({
        left: `${s.position.x}px`,
        top: `${s.position.y}px`
      }),
      onMouseenter: a[3] || (a[3] = (x) => n("hover")),
      onMouseleave: a[4] || (a[4] = (x) => n("unhover"))
    }, [
      a[5] || (a[5] = l("div", { class: "km:mb-3" }, [
        l("h3", { class: "km:text-sm km:font-semibold km:text-gray-900" }, "Add Comment"),
        l("p", { class: "km:text-xs km:text-gray-500 km:mt-1" }, " Enter your feedback or comment below ")
      ], -1)),
      me(l("textarea", {
        ref_key: "textareaRef",
        ref: o,
        "onUpdate:modelValue": a[0] || (a[0] = (x) => u.value = x),
        class: "komment-textarea km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:text-gray-900 km:resize-none focus:km:outline-none focus:km:ring-2 focus:km:ring-blue-500 focus:km:border-transparent km:min-h-[80px] km:max-h-[300px]",
        placeholder: "Type your comment here...",
        disabled: s.isLoading
      }, null, 8, We), [
        [ue, u.value]
      ]),
      a[6] || (a[6] = l("div", { class: "km:text-xs km:text-gray-400 km:mt-2" }, [
        l("kbd", { class: "km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300" }, "Esc"),
        se(" to cancel, "),
        l("kbd", { class: "km:px-1 km:py-0.5 km:bg-gray-100 km:rounded km:border km:border-gray-300" }, "Cmd/Ctrl+Enter"),
        se(" to save ")
      ], -1)),
      l("div", Xe, [
        l("button", {
          onClick: a[1] || (a[1] = (x) => n("cancel")),
          disabled: s.isLoading,
          class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-gray-700 km:bg-white km:border km:border-gray-300 km:rounded-md km:cursor-pointer km:hover:bg-gray-50 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
        }, " Cancel ", 8, Je),
        l("button", {
          onClick: a[2] || (a[2] = (x) => n("save")),
          disabled: s.isLoading || !u.value.trim(),
          class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 focus:km:outline-none focus:km:ring-2 focus:km:ring-offset-2 focus:km:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
        }, O(s.isLoading ? "Saving..." : "Save"), 9, qe)
      ])
    ], 36));
  }
}), Qe = /* @__PURE__ */ q(Ge, [["__scopeId", "data-v-839823fb"]]);
function le(s, t = "") {
  try {
    const e = localStorage.getItem(s);
    return e !== null ? e : t;
  } catch (e) {
    return console.warn(`Failed to read from localStorage (key: ${s}):`, e), t;
  }
}
function Ze(s, t) {
  try {
    return localStorage.setItem(s, t), !0;
  } catch (e) {
    return console.warn(`Failed to write to localStorage (key: ${s}):`, e), !1;
  }
}
const et = {
  key: 0,
  class: "komment-container"
}, tt = {
  key: 3,
  class: "km:fixed km:bottom-20 km:right-4 km:z-[10001] km:px-4 km:py-3 km:bg-red-500 km:text-white km:rounded km:shadow-lg"
}, ot = {
  key: 4,
  class: "km:fixed km:inset-0 km:z-[10002] km:flex km:items-center km:justify-center km:bg-black/50"
}, nt = { class: "km:bg-white km:rounded-lg km:shadow-2xl km:p-6 km:max-w-md km:w-full km:mx-4" }, st = { class: "km:flex km:justify-end km:gap-2" }, rt = ["disabled"], it = {
  key: 5,
  class: "km:fixed km:bottom-4 km:left-4 km:z-[9999] km:bg-white km:rounded-lg km:shadow-md km:px-3 km:py-2 km:flex km:items-center km:gap-2"
}, at = { class: "km:text-sm km:text-gray-700" }, lt = /* @__PURE__ */ W({
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
    const t = s, e = de(), n = k(!1), o = k(!1), r = k(!1), u = k(!1), h = k({ x: 0, y: 0 }), y = k({ x: 0, y: 0 }), b = k({ x: 0, y: 0 }), m = k(""), a = k(""), x = k(null), C = k(!1), f = k({}), {
      comments: v,
      isLoading: c,
      error: p,
      fetchComments: E,
      saveComment: T,
      updateComment: z,
      deleteComment: B,
      setupLiveUpdates: P,
      cleanup: U
    } = Ue(t), M = $(() => t.forceEnable ? !0 : t.autoEnable ? process.env.NODE_ENV !== "production" : !1), ce = $(() => o.value ? "Finish" : "Comment"), fe = $(() => ({
      "top-left": "km:fixed km:top-4 km:left-4",
      "top-right": "km:fixed km:top-4 km:right-4",
      "bottom-left": "km:fixed km:bottom-4 km:left-4",
      "bottom-right": "km:fixed km:bottom-4 km:right-4"
    })[t.buttonPosition]), G = $(() => a.value || t.author || "Anonymous");
    function ke() {
      o.value = !o.value, o.value ? (!le(j.USER_NAME) && !a.value && (u.value = !0), document.body.style.overflow = "hidden", document.addEventListener("mousemove", D)) : (document.body.style.overflow = "", document.removeEventListener("mousemove", D), r.value = !1, m.value = "");
    }
    function D(i) {
      y.value = { x: i.clientX, y: i.clientY }, b.value = e.calculateLabelPosition(
        y.value,
        N.LABEL,
        Ie.CURSOR_LABEL
      );
    }
    function ve(i) {
      if (!o.value) return;
      const d = () => {
        const g = i.target, _ = g.style.pointerEvents;
        g.style.pointerEvents = "none";
        const A = document.elementFromPoint(
          i.clientX,
          i.clientY
        );
        if (g.style.pointerEvents = _, ((H) => H ? H.closest("#komment-root") !== null || H.id === "komment-root" : !1)(A))
          return { selector: void 0, offset: void 0 };
        const ee = Me(A);
        if (!A) return { selector: ee };
        const te = A.getBoundingClientRect();
        return {
          selector: ee,
          offset: {
            x: i.clientX - te.left,
            y: i.clientY - te.top
          }
        };
      };
      f.value = d(), h.value = e.calculatePopupPosition(
        { x: i.clientX, y: i.clientY },
        N.POPUP
      ), r.value = !0, Z();
    }
    async function he() {
      if (m.value.trim())
        if (x.value)
          await z(
            x.value,
            m.value.trim()
          ) && F();
        else {
          const i = {
            x: h.value.x,
            y: h.value.y,
            text: m.value.trim(),
            author: G.value,
            pageUrl: window.location.pathname,
            elementSelector: f.value.selector,
            elementOffset: f.value.offset
          };
          await T(i) && (F(), f.value = {});
        }
    }
    function pe() {
      const i = le(j.USER_NAME);
      if (i) {
        a.value = i;
        return;
      }
      u.value = !0;
    }
    function Q(i) {
      a.value = i, Ze(j.USER_NAME, i), u.value = !1;
    }
    function ye() {
      u.value = !0;
    }
    function Z() {
      Y(() => {
        var i;
        (i = document.querySelector(`.${Ve.TEXTAREA}`)) == null || i.focus();
      });
    }
    function F() {
      r.value = !1, m.value = "", x.value = null;
    }
    function ge() {
      F();
    }
    function xe(i) {
      h.value = e.calculatePopupPosition(
        { x: i.x, y: i.y },
        N.POPUP
      ), m.value = i.text, x.value = i.id, r.value = !0, Z();
    }
    function we(i) {
      B(i);
    }
    return X(async () => {
      M.value && (n.value = !0, pe(), await E(), P());
    }), J(() => {
      U(), document.removeEventListener("mousemove", D), document.body.style.overflow = "";
    }), (i, d) => n.value ? (w(), L("div", et, [
      l("button", {
        onClick: ke,
        onMouseenter: d[0] || (d[0] = (g) => C.value = !0),
        onMouseleave: d[1] || (d[1] = (g) => C.value = !1),
        class: ie([
          "km:z-[9999] km:px-6 km:py-3 km:rounded-full km:shadow-lg km:cursor-pointer",
          "km:font-semibold km:text-white km:transition-all km:duration-200",
          "km:hover:scale-105 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2",
          o.value ? "km:bg-red-500 km:hover:bg-red-600 km:focus:ring-red-500" : "km:bg-blue-500 km:hover:bg-blue-600 km:focus:ring-blue-500",
          fe.value
        ])
      }, O(ce.value), 35),
      o.value ? (w(), L("div", {
        key: 0,
        onClick: ve,
        class: ie([
          "km:fixed km:inset-0 km:z-[9995] km:bg-white/30",
          "km:cursor-crosshair km:**:cursor-crosshair"
        ])
      }, [
        !r.value && !C.value ? (w(), L("div", {
          key: 0,
          class: "km:fixed km:pointer-events-none km:z-[9999] km:px-3 km:py-1 km:bg-gray-900 km:text-white km:text-sm km:rounded km:shadow-lg",
          style: R({
            left: `${b.value.x}px`,
            top: `${b.value.y}px`
          })
        }, " add comment ", 4)) : S("", !0)
      ])) : S("", !0),
      o.value ? (w(!0), L(Se, { key: 1 }, Te(I(v), (g) => (w(), re(Ye, {
        key: g.id,
        comment: g,
        onDelete: we,
        onEdit: xe,
        onHover: d[2] || (d[2] = (_) => C.value = !0),
        onUnhover: d[3] || (d[3] = (_) => C.value = !1)
      }, null, 8, ["comment"]))), 128)) : S("", !0),
      r.value ? (w(), re(Qe, {
        key: 2,
        modelValue: m.value,
        "onUpdate:modelValue": d[4] || (d[4] = (g) => m.value = g),
        position: h.value,
        "is-loading": I(c),
        onSave: he,
        onCancel: ge,
        onHover: d[5] || (d[5] = (g) => C.value = !0),
        onUnhover: d[6] || (d[6] = (g) => C.value = !1)
      }, null, 8, ["modelValue", "position", "is-loading"])) : S("", !0),
      I(p) ? (w(), L("div", tt, O(I(p)), 1)) : S("", !0),
      u.value ? (w(), L("div", ot, [
        l("div", nt, [
          d[10] || (d[10] = l("h2", { class: "km:text-xl km:font-bold km:text-gray-900 km:mb-2" }, " Welcome to Komment! ", -1)),
          d[11] || (d[11] = l("p", { class: "km:text-sm km:text-gray-600 km:mb-4" }, " Please enter your name to start commenting: ", -1)),
          me(l("input", {
            ref: "nameInput",
            "onUpdate:modelValue": d[7] || (d[7] = (g) => a.value = g),
            type: "text",
            placeholder: "Your name...",
            class: "km:w-full km:px-3 km:py-2 km:border km:border-gray-300 km:rounded-md km:text-sm km:focus:outline-none km:focus:ring-2 km:focus:ring-blue-500 km:mb-4",
            onKeyup: d[8] || (d[8] = $e((g) => a.value.trim() && Q(a.value.trim()), ["enter"]))
          }, null, 544), [
            [ue, a.value]
          ]),
          l("div", st, [
            l("button", {
              onClick: d[9] || (d[9] = (g) => Q(a.value.trim() || "Anonymous")),
              disabled: !a.value.trim(),
              class: "km:px-4 km:py-2 km:text-sm km:font-medium km:text-white km:bg-blue-500 km:border km:border-transparent km:rounded-md km:cursor-pointer km:hover:bg-blue-600 km:focus:outline-none km:focus:ring-2 km:focus:ring-offset-2 km:focus:ring-blue-500 disabled:km:opacity-50 disabled:km:cursor-not-allowed km:transition-colors"
            }, " Start Commenting ", 8, rt)
          ])
        ])
      ])) : S("", !0),
      o.value ? S("", !0) : (w(), L("div", it, [
        l("span", at, O(G.value), 1),
        l("button", {
          onClick: ye,
          class: "km:text-xs km:text-blue-500 km:cursor-pointer km:hover:text-blue-700 km:underline",
          title: "Change name"
        }, " change ")
      ]))
    ])) : S("", !0);
  }
}), mt = /* @__PURE__ */ q(lt, [["__scopeId", "data-v-6c330a25"]]);
function ft(s = {}) {
  return {
    install(t) {
      const e = document.createElement("div");
      e.id = "komment-root", document.body.appendChild(e);
      const n = Oe({
        render() {
          return Be(mt, s);
        }
      });
      n.mount(e), t.config.globalProperties.$komment = n;
    }
  };
}
export {
  Ye as CommentMarker,
  Qe as CommentPopup,
  mt as Komment,
  ft as KommentPlugin,
  ft as createKomment,
  Ue as useComments
};
