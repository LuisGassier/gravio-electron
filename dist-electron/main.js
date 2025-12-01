import gu, { app as Ue, BrowserWindow as $u, ipcMain as ve } from "electron";
import St from "path";
import { fileURLToPath as Qu } from "url";
import pe from "node:process";
import ce from "node:path";
import { promisify as $e, isDeepStrictEqual as Oa } from "node:util";
import x from "node:fs";
import it from "node:crypto";
import ja from "node:assert";
import Eu from "node:os";
import "node:events";
import "node:stream";
import Aa from "fs";
const mt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, wu = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), bu = 1e6, Zu = (e) => e >= "0" && e <= "9";
function Su(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= bu;
  }
  return !1;
}
function Hn(e, t) {
  return wu.has(e) ? !1 : (e && Su(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function xu(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let s = "", r = "start", u = !1, n = 0;
  for (const i of e) {
    if (n++, u) {
      s += i, u = !1;
      continue;
    }
    if (i === "\\") {
      if (r === "index")
        throw new Error(`Invalid character '${i}' in an index at position ${n}`);
      if (r === "indexEnd")
        throw new Error(`Invalid character '${i}' after an index at position ${n}`);
      u = !0, r = r === "start" ? "property" : r;
      continue;
    }
    switch (i) {
      case ".": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "property";
          break;
        }
        if (!Hn(s, t))
          return [];
        s = "", r = "property";
        break;
      }
      case "[": {
        if (r === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd") {
          r = "index";
          break;
        }
        if (r === "property" || r === "start") {
          if ((s || r === "property") && !Hn(s, t))
            return [];
          s = "";
        }
        r = "index";
        break;
      }
      case "]": {
        if (r === "index") {
          if (s === "")
            s = (t.pop() || "") + "[]", r = "property";
          else {
            const a = Number.parseInt(s, 10);
            !Number.isNaN(a) && Number.isFinite(a) && a >= 0 && a <= Number.MAX_SAFE_INTEGER && a <= bu && s === String(a) ? t.push(a) : t.push(s), s = "", r = "indexEnd";
          }
          break;
        }
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        s += i;
        break;
      }
      default: {
        if (r === "index" && !Zu(i))
          throw new Error(`Invalid character '${i}' in an index at position ${n}`);
        if (r === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${n}`);
        r === "start" && (r = "property"), s += i;
      }
    }
  }
  switch (u && (s += "\\"), r) {
    case "property": {
      if (!Hn(s, t))
        return [];
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function In(e) {
  if (typeof e == "string")
    return xu(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [s, r] of e.entries()) {
      if (typeof r != "string" && typeof r != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${s}, got ${typeof r}`);
      if (typeof r == "number" && !Number.isFinite(r))
        throw new TypeError(`Path segment at index ${s} must be a finite number, got ${r}`);
      if (wu.has(r))
        return [];
      typeof r == "string" && Su(r) ? t.push(Number.parseInt(r, 10)) : t.push(r);
    }
    return t;
  }
  return [];
}
function ka(e, t, s) {
  if (!mt(e) || typeof t != "string" && !Array.isArray(t))
    return s === void 0 ? e : s;
  const r = In(t);
  if (r.length === 0)
    return s;
  for (let u = 0; u < r.length; u++) {
    const n = r[u];
    if (e = e[n], e == null) {
      if (u !== r.length - 1)
        return s;
      break;
    }
  }
  return e === void 0 ? s : e;
}
function Ct(e, t, s) {
  if (!mt(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const r = e, u = In(t);
  if (u.length === 0)
    return e;
  for (let n = 0; n < u.length; n++) {
    const i = u[n];
    if (n === u.length - 1)
      e[i] = s;
    else if (!mt(e[i])) {
      const l = typeof u[n + 1] == "number";
      e[i] = l ? [] : {};
    }
    e = e[i];
  }
  return r;
}
function el(e, t) {
  if (!mt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = In(t);
  if (s.length === 0)
    return !1;
  for (let r = 0; r < s.length; r++) {
    const u = s[r];
    if (r === s.length - 1)
      return Object.hasOwn(e, u) ? (delete e[u], !0) : !1;
    if (e = e[u], !mt(e))
      return !1;
  }
}
function Bn(e, t) {
  if (!mt(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const s = In(t);
  if (s.length === 0)
    return !1;
  for (const r of s) {
    if (!mt(e) || !(r in e))
      return !1;
    e = e[r];
  }
  return !0;
}
const rt = Eu.homedir(), ha = Eu.tmpdir(), { env: wt } = pe, tl = (e) => {
  const t = ce.join(rt, "Library");
  return {
    data: ce.join(t, "Application Support", e),
    config: ce.join(t, "Preferences", e),
    cache: ce.join(t, "Caches", e),
    log: ce.join(t, "Logs", e),
    temp: ce.join(ha, e)
  };
}, rl = (e) => {
  const t = wt.APPDATA || ce.join(rt, "AppData", "Roaming"), s = wt.LOCALAPPDATA || ce.join(rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ce.join(s, e, "Data"),
    config: ce.join(t, e, "Config"),
    cache: ce.join(s, e, "Cache"),
    log: ce.join(s, e, "Log"),
    temp: ce.join(ha, e)
  };
}, nl = (e) => {
  const t = ce.basename(rt);
  return {
    data: ce.join(wt.XDG_DATA_HOME || ce.join(rt, ".local", "share"), e),
    config: ce.join(wt.XDG_CONFIG_HOME || ce.join(rt, ".config"), e),
    cache: ce.join(wt.XDG_CACHE_HOME || ce.join(rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ce.join(wt.XDG_STATE_HOME || ce.join(rt, ".local", "state"), e),
    temp: ce.join(ha, t, e)
  };
};
function sl(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), pe.platform === "darwin" ? tl(e) : pe.platform === "win32" ? rl(e) : nl(e);
}
const We = (e, t) => {
  const { onError: s } = t;
  return function(...u) {
    return e.apply(void 0, u).catch(s);
  };
}, ze = (e, t) => {
  const { onError: s } = t;
  return function(...u) {
    try {
      return e.apply(void 0, u);
    } catch (n) {
      return s(n);
    }
  };
}, al = 250, Ye = (e, t) => {
  const { isRetriable: s } = t;
  return function(u) {
    const { timeout: n } = u, i = u.interval ?? al, a = Date.now() + n;
    return function l(...d) {
      return e.apply(void 0, d).catch((c) => {
        if (!s(c) || Date.now() >= a)
          throw c;
        const $ = Math.round(i * Math.random());
        return $ > 0 ? new Promise((g) => setTimeout(g, $)).then(() => l.apply(void 0, d)) : l.apply(void 0, d);
      });
    };
  };
}, Qe = (e, t) => {
  const { isRetriable: s } = t;
  return function(u) {
    const { timeout: n } = u, i = Date.now() + n;
    return function(...l) {
      for (; ; )
        try {
          return e.apply(void 0, l);
        } catch (d) {
          if (!s(d) || Date.now() >= i)
            throw d;
          continue;
        }
    };
  };
}, bt = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!bt.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !ol && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!bt.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!bt.isNodeError(e))
      throw e;
    if (!bt.isChangeErrorOk(e))
      throw e;
  }
}, qt = {
  onError: bt.onChangeError
}, Te = {
  onError: () => {
  }
}, ol = pe.getuid ? !pe.getuid() : !1, Ee = {
  isRetriable: bt.isRetriableError
}, we = {
  attempt: {
    /* ASYNC */
    chmod: We($e(x.chmod), qt),
    chown: We($e(x.chown), qt),
    close: We($e(x.close), Te),
    fsync: We($e(x.fsync), Te),
    mkdir: We($e(x.mkdir), Te),
    realpath: We($e(x.realpath), Te),
    stat: We($e(x.stat), Te),
    unlink: We($e(x.unlink), Te),
    /* SYNC */
    chmodSync: ze(x.chmodSync, qt),
    chownSync: ze(x.chownSync, qt),
    closeSync: ze(x.closeSync, Te),
    existsSync: ze(x.existsSync, Te),
    fsyncSync: ze(x.fsync, Te),
    mkdirSync: ze(x.mkdirSync, Te),
    realpathSync: ze(x.realpathSync, Te),
    statSync: ze(x.statSync, Te),
    unlinkSync: ze(x.unlinkSync, Te)
  },
  retry: {
    /* ASYNC */
    close: Ye($e(x.close), Ee),
    fsync: Ye($e(x.fsync), Ee),
    open: Ye($e(x.open), Ee),
    readFile: Ye($e(x.readFile), Ee),
    rename: Ye($e(x.rename), Ee),
    stat: Ye($e(x.stat), Ee),
    write: Ye($e(x.write), Ee),
    writeFile: Ye($e(x.writeFile), Ee),
    /* SYNC */
    closeSync: Qe(x.closeSync, Ee),
    fsyncSync: Qe(x.fsyncSync, Ee),
    openSync: Qe(x.openSync, Ee),
    readFileSync: Qe(x.readFileSync, Ee),
    renameSync: Qe(x.renameSync, Ee),
    statSync: Qe(x.statSync, Ee),
    writeSync: Qe(x.writeSync, Ee),
    writeFileSync: Qe(x.writeFileSync, Ee)
  }
}, il = "utf8", Ca = 438, cl = 511, ul = {}, ll = pe.geteuid ? pe.geteuid() : -1, dl = pe.getegid ? pe.getegid() : -1, fl = 1e3, hl = !!pe.getuid;
pe.getuid && pe.getuid();
const qa = 128, ml = (e) => e instanceof Error && "code" in e, Da = (e) => typeof e == "string", Jn = (e) => e === void 0, pl = pe.platform === "linux", Ru = pe.platform === "win32", ma = ["SIGHUP", "SIGINT", "SIGTERM"];
Ru || ma.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
pl && ma.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class yl {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const s of this.callbacks)
          s();
        t && (Ru && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? pe.kill(pe.pid, "SIGTERM") : pe.kill(pe.pid, t));
      }
    }, this.hook = () => {
      pe.once("exit", () => this.exit());
      for (const t of ma)
        try {
          pe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const vl = new yl(), _l = vl.register, be = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), u = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${u}`;
  },
  get: (e, t, s = !0) => {
    const r = be.truncate(t(e));
    return r in be.store ? be.get(e, t, s) : (be.store[r] = s, [r, () => delete be.store[r]]);
  },
  purge: (e) => {
    be.store[e] && (delete be.store[e], we.attempt.unlink(e));
  },
  purgeSync: (e) => {
    be.store[e] && (delete be.store[e], we.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in be.store)
      be.purgeSync(e);
  },
  truncate: (e) => {
    const t = ce.basename(e);
    if (t.length <= qa)
      return e;
    const s = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!s)
      return e;
    const r = t.length - qa;
    return `${e.slice(0, -t.length)}${s[1]}${s[2].slice(0, -r)}${s[3]}`;
  }
};
_l(be.purgeSyncAll);
function Pu(e, t, s = ul) {
  if (Da(s))
    return Pu(e, t, { encoding: s });
  const u = { timeout: s.timeout ?? fl };
  let n = null, i = null, a = null;
  try {
    const l = we.attempt.realpathSync(e), d = !!l;
    e = l || e, [i, n] = be.get(e, s.tmpCreate || be.create, s.tmpPurge !== !1);
    const c = hl && Jn(s.chown), $ = Jn(s.mode);
    if (d && (c || $)) {
      const _ = we.attempt.statSync(e);
      _ && (s = { ...s }, c && (s.chown = { uid: _.uid, gid: _.gid }), $ && (s.mode = _.mode));
    }
    if (!d) {
      const _ = ce.dirname(e);
      we.attempt.mkdirSync(_, {
        mode: cl,
        recursive: !0
      });
    }
    a = we.retry.openSync(u)(i, "w", s.mode || Ca), s.tmpCreated && s.tmpCreated(i), Da(t) ? we.retry.writeSync(u)(a, t, 0, s.encoding || il) : Jn(t) || we.retry.writeSync(u)(a, t, 0, t.length, 0), s.fsync !== !1 && (s.fsyncWait !== !1 ? we.retry.fsyncSync(u)(a) : we.attempt.fsync(a)), we.retry.closeSync(u)(a), a = null, s.chown && (s.chown.uid !== ll || s.chown.gid !== dl) && we.attempt.chownSync(i, s.chown.uid, s.chown.gid), s.mode && s.mode !== Ca && we.attempt.chmodSync(i, s.mode);
    try {
      we.retry.renameSync(u)(i, e);
    } catch (_) {
      if (!ml(_) || _.code !== "ENAMETOOLONG")
        throw _;
      we.retry.renameSync(u)(i, be.truncate(e));
    }
    n(), i = null;
  } finally {
    a && we.attempt.closeSync(a), i && be.purge(i);
  }
}
function Nu(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Dt = { exports: {} }, Wn = {}, Ge = {}, ct = {}, Yn = {}, Qn = {}, Zn = {}, Ma;
function Sn() {
  return Ma || (Ma = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, E) => `${p}${E}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, E) => (E instanceof s && (p[E.str] = (p[E.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function u(y, ...o) {
      const p = [y[0]];
      let E = 0;
      for (; E < o.length; )
        a(p, o[E]), p.push(y[++E]);
      return new r(p);
    }
    e._ = u;
    const n = new r("+");
    function i(y, ...o) {
      const p = [g(y[0])];
      let E = 0;
      for (; E < o.length; )
        p.push(n), a(p, o[E]), p.push(n, g(y[++E]));
      return l(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push($(o));
    }
    e.addCodeArg = a;
    function l(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function $(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : g(Array.isArray(y) ? y.join(",") : y);
    }
    function _(y) {
      return new r(g(y));
    }
    e.stringify = _;
    function g(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = g;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : u`[${y}]`;
    }
    e.getProperty = b;
    function w(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = w;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(Zn)), Zn;
}
var xn = {}, La;
function Va() {
  return La || (La = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Sn();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(l) {
      l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class u {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = u;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: $ }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends u {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const _ = this.toName(d), { prefix: g } = _, b = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let w = this._values[g];
        if (w) {
          const o = w.get(b);
          if (o)
            return o;
        } else
          w = this._values[g] = /* @__PURE__ */ new Map();
        w.set(b, _);
        const f = this._scope[g] || (this._scope[g] = []), y = f.length;
        return f[y] = c.ref, _.setValue(c, { property: g, itemIndex: y }), _;
      }
      getValue(d, c) {
        const $ = this._values[d];
        if ($)
          return $.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${d}${$.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, $) {
        return this._reduceValues(d, (_) => {
          if (_.value === void 0)
            throw new Error(`CodeGen: name "${_}" has no value`);
          return _.value.code;
        }, c, $);
      }
      _reduceValues(d, c, $ = {}, _) {
        let g = t.nil;
        for (const b in d) {
          const w = d[b];
          if (!w)
            continue;
          const f = $[b] = $[b] || /* @__PURE__ */ new Map();
          w.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              g = (0, t._)`${g}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = _?.(y))
              g = (0, t._)`${g}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return g;
      }
    }
    e.ValueScope = a;
  })(xn)), xn;
}
var Fa;
function ee() {
  return Fa || (Fa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Sn(), s = Va();
    var r = Sn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var u = Va();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return u.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return u.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return u.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return u.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, G = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${G};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(h, this.rhs);
      }
    }
    class l extends a {
      constructor(h, S, j, G) {
        super(h, j, G), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class $ extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class _ extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class g extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let G = j.length;
        for (; G--; ) {
          const X = j[G];
          X.optimizeNames(h, S) || (F(h, X.names), j.splice(G, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => U(h, S.names), {});
      }
    }
    class b extends g {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class w extends g {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(J(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return z(h, this.condition), this.else && U(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class E extends o {
      constructor(h, S, j, G) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = G;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: G, to: X } = this;
        return `for(${S} ${j}=${G}; ${j}<${X}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = z(super.names, this.from);
        return z(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, G) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = G;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class R extends g {
      render(h) {
        return "return " + super.render(h);
      }
    }
    R.kind = "return";
    class O extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, G;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (G = this.finally) === null || G === void 0 || G.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && U(h, this.catch.names), this.finally && U(h, this.finally.names), h;
      }
    }
    class q extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    q.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new w()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, G) {
        const X = this._scope.toName(S);
        return j !== void 0 && G && (this._constants[X.str] = j), this._leafNode(new i(h, X, j)), X;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new l(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new _(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, G] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== G || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, G));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, G, X = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(h);
        return this._for(new E(X, Z, S, j), () => G(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, G = s.varKinds.const) {
        const X = this._scope.toName(h);
        if (this.opts.es5) {
          const Z = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Q) => {
            this.var(X, (0, t._)`${Z}[${Q}]`), j(X);
          });
        }
        return this._for(new m("of", G, X, S), () => j(X));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, G = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const X = this._scope.toName(h);
        return this._for(new m("in", G, X, S), () => j(X));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new R();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(R);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const G = new O();
        if (this._blockNode(G), this.code(h), S) {
          const X = this.name("e");
          this._currNode = G.catch = new q(X), S(X);
        }
        return j && (this._currNode = G.finally = new V(), this.code(j)), this._endBlockNode(q, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new $(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, G) {
        return this._blockNode(new v(h, S, j)), G && this.code(G).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function U(T, h) {
      for (const S in h)
        T[S] = (T[S] || 0) + (h[S] || 0);
      return T;
    }
    function z(T, h) {
      return h instanceof t._CodeOrName ? U(T, h.names) : T;
    }
    function M(T, h, S) {
      if (T instanceof t.Name)
        return j(T);
      if (!G(T))
        return T;
      return new t._Code(T._items.reduce((X, Z) => (Z instanceof t.Name && (Z = j(Z)), Z instanceof t._Code ? X.push(...Z._items) : X.push(Z), X), []));
      function j(X) {
        const Z = S[X.str];
        return Z === void 0 || h[X.str] !== 1 ? X : (delete h[X.str], Z);
      }
      function G(X) {
        return X instanceof t._Code && X._items.some((Z) => Z instanceof t.Name && h[Z.str] === 1 && S[Z.str] !== void 0);
      }
    }
    function F(T, h) {
      for (const S in h)
        T[S] = (T[S] || 0) - (h[S] || 0);
    }
    function J(T) {
      return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, t._)`!${A(T)}`;
    }
    e.not = J;
    const B = N(e.operators.AND);
    function H(...T) {
      return T.reduce(B);
    }
    e.and = H;
    const Y = N(e.operators.OR);
    function k(...T) {
      return T.reduce(Y);
    }
    e.or = k;
    function N(T) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${T} ${A(S)}`;
    }
    function A(T) {
      return T instanceof t.Name ? T : (0, t._)`(${T})`;
    }
  })(Qn)), Qn;
}
var te = {}, Ua;
function se() {
  if (Ua) return te;
  Ua = 1, Object.defineProperty(te, "__esModule", { value: !0 }), te.checkStrictMode = te.getErrorPath = te.Type = te.useFunc = te.setEvaluated = te.evaluatedPropsToName = te.mergeEvaluated = te.eachItem = te.unescapeJsonPointer = te.escapeJsonPointer = te.escapeFragment = te.unescapeFragment = te.schemaRefOrVal = te.schemaHasRulesButRef = te.schemaHasRules = te.checkUnknownRules = te.alwaysValidSchema = te.toHash = void 0;
  const e = ee(), t = Sn();
  function s(m) {
    const v = {};
    for (const R of m)
      v[R] = !0;
    return v;
  }
  te.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (u(m, v), !n(v, m.self.RULES.all));
  }
  te.alwaysValidSchema = r;
  function u(m, v = m.schema) {
    const { opts: R, self: O } = m;
    if (!R.strictSchema || typeof v == "boolean")
      return;
    const q = O.RULES.keywords;
    for (const V in v)
      q[V] || E(m, `unknown keyword: "${V}"`);
  }
  te.checkUnknownRules = u;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (v[R])
        return !0;
    return !1;
  }
  te.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (R !== "$ref" && v.all[R])
        return !0;
    return !1;
  }
  te.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, R, O, q) {
    if (!q) {
      if (typeof R == "number" || typeof R == "boolean")
        return R;
      if (typeof R == "string")
        return (0, e._)`${R}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(O)}`;
  }
  te.schemaRefOrVal = a;
  function l(m) {
    return $(decodeURIComponent(m));
  }
  te.unescapeFragment = l;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  te.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  te.escapeJsonPointer = c;
  function $(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  te.unescapeJsonPointer = $;
  function _(m, v) {
    if (Array.isArray(m))
      for (const R of m)
        v(R);
    else
      v(m);
  }
  te.eachItem = _;
  function g({ mergeNames: m, mergeToName: v, mergeValues: R, resultToName: O }) {
    return (q, V, D, U) => {
      const z = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(q, V, D) : v(q, V, D), D) : V instanceof e.Name ? (v(q, D, V), V) : R(V, D);
      return U === e.Name && !(z instanceof e.Name) ? O(q, z) : z;
    };
  }
  te.mergeEvaluated = {
    props: g({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(R, !0), () => m.assign(R, (0, e._)`${R} || {}`).code((0, e._)`Object.assign(${R}, ${v})`));
      }),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => {
        v === !0 ? m.assign(R, !0) : (m.assign(R, (0, e._)`${R} || {}`), w(m, R, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: g({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => m.assign(R, (0, e._)`${v} === true ? true : ${R} > ${v} ? ${R} : ${v}`)),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => m.assign(R, v === !0 ? !0 : (0, e._)`${R} > ${v} ? ${R} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const R = m.var("props", (0, e._)`{}`);
    return v !== void 0 && w(m, R, v), R;
  }
  te.evaluatedPropsToName = b;
  function w(m, v, R) {
    Object.keys(R).forEach((O) => m.assign((0, e._)`${v}${(0, e.getProperty)(O)}`, !0));
  }
  te.setEvaluated = w;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  te.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (te.Type = o = {}));
  function p(m, v, R) {
    if (m instanceof e.Name) {
      const O = v === o.Num;
      return R ? O ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : O ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return R ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  te.getErrorPath = p;
  function E(m, v, R = m.opts.strictSchema) {
    if (R) {
      if (v = `strict mode: ${v}`, R === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return te.checkStrictMode = E, te;
}
var Mt = {}, za;
function De() {
  if (za) return Mt;
  za = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = ee(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Mt.default = t, Mt;
}
var Ga;
function On() {
  return Ga || (Ga = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ee(), s = se(), r = De();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function u(f, y = e.keywordError, o, p) {
      const { it: E } = f, { gen: m, compositeRule: v, allErrors: R } = E, O = $(f, y, o);
      p ?? (v || R) ? l(m, O) : d(E, (0, t._)`[${O}]`);
    }
    e.reportError = u;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: E, compositeRule: m, allErrors: v } = p, R = $(f, y, o);
      l(E, R), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: E, it: m }) {
      if (E === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", E, r.default.errors, (R) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${R}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function l(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: E } = f;
      E.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : _(f, y, o);
    }
    function _(f, y, o = {}) {
      const { gen: p, it: E } = f, m = [
        g(E, o),
        b(f, o)
      ];
      return w(f, y, m), p.object(...m);
    }
    function g({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let E = p ? y : (0, t.str)`${y}/${f}`;
      return o && (E = (0, t.str)`${E}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, E];
    }
    function w(f, { params: y, message: o }, p) {
      const { keyword: E, data: m, schemaValue: v, it: R } = f, { opts: O, propertyName: q, topSchemaRef: V, schemaPath: D } = R;
      p.push([c.keyword, E], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), O.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), O.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), q && p.push([c.propertyName, q]);
    }
  })(Yn)), Yn;
}
var Ka;
function gl() {
  if (Ka) return ct;
  Ka = 1, Object.defineProperty(ct, "__esModule", { value: !0 }), ct.boolOrEmptySchema = ct.topBoolOrEmptySchema = void 0;
  const e = On(), t = ee(), s = De(), r = {
    message: "boolean schema is false"
  };
  function u(a) {
    const { gen: l, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? l.return(s.default.data) : (l.assign((0, t._)`${c}.errors`, null), l.return(!0));
  }
  ct.topBoolOrEmptySchema = u;
  function n(a, l) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(l, !1), i(a)) : d.var(l, !0);
  }
  ct.boolOrEmptySchema = n;
  function i(a, l) {
    const { gen: d, data: c } = a, $ = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)($, r, void 0, l);
  }
  return ct;
}
var _e = {}, ut = {}, Xa;
function Tu() {
  if (Xa) return ut;
  Xa = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.getRules = ut.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(u) {
    return typeof u == "string" && t.has(u);
  }
  ut.isJSONType = s;
  function r() {
    const u = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...u, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, u.number, u.string, u.array, u.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ut.getRules = r, ut;
}
var Ke = {}, Ha;
function Iu() {
  if (Ha) return Ke;
  Ha = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.shouldUseRule = Ke.shouldUseGroup = Ke.schemaHasRulesForType = void 0;
  function e({ schema: r, self: u }, n) {
    const i = u.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  Ke.schemaHasRulesForType = e;
  function t(r, u) {
    return u.rules.some((n) => s(r, n));
  }
  Ke.shouldUseGroup = t;
  function s(r, u) {
    var n;
    return r[u.keyword] !== void 0 || ((n = u.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return Ke.shouldUseRule = s, Ke;
}
var Ba;
function Rn() {
  if (Ba) return _e;
  Ba = 1, Object.defineProperty(_e, "__esModule", { value: !0 }), _e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
  const e = Tu(), t = Iu(), s = On(), r = ee(), u = se();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (_e.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  _e.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  _e.getJSONTypes = a;
  function l(o, p) {
    const { gen: E, data: m, opts: v } = o, R = c(p, v.coerceTypes), O = p.length > 0 && !(R.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (O) {
      const q = b(p, m, v.strictNumbers, n.Wrong);
      E.if(q, () => {
        R.length ? $(o, p, R) : f(o);
      });
    }
    return O;
  }
  _e.coerceAndCheckDataType = l;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((E) => d.has(E) || p === "array" && E === "array") : [];
  }
  function $(o, p, E) {
    const { gen: m, data: v, opts: R } = o, O = m.let("dataType", (0, r._)`typeof ${v}`), q = m.let("coerced", (0, r._)`undefined`);
    R.coerceTypes === "array" && m.if((0, r._)`${O} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(O, (0, r._)`typeof ${v}`).if(b(p, v, R.strictNumbers), () => m.assign(q, v))), m.if((0, r._)`${q} !== undefined`);
    for (const D of E)
      (d.has(D) || D === "array" && R.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${q} !== undefined`, () => {
      m.assign(v, q), _(o, q);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${O} == "number" || ${O} == "boolean"`).assign(q, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(q, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${O} == "boolean" || ${v} === null
              || (${O} == "string" && ${v} && ${v} == +${v})`).assign(q, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${O} === "boolean" || ${v} === null
              || (${O} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(q, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(q, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(q, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(q, null);
          return;
        case "array":
          m.elseIf((0, r._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${v} === null`).assign(q, (0, r._)`[${v}]`);
      }
    }
  }
  function _({ gen: o, parentData: p, parentDataProperty: E }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${E}]`, m));
  }
  function g(o, p, E, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let R;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        R = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        R = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        R = O((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        R = O();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? R : (0, r.not)(R);
    function O(q = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, q, E ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  _e.checkDataType = g;
  function b(o, p, E, m) {
    if (o.length === 1)
      return g(o[0], p, E, m);
    let v;
    const R = (0, u.toHash)(o);
    if (R.array && R.object) {
      const O = (0, r._)`typeof ${p} != "object"`;
      v = R.null ? O : (0, r._)`!${p} || ${O}`, delete R.null, delete R.array, delete R.object;
    } else
      v = r.nil;
    R.number && delete R.integer;
    for (const O in R)
      v = (0, r.and)(v, g(O, p, E, m));
    return v;
  }
  _e.checkDataTypes = b;
  const w = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, w);
  }
  _e.reportTypeError = f;
  function y(o) {
    const { gen: p, data: E, schema: m } = o, v = (0, u.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: E,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return _e;
}
var Tt = {}, Ja;
function $l() {
  if (Ja) return Tt;
  Ja = 1, Object.defineProperty(Tt, "__esModule", { value: !0 }), Tt.assignDefaults = void 0;
  const e = ee(), t = se();
  function s(u, n) {
    const { properties: i, items: a } = u.schema;
    if (n === "object" && i)
      for (const l in i)
        r(u, l, i[l].default);
    else n === "array" && Array.isArray(a) && a.forEach((l, d) => r(u, d, l.default));
  }
  Tt.assignDefaults = s;
  function r(u, n, i) {
    const { gen: a, compositeRule: l, data: d, opts: c } = u;
    if (i === void 0)
      return;
    const $ = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (l) {
      (0, t.checkStrictMode)(u, `default is ignored for: ${$}`);
      return;
    }
    let _ = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (_ = (0, e._)`${_} || ${$} === null || ${$} === ""`), a.if(_, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return Tt;
}
var ke = {}, de = {}, Wa;
function Me() {
  if (Wa) return de;
  Wa = 1, Object.defineProperty(de, "__esModule", { value: !0 }), de.validateUnion = de.validateArray = de.usePattern = de.callValidateCode = de.schemaProperties = de.allSchemaProperties = de.noPropertyInData = de.propertyInData = de.isOwnProperty = de.hasPropFunc = de.reportMissingProp = de.checkMissingProp = de.checkReportMissingProp = void 0;
  const e = ee(), t = se(), s = De(), r = se();
  function u(o, p) {
    const { gen: E, data: m, it: v } = o;
    E.if(c(E, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  de.checkReportMissingProp = u;
  function n({ gen: o, data: p, it: { opts: E } }, m, v) {
    return (0, e.or)(...m.map((R) => (0, e.and)(c(o, p, R, E.ownProperties), (0, e._)`${v} = ${R}`)));
  }
  de.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  de.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  de.hasPropFunc = a;
  function l(o, p, E) {
    return (0, e._)`${a(o)}.call(${p}, ${E})`;
  }
  de.isOwnProperty = l;
  function d(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} !== undefined`;
    return m ? (0, e._)`${v} && ${l(o, p, E)}` : v;
  }
  de.propertyInData = d;
  function c(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(l(o, p, E))) : v;
  }
  de.noPropertyInData = c;
  function $(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  de.allSchemaProperties = $;
  function _(o, p) {
    return $(p).filter((E) => !(0, t.alwaysValidSchema)(o, p[E]));
  }
  de.schemaProperties = _;
  function g({ schemaCode: o, data: p, it: { gen: E, topSchemaRef: m, schemaPath: v, errorPath: R }, it: O }, q, V, D) {
    const U = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, R)],
      [s.default.parentData, O.parentData],
      [s.default.parentDataProperty, O.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    O.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${U}, ${E.object(...z)}`;
    return V !== e.nil ? (0, e._)`${q}.call(${V}, ${M})` : (0, e._)`${q}(${M})`;
  }
  de.callValidateCode = g;
  const b = (0, e._)`new RegExp`;
  function w({ gen: o, it: { opts: p } }, E) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, R = v(E, m);
    return o.scopeValue("pattern", {
      key: R.toString(),
      ref: R,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${E}, ${m})`
    });
  }
  de.usePattern = w;
  function f(o) {
    const { gen: p, data: E, keyword: m, it: v } = o, R = p.name("valid");
    if (v.allErrors) {
      const q = p.let("valid", !0);
      return O(() => p.assign(q, !1)), q;
    }
    return p.var(R, !0), O(() => p.break()), R;
    function O(q) {
      const V = p.const("len", (0, e._)`${E}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, R), p.if((0, e.not)(R), q);
      });
    }
  }
  de.validateArray = f;
  function y(o) {
    const { gen: p, schema: E, keyword: m, it: v } = o;
    if (!Array.isArray(E))
      throw new Error("ajv implementation error");
    if (E.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const O = p.let("valid", !1), q = p.name("_valid");
    p.block(() => E.forEach((V, D) => {
      const U = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, q);
      p.assign(O, (0, e._)`${O} || ${q}`), o.mergeValidEvaluated(U, q) || p.if((0, e.not)(O));
    })), o.result(O, () => o.reset(), () => o.error(!0));
  }
  return de.validateUnion = y, de;
}
var Ya;
function El() {
  if (Ya) return ke;
  Ya = 1, Object.defineProperty(ke, "__esModule", { value: !0 }), ke.validateKeywordUsage = ke.validSchemaType = ke.funcKeywordCode = ke.macroKeywordCode = void 0;
  const e = ee(), t = De(), s = Me(), r = On();
  function u(_, g) {
    const { gen: b, keyword: w, schema: f, parentSchema: y, it: o } = _, p = g.macro.call(o.self, f, y, o), E = d(b, w, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    _.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${w}`,
      topSchemaRef: E,
      compositeRule: !0
    }, m), _.pass(m, () => _.error(!0));
  }
  ke.macroKeywordCode = u;
  function n(_, g) {
    var b;
    const { gen: w, keyword: f, schema: y, parentSchema: o, $data: p, it: E } = _;
    l(E, g);
    const m = !p && g.compile ? g.compile.call(E.self, y, o, E) : g.validate, v = d(w, f, m), R = w.let("valid");
    _.block$data(R, O), _.ok((b = g.valid) !== null && b !== void 0 ? b : R);
    function O() {
      if (g.errors === !1)
        D(), g.modifying && i(_), U(() => _.error());
      else {
        const z = g.async ? q() : V();
        g.modifying && i(_), U(() => a(_, z));
      }
    }
    function q() {
      const z = w.let("ruleErrs", null);
      return w.try(() => D((0, e._)`await `), (M) => w.assign(R, !1).if((0, e._)`${M} instanceof ${E.ValidationError}`, () => w.assign(z, (0, e._)`${M}.errors`), () => w.throw(M))), z;
    }
    function V() {
      const z = (0, e._)`${v}.errors`;
      return w.assign(z, null), D(e.nil), z;
    }
    function D(z = g.async ? (0, e._)`await ` : e.nil) {
      const M = E.opts.passContext ? t.default.this : t.default.self, F = !("compile" in g && !p || g.schema === !1);
      w.assign(R, (0, e._)`${z}${(0, s.callValidateCode)(_, v, M, F)}`, g.modifying);
    }
    function U(z) {
      var M;
      w.if((0, e.not)((M = g.valid) !== null && M !== void 0 ? M : R), z);
    }
  }
  ke.funcKeywordCode = n;
  function i(_) {
    const { gen: g, data: b, it: w } = _;
    g.if(w.parentData, () => g.assign(b, (0, e._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function a(_, g) {
    const { gen: b } = _;
    b.if((0, e._)`Array.isArray(${g})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${g} : ${t.default.vErrors}.concat(${g})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(_);
    }, () => _.error());
  }
  function l({ schemaEnv: _ }, g) {
    if (g.async && !_.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(_, g, b) {
    if (b === void 0)
      throw new Error(`keyword "${g}" failed to compile`);
    return _.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(_, g, b = !1) {
    return !g.length || g.some((w) => w === "array" ? Array.isArray(_) : w === "object" ? _ && typeof _ == "object" && !Array.isArray(_) : typeof _ == w || b && typeof _ > "u");
  }
  ke.validSchemaType = c;
  function $({ schema: _, opts: g, self: b, errSchemaPath: w }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(_, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(_[y])) {
      const E = `keyword "${y}" value is invalid at path "${w}": ` + b.errorsText(f.validateSchema.errors);
      if (g.validateSchema === "log")
        b.logger.error(E);
      else
        throw new Error(E);
    }
  }
  return ke.validateKeywordUsage = $, ke;
}
var Xe = {}, Qa;
function wl() {
  if (Qa) return Xe;
  Qa = 1, Object.defineProperty(Xe, "__esModule", { value: !0 }), Xe.extendSubschemaMode = Xe.extendSubschemaData = Xe.getSubschema = void 0;
  const e = ee(), t = se();
  function s(n, { keyword: i, schemaProp: a, schema: l, schemaPath: d, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const _ = n.schema[i];
      return a === void 0 ? {
        schema: _,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: _[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (l !== void 0) {
      if (d === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: l,
        schemaPath: d,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Xe.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: l, data: d, dataTypes: c, propertyName: $ }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: _ } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: w, opts: f } = i, y = _.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      g(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, l, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...w, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : _.let("data", d, !0);
      g(b), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function g(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Xe.extendSubschemaData = r;
  function u(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: l, createErrors: d, allErrors: c }) {
    l !== void 0 && (n.compositeRule = l), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Xe.extendSubschemaMode = u, Xe;
}
var Se = {}, es, Za;
function jn() {
  return Za || (Za = 1, es = function e(t, s) {
    if (t === s) return !0;
    if (t && s && typeof t == "object" && typeof s == "object") {
      if (t.constructor !== s.constructor) return !1;
      var r, u, n;
      if (Array.isArray(t)) {
        if (r = t.length, r != s.length) return !1;
        for (u = r; u-- !== 0; )
          if (!e(t[u], s[u])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === s.source && t.flags === s.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === s.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === s.toString();
      if (n = Object.keys(t), r = n.length, r !== Object.keys(s).length) return !1;
      for (u = r; u-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(s, n[u])) return !1;
      for (u = r; u-- !== 0; ) {
        var i = n[u];
        if (!e(t[i], s[i])) return !1;
      }
      return !0;
    }
    return t !== t && s !== s;
  }), es;
}
var ts = { exports: {} }, xa;
function bl() {
  if (xa) return ts.exports;
  xa = 1;
  var e = ts.exports = function(r, u, n) {
    typeof u == "function" && (n = u, u = {}), n = u.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(u, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, u, n, i, a, l, d, c, $, _) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      u(i, a, l, d, c, $, _);
      for (var g in i) {
        var b = i[g];
        if (Array.isArray(b)) {
          if (g in e.arrayKeywords)
            for (var w = 0; w < b.length; w++)
              t(r, u, n, b[w], a + "/" + g + "/" + w, l, a, g, i, w);
        } else if (g in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, u, n, b[f], a + "/" + g + "/" + s(f), l, a, g, i, f);
        } else (g in e.keywords || r.allKeys && !(g in e.skipKeywords)) && t(r, u, n, b, a + "/" + g, l, a, g, i);
      }
      n(i, a, l, d, c, $, _);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return ts.exports;
}
var eo;
function An() {
  if (eo) return Se;
  eo = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
  const e = se(), t = jn(), s = bl(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function u(w, f = !0) {
    return typeof w == "boolean" ? !0 : f === !0 ? !i(w) : f ? a(w) <= f : !1;
  }
  Se.inlineRef = u;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(w) {
    for (const f in w) {
      if (n.has(f))
        return !0;
      const y = w[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(w) {
    let f = 0;
    for (const y in w) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof w[y] == "object" && (0, e.eachItem)(w[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function l(w, f = "", y) {
    y !== !1 && (f = $(f));
    const o = w.parse(f);
    return d(w, o);
  }
  Se.getFullPath = l;
  function d(w, f) {
    return w.serialize(f).split("#")[0] + "#";
  }
  Se._getFullPath = d;
  const c = /#\/?$/;
  function $(w) {
    return w ? w.replace(c, "") : "";
  }
  Se.normalizeId = $;
  function _(w, f, y) {
    return y = $(y), w.resolve(f, y);
  }
  Se.resolveUrl = _;
  const g = /^[a-z_][-a-z0-9._]*$/i;
  function b(w, f) {
    if (typeof w == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = $(w[y] || f), E = { "": p }, m = l(o, p, !1), v = {}, R = /* @__PURE__ */ new Set();
    return s(w, { allKeys: !0 }, (V, D, U, z) => {
      if (z === void 0)
        return;
      const M = m + D;
      let F = E[z];
      typeof V[y] == "string" && (F = J.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), E[D] = F;
      function J(H) {
        const Y = this.opts.uriResolver.resolve;
        if (H = $(F ? Y(F, H) : H), R.has(H))
          throw q(H);
        R.add(H);
        let k = this.refs[H];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? O(V, k.schema, H) : H !== $(M) && (H[0] === "#" ? (O(V, v[H], H), v[H] = V) : this.refs[H] = M), H;
      }
      function B(H) {
        if (typeof H == "string") {
          if (!g.test(H))
            throw new Error(`invalid anchor "${H}"`);
          J.call(this, `#${H}`);
        }
      }
    }), v;
    function O(V, D, U) {
      if (D !== void 0 && !t(V, D))
        throw q(U);
    }
    function q(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return Se.getSchemaRefs = b, Se;
}
var to;
function kn() {
  if (to) return Ge;
  to = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.getData = Ge.KeywordCxt = Ge.validateFunctionCode = void 0;
  const e = gl(), t = Rn(), s = Iu(), r = Rn(), u = $l(), n = El(), i = wl(), a = ee(), l = De(), d = An(), c = se(), $ = On();
  function _(P) {
    if (m(P) && (R(P), E(P))) {
      f(P);
      return;
    }
    g(P, () => (0, e.topBoolOrEmptySchema)(P));
  }
  Ge.validateFunctionCode = _;
  function g({ gen: P, validateName: I, schema: C, schemaEnv: L, opts: K }, W) {
    K.code.es5 ? P.func(I, (0, a._)`${l.default.data}, ${l.default.valCxt}`, L.$async, () => {
      P.code((0, a._)`"use strict"; ${o(C, K)}`), w(P, K), P.code(W);
    }) : P.func(I, (0, a._)`${l.default.data}, ${b(K)}`, L.$async, () => P.code(o(C, K)).code(W));
  }
  function b(P) {
    return (0, a._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${P.dynamicRef ? (0, a._)`, ${l.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function w(P, I) {
    P.if(l.default.valCxt, () => {
      P.var(l.default.instancePath, (0, a._)`${l.default.valCxt}.${l.default.instancePath}`), P.var(l.default.parentData, (0, a._)`${l.default.valCxt}.${l.default.parentData}`), P.var(l.default.parentDataProperty, (0, a._)`${l.default.valCxt}.${l.default.parentDataProperty}`), P.var(l.default.rootData, (0, a._)`${l.default.valCxt}.${l.default.rootData}`), I.dynamicRef && P.var(l.default.dynamicAnchors, (0, a._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      P.var(l.default.instancePath, (0, a._)`""`), P.var(l.default.parentData, (0, a._)`undefined`), P.var(l.default.parentDataProperty, (0, a._)`undefined`), P.var(l.default.rootData, l.default.data), I.dynamicRef && P.var(l.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(P) {
    const { schema: I, opts: C, gen: L } = P;
    g(P, () => {
      C.$comment && I.$comment && z(P), V(P), L.let(l.default.vErrors, null), L.let(l.default.errors, 0), C.unevaluated && y(P), O(P), M(P);
    });
  }
  function y(P) {
    const { gen: I, validateName: C } = P;
    P.evaluated = I.const("evaluated", (0, a._)`${C}.evaluated`), I.if((0, a._)`${P.evaluated}.dynamicProps`, () => I.assign((0, a._)`${P.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${P.evaluated}.dynamicItems`, () => I.assign((0, a._)`${P.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(P, I) {
    const C = typeof P == "object" && P[I.schemaId];
    return C && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${C} */` : a.nil;
  }
  function p(P, I) {
    if (m(P) && (R(P), E(P))) {
      v(P, I);
      return;
    }
    (0, e.boolOrEmptySchema)(P, I);
  }
  function E({ schema: P, self: I }) {
    if (typeof P == "boolean")
      return !P;
    for (const C in P)
      if (I.RULES.all[C])
        return !0;
    return !1;
  }
  function m(P) {
    return typeof P.schema != "boolean";
  }
  function v(P, I) {
    const { schema: C, gen: L, opts: K } = P;
    K.$comment && C.$comment && z(P), D(P), U(P);
    const W = L.const("_errs", l.default.errors);
    O(P, W), L.var(I, (0, a._)`${W} === ${l.default.errors}`);
  }
  function R(P) {
    (0, c.checkUnknownRules)(P), q(P);
  }
  function O(P, I) {
    if (P.opts.jtd)
      return J(P, [], !1, I);
    const C = (0, t.getSchemaTypes)(P.schema), L = (0, t.coerceAndCheckDataType)(P, C);
    J(P, C, !L, I);
  }
  function q(P) {
    const { schema: I, errSchemaPath: C, opts: L, self: K } = P;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, K.RULES) && K.logger.warn(`$ref: keywords ignored in schema at path "${C}"`);
  }
  function V(P) {
    const { schema: I, opts: C } = P;
    I.default !== void 0 && C.useDefaults && C.strictSchema && (0, c.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function D(P) {
    const I = P.schema[P.opts.schemaId];
    I && (P.baseId = (0, d.resolveUrl)(P.opts.uriResolver, P.baseId, I));
  }
  function U(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: P, schemaEnv: I, schema: C, errSchemaPath: L, opts: K }) {
    const W = C.$comment;
    if (K.$comment === !0)
      P.code((0, a._)`${l.default.self}.logger.log(${W})`);
    else if (typeof K.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, ye = P.scopeValue("root", { ref: I.root });
      P.code((0, a._)`${l.default.self}.opts.$comment(${W}, ${ae}, ${ye}.schema)`);
    }
  }
  function M(P) {
    const { gen: I, schemaEnv: C, validateName: L, ValidationError: K, opts: W } = P;
    C.$async ? I.if((0, a._)`${l.default.errors} === 0`, () => I.return(l.default.data), () => I.throw((0, a._)`new ${K}(${l.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, l.default.vErrors), W.unevaluated && F(P), I.return((0, a._)`${l.default.errors} === 0`));
  }
  function F({ gen: P, evaluated: I, props: C, items: L }) {
    C instanceof a.Name && P.assign((0, a._)`${I}.props`, C), L instanceof a.Name && P.assign((0, a._)`${I}.items`, L);
  }
  function J(P, I, C, L) {
    const { gen: K, schema: W, data: ae, allErrors: ye, opts: ue, self: le } = P, { RULES: oe } = le;
    if (W.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(W, oe))) {
      K.block(() => G(P, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || H(P, I), K.block(() => {
      for (const me of oe.rules)
        Ne(me);
      Ne(oe.post);
    });
    function Ne(me) {
      (0, s.shouldUseGroup)(W, me) && (me.type ? (K.if((0, r.checkDataType)(me.type, ae, ue.strictNumbers)), B(P, me), I.length === 1 && I[0] === me.type && C && (K.else(), (0, r.reportTypeError)(P)), K.endIf()) : B(P, me), ye || K.if((0, a._)`${l.default.errors} === ${L || 0}`));
    }
  }
  function B(P, I) {
    const { gen: C, schema: L, opts: { useDefaults: K } } = P;
    K && (0, u.assignDefaults)(P, I.type), C.block(() => {
      for (const W of I.rules)
        (0, s.shouldUseRule)(L, W) && G(P, W.keyword, W.definition, I.type);
    });
  }
  function H(P, I) {
    P.schemaEnv.meta || !P.opts.strictTypes || (Y(P, I), P.opts.allowUnionTypes || k(P, I), N(P, P.dataTypes));
  }
  function Y(P, I) {
    if (I.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = I;
        return;
      }
      I.forEach((C) => {
        T(P.dataTypes, C) || S(P, `type "${C}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), h(P, I);
    }
  }
  function k(P, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(P, "use allowUnionTypes to allow union type keyword");
  }
  function N(P, I) {
    const C = P.self.RULES.all;
    for (const L in C) {
      const K = C[L];
      if (typeof K == "object" && (0, s.shouldUseRule)(P.schema, K)) {
        const { type: W } = K.definition;
        W.length && !W.some((ae) => A(I, ae)) && S(P, `missing type "${W.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(P, I) {
    return P.includes(I) || I === "number" && P.includes("integer");
  }
  function T(P, I) {
    return P.includes(I) || I === "integer" && P.includes("number");
  }
  function h(P, I) {
    const C = [];
    for (const L of P.dataTypes)
      T(I, L) ? C.push(L) : I.includes("integer") && L === "number" && C.push("integer");
    P.dataTypes = C;
  }
  function S(P, I) {
    const C = P.schemaEnv.baseId + P.errSchemaPath;
    I += ` at "${C}" (strictTypes)`, (0, c.checkStrictMode)(P, I, P.opts.strictTypes);
  }
  class j {
    constructor(I, C, L) {
      if ((0, n.validateKeywordUsage)(I, C, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = C.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = C.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = C, this.$data)
        this.schemaCode = I.gen.const("vSchema", Q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, C.schemaType, C.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(C.schemaType)}`);
      ("code" in C ? C.trackErrors : C.errors !== !1) && (this.errsCount = I.gen.const("_errs", l.default.errors));
    }
    result(I, C, L) {
      this.failResult((0, a.not)(I), C, L);
    }
    failResult(I, C, L) {
      this.gen.if(I), L ? L() : this.error(), C ? (this.gen.else(), C(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, C) {
      this.failResult((0, a.not)(I), void 0, C);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: C } = this;
      this.fail((0, a._)`${C} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, C, L) {
      if (C) {
        this.setParams(C), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, C) {
      (I ? $.reportExtraError : $.reportError)(this, this.def.error, C);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, C) {
      C ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, C, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), C();
      });
    }
    check$data(I = a.nil, C = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: K, schemaType: W, def: ae } = this;
      L.if((0, a.or)((0, a._)`${K} === undefined`, C)), I !== a.nil && L.assign(I, !0), (W.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: C, schemaType: L, def: K, it: W } = this;
      return (0, a.or)(ae(), ye());
      function ae() {
        if (L.length) {
          if (!(C instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, C, W.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function ye() {
        if (K.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: K.validateSchema });
          return (0, a._)`!${ue}(${C})`;
        }
        return a.nil;
      }
    }
    subschema(I, C) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const K = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(K, C), K;
    }
    mergeEvaluated(I, C) {
      const { it: L, gen: K } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(K, I.props, L.props, C)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(K, I.items, L.items, C)));
    }
    mergeValidEvaluated(I, C) {
      const { it: L, gen: K } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return K.if(C, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  Ge.KeywordCxt = j;
  function G(P, I, C, L) {
    const K = new j(P, C, I);
    "code" in C ? C.code(K, L) : K.$data && C.validate ? (0, n.funcKeywordCode)(K, C) : "macro" in C ? (0, n.macroKeywordCode)(K, C) : (C.compile || C.validate) && (0, n.funcKeywordCode)(K, C);
  }
  const X = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(P, { dataLevel: I, dataNames: C, dataPathArr: L }) {
    let K, W;
    if (P === "")
      return l.default.rootData;
    if (P[0] === "/") {
      if (!X.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      K = P, W = l.default.rootData;
    } else {
      const le = Z.exec(P);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const oe = +le[1];
      if (K = le[2], K === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (W = C[I - oe], !K)
        return W;
    }
    let ae = W;
    const ye = K.split("/");
    for (const le of ye)
      le && (W = (0, a._)`${W}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${W}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return Ge.getData = Q, Ge;
}
var Lt = {}, ro;
function pa() {
  if (ro) return Lt;
  ro = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return Lt.default = e, Lt;
}
var Vt = {}, no;
function Cn() {
  if (no) return Vt;
  no = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = An();
  class t extends Error {
    constructor(r, u, n, i) {
      super(i || `can't resolve reference ${n} from id ${u}`), this.missingRef = (0, e.resolveUrl)(r, u, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return Vt.default = t, Vt;
}
var Ie = {}, so;
function qn() {
  if (so) return Ie;
  so = 1, Object.defineProperty(Ie, "__esModule", { value: !0 }), Ie.resolveSchema = Ie.getCompilingSchema = Ie.resolveRef = Ie.compileSchema = Ie.SchemaEnv = void 0;
  const e = ee(), t = pa(), s = De(), r = An(), u = se(), n = kn();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Ie.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: E } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: E, ownProperties: m });
    let R;
    f.$async && (R = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = v.scopeName("validate");
    f.validateName = O;
    const q = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: O,
      ValidationError: R,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(q), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(O, { ref: z }), z.errors = null, z.schema = f.schema, z.schemaEnv = f, f.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: O, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = q;
        z.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return f.validate = z, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Ie.compileSchema = a;
  function l(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const E = f.refs[o];
    if (E)
      return E;
    let m = _.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: R } = this.opts;
      v && (m = new i({ schema: v, schemaId: R, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Ie.resolveRef = l;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if ($(y, f))
        return y;
  }
  Ie.getCompilingSchema = c;
  function $(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function _(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || g.call(this, f, y);
  }
  function g(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let E = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === E)
      return w.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const R = g.call(this, f, v);
      return typeof R?.schema != "object" ? void 0 : w.call(this, o, R);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: R } = v, { schemaId: O } = this.opts, q = R[O];
        return q && (E = (0, r.resolveUrl)(this.opts.uriResolver, E, q)), new i({ schema: R, schemaId: O, root: f, baseId: E });
      }
      return w.call(this, o, v);
    }
  }
  Ie.resolveSchema = g;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function w(f, { baseId: y, schema: o, root: p }) {
    var E;
    if (((E = f.fragment) === null || E === void 0 ? void 0 : E[0]) !== "/")
      return;
    for (const R of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const O = o[(0, u.unescapeFragment)(R)];
      if (O === void 0)
        return;
      o = O;
      const q = typeof o == "object" && o[this.opts.schemaId];
      !b.has(R) && q && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, q));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, u.schemaHasRulesButRef)(o, this.RULES)) {
      const R = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = g.call(this, p, R);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Ie;
}
const Sl = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Rl = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Pl = "object", Nl = ["$data"], Tl = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Il = !1, Ol = {
  $id: Sl,
  description: Rl,
  type: Pl,
  required: Nl,
  properties: Tl,
  additionalProperties: Il
};
var Ft = {}, It = { exports: {} }, rs, ao;
function Ou() {
  if (ao) return rs;
  ao = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function s(_) {
    let g = "", b = 0, w = 0;
    for (w = 0; w < _.length; w++)
      if (b = _[w].charCodeAt(0), b !== 48) {
        if (!(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
          return "";
        g += _[w];
        break;
      }
    for (w += 1; w < _.length; w++) {
      if (b = _[w].charCodeAt(0), !(b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102))
        return "";
      g += _[w];
    }
    return g;
  }
  const r = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function u(_) {
    return _.length = 0, !0;
  }
  function n(_, g, b) {
    if (_.length) {
      const w = s(_);
      if (w !== "")
        g.push(w);
      else
        return b.error = !0, !1;
      _.length = 0;
    }
    return !0;
  }
  function i(_) {
    let g = 0;
    const b = { error: !1, address: "", zone: "" }, w = [], f = [];
    let y = !1, o = !1, p = n;
    for (let E = 0; E < _.length; E++) {
      const m = _[E];
      if (!(m === "[" || m === "]"))
        if (m === ":") {
          if (y === !0 && (o = !0), !p(f, w, b))
            break;
          if (++g > 7) {
            b.error = !0;
            break;
          }
          E > 0 && _[E - 1] === ":" && (y = !0), w.push(":");
          continue;
        } else if (m === "%") {
          if (!p(f, w, b))
            break;
          p = u;
        } else {
          f.push(m);
          continue;
        }
    }
    return f.length && (p === u ? b.zone = f.join("") : o ? w.push(f.join("")) : w.push(s(f))), b.address = w.join(""), b;
  }
  function a(_) {
    if (l(_, ":") < 2)
      return { host: _, isIPV6: !1 };
    const g = i(_);
    if (g.error)
      return { host: _, isIPV6: !1 };
    {
      let b = g.address, w = g.address;
      return g.zone && (b += "%" + g.zone, w += "%25" + g.zone), { host: b, isIPV6: !0, escapedHost: w };
    }
  }
  function l(_, g) {
    let b = 0;
    for (let w = 0; w < _.length; w++)
      _[w] === g && b++;
    return b;
  }
  function d(_) {
    let g = _;
    const b = [];
    let w = -1, f = 0;
    for (; f = g.length; ) {
      if (f === 1) {
        if (g === ".")
          break;
        if (g === "/") {
          b.push("/");
          break;
        } else {
          b.push(g);
          break;
        }
      } else if (f === 2) {
        if (g[0] === ".") {
          if (g[1] === ".")
            break;
          if (g[1] === "/") {
            g = g.slice(2);
            continue;
          }
        } else if (g[0] === "/" && (g[1] === "." || g[1] === "/")) {
          b.push("/");
          break;
        }
      } else if (f === 3 && g === "/..") {
        b.length !== 0 && b.pop(), b.push("/");
        break;
      }
      if (g[0] === ".") {
        if (g[1] === ".") {
          if (g[2] === "/") {
            g = g.slice(3);
            continue;
          }
        } else if (g[1] === "/") {
          g = g.slice(2);
          continue;
        }
      } else if (g[0] === "/" && g[1] === ".") {
        if (g[2] === "/") {
          g = g.slice(2);
          continue;
        } else if (g[2] === "." && g[3] === "/") {
          g = g.slice(3), b.length !== 0 && b.pop();
          continue;
        }
      }
      if ((w = g.indexOf("/", 1)) === -1) {
        b.push(g);
        break;
      } else
        b.push(g.slice(0, w)), g = g.slice(w);
    }
    return b.join("");
  }
  function c(_, g) {
    const b = g !== !0 ? escape : unescape;
    return _.scheme !== void 0 && (_.scheme = b(_.scheme)), _.userinfo !== void 0 && (_.userinfo = b(_.userinfo)), _.host !== void 0 && (_.host = b(_.host)), _.path !== void 0 && (_.path = b(_.path)), _.query !== void 0 && (_.query = b(_.query)), _.fragment !== void 0 && (_.fragment = b(_.fragment)), _;
  }
  function $(_) {
    const g = [];
    if (_.userinfo !== void 0 && (g.push(_.userinfo), g.push("@")), _.host !== void 0) {
      let b = unescape(_.host);
      if (!t(b)) {
        const w = a(b);
        w.isIPV6 === !0 ? b = `[${w.escapedHost}]` : b = _.host;
      }
      g.push(b);
    }
    return (typeof _.port == "number" || typeof _.port == "string") && (g.push(":"), g.push(String(_.port))), g.length ? g.join("") : void 0;
  }
  return rs = {
    nonSimpleDomain: r,
    recomposeAuthority: $,
    normalizeComponentEncoding: c,
    removeDotSegments: d,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: a,
    stringArrayToHexStripped: s
  }, rs;
}
var ns, oo;
function jl() {
  if (oo) return ns;
  oo = 1;
  const { isUUID: e } = Ou(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, s = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function r(m) {
    return s.indexOf(
      /** @type {*} */
      m
    ) !== -1;
  }
  function u(m) {
    return m.secure === !0 ? !0 : m.secure === !1 ? !1 : m.scheme ? m.scheme.length === 3 && (m.scheme[0] === "w" || m.scheme[0] === "W") && (m.scheme[1] === "s" || m.scheme[1] === "S") && (m.scheme[2] === "s" || m.scheme[2] === "S") : !1;
  }
  function n(m) {
    return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
  }
  function i(m) {
    const v = String(m.scheme).toLowerCase() === "https";
    return (m.port === (v ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
  }
  function a(m) {
    return m.secure = u(m), m.resourceName = (m.path || "/") + (m.query ? "?" + m.query : ""), m.path = void 0, m.query = void 0, m;
  }
  function l(m) {
    if ((m.port === (u(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
      const [v, R] = m.resourceName.split("?");
      m.path = v && v !== "/" ? v : void 0, m.query = R, m.resourceName = void 0;
    }
    return m.fragment = void 0, m;
  }
  function d(m, v) {
    if (!m.path)
      return m.error = "URN can not be parsed", m;
    const R = m.path.match(t);
    if (R) {
      const O = v.scheme || m.scheme || "urn";
      m.nid = R[1].toLowerCase(), m.nss = R[2];
      const q = `${O}:${v.nid || m.nid}`, V = E(q);
      m.path = void 0, V && (m = V.parse(m, v));
    } else
      m.error = m.error || "URN can not be parsed.";
    return m;
  }
  function c(m, v) {
    if (m.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const R = v.scheme || m.scheme || "urn", O = m.nid.toLowerCase(), q = `${R}:${v.nid || O}`, V = E(q);
    V && (m = V.serialize(m, v));
    const D = m, U = m.nss;
    return D.path = `${O || v.nid}:${U}`, v.skipEscape = !0, D;
  }
  function $(m, v) {
    const R = m;
    return R.uuid = R.nss, R.nss = void 0, !v.tolerant && (!R.uuid || !e(R.uuid)) && (R.error = R.error || "UUID is not valid."), R;
  }
  function _(m) {
    const v = m;
    return v.nss = (m.uuid || "").toLowerCase(), v;
  }
  const g = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: n,
      serialize: i
    }
  ), b = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: g.domainHost,
      parse: n,
      serialize: i
    }
  ), w = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: a,
      serialize: l
    }
  ), f = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: w.domainHost,
      parse: w.parse,
      serialize: w.serialize
    }
  ), p = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: g,
      https: b,
      ws: w,
      wss: f,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: d,
          serialize: c,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: $,
          serialize: _,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(p, null);
  function E(m) {
    return m && (p[
      /** @type {SchemeName} */
      m
    ] || p[
      /** @type {SchemeName} */
      m.toLowerCase()
    ]) || void 0;
  }
  return ns = {
    wsIsSecure: u,
    SCHEMES: p,
    isValidSchemeName: r,
    getSchemeHandler: E
  }, ns;
}
var io;
function ju() {
  if (io) return It.exports;
  io = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: s, normalizeComponentEncoding: r, isIPv4: u, nonSimpleDomain: n } = Ou(), { SCHEMES: i, getSchemeHandler: a } = jl();
  function l(f, y) {
    return typeof f == "string" ? f = /** @type {T} */
    _(b(f, y), y) : typeof f == "object" && (f = /** @type {T} */
    b(_(f, y), y)), f;
  }
  function d(f, y, o) {
    const p = o ? Object.assign({ scheme: "null" }, o) : { scheme: "null" }, E = c(b(f, p), b(y, p), p, !0);
    return p.skipEscape = !0, _(E, p);
  }
  function c(f, y, o, p) {
    const E = {};
    return p || (f = b(_(f, o), o), y = b(_(y, o), o)), o = o || {}, !o.tolerant && y.scheme ? (E.scheme = y.scheme, E.userinfo = y.userinfo, E.host = y.host, E.port = y.port, E.path = t(y.path || ""), E.query = y.query) : (y.userinfo !== void 0 || y.host !== void 0 || y.port !== void 0 ? (E.userinfo = y.userinfo, E.host = y.host, E.port = y.port, E.path = t(y.path || ""), E.query = y.query) : (y.path ? (y.path[0] === "/" ? E.path = t(y.path) : ((f.userinfo !== void 0 || f.host !== void 0 || f.port !== void 0) && !f.path ? E.path = "/" + y.path : f.path ? E.path = f.path.slice(0, f.path.lastIndexOf("/") + 1) + y.path : E.path = y.path, E.path = t(E.path)), E.query = y.query) : (E.path = f.path, y.query !== void 0 ? E.query = y.query : E.query = f.query), E.userinfo = f.userinfo, E.host = f.host, E.port = f.port), E.scheme = f.scheme), E.fragment = y.fragment, E;
  }
  function $(f, y, o) {
    return typeof f == "string" ? (f = unescape(f), f = _(r(b(f, o), !0), { ...o, skipEscape: !0 })) : typeof f == "object" && (f = _(r(f, !0), { ...o, skipEscape: !0 })), typeof y == "string" ? (y = unescape(y), y = _(r(b(y, o), !0), { ...o, skipEscape: !0 })) : typeof y == "object" && (y = _(r(y, !0), { ...o, skipEscape: !0 })), f.toLowerCase() === y.toLowerCase();
  }
  function _(f, y) {
    const o = {
      host: f.host,
      scheme: f.scheme,
      userinfo: f.userinfo,
      port: f.port,
      path: f.path,
      query: f.query,
      nid: f.nid,
      nss: f.nss,
      uuid: f.uuid,
      fragment: f.fragment,
      reference: f.reference,
      resourceName: f.resourceName,
      secure: f.secure,
      error: ""
    }, p = Object.assign({}, y), E = [], m = a(p.scheme || o.scheme);
    m && m.serialize && m.serialize(o, p), o.path !== void 0 && (p.skipEscape ? o.path = unescape(o.path) : (o.path = escape(o.path), o.scheme !== void 0 && (o.path = o.path.split("%3A").join(":")))), p.reference !== "suffix" && o.scheme && E.push(o.scheme, ":");
    const v = s(o);
    if (v !== void 0 && (p.reference !== "suffix" && E.push("//"), E.push(v), o.path && o.path[0] !== "/" && E.push("/")), o.path !== void 0) {
      let R = o.path;
      !p.absolutePath && (!m || !m.absolutePath) && (R = t(R)), v === void 0 && R[0] === "/" && R[1] === "/" && (R = "/%2F" + R.slice(2)), E.push(R);
    }
    return o.query !== void 0 && E.push("?", o.query), o.fragment !== void 0 && E.push("#", o.fragment), E.join("");
  }
  const g = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function b(f, y) {
    const o = Object.assign({}, y), p = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let E = !1;
    o.reference === "suffix" && (o.scheme ? f = o.scheme + ":" + f : f = "//" + f);
    const m = f.match(g);
    if (m) {
      if (p.scheme = m[1], p.userinfo = m[3], p.host = m[4], p.port = parseInt(m[5], 10), p.path = m[6] || "", p.query = m[7], p.fragment = m[8], isNaN(p.port) && (p.port = m[5]), p.host)
        if (u(p.host) === !1) {
          const O = e(p.host);
          p.host = O.host.toLowerCase(), E = O.isIPV6;
        } else
          E = !0;
      p.scheme === void 0 && p.userinfo === void 0 && p.host === void 0 && p.port === void 0 && p.query === void 0 && !p.path ? p.reference = "same-document" : p.scheme === void 0 ? p.reference = "relative" : p.fragment === void 0 ? p.reference = "absolute" : p.reference = "uri", o.reference && o.reference !== "suffix" && o.reference !== p.reference && (p.error = p.error || "URI is not a " + o.reference + " reference.");
      const v = a(o.scheme || p.scheme);
      if (!o.unicodeSupport && (!v || !v.unicodeSupport) && p.host && (o.domainHost || v && v.domainHost) && E === !1 && n(p.host))
        try {
          p.host = URL.domainToASCII(p.host.toLowerCase());
        } catch (R) {
          p.error = p.error || "Host's domain name can not be converted to ASCII: " + R;
        }
      (!v || v && !v.skipNormalize) && (f.indexOf("%") !== -1 && (p.scheme !== void 0 && (p.scheme = unescape(p.scheme)), p.host !== void 0 && (p.host = unescape(p.host))), p.path && (p.path = escape(unescape(p.path))), p.fragment && (p.fragment = encodeURI(decodeURIComponent(p.fragment)))), v && v.parse && v.parse(p, o);
    } else
      p.error = p.error || "URI can not be parsed.";
    return p;
  }
  const w = {
    SCHEMES: i,
    normalize: l,
    resolve: d,
    resolveComponent: c,
    equal: $,
    serialize: _,
    parse: b
  };
  return It.exports = w, It.exports.default = w, It.exports.fastUri = w, It.exports;
}
var co;
function Al() {
  if (co) return Ft;
  co = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = ju();
  return e.code = 'require("ajv/dist/runtime/uri").default', Ft.default = e, Ft;
}
var uo;
function kl() {
  return uo || (uo = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = kn();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ee();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = pa(), u = Cn(), n = Tu(), i = qn(), a = ee(), l = An(), d = Rn(), c = se(), $ = Ol, _ = Al(), g = (k, N) => new RegExp(k, N);
    g.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, T, h, S, j, G, X, Z, Q, P, I, C, L, K, W, ae, ye, ue, le, oe, Ne, me, st, at;
      const Ae = k.strict, ot = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, Pt = ot === !0 || ot === void 0 ? 1 : ot || 0, Nt = (T = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && T !== void 0 ? T : g, Xn = (h = k.uriResolver) !== null && h !== void 0 ? h : _.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : Ae) !== null && j !== void 0 ? j : !0,
        strictNumbers: (X = (G = k.strictNumbers) !== null && G !== void 0 ? G : Ae) !== null && X !== void 0 ? X : !0,
        strictTypes: (Q = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : Ae) !== null && Q !== void 0 ? Q : "log",
        strictTuples: (I = (P = k.strictTuples) !== null && P !== void 0 ? P : Ae) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (C = k.strictRequired) !== null && C !== void 0 ? C : Ae) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: Pt, regExp: Nt } : { optimize: Pt, regExp: Nt },
        loopRequired: (K = k.loopRequired) !== null && K !== void 0 ? K : o,
        loopEnum: (W = k.loopEnum) !== null && W !== void 0 ? W : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (ye = k.messages) !== null && ye !== void 0 ? ye : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Ne = k.validateSchema) !== null && Ne !== void 0 ? Ne : !0,
        validateFormats: (me = k.validateFormats) !== null && me !== void 0 ? me : !0,
        unicodeRegExp: (st = k.unicodeRegExp) !== null && st !== void 0 ? st : !0,
        int32range: (at = k.int32range) !== null && at !== void 0 ? at : !0,
        uriResolver: Xn
      };
    }
    class E {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: T } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: w, es5: A, lines: T }), this.logger = U(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && q.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), R.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: T } = this.opts;
        let h = $;
        T === "id" && (h = { ...$ }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[T], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let T;
        if (typeof N == "string") {
          if (T = this.getSchema(N), !T)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          T = this.compile(N);
        const h = T(A);
        return "$async" in T || (this.errors = T.errors), h;
      }
      compile(N, A) {
        const T = this._addSchema(N, A);
        return T.validate || this._compileSchemaEnv(T);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: T } = this.opts;
        return h.call(this, N, A);
        async function h(Q, P) {
          await S.call(this, Q.$schema);
          const I = this._addSchema(Q, P);
          return I.validate || j.call(this, I);
        }
        async function S(Q) {
          Q && !this.getSchema(Q) && await h.call(this, { $ref: Q }, !0);
        }
        async function j(Q) {
          try {
            return this._compileSchemaEnv(Q);
          } catch (P) {
            if (!(P instanceof u.default))
              throw P;
            return G.call(this, P), await X.call(this, P.missingSchema), j.call(this, Q);
          }
        }
        function G({ missingSchema: Q, missingRef: P }) {
          if (this.refs[Q])
            throw new Error(`AnySchema ${Q} is loaded but ${P} cannot be resolved`);
        }
        async function X(Q) {
          const P = await Z.call(this, Q);
          this.refs[Q] || await S.call(this, P.$schema), this.refs[Q] || this.addSchema(P, Q, A);
        }
        async function Z(Q) {
          const P = this._loading[Q];
          if (P)
            return P;
          try {
            return await (this._loading[Q] = T(Q));
          } finally {
            delete this._loading[Q];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, T, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, T, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, l.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, T, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, T = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, T), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let T;
        if (T = N.$schema, T !== void 0 && typeof T != "string")
          throw new Error("$schema must be a string");
        if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(T, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: T } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: T });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let T = N[this.opts.schemaId];
            return T && (T = (0, l.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let T;
        if (typeof N == "string")
          T = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = T);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, T = A.keyword, Array.isArray(T) && !T.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, T, A), !A)
          return (0, c.eachItem)(T, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(T, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const T of A.rules) {
          const h = T.rules.findIndex((S) => S.keyword === N);
          h >= 0 && T.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: T = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${T}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const T = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const G of S)
            j = j[G];
          for (const G in T) {
            const X = T[G];
            if (typeof X != "object")
              continue;
            const { $data: Z } = X.definition, Q = j[G];
            Z && Q && (j[G] = Y(Q));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const T in N) {
          const h = N[T];
          (!A || A.test(T)) && (typeof h == "string" ? delete N[T] : h && !h.meta && (this._cache.delete(h.schema), delete N[T]));
        }
      }
      _addSchema(N, A, T, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: G } = this.opts;
        if (typeof N == "object")
          j = N[G];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let X = this._cache.get(N);
        if (X !== void 0)
          return X;
        T = (0, l.normalizeId)(j || T);
        const Z = l.getSchemaRefs.call(this, N, T);
        return X = new i.SchemaEnv({ schema: N, schemaId: G, meta: A, baseId: T, localRefs: Z }), this._cache.set(X.schema, X), S && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = X), h && this.validateSchema(N, !0), X;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    E.ValidationError = r.default, E.MissingRefError = u.default, e.default = E;
    function m(k, N, A, T = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[T](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, l.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function R() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function O() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function q(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (T) => {
        if (A.keywords[T])
          throw new Error(`Keyword ${T} is already defined`);
        if (!z.test(T))
          throw new Error(`Keyword ${T} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var T;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: X }) => X === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const G = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? J.call(this, j, G, N.before) : j.rules.push(G), S.all[k] = G, (T = N.implements) === null || T === void 0 || T.forEach((X) => this.addKeyword(X));
    }
    function J(k, N, A) {
      const T = k.rules.findIndex((h) => h.keyword === A);
      T >= 0 ? k.rules.splice(T, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const H = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, H] };
    }
  })(Wn)), Wn;
}
var Ut = {}, zt = {}, Gt = {}, lo;
function Cl() {
  if (lo) return Gt;
  lo = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Gt.default = e, Gt;
}
var Ze = {}, fo;
function ya() {
  if (fo) return Ze;
  fo = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.callRef = Ze.getValidate = void 0;
  const e = Cn(), t = Me(), s = ee(), r = De(), u = qn(), n = se(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: $, it: _ } = d, { baseId: g, schemaEnv: b, validateName: w, opts: f, self: y } = _, { root: o } = b;
      if (($ === "#" || $ === "#/") && g === o.baseId)
        return E();
      const p = u.resolveRef.call(y, o, g, $);
      if (p === void 0)
        throw new e.default(_.opts.uriResolver, g, $);
      if (p instanceof u.SchemaEnv)
        return m(p);
      return v(p);
      function E() {
        if (b === o)
          return l(d, w, b, b.$async);
        const R = c.scopeValue("root", { ref: o });
        return l(d, (0, s._)`${R}.validate`, o, o.$async);
      }
      function m(R) {
        const O = a(d, R);
        l(d, O, R, R.$async);
      }
      function v(R) {
        const O = c.scopeValue("schema", f.code.source === !0 ? { ref: R, code: (0, s.stringify)(R) } : { ref: R }), q = c.name("valid"), V = d.subschema({
          schema: R,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: O,
          errSchemaPath: $
        }, q);
        d.mergeEvaluated(V), d.ok(q);
      }
    }
  };
  function a(d, c) {
    const { gen: $ } = d;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  Ze.getValidate = a;
  function l(d, c, $, _) {
    const { gen: g, it: b } = d, { allErrors: w, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    _ ? p() : E();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const R = g.let("valid");
      g.try(() => {
        g.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), w || g.assign(R, !0);
      }, (O) => {
        g.if((0, s._)`!(${O} instanceof ${b.ValidationError})`, () => g.throw(O)), m(O), w || g.assign(R, !1);
      }), d.ok(R);
    }
    function E() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(R) {
      const O = (0, s._)`${R}.errors`;
      g.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${O} : ${r.default.vErrors}.concat(${O})`), g.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(R) {
      var O;
      if (!b.opts.unevaluated)
        return;
      const q = (O = $?.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (b.props !== !0)
        if (q && !q.dynamicProps)
          q.props !== void 0 && (b.props = n.mergeEvaluated.props(g, q.props, b.props));
        else {
          const V = g.var("props", (0, s._)`${R}.evaluated.props`);
          b.props = n.mergeEvaluated.props(g, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (q && !q.dynamicItems)
          q.items !== void 0 && (b.items = n.mergeEvaluated.items(g, q.items, b.items));
        else {
          const V = g.var("items", (0, s._)`${R}.evaluated.items`);
          b.items = n.mergeEvaluated.items(g, V, b.items, s.Name);
        }
    }
  }
  return Ze.callRef = l, Ze.default = i, Ze;
}
var ho;
function ql() {
  if (ho) return zt;
  ho = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = Cl(), t = ya(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return zt.default = s, zt;
}
var Kt = {}, Xt = {}, mo;
function Dl() {
  if (mo) return Xt;
  mo = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = ee(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, u = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: l } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${l} || isNaN(${a})`);
    }
  };
  return Xt.default = u, Xt;
}
var Ht = {}, po;
function Ml() {
  if (po) return Ht;
  po = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: u, data: n, schemaCode: i, it: a } = r, l = a.opts.multipleOfPrecision, d = u.let("res"), c = l ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${l}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return Ht.default = s, Ht;
}
var Bt = {}, Jt = {}, yo;
function Ll() {
  if (yo) return Jt;
  yo = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, u = 0, n;
    for (; u < s; )
      r++, n = t.charCodeAt(u++), n >= 55296 && n <= 56319 && u < s && (n = t.charCodeAt(u), (n & 64512) === 56320 && u++);
    return r;
  }
  return Jt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Jt;
}
var vo;
function Vl() {
  if (vo) return Bt;
  vo = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Ll(), u = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: l, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${$} ${c} ${l}`);
    }
  };
  return Bt.default = u, Bt;
}
var Wt = {}, _o;
function Fl() {
  if (_o) return Wt;
  _o = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = Me(), t = ee(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: u }) => (0, t.str)`must match pattern "${u}"`,
      params: ({ schemaCode: u }) => (0, t._)`{pattern: ${u}}`
    },
    code(u) {
      const { data: n, $data: i, schema: a, schemaCode: l, it: d } = u, c = d.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${l}, ${c}))` : (0, e.usePattern)(u, a);
      u.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return Wt.default = r, Wt;
}
var Yt = {}, go;
function Ul() {
  if (go) return Yt;
  go = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: i } = r, a = u === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Yt.default = s, Yt;
}
var Qt = {}, $o;
function zl() {
  if ($o) return Qt;
  $o = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = Me(), t = ee(), s = se(), u = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: l, data: d, $data: c, it: $ } = n, { opts: _ } = $;
      if (!c && a.length === 0)
        return;
      const g = a.length >= _.loopRequired;
      if ($.allErrors ? b() : w(), _.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const E of a)
          if (o?.[E] === void 0 && !p.has(E)) {
            const m = $.schemaEnv.baseId + $.errSchemaPath, v = `required property "${E}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)($, v, $.opts.strictRequired);
          }
      }
      function b() {
        if (g || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function w() {
        const o = i.let("missing");
        if (g || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", l, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, _.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, l, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, _.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return Qt.default = u, Qt;
}
var Zt = {}, Eo;
function Gl() {
  if (Eo) return Zt;
  Eo = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: i } = r, a = u === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Zt.default = s, Zt;
}
var xt = {}, er = {}, wo;
function va() {
  if (wo) return er;
  wo = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = jn();
  return e.code = 'require("ajv/dist/runtime/equal").default', er.default = e, er;
}
var bo;
function Kl() {
  if (bo) return xt;
  bo = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = Rn(), t = ee(), s = se(), r = va(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: l, $data: d, schema: c, parentSchema: $, schemaCode: _, it: g } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), w = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(b, f, (0, t._)`${_} === false`), i.ok(b);
      function f() {
        const E = a.let("i", (0, t._)`${l}.length`), m = a.let("j");
        i.setParams({ i: E, j: m }), a.assign(b, !0), a.if((0, t._)`${E} > 1`, () => (y() ? o : p)(E, m));
      }
      function y() {
        return w.length > 0 && !w.some((E) => E === "object" || E === "array");
      }
      function o(E, m) {
        const v = a.name("item"), R = (0, e.checkDataTypes)(w, v, g.opts.strictNumbers, e.DataType.Wrong), O = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${E}--;`, () => {
          a.let(v, (0, t._)`${l}[${E}]`), a.if(R, (0, t._)`continue`), w.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${O}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${O}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${O}[${v}] = ${E}`);
        });
      }
      function p(E, m) {
        const v = (0, s.useFunc)(a, r.default), R = a.name("outer");
        a.label(R).for((0, t._)`;${E}--;`, () => a.for((0, t._)`${m} = ${E}; ${m}--;`, () => a.if((0, t._)`${v}(${l}[${E}], ${l}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(R);
        })));
      }
    }
  };
  return xt.default = n, xt;
}
var tr = {}, So;
function Xl() {
  if (So) return tr;
  So = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = va(), u = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: l, schemaCode: d, schema: c } = n;
      l || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return tr.default = u, tr;
}
var rr = {}, Ro;
function Hl() {
  if (Ro) return rr;
  Ro = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = va(), u = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: l, schema: d, schemaCode: c, it: $ } = n;
      if (!l && d.length === 0)
        throw new Error("enum must have non-empty array");
      const _ = d.length >= $.opts.loopEnum;
      let g;
      const b = () => g ?? (g = (0, t.useFunc)(i, s.default));
      let w;
      if (_ || l)
        w = i.let("valid"), n.block$data(w, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        w = (0, e.or)(...d.map((p, E) => y(o, E)));
      }
      n.pass(w);
      function f() {
        i.assign(w, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(w, !0).break()));
      }
      function y(o, p) {
        const E = d[p];
        return typeof E == "object" && E !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${E}`;
      }
    }
  };
  return rr.default = u, rr;
}
var Po;
function Bl() {
  if (Po) return Kt;
  Po = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const e = Dl(), t = Ml(), s = Vl(), r = Fl(), u = Ul(), n = zl(), i = Gl(), a = Kl(), l = Xl(), d = Hl(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    u.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    l.default,
    d.default
  ];
  return Kt.default = c, Kt;
}
var nr = {}, pt = {}, No;
function Au() {
  if (No) return pt;
  No = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.validateAdditionalItems = void 0;
  const e = ee(), t = se(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: l } = i;
      if (!Array.isArray(l)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      u(n, l);
    }
  };
  function u(n, i) {
    const { gen: a, schema: l, data: d, keyword: c, it: $ } = n;
    $.items = !0;
    const _ = a.const("len", (0, e._)`${d}.length`);
    if (l === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${_} <= ${i.length}`);
    else if (typeof l == "object" && !(0, t.alwaysValidSchema)($, l)) {
      const b = a.var("valid", (0, e._)`${_} <= ${i.length}`);
      a.if((0, e.not)(b), () => g(b)), n.ok(b);
    }
    function g(b) {
      a.forRange("i", i.length, _, (w) => {
        n.subschema({ keyword: c, dataProp: w, dataPropType: t.Type.Num }, b), $.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return pt.validateAdditionalItems = u, pt.default = r, pt;
}
var sr = {}, yt = {}, To;
function ku() {
  if (To) return yt;
  To = 1, Object.defineProperty(yt, "__esModule", { value: !0 }), yt.validateTuple = void 0;
  const e = ee(), t = se(), s = Me(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return u(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function u(n, i, a = n.schema) {
    const { gen: l, parentSchema: d, data: c, keyword: $, it: _ } = n;
    w(d), _.opts.unevaluated && a.length && _.items !== !0 && (_.items = t.mergeEvaluated.items(l, a.length, _.items));
    const g = l.name("valid"), b = l.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(_, f) || (l.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: $,
        schemaProp: y,
        dataProp: y
      }, g)), n.ok(g));
    });
    function w(f) {
      const { opts: y, errSchemaPath: o } = _, p = a.length, E = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !E) {
        const m = `"${$}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(_, m, y.strictTuples);
      }
    }
  }
  return yt.validateTuple = u, yt.default = r, yt;
}
var Io;
function Jl() {
  if (Io) return sr;
  Io = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = ku(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return sr.default = t, sr;
}
var ar = {}, Oo;
function Wl() {
  if (Oo) return ar;
  Oo = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = Me(), r = Au(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: l, it: d } = i, { prefixItems: c } = l;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return ar.default = n, ar;
}
var or = {}, jo;
function Yl() {
  if (jo) return or;
  jo = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${u} valid item(s)` : (0, e.str)`must contain at least ${u} and no more than ${n} valid item(s)`,
      params: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${u}}` : (0, e._)`{minContains: ${u}, maxContains: ${n}}`
    },
    code(u) {
      const { gen: n, schema: i, parentSchema: a, data: l, it: d } = u;
      let c, $;
      const { minContains: _, maxContains: g } = a;
      d.opts.next ? (c = _ === void 0 ? 1 : _, $ = g) : c = 1;
      const b = n.const("len", (0, e._)`${l}.length`);
      if (u.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), u.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        $ !== void 0 && (p = (0, e._)`${p} && ${b} <= ${$}`), u.pass(p);
        return;
      }
      d.items = !0;
      const w = n.name("valid");
      $ === void 0 && c === 1 ? y(w, () => n.if(w, () => n.break())) : c === 0 ? (n.let(w, !0), $ !== void 0 && n.if((0, e._)`${l}.length > 0`, f)) : (n.let(w, !1), f()), u.result(w, () => u.reset());
      function f() {
        const p = n.name("_valid"), E = n.let("count", 0);
        y(p, () => n.if(p, () => o(E)));
      }
      function y(p, E) {
        n.forRange("i", 0, b, (m) => {
          u.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), E();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), $ === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0).break()) : (n.if((0, e._)`${p} > ${$}`, () => n.assign(w, !1).break()), c === 1 ? n.assign(w, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0)));
      }
    }
  };
  return or.default = r, or;
}
var ss = {}, Ao;
function _a() {
  return Ao || (Ao = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ee(), s = se(), r = Me();
    e.error = {
      message: ({ params: { property: l, depsCount: d, deps: c } }) => {
        const $ = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${l} is present`;
      },
      params: ({ params: { property: l, depsCount: d, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${l},
    missingProperty: ${$},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const u = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(l) {
        const [d, c] = n(l);
        i(l, d), a(l, c);
      }
    };
    function n({ schema: l }) {
      const d = {}, c = {};
      for (const $ in l) {
        if ($ === "__proto__")
          continue;
        const _ = Array.isArray(l[$]) ? d : c;
        _[$] = l[$];
      }
      return [d, c];
    }
    function i(l, d = l.schema) {
      const { gen: c, data: $, it: _ } = l;
      if (Object.keys(d).length === 0)
        return;
      const g = c.let("missing");
      for (const b in d) {
        const w = d[b];
        if (w.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, $, b, _.opts.ownProperties);
        l.setParams({
          property: b,
          depsCount: w.length,
          deps: w.join(", ")
        }), _.allErrors ? c.if(f, () => {
          for (const y of w)
            (0, r.checkReportMissingProp)(l, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(l, w, g)})`), (0, r.reportMissingProp)(l, g), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(l, d = l.schema) {
      const { gen: c, data: $, keyword: _, it: g } = l, b = c.name("valid");
      for (const w in d)
        (0, s.alwaysValidSchema)(g, d[w]) || (c.if(
          (0, r.propertyInData)(c, $, w, g.opts.ownProperties),
          () => {
            const f = l.subschema({ keyword: _, schemaProp: w }, b);
            l.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), l.ok(b));
    }
    e.validateSchemaDeps = a, e.default = u;
  })(ss)), ss;
}
var ir = {}, ko;
function Ql() {
  if (ko) return ir;
  ko = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: u }) => (0, e._)`{propertyName: ${u.propertyName}}`
    },
    code(u) {
      const { gen: n, schema: i, data: a, it: l } = u;
      if ((0, t.alwaysValidSchema)(l, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        u.setParams({ propertyName: c }), u.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          u.error(!0), l.allErrors || n.break();
        });
      }), u.ok(d);
    }
  };
  return ir.default = r, ir;
}
var cr = {}, Co;
function Cu() {
  if (Co) return cr;
  Co = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = Me(), t = ee(), s = De(), r = se(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: l, parentSchema: d, data: c, errsCount: $, it: _ } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: g, opts: b } = _;
      if (_.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(_, l))
        return;
      const w = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !w.length && !f.length ? E(v) : a.if(o(v), () => E(v));
        });
      }
      function o(v) {
        let R;
        if (w.length > 8) {
          const O = (0, r.schemaRefOrVal)(_, d.properties, "properties");
          R = (0, e.isOwnProperty)(a, O, v);
        } else w.length ? R = (0, t.or)(...w.map((O) => (0, t._)`${v} === ${O}`)) : R = t.nil;
        return f.length && (R = (0, t.or)(R, ...f.map((O) => (0, t._)`${(0, e.usePattern)(i, O)}.test(${v})`))), (0, t.not)(R);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function E(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && l === !1) {
          p(v);
          return;
        }
        if (l === !1) {
          i.setParams({ additionalProperty: v }), i.error(), g || a.break();
          return;
        }
        if (typeof l == "object" && !(0, r.alwaysValidSchema)(_, l)) {
          const R = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, R, !1), a.if((0, t.not)(R), () => {
            i.reset(), p(v);
          })) : (m(v, R), g || a.if((0, t.not)(R), () => a.break()));
        }
      }
      function m(v, R, O) {
        const q = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        O === !1 && Object.assign(q, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(q, R);
      }
    }
  };
  return cr.default = n, cr;
}
var ur = {}, qo;
function Zl() {
  if (qo) return ur;
  qo = 1, Object.defineProperty(ur, "__esModule", { value: !0 });
  const e = kn(), t = Me(), s = se(), r = Cu(), u = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: l, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && l.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(a);
      for (const f of $)
        c.definedProperties.add(f);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const _ = $.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (_.length === 0)
        return;
      const g = i.name("valid");
      for (const f of _)
        b(f) ? w(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), w(f), c.allErrors || i.else().var(g, !0), i.endIf()), n.it.definedProperties.add(f), n.ok(g);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function w(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, g);
      }
    }
  };
  return ur.default = u, ur;
}
var lr = {}, Do;
function xl() {
  if (Do) return lr;
  Do = 1, Object.defineProperty(lr, "__esModule", { value: !0 });
  const e = Me(), t = ee(), s = se(), r = se(), u = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: l, parentSchema: d, it: c } = n, { opts: $ } = c, _ = (0, e.allSchemaProperties)(a), g = _.filter((E) => (0, s.alwaysValidSchema)(c, a[E]));
      if (_.length === 0 || g.length === _.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = $.strictSchema && !$.allowMatchingProperties && d.properties, w = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const E of _)
          b && o(E), c.allErrors ? p(E) : (i.var(w, !0), p(E), i.if(w));
      }
      function o(E) {
        for (const m in b)
          new RegExp(E).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
      }
      function p(E) {
        i.forIn("key", l, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, E)}.test(${m})`, () => {
            const v = g.includes(E);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: E,
              dataProp: m,
              dataPropType: r.Type.Str
            }, w), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(w), () => i.break());
          });
        });
      }
    }
  };
  return lr.default = u, lr;
}
var dr = {}, Mo;
function ed() {
  if (Mo) return dr;
  Mo = 1, Object.defineProperty(dr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: u, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, u)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return dr.default = t, dr;
}
var fr = {}, Lo;
function td() {
  if (Lo) return fr;
  Lo = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Me().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return fr.default = t, fr;
}
var hr = {}, Vo;
function rd() {
  if (Vo) return hr;
  Vo = 1, Object.defineProperty(hr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: u }) => (0, e._)`{passingSchemas: ${u.passing}}`
    },
    code(u) {
      const { gen: n, schema: i, parentSchema: a, it: l } = u;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (l.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), $ = n.let("passing", null), _ = n.name("_valid");
      u.setParams({ passing: $ }), n.block(g), u.result(c, () => u.reset(), () => u.error(!0));
      function g() {
        d.forEach((b, w) => {
          let f;
          (0, t.alwaysValidSchema)(l, b) ? n.var(_, !0) : f = u.subschema({
            keyword: "oneOf",
            schemaProp: w,
            compositeRule: !0
          }, _), w > 0 && n.if((0, e._)`${_} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${w}]`).else(), n.if(_, () => {
            n.assign(c, !0), n.assign($, w), f && u.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return hr.default = r, hr;
}
var mr = {}, Fo;
function nd() {
  if (Fo) return mr;
  Fo = 1, Object.defineProperty(mr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: u, it: n } = s;
      if (!Array.isArray(u))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      u.forEach((a, l) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: l }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return mr.default = t, mr;
}
var pr = {}, Uo;
function sd() {
  if (Uo) return pr;
  Uo = 1, Object.defineProperty(pr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: l } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(l, '"if" without "then" and "else" is ignored');
      const d = u(l, "then"), c = u(l, "else");
      if (!d && !c)
        return;
      const $ = i.let("valid", !0), _ = i.name("_valid");
      if (g(), n.reset(), d && c) {
        const w = i.let("ifClause");
        n.setParams({ ifClause: w }), i.if(_, b("then", w), b("else", w));
      } else d ? i.if(_, b("then")) : i.if((0, e.not)(_), b("else"));
      n.pass($, () => n.error(!0));
      function g() {
        const w = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, _);
        n.mergeEvaluated(w);
      }
      function b(w, f) {
        return () => {
          const y = n.subschema({ keyword: w }, _);
          i.assign($, _), n.mergeValidEvaluated(y, $), f ? i.assign(f, (0, e._)`${w}`) : n.setParams({ ifClause: w });
        };
      }
    }
  };
  function u(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return pr.default = r, pr;
}
var yr = {}, zo;
function ad() {
  if (zo) return yr;
  zo = 1, Object.defineProperty(yr, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: u }) {
      r.if === void 0 && (0, e.checkStrictMode)(u, `"${s}" without "if" is ignored`);
    }
  };
  return yr.default = t, yr;
}
var Go;
function od() {
  if (Go) return nr;
  Go = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = Au(), t = Jl(), s = ku(), r = Wl(), u = Yl(), n = _a(), i = Ql(), a = Cu(), l = Zl(), d = xl(), c = ed(), $ = td(), _ = rd(), g = nd(), b = sd(), w = ad();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      $.default,
      _.default,
      g.default,
      b.default,
      w.default,
      // object
      i.default,
      a.default,
      n.default,
      l.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(u.default), o;
  }
  return nr.default = f, nr;
}
var vr = {}, vt = {}, Ko;
function qu() {
  if (Ko) return vt;
  Ko = 1, Object.defineProperty(vt, "__esModule", { value: !0 }), vt.dynamicAnchor = void 0;
  const e = ee(), t = De(), s = qn(), r = ya(), u = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (a) => n(a, a.schema)
  };
  function n(a, l) {
    const { gen: d, it: c } = a;
    c.schemaEnv.root.dynamicAnchors[l] = !0;
    const $ = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(l)}`, _ = c.errSchemaPath === "#" ? c.validateName : i(a);
    d.if((0, e._)`!${$}`, () => d.assign($, _));
  }
  vt.dynamicAnchor = n;
  function i(a) {
    const { schemaEnv: l, schema: d, self: c } = a.it, { root: $, baseId: _, localRefs: g, meta: b } = l.root, { schemaId: w } = c.opts, f = new s.SchemaEnv({ schema: d, schemaId: w, root: $, baseId: _, localRefs: g, meta: b });
    return s.compileSchema.call(c, f), (0, r.getValidate)(a, f);
  }
  return vt.default = u, vt;
}
var _t = {}, Xo;
function Du() {
  if (Xo) return _t;
  Xo = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.dynamicRef = void 0;
  const e = ee(), t = De(), s = ya(), r = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (n) => u(n, n.schema)
  };
  function u(n, i) {
    const { gen: a, keyword: l, it: d } = n;
    if (i[0] !== "#")
      throw new Error(`"${l}" only supports hash fragment reference`);
    const c = i.slice(1);
    if (d.allErrors)
      $();
    else {
      const g = a.let("valid", !1);
      $(g), n.ok(g);
    }
    function $(g) {
      if (d.schemaEnv.root.dynamicAnchors[c]) {
        const b = a.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(c)}`);
        a.if(b, _(b, g), _(d.validateName, g));
      } else
        _(d.validateName, g)();
    }
    function _(g, b) {
      return b ? () => a.block(() => {
        (0, s.callRef)(n, g), a.let(b, !0);
      }) : () => (0, s.callRef)(n, g);
    }
  }
  return _t.dynamicRef = u, _t.default = r, _t;
}
var _r = {}, Ho;
function id() {
  if (Ho) return _r;
  Ho = 1, Object.defineProperty(_r, "__esModule", { value: !0 });
  const e = qu(), t = se(), s = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(r) {
      r.schema ? (0, e.dynamicAnchor)(r, "") : (0, t.checkStrictMode)(r.it, "$recursiveAnchor: false is ignored");
    }
  };
  return _r.default = s, _r;
}
var gr = {}, Bo;
function cd() {
  if (Bo) return gr;
  Bo = 1, Object.defineProperty(gr, "__esModule", { value: !0 });
  const e = Du(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (s) => (0, e.dynamicRef)(s, s.schema)
  };
  return gr.default = t, gr;
}
var Jo;
function ud() {
  if (Jo) return vr;
  Jo = 1, Object.defineProperty(vr, "__esModule", { value: !0 });
  const e = qu(), t = Du(), s = id(), r = cd(), u = [e.default, t.default, s.default, r.default];
  return vr.default = u, vr;
}
var $r = {}, Er = {}, Wo;
function ld() {
  if (Wo) return Er;
  Wo = 1, Object.defineProperty(Er, "__esModule", { value: !0 });
  const e = _a(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (s) => (0, e.validatePropertyDeps)(s)
  };
  return Er.default = t, Er;
}
var wr = {}, Yo;
function dd() {
  if (Yo) return wr;
  Yo = 1, Object.defineProperty(wr, "__esModule", { value: !0 });
  const e = _a(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (s) => (0, e.validateSchemaDeps)(s)
  };
  return wr.default = t, wr;
}
var br = {}, Qo;
function fd() {
  if (Qo) return br;
  Qo = 1, Object.defineProperty(br, "__esModule", { value: !0 });
  const e = se(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: s, parentSchema: r, it: u }) {
      r.contains === void 0 && (0, e.checkStrictMode)(u, `"${s}" without "contains" is ignored`);
    }
  };
  return br.default = t, br;
}
var Zo;
function hd() {
  if (Zo) return $r;
  Zo = 1, Object.defineProperty($r, "__esModule", { value: !0 });
  const e = ld(), t = dd(), s = fd(), r = [e.default, t.default, s.default];
  return $r.default = r, $r;
}
var Sr = {}, Rr = {}, xo;
function md() {
  if (xo) return Rr;
  xo = 1, Object.defineProperty(Rr, "__esModule", { value: !0 });
  const e = ee(), t = se(), s = De(), u = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: n }) => (0, e._)`{unevaluatedProperty: ${n.unevaluatedProperty}}`
    },
    code(n) {
      const { gen: i, schema: a, data: l, errsCount: d, it: c } = n;
      if (!d)
        throw new Error("ajv implementation error");
      const { allErrors: $, props: _ } = c;
      _ instanceof e.Name ? i.if((0, e._)`${_} !== true`, () => i.forIn("key", l, (f) => i.if(b(_, f), () => g(f)))) : _ !== !0 && i.forIn("key", l, (f) => _ === void 0 ? g(f) : i.if(w(_, f), () => g(f))), c.props = !0, n.ok((0, e._)`${d} === ${s.default.errors}`);
      function g(f) {
        if (a === !1) {
          n.setParams({ unevaluatedProperty: f }), n.error(), $ || i.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(c, a)) {
          const y = i.name("valid");
          n.subschema({
            keyword: "unevaluatedProperties",
            dataProp: f,
            dataPropType: t.Type.Str
          }, y), $ || i.if((0, e.not)(y), () => i.break());
        }
      }
      function b(f, y) {
        return (0, e._)`!${f} || !${f}[${y}]`;
      }
      function w(f, y) {
        const o = [];
        for (const p in f)
          f[p] === !0 && o.push((0, e._)`${y} !== ${p}`);
        return (0, e.and)(...o);
      }
    }
  };
  return Rr.default = u, Rr;
}
var Pr = {}, ei;
function pd() {
  if (ei) return Pr;
  ei = 1, Object.defineProperty(Pr, "__esModule", { value: !0 });
  const e = ee(), t = se(), r = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: u } }) => (0, e.str)`must NOT have more than ${u} items`,
      params: ({ params: { len: u } }) => (0, e._)`{limit: ${u}}`
    },
    code(u) {
      const { gen: n, schema: i, data: a, it: l } = u, d = l.items || 0;
      if (d === !0)
        return;
      const c = n.const("len", (0, e._)`${a}.length`);
      if (i === !1)
        u.setParams({ len: d }), u.fail((0, e._)`${c} > ${d}`);
      else if (typeof i == "object" && !(0, t.alwaysValidSchema)(l, i)) {
        const _ = n.var("valid", (0, e._)`${c} <= ${d}`);
        n.if((0, e.not)(_), () => $(_, d)), u.ok(_);
      }
      l.items = !0;
      function $(_, g) {
        n.forRange("i", g, c, (b) => {
          u.subschema({ keyword: "unevaluatedItems", dataProp: b, dataPropType: t.Type.Num }, _), l.allErrors || n.if((0, e.not)(_), () => n.break());
        });
      }
    }
  };
  return Pr.default = r, Pr;
}
var ti;
function yd() {
  if (ti) return Sr;
  ti = 1, Object.defineProperty(Sr, "__esModule", { value: !0 });
  const e = md(), t = pd(), s = [e.default, t.default];
  return Sr.default = s, Sr;
}
var Nr = {}, Tr = {}, ri;
function vd() {
  if (ri) return Tr;
  ri = 1, Object.defineProperty(Tr, "__esModule", { value: !0 });
  const e = ee(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, u) {
      const { gen: n, data: i, $data: a, schema: l, schemaCode: d, it: c } = r, { opts: $, errSchemaPath: _, schemaEnv: g, self: b } = c;
      if (!$.validateFormats)
        return;
      a ? w() : f();
      function w() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: $.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), E = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(E, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(E, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${E}`;
        }
        function v() {
          const R = g.$async ? (0, e._)`(${o}.async ? await ${E}(${i}) : ${E}(${i}))` : (0, e._)`${E}(${i})`, O = (0, e._)`(typeof ${E} == "function" ? ${R} : ${E}.test(${i}))`;
          return (0, e._)`${E} && ${E} !== true && ${p} === ${u} && !${O}`;
        }
      }
      function f() {
        const y = b.formats[l];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, E] = v(y);
        o === u && r.pass(R());
        function m() {
          if ($.strictSchema === !1) {
            b.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${l}" ignored in schema at path "${_}"`;
          }
        }
        function v(O) {
          const q = O instanceof RegExp ? (0, e.regexpCode)(O) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(l)}` : void 0, V = n.scopeValue("formats", { key: l, ref: O, code: q });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${V}.validate`] : ["string", O, V];
        }
        function R() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!g.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${E}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${E}(${i})` : (0, e._)`${E}.test(${i})`;
        }
      }
    }
  };
  return Tr.default = s, Tr;
}
var ni;
function _d() {
  if (ni) return Nr;
  ni = 1, Object.defineProperty(Nr, "__esModule", { value: !0 });
  const t = [vd().default];
  return Nr.default = t, Nr;
}
var lt = {}, si;
function gd() {
  return si || (si = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.contentVocabulary = lt.metadataVocabulary = void 0, lt.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], lt.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), lt;
}
var ai;
function $d() {
  if (ai) return Ut;
  ai = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = ql(), t = Bl(), s = od(), r = ud(), u = hd(), n = yd(), i = _d(), a = gd(), l = [
    r.default,
    e.default,
    t.default,
    (0, s.default)(!0),
    i.default,
    a.metadataVocabulary,
    a.contentVocabulary,
    u.default,
    n.default
  ];
  return Ut.default = l, Ut;
}
var Ir = {}, Ot = {}, oi;
function Ed() {
  if (oi) return Ot;
  oi = 1, Object.defineProperty(Ot, "__esModule", { value: !0 }), Ot.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (Ot.DiscrError = e = {})), Ot;
}
var ii;
function wd() {
  if (ii) return Ir;
  ii = 1, Object.defineProperty(Ir, "__esModule", { value: !0 });
  const e = ee(), t = Ed(), s = qn(), r = Cn(), u = se(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: l } }) => a === t.DiscrError.Tag ? `tag "${l}" must be string` : `value of tag "${l}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: l, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${l}}`
    },
    code(a) {
      const { gen: l, data: d, schema: c, parentSchema: $, it: _ } = a, { oneOf: g } = $;
      if (!_.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!g)
        throw new Error("discriminator: requires oneOf keyword");
      const w = l.let("valid", !1), f = l.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      l.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(w);
      function y() {
        const E = p();
        l.if(!1);
        for (const m in E)
          l.elseIf((0, e._)`${f} === ${m}`), l.assign(w, o(E[m]));
        l.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), l.endIf();
      }
      function o(E) {
        const m = l.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: E }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var E;
        const m = {}, v = O($);
        let R = !0;
        for (let D = 0; D < g.length; D++) {
          let U = g[D];
          if (U?.$ref && !(0, u.schemaHasRulesButRef)(U, _.self.RULES)) {
            const M = U.$ref;
            if (U = s.resolveRef.call(_.self, _.schemaEnv.root, _.baseId, M), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(_.opts.uriResolver, _.baseId, M);
          }
          const z = (E = U?.properties) === null || E === void 0 ? void 0 : E[b];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          R = R && (v || O(U)), q(z, D);
        }
        if (!R)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function O({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function q(D, U) {
          if (D.const)
            V(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              V(z, U);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, U) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = U;
        }
      }
    }
  };
  return Ir.default = i, Ir;
}
var Or = {};
const bd = "https://json-schema.org/draft/2020-12/schema", Sd = "https://json-schema.org/draft/2020-12/schema", Rd = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Pd = "meta", Nd = "Core and Validation specifications meta-schema", Td = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], Id = ["object", "boolean"], Od = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", jd = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Ad = {
  $schema: bd,
  $id: Sd,
  $vocabulary: Rd,
  $dynamicAnchor: Pd,
  title: Nd,
  allOf: Td,
  type: Id,
  $comment: Od,
  properties: jd
}, kd = "https://json-schema.org/draft/2020-12/schema", Cd = "https://json-schema.org/draft/2020-12/meta/applicator", qd = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Dd = "meta", Md = "Applicator vocabulary meta-schema", Ld = ["object", "boolean"], Vd = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Fd = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Ud = {
  $schema: kd,
  $id: Cd,
  $vocabulary: qd,
  $dynamicAnchor: Dd,
  title: Md,
  type: Ld,
  properties: Vd,
  $defs: Fd
}, zd = "https://json-schema.org/draft/2020-12/schema", Gd = "https://json-schema.org/draft/2020-12/meta/unevaluated", Kd = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, Xd = "meta", Hd = "Unevaluated applicator vocabulary meta-schema", Bd = ["object", "boolean"], Jd = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, Wd = {
  $schema: zd,
  $id: Gd,
  $vocabulary: Kd,
  $dynamicAnchor: Xd,
  title: Hd,
  type: Bd,
  properties: Jd
}, Yd = "https://json-schema.org/draft/2020-12/schema", Qd = "https://json-schema.org/draft/2020-12/meta/content", Zd = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, xd = "meta", ef = "Content vocabulary meta-schema", tf = ["object", "boolean"], rf = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, nf = {
  $schema: Yd,
  $id: Qd,
  $vocabulary: Zd,
  $dynamicAnchor: xd,
  title: ef,
  type: tf,
  properties: rf
}, sf = "https://json-schema.org/draft/2020-12/schema", af = "https://json-schema.org/draft/2020-12/meta/core", of = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, cf = "meta", uf = "Core vocabulary meta-schema", lf = ["object", "boolean"], df = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, ff = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, hf = {
  $schema: sf,
  $id: af,
  $vocabulary: of,
  $dynamicAnchor: cf,
  title: uf,
  type: lf,
  properties: df,
  $defs: ff
}, mf = "https://json-schema.org/draft/2020-12/schema", pf = "https://json-schema.org/draft/2020-12/meta/format-annotation", yf = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, vf = "meta", _f = "Format vocabulary meta-schema for annotation results", gf = ["object", "boolean"], $f = { format: { type: "string" } }, Ef = {
  $schema: mf,
  $id: pf,
  $vocabulary: yf,
  $dynamicAnchor: vf,
  title: _f,
  type: gf,
  properties: $f
}, wf = "https://json-schema.org/draft/2020-12/schema", bf = "https://json-schema.org/draft/2020-12/meta/meta-data", Sf = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Rf = "meta", Pf = "Meta-data vocabulary meta-schema", Nf = ["object", "boolean"], Tf = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, If = {
  $schema: wf,
  $id: bf,
  $vocabulary: Sf,
  $dynamicAnchor: Rf,
  title: Pf,
  type: Nf,
  properties: Tf
}, Of = "https://json-schema.org/draft/2020-12/schema", jf = "https://json-schema.org/draft/2020-12/meta/validation", Af = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, kf = "meta", Cf = "Validation vocabulary meta-schema", qf = ["object", "boolean"], Df = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, Mf = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Lf = {
  $schema: Of,
  $id: jf,
  $vocabulary: Af,
  $dynamicAnchor: kf,
  title: Cf,
  type: qf,
  properties: Df,
  $defs: Mf
};
var ci;
function Vf() {
  if (ci) return Or;
  ci = 1, Object.defineProperty(Or, "__esModule", { value: !0 });
  const e = Ad, t = Ud, s = Wd, r = nf, u = hf, n = Ef, i = If, a = Lf, l = ["/properties"];
  function d(c) {
    return [
      e,
      t,
      s,
      r,
      u,
      $(this, n),
      i,
      $(this, a)
    ].forEach((_) => this.addMetaSchema(_, void 0, !1)), this;
    function $(_, g) {
      return c ? _.$dataMetaSchema(g, l) : g;
    }
  }
  return Or.default = d, Or;
}
var ui;
function Ff() {
  return ui || (ui = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const s = kl(), r = $d(), u = wd(), n = Vf(), i = "https://json-schema.org/draft/2020-12/schema";
    class a extends s.default {
      constructor(g = {}) {
        super({
          ...g,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((g) => this.addVocabulary(g)), this.opts.discriminator && this.addKeyword(u.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: g, meta: b } = this.opts;
        b && (n.default.call(this, g), this.refs["http://json-schema.org/schema"] = i);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
      }
    }
    t.Ajv2020 = a, e.exports = t = a, e.exports.Ajv2020 = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
    var l = kn();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var d = ee();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return d._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return d.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return d.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return d.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return d.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return d.CodeGen;
    } });
    var c = pa();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return c.default;
    } });
    var $ = Cn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return $.default;
    } });
  })(Dt, Dt.exports)), Dt.exports;
}
var Uf = Ff(), jr = { exports: {} }, as = {}, li;
function zf() {
  return li || (li = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(D, U) {
      return { validate: D, compare: U };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(n, i),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(l(!0), d),
      "date-time": t(_(!0), g),
      "iso-time": t(l(), c),
      "iso-date-time": t(_(), b),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: y,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: V,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: p,
      // signed 32 bit integer
      int32: { type: "number", validate: v },
      // signed 64 bit integer
      int64: { type: "number", validate: R },
      // C-type float
      float: { type: "number", validate: O },
      // C-type double
      double: { type: "number", validate: O },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, g),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, b),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function s(D) {
      return D % 4 === 0 && (D % 100 !== 0 || D % 400 === 0);
    }
    const r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, u = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function n(D) {
      const U = r.exec(D);
      if (!U)
        return !1;
      const z = +U[1], M = +U[2], F = +U[3];
      return M >= 1 && M <= 12 && F >= 1 && F <= (M === 2 && s(z) ? 29 : u[M]);
    }
    function i(D, U) {
      if (D && U)
        return D > U ? 1 : D < U ? -1 : 0;
    }
    const a = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function l(D) {
      return function(z) {
        const M = a.exec(z);
        if (!M)
          return !1;
        const F = +M[1], J = +M[2], B = +M[3], H = M[4], Y = M[5] === "-" ? -1 : 1, k = +(M[6] || 0), N = +(M[7] || 0);
        if (k > 23 || N > 59 || D && !H)
          return !1;
        if (F <= 23 && J <= 59 && B < 60)
          return !0;
        const A = J - N * Y, T = F - k * Y - (A < 0 ? 1 : 0);
        return (T === 23 || T === -1) && (A === 59 || A === -1) && B < 61;
      };
    }
    function d(D, U) {
      if (!(D && U))
        return;
      const z = (/* @__PURE__ */ new Date("2020-01-01T" + D)).valueOf(), M = (/* @__PURE__ */ new Date("2020-01-01T" + U)).valueOf();
      if (z && M)
        return z - M;
    }
    function c(D, U) {
      if (!(D && U))
        return;
      const z = a.exec(D), M = a.exec(U);
      if (z && M)
        return D = z[1] + z[2] + z[3], U = M[1] + M[2] + M[3], D > U ? 1 : D < U ? -1 : 0;
    }
    const $ = /t|\s/i;
    function _(D) {
      const U = l(D);
      return function(M) {
        const F = M.split($);
        return F.length === 2 && n(F[0]) && U(F[1]);
      };
    }
    function g(D, U) {
      if (!(D && U))
        return;
      const z = new Date(D).valueOf(), M = new Date(U).valueOf();
      if (z && M)
        return z - M;
    }
    function b(D, U) {
      if (!(D && U))
        return;
      const [z, M] = D.split($), [F, J] = U.split($), B = i(z, F);
      if (B !== void 0)
        return B || d(M, J);
    }
    const w = /\/|:/, f = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function y(D) {
      return w.test(D) && f.test(D);
    }
    const o = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function p(D) {
      return o.lastIndex = 0, o.test(D);
    }
    const E = -2147483648, m = 2 ** 31 - 1;
    function v(D) {
      return Number.isInteger(D) && D <= m && D >= E;
    }
    function R(D) {
      return Number.isInteger(D);
    }
    function O() {
      return !0;
    }
    const q = /[^\\]\\Z/;
    function V(D) {
      if (q.test(D))
        return !1;
      try {
        return new RegExp(D), !0;
      } catch {
        return !1;
      }
    }
  })(as)), as;
}
var os = {}, Ar = { exports: {} }, is = {}, He = {}, dt = {}, cs = {}, us = {}, ls = {}, di;
function Pn() {
  return di || (di = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class s extends t {
      constructor(o) {
        if (super(), !e.IDENTIFIER.test(o))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = s;
    class r extends t {
      constructor(o) {
        super(), this._items = typeof o == "string" ? [o] : o;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const o = this._items[0];
        return o === "" || o === '""';
      }
      get str() {
        var o;
        return (o = this._str) !== null && o !== void 0 ? o : this._str = this._items.reduce((p, E) => `${p}${E}`, "");
      }
      get names() {
        var o;
        return (o = this._names) !== null && o !== void 0 ? o : this._names = this._items.reduce((p, E) => (E instanceof s && (p[E.str] = (p[E.str] || 0) + 1), p), {});
      }
    }
    e._Code = r, e.nil = new r("");
    function u(y, ...o) {
      const p = [y[0]];
      let E = 0;
      for (; E < o.length; )
        a(p, o[E]), p.push(y[++E]);
      return new r(p);
    }
    e._ = u;
    const n = new r("+");
    function i(y, ...o) {
      const p = [g(y[0])];
      let E = 0;
      for (; E < o.length; )
        p.push(n), a(p, o[E]), p.push(n, g(y[++E]));
      return l(p), new r(p);
    }
    e.str = i;
    function a(y, o) {
      o instanceof r ? y.push(...o._items) : o instanceof s ? y.push(o) : y.push($(o));
    }
    e.addCodeArg = a;
    function l(y) {
      let o = 1;
      for (; o < y.length - 1; ) {
        if (y[o] === n) {
          const p = d(y[o - 1], y[o + 1]);
          if (p !== void 0) {
            y.splice(o - 1, 3, p);
            continue;
          }
          y[o++] = "+";
        }
        o++;
      }
    }
    function d(y, o) {
      if (o === '""')
        return y;
      if (y === '""')
        return o;
      if (typeof y == "string")
        return o instanceof s || y[y.length - 1] !== '"' ? void 0 : typeof o != "string" ? `${y.slice(0, -1)}${o}"` : o[0] === '"' ? y.slice(0, -1) + o.slice(1) : void 0;
      if (typeof o == "string" && o[0] === '"' && !(y instanceof s))
        return `"${y}${o.slice(1)}`;
    }
    function c(y, o) {
      return o.emptyStr() ? y : y.emptyStr() ? o : i`${y}${o}`;
    }
    e.strConcat = c;
    function $(y) {
      return typeof y == "number" || typeof y == "boolean" || y === null ? y : g(Array.isArray(y) ? y.join(",") : y);
    }
    function _(y) {
      return new r(g(y));
    }
    e.stringify = _;
    function g(y) {
      return JSON.stringify(y).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = g;
    function b(y) {
      return typeof y == "string" && e.IDENTIFIER.test(y) ? new r(`.${y}`) : u`[${y}]`;
    }
    e.getProperty = b;
    function w(y) {
      if (typeof y == "string" && e.IDENTIFIER.test(y))
        return new r(`${y}`);
      throw new Error(`CodeGen: invalid export name: ${y}, use explicit $id name mapping`);
    }
    e.getEsmExportName = w;
    function f(y) {
      return new r(y.toString());
    }
    e.regexpCode = f;
  })(ls)), ls;
}
var ds = {}, fi;
function hi() {
  return fi || (fi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Pn();
    class s extends Error {
      constructor(d) {
        super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
      }
    }
    var r;
    (function(l) {
      l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
    })(r || (e.UsedValueState = r = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class u {
      constructor({ prefixes: d, parent: c } = {}) {
        this._names = {}, this._prefixes = d, this._parent = c;
      }
      toName(d) {
        return d instanceof t.Name ? d : this.name(d);
      }
      name(d) {
        return new t.Name(this._newName(d));
      }
      _newName(d) {
        const c = this._names[d] || this._nameGroup(d);
        return `${d}${c.index++}`;
      }
      _nameGroup(d) {
        var c, $;
        if (!(($ = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || $ === void 0) && $.has(d) || this._prefixes && !this._prefixes.has(d))
          throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
        return this._names[d] = { prefix: d, index: 0 };
      }
    }
    e.Scope = u;
    class n extends t.Name {
      constructor(d, c) {
        super(c), this.prefix = d;
      }
      setValue(d, { property: c, itemIndex: $ }) {
        this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${$}]`;
      }
    }
    e.ValueScopeName = n;
    const i = (0, t._)`\n`;
    class a extends u {
      constructor(d) {
        super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(d) {
        return new n(d, this._newName(d));
      }
      value(d, c) {
        var $;
        if (c.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const _ = this.toName(d), { prefix: g } = _, b = ($ = c.key) !== null && $ !== void 0 ? $ : c.ref;
        let w = this._values[g];
        if (w) {
          const o = w.get(b);
          if (o)
            return o;
        } else
          w = this._values[g] = /* @__PURE__ */ new Map();
        w.set(b, _);
        const f = this._scope[g] || (this._scope[g] = []), y = f.length;
        return f[y] = c.ref, _.setValue(c, { property: g, itemIndex: y }), _;
      }
      getValue(d, c) {
        const $ = this._values[d];
        if ($)
          return $.get(c);
      }
      scopeRefs(d, c = this._values) {
        return this._reduceValues(c, ($) => {
          if ($.scopePath === void 0)
            throw new Error(`CodeGen: name "${$}" has no value`);
          return (0, t._)`${d}${$.scopePath}`;
        });
      }
      scopeCode(d = this._values, c, $) {
        return this._reduceValues(d, (_) => {
          if (_.value === void 0)
            throw new Error(`CodeGen: name "${_}" has no value`);
          return _.value.code;
        }, c, $);
      }
      _reduceValues(d, c, $ = {}, _) {
        let g = t.nil;
        for (const b in d) {
          const w = d[b];
          if (!w)
            continue;
          const f = $[b] = $[b] || /* @__PURE__ */ new Map();
          w.forEach((y) => {
            if (f.has(y))
              return;
            f.set(y, r.Started);
            let o = c(y);
            if (o) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              g = (0, t._)`${g}${p} ${y} = ${o};${this.opts._n}`;
            } else if (o = _?.(y))
              g = (0, t._)`${g}${o}${this.opts._n}`;
            else
              throw new s(y);
            f.set(y, r.Completed);
          });
        }
        return g;
      }
    }
    e.ValueScope = a;
  })(ds)), ds;
}
var mi;
function ne() {
  return mi || (mi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Pn(), s = hi();
    var r = Pn();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return r.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return r.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return r.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } });
    var u = hi();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return u.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return u.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return u.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return u.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class n {
      optimizeNodes() {
        return this;
      }
      optimizeNames(h, S) {
        return this;
      }
    }
    class i extends n {
      constructor(h, S, j) {
        super(), this.varKind = h, this.name = S, this.rhs = j;
      }
      render({ es5: h, _n: S }) {
        const j = h ? s.varKinds.var : this.varKind, G = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${j} ${this.name}${G};` + S;
      }
      optimizeNames(h, S) {
        if (h[this.name.str])
          return this.rhs && (this.rhs = M(this.rhs, h, S)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class a extends n {
      constructor(h, S, j) {
        super(), this.lhs = h, this.rhs = S, this.sideEffects = j;
      }
      render({ _n: h }) {
        return `${this.lhs} = ${this.rhs};` + h;
      }
      optimizeNames(h, S) {
        if (!(this.lhs instanceof t.Name && !h[this.lhs.str] && !this.sideEffects))
          return this.rhs = M(this.rhs, h, S), this;
      }
      get names() {
        const h = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return z(h, this.rhs);
      }
    }
    class l extends a {
      constructor(h, S, j, G) {
        super(h, j, G), this.op = S;
      }
      render({ _n: h }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + h;
      }
    }
    class d extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `${this.label}:` + h;
      }
    }
    class c extends n {
      constructor(h) {
        super(), this.label = h, this.names = {};
      }
      render({ _n: h }) {
        return `break${this.label ? ` ${this.label}` : ""};` + h;
      }
    }
    class $ extends n {
      constructor(h) {
        super(), this.error = h;
      }
      render({ _n: h }) {
        return `throw ${this.error};` + h;
      }
      get names() {
        return this.error.names;
      }
    }
    class _ extends n {
      constructor(h) {
        super(), this.code = h;
      }
      render({ _n: h }) {
        return `${this.code};` + h;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(h, S) {
        return this.code = M(this.code, h, S), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class g extends n {
      constructor(h = []) {
        super(), this.nodes = h;
      }
      render(h) {
        return this.nodes.reduce((S, j) => S + j.render(h), "");
      }
      optimizeNodes() {
        const { nodes: h } = this;
        let S = h.length;
        for (; S--; ) {
          const j = h[S].optimizeNodes();
          Array.isArray(j) ? h.splice(S, 1, ...j) : j ? h[S] = j : h.splice(S, 1);
        }
        return h.length > 0 ? this : void 0;
      }
      optimizeNames(h, S) {
        const { nodes: j } = this;
        let G = j.length;
        for (; G--; ) {
          const X = j[G];
          X.optimizeNames(h, S) || (F(h, X.names), j.splice(G, 1));
        }
        return j.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((h, S) => U(h, S.names), {});
      }
    }
    class b extends g {
      render(h) {
        return "{" + h._n + super.render(h) + "}" + h._n;
      }
    }
    class w extends g {
    }
    class f extends b {
    }
    f.kind = "else";
    class y extends b {
      constructor(h, S) {
        super(S), this.condition = h;
      }
      render(h) {
        let S = `if(${this.condition})` + super.render(h);
        return this.else && (S += "else " + this.else.render(h)), S;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const h = this.condition;
        if (h === !0)
          return this.nodes;
        let S = this.else;
        if (S) {
          const j = S.optimizeNodes();
          S = this.else = Array.isArray(j) ? new f(j) : j;
        }
        if (S)
          return h === !1 ? S instanceof y ? S : S.nodes : this.nodes.length ? this : new y(J(h), S instanceof y ? [S] : S.nodes);
        if (!(h === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(h, S) {
        var j;
        if (this.else = (j = this.else) === null || j === void 0 ? void 0 : j.optimizeNames(h, S), !!(super.optimizeNames(h, S) || this.else))
          return this.condition = M(this.condition, h, S), this;
      }
      get names() {
        const h = super.names;
        return z(h, this.condition), this.else && U(h, this.else.names), h;
      }
    }
    y.kind = "if";
    class o extends b {
    }
    o.kind = "for";
    class p extends o {
      constructor(h) {
        super(), this.iteration = h;
      }
      render(h) {
        return `for(${this.iteration})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iteration = M(this.iteration, h, S), this;
      }
      get names() {
        return U(super.names, this.iteration.names);
      }
    }
    class E extends o {
      constructor(h, S, j, G) {
        super(), this.varKind = h, this.name = S, this.from = j, this.to = G;
      }
      render(h) {
        const S = h.es5 ? s.varKinds.var : this.varKind, { name: j, from: G, to: X } = this;
        return `for(${S} ${j}=${G}; ${j}<${X}; ${j}++)` + super.render(h);
      }
      get names() {
        const h = z(super.names, this.from);
        return z(h, this.to);
      }
    }
    class m extends o {
      constructor(h, S, j, G) {
        super(), this.loop = h, this.varKind = S, this.name = j, this.iterable = G;
      }
      render(h) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(h);
      }
      optimizeNames(h, S) {
        if (super.optimizeNames(h, S))
          return this.iterable = M(this.iterable, h, S), this;
      }
      get names() {
        return U(super.names, this.iterable.names);
      }
    }
    class v extends b {
      constructor(h, S, j) {
        super(), this.name = h, this.args = S, this.async = j;
      }
      render(h) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(h);
      }
    }
    v.kind = "func";
    class R extends g {
      render(h) {
        return "return " + super.render(h);
      }
    }
    R.kind = "return";
    class O extends b {
      render(h) {
        let S = "try" + super.render(h);
        return this.catch && (S += this.catch.render(h)), this.finally && (S += this.finally.render(h)), S;
      }
      optimizeNodes() {
        var h, S;
        return super.optimizeNodes(), (h = this.catch) === null || h === void 0 || h.optimizeNodes(), (S = this.finally) === null || S === void 0 || S.optimizeNodes(), this;
      }
      optimizeNames(h, S) {
        var j, G;
        return super.optimizeNames(h, S), (j = this.catch) === null || j === void 0 || j.optimizeNames(h, S), (G = this.finally) === null || G === void 0 || G.optimizeNames(h, S), this;
      }
      get names() {
        const h = super.names;
        return this.catch && U(h, this.catch.names), this.finally && U(h, this.finally.names), h;
      }
    }
    class q extends b {
      constructor(h) {
        super(), this.error = h;
      }
      render(h) {
        return `catch(${this.error})` + super.render(h);
      }
    }
    q.kind = "catch";
    class V extends b {
      render(h) {
        return "finally" + super.render(h);
      }
    }
    V.kind = "finally";
    class D {
      constructor(h, S = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...S, _n: S.lines ? `
` : "" }, this._extScope = h, this._scope = new s.Scope({ parent: h }), this._nodes = [new w()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(h) {
        return this._scope.name(h);
      }
      // reserves unique name in the external scope
      scopeName(h) {
        return this._extScope.name(h);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(h, S) {
        const j = this._extScope.value(h, S);
        return (this._values[j.prefix] || (this._values[j.prefix] = /* @__PURE__ */ new Set())).add(j), j;
      }
      getScopeValue(h, S) {
        return this._extScope.getValue(h, S);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(h) {
        return this._extScope.scopeRefs(h, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(h, S, j, G) {
        const X = this._scope.toName(S);
        return j !== void 0 && G && (this._constants[X.str] = j), this._leafNode(new i(h, X, j)), X;
      }
      // `const` declaration (`var` in es5 mode)
      const(h, S, j) {
        return this._def(s.varKinds.const, h, S, j);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(h, S, j) {
        return this._def(s.varKinds.let, h, S, j);
      }
      // `var` declaration with optional assignment
      var(h, S, j) {
        return this._def(s.varKinds.var, h, S, j);
      }
      // assignment code
      assign(h, S, j) {
        return this._leafNode(new a(h, S, j));
      }
      // `+=` code
      add(h, S) {
        return this._leafNode(new l(h, e.operators.ADD, S));
      }
      // appends passed SafeExpr to code or executes Block
      code(h) {
        return typeof h == "function" ? h() : h !== t.nil && this._leafNode(new _(h)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...h) {
        const S = ["{"];
        for (const [j, G] of h)
          S.length > 1 && S.push(","), S.push(j), (j !== G || this.opts.es5) && (S.push(":"), (0, t.addCodeArg)(S, G));
        return S.push("}"), new t._Code(S);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(h, S, j) {
        if (this._blockNode(new y(h)), S && j)
          this.code(S).else().code(j).endIf();
        else if (S)
          this.code(S).endIf();
        else if (j)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(h) {
        return this._elseNode(new y(h));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new f());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(y, f);
      }
      _for(h, S) {
        return this._blockNode(h), S && this.code(S).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(h, S) {
        return this._for(new p(h), S);
      }
      // `for` statement for a range of values
      forRange(h, S, j, G, X = this.opts.es5 ? s.varKinds.var : s.varKinds.let) {
        const Z = this._scope.toName(h);
        return this._for(new E(X, Z, S, j), () => G(Z));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(h, S, j, G = s.varKinds.const) {
        const X = this._scope.toName(h);
        if (this.opts.es5) {
          const Z = S instanceof t.Name ? S : this.var("_arr", S);
          return this.forRange("_i", 0, (0, t._)`${Z}.length`, (Q) => {
            this.var(X, (0, t._)`${Z}[${Q}]`), j(X);
          });
        }
        return this._for(new m("of", G, X, S), () => j(X));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(h, S, j, G = this.opts.es5 ? s.varKinds.var : s.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(h, (0, t._)`Object.keys(${S})`, j);
        const X = this._scope.toName(h);
        return this._for(new m("in", G, X, S), () => j(X));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(o);
      }
      // `label` statement
      label(h) {
        return this._leafNode(new d(h));
      }
      // `break` statement
      break(h) {
        return this._leafNode(new c(h));
      }
      // `return` statement
      return(h) {
        const S = new R();
        if (this._blockNode(S), this.code(h), S.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(R);
      }
      // `try` statement
      try(h, S, j) {
        if (!S && !j)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const G = new O();
        if (this._blockNode(G), this.code(h), S) {
          const X = this.name("e");
          this._currNode = G.catch = new q(X), S(X);
        }
        return j && (this._currNode = G.finally = new V(), this.code(j)), this._endBlockNode(q, V);
      }
      // `throw` statement
      throw(h) {
        return this._leafNode(new $(h));
      }
      // start self-balancing block
      block(h, S) {
        return this._blockStarts.push(this._nodes.length), h && this.code(h).endBlock(S), this;
      }
      // end the current self-balancing block
      endBlock(h) {
        const S = this._blockStarts.pop();
        if (S === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const j = this._nodes.length - S;
        if (j < 0 || h !== void 0 && j !== h)
          throw new Error(`CodeGen: wrong number of nodes: ${j} vs ${h} expected`);
        return this._nodes.length = S, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(h, S = t.nil, j, G) {
        return this._blockNode(new v(h, S, j)), G && this.code(G).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(v);
      }
      optimize(h = 1) {
        for (; h-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(h) {
        return this._currNode.nodes.push(h), this;
      }
      _blockNode(h) {
        this._currNode.nodes.push(h), this._nodes.push(h);
      }
      _endBlockNode(h, S) {
        const j = this._currNode;
        if (j instanceof h || S && j instanceof S)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${S ? `${h.kind}/${S.kind}` : h.kind}"`);
      }
      _elseNode(h) {
        const S = this._currNode;
        if (!(S instanceof y))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = S.else = h, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const h = this._nodes;
        return h[h.length - 1];
      }
      set _currNode(h) {
        const S = this._nodes;
        S[S.length - 1] = h;
      }
    }
    e.CodeGen = D;
    function U(T, h) {
      for (const S in h)
        T[S] = (T[S] || 0) + (h[S] || 0);
      return T;
    }
    function z(T, h) {
      return h instanceof t._CodeOrName ? U(T, h.names) : T;
    }
    function M(T, h, S) {
      if (T instanceof t.Name)
        return j(T);
      if (!G(T))
        return T;
      return new t._Code(T._items.reduce((X, Z) => (Z instanceof t.Name && (Z = j(Z)), Z instanceof t._Code ? X.push(...Z._items) : X.push(Z), X), []));
      function j(X) {
        const Z = S[X.str];
        return Z === void 0 || h[X.str] !== 1 ? X : (delete h[X.str], Z);
      }
      function G(X) {
        return X instanceof t._Code && X._items.some((Z) => Z instanceof t.Name && h[Z.str] === 1 && S[Z.str] !== void 0);
      }
    }
    function F(T, h) {
      for (const S in h)
        T[S] = (T[S] || 0) - (h[S] || 0);
    }
    function J(T) {
      return typeof T == "boolean" || typeof T == "number" || T === null ? !T : (0, t._)`!${A(T)}`;
    }
    e.not = J;
    const B = N(e.operators.AND);
    function H(...T) {
      return T.reduce(B);
    }
    e.and = H;
    const Y = N(e.operators.OR);
    function k(...T) {
      return T.reduce(Y);
    }
    e.or = k;
    function N(T) {
      return (h, S) => h === t.nil ? S : S === t.nil ? h : (0, t._)`${A(h)} ${T} ${A(S)}`;
    }
    function A(T) {
      return T instanceof t.Name ? T : (0, t._)`(${T})`;
    }
  })(us)), us;
}
var re = {}, pi;
function ie() {
  if (pi) return re;
  pi = 1, Object.defineProperty(re, "__esModule", { value: !0 }), re.checkStrictMode = re.getErrorPath = re.Type = re.useFunc = re.setEvaluated = re.evaluatedPropsToName = re.mergeEvaluated = re.eachItem = re.unescapeJsonPointer = re.escapeJsonPointer = re.escapeFragment = re.unescapeFragment = re.schemaRefOrVal = re.schemaHasRulesButRef = re.schemaHasRules = re.checkUnknownRules = re.alwaysValidSchema = re.toHash = void 0;
  const e = ne(), t = Pn();
  function s(m) {
    const v = {};
    for (const R of m)
      v[R] = !0;
    return v;
  }
  re.toHash = s;
  function r(m, v) {
    return typeof v == "boolean" ? v : Object.keys(v).length === 0 ? !0 : (u(m, v), !n(v, m.self.RULES.all));
  }
  re.alwaysValidSchema = r;
  function u(m, v = m.schema) {
    const { opts: R, self: O } = m;
    if (!R.strictSchema || typeof v == "boolean")
      return;
    const q = O.RULES.keywords;
    for (const V in v)
      q[V] || E(m, `unknown keyword: "${V}"`);
  }
  re.checkUnknownRules = u;
  function n(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (v[R])
        return !0;
    return !1;
  }
  re.schemaHasRules = n;
  function i(m, v) {
    if (typeof m == "boolean")
      return !m;
    for (const R in m)
      if (R !== "$ref" && v.all[R])
        return !0;
    return !1;
  }
  re.schemaHasRulesButRef = i;
  function a({ topSchemaRef: m, schemaPath: v }, R, O, q) {
    if (!q) {
      if (typeof R == "number" || typeof R == "boolean")
        return R;
      if (typeof R == "string")
        return (0, e._)`${R}`;
    }
    return (0, e._)`${m}${v}${(0, e.getProperty)(O)}`;
  }
  re.schemaRefOrVal = a;
  function l(m) {
    return $(decodeURIComponent(m));
  }
  re.unescapeFragment = l;
  function d(m) {
    return encodeURIComponent(c(m));
  }
  re.escapeFragment = d;
  function c(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  re.escapeJsonPointer = c;
  function $(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  re.unescapeJsonPointer = $;
  function _(m, v) {
    if (Array.isArray(m))
      for (const R of m)
        v(R);
    else
      v(m);
  }
  re.eachItem = _;
  function g({ mergeNames: m, mergeToName: v, mergeValues: R, resultToName: O }) {
    return (q, V, D, U) => {
      const z = D === void 0 ? V : D instanceof e.Name ? (V instanceof e.Name ? m(q, V, D) : v(q, V, D), D) : V instanceof e.Name ? (v(q, D, V), V) : R(V, D);
      return U === e.Name && !(z instanceof e.Name) ? O(q, z) : z;
    };
  }
  re.mergeEvaluated = {
    props: g({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => {
        m.if((0, e._)`${v} === true`, () => m.assign(R, !0), () => m.assign(R, (0, e._)`${R} || {}`).code((0, e._)`Object.assign(${R}, ${v})`));
      }),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => {
        v === !0 ? m.assign(R, !0) : (m.assign(R, (0, e._)`${R} || {}`), w(m, R, v));
      }),
      mergeValues: (m, v) => m === !0 ? !0 : { ...m, ...v },
      resultToName: b
    }),
    items: g({
      mergeNames: (m, v, R) => m.if((0, e._)`${R} !== true && ${v} !== undefined`, () => m.assign(R, (0, e._)`${v} === true ? true : ${R} > ${v} ? ${R} : ${v}`)),
      mergeToName: (m, v, R) => m.if((0, e._)`${R} !== true`, () => m.assign(R, v === !0 ? !0 : (0, e._)`${R} > ${v} ? ${R} : ${v}`)),
      mergeValues: (m, v) => m === !0 ? !0 : Math.max(m, v),
      resultToName: (m, v) => m.var("items", v)
    })
  };
  function b(m, v) {
    if (v === !0)
      return m.var("props", !0);
    const R = m.var("props", (0, e._)`{}`);
    return v !== void 0 && w(m, R, v), R;
  }
  re.evaluatedPropsToName = b;
  function w(m, v, R) {
    Object.keys(R).forEach((O) => m.assign((0, e._)`${v}${(0, e.getProperty)(O)}`, !0));
  }
  re.setEvaluated = w;
  const f = {};
  function y(m, v) {
    return m.scopeValue("func", {
      ref: v,
      code: f[v.code] || (f[v.code] = new t._Code(v.code))
    });
  }
  re.useFunc = y;
  var o;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(o || (re.Type = o = {}));
  function p(m, v, R) {
    if (m instanceof e.Name) {
      const O = v === o.Num;
      return R ? O ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : O ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return R ? (0, e.getProperty)(m).toString() : "/" + c(m);
  }
  re.getErrorPath = p;
  function E(m, v, R = m.opts.strictSchema) {
    if (R) {
      if (v = `strict mode: ${v}`, R === !0)
        throw new Error(v);
      m.self.logger.warn(v);
    }
  }
  return re.checkStrictMode = E, re;
}
var kr = {}, yi;
function nt() {
  if (yi) return kr;
  yi = 1, Object.defineProperty(kr, "__esModule", { value: !0 });
  const e = ne(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return kr.default = t, kr;
}
var vi;
function Dn() {
  return vi || (vi = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = ne(), s = ie(), r = nt();
    e.keywordError = {
      message: ({ keyword: f }) => (0, t.str)`must pass "${f}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: f, schemaType: y }) => y ? (0, t.str)`"${f}" keyword must be ${y} ($data)` : (0, t.str)`"${f}" keyword is invalid ($data)`
    };
    function u(f, y = e.keywordError, o, p) {
      const { it: E } = f, { gen: m, compositeRule: v, allErrors: R } = E, O = $(f, y, o);
      p ?? (v || R) ? l(m, O) : d(E, (0, t._)`[${O}]`);
    }
    e.reportError = u;
    function n(f, y = e.keywordError, o) {
      const { it: p } = f, { gen: E, compositeRule: m, allErrors: v } = p, R = $(f, y, o);
      l(E, R), m || v || d(p, r.default.vErrors);
    }
    e.reportExtraError = n;
    function i(f, y) {
      f.assign(r.default.errors, y), f.if((0, t._)`${r.default.vErrors} !== null`, () => f.if(y, () => f.assign((0, t._)`${r.default.vErrors}.length`, y), () => f.assign(r.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function a({ gen: f, keyword: y, schemaValue: o, data: p, errsCount: E, it: m }) {
      if (E === void 0)
        throw new Error("ajv implementation error");
      const v = f.name("err");
      f.forRange("i", E, r.default.errors, (R) => {
        f.const(v, (0, t._)`${r.default.vErrors}[${R}]`), f.if((0, t._)`${v}.instancePath === undefined`, () => f.assign((0, t._)`${v}.instancePath`, (0, t.strConcat)(r.default.instancePath, m.errorPath))), f.assign((0, t._)`${v}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${y}`), m.opts.verbose && (f.assign((0, t._)`${v}.schema`, o), f.assign((0, t._)`${v}.data`, p));
      });
    }
    e.extendErrors = a;
    function l(f, y) {
      const o = f.const("err", y);
      f.if((0, t._)`${r.default.vErrors} === null`, () => f.assign(r.default.vErrors, (0, t._)`[${o}]`), (0, t._)`${r.default.vErrors}.push(${o})`), f.code((0, t._)`${r.default.errors}++`);
    }
    function d(f, y) {
      const { gen: o, validateName: p, schemaEnv: E } = f;
      E.$async ? o.throw((0, t._)`new ${f.ValidationError}(${y})`) : (o.assign((0, t._)`${p}.errors`, y), o.return(!1));
    }
    const c = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function $(f, y, o) {
      const { createErrors: p } = f.it;
      return p === !1 ? (0, t._)`{}` : _(f, y, o);
    }
    function _(f, y, o = {}) {
      const { gen: p, it: E } = f, m = [
        g(E, o),
        b(f, o)
      ];
      return w(f, y, m), p.object(...m);
    }
    function g({ errorPath: f }, { instancePath: y }) {
      const o = y ? (0, t.str)`${f}${(0, s.getErrorPath)(y, s.Type.Str)}` : f;
      return [r.default.instancePath, (0, t.strConcat)(r.default.instancePath, o)];
    }
    function b({ keyword: f, it: { errSchemaPath: y } }, { schemaPath: o, parentSchema: p }) {
      let E = p ? y : (0, t.str)`${y}/${f}`;
      return o && (E = (0, t.str)`${E}${(0, s.getErrorPath)(o, s.Type.Str)}`), [c.schemaPath, E];
    }
    function w(f, { params: y, message: o }, p) {
      const { keyword: E, data: m, schemaValue: v, it: R } = f, { opts: O, propertyName: q, topSchemaRef: V, schemaPath: D } = R;
      p.push([c.keyword, E], [c.params, typeof y == "function" ? y(f) : y || (0, t._)`{}`]), O.messages && p.push([c.message, typeof o == "function" ? o(f) : o]), O.verbose && p.push([c.schema, v], [c.parentSchema, (0, t._)`${V}${D}`], [r.default.data, m]), q && p.push([c.propertyName, q]);
    }
  })(cs)), cs;
}
var _i;
function Gf() {
  if (_i) return dt;
  _i = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.boolOrEmptySchema = dt.topBoolOrEmptySchema = void 0;
  const e = Dn(), t = ne(), s = nt(), r = {
    message: "boolean schema is false"
  };
  function u(a) {
    const { gen: l, schema: d, validateName: c } = a;
    d === !1 ? i(a, !1) : typeof d == "object" && d.$async === !0 ? l.return(s.default.data) : (l.assign((0, t._)`${c}.errors`, null), l.return(!0));
  }
  dt.topBoolOrEmptySchema = u;
  function n(a, l) {
    const { gen: d, schema: c } = a;
    c === !1 ? (d.var(l, !1), i(a)) : d.var(l, !0);
  }
  dt.boolOrEmptySchema = n;
  function i(a, l) {
    const { gen: d, data: c } = a, $ = {
      gen: d,
      keyword: "false schema",
      data: c,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: a
    };
    (0, e.reportError)($, r, void 0, l);
  }
  return dt;
}
var ge = {}, ft = {}, gi;
function Mu() {
  if (gi) return ft;
  gi = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.getRules = ft.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function s(u) {
    return typeof u == "string" && t.has(u);
  }
  ft.isJSONType = s;
  function r() {
    const u = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...u, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, u.number, u.string, u.array, u.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return ft.getRules = r, ft;
}
var Be = {}, $i;
function Lu() {
  if ($i) return Be;
  $i = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.shouldUseRule = Be.shouldUseGroup = Be.schemaHasRulesForType = void 0;
  function e({ schema: r, self: u }, n) {
    const i = u.RULES.types[n];
    return i && i !== !0 && t(r, i);
  }
  Be.schemaHasRulesForType = e;
  function t(r, u) {
    return u.rules.some((n) => s(r, n));
  }
  Be.shouldUseGroup = t;
  function s(r, u) {
    var n;
    return r[u.keyword] !== void 0 || ((n = u.definition.implements) === null || n === void 0 ? void 0 : n.some((i) => r[i] !== void 0));
  }
  return Be.shouldUseRule = s, Be;
}
var Ei;
function Nn() {
  if (Ei) return ge;
  Ei = 1, Object.defineProperty(ge, "__esModule", { value: !0 }), ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
  const e = Mu(), t = Lu(), s = Dn(), r = ne(), u = ie();
  var n;
  (function(o) {
    o[o.Correct = 0] = "Correct", o[o.Wrong = 1] = "Wrong";
  })(n || (ge.DataType = n = {}));
  function i(o) {
    const p = a(o.type);
    if (p.includes("null")) {
      if (o.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && o.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      o.nullable === !0 && p.push("null");
    }
    return p;
  }
  ge.getSchemaTypes = i;
  function a(o) {
    const p = Array.isArray(o) ? o : o ? [o] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ge.getJSONTypes = a;
  function l(o, p) {
    const { gen: E, data: m, opts: v } = o, R = c(p, v.coerceTypes), O = p.length > 0 && !(R.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(o, p[0]));
    if (O) {
      const q = b(p, m, v.strictNumbers, n.Wrong);
      E.if(q, () => {
        R.length ? $(o, p, R) : f(o);
      });
    }
    return O;
  }
  ge.coerceAndCheckDataType = l;
  const d = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function c(o, p) {
    return p ? o.filter((E) => d.has(E) || p === "array" && E === "array") : [];
  }
  function $(o, p, E) {
    const { gen: m, data: v, opts: R } = o, O = m.let("dataType", (0, r._)`typeof ${v}`), q = m.let("coerced", (0, r._)`undefined`);
    R.coerceTypes === "array" && m.if((0, r._)`${O} == 'object' && Array.isArray(${v}) && ${v}.length == 1`, () => m.assign(v, (0, r._)`${v}[0]`).assign(O, (0, r._)`typeof ${v}`).if(b(p, v, R.strictNumbers), () => m.assign(q, v))), m.if((0, r._)`${q} !== undefined`);
    for (const D of E)
      (d.has(D) || D === "array" && R.coerceTypes === "array") && V(D);
    m.else(), f(o), m.endIf(), m.if((0, r._)`${q} !== undefined`, () => {
      m.assign(v, q), _(o, q);
    });
    function V(D) {
      switch (D) {
        case "string":
          m.elseIf((0, r._)`${O} == "number" || ${O} == "boolean"`).assign(q, (0, r._)`"" + ${v}`).elseIf((0, r._)`${v} === null`).assign(q, (0, r._)`""`);
          return;
        case "number":
          m.elseIf((0, r._)`${O} == "boolean" || ${v} === null
              || (${O} == "string" && ${v} && ${v} == +${v})`).assign(q, (0, r._)`+${v}`);
          return;
        case "integer":
          m.elseIf((0, r._)`${O} === "boolean" || ${v} === null
              || (${O} === "string" && ${v} && ${v} == +${v} && !(${v} % 1))`).assign(q, (0, r._)`+${v}`);
          return;
        case "boolean":
          m.elseIf((0, r._)`${v} === "false" || ${v} === 0 || ${v} === null`).assign(q, !1).elseIf((0, r._)`${v} === "true" || ${v} === 1`).assign(q, !0);
          return;
        case "null":
          m.elseIf((0, r._)`${v} === "" || ${v} === 0 || ${v} === false`), m.assign(q, null);
          return;
        case "array":
          m.elseIf((0, r._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${v} === null`).assign(q, (0, r._)`[${v}]`);
      }
    }
  }
  function _({ gen: o, parentData: p, parentDataProperty: E }, m) {
    o.if((0, r._)`${p} !== undefined`, () => o.assign((0, r._)`${p}[${E}]`, m));
  }
  function g(o, p, E, m = n.Correct) {
    const v = m === n.Correct ? r.operators.EQ : r.operators.NEQ;
    let R;
    switch (o) {
      case "null":
        return (0, r._)`${p} ${v} null`;
      case "array":
        R = (0, r._)`Array.isArray(${p})`;
        break;
      case "object":
        R = (0, r._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        R = O((0, r._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        R = O();
        break;
      default:
        return (0, r._)`typeof ${p} ${v} ${o}`;
    }
    return m === n.Correct ? R : (0, r.not)(R);
    function O(q = r.nil) {
      return (0, r.and)((0, r._)`typeof ${p} == "number"`, q, E ? (0, r._)`isFinite(${p})` : r.nil);
    }
  }
  ge.checkDataType = g;
  function b(o, p, E, m) {
    if (o.length === 1)
      return g(o[0], p, E, m);
    let v;
    const R = (0, u.toHash)(o);
    if (R.array && R.object) {
      const O = (0, r._)`typeof ${p} != "object"`;
      v = R.null ? O : (0, r._)`!${p} || ${O}`, delete R.null, delete R.array, delete R.object;
    } else
      v = r.nil;
    R.number && delete R.integer;
    for (const O in R)
      v = (0, r.and)(v, g(O, p, E, m));
    return v;
  }
  ge.checkDataTypes = b;
  const w = {
    message: ({ schema: o }) => `must be ${o}`,
    params: ({ schema: o, schemaValue: p }) => typeof o == "string" ? (0, r._)`{type: ${o}}` : (0, r._)`{type: ${p}}`
  };
  function f(o) {
    const p = y(o);
    (0, s.reportError)(p, w);
  }
  ge.reportTypeError = f;
  function y(o) {
    const { gen: p, data: E, schema: m } = o, v = (0, u.schemaRefOrVal)(o, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: E,
      schema: m.type,
      schemaCode: v,
      schemaValue: v,
      parentSchema: m,
      params: {},
      it: o
    };
  }
  return ge;
}
var jt = {}, wi;
function Kf() {
  if (wi) return jt;
  wi = 1, Object.defineProperty(jt, "__esModule", { value: !0 }), jt.assignDefaults = void 0;
  const e = ne(), t = ie();
  function s(u, n) {
    const { properties: i, items: a } = u.schema;
    if (n === "object" && i)
      for (const l in i)
        r(u, l, i[l].default);
    else n === "array" && Array.isArray(a) && a.forEach((l, d) => r(u, d, l.default));
  }
  jt.assignDefaults = s;
  function r(u, n, i) {
    const { gen: a, compositeRule: l, data: d, opts: c } = u;
    if (i === void 0)
      return;
    const $ = (0, e._)`${d}${(0, e.getProperty)(n)}`;
    if (l) {
      (0, t.checkStrictMode)(u, `default is ignored for: ${$}`);
      return;
    }
    let _ = (0, e._)`${$} === undefined`;
    c.useDefaults === "empty" && (_ = (0, e._)`${_} || ${$} === null || ${$} === ""`), a.if(_, (0, e._)`${$} = ${(0, e.stringify)(i)}`);
  }
  return jt;
}
var Ce = {}, fe = {}, bi;
function Le() {
  if (bi) return fe;
  bi = 1, Object.defineProperty(fe, "__esModule", { value: !0 }), fe.validateUnion = fe.validateArray = fe.usePattern = fe.callValidateCode = fe.schemaProperties = fe.allSchemaProperties = fe.noPropertyInData = fe.propertyInData = fe.isOwnProperty = fe.hasPropFunc = fe.reportMissingProp = fe.checkMissingProp = fe.checkReportMissingProp = void 0;
  const e = ne(), t = ie(), s = nt(), r = ie();
  function u(o, p) {
    const { gen: E, data: m, it: v } = o;
    E.if(c(E, m, p, v.opts.ownProperties), () => {
      o.setParams({ missingProperty: (0, e._)`${p}` }, !0), o.error();
    });
  }
  fe.checkReportMissingProp = u;
  function n({ gen: o, data: p, it: { opts: E } }, m, v) {
    return (0, e.or)(...m.map((R) => (0, e.and)(c(o, p, R, E.ownProperties), (0, e._)`${v} = ${R}`)));
  }
  fe.checkMissingProp = n;
  function i(o, p) {
    o.setParams({ missingProperty: p }, !0), o.error();
  }
  fe.reportMissingProp = i;
  function a(o) {
    return o.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  fe.hasPropFunc = a;
  function l(o, p, E) {
    return (0, e._)`${a(o)}.call(${p}, ${E})`;
  }
  fe.isOwnProperty = l;
  function d(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} !== undefined`;
    return m ? (0, e._)`${v} && ${l(o, p, E)}` : v;
  }
  fe.propertyInData = d;
  function c(o, p, E, m) {
    const v = (0, e._)`${p}${(0, e.getProperty)(E)} === undefined`;
    return m ? (0, e.or)(v, (0, e.not)(l(o, p, E))) : v;
  }
  fe.noPropertyInData = c;
  function $(o) {
    return o ? Object.keys(o).filter((p) => p !== "__proto__") : [];
  }
  fe.allSchemaProperties = $;
  function _(o, p) {
    return $(p).filter((E) => !(0, t.alwaysValidSchema)(o, p[E]));
  }
  fe.schemaProperties = _;
  function g({ schemaCode: o, data: p, it: { gen: E, topSchemaRef: m, schemaPath: v, errorPath: R }, it: O }, q, V, D) {
    const U = D ? (0, e._)`${o}, ${p}, ${m}${v}` : p, z = [
      [s.default.instancePath, (0, e.strConcat)(s.default.instancePath, R)],
      [s.default.parentData, O.parentData],
      [s.default.parentDataProperty, O.parentDataProperty],
      [s.default.rootData, s.default.rootData]
    ];
    O.opts.dynamicRef && z.push([s.default.dynamicAnchors, s.default.dynamicAnchors]);
    const M = (0, e._)`${U}, ${E.object(...z)}`;
    return V !== e.nil ? (0, e._)`${q}.call(${V}, ${M})` : (0, e._)`${q}(${M})`;
  }
  fe.callValidateCode = g;
  const b = (0, e._)`new RegExp`;
  function w({ gen: o, it: { opts: p } }, E) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: v } = p.code, R = v(E, m);
    return o.scopeValue("pattern", {
      key: R.toString(),
      ref: R,
      code: (0, e._)`${v.code === "new RegExp" ? b : (0, r.useFunc)(o, v)}(${E}, ${m})`
    });
  }
  fe.usePattern = w;
  function f(o) {
    const { gen: p, data: E, keyword: m, it: v } = o, R = p.name("valid");
    if (v.allErrors) {
      const q = p.let("valid", !0);
      return O(() => p.assign(q, !1)), q;
    }
    return p.var(R, !0), O(() => p.break()), R;
    function O(q) {
      const V = p.const("len", (0, e._)`${E}.length`);
      p.forRange("i", 0, V, (D) => {
        o.subschema({
          keyword: m,
          dataProp: D,
          dataPropType: t.Type.Num
        }, R), p.if((0, e.not)(R), q);
      });
    }
  }
  fe.validateArray = f;
  function y(o) {
    const { gen: p, schema: E, keyword: m, it: v } = o;
    if (!Array.isArray(E))
      throw new Error("ajv implementation error");
    if (E.some((V) => (0, t.alwaysValidSchema)(v, V)) && !v.opts.unevaluated)
      return;
    const O = p.let("valid", !1), q = p.name("_valid");
    p.block(() => E.forEach((V, D) => {
      const U = o.subschema({
        keyword: m,
        schemaProp: D,
        compositeRule: !0
      }, q);
      p.assign(O, (0, e._)`${O} || ${q}`), o.mergeValidEvaluated(U, q) || p.if((0, e.not)(O));
    })), o.result(O, () => o.reset(), () => o.error(!0));
  }
  return fe.validateUnion = y, fe;
}
var Si;
function Xf() {
  if (Si) return Ce;
  Si = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.validateKeywordUsage = Ce.validSchemaType = Ce.funcKeywordCode = Ce.macroKeywordCode = void 0;
  const e = ne(), t = nt(), s = Le(), r = Dn();
  function u(_, g) {
    const { gen: b, keyword: w, schema: f, parentSchema: y, it: o } = _, p = g.macro.call(o.self, f, y, o), E = d(b, w, p);
    o.opts.validateSchema !== !1 && o.self.validateSchema(p, !0);
    const m = b.name("valid");
    _.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${o.errSchemaPath}/${w}`,
      topSchemaRef: E,
      compositeRule: !0
    }, m), _.pass(m, () => _.error(!0));
  }
  Ce.macroKeywordCode = u;
  function n(_, g) {
    var b;
    const { gen: w, keyword: f, schema: y, parentSchema: o, $data: p, it: E } = _;
    l(E, g);
    const m = !p && g.compile ? g.compile.call(E.self, y, o, E) : g.validate, v = d(w, f, m), R = w.let("valid");
    _.block$data(R, O), _.ok((b = g.valid) !== null && b !== void 0 ? b : R);
    function O() {
      if (g.errors === !1)
        D(), g.modifying && i(_), U(() => _.error());
      else {
        const z = g.async ? q() : V();
        g.modifying && i(_), U(() => a(_, z));
      }
    }
    function q() {
      const z = w.let("ruleErrs", null);
      return w.try(() => D((0, e._)`await `), (M) => w.assign(R, !1).if((0, e._)`${M} instanceof ${E.ValidationError}`, () => w.assign(z, (0, e._)`${M}.errors`), () => w.throw(M))), z;
    }
    function V() {
      const z = (0, e._)`${v}.errors`;
      return w.assign(z, null), D(e.nil), z;
    }
    function D(z = g.async ? (0, e._)`await ` : e.nil) {
      const M = E.opts.passContext ? t.default.this : t.default.self, F = !("compile" in g && !p || g.schema === !1);
      w.assign(R, (0, e._)`${z}${(0, s.callValidateCode)(_, v, M, F)}`, g.modifying);
    }
    function U(z) {
      var M;
      w.if((0, e.not)((M = g.valid) !== null && M !== void 0 ? M : R), z);
    }
  }
  Ce.funcKeywordCode = n;
  function i(_) {
    const { gen: g, data: b, it: w } = _;
    g.if(w.parentData, () => g.assign(b, (0, e._)`${w.parentData}[${w.parentDataProperty}]`));
  }
  function a(_, g) {
    const { gen: b } = _;
    b.if((0, e._)`Array.isArray(${g})`, () => {
      b.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${g} : ${t.default.vErrors}.concat(${g})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, r.extendErrors)(_);
    }, () => _.error());
  }
  function l({ schemaEnv: _ }, g) {
    if (g.async && !_.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(_, g, b) {
    if (b === void 0)
      throw new Error(`keyword "${g}" failed to compile`);
    return _.scopeValue("keyword", typeof b == "function" ? { ref: b } : { ref: b, code: (0, e.stringify)(b) });
  }
  function c(_, g, b = !1) {
    return !g.length || g.some((w) => w === "array" ? Array.isArray(_) : w === "object" ? _ && typeof _ == "object" && !Array.isArray(_) : typeof _ == w || b && typeof _ > "u");
  }
  Ce.validSchemaType = c;
  function $({ schema: _, opts: g, self: b, errSchemaPath: w }, f, y) {
    if (Array.isArray(f.keyword) ? !f.keyword.includes(y) : f.keyword !== y)
      throw new Error("ajv implementation error");
    const o = f.dependencies;
    if (o?.some((p) => !Object.prototype.hasOwnProperty.call(_, p)))
      throw new Error(`parent schema must have dependencies of ${y}: ${o.join(",")}`);
    if (f.validateSchema && !f.validateSchema(_[y])) {
      const E = `keyword "${y}" value is invalid at path "${w}": ` + b.errorsText(f.validateSchema.errors);
      if (g.validateSchema === "log")
        b.logger.error(E);
      else
        throw new Error(E);
    }
  }
  return Ce.validateKeywordUsage = $, Ce;
}
var Je = {}, Ri;
function Hf() {
  if (Ri) return Je;
  Ri = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.extendSubschemaMode = Je.extendSubschemaData = Je.getSubschema = void 0;
  const e = ne(), t = ie();
  function s(n, { keyword: i, schemaProp: a, schema: l, schemaPath: d, errSchemaPath: c, topSchemaRef: $ }) {
    if (i !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const _ = n.schema[i];
      return a === void 0 ? {
        schema: _,
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}`
      } : {
        schema: _[a],
        schemaPath: (0, e._)`${n.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(a)}`,
        errSchemaPath: `${n.errSchemaPath}/${i}/${(0, t.escapeFragment)(a)}`
      };
    }
    if (l !== void 0) {
      if (d === void 0 || c === void 0 || $ === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: l,
        schemaPath: d,
        topSchemaRef: $,
        errSchemaPath: c
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Je.getSubschema = s;
  function r(n, i, { dataProp: a, dataPropType: l, data: d, dataTypes: c, propertyName: $ }) {
    if (d !== void 0 && a !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: _ } = i;
    if (a !== void 0) {
      const { errorPath: b, dataPathArr: w, opts: f } = i, y = _.let("data", (0, e._)`${i.data}${(0, e.getProperty)(a)}`, !0);
      g(y), n.errorPath = (0, e.str)`${b}${(0, t.getErrorPath)(a, l, f.jsPropertySyntax)}`, n.parentDataProperty = (0, e._)`${a}`, n.dataPathArr = [...w, n.parentDataProperty];
    }
    if (d !== void 0) {
      const b = d instanceof e.Name ? d : _.let("data", d, !0);
      g(b), $ !== void 0 && (n.propertyName = $);
    }
    c && (n.dataTypes = c);
    function g(b) {
      n.data = b, n.dataLevel = i.dataLevel + 1, n.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), n.parentData = i.data, n.dataNames = [...i.dataNames, b];
    }
  }
  Je.extendSubschemaData = r;
  function u(n, { jtdDiscriminator: i, jtdMetadata: a, compositeRule: l, createErrors: d, allErrors: c }) {
    l !== void 0 && (n.compositeRule = l), d !== void 0 && (n.createErrors = d), c !== void 0 && (n.allErrors = c), n.jtdDiscriminator = i, n.jtdMetadata = a;
  }
  return Je.extendSubschemaMode = u, Je;
}
var Re = {}, fs = { exports: {} }, Pi;
function Bf() {
  if (Pi) return fs.exports;
  Pi = 1;
  var e = fs.exports = function(r, u, n) {
    typeof u == "function" && (n = u, u = {}), n = u.cb || n;
    var i = typeof n == "function" ? n : n.pre || function() {
    }, a = n.post || function() {
    };
    t(u, i, a, r, "", r);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(r, u, n, i, a, l, d, c, $, _) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      u(i, a, l, d, c, $, _);
      for (var g in i) {
        var b = i[g];
        if (Array.isArray(b)) {
          if (g in e.arrayKeywords)
            for (var w = 0; w < b.length; w++)
              t(r, u, n, b[w], a + "/" + g + "/" + w, l, a, g, i, w);
        } else if (g in e.propsKeywords) {
          if (b && typeof b == "object")
            for (var f in b)
              t(r, u, n, b[f], a + "/" + g + "/" + s(f), l, a, g, i, f);
        } else (g in e.keywords || r.allKeys && !(g in e.skipKeywords)) && t(r, u, n, b, a + "/" + g, l, a, g, i);
      }
      n(i, a, l, d, c, $, _);
    }
  }
  function s(r) {
    return r.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return fs.exports;
}
var Ni;
function Mn() {
  if (Ni) return Re;
  Ni = 1, Object.defineProperty(Re, "__esModule", { value: !0 }), Re.getSchemaRefs = Re.resolveUrl = Re.normalizeId = Re._getFullPath = Re.getFullPath = Re.inlineRef = void 0;
  const e = ie(), t = jn(), s = Bf(), r = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function u(w, f = !0) {
    return typeof w == "boolean" ? !0 : f === !0 ? !i(w) : f ? a(w) <= f : !1;
  }
  Re.inlineRef = u;
  const n = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(w) {
    for (const f in w) {
      if (n.has(f))
        return !0;
      const y = w[f];
      if (Array.isArray(y) && y.some(i) || typeof y == "object" && i(y))
        return !0;
    }
    return !1;
  }
  function a(w) {
    let f = 0;
    for (const y in w) {
      if (y === "$ref")
        return 1 / 0;
      if (f++, !r.has(y) && (typeof w[y] == "object" && (0, e.eachItem)(w[y], (o) => f += a(o)), f === 1 / 0))
        return 1 / 0;
    }
    return f;
  }
  function l(w, f = "", y) {
    y !== !1 && (f = $(f));
    const o = w.parse(f);
    return d(w, o);
  }
  Re.getFullPath = l;
  function d(w, f) {
    return w.serialize(f).split("#")[0] + "#";
  }
  Re._getFullPath = d;
  const c = /#\/?$/;
  function $(w) {
    return w ? w.replace(c, "") : "";
  }
  Re.normalizeId = $;
  function _(w, f, y) {
    return y = $(y), w.resolve(f, y);
  }
  Re.resolveUrl = _;
  const g = /^[a-z_][-a-z0-9._]*$/i;
  function b(w, f) {
    if (typeof w == "boolean")
      return {};
    const { schemaId: y, uriResolver: o } = this.opts, p = $(w[y] || f), E = { "": p }, m = l(o, p, !1), v = {}, R = /* @__PURE__ */ new Set();
    return s(w, { allKeys: !0 }, (V, D, U, z) => {
      if (z === void 0)
        return;
      const M = m + D;
      let F = E[z];
      typeof V[y] == "string" && (F = J.call(this, V[y])), B.call(this, V.$anchor), B.call(this, V.$dynamicAnchor), E[D] = F;
      function J(H) {
        const Y = this.opts.uriResolver.resolve;
        if (H = $(F ? Y(F, H) : H), R.has(H))
          throw q(H);
        R.add(H);
        let k = this.refs[H];
        return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? O(V, k.schema, H) : H !== $(M) && (H[0] === "#" ? (O(V, v[H], H), v[H] = V) : this.refs[H] = M), H;
      }
      function B(H) {
        if (typeof H == "string") {
          if (!g.test(H))
            throw new Error(`invalid anchor "${H}"`);
          J.call(this, `#${H}`);
        }
      }
    }), v;
    function O(V, D, U) {
      if (D !== void 0 && !t(V, D))
        throw q(U);
    }
    function q(V) {
      return new Error(`reference "${V}" resolves to more than one schema`);
    }
  }
  return Re.getSchemaRefs = b, Re;
}
var Ti;
function Ln() {
  if (Ti) return He;
  Ti = 1, Object.defineProperty(He, "__esModule", { value: !0 }), He.getData = He.KeywordCxt = He.validateFunctionCode = void 0;
  const e = Gf(), t = Nn(), s = Lu(), r = Nn(), u = Kf(), n = Xf(), i = Hf(), a = ne(), l = nt(), d = Mn(), c = ie(), $ = Dn();
  function _(P) {
    if (m(P) && (R(P), E(P))) {
      f(P);
      return;
    }
    g(P, () => (0, e.topBoolOrEmptySchema)(P));
  }
  He.validateFunctionCode = _;
  function g({ gen: P, validateName: I, schema: C, schemaEnv: L, opts: K }, W) {
    K.code.es5 ? P.func(I, (0, a._)`${l.default.data}, ${l.default.valCxt}`, L.$async, () => {
      P.code((0, a._)`"use strict"; ${o(C, K)}`), w(P, K), P.code(W);
    }) : P.func(I, (0, a._)`${l.default.data}, ${b(K)}`, L.$async, () => P.code(o(C, K)).code(W));
  }
  function b(P) {
    return (0, a._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${P.dynamicRef ? (0, a._)`, ${l.default.dynamicAnchors}={}` : a.nil}}={}`;
  }
  function w(P, I) {
    P.if(l.default.valCxt, () => {
      P.var(l.default.instancePath, (0, a._)`${l.default.valCxt}.${l.default.instancePath}`), P.var(l.default.parentData, (0, a._)`${l.default.valCxt}.${l.default.parentData}`), P.var(l.default.parentDataProperty, (0, a._)`${l.default.valCxt}.${l.default.parentDataProperty}`), P.var(l.default.rootData, (0, a._)`${l.default.valCxt}.${l.default.rootData}`), I.dynamicRef && P.var(l.default.dynamicAnchors, (0, a._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      P.var(l.default.instancePath, (0, a._)`""`), P.var(l.default.parentData, (0, a._)`undefined`), P.var(l.default.parentDataProperty, (0, a._)`undefined`), P.var(l.default.rootData, l.default.data), I.dynamicRef && P.var(l.default.dynamicAnchors, (0, a._)`{}`);
    });
  }
  function f(P) {
    const { schema: I, opts: C, gen: L } = P;
    g(P, () => {
      C.$comment && I.$comment && z(P), V(P), L.let(l.default.vErrors, null), L.let(l.default.errors, 0), C.unevaluated && y(P), O(P), M(P);
    });
  }
  function y(P) {
    const { gen: I, validateName: C } = P;
    P.evaluated = I.const("evaluated", (0, a._)`${C}.evaluated`), I.if((0, a._)`${P.evaluated}.dynamicProps`, () => I.assign((0, a._)`${P.evaluated}.props`, (0, a._)`undefined`)), I.if((0, a._)`${P.evaluated}.dynamicItems`, () => I.assign((0, a._)`${P.evaluated}.items`, (0, a._)`undefined`));
  }
  function o(P, I) {
    const C = typeof P == "object" && P[I.schemaId];
    return C && (I.code.source || I.code.process) ? (0, a._)`/*# sourceURL=${C} */` : a.nil;
  }
  function p(P, I) {
    if (m(P) && (R(P), E(P))) {
      v(P, I);
      return;
    }
    (0, e.boolOrEmptySchema)(P, I);
  }
  function E({ schema: P, self: I }) {
    if (typeof P == "boolean")
      return !P;
    for (const C in P)
      if (I.RULES.all[C])
        return !0;
    return !1;
  }
  function m(P) {
    return typeof P.schema != "boolean";
  }
  function v(P, I) {
    const { schema: C, gen: L, opts: K } = P;
    K.$comment && C.$comment && z(P), D(P), U(P);
    const W = L.const("_errs", l.default.errors);
    O(P, W), L.var(I, (0, a._)`${W} === ${l.default.errors}`);
  }
  function R(P) {
    (0, c.checkUnknownRules)(P), q(P);
  }
  function O(P, I) {
    if (P.opts.jtd)
      return J(P, [], !1, I);
    const C = (0, t.getSchemaTypes)(P.schema), L = (0, t.coerceAndCheckDataType)(P, C);
    J(P, C, !L, I);
  }
  function q(P) {
    const { schema: I, errSchemaPath: C, opts: L, self: K } = P;
    I.$ref && L.ignoreKeywordsWithRef && (0, c.schemaHasRulesButRef)(I, K.RULES) && K.logger.warn(`$ref: keywords ignored in schema at path "${C}"`);
  }
  function V(P) {
    const { schema: I, opts: C } = P;
    I.default !== void 0 && C.useDefaults && C.strictSchema && (0, c.checkStrictMode)(P, "default is ignored in the schema root");
  }
  function D(P) {
    const I = P.schema[P.opts.schemaId];
    I && (P.baseId = (0, d.resolveUrl)(P.opts.uriResolver, P.baseId, I));
  }
  function U(P) {
    if (P.schema.$async && !P.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function z({ gen: P, schemaEnv: I, schema: C, errSchemaPath: L, opts: K }) {
    const W = C.$comment;
    if (K.$comment === !0)
      P.code((0, a._)`${l.default.self}.logger.log(${W})`);
    else if (typeof K.$comment == "function") {
      const ae = (0, a.str)`${L}/$comment`, ye = P.scopeValue("root", { ref: I.root });
      P.code((0, a._)`${l.default.self}.opts.$comment(${W}, ${ae}, ${ye}.schema)`);
    }
  }
  function M(P) {
    const { gen: I, schemaEnv: C, validateName: L, ValidationError: K, opts: W } = P;
    C.$async ? I.if((0, a._)`${l.default.errors} === 0`, () => I.return(l.default.data), () => I.throw((0, a._)`new ${K}(${l.default.vErrors})`)) : (I.assign((0, a._)`${L}.errors`, l.default.vErrors), W.unevaluated && F(P), I.return((0, a._)`${l.default.errors} === 0`));
  }
  function F({ gen: P, evaluated: I, props: C, items: L }) {
    C instanceof a.Name && P.assign((0, a._)`${I}.props`, C), L instanceof a.Name && P.assign((0, a._)`${I}.items`, L);
  }
  function J(P, I, C, L) {
    const { gen: K, schema: W, data: ae, allErrors: ye, opts: ue, self: le } = P, { RULES: oe } = le;
    if (W.$ref && (ue.ignoreKeywordsWithRef || !(0, c.schemaHasRulesButRef)(W, oe))) {
      K.block(() => G(P, "$ref", oe.all.$ref.definition));
      return;
    }
    ue.jtd || H(P, I), K.block(() => {
      for (const me of oe.rules)
        Ne(me);
      Ne(oe.post);
    });
    function Ne(me) {
      (0, s.shouldUseGroup)(W, me) && (me.type ? (K.if((0, r.checkDataType)(me.type, ae, ue.strictNumbers)), B(P, me), I.length === 1 && I[0] === me.type && C && (K.else(), (0, r.reportTypeError)(P)), K.endIf()) : B(P, me), ye || K.if((0, a._)`${l.default.errors} === ${L || 0}`));
    }
  }
  function B(P, I) {
    const { gen: C, schema: L, opts: { useDefaults: K } } = P;
    K && (0, u.assignDefaults)(P, I.type), C.block(() => {
      for (const W of I.rules)
        (0, s.shouldUseRule)(L, W) && G(P, W.keyword, W.definition, I.type);
    });
  }
  function H(P, I) {
    P.schemaEnv.meta || !P.opts.strictTypes || (Y(P, I), P.opts.allowUnionTypes || k(P, I), N(P, P.dataTypes));
  }
  function Y(P, I) {
    if (I.length) {
      if (!P.dataTypes.length) {
        P.dataTypes = I;
        return;
      }
      I.forEach((C) => {
        T(P.dataTypes, C) || S(P, `type "${C}" not allowed by context "${P.dataTypes.join(",")}"`);
      }), h(P, I);
    }
  }
  function k(P, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && S(P, "use allowUnionTypes to allow union type keyword");
  }
  function N(P, I) {
    const C = P.self.RULES.all;
    for (const L in C) {
      const K = C[L];
      if (typeof K == "object" && (0, s.shouldUseRule)(P.schema, K)) {
        const { type: W } = K.definition;
        W.length && !W.some((ae) => A(I, ae)) && S(P, `missing type "${W.join(",")}" for keyword "${L}"`);
      }
    }
  }
  function A(P, I) {
    return P.includes(I) || I === "number" && P.includes("integer");
  }
  function T(P, I) {
    return P.includes(I) || I === "integer" && P.includes("number");
  }
  function h(P, I) {
    const C = [];
    for (const L of P.dataTypes)
      T(I, L) ? C.push(L) : I.includes("integer") && L === "number" && C.push("integer");
    P.dataTypes = C;
  }
  function S(P, I) {
    const C = P.schemaEnv.baseId + P.errSchemaPath;
    I += ` at "${C}" (strictTypes)`, (0, c.checkStrictMode)(P, I, P.opts.strictTypes);
  }
  class j {
    constructor(I, C, L) {
      if ((0, n.validateKeywordUsage)(I, C, L), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = L, this.data = I.data, this.schema = I.schema[L], this.$data = C.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, c.schemaRefOrVal)(I, this.schema, L, this.$data), this.schemaType = C.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = C, this.$data)
        this.schemaCode = I.gen.const("vSchema", Q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, n.validSchemaType)(this.schema, C.schemaType, C.allowUndefined))
        throw new Error(`${L} value must be ${JSON.stringify(C.schemaType)}`);
      ("code" in C ? C.trackErrors : C.errors !== !1) && (this.errsCount = I.gen.const("_errs", l.default.errors));
    }
    result(I, C, L) {
      this.failResult((0, a.not)(I), C, L);
    }
    failResult(I, C, L) {
      this.gen.if(I), L ? L() : this.error(), C ? (this.gen.else(), C(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, C) {
      this.failResult((0, a.not)(I), void 0, C);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: C } = this;
      this.fail((0, a._)`${C} !== undefined && (${(0, a.or)(this.invalid$data(), I)})`);
    }
    error(I, C, L) {
      if (C) {
        this.setParams(C), this._error(I, L), this.setParams({});
        return;
      }
      this._error(I, L);
    }
    _error(I, C) {
      (I ? $.reportExtraError : $.reportError)(this, this.def.error, C);
    }
    $dataError() {
      (0, $.reportError)(this, this.def.$dataError || $.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, $.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, C) {
      C ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, C, L = a.nil) {
      this.gen.block(() => {
        this.check$data(I, L), C();
      });
    }
    check$data(I = a.nil, C = a.nil) {
      if (!this.$data)
        return;
      const { gen: L, schemaCode: K, schemaType: W, def: ae } = this;
      L.if((0, a.or)((0, a._)`${K} === undefined`, C)), I !== a.nil && L.assign(I, !0), (W.length || ae.validateSchema) && (L.elseIf(this.invalid$data()), this.$dataError(), I !== a.nil && L.assign(I, !1)), L.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: C, schemaType: L, def: K, it: W } = this;
      return (0, a.or)(ae(), ye());
      function ae() {
        if (L.length) {
          if (!(C instanceof a.Name))
            throw new Error("ajv implementation error");
          const ue = Array.isArray(L) ? L : [L];
          return (0, a._)`${(0, r.checkDataTypes)(ue, C, W.opts.strictNumbers, r.DataType.Wrong)}`;
        }
        return a.nil;
      }
      function ye() {
        if (K.validateSchema) {
          const ue = I.scopeValue("validate$data", { ref: K.validateSchema });
          return (0, a._)`!${ue}(${C})`;
        }
        return a.nil;
      }
    }
    subschema(I, C) {
      const L = (0, i.getSubschema)(this.it, I);
      (0, i.extendSubschemaData)(L, this.it, I), (0, i.extendSubschemaMode)(L, I);
      const K = { ...this.it, ...L, items: void 0, props: void 0 };
      return p(K, C), K;
    }
    mergeEvaluated(I, C) {
      const { it: L, gen: K } = this;
      L.opts.unevaluated && (L.props !== !0 && I.props !== void 0 && (L.props = c.mergeEvaluated.props(K, I.props, L.props, C)), L.items !== !0 && I.items !== void 0 && (L.items = c.mergeEvaluated.items(K, I.items, L.items, C)));
    }
    mergeValidEvaluated(I, C) {
      const { it: L, gen: K } = this;
      if (L.opts.unevaluated && (L.props !== !0 || L.items !== !0))
        return K.if(C, () => this.mergeEvaluated(I, a.Name)), !0;
    }
  }
  He.KeywordCxt = j;
  function G(P, I, C, L) {
    const K = new j(P, C, I);
    "code" in C ? C.code(K, L) : K.$data && C.validate ? (0, n.funcKeywordCode)(K, C) : "macro" in C ? (0, n.macroKeywordCode)(K, C) : (C.compile || C.validate) && (0, n.funcKeywordCode)(K, C);
  }
  const X = /^\/(?:[^~]|~0|~1)*$/, Z = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function Q(P, { dataLevel: I, dataNames: C, dataPathArr: L }) {
    let K, W;
    if (P === "")
      return l.default.rootData;
    if (P[0] === "/") {
      if (!X.test(P))
        throw new Error(`Invalid JSON-pointer: ${P}`);
      K = P, W = l.default.rootData;
    } else {
      const le = Z.exec(P);
      if (!le)
        throw new Error(`Invalid JSON-pointer: ${P}`);
      const oe = +le[1];
      if (K = le[2], K === "#") {
        if (oe >= I)
          throw new Error(ue("property/index", oe));
        return L[I - oe];
      }
      if (oe > I)
        throw new Error(ue("data", oe));
      if (W = C[I - oe], !K)
        return W;
    }
    let ae = W;
    const ye = K.split("/");
    for (const le of ye)
      le && (W = (0, a._)`${W}${(0, a.getProperty)((0, c.unescapeJsonPointer)(le))}`, ae = (0, a._)`${ae} && ${W}`);
    return ae;
    function ue(le, oe) {
      return `Cannot access ${le} ${oe} levels up, current level is ${I}`;
    }
  }
  return He.getData = Q, He;
}
var Cr = {}, Ii;
function ga() {
  if (Ii) return Cr;
  Ii = 1, Object.defineProperty(Cr, "__esModule", { value: !0 });
  class e extends Error {
    constructor(s) {
      super("validation failed"), this.errors = s, this.ajv = this.validation = !0;
    }
  }
  return Cr.default = e, Cr;
}
var qr = {}, Oi;
function Vn() {
  if (Oi) return qr;
  Oi = 1, Object.defineProperty(qr, "__esModule", { value: !0 });
  const e = Mn();
  class t extends Error {
    constructor(r, u, n, i) {
      super(i || `can't resolve reference ${n} from id ${u}`), this.missingRef = (0, e.resolveUrl)(r, u, n), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(r, this.missingRef));
    }
  }
  return qr.default = t, qr;
}
var Oe = {}, ji;
function $a() {
  if (ji) return Oe;
  ji = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.resolveSchema = Oe.getCompilingSchema = Oe.resolveRef = Oe.compileSchema = Oe.SchemaEnv = void 0;
  const e = ne(), t = ga(), s = nt(), r = Mn(), u = ie(), n = Ln();
  class i {
    constructor(y) {
      var o;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof y.schema == "object" && (p = y.schema), this.schema = y.schema, this.schemaId = y.schemaId, this.root = y.root || this, this.baseId = (o = y.baseId) !== null && o !== void 0 ? o : (0, r.normalizeId)(p?.[y.schemaId || "$id"]), this.schemaPath = y.schemaPath, this.localRefs = y.localRefs, this.meta = y.meta, this.$async = p?.$async, this.refs = {};
    }
  }
  Oe.SchemaEnv = i;
  function a(f) {
    const y = c.call(this, f);
    if (y)
      return y;
    const o = (0, r.getFullPath)(this.opts.uriResolver, f.root.baseId), { es5: p, lines: E } = this.opts.code, { ownProperties: m } = this.opts, v = new e.CodeGen(this.scope, { es5: p, lines: E, ownProperties: m });
    let R;
    f.$async && (R = v.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = v.scopeName("validate");
    f.validateName = O;
    const q = {
      gen: v,
      allErrors: this.opts.allErrors,
      data: s.default.data,
      parentData: s.default.parentData,
      parentDataProperty: s.default.parentDataProperty,
      dataNames: [s.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: v.scopeValue("schema", this.opts.code.source === !0 ? { ref: f.schema, code: (0, e.stringify)(f.schema) } : { ref: f.schema }),
      validateName: O,
      ValidationError: R,
      schema: f.schema,
      schemaEnv: f,
      rootId: o,
      baseId: f.baseId || o,
      schemaPath: e.nil,
      errSchemaPath: f.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let V;
    try {
      this._compilations.add(f), (0, n.validateFunctionCode)(q), v.optimize(this.opts.code.optimize);
      const D = v.toString();
      V = `${v.scopeRefs(s.default.scope)}return ${D}`, this.opts.code.process && (V = this.opts.code.process(V, f));
      const z = new Function(`${s.default.self}`, `${s.default.scope}`, V)(this, this.scope.get());
      if (this.scope.value(O, { ref: z }), z.errors = null, z.schema = f.schema, z.schemaEnv = f, f.$async && (z.$async = !0), this.opts.code.source === !0 && (z.source = { validateName: O, validateCode: D, scopeValues: v._values }), this.opts.unevaluated) {
        const { props: M, items: F } = q;
        z.evaluated = {
          props: M instanceof e.Name ? void 0 : M,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: M instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, z.source && (z.source.evaluated = (0, e.stringify)(z.evaluated));
      }
      return f.validate = z, f;
    } catch (D) {
      throw delete f.validate, delete f.validateName, V && this.logger.error("Error compiling schema, function code:", V), D;
    } finally {
      this._compilations.delete(f);
    }
  }
  Oe.compileSchema = a;
  function l(f, y, o) {
    var p;
    o = (0, r.resolveUrl)(this.opts.uriResolver, y, o);
    const E = f.refs[o];
    if (E)
      return E;
    let m = _.call(this, f, o);
    if (m === void 0) {
      const v = (p = f.localRefs) === null || p === void 0 ? void 0 : p[o], { schemaId: R } = this.opts;
      v && (m = new i({ schema: v, schemaId: R, root: f, baseId: y }));
    }
    if (m !== void 0)
      return f.refs[o] = d.call(this, m);
  }
  Oe.resolveRef = l;
  function d(f) {
    return (0, r.inlineRef)(f.schema, this.opts.inlineRefs) ? f.schema : f.validate ? f : a.call(this, f);
  }
  function c(f) {
    for (const y of this._compilations)
      if ($(y, f))
        return y;
  }
  Oe.getCompilingSchema = c;
  function $(f, y) {
    return f.schema === y.schema && f.root === y.root && f.baseId === y.baseId;
  }
  function _(f, y) {
    let o;
    for (; typeof (o = this.refs[y]) == "string"; )
      y = o;
    return o || this.schemas[y] || g.call(this, f, y);
  }
  function g(f, y) {
    const o = this.opts.uriResolver.parse(y), p = (0, r._getFullPath)(this.opts.uriResolver, o);
    let E = (0, r.getFullPath)(this.opts.uriResolver, f.baseId, void 0);
    if (Object.keys(f.schema).length > 0 && p === E)
      return w.call(this, o, f);
    const m = (0, r.normalizeId)(p), v = this.refs[m] || this.schemas[m];
    if (typeof v == "string") {
      const R = g.call(this, f, v);
      return typeof R?.schema != "object" ? void 0 : w.call(this, o, R);
    }
    if (typeof v?.schema == "object") {
      if (v.validate || a.call(this, v), m === (0, r.normalizeId)(y)) {
        const { schema: R } = v, { schemaId: O } = this.opts, q = R[O];
        return q && (E = (0, r.resolveUrl)(this.opts.uriResolver, E, q)), new i({ schema: R, schemaId: O, root: f, baseId: E });
      }
      return w.call(this, o, v);
    }
  }
  Oe.resolveSchema = g;
  const b = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function w(f, { baseId: y, schema: o, root: p }) {
    var E;
    if (((E = f.fragment) === null || E === void 0 ? void 0 : E[0]) !== "/")
      return;
    for (const R of f.fragment.slice(1).split("/")) {
      if (typeof o == "boolean")
        return;
      const O = o[(0, u.unescapeFragment)(R)];
      if (O === void 0)
        return;
      o = O;
      const q = typeof o == "object" && o[this.opts.schemaId];
      !b.has(R) && q && (y = (0, r.resolveUrl)(this.opts.uriResolver, y, q));
    }
    let m;
    if (typeof o != "boolean" && o.$ref && !(0, u.schemaHasRulesButRef)(o, this.RULES)) {
      const R = (0, r.resolveUrl)(this.opts.uriResolver, y, o.$ref);
      m = g.call(this, p, R);
    }
    const { schemaId: v } = this.opts;
    if (m = m || new i({ schema: o, schemaId: v, root: p, baseId: y }), m.schema !== m.root.schema)
      return m;
  }
  return Oe;
}
const Jf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Wf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Yf = "object", Qf = ["$data"], Zf = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, xf = !1, eh = {
  $id: Jf,
  description: Wf,
  type: Yf,
  required: Qf,
  properties: Zf,
  additionalProperties: xf
};
var Dr = {}, Ai;
function th() {
  if (Ai) return Dr;
  Ai = 1, Object.defineProperty(Dr, "__esModule", { value: !0 });
  const e = ju();
  return e.code = 'require("ajv/dist/runtime/uri").default', Dr.default = e, Dr;
}
var ki;
function rh() {
  return ki || (ki = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = Ln();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var s = ne();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    const r = ga(), u = Vn(), n = Mu(), i = $a(), a = ne(), l = Mn(), d = Nn(), c = ie(), $ = eh, _ = th(), g = (k, N) => new RegExp(k, N);
    g.code = "new RegExp";
    const b = ["removeAdditional", "useDefaults", "coerceTypes"], w = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), f = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, y = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, o = 200;
    function p(k) {
      var N, A, T, h, S, j, G, X, Z, Q, P, I, C, L, K, W, ae, ye, ue, le, oe, Ne, me, st, at;
      const Ae = k.strict, ot = (N = k.code) === null || N === void 0 ? void 0 : N.optimize, Pt = ot === !0 || ot === void 0 ? 1 : ot || 0, Nt = (T = (A = k.code) === null || A === void 0 ? void 0 : A.regExp) !== null && T !== void 0 ? T : g, Xn = (h = k.uriResolver) !== null && h !== void 0 ? h : _.default;
      return {
        strictSchema: (j = (S = k.strictSchema) !== null && S !== void 0 ? S : Ae) !== null && j !== void 0 ? j : !0,
        strictNumbers: (X = (G = k.strictNumbers) !== null && G !== void 0 ? G : Ae) !== null && X !== void 0 ? X : !0,
        strictTypes: (Q = (Z = k.strictTypes) !== null && Z !== void 0 ? Z : Ae) !== null && Q !== void 0 ? Q : "log",
        strictTuples: (I = (P = k.strictTuples) !== null && P !== void 0 ? P : Ae) !== null && I !== void 0 ? I : "log",
        strictRequired: (L = (C = k.strictRequired) !== null && C !== void 0 ? C : Ae) !== null && L !== void 0 ? L : !1,
        code: k.code ? { ...k.code, optimize: Pt, regExp: Nt } : { optimize: Pt, regExp: Nt },
        loopRequired: (K = k.loopRequired) !== null && K !== void 0 ? K : o,
        loopEnum: (W = k.loopEnum) !== null && W !== void 0 ? W : o,
        meta: (ae = k.meta) !== null && ae !== void 0 ? ae : !0,
        messages: (ye = k.messages) !== null && ye !== void 0 ? ye : !0,
        inlineRefs: (ue = k.inlineRefs) !== null && ue !== void 0 ? ue : !0,
        schemaId: (le = k.schemaId) !== null && le !== void 0 ? le : "$id",
        addUsedSchema: (oe = k.addUsedSchema) !== null && oe !== void 0 ? oe : !0,
        validateSchema: (Ne = k.validateSchema) !== null && Ne !== void 0 ? Ne : !0,
        validateFormats: (me = k.validateFormats) !== null && me !== void 0 ? me : !0,
        unicodeRegExp: (st = k.unicodeRegExp) !== null && st !== void 0 ? st : !0,
        int32range: (at = k.int32range) !== null && at !== void 0 ? at : !0,
        uriResolver: Xn
      };
    }
    class E {
      constructor(N = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), N = this.opts = { ...N, ...p(N) };
        const { es5: A, lines: T } = this.opts.code;
        this.scope = new a.ValueScope({ scope: {}, prefixes: w, es5: A, lines: T }), this.logger = U(N.logger);
        const h = N.validateFormats;
        N.validateFormats = !1, this.RULES = (0, n.getRules)(), m.call(this, f, N, "NOT SUPPORTED"), m.call(this, y, N, "DEPRECATED", "warn"), this._metaOpts = V.call(this), N.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), N.keywords && q.call(this, N.keywords), typeof N.meta == "object" && this.addMetaSchema(N.meta), R.call(this), N.validateFormats = h;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: N, meta: A, schemaId: T } = this.opts;
        let h = $;
        T === "id" && (h = { ...$ }, h.id = h.$id, delete h.$id), A && N && this.addMetaSchema(h, h[T], !1);
      }
      defaultMeta() {
        const { meta: N, schemaId: A } = this.opts;
        return this.opts.defaultMeta = typeof N == "object" ? N[A] || N : void 0;
      }
      validate(N, A) {
        let T;
        if (typeof N == "string") {
          if (T = this.getSchema(N), !T)
            throw new Error(`no schema with key or ref "${N}"`);
        } else
          T = this.compile(N);
        const h = T(A);
        return "$async" in T || (this.errors = T.errors), h;
      }
      compile(N, A) {
        const T = this._addSchema(N, A);
        return T.validate || this._compileSchemaEnv(T);
      }
      compileAsync(N, A) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: T } = this.opts;
        return h.call(this, N, A);
        async function h(Q, P) {
          await S.call(this, Q.$schema);
          const I = this._addSchema(Q, P);
          return I.validate || j.call(this, I);
        }
        async function S(Q) {
          Q && !this.getSchema(Q) && await h.call(this, { $ref: Q }, !0);
        }
        async function j(Q) {
          try {
            return this._compileSchemaEnv(Q);
          } catch (P) {
            if (!(P instanceof u.default))
              throw P;
            return G.call(this, P), await X.call(this, P.missingSchema), j.call(this, Q);
          }
        }
        function G({ missingSchema: Q, missingRef: P }) {
          if (this.refs[Q])
            throw new Error(`AnySchema ${Q} is loaded but ${P} cannot be resolved`);
        }
        async function X(Q) {
          const P = await Z.call(this, Q);
          this.refs[Q] || await S.call(this, P.$schema), this.refs[Q] || this.addSchema(P, Q, A);
        }
        async function Z(Q) {
          const P = this._loading[Q];
          if (P)
            return P;
          try {
            return await (this._loading[Q] = T(Q));
          } finally {
            delete this._loading[Q];
          }
        }
      }
      // Adds schema to the instance
      addSchema(N, A, T, h = this.opts.validateSchema) {
        if (Array.isArray(N)) {
          for (const j of N)
            this.addSchema(j, void 0, T, h);
          return this;
        }
        let S;
        if (typeof N == "object") {
          const { schemaId: j } = this.opts;
          if (S = N[j], S !== void 0 && typeof S != "string")
            throw new Error(`schema ${j} must be string`);
        }
        return A = (0, l.normalizeId)(A || S), this._checkUnique(A), this.schemas[A] = this._addSchema(N, T, A, h, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(N, A, T = this.opts.validateSchema) {
        return this.addSchema(N, A, !0, T), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(N, A) {
        if (typeof N == "boolean")
          return !0;
        let T;
        if (T = N.$schema, T !== void 0 && typeof T != "string")
          throw new Error("$schema must be a string");
        if (T = T || this.opts.defaultMeta || this.defaultMeta(), !T)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const h = this.validate(T, N);
        if (!h && A) {
          const S = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(S);
          else
            throw new Error(S);
        }
        return h;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(N) {
        let A;
        for (; typeof (A = v.call(this, N)) == "string"; )
          N = A;
        if (A === void 0) {
          const { schemaId: T } = this.opts, h = new i.SchemaEnv({ schema: {}, schemaId: T });
          if (A = i.resolveSchema.call(this, h, N), !A)
            return;
          this.refs[N] = A;
        }
        return A.validate || this._compileSchemaEnv(A);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(N) {
        if (N instanceof RegExp)
          return this._removeAllSchemas(this.schemas, N), this._removeAllSchemas(this.refs, N), this;
        switch (typeof N) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const A = v.call(this, N);
            return typeof A == "object" && this._cache.delete(A.schema), delete this.schemas[N], delete this.refs[N], this;
          }
          case "object": {
            const A = N;
            this._cache.delete(A);
            let T = N[this.opts.schemaId];
            return T && (T = (0, l.normalizeId)(T), delete this.schemas[T], delete this.refs[T]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(N) {
        for (const A of N)
          this.addKeyword(A);
        return this;
      }
      addKeyword(N, A) {
        let T;
        if (typeof N == "string")
          T = N, typeof A == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), A.keyword = T);
        else if (typeof N == "object" && A === void 0) {
          if (A = N, T = A.keyword, Array.isArray(T) && !T.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (M.call(this, T, A), !A)
          return (0, c.eachItem)(T, (S) => F.call(this, S)), this;
        B.call(this, A);
        const h = {
          ...A,
          type: (0, d.getJSONTypes)(A.type),
          schemaType: (0, d.getJSONTypes)(A.schemaType)
        };
        return (0, c.eachItem)(T, h.type.length === 0 ? (S) => F.call(this, S, h) : (S) => h.type.forEach((j) => F.call(this, S, h, j))), this;
      }
      getKeyword(N) {
        const A = this.RULES.all[N];
        return typeof A == "object" ? A.definition : !!A;
      }
      // Remove keyword
      removeKeyword(N) {
        const { RULES: A } = this;
        delete A.keywords[N], delete A.all[N];
        for (const T of A.rules) {
          const h = T.rules.findIndex((S) => S.keyword === N);
          h >= 0 && T.rules.splice(h, 1);
        }
        return this;
      }
      // Add format
      addFormat(N, A) {
        return typeof A == "string" && (A = new RegExp(A)), this.formats[N] = A, this;
      }
      errorsText(N = this.errors, { separator: A = ", ", dataVar: T = "data" } = {}) {
        return !N || N.length === 0 ? "No errors" : N.map((h) => `${T}${h.instancePath} ${h.message}`).reduce((h, S) => h + A + S);
      }
      $dataMetaSchema(N, A) {
        const T = this.RULES.all;
        N = JSON.parse(JSON.stringify(N));
        for (const h of A) {
          const S = h.split("/").slice(1);
          let j = N;
          for (const G of S)
            j = j[G];
          for (const G in T) {
            const X = T[G];
            if (typeof X != "object")
              continue;
            const { $data: Z } = X.definition, Q = j[G];
            Z && Q && (j[G] = Y(Q));
          }
        }
        return N;
      }
      _removeAllSchemas(N, A) {
        for (const T in N) {
          const h = N[T];
          (!A || A.test(T)) && (typeof h == "string" ? delete N[T] : h && !h.meta && (this._cache.delete(h.schema), delete N[T]));
        }
      }
      _addSchema(N, A, T, h = this.opts.validateSchema, S = this.opts.addUsedSchema) {
        let j;
        const { schemaId: G } = this.opts;
        if (typeof N == "object")
          j = N[G];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof N != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let X = this._cache.get(N);
        if (X !== void 0)
          return X;
        T = (0, l.normalizeId)(j || T);
        const Z = l.getSchemaRefs.call(this, N, T);
        return X = new i.SchemaEnv({ schema: N, schemaId: G, meta: A, baseId: T, localRefs: Z }), this._cache.set(X.schema, X), S && !T.startsWith("#") && (T && this._checkUnique(T), this.refs[T] = X), h && this.validateSchema(N, !0), X;
      }
      _checkUnique(N) {
        if (this.schemas[N] || this.refs[N])
          throw new Error(`schema with key or id "${N}" already exists`);
      }
      _compileSchemaEnv(N) {
        if (N.meta ? this._compileMetaSchema(N) : i.compileSchema.call(this, N), !N.validate)
          throw new Error("ajv implementation error");
        return N.validate;
      }
      _compileMetaSchema(N) {
        const A = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, N);
        } finally {
          this.opts = A;
        }
      }
    }
    E.ValidationError = r.default, E.MissingRefError = u.default, e.default = E;
    function m(k, N, A, T = "error") {
      for (const h in k) {
        const S = h;
        S in N && this.logger[T](`${A}: option ${h}. ${k[S]}`);
      }
    }
    function v(k) {
      return k = (0, l.normalizeId)(k), this.schemas[k] || this.refs[k];
    }
    function R() {
      const k = this.opts.schemas;
      if (k)
        if (Array.isArray(k))
          this.addSchema(k);
        else
          for (const N in k)
            this.addSchema(k[N], N);
    }
    function O() {
      for (const k in this.opts.formats) {
        const N = this.opts.formats[k];
        N && this.addFormat(k, N);
      }
    }
    function q(k) {
      if (Array.isArray(k)) {
        this.addVocabulary(k);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const N in k) {
        const A = k[N];
        A.keyword || (A.keyword = N), this.addKeyword(A);
      }
    }
    function V() {
      const k = { ...this.opts };
      for (const N of b)
        delete k[N];
      return k;
    }
    const D = { log() {
    }, warn() {
    }, error() {
    } };
    function U(k) {
      if (k === !1)
        return D;
      if (k === void 0)
        return console;
      if (k.log && k.warn && k.error)
        return k;
      throw new Error("logger must implement log, warn and error methods");
    }
    const z = /^[a-z_$][a-z0-9_$:-]*$/i;
    function M(k, N) {
      const { RULES: A } = this;
      if ((0, c.eachItem)(k, (T) => {
        if (A.keywords[T])
          throw new Error(`Keyword ${T} is already defined`);
        if (!z.test(T))
          throw new Error(`Keyword ${T} has invalid name`);
      }), !!N && N.$data && !("code" in N || "validate" in N))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(k, N, A) {
      var T;
      const h = N?.post;
      if (A && h)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: S } = this;
      let j = h ? S.post : S.rules.find(({ type: X }) => X === A);
      if (j || (j = { type: A, rules: [] }, S.rules.push(j)), S.keywords[k] = !0, !N)
        return;
      const G = {
        keyword: k,
        definition: {
          ...N,
          type: (0, d.getJSONTypes)(N.type),
          schemaType: (0, d.getJSONTypes)(N.schemaType)
        }
      };
      N.before ? J.call(this, j, G, N.before) : j.rules.push(G), S.all[k] = G, (T = N.implements) === null || T === void 0 || T.forEach((X) => this.addKeyword(X));
    }
    function J(k, N, A) {
      const T = k.rules.findIndex((h) => h.keyword === A);
      T >= 0 ? k.rules.splice(T, 0, N) : (k.rules.push(N), this.logger.warn(`rule ${A} is not defined`));
    }
    function B(k) {
      let { metaSchema: N } = k;
      N !== void 0 && (k.$data && this.opts.$data && (N = Y(N)), k.validateSchema = this.compile(N, !0));
    }
    const H = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Y(k) {
      return { anyOf: [k, H] };
    }
  })(is)), is;
}
var Mr = {}, Lr = {}, Vr = {}, Ci;
function nh() {
  if (Ci) return Vr;
  Ci = 1, Object.defineProperty(Vr, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Vr.default = e, Vr;
}
var xe = {}, qi;
function sh() {
  if (qi) return xe;
  qi = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.callRef = xe.getValidate = void 0;
  const e = Vn(), t = Le(), s = ne(), r = nt(), u = $a(), n = ie(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(d) {
      const { gen: c, schema: $, it: _ } = d, { baseId: g, schemaEnv: b, validateName: w, opts: f, self: y } = _, { root: o } = b;
      if (($ === "#" || $ === "#/") && g === o.baseId)
        return E();
      const p = u.resolveRef.call(y, o, g, $);
      if (p === void 0)
        throw new e.default(_.opts.uriResolver, g, $);
      if (p instanceof u.SchemaEnv)
        return m(p);
      return v(p);
      function E() {
        if (b === o)
          return l(d, w, b, b.$async);
        const R = c.scopeValue("root", { ref: o });
        return l(d, (0, s._)`${R}.validate`, o, o.$async);
      }
      function m(R) {
        const O = a(d, R);
        l(d, O, R, R.$async);
      }
      function v(R) {
        const O = c.scopeValue("schema", f.code.source === !0 ? { ref: R, code: (0, s.stringify)(R) } : { ref: R }), q = c.name("valid"), V = d.subschema({
          schema: R,
          dataTypes: [],
          schemaPath: s.nil,
          topSchemaRef: O,
          errSchemaPath: $
        }, q);
        d.mergeEvaluated(V), d.ok(q);
      }
    }
  };
  function a(d, c) {
    const { gen: $ } = d;
    return c.validate ? $.scopeValue("validate", { ref: c.validate }) : (0, s._)`${$.scopeValue("wrapper", { ref: c })}.validate`;
  }
  xe.getValidate = a;
  function l(d, c, $, _) {
    const { gen: g, it: b } = d, { allErrors: w, schemaEnv: f, opts: y } = b, o = y.passContext ? r.default.this : s.nil;
    _ ? p() : E();
    function p() {
      if (!f.$async)
        throw new Error("async schema referenced by sync schema");
      const R = g.let("valid");
      g.try(() => {
        g.code((0, s._)`await ${(0, t.callValidateCode)(d, c, o)}`), v(c), w || g.assign(R, !0);
      }, (O) => {
        g.if((0, s._)`!(${O} instanceof ${b.ValidationError})`, () => g.throw(O)), m(O), w || g.assign(R, !1);
      }), d.ok(R);
    }
    function E() {
      d.result((0, t.callValidateCode)(d, c, o), () => v(c), () => m(c));
    }
    function m(R) {
      const O = (0, s._)`${R}.errors`;
      g.assign(r.default.vErrors, (0, s._)`${r.default.vErrors} === null ? ${O} : ${r.default.vErrors}.concat(${O})`), g.assign(r.default.errors, (0, s._)`${r.default.vErrors}.length`);
    }
    function v(R) {
      var O;
      if (!b.opts.unevaluated)
        return;
      const q = (O = $?.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (b.props !== !0)
        if (q && !q.dynamicProps)
          q.props !== void 0 && (b.props = n.mergeEvaluated.props(g, q.props, b.props));
        else {
          const V = g.var("props", (0, s._)`${R}.evaluated.props`);
          b.props = n.mergeEvaluated.props(g, V, b.props, s.Name);
        }
      if (b.items !== !0)
        if (q && !q.dynamicItems)
          q.items !== void 0 && (b.items = n.mergeEvaluated.items(g, q.items, b.items));
        else {
          const V = g.var("items", (0, s._)`${R}.evaluated.items`);
          b.items = n.mergeEvaluated.items(g, V, b.items, s.Name);
        }
    }
  }
  return xe.callRef = l, xe.default = i, xe;
}
var Di;
function ah() {
  if (Di) return Lr;
  Di = 1, Object.defineProperty(Lr, "__esModule", { value: !0 });
  const e = nh(), t = sh(), s = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return Lr.default = s, Lr;
}
var Fr = {}, Ur = {}, Mi;
function oh() {
  if (Mi) return Ur;
  Mi = 1, Object.defineProperty(Ur, "__esModule", { value: !0 });
  const e = ne(), t = e.operators, s = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, r = {
    message: ({ keyword: n, schemaCode: i }) => (0, e.str)`must be ${s[n].okStr} ${i}`,
    params: ({ keyword: n, schemaCode: i }) => (0, e._)`{comparison: ${s[n].okStr}, limit: ${i}}`
  }, u = {
    keyword: Object.keys(s),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: r,
    code(n) {
      const { keyword: i, data: a, schemaCode: l } = n;
      n.fail$data((0, e._)`${a} ${s[i].fail} ${l} || isNaN(${a})`);
    }
  };
  return Ur.default = u, Ur;
}
var zr = {}, Li;
function ih() {
  if (Li) return zr;
  Li = 1, Object.defineProperty(zr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must be multiple of ${r}`,
      params: ({ schemaCode: r }) => (0, e._)`{multipleOf: ${r}}`
    },
    code(r) {
      const { gen: u, data: n, schemaCode: i, it: a } = r, l = a.opts.multipleOfPrecision, d = u.let("res"), c = l ? (0, e._)`Math.abs(Math.round(${d}) - ${d}) > 1e-${l}` : (0, e._)`${d} !== parseInt(${d})`;
      r.fail$data((0, e._)`(${i} === 0 || (${d} = ${n}/${i}, ${c}))`);
    }
  };
  return zr.default = s, zr;
}
var Gr = {}, Kr = {}, Vi;
function ch() {
  if (Vi) return Kr;
  Vi = 1, Object.defineProperty(Kr, "__esModule", { value: !0 });
  function e(t) {
    const s = t.length;
    let r = 0, u = 0, n;
    for (; u < s; )
      r++, n = t.charCodeAt(u++), n >= 55296 && n <= 56319 && u < s && (n = t.charCodeAt(u), (n & 64512) === 56320 && u++);
    return r;
  }
  return Kr.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Kr;
}
var Fi;
function uh() {
  if (Fi) return Gr;
  Fi = 1, Object.defineProperty(Gr, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = ch(), u = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const a = n === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${a} than ${i} characters`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: a, schemaCode: l, it: d } = n, c = i === "maxLength" ? e.operators.GT : e.operators.LT, $ = d.opts.unicode === !1 ? (0, e._)`${a}.length` : (0, e._)`${(0, t.useFunc)(n.gen, s.default)}(${a})`;
      n.fail$data((0, e._)`${$} ${c} ${l}`);
    }
  };
  return Gr.default = u, Gr;
}
var Xr = {}, Ui;
function lh() {
  if (Ui) return Xr;
  Ui = 1, Object.defineProperty(Xr, "__esModule", { value: !0 });
  const e = Le(), t = ne(), r = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: u }) => (0, t.str)`must match pattern "${u}"`,
      params: ({ schemaCode: u }) => (0, t._)`{pattern: ${u}}`
    },
    code(u) {
      const { data: n, $data: i, schema: a, schemaCode: l, it: d } = u, c = d.opts.unicodeRegExp ? "u" : "", $ = i ? (0, t._)`(new RegExp(${l}, ${c}))` : (0, e.usePattern)(u, a);
      u.fail$data((0, t._)`!${$}.test(${n})`);
    }
  };
  return Xr.default = r, Xr;
}
var Hr = {}, zi;
function dh() {
  if (zi) return Hr;
  zi = 1, Object.defineProperty(Hr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} properties`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: i } = r, a = u === "maxProperties" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`Object.keys(${n}).length ${a} ${i}`);
    }
  };
  return Hr.default = s, Hr;
}
var Br = {}, Gi;
function fh() {
  if (Gi) return Br;
  Gi = 1, Object.defineProperty(Br, "__esModule", { value: !0 });
  const e = Le(), t = ne(), s = ie(), u = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: n } }) => (0, t.str)`must have required property '${n}'`,
      params: ({ params: { missingProperty: n } }) => (0, t._)`{missingProperty: ${n}}`
    },
    code(n) {
      const { gen: i, schema: a, schemaCode: l, data: d, $data: c, it: $ } = n, { opts: _ } = $;
      if (!c && a.length === 0)
        return;
      const g = a.length >= _.loopRequired;
      if ($.allErrors ? b() : w(), _.strictRequired) {
        const o = n.parentSchema.properties, { definedProperties: p } = n.it;
        for (const E of a)
          if (o?.[E] === void 0 && !p.has(E)) {
            const m = $.schemaEnv.baseId + $.errSchemaPath, v = `required property "${E}" is not defined at "${m}" (strictRequired)`;
            (0, s.checkStrictMode)($, v, $.opts.strictRequired);
          }
      }
      function b() {
        if (g || c)
          n.block$data(t.nil, f);
        else
          for (const o of a)
            (0, e.checkReportMissingProp)(n, o);
      }
      function w() {
        const o = i.let("missing");
        if (g || c) {
          const p = i.let("valid", !0);
          n.block$data(p, () => y(o, p)), n.ok(p);
        } else
          i.if((0, e.checkMissingProp)(n, a, o)), (0, e.reportMissingProp)(n, o), i.else();
      }
      function f() {
        i.forOf("prop", l, (o) => {
          n.setParams({ missingProperty: o }), i.if((0, e.noPropertyInData)(i, d, o, _.ownProperties), () => n.error());
        });
      }
      function y(o, p) {
        n.setParams({ missingProperty: o }), i.forOf(o, l, () => {
          i.assign(p, (0, e.propertyInData)(i, d, o, _.ownProperties)), i.if((0, t.not)(p), () => {
            n.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return Br.default = u, Br;
}
var Jr = {}, Ki;
function hh() {
  if (Ki) return Jr;
  Ki = 1, Object.defineProperty(Jr, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: u }) {
        const n = r === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${n} than ${u} items`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: u, data: n, schemaCode: i } = r, a = u === "maxItems" ? e.operators.GT : e.operators.LT;
      r.fail$data((0, e._)`${n}.length ${a} ${i}`);
    }
  };
  return Jr.default = s, Jr;
}
var Wr = {}, Yr = {}, Xi;
function Ea() {
  if (Xi) return Yr;
  Xi = 1, Object.defineProperty(Yr, "__esModule", { value: !0 });
  const e = jn();
  return e.code = 'require("ajv/dist/runtime/equal").default', Yr.default = e, Yr;
}
var Hi;
function mh() {
  if (Hi) return Wr;
  Hi = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const e = Nn(), t = ne(), s = ie(), r = Ea(), n = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: a } }) => (0, t.str)`must NOT have duplicate items (items ## ${a} and ${i} are identical)`,
      params: ({ params: { i, j: a } }) => (0, t._)`{i: ${i}, j: ${a}}`
    },
    code(i) {
      const { gen: a, data: l, $data: d, schema: c, parentSchema: $, schemaCode: _, it: g } = i;
      if (!d && !c)
        return;
      const b = a.let("valid"), w = $.items ? (0, e.getSchemaTypes)($.items) : [];
      i.block$data(b, f, (0, t._)`${_} === false`), i.ok(b);
      function f() {
        const E = a.let("i", (0, t._)`${l}.length`), m = a.let("j");
        i.setParams({ i: E, j: m }), a.assign(b, !0), a.if((0, t._)`${E} > 1`, () => (y() ? o : p)(E, m));
      }
      function y() {
        return w.length > 0 && !w.some((E) => E === "object" || E === "array");
      }
      function o(E, m) {
        const v = a.name("item"), R = (0, e.checkDataTypes)(w, v, g.opts.strictNumbers, e.DataType.Wrong), O = a.const("indices", (0, t._)`{}`);
        a.for((0, t._)`;${E}--;`, () => {
          a.let(v, (0, t._)`${l}[${E}]`), a.if(R, (0, t._)`continue`), w.length > 1 && a.if((0, t._)`typeof ${v} == "string"`, (0, t._)`${v} += "_"`), a.if((0, t._)`typeof ${O}[${v}] == "number"`, () => {
            a.assign(m, (0, t._)`${O}[${v}]`), i.error(), a.assign(b, !1).break();
          }).code((0, t._)`${O}[${v}] = ${E}`);
        });
      }
      function p(E, m) {
        const v = (0, s.useFunc)(a, r.default), R = a.name("outer");
        a.label(R).for((0, t._)`;${E}--;`, () => a.for((0, t._)`${m} = ${E}; ${m}--;`, () => a.if((0, t._)`${v}(${l}[${E}], ${l}[${m}])`, () => {
          i.error(), a.assign(b, !1).break(R);
        })));
      }
    }
  };
  return Wr.default = n, Wr;
}
var Qr = {}, Bi;
function ph() {
  if (Bi) return Qr;
  Bi = 1, Object.defineProperty(Qr, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = Ea(), u = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValue: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: l, schemaCode: d, schema: c } = n;
      l || c && typeof c == "object" ? n.fail$data((0, e._)`!${(0, t.useFunc)(i, s.default)}(${a}, ${d})`) : n.fail((0, e._)`${c} !== ${a}`);
    }
  };
  return Qr.default = u, Qr;
}
var Zr = {}, Ji;
function yh() {
  if (Ji) return Zr;
  Ji = 1, Object.defineProperty(Zr, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = Ea(), u = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: n }) => (0, e._)`{allowedValues: ${n}}`
    },
    code(n) {
      const { gen: i, data: a, $data: l, schema: d, schemaCode: c, it: $ } = n;
      if (!l && d.length === 0)
        throw new Error("enum must have non-empty array");
      const _ = d.length >= $.opts.loopEnum;
      let g;
      const b = () => g ?? (g = (0, t.useFunc)(i, s.default));
      let w;
      if (_ || l)
        w = i.let("valid"), n.block$data(w, f);
      else {
        if (!Array.isArray(d))
          throw new Error("ajv implementation error");
        const o = i.const("vSchema", c);
        w = (0, e.or)(...d.map((p, E) => y(o, E)));
      }
      n.pass(w);
      function f() {
        i.assign(w, !1), i.forOf("v", c, (o) => i.if((0, e._)`${b()}(${a}, ${o})`, () => i.assign(w, !0).break()));
      }
      function y(o, p) {
        const E = d[p];
        return typeof E == "object" && E !== null ? (0, e._)`${b()}(${a}, ${o}[${p}])` : (0, e._)`${a} === ${E}`;
      }
    }
  };
  return Zr.default = u, Zr;
}
var Wi;
function vh() {
  if (Wi) return Fr;
  Wi = 1, Object.defineProperty(Fr, "__esModule", { value: !0 });
  const e = oh(), t = ih(), s = uh(), r = lh(), u = dh(), n = fh(), i = hh(), a = mh(), l = ph(), d = yh(), c = [
    // number
    e.default,
    t.default,
    // string
    s.default,
    r.default,
    // object
    u.default,
    n.default,
    // array
    i.default,
    a.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    l.default,
    d.default
  ];
  return Fr.default = c, Fr;
}
var xr = {}, gt = {}, Yi;
function Vu() {
  if (Yi) return gt;
  Yi = 1, Object.defineProperty(gt, "__esModule", { value: !0 }), gt.validateAdditionalItems = void 0;
  const e = ne(), t = ie(), r = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: n } }) => (0, e.str)`must NOT have more than ${n} items`,
      params: ({ params: { len: n } }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { parentSchema: i, it: a } = n, { items: l } = i;
      if (!Array.isArray(l)) {
        (0, t.checkStrictMode)(a, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      u(n, l);
    }
  };
  function u(n, i) {
    const { gen: a, schema: l, data: d, keyword: c, it: $ } = n;
    $.items = !0;
    const _ = a.const("len", (0, e._)`${d}.length`);
    if (l === !1)
      n.setParams({ len: i.length }), n.pass((0, e._)`${_} <= ${i.length}`);
    else if (typeof l == "object" && !(0, t.alwaysValidSchema)($, l)) {
      const b = a.var("valid", (0, e._)`${_} <= ${i.length}`);
      a.if((0, e.not)(b), () => g(b)), n.ok(b);
    }
    function g(b) {
      a.forRange("i", i.length, _, (w) => {
        n.subschema({ keyword: c, dataProp: w, dataPropType: t.Type.Num }, b), $.allErrors || a.if((0, e.not)(b), () => a.break());
      });
    }
  }
  return gt.validateAdditionalItems = u, gt.default = r, gt;
}
var en = {}, $t = {}, Qi;
function Fu() {
  if (Qi) return $t;
  Qi = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.validateTuple = void 0;
  const e = ne(), t = ie(), s = Le(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(n) {
      const { schema: i, it: a } = n;
      if (Array.isArray(i))
        return u(n, "additionalItems", i);
      a.items = !0, !(0, t.alwaysValidSchema)(a, i) && n.ok((0, s.validateArray)(n));
    }
  };
  function u(n, i, a = n.schema) {
    const { gen: l, parentSchema: d, data: c, keyword: $, it: _ } = n;
    w(d), _.opts.unevaluated && a.length && _.items !== !0 && (_.items = t.mergeEvaluated.items(l, a.length, _.items));
    const g = l.name("valid"), b = l.const("len", (0, e._)`${c}.length`);
    a.forEach((f, y) => {
      (0, t.alwaysValidSchema)(_, f) || (l.if((0, e._)`${b} > ${y}`, () => n.subschema({
        keyword: $,
        schemaProp: y,
        dataProp: y
      }, g)), n.ok(g));
    });
    function w(f) {
      const { opts: y, errSchemaPath: o } = _, p = a.length, E = p === f.minItems && (p === f.maxItems || f[i] === !1);
      if (y.strictTuples && !E) {
        const m = `"${$}" is ${p}-tuple, but minItems or maxItems/${i} are not specified or different at path "${o}"`;
        (0, t.checkStrictMode)(_, m, y.strictTuples);
      }
    }
  }
  return $t.validateTuple = u, $t.default = r, $t;
}
var Zi;
function _h() {
  if (Zi) return en;
  Zi = 1, Object.defineProperty(en, "__esModule", { value: !0 });
  const e = Fu(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (s) => (0, e.validateTuple)(s, "items")
  };
  return en.default = t, en;
}
var tn = {}, xi;
function gh() {
  if (xi) return tn;
  xi = 1, Object.defineProperty(tn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), s = Le(), r = Vu(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: a, parentSchema: l, it: d } = i, { prefixItems: c } = l;
      d.items = !0, !(0, t.alwaysValidSchema)(d, a) && (c ? (0, r.validateAdditionalItems)(i, c) : i.ok((0, s.validateArray)(i)));
    }
  };
  return tn.default = n, tn;
}
var rn = {}, ec;
function $h() {
  if (ec) return rn;
  ec = 1, Object.defineProperty(rn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e.str)`must contain at least ${u} valid item(s)` : (0, e.str)`must contain at least ${u} and no more than ${n} valid item(s)`,
      params: ({ params: { min: u, max: n } }) => n === void 0 ? (0, e._)`{minContains: ${u}}` : (0, e._)`{minContains: ${u}, maxContains: ${n}}`
    },
    code(u) {
      const { gen: n, schema: i, parentSchema: a, data: l, it: d } = u;
      let c, $;
      const { minContains: _, maxContains: g } = a;
      d.opts.next ? (c = _ === void 0 ? 1 : _, $ = g) : c = 1;
      const b = n.const("len", (0, e._)`${l}.length`);
      if (u.setParams({ min: c, max: $ }), $ === void 0 && c === 0) {
        (0, t.checkStrictMode)(d, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if ($ !== void 0 && c > $) {
        (0, t.checkStrictMode)(d, '"minContains" > "maxContains" is always invalid'), u.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(d, i)) {
        let p = (0, e._)`${b} >= ${c}`;
        $ !== void 0 && (p = (0, e._)`${p} && ${b} <= ${$}`), u.pass(p);
        return;
      }
      d.items = !0;
      const w = n.name("valid");
      $ === void 0 && c === 1 ? y(w, () => n.if(w, () => n.break())) : c === 0 ? (n.let(w, !0), $ !== void 0 && n.if((0, e._)`${l}.length > 0`, f)) : (n.let(w, !1), f()), u.result(w, () => u.reset());
      function f() {
        const p = n.name("_valid"), E = n.let("count", 0);
        y(p, () => n.if(p, () => o(E)));
      }
      function y(p, E) {
        n.forRange("i", 0, b, (m) => {
          u.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), E();
        });
      }
      function o(p) {
        n.code((0, e._)`${p}++`), $ === void 0 ? n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0).break()) : (n.if((0, e._)`${p} > ${$}`, () => n.assign(w, !1).break()), c === 1 ? n.assign(w, !0) : n.if((0, e._)`${p} >= ${c}`, () => n.assign(w, !0)));
      }
    }
  };
  return rn.default = r, rn;
}
var hs = {}, tc;
function Eh() {
  return tc || (tc = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = ne(), s = ie(), r = Le();
    e.error = {
      message: ({ params: { property: l, depsCount: d, deps: c } }) => {
        const $ = d === 1 ? "property" : "properties";
        return (0, t.str)`must have ${$} ${c} when property ${l} is present`;
      },
      params: ({ params: { property: l, depsCount: d, deps: c, missingProperty: $ } }) => (0, t._)`{property: ${l},
    missingProperty: ${$},
    depsCount: ${d},
    deps: ${c}}`
      // TODO change to reference
    };
    const u = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(l) {
        const [d, c] = n(l);
        i(l, d), a(l, c);
      }
    };
    function n({ schema: l }) {
      const d = {}, c = {};
      for (const $ in l) {
        if ($ === "__proto__")
          continue;
        const _ = Array.isArray(l[$]) ? d : c;
        _[$] = l[$];
      }
      return [d, c];
    }
    function i(l, d = l.schema) {
      const { gen: c, data: $, it: _ } = l;
      if (Object.keys(d).length === 0)
        return;
      const g = c.let("missing");
      for (const b in d) {
        const w = d[b];
        if (w.length === 0)
          continue;
        const f = (0, r.propertyInData)(c, $, b, _.opts.ownProperties);
        l.setParams({
          property: b,
          depsCount: w.length,
          deps: w.join(", ")
        }), _.allErrors ? c.if(f, () => {
          for (const y of w)
            (0, r.checkReportMissingProp)(l, y);
        }) : (c.if((0, t._)`${f} && (${(0, r.checkMissingProp)(l, w, g)})`), (0, r.reportMissingProp)(l, g), c.else());
      }
    }
    e.validatePropertyDeps = i;
    function a(l, d = l.schema) {
      const { gen: c, data: $, keyword: _, it: g } = l, b = c.name("valid");
      for (const w in d)
        (0, s.alwaysValidSchema)(g, d[w]) || (c.if(
          (0, r.propertyInData)(c, $, w, g.opts.ownProperties),
          () => {
            const f = l.subschema({ keyword: _, schemaProp: w }, b);
            l.mergeValidEvaluated(f, b);
          },
          () => c.var(b, !0)
          // TODO var
        ), l.ok(b));
    }
    e.validateSchemaDeps = a, e.default = u;
  })(hs)), hs;
}
var nn = {}, rc;
function wh() {
  if (rc) return nn;
  rc = 1, Object.defineProperty(nn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: u }) => (0, e._)`{propertyName: ${u.propertyName}}`
    },
    code(u) {
      const { gen: n, schema: i, data: a, it: l } = u;
      if ((0, t.alwaysValidSchema)(l, i))
        return;
      const d = n.name("valid");
      n.forIn("key", a, (c) => {
        u.setParams({ propertyName: c }), u.subschema({
          keyword: "propertyNames",
          data: c,
          dataTypes: ["string"],
          propertyName: c,
          compositeRule: !0
        }, d), n.if((0, e.not)(d), () => {
          u.error(!0), l.allErrors || n.break();
        });
      }), u.ok(d);
    }
  };
  return nn.default = r, nn;
}
var sn = {}, nc;
function Uu() {
  if (nc) return sn;
  nc = 1, Object.defineProperty(sn, "__esModule", { value: !0 });
  const e = Le(), t = ne(), s = nt(), r = ie(), n = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: i }) => (0, t._)`{additionalProperty: ${i.additionalProperty}}`
    },
    code(i) {
      const { gen: a, schema: l, parentSchema: d, data: c, errsCount: $, it: _ } = i;
      if (!$)
        throw new Error("ajv implementation error");
      const { allErrors: g, opts: b } = _;
      if (_.props = !0, b.removeAdditional !== "all" && (0, r.alwaysValidSchema)(_, l))
        return;
      const w = (0, e.allSchemaProperties)(d.properties), f = (0, e.allSchemaProperties)(d.patternProperties);
      y(), i.ok((0, t._)`${$} === ${s.default.errors}`);
      function y() {
        a.forIn("key", c, (v) => {
          !w.length && !f.length ? E(v) : a.if(o(v), () => E(v));
        });
      }
      function o(v) {
        let R;
        if (w.length > 8) {
          const O = (0, r.schemaRefOrVal)(_, d.properties, "properties");
          R = (0, e.isOwnProperty)(a, O, v);
        } else w.length ? R = (0, t.or)(...w.map((O) => (0, t._)`${v} === ${O}`)) : R = t.nil;
        return f.length && (R = (0, t.or)(R, ...f.map((O) => (0, t._)`${(0, e.usePattern)(i, O)}.test(${v})`))), (0, t.not)(R);
      }
      function p(v) {
        a.code((0, t._)`delete ${c}[${v}]`);
      }
      function E(v) {
        if (b.removeAdditional === "all" || b.removeAdditional && l === !1) {
          p(v);
          return;
        }
        if (l === !1) {
          i.setParams({ additionalProperty: v }), i.error(), g || a.break();
          return;
        }
        if (typeof l == "object" && !(0, r.alwaysValidSchema)(_, l)) {
          const R = a.name("valid");
          b.removeAdditional === "failing" ? (m(v, R, !1), a.if((0, t.not)(R), () => {
            i.reset(), p(v);
          })) : (m(v, R), g || a.if((0, t.not)(R), () => a.break()));
        }
      }
      function m(v, R, O) {
        const q = {
          keyword: "additionalProperties",
          dataProp: v,
          dataPropType: r.Type.Str
        };
        O === !1 && Object.assign(q, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(q, R);
      }
    }
  };
  return sn.default = n, sn;
}
var an = {}, sc;
function bh() {
  if (sc) return an;
  sc = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  const e = Ln(), t = Le(), s = ie(), r = Uu(), u = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, parentSchema: l, data: d, it: c } = n;
      c.opts.removeAdditional === "all" && l.additionalProperties === void 0 && r.default.code(new e.KeywordCxt(c, r.default, "additionalProperties"));
      const $ = (0, t.allSchemaProperties)(a);
      for (const f of $)
        c.definedProperties.add(f);
      c.opts.unevaluated && $.length && c.props !== !0 && (c.props = s.mergeEvaluated.props(i, (0, s.toHash)($), c.props));
      const _ = $.filter((f) => !(0, s.alwaysValidSchema)(c, a[f]));
      if (_.length === 0)
        return;
      const g = i.name("valid");
      for (const f of _)
        b(f) ? w(f) : (i.if((0, t.propertyInData)(i, d, f, c.opts.ownProperties)), w(f), c.allErrors || i.else().var(g, !0), i.endIf()), n.it.definedProperties.add(f), n.ok(g);
      function b(f) {
        return c.opts.useDefaults && !c.compositeRule && a[f].default !== void 0;
      }
      function w(f) {
        n.subschema({
          keyword: "properties",
          schemaProp: f,
          dataProp: f
        }, g);
      }
    }
  };
  return an.default = u, an;
}
var on = {}, ac;
function Sh() {
  if (ac) return on;
  ac = 1, Object.defineProperty(on, "__esModule", { value: !0 });
  const e = Le(), t = ne(), s = ie(), r = ie(), u = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(n) {
      const { gen: i, schema: a, data: l, parentSchema: d, it: c } = n, { opts: $ } = c, _ = (0, e.allSchemaProperties)(a), g = _.filter((E) => (0, s.alwaysValidSchema)(c, a[E]));
      if (_.length === 0 || g.length === _.length && (!c.opts.unevaluated || c.props === !0))
        return;
      const b = $.strictSchema && !$.allowMatchingProperties && d.properties, w = i.name("valid");
      c.props !== !0 && !(c.props instanceof t.Name) && (c.props = (0, r.evaluatedPropsToName)(i, c.props));
      const { props: f } = c;
      y();
      function y() {
        for (const E of _)
          b && o(E), c.allErrors ? p(E) : (i.var(w, !0), p(E), i.if(w));
      }
      function o(E) {
        for (const m in b)
          new RegExp(E).test(m) && (0, s.checkStrictMode)(c, `property ${m} matches pattern ${E} (use allowMatchingProperties)`);
      }
      function p(E) {
        i.forIn("key", l, (m) => {
          i.if((0, t._)`${(0, e.usePattern)(n, E)}.test(${m})`, () => {
            const v = g.includes(E);
            v || n.subschema({
              keyword: "patternProperties",
              schemaProp: E,
              dataProp: m,
              dataPropType: r.Type.Str
            }, w), c.opts.unevaluated && f !== !0 ? i.assign((0, t._)`${f}[${m}]`, !0) : !v && !c.allErrors && i.if((0, t.not)(w), () => i.break());
          });
        });
      }
    }
  };
  return on.default = u, on;
}
var cn = {}, oc;
function Rh() {
  if (oc) return cn;
  oc = 1, Object.defineProperty(cn, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(s) {
      const { gen: r, schema: u, it: n } = s;
      if ((0, e.alwaysValidSchema)(n, u)) {
        s.fail();
        return;
      }
      const i = r.name("valid");
      s.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), s.failResult(i, () => s.reset(), () => s.error());
    },
    error: { message: "must NOT be valid" }
  };
  return cn.default = t, cn;
}
var un = {}, ic;
function Ph() {
  if (ic) return un;
  ic = 1, Object.defineProperty(un, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Le().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return un.default = t, un;
}
var ln = {}, cc;
function Nh() {
  if (cc) return ln;
  cc = 1, Object.defineProperty(ln, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: u }) => (0, e._)`{passingSchemas: ${u.passing}}`
    },
    code(u) {
      const { gen: n, schema: i, parentSchema: a, it: l } = u;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (l.opts.discriminator && a.discriminator)
        return;
      const d = i, c = n.let("valid", !1), $ = n.let("passing", null), _ = n.name("_valid");
      u.setParams({ passing: $ }), n.block(g), u.result(c, () => u.reset(), () => u.error(!0));
      function g() {
        d.forEach((b, w) => {
          let f;
          (0, t.alwaysValidSchema)(l, b) ? n.var(_, !0) : f = u.subschema({
            keyword: "oneOf",
            schemaProp: w,
            compositeRule: !0
          }, _), w > 0 && n.if((0, e._)`${_} && ${c}`).assign(c, !1).assign($, (0, e._)`[${$}, ${w}]`).else(), n.if(_, () => {
            n.assign(c, !0), n.assign($, w), f && u.mergeEvaluated(f, e.Name);
          });
        });
      }
    }
  };
  return ln.default = r, ln;
}
var dn = {}, uc;
function Th() {
  if (uc) return dn;
  uc = 1, Object.defineProperty(dn, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(s) {
      const { gen: r, schema: u, it: n } = s;
      if (!Array.isArray(u))
        throw new Error("ajv implementation error");
      const i = r.name("valid");
      u.forEach((a, l) => {
        if ((0, e.alwaysValidSchema)(n, a))
          return;
        const d = s.subschema({ keyword: "allOf", schemaProp: l }, i);
        s.ok(i), s.mergeEvaluated(d);
      });
    }
  };
  return dn.default = t, dn;
}
var fn = {}, lc;
function Ih() {
  if (lc) return fn;
  lc = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  const e = ne(), t = ie(), r = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: n }) => (0, e.str)`must match "${n.ifClause}" schema`,
      params: ({ params: n }) => (0, e._)`{failingKeyword: ${n.ifClause}}`
    },
    code(n) {
      const { gen: i, parentSchema: a, it: l } = n;
      a.then === void 0 && a.else === void 0 && (0, t.checkStrictMode)(l, '"if" without "then" and "else" is ignored');
      const d = u(l, "then"), c = u(l, "else");
      if (!d && !c)
        return;
      const $ = i.let("valid", !0), _ = i.name("_valid");
      if (g(), n.reset(), d && c) {
        const w = i.let("ifClause");
        n.setParams({ ifClause: w }), i.if(_, b("then", w), b("else", w));
      } else d ? i.if(_, b("then")) : i.if((0, e.not)(_), b("else"));
      n.pass($, () => n.error(!0));
      function g() {
        const w = n.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, _);
        n.mergeEvaluated(w);
      }
      function b(w, f) {
        return () => {
          const y = n.subschema({ keyword: w }, _);
          i.assign($, _), n.mergeValidEvaluated(y, $), f ? i.assign(f, (0, e._)`${w}`) : n.setParams({ ifClause: w });
        };
      }
    }
  };
  function u(n, i) {
    const a = n.schema[i];
    return a !== void 0 && !(0, t.alwaysValidSchema)(n, a);
  }
  return fn.default = r, fn;
}
var hn = {}, dc;
function Oh() {
  if (dc) return hn;
  dc = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  const e = ie(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: s, parentSchema: r, it: u }) {
      r.if === void 0 && (0, e.checkStrictMode)(u, `"${s}" without "if" is ignored`);
    }
  };
  return hn.default = t, hn;
}
var fc;
function jh() {
  if (fc) return xr;
  fc = 1, Object.defineProperty(xr, "__esModule", { value: !0 });
  const e = Vu(), t = _h(), s = Fu(), r = gh(), u = $h(), n = Eh(), i = wh(), a = Uu(), l = bh(), d = Sh(), c = Rh(), $ = Ph(), _ = Nh(), g = Th(), b = Ih(), w = Oh();
  function f(y = !1) {
    const o = [
      // any
      c.default,
      $.default,
      _.default,
      g.default,
      b.default,
      w.default,
      // object
      i.default,
      a.default,
      n.default,
      l.default,
      d.default
    ];
    return y ? o.push(t.default, r.default) : o.push(e.default, s.default), o.push(u.default), o;
  }
  return xr.default = f, xr;
}
var mn = {}, pn = {}, hc;
function Ah() {
  if (hc) return pn;
  hc = 1, Object.defineProperty(pn, "__esModule", { value: !0 });
  const e = ne(), s = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: r }) => (0, e.str)`must match format "${r}"`,
      params: ({ schemaCode: r }) => (0, e._)`{format: ${r}}`
    },
    code(r, u) {
      const { gen: n, data: i, $data: a, schema: l, schemaCode: d, it: c } = r, { opts: $, errSchemaPath: _, schemaEnv: g, self: b } = c;
      if (!$.validateFormats)
        return;
      a ? w() : f();
      function w() {
        const y = n.scopeValue("formats", {
          ref: b.formats,
          code: $.code.formats
        }), o = n.const("fDef", (0, e._)`${y}[${d}]`), p = n.let("fType"), E = n.let("format");
        n.if((0, e._)`typeof ${o} == "object" && !(${o} instanceof RegExp)`, () => n.assign(p, (0, e._)`${o}.type || "string"`).assign(E, (0, e._)`${o}.validate`), () => n.assign(p, (0, e._)`"string"`).assign(E, o)), r.fail$data((0, e.or)(m(), v()));
        function m() {
          return $.strictSchema === !1 ? e.nil : (0, e._)`${d} && !${E}`;
        }
        function v() {
          const R = g.$async ? (0, e._)`(${o}.async ? await ${E}(${i}) : ${E}(${i}))` : (0, e._)`${E}(${i})`, O = (0, e._)`(typeof ${E} == "function" ? ${R} : ${E}.test(${i}))`;
          return (0, e._)`${E} && ${E} !== true && ${p} === ${u} && !${O}`;
        }
      }
      function f() {
        const y = b.formats[l];
        if (!y) {
          m();
          return;
        }
        if (y === !0)
          return;
        const [o, p, E] = v(y);
        o === u && r.pass(R());
        function m() {
          if ($.strictSchema === !1) {
            b.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${l}" ignored in schema at path "${_}"`;
          }
        }
        function v(O) {
          const q = O instanceof RegExp ? (0, e.regexpCode)(O) : $.code.formats ? (0, e._)`${$.code.formats}${(0, e.getProperty)(l)}` : void 0, V = n.scopeValue("formats", { key: l, ref: O, code: q });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${V}.validate`] : ["string", O, V];
        }
        function R() {
          if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
            if (!g.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${E}(${i})`;
          }
          return typeof p == "function" ? (0, e._)`${E}(${i})` : (0, e._)`${E}.test(${i})`;
        }
      }
    }
  };
  return pn.default = s, pn;
}
var mc;
function kh() {
  if (mc) return mn;
  mc = 1, Object.defineProperty(mn, "__esModule", { value: !0 });
  const t = [Ah().default];
  return mn.default = t, mn;
}
var ht = {}, pc;
function Ch() {
  return pc || (pc = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.contentVocabulary = ht.metadataVocabulary = void 0, ht.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], ht.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), ht;
}
var yc;
function qh() {
  if (yc) return Mr;
  yc = 1, Object.defineProperty(Mr, "__esModule", { value: !0 });
  const e = ah(), t = vh(), s = jh(), r = kh(), u = Ch(), n = [
    e.default,
    t.default,
    (0, s.default)(),
    r.default,
    u.metadataVocabulary,
    u.contentVocabulary
  ];
  return Mr.default = n, Mr;
}
var yn = {}, At = {}, vc;
function Dh() {
  if (vc) return At;
  vc = 1, Object.defineProperty(At, "__esModule", { value: !0 }), At.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (At.DiscrError = e = {})), At;
}
var _c;
function Mh() {
  if (_c) return yn;
  _c = 1, Object.defineProperty(yn, "__esModule", { value: !0 });
  const e = ne(), t = Dh(), s = $a(), r = Vn(), u = ie(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: a, tagName: l } }) => a === t.DiscrError.Tag ? `tag "${l}" must be string` : `value of tag "${l}" must be in oneOf`,
      params: ({ params: { discrError: a, tag: l, tagName: d } }) => (0, e._)`{error: ${a}, tag: ${d}, tagValue: ${l}}`
    },
    code(a) {
      const { gen: l, data: d, schema: c, parentSchema: $, it: _ } = a, { oneOf: g } = $;
      if (!_.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const b = c.propertyName;
      if (typeof b != "string")
        throw new Error("discriminator: requires propertyName");
      if (c.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!g)
        throw new Error("discriminator: requires oneOf keyword");
      const w = l.let("valid", !1), f = l.const("tag", (0, e._)`${d}${(0, e.getProperty)(b)}`);
      l.if((0, e._)`typeof ${f} == "string"`, () => y(), () => a.error(!1, { discrError: t.DiscrError.Tag, tag: f, tagName: b })), a.ok(w);
      function y() {
        const E = p();
        l.if(!1);
        for (const m in E)
          l.elseIf((0, e._)`${f} === ${m}`), l.assign(w, o(E[m]));
        l.else(), a.error(!1, { discrError: t.DiscrError.Mapping, tag: f, tagName: b }), l.endIf();
      }
      function o(E) {
        const m = l.name("valid"), v = a.subschema({ keyword: "oneOf", schemaProp: E }, m);
        return a.mergeEvaluated(v, e.Name), m;
      }
      function p() {
        var E;
        const m = {}, v = O($);
        let R = !0;
        for (let D = 0; D < g.length; D++) {
          let U = g[D];
          if (U?.$ref && !(0, u.schemaHasRulesButRef)(U, _.self.RULES)) {
            const M = U.$ref;
            if (U = s.resolveRef.call(_.self, _.schemaEnv.root, _.baseId, M), U instanceof s.SchemaEnv && (U = U.schema), U === void 0)
              throw new r.default(_.opts.uriResolver, _.baseId, M);
          }
          const z = (E = U?.properties) === null || E === void 0 ? void 0 : E[b];
          if (typeof z != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${b}"`);
          R = R && (v || O(U)), q(z, D);
        }
        if (!R)
          throw new Error(`discriminator: "${b}" must be required`);
        return m;
        function O({ required: D }) {
          return Array.isArray(D) && D.includes(b);
        }
        function q(D, U) {
          if (D.const)
            V(D.const, U);
          else if (D.enum)
            for (const z of D.enum)
              V(z, U);
          else
            throw new Error(`discriminator: "properties/${b}" must have "const" or "enum"`);
        }
        function V(D, U) {
          if (typeof D != "string" || D in m)
            throw new Error(`discriminator: "${b}" values must be unique strings`);
          m[D] = U;
        }
      }
    }
  };
  return yn.default = i, yn;
}
const Lh = "http://json-schema.org/draft-07/schema#", Vh = "http://json-schema.org/draft-07/schema#", Fh = "Core schema meta-schema", Uh = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, zh = ["object", "boolean"], Gh = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, Kh = {
  $schema: Lh,
  $id: Vh,
  title: Fh,
  definitions: Uh,
  type: zh,
  properties: Gh,
  default: !0
};
var gc;
function Xh() {
  return gc || (gc = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const s = rh(), r = qh(), u = Mh(), n = Kh, i = ["/properties"], a = "http://json-schema.org/draft-07/schema";
    class l extends s.default {
      _addVocabularies() {
        super._addVocabularies(), r.default.forEach((b) => this.addVocabulary(b)), this.opts.discriminator && this.addKeyword(u.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const b = this.opts.$data ? this.$dataMetaSchema(n, i) : n;
        this.addMetaSchema(b, a, !1), this.refs["http://json-schema.org/schema"] = a;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(a) ? a : void 0);
      }
    }
    t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
    var d = Ln();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return d.KeywordCxt;
    } });
    var c = ne();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return c._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return c.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return c.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return c.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return c.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return c.CodeGen;
    } });
    var $ = ga();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return $.default;
    } });
    var _ = Vn();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return _.default;
    } });
  })(Ar, Ar.exports)), Ar.exports;
}
var $c;
function Hh() {
  return $c || ($c = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = Xh(), s = ne(), r = s.operators, u = {
      formatMaximum: { okStr: "<=", ok: r.LTE, fail: r.GT },
      formatMinimum: { okStr: ">=", ok: r.GTE, fail: r.LT },
      formatExclusiveMaximum: { okStr: "<", ok: r.LT, fail: r.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: r.GT, fail: r.LTE }
    }, n = {
      message: ({ keyword: a, schemaCode: l }) => (0, s.str)`should be ${u[a].okStr} ${l}`,
      params: ({ keyword: a, schemaCode: l }) => (0, s._)`{comparison: ${u[a].okStr}, limit: ${l}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(u),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: n,
      code(a) {
        const { gen: l, data: d, schemaCode: c, keyword: $, it: _ } = a, { opts: g, self: b } = _;
        if (!g.validateFormats)
          return;
        const w = new t.KeywordCxt(_, b.RULES.all.format.definition, "format");
        w.$data ? f() : y();
        function f() {
          const p = l.scopeValue("formats", {
            ref: b.formats,
            code: g.code.formats
          }), E = l.const("fmt", (0, s._)`${p}[${w.schemaCode}]`);
          a.fail$data((0, s.or)((0, s._)`typeof ${E} != "object"`, (0, s._)`${E} instanceof RegExp`, (0, s._)`typeof ${E}.compare != "function"`, o(E)));
        }
        function y() {
          const p = w.schema, E = b.formats[p];
          if (!E || E === !0)
            return;
          if (typeof E != "object" || E instanceof RegExp || typeof E.compare != "function")
            throw new Error(`"${$}": format "${p}" does not define "compare" function`);
          const m = l.scopeValue("formats", {
            key: p,
            ref: E,
            code: g.code.formats ? (0, s._)`${g.code.formats}${(0, s.getProperty)(p)}` : void 0
          });
          a.fail$data(o(m));
        }
        function o(p) {
          return (0, s._)`${p}.compare(${d}, ${c}) ${u[$].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const i = (a) => (a.addKeyword(e.formatLimitDefinition), a);
    e.default = i;
  })(os)), os;
}
var Ec;
function Bh() {
  return Ec || (Ec = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const s = zf(), r = Hh(), u = ne(), n = new u.Name("fullFormats"), i = new u.Name("fastFormats"), a = (d, c = { keywords: !0 }) => {
      if (Array.isArray(c))
        return l(d, c, s.fullFormats, n), d;
      const [$, _] = c.mode === "fast" ? [s.fastFormats, i] : [s.fullFormats, n], g = c.formats || s.formatNames;
      return l(d, g, $, _), c.keywords && (0, r.default)(d), d;
    };
    a.get = (d, c = "full") => {
      const _ = (c === "fast" ? s.fastFormats : s.fullFormats)[d];
      if (!_)
        throw new Error(`Unknown format "${d}"`);
      return _;
    };
    function l(d, c, $, _) {
      var g, b;
      (g = (b = d.opts.code).formats) !== null && g !== void 0 || (b.formats = (0, u._)`require("ajv-formats/dist/formats").${_}`);
      for (const w of c)
        d.addFormat(w, $[w]);
    }
    e.exports = t = a, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = a;
  })(jr, jr.exports)), jr.exports;
}
var Jh = Bh();
const Wh = /* @__PURE__ */ Nu(Jh), Yh = (e, t, s, r) => {
  if (s === "length" || s === "prototype" || s === "arguments" || s === "caller")
    return;
  const u = Object.getOwnPropertyDescriptor(e, s), n = Object.getOwnPropertyDescriptor(t, s);
  !Qh(u, n) && r || Object.defineProperty(e, s, n);
}, Qh = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Zh = (e, t) => {
  const s = Object.getPrototypeOf(t);
  s !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, s);
}, xh = (e, t) => `/* Wrapped ${e}*/
${t}`, em = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), tm = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), rm = (e, t, s) => {
  const r = s === "" ? "" : `with ${s.trim()}() `, u = xh.bind(null, r, t.toString());
  Object.defineProperty(u, "name", tm);
  const { writable: n, enumerable: i, configurable: a } = em;
  Object.defineProperty(e, "toString", { value: u, writable: n, enumerable: i, configurable: a });
};
function nm(e, t, { ignoreNonConfigurable: s = !1 } = {}) {
  const { name: r } = e;
  for (const u of Reflect.ownKeys(t))
    Yh(e, t, u, s);
  return Zh(e, t), rm(e, t, r), e;
}
const wc = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: s = 0,
    maxWait: r = Number.POSITIVE_INFINITY,
    before: u = !1,
    after: n = !0
  } = t;
  if (s < 0 || r < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!u && !n)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, a, l;
  const d = function(...c) {
    const $ = this, _ = () => {
      i = void 0, a && (clearTimeout(a), a = void 0), n && (l = e.apply($, c));
    }, g = () => {
      a = void 0, i && (clearTimeout(i), i = void 0), n && (l = e.apply($, c));
    }, b = u && !i;
    return clearTimeout(i), i = setTimeout(_, s), r > 0 && r !== Number.POSITIVE_INFINITY && !a && (a = setTimeout(g, r)), b && (l = e.apply($, c)), l;
  };
  return nm(d, e), d.cancel = () => {
    i && (clearTimeout(i), i = void 0), a && (clearTimeout(a), a = void 0);
  }, d;
};
var vn = { exports: {} }, ms, bc;
function Fn() {
  if (bc) return ms;
  bc = 1;
  const e = "2.0.0", t = 256, s = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, r = 16, u = t - 6;
  return ms = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: u,
    MAX_SAFE_INTEGER: s,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, ms;
}
var ps, Sc;
function Un() {
  return Sc || (Sc = 1, ps = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), ps;
}
var Rc;
function kt() {
  return Rc || (Rc = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: s,
      MAX_SAFE_BUILD_LENGTH: r,
      MAX_LENGTH: u
    } = Fn(), n = Un();
    t = e.exports = {};
    const i = t.re = [], a = t.safeRe = [], l = t.src = [], d = t.safeSrc = [], c = t.t = {};
    let $ = 0;
    const _ = "[a-zA-Z0-9-]", g = [
      ["\\s", 1],
      ["\\d", u],
      [_, r]
    ], b = (f) => {
      for (const [y, o] of g)
        f = f.split(`${y}*`).join(`${y}{0,${o}}`).split(`${y}+`).join(`${y}{1,${o}}`);
      return f;
    }, w = (f, y, o) => {
      const p = b(y), E = $++;
      n(f, E, y), c[f] = E, l[E] = y, d[E] = p, i[E] = new RegExp(y, o ? "g" : void 0), a[E] = new RegExp(p, o ? "g" : void 0);
    };
    w("NUMERICIDENTIFIER", "0|[1-9]\\d*"), w("NUMERICIDENTIFIERLOOSE", "\\d+"), w("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${_}*`), w("MAINVERSION", `(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})\\.(${l[c.NUMERICIDENTIFIER]})`), w("MAINVERSIONLOOSE", `(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})\\.(${l[c.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASEIDENTIFIER", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIER]})`), w("PRERELEASEIDENTIFIERLOOSE", `(?:${l[c.NONNUMERICIDENTIFIER]}|${l[c.NUMERICIDENTIFIERLOOSE]})`), w("PRERELEASE", `(?:-(${l[c.PRERELEASEIDENTIFIER]}(?:\\.${l[c.PRERELEASEIDENTIFIER]})*))`), w("PRERELEASELOOSE", `(?:-?(${l[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[c.PRERELEASEIDENTIFIERLOOSE]})*))`), w("BUILDIDENTIFIER", `${_}+`), w("BUILD", `(?:\\+(${l[c.BUILDIDENTIFIER]}(?:\\.${l[c.BUILDIDENTIFIER]})*))`), w("FULLPLAIN", `v?${l[c.MAINVERSION]}${l[c.PRERELEASE]}?${l[c.BUILD]}?`), w("FULL", `^${l[c.FULLPLAIN]}$`), w("LOOSEPLAIN", `[v=\\s]*${l[c.MAINVERSIONLOOSE]}${l[c.PRERELEASELOOSE]}?${l[c.BUILD]}?`), w("LOOSE", `^${l[c.LOOSEPLAIN]}$`), w("GTLT", "((?:<|>)?=?)"), w("XRANGEIDENTIFIERLOOSE", `${l[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), w("XRANGEIDENTIFIER", `${l[c.NUMERICIDENTIFIER]}|x|X|\\*`), w("XRANGEPLAIN", `[v=\\s]*(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:\\.(${l[c.XRANGEIDENTIFIER]})(?:${l[c.PRERELEASE]})?${l[c.BUILD]}?)?)?`), w("XRANGEPLAINLOOSE", `[v=\\s]*(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[c.XRANGEIDENTIFIERLOOSE]})(?:${l[c.PRERELEASELOOSE]})?${l[c.BUILD]}?)?)?`), w("XRANGE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAIN]}$`), w("XRANGELOOSE", `^${l[c.GTLT]}\\s*${l[c.XRANGEPLAINLOOSE]}$`), w("COERCEPLAIN", `(^|[^\\d])(\\d{1,${s}})(?:\\.(\\d{1,${s}}))?(?:\\.(\\d{1,${s}}))?`), w("COERCE", `${l[c.COERCEPLAIN]}(?:$|[^\\d])`), w("COERCEFULL", l[c.COERCEPLAIN] + `(?:${l[c.PRERELEASE]})?(?:${l[c.BUILD]})?(?:$|[^\\d])`), w("COERCERTL", l[c.COERCE], !0), w("COERCERTLFULL", l[c.COERCEFULL], !0), w("LONETILDE", "(?:~>?)"), w("TILDETRIM", `(\\s*)${l[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", w("TILDE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAIN]}$`), w("TILDELOOSE", `^${l[c.LONETILDE]}${l[c.XRANGEPLAINLOOSE]}$`), w("LONECARET", "(?:\\^)"), w("CARETTRIM", `(\\s*)${l[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", w("CARET", `^${l[c.LONECARET]}${l[c.XRANGEPLAIN]}$`), w("CARETLOOSE", `^${l[c.LONECARET]}${l[c.XRANGEPLAINLOOSE]}$`), w("COMPARATORLOOSE", `^${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]})$|^$`), w("COMPARATOR", `^${l[c.GTLT]}\\s*(${l[c.FULLPLAIN]})$|^$`), w("COMPARATORTRIM", `(\\s*)${l[c.GTLT]}\\s*(${l[c.LOOSEPLAIN]}|${l[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", w("HYPHENRANGE", `^\\s*(${l[c.XRANGEPLAIN]})\\s+-\\s+(${l[c.XRANGEPLAIN]})\\s*$`), w("HYPHENRANGELOOSE", `^\\s*(${l[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[c.XRANGEPLAINLOOSE]})\\s*$`), w("STAR", "(<|>)?=?\\s*\\*"), w("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), w("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(vn, vn.exports)), vn.exports;
}
var ys, Pc;
function wa() {
  if (Pc) return ys;
  Pc = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return ys = (r) => r ? typeof r != "object" ? e : r : t, ys;
}
var vs, Nc;
function zu() {
  if (Nc) return vs;
  Nc = 1;
  const e = /^[0-9]+$/, t = (r, u) => {
    if (typeof r == "number" && typeof u == "number")
      return r === u ? 0 : r < u ? -1 : 1;
    const n = e.test(r), i = e.test(u);
    return n && i && (r = +r, u = +u), r === u ? 0 : n && !i ? -1 : i && !n ? 1 : r < u ? -1 : 1;
  };
  return vs = {
    compareIdentifiers: t,
    rcompareIdentifiers: (r, u) => t(u, r)
  }, vs;
}
var _s, Tc;
function Pe() {
  if (Tc) return _s;
  Tc = 1;
  const e = Un(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: s } = Fn(), { safeRe: r, t: u } = kt(), n = wa(), { compareIdentifiers: i } = zu();
  class a {
    constructor(d, c) {
      if (c = n(c), d instanceof a) {
        if (d.loose === !!c.loose && d.includePrerelease === !!c.includePrerelease)
          return d;
        d = d.version;
      } else if (typeof d != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof d}".`);
      if (d.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", d, c), this.options = c, this.loose = !!c.loose, this.includePrerelease = !!c.includePrerelease;
      const $ = d.trim().match(c.loose ? r[u.LOOSE] : r[u.FULL]);
      if (!$)
        throw new TypeError(`Invalid Version: ${d}`);
      if (this.raw = d, this.major = +$[1], this.minor = +$[2], this.patch = +$[3], this.major > s || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > s || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > s || this.patch < 0)
        throw new TypeError("Invalid patch version");
      $[4] ? this.prerelease = $[4].split(".").map((_) => {
        if (/^[0-9]+$/.test(_)) {
          const g = +_;
          if (g >= 0 && g < s)
            return g;
        }
        return _;
      }) : this.prerelease = [], this.build = $[5] ? $[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(d) {
      if (e("SemVer.compare", this.version, this.options, d), !(d instanceof a)) {
        if (typeof d == "string" && d === this.version)
          return 0;
        d = new a(d, this.options);
      }
      return d.version === this.version ? 0 : this.compareMain(d) || this.comparePre(d);
    }
    compareMain(d) {
      return d instanceof a || (d = new a(d, this.options)), this.major < d.major ? -1 : this.major > d.major ? 1 : this.minor < d.minor ? -1 : this.minor > d.minor ? 1 : this.patch < d.patch ? -1 : this.patch > d.patch ? 1 : 0;
    }
    comparePre(d) {
      if (d instanceof a || (d = new a(d, this.options)), this.prerelease.length && !d.prerelease.length)
        return -1;
      if (!this.prerelease.length && d.prerelease.length)
        return 1;
      if (!this.prerelease.length && !d.prerelease.length)
        return 0;
      let c = 0;
      do {
        const $ = this.prerelease[c], _ = d.prerelease[c];
        if (e("prerelease compare", c, $, _), $ === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === _)
          continue;
        return i($, _);
      } while (++c);
    }
    compareBuild(d) {
      d instanceof a || (d = new a(d, this.options));
      let c = 0;
      do {
        const $ = this.build[c], _ = d.build[c];
        if (e("build compare", c, $, _), $ === void 0 && _ === void 0)
          return 0;
        if (_ === void 0)
          return 1;
        if ($ === void 0)
          return -1;
        if ($ === _)
          continue;
        return i($, _);
      } while (++c);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(d, c, $) {
      if (d.startsWith("pre")) {
        if (!c && $ === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (c) {
          const _ = `-${c}`.match(this.options.loose ? r[u.PRERELEASELOOSE] : r[u.PRERELEASE]);
          if (!_ || _[1] !== c)
            throw new Error(`invalid identifier: ${c}`);
        }
      }
      switch (d) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", c, $);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", c, $);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", c, $), this.inc("pre", c, $);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", c, $), this.inc("pre", c, $);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const _ = Number($) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [_];
          else {
            let g = this.prerelease.length;
            for (; --g >= 0; )
              typeof this.prerelease[g] == "number" && (this.prerelease[g]++, g = -2);
            if (g === -1) {
              if (c === this.prerelease.join(".") && $ === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(_);
            }
          }
          if (c) {
            let g = [c, _];
            $ === !1 && (g = [c]), i(this.prerelease[0], c) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = g) : this.prerelease = g;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${d}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return _s = a, _s;
}
var gs, Ic;
function Rt() {
  if (Ic) return gs;
  Ic = 1;
  const e = Pe();
  return gs = (s, r, u = !1) => {
    if (s instanceof e)
      return s;
    try {
      return new e(s, r);
    } catch (n) {
      if (!u)
        return null;
      throw n;
    }
  }, gs;
}
var $s, Oc;
function sm() {
  if (Oc) return $s;
  Oc = 1;
  const e = Rt();
  return $s = (s, r) => {
    const u = e(s, r);
    return u ? u.version : null;
  }, $s;
}
var Es, jc;
function am() {
  if (jc) return Es;
  jc = 1;
  const e = Rt();
  return Es = (s, r) => {
    const u = e(s.trim().replace(/^[=v]+/, ""), r);
    return u ? u.version : null;
  }, Es;
}
var ws, Ac;
function om() {
  if (Ac) return ws;
  Ac = 1;
  const e = Pe();
  return ws = (s, r, u, n, i) => {
    typeof u == "string" && (i = n, n = u, u = void 0);
    try {
      return new e(
        s instanceof e ? s.version : s,
        u
      ).inc(r, n, i).version;
    } catch {
      return null;
    }
  }, ws;
}
var bs, kc;
function im() {
  if (kc) return bs;
  kc = 1;
  const e = Rt();
  return bs = (s, r) => {
    const u = e(s, null, !0), n = e(r, null, !0), i = u.compare(n);
    if (i === 0)
      return null;
    const a = i > 0, l = a ? u : n, d = a ? n : u, c = !!l.prerelease.length;
    if (!!d.prerelease.length && !c) {
      if (!d.patch && !d.minor)
        return "major";
      if (d.compareMain(l) === 0)
        return d.minor && !d.patch ? "minor" : "patch";
    }
    const _ = c ? "pre" : "";
    return u.major !== n.major ? _ + "major" : u.minor !== n.minor ? _ + "minor" : u.patch !== n.patch ? _ + "patch" : "prerelease";
  }, bs;
}
var Ss, Cc;
function cm() {
  if (Cc) return Ss;
  Cc = 1;
  const e = Pe();
  return Ss = (s, r) => new e(s, r).major, Ss;
}
var Rs, qc;
function um() {
  if (qc) return Rs;
  qc = 1;
  const e = Pe();
  return Rs = (s, r) => new e(s, r).minor, Rs;
}
var Ps, Dc;
function lm() {
  if (Dc) return Ps;
  Dc = 1;
  const e = Pe();
  return Ps = (s, r) => new e(s, r).patch, Ps;
}
var Ns, Mc;
function dm() {
  if (Mc) return Ns;
  Mc = 1;
  const e = Rt();
  return Ns = (s, r) => {
    const u = e(s, r);
    return u && u.prerelease.length ? u.prerelease : null;
  }, Ns;
}
var Ts, Lc;
function Ve() {
  if (Lc) return Ts;
  Lc = 1;
  const e = Pe();
  return Ts = (s, r, u) => new e(s, u).compare(new e(r, u)), Ts;
}
var Is, Vc;
function fm() {
  if (Vc) return Is;
  Vc = 1;
  const e = Ve();
  return Is = (s, r, u) => e(r, s, u), Is;
}
var Os, Fc;
function hm() {
  if (Fc) return Os;
  Fc = 1;
  const e = Ve();
  return Os = (s, r) => e(s, r, !0), Os;
}
var js, Uc;
function ba() {
  if (Uc) return js;
  Uc = 1;
  const e = Pe();
  return js = (s, r, u) => {
    const n = new e(s, u), i = new e(r, u);
    return n.compare(i) || n.compareBuild(i);
  }, js;
}
var As, zc;
function mm() {
  if (zc) return As;
  zc = 1;
  const e = ba();
  return As = (s, r) => s.sort((u, n) => e(u, n, r)), As;
}
var ks, Gc;
function pm() {
  if (Gc) return ks;
  Gc = 1;
  const e = ba();
  return ks = (s, r) => s.sort((u, n) => e(n, u, r)), ks;
}
var Cs, Kc;
function zn() {
  if (Kc) return Cs;
  Kc = 1;
  const e = Ve();
  return Cs = (s, r, u) => e(s, r, u) > 0, Cs;
}
var qs, Xc;
function Sa() {
  if (Xc) return qs;
  Xc = 1;
  const e = Ve();
  return qs = (s, r, u) => e(s, r, u) < 0, qs;
}
var Ds, Hc;
function Gu() {
  if (Hc) return Ds;
  Hc = 1;
  const e = Ve();
  return Ds = (s, r, u) => e(s, r, u) === 0, Ds;
}
var Ms, Bc;
function Ku() {
  if (Bc) return Ms;
  Bc = 1;
  const e = Ve();
  return Ms = (s, r, u) => e(s, r, u) !== 0, Ms;
}
var Ls, Jc;
function Ra() {
  if (Jc) return Ls;
  Jc = 1;
  const e = Ve();
  return Ls = (s, r, u) => e(s, r, u) >= 0, Ls;
}
var Vs, Wc;
function Pa() {
  if (Wc) return Vs;
  Wc = 1;
  const e = Ve();
  return Vs = (s, r, u) => e(s, r, u) <= 0, Vs;
}
var Fs, Yc;
function Xu() {
  if (Yc) return Fs;
  Yc = 1;
  const e = Gu(), t = Ku(), s = zn(), r = Ra(), u = Sa(), n = Pa();
  return Fs = (a, l, d, c) => {
    switch (l) {
      case "===":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a === d;
      case "!==":
        return typeof a == "object" && (a = a.version), typeof d == "object" && (d = d.version), a !== d;
      case "":
      case "=":
      case "==":
        return e(a, d, c);
      case "!=":
        return t(a, d, c);
      case ">":
        return s(a, d, c);
      case ">=":
        return r(a, d, c);
      case "<":
        return u(a, d, c);
      case "<=":
        return n(a, d, c);
      default:
        throw new TypeError(`Invalid operator: ${l}`);
    }
  }, Fs;
}
var Us, Qc;
function ym() {
  if (Qc) return Us;
  Qc = 1;
  const e = Pe(), t = Rt(), { safeRe: s, t: r } = kt();
  return Us = (n, i) => {
    if (n instanceof e)
      return n;
    if (typeof n == "number" && (n = String(n)), typeof n != "string")
      return null;
    i = i || {};
    let a = null;
    if (!i.rtl)
      a = n.match(i.includePrerelease ? s[r.COERCEFULL] : s[r.COERCE]);
    else {
      const g = i.includePrerelease ? s[r.COERCERTLFULL] : s[r.COERCERTL];
      let b;
      for (; (b = g.exec(n)) && (!a || a.index + a[0].length !== n.length); )
        (!a || b.index + b[0].length !== a.index + a[0].length) && (a = b), g.lastIndex = b.index + b[1].length + b[2].length;
      g.lastIndex = -1;
    }
    if (a === null)
      return null;
    const l = a[2], d = a[3] || "0", c = a[4] || "0", $ = i.includePrerelease && a[5] ? `-${a[5]}` : "", _ = i.includePrerelease && a[6] ? `+${a[6]}` : "";
    return t(`${l}.${d}.${c}${$}${_}`, i);
  }, Us;
}
var zs, Zc;
function vm() {
  if (Zc) return zs;
  Zc = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(s) {
      const r = this.map.get(s);
      if (r !== void 0)
        return this.map.delete(s), this.map.set(s, r), r;
    }
    delete(s) {
      return this.map.delete(s);
    }
    set(s, r) {
      if (!this.delete(s) && r !== void 0) {
        if (this.map.size >= this.max) {
          const n = this.map.keys().next().value;
          this.delete(n);
        }
        this.map.set(s, r);
      }
      return this;
    }
  }
  return zs = e, zs;
}
var Gs, xc;
function Fe() {
  if (xc) return Gs;
  xc = 1;
  const e = /\s+/g;
  class t {
    constructor(F, J) {
      if (J = u(J), F instanceof t)
        return F.loose === !!J.loose && F.includePrerelease === !!J.includePrerelease ? F : new t(F.raw, J);
      if (F instanceof n)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = J, this.loose = !!J.loose, this.includePrerelease = !!J.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((B) => this.parseRange(B.trim())).filter((B) => B.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const B = this.set[0];
        if (this.set = this.set.filter((H) => !w(H[0])), this.set.length === 0)
          this.set = [B];
        else if (this.set.length > 1) {
          for (const H of this.set)
            if (H.length === 1 && f(H[0])) {
              this.set = [H];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let F = 0; F < this.set.length; F++) {
          F > 0 && (this.formatted += "||");
          const J = this.set[F];
          for (let B = 0; B < J.length; B++)
            B > 0 && (this.formatted += " "), this.formatted += J[B].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(F) {
      const B = ((this.options.includePrerelease && g) | (this.options.loose && b)) + ":" + F, H = r.get(B);
      if (H)
        return H;
      const Y = this.options.loose, k = Y ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      F = F.replace(k, U(this.options.includePrerelease)), i("hyphen replace", F), F = F.replace(l[d.COMPARATORTRIM], c), i("comparator trim", F), F = F.replace(l[d.TILDETRIM], $), i("tilde trim", F), F = F.replace(l[d.CARETTRIM], _), i("caret trim", F);
      let N = F.split(" ").map((S) => o(S, this.options)).join(" ").split(/\s+/).map((S) => D(S, this.options));
      Y && (N = N.filter((S) => (i("loose invalid filter", S, this.options), !!S.match(l[d.COMPARATORLOOSE])))), i("range list", N);
      const A = /* @__PURE__ */ new Map(), T = N.map((S) => new n(S, this.options));
      for (const S of T) {
        if (w(S))
          return [S];
        A.set(S.value, S);
      }
      A.size > 1 && A.has("") && A.delete("");
      const h = [...A.values()];
      return r.set(B, h), h;
    }
    intersects(F, J) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((B) => y(B, J) && F.set.some((H) => y(H, J) && B.every((Y) => H.every((k) => Y.intersects(k, J)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new a(F, this.options);
        } catch {
          return !1;
        }
      for (let J = 0; J < this.set.length; J++)
        if (z(this.set[J], F, this.options))
          return !0;
      return !1;
    }
  }
  Gs = t;
  const s = vm(), r = new s(), u = wa(), n = Gn(), i = Un(), a = Pe(), {
    safeRe: l,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: $,
    caretTrimReplace: _
  } = kt(), { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: b } = Fn(), w = (M) => M.value === "<0.0.0-0", f = (M) => M.value === "", y = (M, F) => {
    let J = !0;
    const B = M.slice();
    let H = B.pop();
    for (; J && B.length; )
      J = B.every((Y) => H.intersects(Y, F)), H = B.pop();
    return J;
  }, o = (M, F) => (M = M.replace(l[d.BUILD], ""), i("comp", M, F), M = v(M, F), i("caret", M), M = E(M, F), i("tildes", M), M = O(M, F), i("xrange", M), M = V(M, F), i("stars", M), M), p = (M) => !M || M.toLowerCase() === "x" || M === "*", E = (M, F) => M.trim().split(/\s+/).map((J) => m(J, F)).join(" "), m = (M, F) => {
    const J = F.loose ? l[d.TILDELOOSE] : l[d.TILDE];
    return M.replace(J, (B, H, Y, k, N) => {
      i("tilde", M, B, H, Y, k, N);
      let A;
      return p(H) ? A = "" : p(Y) ? A = `>=${H}.0.0 <${+H + 1}.0.0-0` : p(k) ? A = `>=${H}.${Y}.0 <${H}.${+Y + 1}.0-0` : N ? (i("replaceTilde pr", N), A = `>=${H}.${Y}.${k}-${N} <${H}.${+Y + 1}.0-0`) : A = `>=${H}.${Y}.${k} <${H}.${+Y + 1}.0-0`, i("tilde return", A), A;
    });
  }, v = (M, F) => M.trim().split(/\s+/).map((J) => R(J, F)).join(" "), R = (M, F) => {
    i("caret", M, F);
    const J = F.loose ? l[d.CARETLOOSE] : l[d.CARET], B = F.includePrerelease ? "-0" : "";
    return M.replace(J, (H, Y, k, N, A) => {
      i("caret", M, H, Y, k, N, A);
      let T;
      return p(Y) ? T = "" : p(k) ? T = `>=${Y}.0.0${B} <${+Y + 1}.0.0-0` : p(N) ? Y === "0" ? T = `>=${Y}.${k}.0${B} <${Y}.${+k + 1}.0-0` : T = `>=${Y}.${k}.0${B} <${+Y + 1}.0.0-0` : A ? (i("replaceCaret pr", A), Y === "0" ? k === "0" ? T = `>=${Y}.${k}.${N}-${A} <${Y}.${k}.${+N + 1}-0` : T = `>=${Y}.${k}.${N}-${A} <${Y}.${+k + 1}.0-0` : T = `>=${Y}.${k}.${N}-${A} <${+Y + 1}.0.0-0`) : (i("no pr"), Y === "0" ? k === "0" ? T = `>=${Y}.${k}.${N}${B} <${Y}.${k}.${+N + 1}-0` : T = `>=${Y}.${k}.${N}${B} <${Y}.${+k + 1}.0-0` : T = `>=${Y}.${k}.${N} <${+Y + 1}.0.0-0`), i("caret return", T), T;
    });
  }, O = (M, F) => (i("replaceXRanges", M, F), M.split(/\s+/).map((J) => q(J, F)).join(" ")), q = (M, F) => {
    M = M.trim();
    const J = F.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return M.replace(J, (B, H, Y, k, N, A) => {
      i("xRange", M, B, H, Y, k, N, A);
      const T = p(Y), h = T || p(k), S = h || p(N), j = S;
      return H === "=" && j && (H = ""), A = F.includePrerelease ? "-0" : "", T ? H === ">" || H === "<" ? B = "<0.0.0-0" : B = "*" : H && j ? (h && (k = 0), N = 0, H === ">" ? (H = ">=", h ? (Y = +Y + 1, k = 0, N = 0) : (k = +k + 1, N = 0)) : H === "<=" && (H = "<", h ? Y = +Y + 1 : k = +k + 1), H === "<" && (A = "-0"), B = `${H + Y}.${k}.${N}${A}`) : h ? B = `>=${Y}.0.0${A} <${+Y + 1}.0.0-0` : S && (B = `>=${Y}.${k}.0${A} <${Y}.${+k + 1}.0-0`), i("xRange return", B), B;
    });
  }, V = (M, F) => (i("replaceStars", M, F), M.trim().replace(l[d.STAR], "")), D = (M, F) => (i("replaceGTE0", M, F), M.trim().replace(l[F.includePrerelease ? d.GTE0PRE : d.GTE0], "")), U = (M) => (F, J, B, H, Y, k, N, A, T, h, S, j) => (p(B) ? J = "" : p(H) ? J = `>=${B}.0.0${M ? "-0" : ""}` : p(Y) ? J = `>=${B}.${H}.0${M ? "-0" : ""}` : k ? J = `>=${J}` : J = `>=${J}${M ? "-0" : ""}`, p(T) ? A = "" : p(h) ? A = `<${+T + 1}.0.0-0` : p(S) ? A = `<${T}.${+h + 1}.0-0` : j ? A = `<=${T}.${h}.${S}-${j}` : M ? A = `<${T}.${h}.${+S + 1}-0` : A = `<=${A}`, `${J} ${A}`.trim()), z = (M, F, J) => {
    for (let B = 0; B < M.length; B++)
      if (!M[B].test(F))
        return !1;
    if (F.prerelease.length && !J.includePrerelease) {
      for (let B = 0; B < M.length; B++)
        if (i(M[B].semver), M[B].semver !== n.ANY && M[B].semver.prerelease.length > 0) {
          const H = M[B].semver;
          if (H.major === F.major && H.minor === F.minor && H.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Gs;
}
var Ks, eu;
function Gn() {
  if (eu) return Ks;
  eu = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, $) {
      if ($ = s($), c instanceof t) {
        if (c.loose === !!$.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), i("comparator", c, $), this.options = $, this.loose = !!$.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(c) {
      const $ = this.options.loose ? r[u.COMPARATORLOOSE] : r[u.COMPARATOR], _ = c.match($);
      if (!_)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = _[1] !== void 0 ? _[1] : "", this.operator === "=" && (this.operator = ""), _[2] ? this.semver = new a(_[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (i("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new a(c, this.options);
        } catch {
          return !1;
        }
      return n(c, this.operator, this.semver, this.options);
    }
    intersects(c, $) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(c.value, $).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new l(this.value, $).test(c.semver) : ($ = s($), $.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !$.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || n(this.semver, "<", c.semver, $) && this.operator.startsWith(">") && c.operator.startsWith("<") || n(this.semver, ">", c.semver, $) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Ks = t;
  const s = wa(), { safeRe: r, t: u } = kt(), n = Xu(), i = Un(), a = Pe(), l = Fe();
  return Ks;
}
var Xs, tu;
function Kn() {
  if (tu) return Xs;
  tu = 1;
  const e = Fe();
  return Xs = (s, r, u) => {
    try {
      r = new e(r, u);
    } catch {
      return !1;
    }
    return r.test(s);
  }, Xs;
}
var Hs, ru;
function _m() {
  if (ru) return Hs;
  ru = 1;
  const e = Fe();
  return Hs = (s, r) => new e(s, r).set.map((u) => u.map((n) => n.value).join(" ").trim().split(" ")), Hs;
}
var Bs, nu;
function gm() {
  if (nu) return Bs;
  nu = 1;
  const e = Pe(), t = Fe();
  return Bs = (r, u, n) => {
    let i = null, a = null, l = null;
    try {
      l = new t(u, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      l.test(d) && (!i || a.compare(d) === -1) && (i = d, a = new e(i, n));
    }), i;
  }, Bs;
}
var Js, su;
function $m() {
  if (su) return Js;
  su = 1;
  const e = Pe(), t = Fe();
  return Js = (r, u, n) => {
    let i = null, a = null, l = null;
    try {
      l = new t(u, n);
    } catch {
      return null;
    }
    return r.forEach((d) => {
      l.test(d) && (!i || a.compare(d) === 1) && (i = d, a = new e(i, n));
    }), i;
  }, Js;
}
var Ws, au;
function Em() {
  if (au) return Ws;
  au = 1;
  const e = Pe(), t = Fe(), s = zn();
  return Ws = (u, n) => {
    u = new t(u, n);
    let i = new e("0.0.0");
    if (u.test(i) || (i = new e("0.0.0-0"), u.test(i)))
      return i;
    i = null;
    for (let a = 0; a < u.set.length; ++a) {
      const l = u.set[a];
      let d = null;
      l.forEach((c) => {
        const $ = new e(c.semver.version);
        switch (c.operator) {
          case ">":
            $.prerelease.length === 0 ? $.patch++ : $.prerelease.push(0), $.raw = $.format();
          /* fallthrough */
          case "":
          case ">=":
            (!d || s($, d)) && (d = $);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${c.operator}`);
        }
      }), d && (!i || s(i, d)) && (i = d);
    }
    return i && u.test(i) ? i : null;
  }, Ws;
}
var Ys, ou;
function wm() {
  if (ou) return Ys;
  ou = 1;
  const e = Fe();
  return Ys = (s, r) => {
    try {
      return new e(s, r).range || "*";
    } catch {
      return null;
    }
  }, Ys;
}
var Qs, iu;
function Na() {
  if (iu) return Qs;
  iu = 1;
  const e = Pe(), t = Gn(), { ANY: s } = t, r = Fe(), u = Kn(), n = zn(), i = Sa(), a = Pa(), l = Ra();
  return Qs = (c, $, _, g) => {
    c = new e(c, g), $ = new r($, g);
    let b, w, f, y, o;
    switch (_) {
      case ">":
        b = n, w = a, f = i, y = ">", o = ">=";
        break;
      case "<":
        b = i, w = l, f = n, y = "<", o = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (u(c, $, g))
      return !1;
    for (let p = 0; p < $.set.length; ++p) {
      const E = $.set[p];
      let m = null, v = null;
      if (E.forEach((R) => {
        R.semver === s && (R = new t(">=0.0.0")), m = m || R, v = v || R, b(R.semver, m.semver, g) ? m = R : f(R.semver, v.semver, g) && (v = R);
      }), m.operator === y || m.operator === o || (!v.operator || v.operator === y) && w(c, v.semver))
        return !1;
      if (v.operator === o && f(c, v.semver))
        return !1;
    }
    return !0;
  }, Qs;
}
var Zs, cu;
function bm() {
  if (cu) return Zs;
  cu = 1;
  const e = Na();
  return Zs = (s, r, u) => e(s, r, ">", u), Zs;
}
var xs, uu;
function Sm() {
  if (uu) return xs;
  uu = 1;
  const e = Na();
  return xs = (s, r, u) => e(s, r, "<", u), xs;
}
var ea, lu;
function Rm() {
  if (lu) return ea;
  lu = 1;
  const e = Fe();
  return ea = (s, r, u) => (s = new e(s, u), r = new e(r, u), s.intersects(r, u)), ea;
}
var ta, du;
function Pm() {
  if (du) return ta;
  du = 1;
  const e = Kn(), t = Ve();
  return ta = (s, r, u) => {
    const n = [];
    let i = null, a = null;
    const l = s.sort((_, g) => t(_, g, u));
    for (const _ of l)
      e(_, r, u) ? (a = _, i || (i = _)) : (a && n.push([i, a]), a = null, i = null);
    i && n.push([i, null]);
    const d = [];
    for (const [_, g] of n)
      _ === g ? d.push(_) : !g && _ === l[0] ? d.push("*") : g ? _ === l[0] ? d.push(`<=${g}`) : d.push(`${_} - ${g}`) : d.push(`>=${_}`);
    const c = d.join(" || "), $ = typeof r.raw == "string" ? r.raw : String(r);
    return c.length < $.length ? c : r;
  }, ta;
}
var ra, fu;
function Nm() {
  if (fu) return ra;
  fu = 1;
  const e = Fe(), t = Gn(), { ANY: s } = t, r = Kn(), u = Ve(), n = ($, _, g = {}) => {
    if ($ === _)
      return !0;
    $ = new e($, g), _ = new e(_, g);
    let b = !1;
    e: for (const w of $.set) {
      for (const f of _.set) {
        const y = l(w, f, g);
        if (b = b || y !== null, y)
          continue e;
      }
      if (b)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], a = [new t(">=0.0.0")], l = ($, _, g) => {
    if ($ === _)
      return !0;
    if ($.length === 1 && $[0].semver === s) {
      if (_.length === 1 && _[0].semver === s)
        return !0;
      g.includePrerelease ? $ = i : $ = a;
    }
    if (_.length === 1 && _[0].semver === s) {
      if (g.includePrerelease)
        return !0;
      _ = a;
    }
    const b = /* @__PURE__ */ new Set();
    let w, f;
    for (const O of $)
      O.operator === ">" || O.operator === ">=" ? w = d(w, O, g) : O.operator === "<" || O.operator === "<=" ? f = c(f, O, g) : b.add(O.semver);
    if (b.size > 1)
      return null;
    let y;
    if (w && f) {
      if (y = u(w.semver, f.semver, g), y > 0)
        return null;
      if (y === 0 && (w.operator !== ">=" || f.operator !== "<="))
        return null;
    }
    for (const O of b) {
      if (w && !r(O, String(w), g) || f && !r(O, String(f), g))
        return null;
      for (const q of _)
        if (!r(O, String(q), g))
          return !1;
      return !0;
    }
    let o, p, E, m, v = f && !g.includePrerelease && f.semver.prerelease.length ? f.semver : !1, R = w && !g.includePrerelease && w.semver.prerelease.length ? w.semver : !1;
    v && v.prerelease.length === 1 && f.operator === "<" && v.prerelease[0] === 0 && (v = !1);
    for (const O of _) {
      if (m = m || O.operator === ">" || O.operator === ">=", E = E || O.operator === "<" || O.operator === "<=", w) {
        if (R && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === R.major && O.semver.minor === R.minor && O.semver.patch === R.patch && (R = !1), O.operator === ">" || O.operator === ">=") {
          if (o = d(w, O, g), o === O && o !== w)
            return !1;
        } else if (w.operator === ">=" && !r(w.semver, String(O), g))
          return !1;
      }
      if (f) {
        if (v && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === v.major && O.semver.minor === v.minor && O.semver.patch === v.patch && (v = !1), O.operator === "<" || O.operator === "<=") {
          if (p = c(f, O, g), p === O && p !== f)
            return !1;
        } else if (f.operator === "<=" && !r(f.semver, String(O), g))
          return !1;
      }
      if (!O.operator && (f || w) && y !== 0)
        return !1;
    }
    return !(w && E && !f && y !== 0 || f && m && !w && y !== 0 || R || v);
  }, d = ($, _, g) => {
    if (!$)
      return _;
    const b = u($.semver, _.semver, g);
    return b > 0 ? $ : b < 0 || _.operator === ">" && $.operator === ">=" ? _ : $;
  }, c = ($, _, g) => {
    if (!$)
      return _;
    const b = u($.semver, _.semver, g);
    return b < 0 ? $ : b > 0 || _.operator === "<" && $.operator === "<=" ? _ : $;
  };
  return ra = n, ra;
}
var na, hu;
function Tm() {
  if (hu) return na;
  hu = 1;
  const e = kt(), t = Fn(), s = Pe(), r = zu(), u = Rt(), n = sm(), i = am(), a = om(), l = im(), d = cm(), c = um(), $ = lm(), _ = dm(), g = Ve(), b = fm(), w = hm(), f = ba(), y = mm(), o = pm(), p = zn(), E = Sa(), m = Gu(), v = Ku(), R = Ra(), O = Pa(), q = Xu(), V = ym(), D = Gn(), U = Fe(), z = Kn(), M = _m(), F = gm(), J = $m(), B = Em(), H = wm(), Y = Na(), k = bm(), N = Sm(), A = Rm(), T = Pm(), h = Nm();
  return na = {
    parse: u,
    valid: n,
    clean: i,
    inc: a,
    diff: l,
    major: d,
    minor: c,
    patch: $,
    prerelease: _,
    compare: g,
    rcompare: b,
    compareLoose: w,
    compareBuild: f,
    sort: y,
    rsort: o,
    gt: p,
    lt: E,
    eq: m,
    neq: v,
    gte: R,
    lte: O,
    cmp: q,
    coerce: V,
    Comparator: D,
    Range: U,
    satisfies: z,
    toComparators: M,
    maxSatisfying: F,
    minSatisfying: J,
    minVersion: B,
    validRange: H,
    outside: Y,
    gtr: k,
    ltr: N,
    intersects: A,
    simplifyRange: T,
    subset: h,
    SemVer: s,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: r.compareIdentifiers,
    rcompareIdentifiers: r.rcompareIdentifiers
  }, na;
}
var Im = Tm();
const Et = /* @__PURE__ */ Nu(Im), Om = Object.prototype.toString, jm = "[object Uint8Array]", Am = "[object ArrayBuffer]";
function Hu(e, t, s) {
  return e ? e.constructor === t ? !0 : Om.call(e) === s : !1;
}
function Bu(e) {
  return Hu(e, Uint8Array, jm);
}
function km(e) {
  return Hu(e, ArrayBuffer, Am);
}
function Cm(e) {
  return Bu(e) || km(e);
}
function qm(e) {
  if (!Bu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Dm(e) {
  if (!Cm(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function sa(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ??= e.reduce((u, n) => u + n.length, 0);
  const s = new Uint8Array(t);
  let r = 0;
  for (const u of e)
    qm(u), s.set(u, r), r += u.length;
  return s;
}
const mu = {
  utf8: new globalThis.TextDecoder("utf8")
};
function _n(e, t = "utf8") {
  return Dm(e), mu[t] ??= new globalThis.TextDecoder(t), mu[t].decode(e);
}
function Mm(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Lm = new globalThis.TextEncoder();
function gn(e) {
  return Mm(e), Lm.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const aa = "aes-256-cbc", et = () => /* @__PURE__ */ Object.create(null), pu = (e) => e !== void 0, oa = (e, t) => {
  const s = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), r = typeof t;
  if (s.has(r))
    throw new TypeError(`Setting a value of type \`${r}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, tt = "__internal__", ia = `${tt}.migrations.version`;
class Vm {
  path;
  events;
  #s;
  #r;
  #e;
  #t = {};
  #a = !1;
  #o;
  #i;
  #n;
  constructor(t = {}) {
    const s = this.#c(t);
    this.#e = s, this.#u(s), this.#d(s), this.#f(s), this.events = new EventTarget(), this.#r = s.encryptionKey, this.path = this.#h(s), this.#m(s), s.watch && this._watch();
  }
  get(t, s) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(t, s);
    const { store: r } = this;
    return t in r ? r[t] : s;
  }
  set(t, s) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && s === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${tt} key, as it's used to manage this module internal operations.`);
    const { store: r } = this, u = (n, i) => {
      if (oa(n, i), this.#e.accessPropertiesByDotNotation)
        Ct(r, n, i);
      else {
        if (n === "__proto__" || n === "constructor" || n === "prototype")
          return;
        r[n] = i;
      }
    };
    if (typeof t == "object") {
      const n = t;
      for (const [i, a] of Object.entries(n))
        u(i, a);
    } else
      u(t, s);
    this.store = r;
  }
  has(t) {
    return this.#e.accessPropertiesByDotNotation ? Bn(this.store, t) : t in this.store;
  }
  appendToArray(t, s) {
    oa(t, s);
    const r = this.#e.accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(r))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...r, s]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const s of t)
      pu(this.#t[s]) && this.set(s, this.#t[s]);
  }
  delete(t) {
    const { store: s } = this;
    this.#e.accessPropertiesByDotNotation ? el(s, t) : delete s[t], this.store = s;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = et();
    for (const s of Object.keys(this.#t))
      pu(this.#t[s]) && (oa(s, this.#t[s]), this.#e.accessPropertiesByDotNotation ? Ct(t, s, this.#t[s]) : t[s] = this.#t[s]);
    this.store = t;
  }
  onDidChange(t, s) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof s != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof s}`);
    return this._handleValueChange(() => this.get(t), s);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleStoreChange(t);
  }
  get size() {
    return Object.keys(this.store).filter((s) => !this._isReservedKeyPath(s)).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = x.readFileSync(this.path, this.#r ? null : "utf8"), s = this._decryptData(t), r = this._deserialize(s);
      return this.#a || this._validate(r), Object.assign(et(), r);
    } catch (t) {
      if (t?.code === "ENOENT")
        return this._ensureDirectory(), et();
      if (this.#e.clearInvalidConfig) {
        const s = t;
        if (s.name === "SyntaxError" || s.message?.startsWith("Config schema violation:"))
          return et();
      }
      throw t;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Bn(t, tt))
      try {
        const s = x.readFileSync(this.path, this.#r ? null : "utf8"), r = this._decryptData(s), u = this._deserialize(r);
        Bn(u, tt) && Ct(t, tt, ka(u, tt));
      } catch {
      }
    this.#a || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, s] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, s]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#o && (this.#o.close(), this.#o = void 0), this.#i && (x.unwatchFile(this.path), this.#i = !1), this.#n = void 0;
  }
  _decryptData(t) {
    if (!this.#r)
      return typeof t == "string" ? t : _n(t);
    try {
      const s = t.slice(0, 16), r = it.pbkdf2Sync(this.#r, s, 1e4, 32, "sha512"), u = it.createDecipheriv(aa, r, s), n = t.slice(17), i = typeof n == "string" ? gn(n) : n;
      return _n(sa([u.update(i), u.final()]));
    } catch {
      try {
        const s = t.slice(0, 16), r = it.pbkdf2Sync(this.#r, s.toString(), 1e4, 32, "sha512"), u = it.createDecipheriv(aa, r, s), n = t.slice(17), i = typeof n == "string" ? gn(n) : n;
        return _n(sa([u.update(i), u.final()]));
      } catch {
      }
    }
    return typeof t == "string" ? t : _n(t);
  }
  _handleStoreChange(t) {
    let s = this.store;
    const r = () => {
      const u = s, n = this.store;
      Oa(n, u) || (s = n, t.call(this, n, u));
    };
    return this.events.addEventListener("change", r), () => {
      this.events.removeEventListener("change", r);
    };
  }
  _handleValueChange(t, s) {
    let r = t();
    const u = () => {
      const n = r, i = t();
      Oa(i, n) || (r = i, s.call(this, i, n));
    };
    return this.events.addEventListener("change", u), () => {
      this.events.removeEventListener("change", u);
    };
  }
  _deserialize = (t) => JSON.parse(t);
  _serialize = (t) => JSON.stringify(t, void 0, "	");
  _validate(t) {
    if (!this.#s || this.#s(t) || !this.#s.errors)
      return;
    const r = this.#s.errors.map(({ instancePath: u, message: n = "" }) => `\`${u.slice(1)}\` ${n}`);
    throw new Error("Config schema violation: " + r.join("; "));
  }
  _ensureDirectory() {
    x.mkdirSync(ce.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let s = this._serialize(t);
    if (this.#r) {
      const r = it.randomBytes(16), u = it.pbkdf2Sync(this.#r, r, 1e4, 32, "sha512"), n = it.createCipheriv(aa, u, r);
      s = sa([r, gn(":"), n.update(gn(s)), n.final()]);
    }
    if (pe.env.SNAP)
      x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
    else
      try {
        Pu(this.path, s, { mode: this.#e.configFileMode });
      } catch (r) {
        if (r?.code === "EXDEV") {
          x.writeFileSync(this.path, s, { mode: this.#e.configFileMode });
          return;
        }
        throw r;
      }
  }
  _watch() {
    if (this._ensureDirectory(), x.existsSync(this.path) || this._write(et()), pe.platform === "win32" || pe.platform === "darwin") {
      this.#n ??= wc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const t = ce.dirname(this.path), s = ce.basename(this.path);
      this.#o = x.watch(t, { persistent: !1, encoding: "utf8" }, (r, u) => {
        u && u !== s || typeof this.#n == "function" && this.#n();
      });
    } else
      this.#n ??= wc(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), x.watchFile(this.path, { persistent: !1 }, (t, s) => {
        typeof this.#n == "function" && this.#n();
      }), this.#i = !0;
  }
  _migrate(t, s, r) {
    let u = this._get(ia, "0.0.0");
    const n = Object.keys(t).filter((a) => this._shouldPerformMigration(a, u, s));
    let i = structuredClone(this.store);
    for (const a of n)
      try {
        r && r(this, {
          fromVersion: u,
          toVersion: a,
          finalVersion: s,
          versions: n
        });
        const l = t[a];
        l?.(this), this._set(ia, a), u = a, i = structuredClone(this.store);
      } catch (l) {
        this.store = i;
        try {
          this._write(i);
        } catch {
        }
        const d = l instanceof Error ? l.message : String(l);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${d}`);
      }
    (this._isVersionInRangeFormat(u) || !Et.eq(u, s)) && this._set(ia, s);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [s, r] of Object.entries(t))
      if (this._isReservedKeyPath(s) || this._objectContainsReservedKey(r))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === tt || t.startsWith(`${tt}.`);
  }
  _isVersionInRangeFormat(t) {
    return Et.clean(t) === null;
  }
  _shouldPerformMigration(t, s, r) {
    return this._isVersionInRangeFormat(t) ? s !== "0.0.0" && Et.satisfies(s, t) ? !1 : Et.satisfies(r, t) : !(Et.lte(t, s) || Et.gt(t, r));
  }
  _get(t, s) {
    return ka(this.store, t, s);
  }
  _set(t, s) {
    const { store: r } = this;
    Ct(r, t, s), this.store = r;
  }
  #c(t) {
    const s = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!s.cwd) {
      if (!s.projectName)
        throw new Error("Please specify the `projectName` option.");
      s.cwd = sl(s.projectName, { suffix: s.projectSuffix }).config;
    }
    return typeof s.fileExtension == "string" && (s.fileExtension = s.fileExtension.replace(/^\.+/, "")), s;
  }
  #u(t) {
    if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
      return;
    if (t.schema && typeof t.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const s = Wh.default, r = new Uf.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...t.ajvOptions
    });
    s(r);
    const u = {
      ...t.rootSchema,
      type: "object",
      properties: t.schema
    };
    this.#s = r.compile(u), this.#l(t.schema);
  }
  #l(t) {
    const s = Object.entries(t ?? {});
    for (const [r, u] of s) {
      if (!u || typeof u != "object" || !Object.hasOwn(u, "default"))
        continue;
      const { default: n } = u;
      n !== void 0 && (this.#t[r] = n);
    }
  }
  #d(t) {
    t.defaults && Object.assign(this.#t, t.defaults);
  }
  #f(t) {
    t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
  }
  #h(t) {
    const s = typeof t.fileExtension == "string" ? t.fileExtension : void 0, r = s ? `.${s}` : "";
    return ce.resolve(t.cwd, `${t.configName ?? "config"}${r}`);
  }
  #m(t) {
    if (t.migrations) {
      this.#p(t), this._validate(this.store);
      return;
    }
    const s = this.store, r = Object.assign(et(), t.defaults ?? {}, s);
    this._validate(r);
    try {
      ja.deepEqual(s, r);
    } catch {
      this.store = r;
    }
  }
  #p(t) {
    const { migrations: s, projectVersion: r } = t;
    if (s) {
      if (!r)
        throw new Error("Please specify the `projectVersion` option.");
      this.#a = !0;
      try {
        const u = this.store, n = Object.assign(et(), t.defaults ?? {}, u);
        try {
          ja.deepEqual(u, n);
        } catch {
          this._write(n);
        }
        this._migrate(s, r, t.beforeEachMigration);
      } finally {
        this.#a = !1;
      }
    }
  }
}
const { app: wn, ipcMain: la, shell: Fm } = gu;
let yu = !1;
const vu = () => {
  if (!la || !wn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: wn.getPath("userData"),
    appVersion: wn.getVersion()
  };
  return yu || (la.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), yu = !0), e;
};
class Um extends Vm {
  constructor(t) {
    let s, r;
    if (pe.type === "renderer") {
      const u = gu.ipcRenderer.sendSync("electron-store-get-data");
      if (!u)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: s, appVersion: r } = u);
    } else la && wn && ({ defaultCwd: s, appVersion: r } = vu());
    t = {
      name: "config",
      ...t
    }, t.projectVersion ||= r, t.cwd ? t.cwd = ce.isAbsolute(t.cwd) ? t.cwd : ce.join(s, t.cwd) : t.cwd = s, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    vu();
  }
  async openInEditor() {
    const t = await Fm.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
let da, he = null, bn;
async function zm() {
  da || (da = (await import("better-sqlite3")).default, bn = St.join(Ue.getPath("userData"), "gravio.db"));
}
async function Gm() {
  try {
    await zm();
    const e = St.dirname(bn);
    return Aa.existsSync(e) || Aa.mkdirSync(e, { recursive: !0 }), he = new da(bn, { verbose: console.log }), he.pragma("journal_mode = WAL"), Km(), console.log("✅ Base de datos SQLite inicializada en:", bn), he;
  } catch (e) {
    throw console.error("❌ Error al inicializar base de datos:", e), e;
  }
}
function Km() {
  he && (he.pragma("foreign_keys = OFF"), he.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS empresa (
      id TEXT PRIMARY KEY,
      empresa TEXT NOT NULL,
      clave_empresa INTEGER UNIQUE,
      prefijo TEXT NOT NULL
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS rutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ruta TEXT NOT NULL,
      clave_ruta INTEGER UNIQUE,
      clave_empresa INTEGER
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS operadores (
      id TEXT PRIMARY KEY,
      operador TEXT NOT NULL,
      clave_operador INTEGER UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      rol_id TEXT,
      activo INTEGER DEFAULT 1,
      password TEXT,
      password_hash TEXT,
      pin TEXT,
      pin_expires_at INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id TEXT PRIMARY KEY,
      no_economico TEXT NOT NULL,
      placas TEXT NOT NULL,
      clave_empresa INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS conceptos (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      clave_concepto INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS registros (
      id TEXT PRIMARY KEY,
      clave_ruta INTEGER,
      placa_vehiculo TEXT NOT NULL,
      numero_economico TEXT,
      clave_operador INTEGER,
      operador TEXT,
      ruta TEXT,
      peso REAL,
      peso_entrada REAL,
      peso_salida REAL,
      fecha_entrada INTEGER,
      fecha_salida INTEGER,
      fecha_registro INTEGER DEFAULT (strftime('%s', 'now')),
      tipo_pesaje TEXT DEFAULT 'entrada',
      folio TEXT,
      clave_concepto INTEGER,
      concepto_id TEXT,
      clave_empresa INTEGER,
      observaciones TEXT,
      sincronizado INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS operadores_empresas (
      operador_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (operador_id, clave_empresa)
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS conceptos_empresas (
      concepto_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (concepto_id, clave_empresa)
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      last_attempt INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), he.exec(`
    CREATE INDEX IF NOT EXISTS idx_registros_sincronizado ON registros(sincronizado);
    CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_registro);
    CREATE INDEX IF NOT EXISTS idx_registros_placa ON registros(placa_vehiculo);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name);
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_vehiculos_placas ON vehiculos(placas);
    CREATE INDEX IF NOT EXISTS idx_operadores_clave ON operadores(clave_operador);
    CREATE INDEX IF NOT EXISTS idx_rutas_clave ON rutas(clave_ruta);
  `), he.pragma("foreign_keys = OFF"), console.log("✅ Tablas de base de datos creadas (estructura compatible con Supabase)"), console.log("⚠️  Foreign keys deshabilitadas para operación offline-first"));
}
function Ju(e) {
  return e.map((t) => t === void 0 || t === null ? null : typeof t == "number" || typeof t == "string" || typeof t == "bigint" || Buffer.isBuffer(t) ? t : typeof t == "boolean" ? t ? 1 : 0 : typeof t == "object" ? (console.warn("⚠️ Convirtiendo objeto a JSON string:", t), JSON.stringify(t)) : String(t));
}
function Xm(e, t = []) {
  if (!he)
    throw new Error("Base de datos no inicializada");
  try {
    const s = Ju(t), r = he.prepare(e);
    if (e.trim().toUpperCase().startsWith("SELECT"))
      return r.all(...s);
    {
      const u = r.run(...s);
      return [{ changes: u.changes, lastInsertRowid: u.lastInsertRowid }];
    }
  } catch (s) {
    throw console.error("❌ Error en query:", s), console.error("   SQL:", e), console.error("   Params:", t), s;
  }
}
function Hm(e) {
  if (!he)
    throw new Error("Base de datos no inicializada");
  try {
    he.exec(e);
  } catch (t) {
    throw console.error("❌ Error en comando SQL:", t), t;
  }
}
function Bm(e) {
  if (!he)
    throw new Error("Base de datos no inicializada");
  const t = he.transaction((s) => {
    for (const r of s) {
      const u = he.prepare(r.sql), n = Ju(r.params || []);
      u.run(...n);
    }
  });
  try {
    t(e);
  } catch (s) {
    throw console.error("❌ Error en transacción:", s), s;
  }
}
function Jm() {
  he && (he.close(), he = null, console.log("✅ Base de datos cerrada"));
}
let Tn, Wu;
async function Yu() {
  Tn || (Tn = (await import("serialport")).SerialPort, Wu = (await import("@serialport/parser-readline")).ReadlineParser);
}
let qe = null, fa = null, Ta = "";
const $n = {
  baudRate: 2400,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  autoOpen: !1
};
async function Wm() {
  try {
    return await Yu(), (await Tn.list()).map((t) => ({
      path: t.path,
      manufacturer: t.manufacturer,
      serialNumber: t.serialNumber,
      vendorId: t.vendorId,
      productId: t.productId
    }));
  } catch (e) {
    return console.error("❌ Error al listar puertos:", e), [];
  }
}
function Ym(e) {
  try {
    const t = e.trim(), s = /[)>+\-SD]\s*(\d+)\s+(\d+)\s+(\d+)/, r = t.match(s);
    if (r) {
      const [, , i, a] = r;
      return parseFloat(`${i}.${a}`);
    }
    const u = /(\d+\.?\d*)/, n = t.match(u);
    return n ? parseFloat(n[1]) : null;
  } catch (t) {
    return console.error("❌ Error al parsear peso:", t), null;
  }
}
async function Qm(e, t = $n.baudRate, s) {
  try {
    return await Yu(), qe && qe.isOpen && await Ia(), qe = new Tn({
      path: e,
      baudRate: t,
      dataBits: $n.dataBits,
      stopBits: $n.stopBits,
      parity: $n.parity,
      autoOpen: !1
    }), fa = qe.pipe(new Wu({ delimiter: `\r
` })), fa.on("data", (r) => {
      console.log("📊 Datos recibidos:", r);
      const u = Ym(r);
      u !== null && (Ta = u.toString(), console.log("⚖️ Peso parseado:", u, "kg"), s && s(u));
    }), qe.on("error", (r) => {
      console.error("❌ Error en puerto serial:", r);
    }), qe.on("close", () => {
      console.log("🔌 Puerto serial cerrado");
    }), await new Promise((r, u) => {
      qe.open((n) => {
        n ? u(n) : (console.log(`✅ Puerto serial ${e} abierto a ${t} baud`), r());
      });
    }), !0;
  } catch (r) {
    return console.error("❌ Error al abrir puerto serial:", r), !1;
  }
}
async function Ia() {
  qe && qe.isOpen && await new Promise((e) => {
    qe.close((t) => {
      t && console.error("❌ Error al cerrar puerto:", t), qe = null, fa = null, Ta = "", e();
    });
  });
}
function Zm() {
  return Ta;
}
const ca = St.dirname(Qu(import.meta.url));
let je = null;
const En = new Um(), ua = process.env.NODE_ENV === "development";
function _u() {
  je = new $u({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: St.join(ca, "preload.cjs"),
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1
      // Necesario para serialport y sqlite
    },
    title: "Gravio - Sistema de Relleno Sanitario",
    icon: St.join(ca, "../public/icon.png"),
    autoHideMenuBar: !ua
  }), je.webContents.session.webRequest.onHeadersReceived((e, t) => {
    t({
      responseHeaders: {
        ...e.responseHeaders,
        "Content-Security-Policy": [
          ua ? "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:*; font-src 'self' data:;" : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:;"
        ]
      }
    });
  }), ua ? (je.loadURL("http://localhost:5173"), je.webContents.openDevTools()) : je.loadFile(St.join(ca, "../dist/index.html")), je.on("closed", () => {
    je = null;
  });
}
Ue.whenReady().then(async () => {
  await Gm(), _u(), xm(), Ue.on("activate", () => {
    $u.getAllWindows().length === 0 && _u();
  });
});
Ue.on("window-all-closed", () => {
  process.platform !== "darwin" && Ue.quit();
});
Ue.on("before-quit", async () => {
  await Ia(), Jm();
});
function xm() {
  ve.handle("app:getVersion", () => Ue.getVersion()), ve.handle("app:getPlatform", () => process.platform), ve.handle("serial:list", Wm), ve.handle("serial:open", async (e, t, s) => await Qm(t, s, (u) => {
    je && je.webContents.send("serial:data", u.toString());
  })), ve.handle("serial:close", Ia), ve.handle("serial:read", Zm), ve.handle("db:query", (e, t, s) => Xm(t, s)), ve.handle("db:exec", (e, t) => Hm(t)), ve.handle("db:transaction", (e, t) => Bm(t)), ve.handle("printer:list", async () => []), ve.handle("printer:print", async (e, t) => (console.log("🖨️ Imprimiendo:", t), !0)), ve.handle("sync:start", async () => {
    console.log("🔄 Iniciando sincronización...");
  }), ve.handle("sync:stop", async () => {
    console.log("⏸️ Deteniendo sincronización...");
  }), ve.handle("sync:getStatus", async () => ({
    isOnline: !0,
    lastSync: null,
    pendingItems: 0
  })), ve.handle("storage:get", (e, t) => En.get(t)), ve.handle("storage:set", (e, t, s) => {
    En.set(t, s);
  }), ve.handle("storage:delete", (e, t) => {
    En.delete(t);
  }), ve.handle("storage:clear", () => {
    En.clear();
  });
}
const ep = Ue.requestSingleInstanceLock();
ep ? Ue.on("second-instance", () => {
  je && (je.isMinimized() && je.restore(), je.focus());
}) : Ue.quit();
