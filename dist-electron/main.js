import Jt, { app as jt, BrowserWindow as zu, ipcMain as Be, shell as Ov, dialog as Av } from "electron";
import At from "fs";
import Cv from "constants";
import Dn from "stream";
import Ku, { promisify as Dv } from "util";
import Ty from "assert";
import Ge from "path";
import Qa, { exec as kv } from "child_process";
import Py from "events";
import kn from "crypto";
import Ny from "tty";
import Za from "os";
import Yr, { fileURLToPath as Lv } from "url";
import qv from "string_decoder";
import Iy from "zlib";
import Fv from "http";
import Ke from "node:process";
import je from "node:path";
import { promisify as it, isDeepStrictEqual as ql } from "node:util";
import Te from "node:fs";
import vr from "node:crypto";
import Fl from "node:assert";
import Oy from "node:os";
import "node:events";
import "node:stream";
import "https";
var Ot = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Ay(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var _r = {}, Rs = {}, Hn = {}, Ul;
function wt() {
  return Ul || (Ul = 1, Hn.fromCallback = function(e) {
    return Object.defineProperty(function(...t) {
      if (typeof t[t.length - 1] == "function") e.apply(this, t);
      else
        return new Promise((a, n) => {
          t.push((l, r) => l != null ? n(l) : a(r)), e.apply(this, t);
        });
    }, "name", { value: e.name });
  }, Hn.fromPromise = function(e) {
    return Object.defineProperty(function(...t) {
      const a = t[t.length - 1];
      if (typeof a != "function") return e.apply(this, t);
      t.pop(), e.apply(this, t).then((n) => a(null, n), a);
    }, "name", { value: e.name });
  }), Hn;
}
var Ts, jl;
function Uv() {
  if (jl) return Ts;
  jl = 1;
  var e = Cv, t = process.cwd, a = null, n = process.env.GRACEFUL_FS_PLATFORM || process.platform;
  process.cwd = function() {
    return a || (a = t.call(process)), a;
  };
  try {
    process.cwd();
  } catch {
  }
  if (typeof process.chdir == "function") {
    var l = process.chdir;
    process.chdir = function(i) {
      a = null, l.call(process, i);
    }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, l);
  }
  Ts = r;
  function r(i) {
    e.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && u(i), i.lutimes || o(i), i.chown = d(i.chown), i.fchown = d(i.fchown), i.lchown = d(i.lchown), i.chmod = c(i.chmod), i.fchmod = c(i.fchmod), i.lchmod = c(i.lchmod), i.chownSync = f(i.chownSync), i.fchownSync = f(i.fchownSync), i.lchownSync = f(i.lchownSync), i.chmodSync = s(i.chmodSync), i.fchmodSync = s(i.fchmodSync), i.lchmodSync = s(i.lchmodSync), i.stat = m(i.stat), i.fstat = m(i.fstat), i.lstat = m(i.lstat), i.statSync = y(i.statSync), i.fstatSync = y(i.fstatSync), i.lstatSync = y(i.lstatSync), i.chmod && !i.lchmod && (i.lchmod = function(h, g, p) {
      p && process.nextTick(p);
    }, i.lchmodSync = function() {
    }), i.chown && !i.lchown && (i.lchown = function(h, g, p, E) {
      E && process.nextTick(E);
    }, i.lchownSync = function() {
    }), n === "win32" && (i.rename = typeof i.rename != "function" ? i.rename : (function(h) {
      function g(p, E, b) {
        var $ = Date.now(), _ = 0;
        h(p, E, function w(T) {
          if (T && (T.code === "EACCES" || T.code === "EPERM" || T.code === "EBUSY") && Date.now() - $ < 6e4) {
            setTimeout(function() {
              i.stat(E, function(P, G) {
                P && P.code === "ENOENT" ? h(p, E, w) : b(T);
              });
            }, _), _ < 100 && (_ += 10);
            return;
          }
          b && b(T);
        });
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(g, h), g;
    })(i.rename)), i.read = typeof i.read != "function" ? i.read : (function(h) {
      function g(p, E, b, $, _, w) {
        var T;
        if (w && typeof w == "function") {
          var P = 0;
          T = function(G, q, M) {
            if (G && G.code === "EAGAIN" && P < 10)
              return P++, h.call(i, p, E, b, $, _, T);
            w.apply(this, arguments);
          };
        }
        return h.call(i, p, E, b, $, _, T);
      }
      return Object.setPrototypeOf && Object.setPrototypeOf(g, h), g;
    })(i.read), i.readSync = typeof i.readSync != "function" ? i.readSync : /* @__PURE__ */ (function(h) {
      return function(g, p, E, b, $) {
        for (var _ = 0; ; )
          try {
            return h.call(i, g, p, E, b, $);
          } catch (w) {
            if (w.code === "EAGAIN" && _ < 10) {
              _++;
              continue;
            }
            throw w;
          }
      };
    })(i.readSync);
    function u(h) {
      h.lchmod = function(g, p, E) {
        h.open(
          g,
          e.O_WRONLY | e.O_SYMLINK,
          p,
          function(b, $) {
            if (b) {
              E && E(b);
              return;
            }
            h.fchmod($, p, function(_) {
              h.close($, function(w) {
                E && E(_ || w);
              });
            });
          }
        );
      }, h.lchmodSync = function(g, p) {
        var E = h.openSync(g, e.O_WRONLY | e.O_SYMLINK, p), b = !0, $;
        try {
          $ = h.fchmodSync(E, p), b = !1;
        } finally {
          if (b)
            try {
              h.closeSync(E);
            } catch {
            }
          else
            h.closeSync(E);
        }
        return $;
      };
    }
    function o(h) {
      e.hasOwnProperty("O_SYMLINK") && h.futimes ? (h.lutimes = function(g, p, E, b) {
        h.open(g, e.O_SYMLINK, function($, _) {
          if ($) {
            b && b($);
            return;
          }
          h.futimes(_, p, E, function(w) {
            h.close(_, function(T) {
              b && b(w || T);
            });
          });
        });
      }, h.lutimesSync = function(g, p, E) {
        var b = h.openSync(g, e.O_SYMLINK), $, _ = !0;
        try {
          $ = h.futimesSync(b, p, E), _ = !1;
        } finally {
          if (_)
            try {
              h.closeSync(b);
            } catch {
            }
          else
            h.closeSync(b);
        }
        return $;
      }) : h.futimes && (h.lutimes = function(g, p, E, b) {
        b && process.nextTick(b);
      }, h.lutimesSync = function() {
      });
    }
    function c(h) {
      return h && function(g, p, E) {
        return h.call(i, g, p, function(b) {
          v(b) && (b = null), E && E.apply(this, arguments);
        });
      };
    }
    function s(h) {
      return h && function(g, p) {
        try {
          return h.call(i, g, p);
        } catch (E) {
          if (!v(E)) throw E;
        }
      };
    }
    function d(h) {
      return h && function(g, p, E, b) {
        return h.call(i, g, p, E, function($) {
          v($) && ($ = null), b && b.apply(this, arguments);
        });
      };
    }
    function f(h) {
      return h && function(g, p, E) {
        try {
          return h.call(i, g, p, E);
        } catch (b) {
          if (!v(b)) throw b;
        }
      };
    }
    function m(h) {
      return h && function(g, p, E) {
        typeof p == "function" && (E = p, p = null);
        function b($, _) {
          _ && (_.uid < 0 && (_.uid += 4294967296), _.gid < 0 && (_.gid += 4294967296)), E && E.apply(this, arguments);
        }
        return p ? h.call(i, g, p, b) : h.call(i, g, b);
      };
    }
    function y(h) {
      return h && function(g, p) {
        var E = p ? h.call(i, g, p) : h.call(i, g);
        return E && (E.uid < 0 && (E.uid += 4294967296), E.gid < 0 && (E.gid += 4294967296)), E;
      };
    }
    function v(h) {
      if (!h || h.code === "ENOSYS")
        return !0;
      var g = !process.getuid || process.getuid() !== 0;
      return !!(g && (h.code === "EINVAL" || h.code === "EPERM"));
    }
  }
  return Ts;
}
var Ps, Ml;
function jv() {
  if (Ml) return Ps;
  Ml = 1;
  var e = Dn.Stream;
  Ps = t;
  function t(a) {
    return {
      ReadStream: n,
      WriteStream: l
    };
    function n(r, i) {
      if (!(this instanceof n)) return new n(r, i);
      e.call(this);
      var u = this;
      this.path = r, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
      for (var o = Object.keys(i), c = 0, s = o.length; c < s; c++) {
        var d = o[c];
        this[d] = i[d];
      }
      if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.end === void 0)
          this.end = 1 / 0;
        else if (typeof this.end != "number")
          throw TypeError("end must be a Number");
        if (this.start > this.end)
          throw new Error("start must be <= end");
        this.pos = this.start;
      }
      if (this.fd !== null) {
        process.nextTick(function() {
          u._read();
        });
        return;
      }
      a.open(this.path, this.flags, this.mode, function(f, m) {
        if (f) {
          u.emit("error", f), u.readable = !1;
          return;
        }
        u.fd = m, u.emit("open", m), u._read();
      });
    }
    function l(r, i) {
      if (!(this instanceof l)) return new l(r, i);
      e.call(this), this.path = r, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
      for (var u = Object.keys(i), o = 0, c = u.length; o < c; o++) {
        var s = u[o];
        this[s] = i[s];
      }
      if (this.start !== void 0) {
        if (typeof this.start != "number")
          throw TypeError("start must be a Number");
        if (this.start < 0)
          throw new Error("start must be >= zero");
        this.pos = this.start;
      }
      this.busy = !1, this._queue = [], this.fd === null && (this._open = a.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
    }
  }
  return Ps;
}
var Ns, xl;
function Mv() {
  if (xl) return Ns;
  xl = 1, Ns = t;
  var e = Object.getPrototypeOf || function(a) {
    return a.__proto__;
  };
  function t(a) {
    if (a === null || typeof a != "object")
      return a;
    if (a instanceof Object)
      var n = { __proto__: e(a) };
    else
      var n = /* @__PURE__ */ Object.create(null);
    return Object.getOwnPropertyNames(a).forEach(function(l) {
      Object.defineProperty(n, l, Object.getOwnPropertyDescriptor(a, l));
    }), n;
  }
  return Ns;
}
var zn, Vl;
function gt() {
  if (Vl) return zn;
  Vl = 1;
  var e = At, t = Uv(), a = jv(), n = Mv(), l = Ku, r, i;
  typeof Symbol == "function" && typeof Symbol.for == "function" ? (r = Symbol.for("graceful-fs.queue"), i = Symbol.for("graceful-fs.previous")) : (r = "___graceful-fs.queue", i = "___graceful-fs.previous");
  function u() {
  }
  function o(h, g) {
    Object.defineProperty(h, r, {
      get: function() {
        return g;
      }
    });
  }
  var c = u;
  if (l.debuglog ? c = l.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (c = function() {
    var h = l.format.apply(l, arguments);
    h = "GFS4: " + h.split(/\n/).join(`
GFS4: `), console.error(h);
  }), !e[r]) {
    var s = Ot[r] || [];
    o(e, s), e.close = (function(h) {
      function g(p, E) {
        return h.call(e, p, function(b) {
          b || y(), typeof E == "function" && E.apply(this, arguments);
        });
      }
      return Object.defineProperty(g, i, {
        value: h
      }), g;
    })(e.close), e.closeSync = (function(h) {
      function g(p) {
        h.apply(e, arguments), y();
      }
      return Object.defineProperty(g, i, {
        value: h
      }), g;
    })(e.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
      c(e[r]), Ty.equal(e[r].length, 0);
    });
  }
  Ot[r] || o(Ot, e[r]), zn = d(n(e)), process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !e.__patched && (zn = d(e), e.__patched = !0);
  function d(h) {
    t(h), h.gracefulify = d, h.createReadStream = C, h.createWriteStream = j;
    var g = h.readFile;
    h.readFile = p;
    function p(N, x, O) {
      return typeof x == "function" && (O = x, x = null), I(N, x, O);
      function I(Q, H, A, L) {
        return g(Q, H, function(X) {
          X && (X.code === "EMFILE" || X.code === "ENFILE") ? f([I, [Q, H, A], X, L || Date.now(), Date.now()]) : typeof A == "function" && A.apply(this, arguments);
        });
      }
    }
    var E = h.writeFile;
    h.writeFile = b;
    function b(N, x, O, I) {
      return typeof O == "function" && (I = O, O = null), Q(N, x, O, I);
      function Q(H, A, L, X, J) {
        return E(H, A, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? f([Q, [H, A, L, X], re, J || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var $ = h.appendFile;
    $ && (h.appendFile = _);
    function _(N, x, O, I) {
      return typeof O == "function" && (I = O, O = null), Q(N, x, O, I);
      function Q(H, A, L, X, J) {
        return $(H, A, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? f([Q, [H, A, L, X], re, J || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var w = h.copyFile;
    w && (h.copyFile = T);
    function T(N, x, O, I) {
      return typeof O == "function" && (I = O, O = 0), Q(N, x, O, I);
      function Q(H, A, L, X, J) {
        return w(H, A, L, function(re) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? f([Q, [H, A, L, X], re, J || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    var P = h.readdir;
    h.readdir = q;
    var G = /^v[0-5]\./;
    function q(N, x, O) {
      typeof x == "function" && (O = x, x = null);
      var I = G.test(process.version) ? function(A, L, X, J) {
        return P(A, Q(
          A,
          L,
          X,
          J
        ));
      } : function(A, L, X, J) {
        return P(A, L, Q(
          A,
          L,
          X,
          J
        ));
      };
      return I(N, x, O);
      function Q(H, A, L, X) {
        return function(J, re) {
          J && (J.code === "EMFILE" || J.code === "ENFILE") ? f([
            I,
            [H, A, L],
            J,
            X || Date.now(),
            Date.now()
          ]) : (re && re.sort && re.sort(), typeof L == "function" && L.call(this, J, re));
        };
      }
    }
    if (process.version.substr(0, 4) === "v0.8") {
      var M = a(h);
      B = M.ReadStream, Z = M.WriteStream;
    }
    var K = h.ReadStream;
    K && (B.prototype = Object.create(K.prototype), B.prototype.open = W);
    var k = h.WriteStream;
    k && (Z.prototype = Object.create(k.prototype), Z.prototype.open = V), Object.defineProperty(h, "ReadStream", {
      get: function() {
        return B;
      },
      set: function(N) {
        B = N;
      },
      enumerable: !0,
      configurable: !0
    }), Object.defineProperty(h, "WriteStream", {
      get: function() {
        return Z;
      },
      set: function(N) {
        Z = N;
      },
      enumerable: !0,
      configurable: !0
    });
    var F = B;
    Object.defineProperty(h, "FileReadStream", {
      get: function() {
        return F;
      },
      set: function(N) {
        F = N;
      },
      enumerable: !0,
      configurable: !0
    });
    var Y = Z;
    Object.defineProperty(h, "FileWriteStream", {
      get: function() {
        return Y;
      },
      set: function(N) {
        Y = N;
      },
      enumerable: !0,
      configurable: !0
    });
    function B(N, x) {
      return this instanceof B ? (K.apply(this, arguments), this) : B.apply(Object.create(B.prototype), arguments);
    }
    function W() {
      var N = this;
      R(N.path, N.flags, N.mode, function(x, O) {
        x ? (N.autoClose && N.destroy(), N.emit("error", x)) : (N.fd = O, N.emit("open", O), N.read());
      });
    }
    function Z(N, x) {
      return this instanceof Z ? (k.apply(this, arguments), this) : Z.apply(Object.create(Z.prototype), arguments);
    }
    function V() {
      var N = this;
      R(N.path, N.flags, N.mode, function(x, O) {
        x ? (N.destroy(), N.emit("error", x)) : (N.fd = O, N.emit("open", O));
      });
    }
    function C(N, x) {
      return new h.ReadStream(N, x);
    }
    function j(N, x) {
      return new h.WriteStream(N, x);
    }
    var D = h.open;
    h.open = R;
    function R(N, x, O, I) {
      return typeof O == "function" && (I = O, O = null), Q(N, x, O, I);
      function Q(H, A, L, X, J) {
        return D(H, A, L, function(re, fe) {
          re && (re.code === "EMFILE" || re.code === "ENFILE") ? f([Q, [H, A, L, X], re, J || Date.now(), Date.now()]) : typeof X == "function" && X.apply(this, arguments);
        });
      }
    }
    return h;
  }
  function f(h) {
    c("ENQUEUE", h[0].name, h[1]), e[r].push(h), v();
  }
  var m;
  function y() {
    for (var h = Date.now(), g = 0; g < e[r].length; ++g)
      e[r][g].length > 2 && (e[r][g][3] = h, e[r][g][4] = h);
    v();
  }
  function v() {
    if (clearTimeout(m), m = void 0, e[r].length !== 0) {
      var h = e[r].shift(), g = h[0], p = h[1], E = h[2], b = h[3], $ = h[4];
      if (b === void 0)
        c("RETRY", g.name, p), g.apply(null, p);
      else if (Date.now() - b >= 6e4) {
        c("TIMEOUT", g.name, p);
        var _ = p.pop();
        typeof _ == "function" && _.call(null, E);
      } else {
        var w = Date.now() - $, T = Math.max($ - b, 1), P = Math.min(T * 1.2, 100);
        w >= P ? (c("RETRY", g.name, p), g.apply(null, p.concat([b]))) : e[r].push(h);
      }
      m === void 0 && (m = setTimeout(v, 0));
    }
  }
  return zn;
}
var Gl;
function Jr() {
  return Gl || (Gl = 1, (function(e) {
    const t = wt().fromCallback, a = gt(), n = [
      "access",
      "appendFile",
      "chmod",
      "chown",
      "close",
      "copyFile",
      "fchmod",
      "fchown",
      "fdatasync",
      "fstat",
      "fsync",
      "ftruncate",
      "futimes",
      "lchmod",
      "lchown",
      "link",
      "lstat",
      "mkdir",
      "mkdtemp",
      "open",
      "opendir",
      "readdir",
      "readFile",
      "readlink",
      "realpath",
      "rename",
      "rm",
      "rmdir",
      "stat",
      "symlink",
      "truncate",
      "unlink",
      "utimes",
      "writeFile"
    ].filter((l) => typeof a[l] == "function");
    Object.assign(e, a), n.forEach((l) => {
      e[l] = t(a[l]);
    }), e.exists = function(l, r) {
      return typeof r == "function" ? a.exists(l, r) : new Promise((i) => a.exists(l, i));
    }, e.read = function(l, r, i, u, o, c) {
      return typeof c == "function" ? a.read(l, r, i, u, o, c) : new Promise((s, d) => {
        a.read(l, r, i, u, o, (f, m, y) => {
          if (f) return d(f);
          s({ bytesRead: m, buffer: y });
        });
      });
    }, e.write = function(l, r, ...i) {
      return typeof i[i.length - 1] == "function" ? a.write(l, r, ...i) : new Promise((u, o) => {
        a.write(l, r, ...i, (c, s, d) => {
          if (c) return o(c);
          u({ bytesWritten: s, buffer: d });
        });
      });
    }, typeof a.writev == "function" && (e.writev = function(l, r, ...i) {
      return typeof i[i.length - 1] == "function" ? a.writev(l, r, ...i) : new Promise((u, o) => {
        a.writev(l, r, ...i, (c, s, d) => {
          if (c) return o(c);
          u({ bytesWritten: s, buffers: d });
        });
      });
    }), typeof a.realpath.native == "function" ? e.realpath.native = t(a.realpath.native) : process.emitWarning(
      "fs.realpath.native is not a function. Is fs being monkey-patched?",
      "Warning",
      "fs-extra-WARN0003"
    );
  })(Rs)), Rs;
}
var Kn = {}, Is = {}, Bl;
function xv() {
  if (Bl) return Is;
  Bl = 1;
  const e = Ge;
  return Is.checkPath = function(a) {
    if (process.platform === "win32" && /[<>:"|?*]/.test(a.replace(e.parse(a).root, ""))) {
      const l = new Error(`Path contains invalid characters: ${a}`);
      throw l.code = "EINVAL", l;
    }
  }, Is;
}
var Hl;
function Vv() {
  if (Hl) return Kn;
  Hl = 1;
  const e = /* @__PURE__ */ Jr(), { checkPath: t } = /* @__PURE__ */ xv(), a = (n) => {
    const l = { mode: 511 };
    return typeof n == "number" ? n : { ...l, ...n }.mode;
  };
  return Kn.makeDir = async (n, l) => (t(n), e.mkdir(n, {
    mode: a(l),
    recursive: !0
  })), Kn.makeDirSync = (n, l) => (t(n), e.mkdirSync(n, {
    mode: a(l),
    recursive: !0
  })), Kn;
}
var Os, zl;
function Mt() {
  if (zl) return Os;
  zl = 1;
  const e = wt().fromPromise, { makeDir: t, makeDirSync: a } = /* @__PURE__ */ Vv(), n = e(t);
  return Os = {
    mkdirs: n,
    mkdirsSync: a,
    // alias
    mkdirp: n,
    mkdirpSync: a,
    ensureDir: n,
    ensureDirSync: a
  }, Os;
}
var As, Kl;
function Cr() {
  if (Kl) return As;
  Kl = 1;
  const e = wt().fromPromise, t = /* @__PURE__ */ Jr();
  function a(n) {
    return t.access(n).then(() => !0).catch(() => !1);
  }
  return As = {
    pathExists: e(a),
    pathExistsSync: t.existsSync
  }, As;
}
var Cs, Xl;
function Cy() {
  if (Xl) return Cs;
  Xl = 1;
  const e = gt();
  function t(n, l, r, i) {
    e.open(n, "r+", (u, o) => {
      if (u) return i(u);
      e.futimes(o, l, r, (c) => {
        e.close(o, (s) => {
          i && i(c || s);
        });
      });
    });
  }
  function a(n, l, r) {
    const i = e.openSync(n, "r+");
    return e.futimesSync(i, l, r), e.closeSync(i);
  }
  return Cs = {
    utimesMillis: t,
    utimesMillisSync: a
  }, Cs;
}
var Ds, Wl;
function Qr() {
  if (Wl) return Ds;
  Wl = 1;
  const e = /* @__PURE__ */ Jr(), t = Ge, a = Ku;
  function n(f, m, y) {
    const v = y.dereference ? (h) => e.stat(h, { bigint: !0 }) : (h) => e.lstat(h, { bigint: !0 });
    return Promise.all([
      v(f),
      v(m).catch((h) => {
        if (h.code === "ENOENT") return null;
        throw h;
      })
    ]).then(([h, g]) => ({ srcStat: h, destStat: g }));
  }
  function l(f, m, y) {
    let v;
    const h = y.dereference ? (p) => e.statSync(p, { bigint: !0 }) : (p) => e.lstatSync(p, { bigint: !0 }), g = h(f);
    try {
      v = h(m);
    } catch (p) {
      if (p.code === "ENOENT") return { srcStat: g, destStat: null };
      throw p;
    }
    return { srcStat: g, destStat: v };
  }
  function r(f, m, y, v, h) {
    a.callbackify(n)(f, m, v, (g, p) => {
      if (g) return h(g);
      const { srcStat: E, destStat: b } = p;
      if (b) {
        if (c(E, b)) {
          const $ = t.basename(f), _ = t.basename(m);
          return y === "move" && $ !== _ && $.toLowerCase() === _.toLowerCase() ? h(null, { srcStat: E, destStat: b, isChangingCase: !0 }) : h(new Error("Source and destination must not be the same."));
        }
        if (E.isDirectory() && !b.isDirectory())
          return h(new Error(`Cannot overwrite non-directory '${m}' with directory '${f}'.`));
        if (!E.isDirectory() && b.isDirectory())
          return h(new Error(`Cannot overwrite directory '${m}' with non-directory '${f}'.`));
      }
      return E.isDirectory() && s(f, m) ? h(new Error(d(f, m, y))) : h(null, { srcStat: E, destStat: b });
    });
  }
  function i(f, m, y, v) {
    const { srcStat: h, destStat: g } = l(f, m, v);
    if (g) {
      if (c(h, g)) {
        const p = t.basename(f), E = t.basename(m);
        if (y === "move" && p !== E && p.toLowerCase() === E.toLowerCase())
          return { srcStat: h, destStat: g, isChangingCase: !0 };
        throw new Error("Source and destination must not be the same.");
      }
      if (h.isDirectory() && !g.isDirectory())
        throw new Error(`Cannot overwrite non-directory '${m}' with directory '${f}'.`);
      if (!h.isDirectory() && g.isDirectory())
        throw new Error(`Cannot overwrite directory '${m}' with non-directory '${f}'.`);
    }
    if (h.isDirectory() && s(f, m))
      throw new Error(d(f, m, y));
    return { srcStat: h, destStat: g };
  }
  function u(f, m, y, v, h) {
    const g = t.resolve(t.dirname(f)), p = t.resolve(t.dirname(y));
    if (p === g || p === t.parse(p).root) return h();
    e.stat(p, { bigint: !0 }, (E, b) => E ? E.code === "ENOENT" ? h() : h(E) : c(m, b) ? h(new Error(d(f, y, v))) : u(f, m, p, v, h));
  }
  function o(f, m, y, v) {
    const h = t.resolve(t.dirname(f)), g = t.resolve(t.dirname(y));
    if (g === h || g === t.parse(g).root) return;
    let p;
    try {
      p = e.statSync(g, { bigint: !0 });
    } catch (E) {
      if (E.code === "ENOENT") return;
      throw E;
    }
    if (c(m, p))
      throw new Error(d(f, y, v));
    return o(f, m, g, v);
  }
  function c(f, m) {
    return m.ino && m.dev && m.ino === f.ino && m.dev === f.dev;
  }
  function s(f, m) {
    const y = t.resolve(f).split(t.sep).filter((h) => h), v = t.resolve(m).split(t.sep).filter((h) => h);
    return y.reduce((h, g, p) => h && v[p] === g, !0);
  }
  function d(f, m, y) {
    return `Cannot ${y} '${f}' to a subdirectory of itself, '${m}'.`;
  }
  return Ds = {
    checkPaths: r,
    checkPathsSync: i,
    checkParentPaths: u,
    checkParentPathsSync: o,
    isSrcSubdir: s,
    areIdentical: c
  }, Ds;
}
var ks, Yl;
function Gv() {
  if (Yl) return ks;
  Yl = 1;
  const e = gt(), t = Ge, a = Mt().mkdirs, n = Cr().pathExists, l = Cy().utimesMillis, r = /* @__PURE__ */ Qr();
  function i(q, M, K, k) {
    typeof K == "function" && !k ? (k = K, K = {}) : typeof K == "function" && (K = { filter: K }), k = k || function() {
    }, K = K || {}, K.clobber = "clobber" in K ? !!K.clobber : !0, K.overwrite = "overwrite" in K ? !!K.overwrite : K.clobber, K.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0001"
    ), r.checkPaths(q, M, "copy", K, (F, Y) => {
      if (F) return k(F);
      const { srcStat: B, destStat: W } = Y;
      r.checkParentPaths(q, B, M, "copy", (Z) => Z ? k(Z) : K.filter ? o(u, W, q, M, K, k) : u(W, q, M, K, k));
    });
  }
  function u(q, M, K, k, F) {
    const Y = t.dirname(K);
    n(Y, (B, W) => {
      if (B) return F(B);
      if (W) return s(q, M, K, k, F);
      a(Y, (Z) => Z ? F(Z) : s(q, M, K, k, F));
    });
  }
  function o(q, M, K, k, F, Y) {
    Promise.resolve(F.filter(K, k)).then((B) => B ? q(M, K, k, F, Y) : Y(), (B) => Y(B));
  }
  function c(q, M, K, k, F) {
    return k.filter ? o(s, q, M, K, k, F) : s(q, M, K, k, F);
  }
  function s(q, M, K, k, F) {
    (k.dereference ? e.stat : e.lstat)(M, (B, W) => B ? F(B) : W.isDirectory() ? b(W, q, M, K, k, F) : W.isFile() || W.isCharacterDevice() || W.isBlockDevice() ? d(W, q, M, K, k, F) : W.isSymbolicLink() ? P(q, M, K, k, F) : W.isSocket() ? F(new Error(`Cannot copy a socket file: ${M}`)) : W.isFIFO() ? F(new Error(`Cannot copy a FIFO pipe: ${M}`)) : F(new Error(`Unknown file: ${M}`)));
  }
  function d(q, M, K, k, F, Y) {
    return M ? f(q, K, k, F, Y) : m(q, K, k, F, Y);
  }
  function f(q, M, K, k, F) {
    if (k.overwrite)
      e.unlink(K, (Y) => Y ? F(Y) : m(q, M, K, k, F));
    else return k.errorOnExist ? F(new Error(`'${K}' already exists`)) : F();
  }
  function m(q, M, K, k, F) {
    e.copyFile(M, K, (Y) => Y ? F(Y) : k.preserveTimestamps ? y(q.mode, M, K, F) : p(K, q.mode, F));
  }
  function y(q, M, K, k) {
    return v(q) ? h(K, q, (F) => F ? k(F) : g(q, M, K, k)) : g(q, M, K, k);
  }
  function v(q) {
    return (q & 128) === 0;
  }
  function h(q, M, K) {
    return p(q, M | 128, K);
  }
  function g(q, M, K, k) {
    E(M, K, (F) => F ? k(F) : p(K, q, k));
  }
  function p(q, M, K) {
    return e.chmod(q, M, K);
  }
  function E(q, M, K) {
    e.stat(q, (k, F) => k ? K(k) : l(M, F.atime, F.mtime, K));
  }
  function b(q, M, K, k, F, Y) {
    return M ? _(K, k, F, Y) : $(q.mode, K, k, F, Y);
  }
  function $(q, M, K, k, F) {
    e.mkdir(K, (Y) => {
      if (Y) return F(Y);
      _(M, K, k, (B) => B ? F(B) : p(K, q, F));
    });
  }
  function _(q, M, K, k) {
    e.readdir(q, (F, Y) => F ? k(F) : w(Y, q, M, K, k));
  }
  function w(q, M, K, k, F) {
    const Y = q.pop();
    return Y ? T(q, Y, M, K, k, F) : F();
  }
  function T(q, M, K, k, F, Y) {
    const B = t.join(K, M), W = t.join(k, M);
    r.checkPaths(B, W, "copy", F, (Z, V) => {
      if (Z) return Y(Z);
      const { destStat: C } = V;
      c(C, B, W, F, (j) => j ? Y(j) : w(q, K, k, F, Y));
    });
  }
  function P(q, M, K, k, F) {
    e.readlink(M, (Y, B) => {
      if (Y) return F(Y);
      if (k.dereference && (B = t.resolve(process.cwd(), B)), q)
        e.readlink(K, (W, Z) => W ? W.code === "EINVAL" || W.code === "UNKNOWN" ? e.symlink(B, K, F) : F(W) : (k.dereference && (Z = t.resolve(process.cwd(), Z)), r.isSrcSubdir(B, Z) ? F(new Error(`Cannot copy '${B}' to a subdirectory of itself, '${Z}'.`)) : q.isDirectory() && r.isSrcSubdir(Z, B) ? F(new Error(`Cannot overwrite '${Z}' with '${B}'.`)) : G(B, K, F)));
      else
        return e.symlink(B, K, F);
    });
  }
  function G(q, M, K) {
    e.unlink(M, (k) => k ? K(k) : e.symlink(q, M, K));
  }
  return ks = i, ks;
}
var Ls, Jl;
function Bv() {
  if (Jl) return Ls;
  Jl = 1;
  const e = gt(), t = Ge, a = Mt().mkdirsSync, n = Cy().utimesMillisSync, l = /* @__PURE__ */ Qr();
  function r(w, T, P) {
    typeof P == "function" && (P = { filter: P }), P = P || {}, P.clobber = "clobber" in P ? !!P.clobber : !0, P.overwrite = "overwrite" in P ? !!P.overwrite : P.clobber, P.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
      `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
      "Warning",
      "fs-extra-WARN0002"
    );
    const { srcStat: G, destStat: q } = l.checkPathsSync(w, T, "copy", P);
    return l.checkParentPathsSync(w, G, T, "copy"), i(q, w, T, P);
  }
  function i(w, T, P, G) {
    if (G.filter && !G.filter(T, P)) return;
    const q = t.dirname(P);
    return e.existsSync(q) || a(q), o(w, T, P, G);
  }
  function u(w, T, P, G) {
    if (!(G.filter && !G.filter(T, P)))
      return o(w, T, P, G);
  }
  function o(w, T, P, G) {
    const M = (G.dereference ? e.statSync : e.lstatSync)(T);
    if (M.isDirectory()) return g(M, w, T, P, G);
    if (M.isFile() || M.isCharacterDevice() || M.isBlockDevice()) return c(M, w, T, P, G);
    if (M.isSymbolicLink()) return $(w, T, P, G);
    throw M.isSocket() ? new Error(`Cannot copy a socket file: ${T}`) : M.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${T}`) : new Error(`Unknown file: ${T}`);
  }
  function c(w, T, P, G, q) {
    return T ? s(w, P, G, q) : d(w, P, G, q);
  }
  function s(w, T, P, G) {
    if (G.overwrite)
      return e.unlinkSync(P), d(w, T, P, G);
    if (G.errorOnExist)
      throw new Error(`'${P}' already exists`);
  }
  function d(w, T, P, G) {
    return e.copyFileSync(T, P), G.preserveTimestamps && f(w.mode, T, P), v(P, w.mode);
  }
  function f(w, T, P) {
    return m(w) && y(P, w), h(T, P);
  }
  function m(w) {
    return (w & 128) === 0;
  }
  function y(w, T) {
    return v(w, T | 128);
  }
  function v(w, T) {
    return e.chmodSync(w, T);
  }
  function h(w, T) {
    const P = e.statSync(w);
    return n(T, P.atime, P.mtime);
  }
  function g(w, T, P, G, q) {
    return T ? E(P, G, q) : p(w.mode, P, G, q);
  }
  function p(w, T, P, G) {
    return e.mkdirSync(P), E(T, P, G), v(P, w);
  }
  function E(w, T, P) {
    e.readdirSync(w).forEach((G) => b(G, w, T, P));
  }
  function b(w, T, P, G) {
    const q = t.join(T, w), M = t.join(P, w), { destStat: K } = l.checkPathsSync(q, M, "copy", G);
    return u(K, q, M, G);
  }
  function $(w, T, P, G) {
    let q = e.readlinkSync(T);
    if (G.dereference && (q = t.resolve(process.cwd(), q)), w) {
      let M;
      try {
        M = e.readlinkSync(P);
      } catch (K) {
        if (K.code === "EINVAL" || K.code === "UNKNOWN") return e.symlinkSync(q, P);
        throw K;
      }
      if (G.dereference && (M = t.resolve(process.cwd(), M)), l.isSrcSubdir(q, M))
        throw new Error(`Cannot copy '${q}' to a subdirectory of itself, '${M}'.`);
      if (e.statSync(P).isDirectory() && l.isSrcSubdir(M, q))
        throw new Error(`Cannot overwrite '${M}' with '${q}'.`);
      return _(q, P);
    } else
      return e.symlinkSync(q, P);
  }
  function _(w, T) {
    return e.unlinkSync(T), e.symlinkSync(w, T);
  }
  return Ls = r, Ls;
}
var qs, Ql;
function Xu() {
  if (Ql) return qs;
  Ql = 1;
  const e = wt().fromCallback;
  return qs = {
    copy: e(/* @__PURE__ */ Gv()),
    copySync: /* @__PURE__ */ Bv()
  }, qs;
}
var Fs, Zl;
function Hv() {
  if (Zl) return Fs;
  Zl = 1;
  const e = gt(), t = Ge, a = Ty, n = process.platform === "win32";
  function l(y) {
    [
      "unlink",
      "chmod",
      "stat",
      "lstat",
      "rmdir",
      "readdir"
    ].forEach((h) => {
      y[h] = y[h] || e[h], h = h + "Sync", y[h] = y[h] || e[h];
    }), y.maxBusyTries = y.maxBusyTries || 3;
  }
  function r(y, v, h) {
    let g = 0;
    typeof v == "function" && (h = v, v = {}), a(y, "rimraf: missing path"), a.strictEqual(typeof y, "string", "rimraf: path should be a string"), a.strictEqual(typeof h, "function", "rimraf: callback function required"), a(v, "rimraf: invalid options argument provided"), a.strictEqual(typeof v, "object", "rimraf: options should be object"), l(v), i(y, v, function p(E) {
      if (E) {
        if ((E.code === "EBUSY" || E.code === "ENOTEMPTY" || E.code === "EPERM") && g < v.maxBusyTries) {
          g++;
          const b = g * 100;
          return setTimeout(() => i(y, v, p), b);
        }
        E.code === "ENOENT" && (E = null);
      }
      h(E);
    });
  }
  function i(y, v, h) {
    a(y), a(v), a(typeof h == "function"), v.lstat(y, (g, p) => {
      if (g && g.code === "ENOENT")
        return h(null);
      if (g && g.code === "EPERM" && n)
        return u(y, v, g, h);
      if (p && p.isDirectory())
        return c(y, v, g, h);
      v.unlink(y, (E) => {
        if (E) {
          if (E.code === "ENOENT")
            return h(null);
          if (E.code === "EPERM")
            return n ? u(y, v, E, h) : c(y, v, E, h);
          if (E.code === "EISDIR")
            return c(y, v, E, h);
        }
        return h(E);
      });
    });
  }
  function u(y, v, h, g) {
    a(y), a(v), a(typeof g == "function"), v.chmod(y, 438, (p) => {
      p ? g(p.code === "ENOENT" ? null : h) : v.stat(y, (E, b) => {
        E ? g(E.code === "ENOENT" ? null : h) : b.isDirectory() ? c(y, v, h, g) : v.unlink(y, g);
      });
    });
  }
  function o(y, v, h) {
    let g;
    a(y), a(v);
    try {
      v.chmodSync(y, 438);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw h;
    }
    try {
      g = v.statSync(y);
    } catch (p) {
      if (p.code === "ENOENT")
        return;
      throw h;
    }
    g.isDirectory() ? f(y, v, h) : v.unlinkSync(y);
  }
  function c(y, v, h, g) {
    a(y), a(v), a(typeof g == "function"), v.rmdir(y, (p) => {
      p && (p.code === "ENOTEMPTY" || p.code === "EEXIST" || p.code === "EPERM") ? s(y, v, g) : p && p.code === "ENOTDIR" ? g(h) : g(p);
    });
  }
  function s(y, v, h) {
    a(y), a(v), a(typeof h == "function"), v.readdir(y, (g, p) => {
      if (g) return h(g);
      let E = p.length, b;
      if (E === 0) return v.rmdir(y, h);
      p.forEach(($) => {
        r(t.join(y, $), v, (_) => {
          if (!b) {
            if (_) return h(b = _);
            --E === 0 && v.rmdir(y, h);
          }
        });
      });
    });
  }
  function d(y, v) {
    let h;
    v = v || {}, l(v), a(y, "rimraf: missing path"), a.strictEqual(typeof y, "string", "rimraf: path should be a string"), a(v, "rimraf: missing options"), a.strictEqual(typeof v, "object", "rimraf: options should be object");
    try {
      h = v.lstatSync(y);
    } catch (g) {
      if (g.code === "ENOENT")
        return;
      g.code === "EPERM" && n && o(y, v, g);
    }
    try {
      h && h.isDirectory() ? f(y, v, null) : v.unlinkSync(y);
    } catch (g) {
      if (g.code === "ENOENT")
        return;
      if (g.code === "EPERM")
        return n ? o(y, v, g) : f(y, v, g);
      if (g.code !== "EISDIR")
        throw g;
      f(y, v, g);
    }
  }
  function f(y, v, h) {
    a(y), a(v);
    try {
      v.rmdirSync(y);
    } catch (g) {
      if (g.code === "ENOTDIR")
        throw h;
      if (g.code === "ENOTEMPTY" || g.code === "EEXIST" || g.code === "EPERM")
        m(y, v);
      else if (g.code !== "ENOENT")
        throw g;
    }
  }
  function m(y, v) {
    if (a(y), a(v), v.readdirSync(y).forEach((h) => d(t.join(y, h), v)), n) {
      const h = Date.now();
      do
        try {
          return v.rmdirSync(y, v);
        } catch {
        }
      while (Date.now() - h < 500);
    } else
      return v.rmdirSync(y, v);
  }
  return Fs = r, r.sync = d, Fs;
}
var Us, ef;
function es() {
  if (ef) return Us;
  ef = 1;
  const e = gt(), t = wt().fromCallback, a = /* @__PURE__ */ Hv();
  function n(r, i) {
    if (e.rm) return e.rm(r, { recursive: !0, force: !0 }, i);
    a(r, i);
  }
  function l(r) {
    if (e.rmSync) return e.rmSync(r, { recursive: !0, force: !0 });
    a.sync(r);
  }
  return Us = {
    remove: t(n),
    removeSync: l
  }, Us;
}
var js, tf;
function zv() {
  if (tf) return js;
  tf = 1;
  const e = wt().fromPromise, t = /* @__PURE__ */ Jr(), a = Ge, n = /* @__PURE__ */ Mt(), l = /* @__PURE__ */ es(), r = e(async function(o) {
    let c;
    try {
      c = await t.readdir(o);
    } catch {
      return n.mkdirs(o);
    }
    return Promise.all(c.map((s) => l.remove(a.join(o, s))));
  });
  function i(u) {
    let o;
    try {
      o = t.readdirSync(u);
    } catch {
      return n.mkdirsSync(u);
    }
    o.forEach((c) => {
      c = a.join(u, c), l.removeSync(c);
    });
  }
  return js = {
    emptyDirSync: i,
    emptydirSync: i,
    emptyDir: r,
    emptydir: r
  }, js;
}
var Ms, rf;
function Kv() {
  if (rf) return Ms;
  rf = 1;
  const e = wt().fromCallback, t = Ge, a = gt(), n = /* @__PURE__ */ Mt();
  function l(i, u) {
    function o() {
      a.writeFile(i, "", (c) => {
        if (c) return u(c);
        u();
      });
    }
    a.stat(i, (c, s) => {
      if (!c && s.isFile()) return u();
      const d = t.dirname(i);
      a.stat(d, (f, m) => {
        if (f)
          return f.code === "ENOENT" ? n.mkdirs(d, (y) => {
            if (y) return u(y);
            o();
          }) : u(f);
        m.isDirectory() ? o() : a.readdir(d, (y) => {
          if (y) return u(y);
        });
      });
    });
  }
  function r(i) {
    let u;
    try {
      u = a.statSync(i);
    } catch {
    }
    if (u && u.isFile()) return;
    const o = t.dirname(i);
    try {
      a.statSync(o).isDirectory() || a.readdirSync(o);
    } catch (c) {
      if (c && c.code === "ENOENT") n.mkdirsSync(o);
      else throw c;
    }
    a.writeFileSync(i, "");
  }
  return Ms = {
    createFile: e(l),
    createFileSync: r
  }, Ms;
}
var xs, nf;
function Xv() {
  if (nf) return xs;
  nf = 1;
  const e = wt().fromCallback, t = Ge, a = gt(), n = /* @__PURE__ */ Mt(), l = Cr().pathExists, { areIdentical: r } = /* @__PURE__ */ Qr();
  function i(o, c, s) {
    function d(f, m) {
      a.link(f, m, (y) => {
        if (y) return s(y);
        s(null);
      });
    }
    a.lstat(c, (f, m) => {
      a.lstat(o, (y, v) => {
        if (y)
          return y.message = y.message.replace("lstat", "ensureLink"), s(y);
        if (m && r(v, m)) return s(null);
        const h = t.dirname(c);
        l(h, (g, p) => {
          if (g) return s(g);
          if (p) return d(o, c);
          n.mkdirs(h, (E) => {
            if (E) return s(E);
            d(o, c);
          });
        });
      });
    });
  }
  function u(o, c) {
    let s;
    try {
      s = a.lstatSync(c);
    } catch {
    }
    try {
      const m = a.lstatSync(o);
      if (s && r(m, s)) return;
    } catch (m) {
      throw m.message = m.message.replace("lstat", "ensureLink"), m;
    }
    const d = t.dirname(c);
    return a.existsSync(d) || n.mkdirsSync(d), a.linkSync(o, c);
  }
  return xs = {
    createLink: e(i),
    createLinkSync: u
  }, xs;
}
var Vs, af;
function Wv() {
  if (af) return Vs;
  af = 1;
  const e = Ge, t = gt(), a = Cr().pathExists;
  function n(r, i, u) {
    if (e.isAbsolute(r))
      return t.lstat(r, (o) => o ? (o.message = o.message.replace("lstat", "ensureSymlink"), u(o)) : u(null, {
        toCwd: r,
        toDst: r
      }));
    {
      const o = e.dirname(i), c = e.join(o, r);
      return a(c, (s, d) => s ? u(s) : d ? u(null, {
        toCwd: c,
        toDst: r
      }) : t.lstat(r, (f) => f ? (f.message = f.message.replace("lstat", "ensureSymlink"), u(f)) : u(null, {
        toCwd: r,
        toDst: e.relative(o, r)
      })));
    }
  }
  function l(r, i) {
    let u;
    if (e.isAbsolute(r)) {
      if (u = t.existsSync(r), !u) throw new Error("absolute srcpath does not exist");
      return {
        toCwd: r,
        toDst: r
      };
    } else {
      const o = e.dirname(i), c = e.join(o, r);
      if (u = t.existsSync(c), u)
        return {
          toCwd: c,
          toDst: r
        };
      if (u = t.existsSync(r), !u) throw new Error("relative srcpath does not exist");
      return {
        toCwd: r,
        toDst: e.relative(o, r)
      };
    }
  }
  return Vs = {
    symlinkPaths: n,
    symlinkPathsSync: l
  }, Vs;
}
var Gs, sf;
function Yv() {
  if (sf) return Gs;
  sf = 1;
  const e = gt();
  function t(n, l, r) {
    if (r = typeof l == "function" ? l : r, l = typeof l == "function" ? !1 : l, l) return r(null, l);
    e.lstat(n, (i, u) => {
      if (i) return r(null, "file");
      l = u && u.isDirectory() ? "dir" : "file", r(null, l);
    });
  }
  function a(n, l) {
    let r;
    if (l) return l;
    try {
      r = e.lstatSync(n);
    } catch {
      return "file";
    }
    return r && r.isDirectory() ? "dir" : "file";
  }
  return Gs = {
    symlinkType: t,
    symlinkTypeSync: a
  }, Gs;
}
var Bs, of;
function Jv() {
  if (of) return Bs;
  of = 1;
  const e = wt().fromCallback, t = Ge, a = /* @__PURE__ */ Jr(), n = /* @__PURE__ */ Mt(), l = n.mkdirs, r = n.mkdirsSync, i = /* @__PURE__ */ Wv(), u = i.symlinkPaths, o = i.symlinkPathsSync, c = /* @__PURE__ */ Yv(), s = c.symlinkType, d = c.symlinkTypeSync, f = Cr().pathExists, { areIdentical: m } = /* @__PURE__ */ Qr();
  function y(g, p, E, b) {
    b = typeof E == "function" ? E : b, E = typeof E == "function" ? !1 : E, a.lstat(p, ($, _) => {
      !$ && _.isSymbolicLink() ? Promise.all([
        a.stat(g),
        a.stat(p)
      ]).then(([w, T]) => {
        if (m(w, T)) return b(null);
        v(g, p, E, b);
      }) : v(g, p, E, b);
    });
  }
  function v(g, p, E, b) {
    u(g, p, ($, _) => {
      if ($) return b($);
      g = _.toDst, s(_.toCwd, E, (w, T) => {
        if (w) return b(w);
        const P = t.dirname(p);
        f(P, (G, q) => {
          if (G) return b(G);
          if (q) return a.symlink(g, p, T, b);
          l(P, (M) => {
            if (M) return b(M);
            a.symlink(g, p, T, b);
          });
        });
      });
    });
  }
  function h(g, p, E) {
    let b;
    try {
      b = a.lstatSync(p);
    } catch {
    }
    if (b && b.isSymbolicLink()) {
      const T = a.statSync(g), P = a.statSync(p);
      if (m(T, P)) return;
    }
    const $ = o(g, p);
    g = $.toDst, E = d($.toCwd, E);
    const _ = t.dirname(p);
    return a.existsSync(_) || r(_), a.symlinkSync(g, p, E);
  }
  return Bs = {
    createSymlink: e(y),
    createSymlinkSync: h
  }, Bs;
}
var Hs, cf;
function Qv() {
  if (cf) return Hs;
  cf = 1;
  const { createFile: e, createFileSync: t } = /* @__PURE__ */ Kv(), { createLink: a, createLinkSync: n } = /* @__PURE__ */ Xv(), { createSymlink: l, createSymlinkSync: r } = /* @__PURE__ */ Jv();
  return Hs = {
    // file
    createFile: e,
    createFileSync: t,
    ensureFile: e,
    ensureFileSync: t,
    // link
    createLink: a,
    createLinkSync: n,
    ensureLink: a,
    ensureLinkSync: n,
    // symlink
    createSymlink: l,
    createSymlinkSync: r,
    ensureSymlink: l,
    ensureSymlinkSync: r
  }, Hs;
}
var zs, uf;
function Wu() {
  if (uf) return zs;
  uf = 1;
  function e(a, { EOL: n = `
`, finalEOL: l = !0, replacer: r = null, spaces: i } = {}) {
    const u = l ? n : "";
    return JSON.stringify(a, r, i).replace(/\n/g, n) + u;
  }
  function t(a) {
    return Buffer.isBuffer(a) && (a = a.toString("utf8")), a.replace(/^\uFEFF/, "");
  }
  return zs = { stringify: e, stripBom: t }, zs;
}
var Ks, lf;
function Zv() {
  if (lf) return Ks;
  lf = 1;
  let e;
  try {
    e = gt();
  } catch {
    e = At;
  }
  const t = wt(), { stringify: a, stripBom: n } = Wu();
  async function l(s, d = {}) {
    typeof d == "string" && (d = { encoding: d });
    const f = d.fs || e, m = "throws" in d ? d.throws : !0;
    let y = await t.fromCallback(f.readFile)(s, d);
    y = n(y);
    let v;
    try {
      v = JSON.parse(y, d ? d.reviver : null);
    } catch (h) {
      if (m)
        throw h.message = `${s}: ${h.message}`, h;
      return null;
    }
    return v;
  }
  const r = t.fromPromise(l);
  function i(s, d = {}) {
    typeof d == "string" && (d = { encoding: d });
    const f = d.fs || e, m = "throws" in d ? d.throws : !0;
    try {
      let y = f.readFileSync(s, d);
      return y = n(y), JSON.parse(y, d.reviver);
    } catch (y) {
      if (m)
        throw y.message = `${s}: ${y.message}`, y;
      return null;
    }
  }
  async function u(s, d, f = {}) {
    const m = f.fs || e, y = a(d, f);
    await t.fromCallback(m.writeFile)(s, y, f);
  }
  const o = t.fromPromise(u);
  function c(s, d, f = {}) {
    const m = f.fs || e, y = a(d, f);
    return m.writeFileSync(s, y, f);
  }
  return Ks = {
    readFile: r,
    readFileSync: i,
    writeFile: o,
    writeFileSync: c
  }, Ks;
}
var Xs, ff;
function e_() {
  if (ff) return Xs;
  ff = 1;
  const e = Zv();
  return Xs = {
    // jsonfile exports
    readJson: e.readFile,
    readJsonSync: e.readFileSync,
    writeJson: e.writeFile,
    writeJsonSync: e.writeFileSync
  }, Xs;
}
var Ws, df;
function Yu() {
  if (df) return Ws;
  df = 1;
  const e = wt().fromCallback, t = gt(), a = Ge, n = /* @__PURE__ */ Mt(), l = Cr().pathExists;
  function r(u, o, c, s) {
    typeof c == "function" && (s = c, c = "utf8");
    const d = a.dirname(u);
    l(d, (f, m) => {
      if (f) return s(f);
      if (m) return t.writeFile(u, o, c, s);
      n.mkdirs(d, (y) => {
        if (y) return s(y);
        t.writeFile(u, o, c, s);
      });
    });
  }
  function i(u, ...o) {
    const c = a.dirname(u);
    if (t.existsSync(c))
      return t.writeFileSync(u, ...o);
    n.mkdirsSync(c), t.writeFileSync(u, ...o);
  }
  return Ws = {
    outputFile: e(r),
    outputFileSync: i
  }, Ws;
}
var Ys, hf;
function t_() {
  if (hf) return Ys;
  hf = 1;
  const { stringify: e } = Wu(), { outputFile: t } = /* @__PURE__ */ Yu();
  async function a(n, l, r = {}) {
    const i = e(l, r);
    await t(n, i, r);
  }
  return Ys = a, Ys;
}
var Js, pf;
function r_() {
  if (pf) return Js;
  pf = 1;
  const { stringify: e } = Wu(), { outputFileSync: t } = /* @__PURE__ */ Yu();
  function a(n, l, r) {
    const i = e(l, r);
    t(n, i, r);
  }
  return Js = a, Js;
}
var Qs, mf;
function n_() {
  if (mf) return Qs;
  mf = 1;
  const e = wt().fromPromise, t = /* @__PURE__ */ e_();
  return t.outputJson = e(/* @__PURE__ */ t_()), t.outputJsonSync = /* @__PURE__ */ r_(), t.outputJSON = t.outputJson, t.outputJSONSync = t.outputJsonSync, t.writeJSON = t.writeJson, t.writeJSONSync = t.writeJsonSync, t.readJSON = t.readJson, t.readJSONSync = t.readJsonSync, Qs = t, Qs;
}
var Zs, gf;
function i_() {
  if (gf) return Zs;
  gf = 1;
  const e = gt(), t = Ge, a = Xu().copy, n = es().remove, l = Mt().mkdirp, r = Cr().pathExists, i = /* @__PURE__ */ Qr();
  function u(f, m, y, v) {
    typeof y == "function" && (v = y, y = {}), y = y || {};
    const h = y.overwrite || y.clobber || !1;
    i.checkPaths(f, m, "move", y, (g, p) => {
      if (g) return v(g);
      const { srcStat: E, isChangingCase: b = !1 } = p;
      i.checkParentPaths(f, E, m, "move", ($) => {
        if ($) return v($);
        if (o(m)) return c(f, m, h, b, v);
        l(t.dirname(m), (_) => _ ? v(_) : c(f, m, h, b, v));
      });
    });
  }
  function o(f) {
    const m = t.dirname(f);
    return t.parse(m).root === m;
  }
  function c(f, m, y, v, h) {
    if (v) return s(f, m, y, h);
    if (y)
      return n(m, (g) => g ? h(g) : s(f, m, y, h));
    r(m, (g, p) => g ? h(g) : p ? h(new Error("dest already exists.")) : s(f, m, y, h));
  }
  function s(f, m, y, v) {
    e.rename(f, m, (h) => h ? h.code !== "EXDEV" ? v(h) : d(f, m, y, v) : v());
  }
  function d(f, m, y, v) {
    a(f, m, {
      overwrite: y,
      errorOnExist: !0
    }, (g) => g ? v(g) : n(f, v));
  }
  return Zs = u, Zs;
}
var eo, yf;
function a_() {
  if (yf) return eo;
  yf = 1;
  const e = gt(), t = Ge, a = Xu().copySync, n = es().removeSync, l = Mt().mkdirpSync, r = /* @__PURE__ */ Qr();
  function i(d, f, m) {
    m = m || {};
    const y = m.overwrite || m.clobber || !1, { srcStat: v, isChangingCase: h = !1 } = r.checkPathsSync(d, f, "move", m);
    return r.checkParentPathsSync(d, v, f, "move"), u(f) || l(t.dirname(f)), o(d, f, y, h);
  }
  function u(d) {
    const f = t.dirname(d);
    return t.parse(f).root === f;
  }
  function o(d, f, m, y) {
    if (y) return c(d, f, m);
    if (m)
      return n(f), c(d, f, m);
    if (e.existsSync(f)) throw new Error("dest already exists.");
    return c(d, f, m);
  }
  function c(d, f, m) {
    try {
      e.renameSync(d, f);
    } catch (y) {
      if (y.code !== "EXDEV") throw y;
      return s(d, f, m);
    }
  }
  function s(d, f, m) {
    return a(d, f, {
      overwrite: m,
      errorOnExist: !0
    }), n(d);
  }
  return eo = i, eo;
}
var to, vf;
function s_() {
  if (vf) return to;
  vf = 1;
  const e = wt().fromCallback;
  return to = {
    move: e(/* @__PURE__ */ i_()),
    moveSync: /* @__PURE__ */ a_()
  }, to;
}
var ro, _f;
function fr() {
  return _f || (_f = 1, ro = {
    // Export promiseified graceful-fs:
    .../* @__PURE__ */ Jr(),
    // Export extra methods:
    .../* @__PURE__ */ Xu(),
    .../* @__PURE__ */ zv(),
    .../* @__PURE__ */ Qv(),
    .../* @__PURE__ */ n_(),
    .../* @__PURE__ */ Mt(),
    .../* @__PURE__ */ s_(),
    .../* @__PURE__ */ Yu(),
    .../* @__PURE__ */ Cr(),
    .../* @__PURE__ */ es()
  }), ro;
}
var an = {}, Er = {}, no = {}, wr = {}, Ef;
function Ju() {
  if (Ef) return wr;
  Ef = 1, Object.defineProperty(wr, "__esModule", { value: !0 }), wr.CancellationError = wr.CancellationToken = void 0;
  const e = Py;
  let t = class extends e.EventEmitter {
    get cancelled() {
      return this._cancelled || this._parent != null && this._parent.cancelled;
    }
    set parent(l) {
      this.removeParentCancelHandler(), this._parent = l, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
    }
    // babel cannot compile ... correctly for super calls
    constructor(l) {
      super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, l != null && (this.parent = l);
    }
    cancel() {
      this._cancelled = !0, this.emit("cancel");
    }
    onCancel(l) {
      this.cancelled ? l() : this.once("cancel", l);
    }
    createPromise(l) {
      if (this.cancelled)
        return Promise.reject(new a());
      const r = () => {
        if (i != null)
          try {
            this.removeListener("cancel", i), i = null;
          } catch {
          }
      };
      let i = null;
      return new Promise((u, o) => {
        let c = null;
        if (i = () => {
          try {
            c != null && (c(), c = null);
          } finally {
            o(new a());
          }
        }, this.cancelled) {
          i();
          return;
        }
        this.onCancel(i), l(u, o, (s) => {
          c = s;
        });
      }).then((u) => (r(), u)).catch((u) => {
        throw r(), u;
      });
    }
    removeParentCancelHandler() {
      const l = this._parent;
      l != null && this.parentCancelHandler != null && (l.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
    }
    dispose() {
      try {
        this.removeParentCancelHandler();
      } finally {
        this.removeAllListeners(), this._parent = null;
      }
    }
  };
  wr.CancellationToken = t;
  class a extends Error {
    constructor() {
      super("cancelled");
    }
  }
  return wr.CancellationError = a, wr;
}
var Xn = {}, wf;
function ts() {
  if (wf) return Xn;
  wf = 1, Object.defineProperty(Xn, "__esModule", { value: !0 }), Xn.newError = e;
  function e(t, a) {
    const n = new Error(t);
    return n.code = a, n;
  }
  return Xn;
}
var at = {}, Wn = { exports: {} }, Yn = { exports: {} }, io, $f;
function o_() {
  if ($f) return io;
  $f = 1;
  var e = 1e3, t = e * 60, a = t * 60, n = a * 24, l = n * 7, r = n * 365.25;
  io = function(s, d) {
    d = d || {};
    var f = typeof s;
    if (f === "string" && s.length > 0)
      return i(s);
    if (f === "number" && isFinite(s))
      return d.long ? o(s) : u(s);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(s)
    );
  };
  function i(s) {
    if (s = String(s), !(s.length > 100)) {
      var d = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        s
      );
      if (d) {
        var f = parseFloat(d[1]), m = (d[2] || "ms").toLowerCase();
        switch (m) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return f * r;
          case "weeks":
          case "week":
          case "w":
            return f * l;
          case "days":
          case "day":
          case "d":
            return f * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return f * a;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return f * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return f * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return f;
          default:
            return;
        }
      }
    }
  }
  function u(s) {
    var d = Math.abs(s);
    return d >= n ? Math.round(s / n) + "d" : d >= a ? Math.round(s / a) + "h" : d >= t ? Math.round(s / t) + "m" : d >= e ? Math.round(s / e) + "s" : s + "ms";
  }
  function o(s) {
    var d = Math.abs(s);
    return d >= n ? c(s, d, n, "day") : d >= a ? c(s, d, a, "hour") : d >= t ? c(s, d, t, "minute") : d >= e ? c(s, d, e, "second") : s + " ms";
  }
  function c(s, d, f, m) {
    var y = d >= f * 1.5;
    return Math.round(s / f) + " " + m + (y ? "s" : "");
  }
  return io;
}
var ao, Sf;
function Dy() {
  if (Sf) return ao;
  Sf = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = c, n.disable = u, n.enable = r, n.enabled = o, n.humanize = o_(), n.destroy = s, Object.keys(t).forEach((d) => {
      n[d] = t[d];
    }), n.names = [], n.skips = [], n.formatters = {};
    function a(d) {
      let f = 0;
      for (let m = 0; m < d.length; m++)
        f = (f << 5) - f + d.charCodeAt(m), f |= 0;
      return n.colors[Math.abs(f) % n.colors.length];
    }
    n.selectColor = a;
    function n(d) {
      let f, m = null, y, v;
      function h(...g) {
        if (!h.enabled)
          return;
        const p = h, E = Number(/* @__PURE__ */ new Date()), b = E - (f || E);
        p.diff = b, p.prev = f, p.curr = E, f = E, g[0] = n.coerce(g[0]), typeof g[0] != "string" && g.unshift("%O");
        let $ = 0;
        g[0] = g[0].replace(/%([a-zA-Z%])/g, (w, T) => {
          if (w === "%%")
            return "%";
          $++;
          const P = n.formatters[T];
          if (typeof P == "function") {
            const G = g[$];
            w = P.call(p, G), g.splice($, 1), $--;
          }
          return w;
        }), n.formatArgs.call(p, g), (p.log || n.log).apply(p, g);
      }
      return h.namespace = d, h.useColors = n.useColors(), h.color = n.selectColor(d), h.extend = l, h.destroy = n.destroy, Object.defineProperty(h, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => m !== null ? m : (y !== n.namespaces && (y = n.namespaces, v = n.enabled(d)), v),
        set: (g) => {
          m = g;
        }
      }), typeof n.init == "function" && n.init(h), h;
    }
    function l(d, f) {
      const m = n(this.namespace + (typeof f > "u" ? ":" : f) + d);
      return m.log = this.log, m;
    }
    function r(d) {
      n.save(d), n.namespaces = d, n.names = [], n.skips = [];
      const f = (typeof d == "string" ? d : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const m of f)
        m[0] === "-" ? n.skips.push(m.slice(1)) : n.names.push(m);
    }
    function i(d, f) {
      let m = 0, y = 0, v = -1, h = 0;
      for (; m < d.length; )
        if (y < f.length && (f[y] === d[m] || f[y] === "*"))
          f[y] === "*" ? (v = y, h = m, y++) : (m++, y++);
        else if (v !== -1)
          y = v + 1, h++, m = h;
        else
          return !1;
      for (; y < f.length && f[y] === "*"; )
        y++;
      return y === f.length;
    }
    function u() {
      const d = [
        ...n.names,
        ...n.skips.map((f) => "-" + f)
      ].join(",");
      return n.enable(""), d;
    }
    function o(d) {
      for (const f of n.skips)
        if (i(d, f))
          return !1;
      for (const f of n.names)
        if (i(d, f))
          return !0;
      return !1;
    }
    function c(d) {
      return d instanceof Error ? d.stack || d.message : d;
    }
    function s() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return ao = e, ao;
}
var bf;
function c_() {
  return bf || (bf = 1, (function(e, t) {
    t.formatArgs = n, t.save = l, t.load = r, t.useColors = a, t.storage = i(), t.destroy = /* @__PURE__ */ (() => {
      let o = !1;
      return () => {
        o || (o = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function a() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let o;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (o = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(o[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(o) {
      if (o[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + o[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const c = "color: " + this.color;
      o.splice(1, 0, c, "color: inherit");
      let s = 0, d = 0;
      o[0].replace(/%[a-zA-Z%]/g, (f) => {
        f !== "%%" && (s++, f === "%c" && (d = s));
      }), o.splice(d, 0, c);
    }
    t.log = console.debug || console.log || (() => {
    });
    function l(o) {
      try {
        o ? t.storage.setItem("debug", o) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function r() {
      let o;
      try {
        o = t.storage.getItem("debug") || t.storage.getItem("DEBUG");
      } catch {
      }
      return !o && typeof process < "u" && "env" in process && (o = process.env.DEBUG), o;
    }
    function i() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = Dy()(t);
    const { formatters: u } = e.exports;
    u.j = function(o) {
      try {
        return JSON.stringify(o);
      } catch (c) {
        return "[UnexpectedJSONParseError]: " + c.message;
      }
    };
  })(Yn, Yn.exports)), Yn.exports;
}
var Jn = { exports: {} }, so, Rf;
function u_() {
  return Rf || (Rf = 1, so = (e, t = process.argv) => {
    const a = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(a + e), l = t.indexOf("--");
    return n !== -1 && (l === -1 || n < l);
  }), so;
}
var oo, Tf;
function l_() {
  if (Tf) return oo;
  Tf = 1;
  const e = Za, t = Ny, a = u_(), { env: n } = process;
  let l;
  a("no-color") || a("no-colors") || a("color=false") || a("color=never") ? l = 0 : (a("color") || a("colors") || a("color=true") || a("color=always")) && (l = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? l = 1 : n.FORCE_COLOR === "false" ? l = 0 : l = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function r(o) {
    return o === 0 ? !1 : {
      level: o,
      hasBasic: !0,
      has256: o >= 2,
      has16m: o >= 3
    };
  }
  function i(o, c) {
    if (l === 0)
      return 0;
    if (a("color=16m") || a("color=full") || a("color=truecolor"))
      return 3;
    if (a("color=256"))
      return 2;
    if (o && !c && l === void 0)
      return 0;
    const s = l || 0;
    if (n.TERM === "dumb")
      return s;
    if (process.platform === "win32") {
      const d = e.release().split(".");
      return Number(d[0]) >= 10 && Number(d[2]) >= 10586 ? Number(d[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((d) => d in n) || n.CI_NAME === "codeship" ? 1 : s;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const d = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return d >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : s;
  }
  function u(o) {
    const c = i(o, o && o.isTTY);
    return r(c);
  }
  return oo = {
    supportsColor: u,
    stdout: r(i(!0, t.isatty(1))),
    stderr: r(i(!0, t.isatty(2)))
  }, oo;
}
var Pf;
function f_() {
  return Pf || (Pf = 1, (function(e, t) {
    const a = Ny, n = Ku;
    t.init = s, t.log = u, t.formatArgs = r, t.save = o, t.load = c, t.useColors = l, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const f = l_();
      f && (f.stderr || f).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((f) => /^debug_/i.test(f)).reduce((f, m) => {
      const y = m.substring(6).toLowerCase().replace(/_([a-z])/g, (h, g) => g.toUpperCase());
      let v = process.env[m];
      return /^(yes|on|true|enabled)$/i.test(v) ? v = !0 : /^(no|off|false|disabled)$/i.test(v) ? v = !1 : v === "null" ? v = null : v = Number(v), f[y] = v, f;
    }, {});
    function l() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : a.isatty(process.stderr.fd);
    }
    function r(f) {
      const { namespace: m, useColors: y } = this;
      if (y) {
        const v = this.color, h = "\x1B[3" + (v < 8 ? v : "8;5;" + v), g = `  ${h};1m${m} \x1B[0m`;
        f[0] = g + f[0].split(`
`).join(`
` + g), f.push(h + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        f[0] = i() + m + " " + f[0];
    }
    function i() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function u(...f) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...f) + `
`);
    }
    function o(f) {
      f ? process.env.DEBUG = f : delete process.env.DEBUG;
    }
    function c() {
      return process.env.DEBUG;
    }
    function s(f) {
      f.inspectOpts = {};
      const m = Object.keys(t.inspectOpts);
      for (let y = 0; y < m.length; y++)
        f.inspectOpts[m[y]] = t.inspectOpts[m[y]];
    }
    e.exports = Dy()(t);
    const { formatters: d } = e.exports;
    d.o = function(f) {
      return this.inspectOpts.colors = this.useColors, n.inspect(f, this.inspectOpts).split(`
`).map((m) => m.trim()).join(" ");
    }, d.O = function(f) {
      return this.inspectOpts.colors = this.useColors, n.inspect(f, this.inspectOpts);
    };
  })(Jn, Jn.exports)), Jn.exports;
}
var Nf;
function d_() {
  return Nf || (Nf = 1, typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? Wn.exports = c_() : Wn.exports = f_()), Wn.exports;
}
var sn = {}, If;
function ky() {
  if (If) return sn;
  If = 1, Object.defineProperty(sn, "__esModule", { value: !0 }), sn.ProgressCallbackTransform = void 0;
  const e = Dn;
  let t = class extends e.Transform {
    constructor(n, l, r) {
      super(), this.total = n, this.cancellationToken = l, this.onProgress = r, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
    }
    _transform(n, l, r) {
      if (this.cancellationToken.cancelled) {
        r(new Error("cancelled"), null);
        return;
      }
      this.transferred += n.length, this.delta += n.length;
      const i = Date.now();
      i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.total * 100,
        bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
      }), this.delta = 0), r(null, n);
    }
    _flush(n) {
      if (this.cancellationToken.cancelled) {
        n(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.total,
        delta: this.delta,
        transferred: this.total,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, n(null);
    }
  };
  return sn.ProgressCallbackTransform = t, sn;
}
var Of;
function h_() {
  if (Of) return at;
  Of = 1, Object.defineProperty(at, "__esModule", { value: !0 }), at.DigestTransform = at.HttpExecutor = at.HttpError = void 0, at.createHttpError = c, at.parseJson = f, at.configureRequestOptionsFromUrl = y, at.configureRequestUrl = v, at.safeGetHeader = p, at.configureRequestOptions = b, at.safeStringifyJson = $;
  const e = kn, t = d_(), a = At, n = Dn, l = Yr, r = Ju(), i = ts(), u = ky(), o = (0, t.default)("electron-builder");
  function c(_, w = null) {
    return new d(_.statusCode || -1, `${_.statusCode} ${_.statusMessage}` + (w == null ? "" : `
` + JSON.stringify(w, null, "  ")) + `
Headers: ` + $(_.headers), w);
  }
  const s = /* @__PURE__ */ new Map([
    [429, "Too many requests"],
    [400, "Bad request"],
    [403, "Forbidden"],
    [404, "Not found"],
    [405, "Method not allowed"],
    [406, "Not acceptable"],
    [408, "Request timeout"],
    [413, "Request entity too large"],
    [500, "Internal server error"],
    [502, "Bad gateway"],
    [503, "Service unavailable"],
    [504, "Gateway timeout"],
    [505, "HTTP version not supported"]
  ]);
  class d extends Error {
    constructor(w, T = `HTTP error: ${s.get(w) || w}`, P = null) {
      super(T), this.statusCode = w, this.description = P, this.name = "HttpError", this.code = `HTTP_ERROR_${w}`;
    }
    isServerError() {
      return this.statusCode >= 500 && this.statusCode <= 599;
    }
  }
  at.HttpError = d;
  function f(_) {
    return _.then((w) => w == null || w.length === 0 ? null : JSON.parse(w));
  }
  class m {
    constructor() {
      this.maxRedirects = 10;
    }
    request(w, T = new r.CancellationToken(), P) {
      b(w);
      const G = P == null ? void 0 : JSON.stringify(P), q = G ? Buffer.from(G) : void 0;
      if (q != null) {
        o(G);
        const { headers: M, ...K } = w;
        w = {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": q.length,
            ...M
          },
          ...K
        };
      }
      return this.doApiRequest(w, T, (M) => M.end(q));
    }
    doApiRequest(w, T, P, G = 0) {
      return o.enabled && o(`Request: ${$(w)}`), T.createPromise((q, M, K) => {
        const k = this.createRequest(w, (F) => {
          try {
            this.handleResponse(F, w, T, q, M, G, P);
          } catch (Y) {
            M(Y);
          }
        });
        this.addErrorAndTimeoutHandlers(k, M, w.timeout), this.addRedirectHandlers(k, w, M, G, (F) => {
          this.doApiRequest(F, T, P, G).then(q).catch(M);
        }), P(k, M), K(() => k.abort());
      });
    }
    // noinspection JSUnusedLocalSymbols
    // eslint-disable-next-line
    addRedirectHandlers(w, T, P, G, q) {
    }
    addErrorAndTimeoutHandlers(w, T, P = 60 * 1e3) {
      this.addTimeOutHandler(w, T, P), w.on("error", T), w.on("aborted", () => {
        T(new Error("Request has been aborted by the server"));
      });
    }
    handleResponse(w, T, P, G, q, M, K) {
      var k;
      if (o.enabled && o(`Response: ${w.statusCode} ${w.statusMessage}, request options: ${$(T)}`), w.statusCode === 404) {
        q(c(w, `method: ${T.method || "GET"} url: ${T.protocol || "https:"}//${T.hostname}${T.port ? `:${T.port}` : ""}${T.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
        return;
      } else if (w.statusCode === 204) {
        G();
        return;
      }
      const F = (k = w.statusCode) !== null && k !== void 0 ? k : 0, Y = F >= 300 && F < 400, B = p(w, "location");
      if (Y && B != null) {
        if (M > this.maxRedirects) {
          q(this.createMaxRedirectError());
          return;
        }
        this.doApiRequest(m.prepareRedirectUrlOptions(B, T), P, K, M).then(G).catch(q);
        return;
      }
      w.setEncoding("utf8");
      let W = "";
      w.on("error", q), w.on("data", (Z) => W += Z), w.on("end", () => {
        try {
          if (w.statusCode != null && w.statusCode >= 400) {
            const Z = p(w, "content-type"), V = Z != null && (Array.isArray(Z) ? Z.find((C) => C.includes("json")) != null : Z.includes("json"));
            q(c(w, `method: ${T.method || "GET"} url: ${T.protocol || "https:"}//${T.hostname}${T.port ? `:${T.port}` : ""}${T.path}

          Data:
          ${V ? JSON.stringify(JSON.parse(W)) : W}
          `));
          } else
            G(W.length === 0 ? null : W);
        } catch (Z) {
          q(Z);
        }
      });
    }
    async downloadToBuffer(w, T) {
      return await T.cancellationToken.createPromise((P, G, q) => {
        const M = [], K = {
          headers: T.headers || void 0,
          // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
          redirect: "manual"
        };
        v(w, K), b(K), this.doDownload(K, {
          destination: null,
          options: T,
          onCancel: q,
          callback: (k) => {
            k == null ? P(Buffer.concat(M)) : G(k);
          },
          responseHandler: (k, F) => {
            let Y = 0;
            k.on("data", (B) => {
              if (Y += B.length, Y > 524288e3) {
                F(new Error("Maximum allowed size is 500 MB"));
                return;
              }
              M.push(B);
            }), k.on("end", () => {
              F(null);
            });
          }
        }, 0);
      });
    }
    doDownload(w, T, P) {
      const G = this.createRequest(w, (q) => {
        if (q.statusCode >= 400) {
          T.callback(new Error(`Cannot download "${w.protocol || "https:"}//${w.hostname}${w.path}", status ${q.statusCode}: ${q.statusMessage}`));
          return;
        }
        q.on("error", T.callback);
        const M = p(q, "location");
        if (M != null) {
          P < this.maxRedirects ? this.doDownload(m.prepareRedirectUrlOptions(M, w), T, P++) : T.callback(this.createMaxRedirectError());
          return;
        }
        T.responseHandler == null ? E(T, q) : T.responseHandler(q, T.callback);
      });
      this.addErrorAndTimeoutHandlers(G, T.callback, w.timeout), this.addRedirectHandlers(G, w, T.callback, P, (q) => {
        this.doDownload(q, T, P++);
      }), G.end();
    }
    createMaxRedirectError() {
      return new Error(`Too many redirects (> ${this.maxRedirects})`);
    }
    addTimeOutHandler(w, T, P) {
      w.on("socket", (G) => {
        G.setTimeout(P, () => {
          w.abort(), T(new Error("Request timed out"));
        });
      });
    }
    static prepareRedirectUrlOptions(w, T) {
      const P = y(w, { ...T }), G = P.headers;
      if (G?.authorization) {
        const q = new l.URL(w);
        (q.hostname.endsWith(".amazonaws.com") || q.searchParams.has("X-Amz-Credential")) && delete G.authorization;
      }
      return P;
    }
    static retryOnServerError(w, T = 3) {
      for (let P = 0; ; P++)
        try {
          return w();
        } catch (G) {
          if (P < T && (G instanceof d && G.isServerError() || G.code === "EPIPE"))
            continue;
          throw G;
        }
    }
  }
  at.HttpExecutor = m;
  function y(_, w) {
    const T = b(w);
    return v(new l.URL(_), T), T;
  }
  function v(_, w) {
    w.protocol = _.protocol, w.hostname = _.hostname, _.port ? w.port = _.port : w.port && delete w.port, w.path = _.pathname + _.search;
  }
  class h extends n.Transform {
    // noinspection JSUnusedGlobalSymbols
    get actual() {
      return this._actual;
    }
    constructor(w, T = "sha512", P = "base64") {
      super(), this.expected = w, this.algorithm = T, this.encoding = P, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, e.createHash)(T);
    }
    // noinspection JSUnusedGlobalSymbols
    _transform(w, T, P) {
      this.digester.update(w), P(null, w);
    }
    // noinspection JSUnusedGlobalSymbols
    _flush(w) {
      if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
        try {
          this.validate();
        } catch (T) {
          w(T);
          return;
        }
      w(null);
    }
    validate() {
      if (this._actual == null)
        throw (0, i.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
      if (this._actual !== this.expected)
        throw (0, i.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
      return null;
    }
  }
  at.DigestTransform = h;
  function g(_, w, T) {
    return _ != null && w != null && _ !== w ? (T(new Error(`checksum mismatch: expected ${w} but got ${_} (X-Checksum-Sha2 header)`)), !1) : !0;
  }
  function p(_, w) {
    const T = _.headers[w];
    return T == null ? null : Array.isArray(T) ? T.length === 0 ? null : T[T.length - 1] : T;
  }
  function E(_, w) {
    if (!g(p(w, "X-Checksum-Sha2"), _.options.sha2, _.callback))
      return;
    const T = [];
    if (_.options.onProgress != null) {
      const M = p(w, "content-length");
      M != null && T.push(new u.ProgressCallbackTransform(parseInt(M, 10), _.options.cancellationToken, _.options.onProgress));
    }
    const P = _.options.sha512;
    P != null ? T.push(new h(P, "sha512", P.length === 128 && !P.includes("+") && !P.includes("Z") && !P.includes("=") ? "hex" : "base64")) : _.options.sha2 != null && T.push(new h(_.options.sha2, "sha256", "hex"));
    const G = (0, a.createWriteStream)(_.destination);
    T.push(G);
    let q = w;
    for (const M of T)
      M.on("error", (K) => {
        G.close(), _.options.cancellationToken.cancelled || _.callback(K);
      }), q = q.pipe(M);
    G.on("finish", () => {
      G.close(_.callback);
    });
  }
  function b(_, w, T) {
    T != null && (_.method = T), _.headers = { ..._.headers };
    const P = _.headers;
    return w != null && (P.authorization = w.startsWith("Basic") || w.startsWith("Bearer") ? w : `token ${w}`), P["User-Agent"] == null && (P["User-Agent"] = "electron-builder"), (T == null || T === "GET" || P["Cache-Control"] == null) && (P["Cache-Control"] = "no-cache"), _.protocol == null && process.versions.electron != null && (_.protocol = "https:"), _;
  }
  function $(_, w) {
    return JSON.stringify(_, (T, P) => T.endsWith("Authorization") || T.endsWith("authorization") || T.endsWith("Password") || T.endsWith("PASSWORD") || T.endsWith("Token") || T.includes("password") || T.includes("token") || w != null && w.has(T) ? "<stripped sensitive data>" : P, 2);
  }
  return at;
}
var on = {}, Af;
function p_() {
  if (Af) return on;
  Af = 1, Object.defineProperty(on, "__esModule", { value: !0 }), on.MemoLazy = void 0;
  let e = class {
    constructor(n, l) {
      this.selector = n, this.creator = l, this.selected = void 0, this._value = void 0;
    }
    get hasValue() {
      return this._value !== void 0;
    }
    get value() {
      const n = this.selector();
      if (this._value !== void 0 && t(this.selected, n))
        return this._value;
      this.selected = n;
      const l = this.creator(n);
      return this.value = l, l;
    }
    set value(n) {
      this._value = n;
    }
  };
  on.MemoLazy = e;
  function t(a, n) {
    if (typeof a == "object" && a !== null && (typeof n == "object" && n !== null)) {
      const i = Object.keys(a), u = Object.keys(n);
      return i.length === u.length && i.every((o) => t(a[o], n[o]));
    }
    return a === n;
  }
  return on;
}
var cn = {}, Cf;
function m_() {
  if (Cf) return cn;
  Cf = 1, Object.defineProperty(cn, "__esModule", { value: !0 }), cn.githubUrl = e, cn.getS3LikeProviderBaseUrl = t;
  function e(r, i = "github.com") {
    return `${r.protocol || "https"}://${r.host || i}`;
  }
  function t(r) {
    const i = r.provider;
    if (i === "s3")
      return a(r);
    if (i === "spaces")
      return l(r);
    throw new Error(`Not supported provider: ${i}`);
  }
  function a(r) {
    let i;
    if (r.accelerate == !0)
      i = `https://${r.bucket}.s3-accelerate.amazonaws.com`;
    else if (r.endpoint != null)
      i = `${r.endpoint}/${r.bucket}`;
    else if (r.bucket.includes(".")) {
      if (r.region == null)
        throw new Error(`Bucket name "${r.bucket}" includes a dot, but S3 region is missing`);
      r.region === "us-east-1" ? i = `https://s3.amazonaws.com/${r.bucket}` : i = `https://s3-${r.region}.amazonaws.com/${r.bucket}`;
    } else r.region === "cn-north-1" ? i = `https://${r.bucket}.s3.${r.region}.amazonaws.com.cn` : i = `https://${r.bucket}.s3.amazonaws.com`;
    return n(i, r.path);
  }
  function n(r, i) {
    return i != null && i.length > 0 && (i.startsWith("/") || (r += "/"), r += i), r;
  }
  function l(r) {
    if (r.name == null)
      throw new Error("name is missing");
    if (r.region == null)
      throw new Error("region is missing");
    return n(`https://${r.name}.${r.region}.digitaloceanspaces.com`, r.path);
  }
  return cn;
}
var Qn = {}, Df;
function g_() {
  if (Df) return Qn;
  Df = 1, Object.defineProperty(Qn, "__esModule", { value: !0 }), Qn.retry = t;
  const e = Ju();
  async function t(a, n, l, r = 0, i = 0, u) {
    var o;
    const c = new e.CancellationToken();
    try {
      return await a();
    } catch (s) {
      if ((!((o = u?.(s)) !== null && o !== void 0) || o) && n > 0 && !c.cancelled)
        return await new Promise((d) => setTimeout(d, l + r * i)), await t(a, n - 1, l, r, i + 1, u);
      throw s;
    }
  }
  return Qn;
}
var Zn = {}, kf;
function y_() {
  if (kf) return Zn;
  kf = 1, Object.defineProperty(Zn, "__esModule", { value: !0 }), Zn.parseDn = e;
  function e(t) {
    let a = !1, n = null, l = "", r = 0;
    t = t.trim();
    const i = /* @__PURE__ */ new Map();
    for (let u = 0; u <= t.length; u++) {
      if (u === t.length) {
        n !== null && i.set(n, l);
        break;
      }
      const o = t[u];
      if (a) {
        if (o === '"') {
          a = !1;
          continue;
        }
      } else {
        if (o === '"') {
          a = !0;
          continue;
        }
        if (o === "\\") {
          u++;
          const c = parseInt(t.slice(u, u + 2), 16);
          Number.isNaN(c) ? l += t[u] : (u++, l += String.fromCharCode(c));
          continue;
        }
        if (n === null && o === "=") {
          n = l, l = "";
          continue;
        }
        if (o === "," || o === ";" || o === "+") {
          n !== null && i.set(n, l), n = null, l = "";
          continue;
        }
      }
      if (o === " " && !a) {
        if (l.length === 0)
          continue;
        if (u > r) {
          let c = u;
          for (; t[c] === " "; )
            c++;
          r = c;
        }
        if (r >= t.length || t[r] === "," || t[r] === ";" || n === null && t[r] === "=" || n !== null && t[r] === "+") {
          u = r - 1;
          continue;
        }
      }
      l += o;
    }
    return i;
  }
  return Zn;
}
var $r = {}, Lf;
function v_() {
  if (Lf) return $r;
  Lf = 1, Object.defineProperty($r, "__esModule", { value: !0 }), $r.nil = $r.UUID = void 0;
  const e = kn, t = ts(), a = "options.name must be either a string or a Buffer", n = (0, e.randomBytes)(16);
  n[0] = n[0] | 1;
  const l = {}, r = [];
  for (let d = 0; d < 256; d++) {
    const f = (d + 256).toString(16).substr(1);
    l[f] = d, r[d] = f;
  }
  class i {
    constructor(f) {
      this.ascii = null, this.binary = null;
      const m = i.check(f);
      if (!m)
        throw new Error("not a UUID");
      this.version = m.version, m.format === "ascii" ? this.ascii = f : this.binary = f;
    }
    static v5(f, m) {
      return c(f, "sha1", 80, m);
    }
    toString() {
      return this.ascii == null && (this.ascii = s(this.binary)), this.ascii;
    }
    inspect() {
      return `UUID v${this.version} ${this.toString()}`;
    }
    static check(f, m = 0) {
      if (typeof f == "string")
        return f = f.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(f) ? f === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
          version: (l[f[14] + f[15]] & 240) >> 4,
          variant: u((l[f[19] + f[20]] & 224) >> 5),
          format: "ascii"
        } : !1;
      if (Buffer.isBuffer(f)) {
        if (f.length < m + 16)
          return !1;
        let y = 0;
        for (; y < 16 && f[m + y] === 0; y++)
          ;
        return y === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
          version: (f[m + 6] & 240) >> 4,
          variant: u((f[m + 8] & 224) >> 5),
          format: "binary"
        };
      }
      throw (0, t.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
    }
    // read stringified uuid into a Buffer
    static parse(f) {
      const m = Buffer.allocUnsafe(16);
      let y = 0;
      for (let v = 0; v < 16; v++)
        m[v] = l[f[y++] + f[y++]], (v === 3 || v === 5 || v === 7 || v === 9) && (y += 1);
      return m;
    }
  }
  $r.UUID = i, i.OID = i.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
  function u(d) {
    switch (d) {
      case 0:
      case 1:
      case 3:
        return "ncs";
      case 4:
      case 5:
        return "rfc4122";
      case 6:
        return "microsoft";
      default:
        return "future";
    }
  }
  var o;
  (function(d) {
    d[d.ASCII = 0] = "ASCII", d[d.BINARY = 1] = "BINARY", d[d.OBJECT = 2] = "OBJECT";
  })(o || (o = {}));
  function c(d, f, m, y, v = o.ASCII) {
    const h = (0, e.createHash)(f);
    if (typeof d != "string" && !Buffer.isBuffer(d))
      throw (0, t.newError)(a, "ERR_INVALID_UUID_NAME");
    h.update(y), h.update(d);
    const p = h.digest();
    let E;
    switch (v) {
      case o.BINARY:
        p[6] = p[6] & 15 | m, p[8] = p[8] & 63 | 128, E = p;
        break;
      case o.OBJECT:
        p[6] = p[6] & 15 | m, p[8] = p[8] & 63 | 128, E = new i(p);
        break;
      default:
        E = r[p[0]] + r[p[1]] + r[p[2]] + r[p[3]] + "-" + r[p[4]] + r[p[5]] + "-" + r[p[6] & 15 | m] + r[p[7]] + "-" + r[p[8] & 63 | 128] + r[p[9]] + "-" + r[p[10]] + r[p[11]] + r[p[12]] + r[p[13]] + r[p[14]] + r[p[15]];
        break;
    }
    return E;
  }
  function s(d) {
    return r[d[0]] + r[d[1]] + r[d[2]] + r[d[3]] + "-" + r[d[4]] + r[d[5]] + "-" + r[d[6]] + r[d[7]] + "-" + r[d[8]] + r[d[9]] + "-" + r[d[10]] + r[d[11]] + r[d[12]] + r[d[13]] + r[d[14]] + r[d[15]];
  }
  return $r.nil = new i("00000000-0000-0000-0000-000000000000"), $r;
}
var Fr = {}, co = {}, qf;
function __() {
  return qf || (qf = 1, (function(e) {
    (function(t) {
      t.parser = function(O, I) {
        return new n(O, I);
      }, t.SAXParser = n, t.SAXStream = s, t.createStream = c, t.MAX_BUFFER_LENGTH = 64 * 1024;
      var a = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      t.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function n(O, I) {
        if (!(this instanceof n))
          return new n(O, I);
        var Q = this;
        r(Q), Q.q = Q.c = "", Q.bufferCheckPosition = t.MAX_BUFFER_LENGTH, Q.opt = I || {}, Q.opt.lowercase = Q.opt.lowercase || Q.opt.lowercasetags, Q.looseCase = Q.opt.lowercase ? "toLowerCase" : "toUpperCase", Q.tags = [], Q.closed = Q.closedRoot = Q.sawRoot = !1, Q.tag = Q.error = null, Q.strict = !!O, Q.noscript = !!(O || Q.opt.noscript), Q.state = P.BEGIN, Q.strictEntities = Q.opt.strictEntities, Q.ENTITIES = Q.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), Q.attribList = [], Q.opt.xmlns && (Q.ns = Object.create(v)), Q.opt.unquotedAttributeValues === void 0 && (Q.opt.unquotedAttributeValues = !O), Q.trackPosition = Q.opt.position !== !1, Q.trackPosition && (Q.position = Q.line = Q.column = 0), q(Q, "onready");
      }
      Object.create || (Object.create = function(O) {
        function I() {
        }
        I.prototype = O;
        var Q = new I();
        return Q;
      }), Object.keys || (Object.keys = function(O) {
        var I = [];
        for (var Q in O) O.hasOwnProperty(Q) && I.push(Q);
        return I;
      });
      function l(O) {
        for (var I = Math.max(t.MAX_BUFFER_LENGTH, 10), Q = 0, H = 0, A = a.length; H < A; H++) {
          var L = O[a[H]].length;
          if (L > I)
            switch (a[H]) {
              case "textNode":
                K(O);
                break;
              case "cdata":
                M(O, "oncdata", O.cdata), O.cdata = "";
                break;
              case "script":
                M(O, "onscript", O.script), O.script = "";
                break;
              default:
                F(O, "Max buffer length exceeded: " + a[H]);
            }
          Q = Math.max(Q, L);
        }
        var X = t.MAX_BUFFER_LENGTH - Q;
        O.bufferCheckPosition = X + O.position;
      }
      function r(O) {
        for (var I = 0, Q = a.length; I < Q; I++)
          O[a[I]] = "";
      }
      function i(O) {
        K(O), O.cdata !== "" && (M(O, "oncdata", O.cdata), O.cdata = ""), O.script !== "" && (M(O, "onscript", O.script), O.script = "");
      }
      n.prototype = {
        end: function() {
          Y(this);
        },
        write: x,
        resume: function() {
          return this.error = null, this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          i(this);
        }
      };
      var u;
      try {
        u = require("stream").Stream;
      } catch {
        u = function() {
        };
      }
      u || (u = function() {
      });
      var o = t.EVENTS.filter(function(O) {
        return O !== "error" && O !== "end";
      });
      function c(O, I) {
        return new s(O, I);
      }
      function s(O, I) {
        if (!(this instanceof s))
          return new s(O, I);
        u.apply(this), this._parser = new n(O, I), this.writable = !0, this.readable = !0;
        var Q = this;
        this._parser.onend = function() {
          Q.emit("end");
        }, this._parser.onerror = function(H) {
          Q.emit("error", H), Q._parser.error = null;
        }, this._decoder = null, o.forEach(function(H) {
          Object.defineProperty(Q, "on" + H, {
            get: function() {
              return Q._parser["on" + H];
            },
            set: function(A) {
              if (!A)
                return Q.removeAllListeners(H), Q._parser["on" + H] = A, A;
              Q.on(H, A);
            },
            enumerable: !0,
            configurable: !1
          });
        });
      }
      s.prototype = Object.create(u.prototype, {
        constructor: {
          value: s
        }
      }), s.prototype.write = function(O) {
        if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(O)) {
          if (!this._decoder) {
            var I = qv.StringDecoder;
            this._decoder = new I("utf8");
          }
          O = this._decoder.write(O);
        }
        return this._parser.write(O.toString()), this.emit("data", O), !0;
      }, s.prototype.end = function(O) {
        return O && O.length && this.write(O), this._parser.end(), !0;
      }, s.prototype.on = function(O, I) {
        var Q = this;
        return !Q._parser["on" + O] && o.indexOf(O) !== -1 && (Q._parser["on" + O] = function() {
          var H = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
          H.splice(0, 0, O), Q.emit.apply(Q, H);
        }), u.prototype.on.call(Q, O, I);
      };
      var d = "[CDATA[", f = "DOCTYPE", m = "http://www.w3.org/XML/1998/namespace", y = "http://www.w3.org/2000/xmlns/", v = { xml: m, xmlns: y }, h = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, g = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, p = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, E = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function b(O) {
        return O === " " || O === `
` || O === "\r" || O === "	";
      }
      function $(O) {
        return O === '"' || O === "'";
      }
      function _(O) {
        return O === ">" || b(O);
      }
      function w(O, I) {
        return O.test(I);
      }
      function T(O, I) {
        return !w(O, I);
      }
      var P = 0;
      t.STATE = {
        BEGIN: P++,
        // leading byte order mark or whitespace
        BEGIN_WHITESPACE: P++,
        // leading whitespace
        TEXT: P++,
        // general stuff
        TEXT_ENTITY: P++,
        // &amp and such.
        OPEN_WAKA: P++,
        // <
        SGML_DECL: P++,
        // <!BLARG
        SGML_DECL_QUOTED: P++,
        // <!BLARG foo "bar
        DOCTYPE: P++,
        // <!DOCTYPE
        DOCTYPE_QUOTED: P++,
        // <!DOCTYPE "//blah
        DOCTYPE_DTD: P++,
        // <!DOCTYPE "//blah" [ ...
        DOCTYPE_DTD_QUOTED: P++,
        // <!DOCTYPE "//blah" [ "foo
        COMMENT_STARTING: P++,
        // <!-
        COMMENT: P++,
        // <!--
        COMMENT_ENDING: P++,
        // <!-- blah -
        COMMENT_ENDED: P++,
        // <!-- blah --
        CDATA: P++,
        // <![CDATA[ something
        CDATA_ENDING: P++,
        // ]
        CDATA_ENDING_2: P++,
        // ]]
        PROC_INST: P++,
        // <?hi
        PROC_INST_BODY: P++,
        // <?hi there
        PROC_INST_ENDING: P++,
        // <?hi "there" ?
        OPEN_TAG: P++,
        // <strong
        OPEN_TAG_SLASH: P++,
        // <strong /
        ATTRIB: P++,
        // <a
        ATTRIB_NAME: P++,
        // <a foo
        ATTRIB_NAME_SAW_WHITE: P++,
        // <a foo _
        ATTRIB_VALUE: P++,
        // <a foo=
        ATTRIB_VALUE_QUOTED: P++,
        // <a foo="bar
        ATTRIB_VALUE_CLOSED: P++,
        // <a foo="bar"
        ATTRIB_VALUE_UNQUOTED: P++,
        // <a foo=bar
        ATTRIB_VALUE_ENTITY_Q: P++,
        // <foo bar="&quot;"
        ATTRIB_VALUE_ENTITY_U: P++,
        // <foo bar=&quot
        CLOSE_TAG: P++,
        // </a
        CLOSE_TAG_SAW_WHITE: P++,
        // </a   >
        SCRIPT: P++,
        // <script> ...
        SCRIPT_ENDING: P++
        // <script> ... <
      }, t.XML_ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'"
      }, t.ENTITIES = {
        amp: "&",
        gt: ">",
        lt: "<",
        quot: '"',
        apos: "'",
        AElig: 198,
        Aacute: 193,
        Acirc: 194,
        Agrave: 192,
        Aring: 197,
        Atilde: 195,
        Auml: 196,
        Ccedil: 199,
        ETH: 208,
        Eacute: 201,
        Ecirc: 202,
        Egrave: 200,
        Euml: 203,
        Iacute: 205,
        Icirc: 206,
        Igrave: 204,
        Iuml: 207,
        Ntilde: 209,
        Oacute: 211,
        Ocirc: 212,
        Ograve: 210,
        Oslash: 216,
        Otilde: 213,
        Ouml: 214,
        THORN: 222,
        Uacute: 218,
        Ucirc: 219,
        Ugrave: 217,
        Uuml: 220,
        Yacute: 221,
        aacute: 225,
        acirc: 226,
        aelig: 230,
        agrave: 224,
        aring: 229,
        atilde: 227,
        auml: 228,
        ccedil: 231,
        eacute: 233,
        ecirc: 234,
        egrave: 232,
        eth: 240,
        euml: 235,
        iacute: 237,
        icirc: 238,
        igrave: 236,
        iuml: 239,
        ntilde: 241,
        oacute: 243,
        ocirc: 244,
        ograve: 242,
        oslash: 248,
        otilde: 245,
        ouml: 246,
        szlig: 223,
        thorn: 254,
        uacute: 250,
        ucirc: 251,
        ugrave: 249,
        uuml: 252,
        yacute: 253,
        yuml: 255,
        copy: 169,
        reg: 174,
        nbsp: 160,
        iexcl: 161,
        cent: 162,
        pound: 163,
        curren: 164,
        yen: 165,
        brvbar: 166,
        sect: 167,
        uml: 168,
        ordf: 170,
        laquo: 171,
        not: 172,
        shy: 173,
        macr: 175,
        deg: 176,
        plusmn: 177,
        sup1: 185,
        sup2: 178,
        sup3: 179,
        acute: 180,
        micro: 181,
        para: 182,
        middot: 183,
        cedil: 184,
        ordm: 186,
        raquo: 187,
        frac14: 188,
        frac12: 189,
        frac34: 190,
        iquest: 191,
        times: 215,
        divide: 247,
        OElig: 338,
        oelig: 339,
        Scaron: 352,
        scaron: 353,
        Yuml: 376,
        fnof: 402,
        circ: 710,
        tilde: 732,
        Alpha: 913,
        Beta: 914,
        Gamma: 915,
        Delta: 916,
        Epsilon: 917,
        Zeta: 918,
        Eta: 919,
        Theta: 920,
        Iota: 921,
        Kappa: 922,
        Lambda: 923,
        Mu: 924,
        Nu: 925,
        Xi: 926,
        Omicron: 927,
        Pi: 928,
        Rho: 929,
        Sigma: 931,
        Tau: 932,
        Upsilon: 933,
        Phi: 934,
        Chi: 935,
        Psi: 936,
        Omega: 937,
        alpha: 945,
        beta: 946,
        gamma: 947,
        delta: 948,
        epsilon: 949,
        zeta: 950,
        eta: 951,
        theta: 952,
        iota: 953,
        kappa: 954,
        lambda: 955,
        mu: 956,
        nu: 957,
        xi: 958,
        omicron: 959,
        pi: 960,
        rho: 961,
        sigmaf: 962,
        sigma: 963,
        tau: 964,
        upsilon: 965,
        phi: 966,
        chi: 967,
        psi: 968,
        omega: 969,
        thetasym: 977,
        upsih: 978,
        piv: 982,
        ensp: 8194,
        emsp: 8195,
        thinsp: 8201,
        zwnj: 8204,
        zwj: 8205,
        lrm: 8206,
        rlm: 8207,
        ndash: 8211,
        mdash: 8212,
        lsquo: 8216,
        rsquo: 8217,
        sbquo: 8218,
        ldquo: 8220,
        rdquo: 8221,
        bdquo: 8222,
        dagger: 8224,
        Dagger: 8225,
        bull: 8226,
        hellip: 8230,
        permil: 8240,
        prime: 8242,
        Prime: 8243,
        lsaquo: 8249,
        rsaquo: 8250,
        oline: 8254,
        frasl: 8260,
        euro: 8364,
        image: 8465,
        weierp: 8472,
        real: 8476,
        trade: 8482,
        alefsym: 8501,
        larr: 8592,
        uarr: 8593,
        rarr: 8594,
        darr: 8595,
        harr: 8596,
        crarr: 8629,
        lArr: 8656,
        uArr: 8657,
        rArr: 8658,
        dArr: 8659,
        hArr: 8660,
        forall: 8704,
        part: 8706,
        exist: 8707,
        empty: 8709,
        nabla: 8711,
        isin: 8712,
        notin: 8713,
        ni: 8715,
        prod: 8719,
        sum: 8721,
        minus: 8722,
        lowast: 8727,
        radic: 8730,
        prop: 8733,
        infin: 8734,
        ang: 8736,
        and: 8743,
        or: 8744,
        cap: 8745,
        cup: 8746,
        int: 8747,
        there4: 8756,
        sim: 8764,
        cong: 8773,
        asymp: 8776,
        ne: 8800,
        equiv: 8801,
        le: 8804,
        ge: 8805,
        sub: 8834,
        sup: 8835,
        nsub: 8836,
        sube: 8838,
        supe: 8839,
        oplus: 8853,
        otimes: 8855,
        perp: 8869,
        sdot: 8901,
        lceil: 8968,
        rceil: 8969,
        lfloor: 8970,
        rfloor: 8971,
        lang: 9001,
        rang: 9002,
        loz: 9674,
        spades: 9824,
        clubs: 9827,
        hearts: 9829,
        diams: 9830
      }, Object.keys(t.ENTITIES).forEach(function(O) {
        var I = t.ENTITIES[O], Q = typeof I == "number" ? String.fromCharCode(I) : I;
        t.ENTITIES[O] = Q;
      });
      for (var G in t.STATE)
        t.STATE[t.STATE[G]] = G;
      P = t.STATE;
      function q(O, I, Q) {
        O[I] && O[I](Q);
      }
      function M(O, I, Q) {
        O.textNode && K(O), q(O, I, Q);
      }
      function K(O) {
        O.textNode = k(O.opt, O.textNode), O.textNode && q(O, "ontext", O.textNode), O.textNode = "";
      }
      function k(O, I) {
        return O.trim && (I = I.trim()), O.normalize && (I = I.replace(/\s+/g, " ")), I;
      }
      function F(O, I) {
        return K(O), O.trackPosition && (I += `
Line: ` + O.line + `
Column: ` + O.column + `
Char: ` + O.c), I = new Error(I), O.error = I, q(O, "onerror", I), O;
      }
      function Y(O) {
        return O.sawRoot && !O.closedRoot && B(O, "Unclosed root tag"), O.state !== P.BEGIN && O.state !== P.BEGIN_WHITESPACE && O.state !== P.TEXT && F(O, "Unexpected end"), K(O), O.c = "", O.closed = !0, q(O, "onend"), n.call(O, O.strict, O.opt), O;
      }
      function B(O, I) {
        if (typeof O != "object" || !(O instanceof n))
          throw new Error("bad call to strictFail");
        O.strict && F(O, I);
      }
      function W(O) {
        O.strict || (O.tagName = O.tagName[O.looseCase]());
        var I = O.tags[O.tags.length - 1] || O, Q = O.tag = { name: O.tagName, attributes: {} };
        O.opt.xmlns && (Q.ns = I.ns), O.attribList.length = 0, M(O, "onopentagstart", Q);
      }
      function Z(O, I) {
        var Q = O.indexOf(":"), H = Q < 0 ? ["", O] : O.split(":"), A = H[0], L = H[1];
        return I && O === "xmlns" && (A = "xmlns", L = ""), { prefix: A, local: L };
      }
      function V(O) {
        if (O.strict || (O.attribName = O.attribName[O.looseCase]()), O.attribList.indexOf(O.attribName) !== -1 || O.tag.attributes.hasOwnProperty(O.attribName)) {
          O.attribName = O.attribValue = "";
          return;
        }
        if (O.opt.xmlns) {
          var I = Z(O.attribName, !0), Q = I.prefix, H = I.local;
          if (Q === "xmlns")
            if (H === "xml" && O.attribValue !== m)
              B(
                O,
                "xml: prefix must be bound to " + m + `
Actual: ` + O.attribValue
              );
            else if (H === "xmlns" && O.attribValue !== y)
              B(
                O,
                "xmlns: prefix must be bound to " + y + `
Actual: ` + O.attribValue
              );
            else {
              var A = O.tag, L = O.tags[O.tags.length - 1] || O;
              A.ns === L.ns && (A.ns = Object.create(L.ns)), A.ns[H] = O.attribValue;
            }
          O.attribList.push([O.attribName, O.attribValue]);
        } else
          O.tag.attributes[O.attribName] = O.attribValue, M(O, "onattribute", {
            name: O.attribName,
            value: O.attribValue
          });
        O.attribName = O.attribValue = "";
      }
      function C(O, I) {
        if (O.opt.xmlns) {
          var Q = O.tag, H = Z(O.tagName);
          Q.prefix = H.prefix, Q.local = H.local, Q.uri = Q.ns[H.prefix] || "", Q.prefix && !Q.uri && (B(
            O,
            "Unbound namespace prefix: " + JSON.stringify(O.tagName)
          ), Q.uri = H.prefix);
          var A = O.tags[O.tags.length - 1] || O;
          Q.ns && A.ns !== Q.ns && Object.keys(Q.ns).forEach(function(S) {
            M(O, "onopennamespace", {
              prefix: S,
              uri: Q.ns[S]
            });
          });
          for (var L = 0, X = O.attribList.length; L < X; L++) {
            var J = O.attribList[L], re = J[0], fe = J[1], ye = Z(re, !0), Ie = ye.prefix, ke = ye.local, Oe = Ie === "" ? "" : Q.ns[Ie] || "", Se = {
              name: re,
              value: fe,
              prefix: Ie,
              local: ke,
              uri: Oe
            };
            Ie && Ie !== "xmlns" && !Oe && (B(
              O,
              "Unbound namespace prefix: " + JSON.stringify(Ie)
            ), Se.uri = Ie), O.tag.attributes[re] = Se, M(O, "onattribute", Se);
          }
          O.attribList.length = 0;
        }
        O.tag.isSelfClosing = !!I, O.sawRoot = !0, O.tags.push(O.tag), M(O, "onopentag", O.tag), I || (!O.noscript && O.tagName.toLowerCase() === "script" ? O.state = P.SCRIPT : O.state = P.TEXT, O.tag = null, O.tagName = ""), O.attribName = O.attribValue = "", O.attribList.length = 0;
      }
      function j(O) {
        if (!O.tagName) {
          B(O, "Weird empty close tag."), O.textNode += "</>", O.state = P.TEXT;
          return;
        }
        if (O.script) {
          if (O.tagName !== "script") {
            O.script += "</" + O.tagName + ">", O.tagName = "", O.state = P.SCRIPT;
            return;
          }
          M(O, "onscript", O.script), O.script = "";
        }
        var I = O.tags.length, Q = O.tagName;
        O.strict || (Q = Q[O.looseCase]());
        for (var H = Q; I--; ) {
          var A = O.tags[I];
          if (A.name !== H)
            B(O, "Unexpected close tag");
          else
            break;
        }
        if (I < 0) {
          B(O, "Unmatched closing tag: " + O.tagName), O.textNode += "</" + O.tagName + ">", O.state = P.TEXT;
          return;
        }
        O.tagName = Q;
        for (var L = O.tags.length; L-- > I; ) {
          var X = O.tag = O.tags.pop();
          O.tagName = O.tag.name, M(O, "onclosetag", O.tagName);
          var J = {};
          for (var re in X.ns)
            J[re] = X.ns[re];
          var fe = O.tags[O.tags.length - 1] || O;
          O.opt.xmlns && X.ns !== fe.ns && Object.keys(X.ns).forEach(function(ye) {
            var Ie = X.ns[ye];
            M(O, "onclosenamespace", { prefix: ye, uri: Ie });
          });
        }
        I === 0 && (O.closedRoot = !0), O.tagName = O.attribValue = O.attribName = "", O.attribList.length = 0, O.state = P.TEXT;
      }
      function D(O) {
        var I = O.entity, Q = I.toLowerCase(), H, A = "";
        return O.ENTITIES[I] ? O.ENTITIES[I] : O.ENTITIES[Q] ? O.ENTITIES[Q] : (I = Q, I.charAt(0) === "#" && (I.charAt(1) === "x" ? (I = I.slice(2), H = parseInt(I, 16), A = H.toString(16)) : (I = I.slice(1), H = parseInt(I, 10), A = H.toString(10))), I = I.replace(/^0+/, ""), isNaN(H) || A.toLowerCase() !== I || H < 0 || H > 1114111 ? (B(O, "Invalid character entity"), "&" + O.entity + ";") : String.fromCodePoint(H));
      }
      function R(O, I) {
        I === "<" ? (O.state = P.OPEN_WAKA, O.startTagPosition = O.position) : b(I) || (B(O, "Non-whitespace before first tag."), O.textNode = I, O.state = P.TEXT);
      }
      function N(O, I) {
        var Q = "";
        return I < O.length && (Q = O.charAt(I)), Q;
      }
      function x(O) {
        var I = this;
        if (this.error)
          throw this.error;
        if (I.closed)
          return F(
            I,
            "Cannot write after close. Assign an onready handler."
          );
        if (O === null)
          return Y(I);
        typeof O == "object" && (O = O.toString());
        for (var Q = 0, H = ""; H = N(O, Q++), I.c = H, !!H; )
          switch (I.trackPosition && (I.position++, H === `
` ? (I.line++, I.column = 0) : I.column++), I.state) {
            case P.BEGIN:
              if (I.state = P.BEGIN_WHITESPACE, H === "\uFEFF")
                continue;
              R(I, H);
              continue;
            case P.BEGIN_WHITESPACE:
              R(I, H);
              continue;
            case P.TEXT:
              if (I.sawRoot && !I.closedRoot) {
                for (var L = Q - 1; H && H !== "<" && H !== "&"; )
                  H = N(O, Q++), H && I.trackPosition && (I.position++, H === `
` ? (I.line++, I.column = 0) : I.column++);
                I.textNode += O.substring(L, Q - 1);
              }
              H === "<" && !(I.sawRoot && I.closedRoot && !I.strict) ? (I.state = P.OPEN_WAKA, I.startTagPosition = I.position) : (!b(H) && (!I.sawRoot || I.closedRoot) && B(I, "Text data outside of root node."), H === "&" ? I.state = P.TEXT_ENTITY : I.textNode += H);
              continue;
            case P.SCRIPT:
              H === "<" ? I.state = P.SCRIPT_ENDING : I.script += H;
              continue;
            case P.SCRIPT_ENDING:
              H === "/" ? I.state = P.CLOSE_TAG : (I.script += "<" + H, I.state = P.SCRIPT);
              continue;
            case P.OPEN_WAKA:
              if (H === "!")
                I.state = P.SGML_DECL, I.sgmlDecl = "";
              else if (!b(H)) if (w(h, H))
                I.state = P.OPEN_TAG, I.tagName = H;
              else if (H === "/")
                I.state = P.CLOSE_TAG, I.tagName = "";
              else if (H === "?")
                I.state = P.PROC_INST, I.procInstName = I.procInstBody = "";
              else {
                if (B(I, "Unencoded <"), I.startTagPosition + 1 < I.position) {
                  var A = I.position - I.startTagPosition;
                  H = new Array(A).join(" ") + H;
                }
                I.textNode += "<" + H, I.state = P.TEXT;
              }
              continue;
            case P.SGML_DECL:
              if (I.sgmlDecl + H === "--") {
                I.state = P.COMMENT, I.comment = "", I.sgmlDecl = "";
                continue;
              }
              I.doctype && I.doctype !== !0 && I.sgmlDecl ? (I.state = P.DOCTYPE_DTD, I.doctype += "<!" + I.sgmlDecl + H, I.sgmlDecl = "") : (I.sgmlDecl + H).toUpperCase() === d ? (M(I, "onopencdata"), I.state = P.CDATA, I.sgmlDecl = "", I.cdata = "") : (I.sgmlDecl + H).toUpperCase() === f ? (I.state = P.DOCTYPE, (I.doctype || I.sawRoot) && B(
                I,
                "Inappropriately located doctype declaration"
              ), I.doctype = "", I.sgmlDecl = "") : H === ">" ? (M(I, "onsgmldeclaration", I.sgmlDecl), I.sgmlDecl = "", I.state = P.TEXT) : ($(H) && (I.state = P.SGML_DECL_QUOTED), I.sgmlDecl += H);
              continue;
            case P.SGML_DECL_QUOTED:
              H === I.q && (I.state = P.SGML_DECL, I.q = ""), I.sgmlDecl += H;
              continue;
            case P.DOCTYPE:
              H === ">" ? (I.state = P.TEXT, M(I, "ondoctype", I.doctype), I.doctype = !0) : (I.doctype += H, H === "[" ? I.state = P.DOCTYPE_DTD : $(H) && (I.state = P.DOCTYPE_QUOTED, I.q = H));
              continue;
            case P.DOCTYPE_QUOTED:
              I.doctype += H, H === I.q && (I.q = "", I.state = P.DOCTYPE);
              continue;
            case P.DOCTYPE_DTD:
              H === "]" ? (I.doctype += H, I.state = P.DOCTYPE) : H === "<" ? (I.state = P.OPEN_WAKA, I.startTagPosition = I.position) : $(H) ? (I.doctype += H, I.state = P.DOCTYPE_DTD_QUOTED, I.q = H) : I.doctype += H;
              continue;
            case P.DOCTYPE_DTD_QUOTED:
              I.doctype += H, H === I.q && (I.state = P.DOCTYPE_DTD, I.q = "");
              continue;
            case P.COMMENT:
              H === "-" ? I.state = P.COMMENT_ENDING : I.comment += H;
              continue;
            case P.COMMENT_ENDING:
              H === "-" ? (I.state = P.COMMENT_ENDED, I.comment = k(I.opt, I.comment), I.comment && M(I, "oncomment", I.comment), I.comment = "") : (I.comment += "-" + H, I.state = P.COMMENT);
              continue;
            case P.COMMENT_ENDED:
              H !== ">" ? (B(I, "Malformed comment"), I.comment += "--" + H, I.state = P.COMMENT) : I.doctype && I.doctype !== !0 ? I.state = P.DOCTYPE_DTD : I.state = P.TEXT;
              continue;
            case P.CDATA:
              for (var L = Q - 1; H && H !== "]"; )
                H = N(O, Q++), H && I.trackPosition && (I.position++, H === `
` ? (I.line++, I.column = 0) : I.column++);
              I.cdata += O.substring(L, Q - 1), H === "]" && (I.state = P.CDATA_ENDING);
              continue;
            case P.CDATA_ENDING:
              H === "]" ? I.state = P.CDATA_ENDING_2 : (I.cdata += "]" + H, I.state = P.CDATA);
              continue;
            case P.CDATA_ENDING_2:
              H === ">" ? (I.cdata && M(I, "oncdata", I.cdata), M(I, "onclosecdata"), I.cdata = "", I.state = P.TEXT) : H === "]" ? I.cdata += "]" : (I.cdata += "]]" + H, I.state = P.CDATA);
              continue;
            case P.PROC_INST:
              H === "?" ? I.state = P.PROC_INST_ENDING : b(H) ? I.state = P.PROC_INST_BODY : I.procInstName += H;
              continue;
            case P.PROC_INST_BODY:
              if (!I.procInstBody && b(H))
                continue;
              H === "?" ? I.state = P.PROC_INST_ENDING : I.procInstBody += H;
              continue;
            case P.PROC_INST_ENDING:
              H === ">" ? (M(I, "onprocessinginstruction", {
                name: I.procInstName,
                body: I.procInstBody
              }), I.procInstName = I.procInstBody = "", I.state = P.TEXT) : (I.procInstBody += "?" + H, I.state = P.PROC_INST_BODY);
              continue;
            case P.OPEN_TAG:
              w(g, H) ? I.tagName += H : (W(I), H === ">" ? C(I) : H === "/" ? I.state = P.OPEN_TAG_SLASH : (b(H) || B(I, "Invalid character in tag name"), I.state = P.ATTRIB));
              continue;
            case P.OPEN_TAG_SLASH:
              H === ">" ? (C(I, !0), j(I)) : (B(
                I,
                "Forward-slash in opening tag not followed by >"
              ), I.state = P.ATTRIB);
              continue;
            case P.ATTRIB:
              if (b(H))
                continue;
              H === ">" ? C(I) : H === "/" ? I.state = P.OPEN_TAG_SLASH : w(h, H) ? (I.attribName = H, I.attribValue = "", I.state = P.ATTRIB_NAME) : B(I, "Invalid attribute name");
              continue;
            case P.ATTRIB_NAME:
              H === "=" ? I.state = P.ATTRIB_VALUE : H === ">" ? (B(I, "Attribute without value"), I.attribValue = I.attribName, V(I), C(I)) : b(H) ? I.state = P.ATTRIB_NAME_SAW_WHITE : w(g, H) ? I.attribName += H : B(I, "Invalid attribute name");
              continue;
            case P.ATTRIB_NAME_SAW_WHITE:
              if (H === "=")
                I.state = P.ATTRIB_VALUE;
              else {
                if (b(H))
                  continue;
                B(I, "Attribute without value"), I.tag.attributes[I.attribName] = "", I.attribValue = "", M(I, "onattribute", {
                  name: I.attribName,
                  value: ""
                }), I.attribName = "", H === ">" ? C(I) : w(h, H) ? (I.attribName = H, I.state = P.ATTRIB_NAME) : (B(I, "Invalid attribute name"), I.state = P.ATTRIB);
              }
              continue;
            case P.ATTRIB_VALUE:
              if (b(H))
                continue;
              $(H) ? (I.q = H, I.state = P.ATTRIB_VALUE_QUOTED) : (I.opt.unquotedAttributeValues || F(I, "Unquoted attribute value"), I.state = P.ATTRIB_VALUE_UNQUOTED, I.attribValue = H);
              continue;
            case P.ATTRIB_VALUE_QUOTED:
              if (H !== I.q) {
                H === "&" ? I.state = P.ATTRIB_VALUE_ENTITY_Q : I.attribValue += H;
                continue;
              }
              V(I), I.q = "", I.state = P.ATTRIB_VALUE_CLOSED;
              continue;
            case P.ATTRIB_VALUE_CLOSED:
              b(H) ? I.state = P.ATTRIB : H === ">" ? C(I) : H === "/" ? I.state = P.OPEN_TAG_SLASH : w(h, H) ? (B(I, "No whitespace between attributes"), I.attribName = H, I.attribValue = "", I.state = P.ATTRIB_NAME) : B(I, "Invalid attribute name");
              continue;
            case P.ATTRIB_VALUE_UNQUOTED:
              if (!_(H)) {
                H === "&" ? I.state = P.ATTRIB_VALUE_ENTITY_U : I.attribValue += H;
                continue;
              }
              V(I), H === ">" ? C(I) : I.state = P.ATTRIB;
              continue;
            case P.CLOSE_TAG:
              if (I.tagName)
                H === ">" ? j(I) : w(g, H) ? I.tagName += H : I.script ? (I.script += "</" + I.tagName, I.tagName = "", I.state = P.SCRIPT) : (b(H) || B(I, "Invalid tagname in closing tag"), I.state = P.CLOSE_TAG_SAW_WHITE);
              else {
                if (b(H))
                  continue;
                T(h, H) ? I.script ? (I.script += "</" + H, I.state = P.SCRIPT) : B(I, "Invalid tagname in closing tag.") : I.tagName = H;
              }
              continue;
            case P.CLOSE_TAG_SAW_WHITE:
              if (b(H))
                continue;
              H === ">" ? j(I) : B(I, "Invalid characters in closing tag");
              continue;
            case P.TEXT_ENTITY:
            case P.ATTRIB_VALUE_ENTITY_Q:
            case P.ATTRIB_VALUE_ENTITY_U:
              var X, J;
              switch (I.state) {
                case P.TEXT_ENTITY:
                  X = P.TEXT, J = "textNode";
                  break;
                case P.ATTRIB_VALUE_ENTITY_Q:
                  X = P.ATTRIB_VALUE_QUOTED, J = "attribValue";
                  break;
                case P.ATTRIB_VALUE_ENTITY_U:
                  X = P.ATTRIB_VALUE_UNQUOTED, J = "attribValue";
                  break;
              }
              if (H === ";") {
                var re = D(I);
                I.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(re) ? (I.entity = "", I.state = X, I.write(re)) : (I[J] += re, I.entity = "", I.state = X);
              } else w(I.entity.length ? E : p, H) ? I.entity += H : (B(I, "Invalid character in entity name"), I[J] += "&" + I.entity + H, I.entity = "", I.state = X);
              continue;
            default:
              throw new Error(I, "Unknown state: " + I.state);
          }
        return I.position >= I.bufferCheckPosition && l(I), I;
      }
      String.fromCodePoint || (function() {
        var O = String.fromCharCode, I = Math.floor, Q = function() {
          var H = 16384, A = [], L, X, J = -1, re = arguments.length;
          if (!re)
            return "";
          for (var fe = ""; ++J < re; ) {
            var ye = Number(arguments[J]);
            if (!isFinite(ye) || // `NaN`, `+Infinity`, or `-Infinity`
            ye < 0 || // not a valid Unicode code point
            ye > 1114111 || // not a valid Unicode code point
            I(ye) !== ye)
              throw RangeError("Invalid code point: " + ye);
            ye <= 65535 ? A.push(ye) : (ye -= 65536, L = (ye >> 10) + 55296, X = ye % 1024 + 56320, A.push(L, X)), (J + 1 === re || A.length > H) && (fe += O.apply(null, A), A.length = 0);
          }
          return fe;
        };
        Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
          value: Q,
          configurable: !0,
          writable: !0
        }) : String.fromCodePoint = Q;
      })();
    })(e);
  })(co)), co;
}
var Ff;
function E_() {
  if (Ff) return Fr;
  Ff = 1, Object.defineProperty(Fr, "__esModule", { value: !0 }), Fr.XElement = void 0, Fr.parseXml = i;
  const e = __(), t = ts();
  class a {
    constructor(o) {
      if (this.name = o, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !o)
        throw (0, t.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
      if (!l(o))
        throw (0, t.newError)(`Invalid element name: ${o}`, "ERR_XML_ELEMENT_INVALID_NAME");
    }
    attribute(o) {
      const c = this.attributes === null ? null : this.attributes[o];
      if (c == null)
        throw (0, t.newError)(`No attribute "${o}"`, "ERR_XML_MISSED_ATTRIBUTE");
      return c;
    }
    removeAttribute(o) {
      this.attributes !== null && delete this.attributes[o];
    }
    element(o, c = !1, s = null) {
      const d = this.elementOrNull(o, c);
      if (d === null)
        throw (0, t.newError)(s || `No element "${o}"`, "ERR_XML_MISSED_ELEMENT");
      return d;
    }
    elementOrNull(o, c = !1) {
      if (this.elements === null)
        return null;
      for (const s of this.elements)
        if (r(s, o, c))
          return s;
      return null;
    }
    getElements(o, c = !1) {
      return this.elements === null ? [] : this.elements.filter((s) => r(s, o, c));
    }
    elementValueOrEmpty(o, c = !1) {
      const s = this.elementOrNull(o, c);
      return s === null ? "" : s.value;
    }
  }
  Fr.XElement = a;
  const n = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
  function l(u) {
    return n.test(u);
  }
  function r(u, o, c) {
    const s = u.name;
    return s === o || c === !0 && s.length === o.length && s.toLowerCase() === o.toLowerCase();
  }
  function i(u) {
    let o = null;
    const c = e.parser(!0, {}), s = [];
    return c.onopentag = (d) => {
      const f = new a(d.name);
      if (f.attributes = d.attributes, o === null)
        o = f;
      else {
        const m = s[s.length - 1];
        m.elements == null && (m.elements = []), m.elements.push(f);
      }
      s.push(f);
    }, c.onclosetag = () => {
      s.pop();
    }, c.ontext = (d) => {
      s.length > 0 && (s[s.length - 1].value = d);
    }, c.oncdata = (d) => {
      const f = s[s.length - 1];
      f.value = d, f.isCData = !0;
    }, c.onerror = (d) => {
      throw d;
    }, c.write(u), o;
  }
  return Fr;
}
var Uf;
function rt() {
  return Uf || (Uf = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = d;
    var t = Ju();
    Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
      return t.CancellationError;
    } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } });
    var a = ts();
    Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
      return a.newError;
    } });
    var n = h_();
    Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
      return n.configureRequestOptions;
    } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
      return n.configureRequestOptionsFromUrl;
    } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
      return n.configureRequestUrl;
    } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
      return n.createHttpError;
    } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
      return n.DigestTransform;
    } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
      return n.HttpError;
    } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
      return n.HttpExecutor;
    } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
      return n.parseJson;
    } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
      return n.safeGetHeader;
    } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
      return n.safeStringifyJson;
    } });
    var l = p_();
    Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
      return l.MemoLazy;
    } });
    var r = ky();
    Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
      return r.ProgressCallbackTransform;
    } });
    var i = m_();
    Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
      return i.getS3LikeProviderBaseUrl;
    } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
      return i.githubUrl;
    } });
    var u = g_();
    Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
      return u.retry;
    } });
    var o = y_();
    Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
      return o.parseDn;
    } });
    var c = v_();
    Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
      return c.UUID;
    } });
    var s = E_();
    Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
      return s.parseXml;
    } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
      return s.XElement;
    } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
    function d(f) {
      return f == null ? [] : Array.isArray(f) ? f : [f];
    }
  })(no)), no;
}
var st = {}, ei = {}, tr = {}, jf;
function Ln() {
  if (jf) return tr;
  jf = 1;
  function e(i) {
    return typeof i > "u" || i === null;
  }
  function t(i) {
    return typeof i == "object" && i !== null;
  }
  function a(i) {
    return Array.isArray(i) ? i : e(i) ? [] : [i];
  }
  function n(i, u) {
    var o, c, s, d;
    if (u)
      for (d = Object.keys(u), o = 0, c = d.length; o < c; o += 1)
        s = d[o], i[s] = u[s];
    return i;
  }
  function l(i, u) {
    var o = "", c;
    for (c = 0; c < u; c += 1)
      o += i;
    return o;
  }
  function r(i) {
    return i === 0 && Number.NEGATIVE_INFINITY === 1 / i;
  }
  return tr.isNothing = e, tr.isObject = t, tr.toArray = a, tr.repeat = l, tr.isNegativeZero = r, tr.extend = n, tr;
}
var uo, Mf;
function qn() {
  if (Mf) return uo;
  Mf = 1;
  function e(a, n) {
    var l = "", r = a.reason || "(unknown reason)";
    return a.mark ? (a.mark.name && (l += 'in "' + a.mark.name + '" '), l += "(" + (a.mark.line + 1) + ":" + (a.mark.column + 1) + ")", !n && a.mark.snippet && (l += `

` + a.mark.snippet), r + " " + l) : r;
  }
  function t(a, n) {
    Error.call(this), this.name = "YAMLException", this.reason = a, this.mark = n, this.message = e(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
  }
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t.prototype.toString = function(n) {
    return this.name + ": " + e(this, n);
  }, uo = t, uo;
}
var lo, xf;
function w_() {
  if (xf) return lo;
  xf = 1;
  var e = Ln();
  function t(l, r, i, u, o) {
    var c = "", s = "", d = Math.floor(o / 2) - 1;
    return u - r > d && (c = " ... ", r = u - d + c.length), i - u > d && (s = " ...", i = u + d - s.length), {
      str: c + l.slice(r, i).replace(/\t/g, "→") + s,
      pos: u - r + c.length
      // relative position
    };
  }
  function a(l, r) {
    return e.repeat(" ", r - l.length) + l;
  }
  function n(l, r) {
    if (r = Object.create(r || null), !l.buffer) return null;
    r.maxLength || (r.maxLength = 79), typeof r.indent != "number" && (r.indent = 1), typeof r.linesBefore != "number" && (r.linesBefore = 3), typeof r.linesAfter != "number" && (r.linesAfter = 2);
    for (var i = /\r?\n|\r|\0/g, u = [0], o = [], c, s = -1; c = i.exec(l.buffer); )
      o.push(c.index), u.push(c.index + c[0].length), l.position <= c.index && s < 0 && (s = u.length - 2);
    s < 0 && (s = u.length - 1);
    var d = "", f, m, y = Math.min(l.line + r.linesAfter, o.length).toString().length, v = r.maxLength - (r.indent + y + 3);
    for (f = 1; f <= r.linesBefore && !(s - f < 0); f++)
      m = t(
        l.buffer,
        u[s - f],
        o[s - f],
        l.position - (u[s] - u[s - f]),
        v
      ), d = e.repeat(" ", r.indent) + a((l.line - f + 1).toString(), y) + " | " + m.str + `
` + d;
    for (m = t(l.buffer, u[s], o[s], l.position, v), d += e.repeat(" ", r.indent) + a((l.line + 1).toString(), y) + " | " + m.str + `
`, d += e.repeat("-", r.indent + y + 3 + m.pos) + `^
`, f = 1; f <= r.linesAfter && !(s + f >= o.length); f++)
      m = t(
        l.buffer,
        u[s + f],
        o[s + f],
        l.position - (u[s] - u[s + f]),
        v
      ), d += e.repeat(" ", r.indent) + a((l.line + f + 1).toString(), y) + " | " + m.str + `
`;
    return d.replace(/\n$/, "");
  }
  return lo = n, lo;
}
var fo, Vf;
function ht() {
  if (Vf) return fo;
  Vf = 1;
  var e = qn(), t = [
    "kind",
    "multi",
    "resolve",
    "construct",
    "instanceOf",
    "predicate",
    "represent",
    "representName",
    "defaultStyle",
    "styleAliases"
  ], a = [
    "scalar",
    "sequence",
    "mapping"
  ];
  function n(r) {
    var i = {};
    return r !== null && Object.keys(r).forEach(function(u) {
      r[u].forEach(function(o) {
        i[String(o)] = u;
      });
    }), i;
  }
  function l(r, i) {
    if (i = i || {}, Object.keys(i).forEach(function(u) {
      if (t.indexOf(u) === -1)
        throw new e('Unknown option "' + u + '" is met in definition of "' + r + '" YAML type.');
    }), this.options = i, this.tag = r, this.kind = i.kind || null, this.resolve = i.resolve || function() {
      return !0;
    }, this.construct = i.construct || function(u) {
      return u;
    }, this.instanceOf = i.instanceOf || null, this.predicate = i.predicate || null, this.represent = i.represent || null, this.representName = i.representName || null, this.defaultStyle = i.defaultStyle || null, this.multi = i.multi || !1, this.styleAliases = n(i.styleAliases || null), a.indexOf(this.kind) === -1)
      throw new e('Unknown kind "' + this.kind + '" is specified for "' + r + '" YAML type.');
  }
  return fo = l, fo;
}
var ho, Gf;
function Ly() {
  if (Gf) return ho;
  Gf = 1;
  var e = qn(), t = ht();
  function a(r, i) {
    var u = [];
    return r[i].forEach(function(o) {
      var c = u.length;
      u.forEach(function(s, d) {
        s.tag === o.tag && s.kind === o.kind && s.multi === o.multi && (c = d);
      }), u[c] = o;
    }), u;
  }
  function n() {
    var r = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    }, i, u;
    function o(c) {
      c.multi ? (r.multi[c.kind].push(c), r.multi.fallback.push(c)) : r[c.kind][c.tag] = r.fallback[c.tag] = c;
    }
    for (i = 0, u = arguments.length; i < u; i += 1)
      arguments[i].forEach(o);
    return r;
  }
  function l(r) {
    return this.extend(r);
  }
  return l.prototype.extend = function(i) {
    var u = [], o = [];
    if (i instanceof t)
      o.push(i);
    else if (Array.isArray(i))
      o = o.concat(i);
    else if (i && (Array.isArray(i.implicit) || Array.isArray(i.explicit)))
      i.implicit && (u = u.concat(i.implicit)), i.explicit && (o = o.concat(i.explicit));
    else
      throw new e("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
    u.forEach(function(s) {
      if (!(s instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
      if (s.loadKind && s.loadKind !== "scalar")
        throw new e("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
      if (s.multi)
        throw new e("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }), o.forEach(function(s) {
      if (!(s instanceof t))
        throw new e("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    });
    var c = Object.create(l.prototype);
    return c.implicit = (this.implicit || []).concat(u), c.explicit = (this.explicit || []).concat(o), c.compiledImplicit = a(c, "implicit"), c.compiledExplicit = a(c, "explicit"), c.compiledTypeMap = n(c.compiledImplicit, c.compiledExplicit), c;
  }, ho = l, ho;
}
var po, Bf;
function qy() {
  if (Bf) return po;
  Bf = 1;
  var e = ht();
  return po = new e("tag:yaml.org,2002:str", {
    kind: "scalar",
    construct: function(t) {
      return t !== null ? t : "";
    }
  }), po;
}
var mo, Hf;
function Fy() {
  if (Hf) return mo;
  Hf = 1;
  var e = ht();
  return mo = new e("tag:yaml.org,2002:seq", {
    kind: "sequence",
    construct: function(t) {
      return t !== null ? t : [];
    }
  }), mo;
}
var go, zf;
function Uy() {
  if (zf) return go;
  zf = 1;
  var e = ht();
  return go = new e("tag:yaml.org,2002:map", {
    kind: "mapping",
    construct: function(t) {
      return t !== null ? t : {};
    }
  }), go;
}
var yo, Kf;
function jy() {
  if (Kf) return yo;
  Kf = 1;
  var e = Ly();
  return yo = new e({
    explicit: [
      qy(),
      Fy(),
      Uy()
    ]
  }), yo;
}
var vo, Xf;
function My() {
  if (Xf) return vo;
  Xf = 1;
  var e = ht();
  function t(l) {
    if (l === null) return !0;
    var r = l.length;
    return r === 1 && l === "~" || r === 4 && (l === "null" || l === "Null" || l === "NULL");
  }
  function a() {
    return null;
  }
  function n(l) {
    return l === null;
  }
  return vo = new e("tag:yaml.org,2002:null", {
    kind: "scalar",
    resolve: t,
    construct: a,
    predicate: n,
    represent: {
      canonical: function() {
        return "~";
      },
      lowercase: function() {
        return "null";
      },
      uppercase: function() {
        return "NULL";
      },
      camelcase: function() {
        return "Null";
      },
      empty: function() {
        return "";
      }
    },
    defaultStyle: "lowercase"
  }), vo;
}
var _o, Wf;
function xy() {
  if (Wf) return _o;
  Wf = 1;
  var e = ht();
  function t(l) {
    if (l === null) return !1;
    var r = l.length;
    return r === 4 && (l === "true" || l === "True" || l === "TRUE") || r === 5 && (l === "false" || l === "False" || l === "FALSE");
  }
  function a(l) {
    return l === "true" || l === "True" || l === "TRUE";
  }
  function n(l) {
    return Object.prototype.toString.call(l) === "[object Boolean]";
  }
  return _o = new e("tag:yaml.org,2002:bool", {
    kind: "scalar",
    resolve: t,
    construct: a,
    predicate: n,
    represent: {
      lowercase: function(l) {
        return l ? "true" : "false";
      },
      uppercase: function(l) {
        return l ? "TRUE" : "FALSE";
      },
      camelcase: function(l) {
        return l ? "True" : "False";
      }
    },
    defaultStyle: "lowercase"
  }), _o;
}
var Eo, Yf;
function Vy() {
  if (Yf) return Eo;
  Yf = 1;
  var e = Ln(), t = ht();
  function a(o) {
    return 48 <= o && o <= 57 || 65 <= o && o <= 70 || 97 <= o && o <= 102;
  }
  function n(o) {
    return 48 <= o && o <= 55;
  }
  function l(o) {
    return 48 <= o && o <= 57;
  }
  function r(o) {
    if (o === null) return !1;
    var c = o.length, s = 0, d = !1, f;
    if (!c) return !1;
    if (f = o[s], (f === "-" || f === "+") && (f = o[++s]), f === "0") {
      if (s + 1 === c) return !0;
      if (f = o[++s], f === "b") {
        for (s++; s < c; s++)
          if (f = o[s], f !== "_") {
            if (f !== "0" && f !== "1") return !1;
            d = !0;
          }
        return d && f !== "_";
      }
      if (f === "x") {
        for (s++; s < c; s++)
          if (f = o[s], f !== "_") {
            if (!a(o.charCodeAt(s))) return !1;
            d = !0;
          }
        return d && f !== "_";
      }
      if (f === "o") {
        for (s++; s < c; s++)
          if (f = o[s], f !== "_") {
            if (!n(o.charCodeAt(s))) return !1;
            d = !0;
          }
        return d && f !== "_";
      }
    }
    if (f === "_") return !1;
    for (; s < c; s++)
      if (f = o[s], f !== "_") {
        if (!l(o.charCodeAt(s)))
          return !1;
        d = !0;
      }
    return !(!d || f === "_");
  }
  function i(o) {
    var c = o, s = 1, d;
    if (c.indexOf("_") !== -1 && (c = c.replace(/_/g, "")), d = c[0], (d === "-" || d === "+") && (d === "-" && (s = -1), c = c.slice(1), d = c[0]), c === "0") return 0;
    if (d === "0") {
      if (c[1] === "b") return s * parseInt(c.slice(2), 2);
      if (c[1] === "x") return s * parseInt(c.slice(2), 16);
      if (c[1] === "o") return s * parseInt(c.slice(2), 8);
    }
    return s * parseInt(c, 10);
  }
  function u(o) {
    return Object.prototype.toString.call(o) === "[object Number]" && o % 1 === 0 && !e.isNegativeZero(o);
  }
  return Eo = new t("tag:yaml.org,2002:int", {
    kind: "scalar",
    resolve: r,
    construct: i,
    predicate: u,
    represent: {
      binary: function(o) {
        return o >= 0 ? "0b" + o.toString(2) : "-0b" + o.toString(2).slice(1);
      },
      octal: function(o) {
        return o >= 0 ? "0o" + o.toString(8) : "-0o" + o.toString(8).slice(1);
      },
      decimal: function(o) {
        return o.toString(10);
      },
      /* eslint-disable max-len */
      hexadecimal: function(o) {
        return o >= 0 ? "0x" + o.toString(16).toUpperCase() : "-0x" + o.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: "decimal",
    styleAliases: {
      binary: [2, "bin"],
      octal: [8, "oct"],
      decimal: [10, "dec"],
      hexadecimal: [16, "hex"]
    }
  }), Eo;
}
var wo, Jf;
function Gy() {
  if (Jf) return wo;
  Jf = 1;
  var e = Ln(), t = ht(), a = new RegExp(
    // 2.5e4, 2.5 and integers
    "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
  );
  function n(o) {
    return !(o === null || !a.test(o) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    o[o.length - 1] === "_");
  }
  function l(o) {
    var c, s;
    return c = o.replace(/_/g, "").toLowerCase(), s = c[0] === "-" ? -1 : 1, "+-".indexOf(c[0]) >= 0 && (c = c.slice(1)), c === ".inf" ? s === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : c === ".nan" ? NaN : s * parseFloat(c, 10);
  }
  var r = /^[-+]?[0-9]+e/;
  function i(o, c) {
    var s;
    if (isNaN(o))
      switch (c) {
        case "lowercase":
          return ".nan";
        case "uppercase":
          return ".NAN";
        case "camelcase":
          return ".NaN";
      }
    else if (Number.POSITIVE_INFINITY === o)
      switch (c) {
        case "lowercase":
          return ".inf";
        case "uppercase":
          return ".INF";
        case "camelcase":
          return ".Inf";
      }
    else if (Number.NEGATIVE_INFINITY === o)
      switch (c) {
        case "lowercase":
          return "-.inf";
        case "uppercase":
          return "-.INF";
        case "camelcase":
          return "-.Inf";
      }
    else if (e.isNegativeZero(o))
      return "-0.0";
    return s = o.toString(10), r.test(s) ? s.replace("e", ".e") : s;
  }
  function u(o) {
    return Object.prototype.toString.call(o) === "[object Number]" && (o % 1 !== 0 || e.isNegativeZero(o));
  }
  return wo = new t("tag:yaml.org,2002:float", {
    kind: "scalar",
    resolve: n,
    construct: l,
    predicate: u,
    represent: i,
    defaultStyle: "lowercase"
  }), wo;
}
var $o, Qf;
function By() {
  return Qf || (Qf = 1, $o = jy().extend({
    implicit: [
      My(),
      xy(),
      Vy(),
      Gy()
    ]
  })), $o;
}
var So, Zf;
function Hy() {
  return Zf || (Zf = 1, So = By()), So;
}
var bo, ed;
function zy() {
  if (ed) return bo;
  ed = 1;
  var e = ht(), t = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
  ), a = new RegExp(
    "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
  );
  function n(i) {
    return i === null ? !1 : t.exec(i) !== null || a.exec(i) !== null;
  }
  function l(i) {
    var u, o, c, s, d, f, m, y = 0, v = null, h, g, p;
    if (u = t.exec(i), u === null && (u = a.exec(i)), u === null) throw new Error("Date resolve error");
    if (o = +u[1], c = +u[2] - 1, s = +u[3], !u[4])
      return new Date(Date.UTC(o, c, s));
    if (d = +u[4], f = +u[5], m = +u[6], u[7]) {
      for (y = u[7].slice(0, 3); y.length < 3; )
        y += "0";
      y = +y;
    }
    return u[9] && (h = +u[10], g = +(u[11] || 0), v = (h * 60 + g) * 6e4, u[9] === "-" && (v = -v)), p = new Date(Date.UTC(o, c, s, d, f, m, y)), v && p.setTime(p.getTime() - v), p;
  }
  function r(i) {
    return i.toISOString();
  }
  return bo = new e("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: n,
    construct: l,
    instanceOf: Date,
    represent: r
  }), bo;
}
var Ro, td;
function Ky() {
  if (td) return Ro;
  td = 1;
  var e = ht();
  function t(a) {
    return a === "<<" || a === null;
  }
  return Ro = new e("tag:yaml.org,2002:merge", {
    kind: "scalar",
    resolve: t
  }), Ro;
}
var To, rd;
function Xy() {
  if (rd) return To;
  rd = 1;
  var e = ht(), t = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
  function a(i) {
    if (i === null) return !1;
    var u, o, c = 0, s = i.length, d = t;
    for (o = 0; o < s; o++)
      if (u = d.indexOf(i.charAt(o)), !(u > 64)) {
        if (u < 0) return !1;
        c += 6;
      }
    return c % 8 === 0;
  }
  function n(i) {
    var u, o, c = i.replace(/[\r\n=]/g, ""), s = c.length, d = t, f = 0, m = [];
    for (u = 0; u < s; u++)
      u % 4 === 0 && u && (m.push(f >> 16 & 255), m.push(f >> 8 & 255), m.push(f & 255)), f = f << 6 | d.indexOf(c.charAt(u));
    return o = s % 4 * 6, o === 0 ? (m.push(f >> 16 & 255), m.push(f >> 8 & 255), m.push(f & 255)) : o === 18 ? (m.push(f >> 10 & 255), m.push(f >> 2 & 255)) : o === 12 && m.push(f >> 4 & 255), new Uint8Array(m);
  }
  function l(i) {
    var u = "", o = 0, c, s, d = i.length, f = t;
    for (c = 0; c < d; c++)
      c % 3 === 0 && c && (u += f[o >> 18 & 63], u += f[o >> 12 & 63], u += f[o >> 6 & 63], u += f[o & 63]), o = (o << 8) + i[c];
    return s = d % 3, s === 0 ? (u += f[o >> 18 & 63], u += f[o >> 12 & 63], u += f[o >> 6 & 63], u += f[o & 63]) : s === 2 ? (u += f[o >> 10 & 63], u += f[o >> 4 & 63], u += f[o << 2 & 63], u += f[64]) : s === 1 && (u += f[o >> 2 & 63], u += f[o << 4 & 63], u += f[64], u += f[64]), u;
  }
  function r(i) {
    return Object.prototype.toString.call(i) === "[object Uint8Array]";
  }
  return To = new e("tag:yaml.org,2002:binary", {
    kind: "scalar",
    resolve: a,
    construct: n,
    predicate: r,
    represent: l
  }), To;
}
var Po, nd;
function Wy() {
  if (nd) return Po;
  nd = 1;
  var e = ht(), t = Object.prototype.hasOwnProperty, a = Object.prototype.toString;
  function n(r) {
    if (r === null) return !0;
    var i = [], u, o, c, s, d, f = r;
    for (u = 0, o = f.length; u < o; u += 1) {
      if (c = f[u], d = !1, a.call(c) !== "[object Object]") return !1;
      for (s in c)
        if (t.call(c, s))
          if (!d) d = !0;
          else return !1;
      if (!d) return !1;
      if (i.indexOf(s) === -1) i.push(s);
      else return !1;
    }
    return !0;
  }
  function l(r) {
    return r !== null ? r : [];
  }
  return Po = new e("tag:yaml.org,2002:omap", {
    kind: "sequence",
    resolve: n,
    construct: l
  }), Po;
}
var No, id;
function Yy() {
  if (id) return No;
  id = 1;
  var e = ht(), t = Object.prototype.toString;
  function a(l) {
    if (l === null) return !0;
    var r, i, u, o, c, s = l;
    for (c = new Array(s.length), r = 0, i = s.length; r < i; r += 1) {
      if (u = s[r], t.call(u) !== "[object Object]" || (o = Object.keys(u), o.length !== 1)) return !1;
      c[r] = [o[0], u[o[0]]];
    }
    return !0;
  }
  function n(l) {
    if (l === null) return [];
    var r, i, u, o, c, s = l;
    for (c = new Array(s.length), r = 0, i = s.length; r < i; r += 1)
      u = s[r], o = Object.keys(u), c[r] = [o[0], u[o[0]]];
    return c;
  }
  return No = new e("tag:yaml.org,2002:pairs", {
    kind: "sequence",
    resolve: a,
    construct: n
  }), No;
}
var Io, ad;
function Jy() {
  if (ad) return Io;
  ad = 1;
  var e = ht(), t = Object.prototype.hasOwnProperty;
  function a(l) {
    if (l === null) return !0;
    var r, i = l;
    for (r in i)
      if (t.call(i, r) && i[r] !== null)
        return !1;
    return !0;
  }
  function n(l) {
    return l !== null ? l : {};
  }
  return Io = new e("tag:yaml.org,2002:set", {
    kind: "mapping",
    resolve: a,
    construct: n
  }), Io;
}
var Oo, sd;
function Qu() {
  return sd || (sd = 1, Oo = Hy().extend({
    implicit: [
      zy(),
      Ky()
    ],
    explicit: [
      Xy(),
      Wy(),
      Yy(),
      Jy()
    ]
  })), Oo;
}
var od;
function $_() {
  if (od) return ei;
  od = 1;
  var e = Ln(), t = qn(), a = w_(), n = Qu(), l = Object.prototype.hasOwnProperty, r = 1, i = 2, u = 3, o = 4, c = 1, s = 2, d = 3, f = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, m = /[\x85\u2028\u2029]/, y = /[,\[\]\{\}]/, v = /^(?:!|!!|![a-z\-]+!)$/i, h = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function g(S) {
    return Object.prototype.toString.call(S);
  }
  function p(S) {
    return S === 10 || S === 13;
  }
  function E(S) {
    return S === 9 || S === 32;
  }
  function b(S) {
    return S === 9 || S === 32 || S === 10 || S === 13;
  }
  function $(S) {
    return S === 44 || S === 91 || S === 93 || S === 123 || S === 125;
  }
  function _(S) {
    var te;
    return 48 <= S && S <= 57 ? S - 48 : (te = S | 32, 97 <= te && te <= 102 ? te - 97 + 10 : -1);
  }
  function w(S) {
    return S === 120 ? 2 : S === 117 ? 4 : S === 85 ? 8 : 0;
  }
  function T(S) {
    return 48 <= S && S <= 57 ? S - 48 : -1;
  }
  function P(S) {
    return S === 48 ? "\0" : S === 97 ? "\x07" : S === 98 ? "\b" : S === 116 || S === 9 ? "	" : S === 110 ? `
` : S === 118 ? "\v" : S === 102 ? "\f" : S === 114 ? "\r" : S === 101 ? "\x1B" : S === 32 ? " " : S === 34 ? '"' : S === 47 ? "/" : S === 92 ? "\\" : S === 78 ? "" : S === 95 ? " " : S === 76 ? "\u2028" : S === 80 ? "\u2029" : "";
  }
  function G(S) {
    return S <= 65535 ? String.fromCharCode(S) : String.fromCharCode(
      (S - 65536 >> 10) + 55296,
      (S - 65536 & 1023) + 56320
    );
  }
  function q(S, te, ie) {
    te === "__proto__" ? Object.defineProperty(S, te, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: ie
    }) : S[te] = ie;
  }
  for (var M = new Array(256), K = new Array(256), k = 0; k < 256; k++)
    M[k] = P(k) ? 1 : 0, K[k] = P(k);
  function F(S, te) {
    this.input = S, this.filename = te.filename || null, this.schema = te.schema || n, this.onWarning = te.onWarning || null, this.legacy = te.legacy || !1, this.json = te.json || !1, this.listener = te.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = S.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
  }
  function Y(S, te) {
    var ie = {
      name: S.filename,
      buffer: S.input.slice(0, -1),
      // omit trailing \0
      position: S.position,
      line: S.line,
      column: S.position - S.lineStart
    };
    return ie.snippet = a(ie), new t(te, ie);
  }
  function B(S, te) {
    throw Y(S, te);
  }
  function W(S, te) {
    S.onWarning && S.onWarning.call(null, Y(S, te));
  }
  var Z = {
    YAML: function(te, ie, pe) {
      var ae, de, le;
      te.version !== null && B(te, "duplication of %YAML directive"), pe.length !== 1 && B(te, "YAML directive accepts exactly one argument"), ae = /^([0-9]+)\.([0-9]+)$/.exec(pe[0]), ae === null && B(te, "ill-formed argument of the YAML directive"), de = parseInt(ae[1], 10), le = parseInt(ae[2], 10), de !== 1 && B(te, "unacceptable YAML version of the document"), te.version = pe[0], te.checkLineBreaks = le < 2, le !== 1 && le !== 2 && W(te, "unsupported YAML version of the document");
    },
    TAG: function(te, ie, pe) {
      var ae, de;
      pe.length !== 2 && B(te, "TAG directive accepts exactly two arguments"), ae = pe[0], de = pe[1], v.test(ae) || B(te, "ill-formed tag handle (first argument) of the TAG directive"), l.call(te.tagMap, ae) && B(te, 'there is a previously declared suffix for "' + ae + '" tag handle'), h.test(de) || B(te, "ill-formed tag prefix (second argument) of the TAG directive");
      try {
        de = decodeURIComponent(de);
      } catch {
        B(te, "tag prefix is malformed: " + de);
      }
      te.tagMap[ae] = de;
    }
  };
  function V(S, te, ie, pe) {
    var ae, de, le, me;
    if (te < ie) {
      if (me = S.input.slice(te, ie), pe)
        for (ae = 0, de = me.length; ae < de; ae += 1)
          le = me.charCodeAt(ae), le === 9 || 32 <= le && le <= 1114111 || B(S, "expected valid JSON character");
      else f.test(me) && B(S, "the stream contains non-printable characters");
      S.result += me;
    }
  }
  function C(S, te, ie, pe) {
    var ae, de, le, me;
    for (e.isObject(ie) || B(S, "cannot merge mappings; the provided source object is unacceptable"), ae = Object.keys(ie), le = 0, me = ae.length; le < me; le += 1)
      de = ae[le], l.call(te, de) || (q(te, de, ie[de]), pe[de] = !0);
  }
  function j(S, te, ie, pe, ae, de, le, me, ve) {
    var qe, Fe;
    if (Array.isArray(ae))
      for (ae = Array.prototype.slice.call(ae), qe = 0, Fe = ae.length; qe < Fe; qe += 1)
        Array.isArray(ae[qe]) && B(S, "nested arrays are not supported inside keys"), typeof ae == "object" && g(ae[qe]) === "[object Object]" && (ae[qe] = "[object Object]");
    if (typeof ae == "object" && g(ae) === "[object Object]" && (ae = "[object Object]"), ae = String(ae), te === null && (te = {}), pe === "tag:yaml.org,2002:merge")
      if (Array.isArray(de))
        for (qe = 0, Fe = de.length; qe < Fe; qe += 1)
          C(S, te, de[qe], ie);
      else
        C(S, te, de, ie);
    else
      !S.json && !l.call(ie, ae) && l.call(te, ae) && (S.line = le || S.line, S.lineStart = me || S.lineStart, S.position = ve || S.position, B(S, "duplicated mapping key")), q(te, ae, de), delete ie[ae];
    return te;
  }
  function D(S) {
    var te;
    te = S.input.charCodeAt(S.position), te === 10 ? S.position++ : te === 13 ? (S.position++, S.input.charCodeAt(S.position) === 10 && S.position++) : B(S, "a line break is expected"), S.line += 1, S.lineStart = S.position, S.firstTabInLine = -1;
  }
  function R(S, te, ie) {
    for (var pe = 0, ae = S.input.charCodeAt(S.position); ae !== 0; ) {
      for (; E(ae); )
        ae === 9 && S.firstTabInLine === -1 && (S.firstTabInLine = S.position), ae = S.input.charCodeAt(++S.position);
      if (te && ae === 35)
        do
          ae = S.input.charCodeAt(++S.position);
        while (ae !== 10 && ae !== 13 && ae !== 0);
      if (p(ae))
        for (D(S), ae = S.input.charCodeAt(S.position), pe++, S.lineIndent = 0; ae === 32; )
          S.lineIndent++, ae = S.input.charCodeAt(++S.position);
      else
        break;
    }
    return ie !== -1 && pe !== 0 && S.lineIndent < ie && W(S, "deficient indentation"), pe;
  }
  function N(S) {
    var te = S.position, ie;
    return ie = S.input.charCodeAt(te), !!((ie === 45 || ie === 46) && ie === S.input.charCodeAt(te + 1) && ie === S.input.charCodeAt(te + 2) && (te += 3, ie = S.input.charCodeAt(te), ie === 0 || b(ie)));
  }
  function x(S, te) {
    te === 1 ? S.result += " " : te > 1 && (S.result += e.repeat(`
`, te - 1));
  }
  function O(S, te, ie) {
    var pe, ae, de, le, me, ve, qe, Fe, $e = S.kind, U = S.result, ne;
    if (ne = S.input.charCodeAt(S.position), b(ne) || $(ne) || ne === 35 || ne === 38 || ne === 42 || ne === 33 || ne === 124 || ne === 62 || ne === 39 || ne === 34 || ne === 37 || ne === 64 || ne === 96 || (ne === 63 || ne === 45) && (ae = S.input.charCodeAt(S.position + 1), b(ae) || ie && $(ae)))
      return !1;
    for (S.kind = "scalar", S.result = "", de = le = S.position, me = !1; ne !== 0; ) {
      if (ne === 58) {
        if (ae = S.input.charCodeAt(S.position + 1), b(ae) || ie && $(ae))
          break;
      } else if (ne === 35) {
        if (pe = S.input.charCodeAt(S.position - 1), b(pe))
          break;
      } else {
        if (S.position === S.lineStart && N(S) || ie && $(ne))
          break;
        if (p(ne))
          if (ve = S.line, qe = S.lineStart, Fe = S.lineIndent, R(S, !1, -1), S.lineIndent >= te) {
            me = !0, ne = S.input.charCodeAt(S.position);
            continue;
          } else {
            S.position = le, S.line = ve, S.lineStart = qe, S.lineIndent = Fe;
            break;
          }
      }
      me && (V(S, de, le, !1), x(S, S.line - ve), de = le = S.position, me = !1), E(ne) || (le = S.position + 1), ne = S.input.charCodeAt(++S.position);
    }
    return V(S, de, le, !1), S.result ? !0 : (S.kind = $e, S.result = U, !1);
  }
  function I(S, te) {
    var ie, pe, ae;
    if (ie = S.input.charCodeAt(S.position), ie !== 39)
      return !1;
    for (S.kind = "scalar", S.result = "", S.position++, pe = ae = S.position; (ie = S.input.charCodeAt(S.position)) !== 0; )
      if (ie === 39)
        if (V(S, pe, S.position, !0), ie = S.input.charCodeAt(++S.position), ie === 39)
          pe = S.position, S.position++, ae = S.position;
        else
          return !0;
      else p(ie) ? (V(S, pe, ae, !0), x(S, R(S, !1, te)), pe = ae = S.position) : S.position === S.lineStart && N(S) ? B(S, "unexpected end of the document within a single quoted scalar") : (S.position++, ae = S.position);
    B(S, "unexpected end of the stream within a single quoted scalar");
  }
  function Q(S, te) {
    var ie, pe, ae, de, le, me;
    if (me = S.input.charCodeAt(S.position), me !== 34)
      return !1;
    for (S.kind = "scalar", S.result = "", S.position++, ie = pe = S.position; (me = S.input.charCodeAt(S.position)) !== 0; ) {
      if (me === 34)
        return V(S, ie, S.position, !0), S.position++, !0;
      if (me === 92) {
        if (V(S, ie, S.position, !0), me = S.input.charCodeAt(++S.position), p(me))
          R(S, !1, te);
        else if (me < 256 && M[me])
          S.result += K[me], S.position++;
        else if ((le = w(me)) > 0) {
          for (ae = le, de = 0; ae > 0; ae--)
            me = S.input.charCodeAt(++S.position), (le = _(me)) >= 0 ? de = (de << 4) + le : B(S, "expected hexadecimal character");
          S.result += G(de), S.position++;
        } else
          B(S, "unknown escape sequence");
        ie = pe = S.position;
      } else p(me) ? (V(S, ie, pe, !0), x(S, R(S, !1, te)), ie = pe = S.position) : S.position === S.lineStart && N(S) ? B(S, "unexpected end of the document within a double quoted scalar") : (S.position++, pe = S.position);
    }
    B(S, "unexpected end of the stream within a double quoted scalar");
  }
  function H(S, te) {
    var ie = !0, pe, ae, de, le = S.tag, me, ve = S.anchor, qe, Fe, $e, U, ne, se = /* @__PURE__ */ Object.create(null), oe, ce, ge, he;
    if (he = S.input.charCodeAt(S.position), he === 91)
      Fe = 93, ne = !1, me = [];
    else if (he === 123)
      Fe = 125, ne = !0, me = {};
    else
      return !1;
    for (S.anchor !== null && (S.anchorMap[S.anchor] = me), he = S.input.charCodeAt(++S.position); he !== 0; ) {
      if (R(S, !0, te), he = S.input.charCodeAt(S.position), he === Fe)
        return S.position++, S.tag = le, S.anchor = ve, S.kind = ne ? "mapping" : "sequence", S.result = me, !0;
      ie ? he === 44 && B(S, "expected the node content, but found ','") : B(S, "missed comma between flow collection entries"), ce = oe = ge = null, $e = U = !1, he === 63 && (qe = S.input.charCodeAt(S.position + 1), b(qe) && ($e = U = !0, S.position++, R(S, !0, te))), pe = S.line, ae = S.lineStart, de = S.position, ye(S, te, r, !1, !0), ce = S.tag, oe = S.result, R(S, !0, te), he = S.input.charCodeAt(S.position), (U || S.line === pe) && he === 58 && ($e = !0, he = S.input.charCodeAt(++S.position), R(S, !0, te), ye(S, te, r, !1, !0), ge = S.result), ne ? j(S, me, se, ce, oe, ge, pe, ae, de) : $e ? me.push(j(S, null, se, ce, oe, ge, pe, ae, de)) : me.push(oe), R(S, !0, te), he = S.input.charCodeAt(S.position), he === 44 ? (ie = !0, he = S.input.charCodeAt(++S.position)) : ie = !1;
    }
    B(S, "unexpected end of the stream within a flow collection");
  }
  function A(S, te) {
    var ie, pe, ae = c, de = !1, le = !1, me = te, ve = 0, qe = !1, Fe, $e;
    if ($e = S.input.charCodeAt(S.position), $e === 124)
      pe = !1;
    else if ($e === 62)
      pe = !0;
    else
      return !1;
    for (S.kind = "scalar", S.result = ""; $e !== 0; )
      if ($e = S.input.charCodeAt(++S.position), $e === 43 || $e === 45)
        c === ae ? ae = $e === 43 ? d : s : B(S, "repeat of a chomping mode identifier");
      else if ((Fe = T($e)) >= 0)
        Fe === 0 ? B(S, "bad explicit indentation width of a block scalar; it cannot be less than one") : le ? B(S, "repeat of an indentation width identifier") : (me = te + Fe - 1, le = !0);
      else
        break;
    if (E($e)) {
      do
        $e = S.input.charCodeAt(++S.position);
      while (E($e));
      if ($e === 35)
        do
          $e = S.input.charCodeAt(++S.position);
        while (!p($e) && $e !== 0);
    }
    for (; $e !== 0; ) {
      for (D(S), S.lineIndent = 0, $e = S.input.charCodeAt(S.position); (!le || S.lineIndent < me) && $e === 32; )
        S.lineIndent++, $e = S.input.charCodeAt(++S.position);
      if (!le && S.lineIndent > me && (me = S.lineIndent), p($e)) {
        ve++;
        continue;
      }
      if (S.lineIndent < me) {
        ae === d ? S.result += e.repeat(`
`, de ? 1 + ve : ve) : ae === c && de && (S.result += `
`);
        break;
      }
      for (pe ? E($e) ? (qe = !0, S.result += e.repeat(`
`, de ? 1 + ve : ve)) : qe ? (qe = !1, S.result += e.repeat(`
`, ve + 1)) : ve === 0 ? de && (S.result += " ") : S.result += e.repeat(`
`, ve) : S.result += e.repeat(`
`, de ? 1 + ve : ve), de = !0, le = !0, ve = 0, ie = S.position; !p($e) && $e !== 0; )
        $e = S.input.charCodeAt(++S.position);
      V(S, ie, S.position, !1);
    }
    return !0;
  }
  function L(S, te) {
    var ie, pe = S.tag, ae = S.anchor, de = [], le, me = !1, ve;
    if (S.firstTabInLine !== -1) return !1;
    for (S.anchor !== null && (S.anchorMap[S.anchor] = de), ve = S.input.charCodeAt(S.position); ve !== 0 && (S.firstTabInLine !== -1 && (S.position = S.firstTabInLine, B(S, "tab characters must not be used in indentation")), !(ve !== 45 || (le = S.input.charCodeAt(S.position + 1), !b(le)))); ) {
      if (me = !0, S.position++, R(S, !0, -1) && S.lineIndent <= te) {
        de.push(null), ve = S.input.charCodeAt(S.position);
        continue;
      }
      if (ie = S.line, ye(S, te, u, !1, !0), de.push(S.result), R(S, !0, -1), ve = S.input.charCodeAt(S.position), (S.line === ie || S.lineIndent > te) && ve !== 0)
        B(S, "bad indentation of a sequence entry");
      else if (S.lineIndent < te)
        break;
    }
    return me ? (S.tag = pe, S.anchor = ae, S.kind = "sequence", S.result = de, !0) : !1;
  }
  function X(S, te, ie) {
    var pe, ae, de, le, me, ve, qe = S.tag, Fe = S.anchor, $e = {}, U = /* @__PURE__ */ Object.create(null), ne = null, se = null, oe = null, ce = !1, ge = !1, he;
    if (S.firstTabInLine !== -1) return !1;
    for (S.anchor !== null && (S.anchorMap[S.anchor] = $e), he = S.input.charCodeAt(S.position); he !== 0; ) {
      if (!ce && S.firstTabInLine !== -1 && (S.position = S.firstTabInLine, B(S, "tab characters must not be used in indentation")), pe = S.input.charCodeAt(S.position + 1), de = S.line, (he === 63 || he === 58) && b(pe))
        he === 63 ? (ce && (j(S, $e, U, ne, se, null, le, me, ve), ne = se = oe = null), ge = !0, ce = !0, ae = !0) : ce ? (ce = !1, ae = !0) : B(S, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), S.position += 1, he = pe;
      else {
        if (le = S.line, me = S.lineStart, ve = S.position, !ye(S, ie, i, !1, !0))
          break;
        if (S.line === de) {
          for (he = S.input.charCodeAt(S.position); E(he); )
            he = S.input.charCodeAt(++S.position);
          if (he === 58)
            he = S.input.charCodeAt(++S.position), b(he) || B(S, "a whitespace character is expected after the key-value separator within a block mapping"), ce && (j(S, $e, U, ne, se, null, le, me, ve), ne = se = oe = null), ge = !0, ce = !1, ae = !1, ne = S.tag, se = S.result;
          else if (ge)
            B(S, "can not read an implicit mapping pair; a colon is missed");
          else
            return S.tag = qe, S.anchor = Fe, !0;
        } else if (ge)
          B(S, "can not read a block mapping entry; a multiline key may not be an implicit key");
        else
          return S.tag = qe, S.anchor = Fe, !0;
      }
      if ((S.line === de || S.lineIndent > te) && (ce && (le = S.line, me = S.lineStart, ve = S.position), ye(S, te, o, !0, ae) && (ce ? se = S.result : oe = S.result), ce || (j(S, $e, U, ne, se, oe, le, me, ve), ne = se = oe = null), R(S, !0, -1), he = S.input.charCodeAt(S.position)), (S.line === de || S.lineIndent > te) && he !== 0)
        B(S, "bad indentation of a mapping entry");
      else if (S.lineIndent < te)
        break;
    }
    return ce && j(S, $e, U, ne, se, null, le, me, ve), ge && (S.tag = qe, S.anchor = Fe, S.kind = "mapping", S.result = $e), ge;
  }
  function J(S) {
    var te, ie = !1, pe = !1, ae, de, le;
    if (le = S.input.charCodeAt(S.position), le !== 33) return !1;
    if (S.tag !== null && B(S, "duplication of a tag property"), le = S.input.charCodeAt(++S.position), le === 60 ? (ie = !0, le = S.input.charCodeAt(++S.position)) : le === 33 ? (pe = !0, ae = "!!", le = S.input.charCodeAt(++S.position)) : ae = "!", te = S.position, ie) {
      do
        le = S.input.charCodeAt(++S.position);
      while (le !== 0 && le !== 62);
      S.position < S.length ? (de = S.input.slice(te, S.position), le = S.input.charCodeAt(++S.position)) : B(S, "unexpected end of the stream within a verbatim tag");
    } else {
      for (; le !== 0 && !b(le); )
        le === 33 && (pe ? B(S, "tag suffix cannot contain exclamation marks") : (ae = S.input.slice(te - 1, S.position + 1), v.test(ae) || B(S, "named tag handle cannot contain such characters"), pe = !0, te = S.position + 1)), le = S.input.charCodeAt(++S.position);
      de = S.input.slice(te, S.position), y.test(de) && B(S, "tag suffix cannot contain flow indicator characters");
    }
    de && !h.test(de) && B(S, "tag name cannot contain such characters: " + de);
    try {
      de = decodeURIComponent(de);
    } catch {
      B(S, "tag name is malformed: " + de);
    }
    return ie ? S.tag = de : l.call(S.tagMap, ae) ? S.tag = S.tagMap[ae] + de : ae === "!" ? S.tag = "!" + de : ae === "!!" ? S.tag = "tag:yaml.org,2002:" + de : B(S, 'undeclared tag handle "' + ae + '"'), !0;
  }
  function re(S) {
    var te, ie;
    if (ie = S.input.charCodeAt(S.position), ie !== 38) return !1;
    for (S.anchor !== null && B(S, "duplication of an anchor property"), ie = S.input.charCodeAt(++S.position), te = S.position; ie !== 0 && !b(ie) && !$(ie); )
      ie = S.input.charCodeAt(++S.position);
    return S.position === te && B(S, "name of an anchor node must contain at least one character"), S.anchor = S.input.slice(te, S.position), !0;
  }
  function fe(S) {
    var te, ie, pe;
    if (pe = S.input.charCodeAt(S.position), pe !== 42) return !1;
    for (pe = S.input.charCodeAt(++S.position), te = S.position; pe !== 0 && !b(pe) && !$(pe); )
      pe = S.input.charCodeAt(++S.position);
    return S.position === te && B(S, "name of an alias node must contain at least one character"), ie = S.input.slice(te, S.position), l.call(S.anchorMap, ie) || B(S, 'unidentified alias "' + ie + '"'), S.result = S.anchorMap[ie], R(S, !0, -1), !0;
  }
  function ye(S, te, ie, pe, ae) {
    var de, le, me, ve = 1, qe = !1, Fe = !1, $e, U, ne, se, oe, ce;
    if (S.listener !== null && S.listener("open", S), S.tag = null, S.anchor = null, S.kind = null, S.result = null, de = le = me = o === ie || u === ie, pe && R(S, !0, -1) && (qe = !0, S.lineIndent > te ? ve = 1 : S.lineIndent === te ? ve = 0 : S.lineIndent < te && (ve = -1)), ve === 1)
      for (; J(S) || re(S); )
        R(S, !0, -1) ? (qe = !0, me = de, S.lineIndent > te ? ve = 1 : S.lineIndent === te ? ve = 0 : S.lineIndent < te && (ve = -1)) : me = !1;
    if (me && (me = qe || ae), (ve === 1 || o === ie) && (r === ie || i === ie ? oe = te : oe = te + 1, ce = S.position - S.lineStart, ve === 1 ? me && (L(S, ce) || X(S, ce, oe)) || H(S, oe) ? Fe = !0 : (le && A(S, oe) || I(S, oe) || Q(S, oe) ? Fe = !0 : fe(S) ? (Fe = !0, (S.tag !== null || S.anchor !== null) && B(S, "alias node should not have any properties")) : O(S, oe, r === ie) && (Fe = !0, S.tag === null && (S.tag = "?")), S.anchor !== null && (S.anchorMap[S.anchor] = S.result)) : ve === 0 && (Fe = me && L(S, ce))), S.tag === null)
      S.anchor !== null && (S.anchorMap[S.anchor] = S.result);
    else if (S.tag === "?") {
      for (S.result !== null && S.kind !== "scalar" && B(S, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + S.kind + '"'), $e = 0, U = S.implicitTypes.length; $e < U; $e += 1)
        if (se = S.implicitTypes[$e], se.resolve(S.result)) {
          S.result = se.construct(S.result), S.tag = se.tag, S.anchor !== null && (S.anchorMap[S.anchor] = S.result);
          break;
        }
    } else if (S.tag !== "!") {
      if (l.call(S.typeMap[S.kind || "fallback"], S.tag))
        se = S.typeMap[S.kind || "fallback"][S.tag];
      else
        for (se = null, ne = S.typeMap.multi[S.kind || "fallback"], $e = 0, U = ne.length; $e < U; $e += 1)
          if (S.tag.slice(0, ne[$e].tag.length) === ne[$e].tag) {
            se = ne[$e];
            break;
          }
      se || B(S, "unknown tag !<" + S.tag + ">"), S.result !== null && se.kind !== S.kind && B(S, "unacceptable node kind for !<" + S.tag + '> tag; it should be "' + se.kind + '", not "' + S.kind + '"'), se.resolve(S.result, S.tag) ? (S.result = se.construct(S.result, S.tag), S.anchor !== null && (S.anchorMap[S.anchor] = S.result)) : B(S, "cannot resolve a node with !<" + S.tag + "> explicit tag");
    }
    return S.listener !== null && S.listener("close", S), S.tag !== null || S.anchor !== null || Fe;
  }
  function Ie(S) {
    var te = S.position, ie, pe, ae, de = !1, le;
    for (S.version = null, S.checkLineBreaks = S.legacy, S.tagMap = /* @__PURE__ */ Object.create(null), S.anchorMap = /* @__PURE__ */ Object.create(null); (le = S.input.charCodeAt(S.position)) !== 0 && (R(S, !0, -1), le = S.input.charCodeAt(S.position), !(S.lineIndent > 0 || le !== 37)); ) {
      for (de = !0, le = S.input.charCodeAt(++S.position), ie = S.position; le !== 0 && !b(le); )
        le = S.input.charCodeAt(++S.position);
      for (pe = S.input.slice(ie, S.position), ae = [], pe.length < 1 && B(S, "directive name must not be less than one character in length"); le !== 0; ) {
        for (; E(le); )
          le = S.input.charCodeAt(++S.position);
        if (le === 35) {
          do
            le = S.input.charCodeAt(++S.position);
          while (le !== 0 && !p(le));
          break;
        }
        if (p(le)) break;
        for (ie = S.position; le !== 0 && !b(le); )
          le = S.input.charCodeAt(++S.position);
        ae.push(S.input.slice(ie, S.position));
      }
      le !== 0 && D(S), l.call(Z, pe) ? Z[pe](S, pe, ae) : W(S, 'unknown document directive "' + pe + '"');
    }
    if (R(S, !0, -1), S.lineIndent === 0 && S.input.charCodeAt(S.position) === 45 && S.input.charCodeAt(S.position + 1) === 45 && S.input.charCodeAt(S.position + 2) === 45 ? (S.position += 3, R(S, !0, -1)) : de && B(S, "directives end mark is expected"), ye(S, S.lineIndent - 1, o, !1, !0), R(S, !0, -1), S.checkLineBreaks && m.test(S.input.slice(te, S.position)) && W(S, "non-ASCII line breaks are interpreted as content"), S.documents.push(S.result), S.position === S.lineStart && N(S)) {
      S.input.charCodeAt(S.position) === 46 && (S.position += 3, R(S, !0, -1));
      return;
    }
    if (S.position < S.length - 1)
      B(S, "end of the stream or a document separator is expected");
    else
      return;
  }
  function ke(S, te) {
    S = String(S), te = te || {}, S.length !== 0 && (S.charCodeAt(S.length - 1) !== 10 && S.charCodeAt(S.length - 1) !== 13 && (S += `
`), S.charCodeAt(0) === 65279 && (S = S.slice(1)));
    var ie = new F(S, te), pe = S.indexOf("\0");
    for (pe !== -1 && (ie.position = pe, B(ie, "null byte is not allowed in input")), ie.input += "\0"; ie.input.charCodeAt(ie.position) === 32; )
      ie.lineIndent += 1, ie.position += 1;
    for (; ie.position < ie.length - 1; )
      Ie(ie);
    return ie.documents;
  }
  function Oe(S, te, ie) {
    te !== null && typeof te == "object" && typeof ie > "u" && (ie = te, te = null);
    var pe = ke(S, ie);
    if (typeof te != "function")
      return pe;
    for (var ae = 0, de = pe.length; ae < de; ae += 1)
      te(pe[ae]);
  }
  function Se(S, te) {
    var ie = ke(S, te);
    if (ie.length !== 0) {
      if (ie.length === 1)
        return ie[0];
      throw new t("expected a single document in the stream, but found more");
    }
  }
  return ei.loadAll = Oe, ei.load = Se, ei;
}
var Ao = {}, cd;
function S_() {
  if (cd) return Ao;
  cd = 1;
  var e = Ln(), t = qn(), a = Qu(), n = Object.prototype.toString, l = Object.prototype.hasOwnProperty, r = 65279, i = 9, u = 10, o = 13, c = 32, s = 33, d = 34, f = 35, m = 37, y = 38, v = 39, h = 42, g = 44, p = 45, E = 58, b = 61, $ = 62, _ = 63, w = 64, T = 91, P = 93, G = 96, q = 123, M = 124, K = 125, k = {};
  k[0] = "\\0", k[7] = "\\a", k[8] = "\\b", k[9] = "\\t", k[10] = "\\n", k[11] = "\\v", k[12] = "\\f", k[13] = "\\r", k[27] = "\\e", k[34] = '\\"', k[92] = "\\\\", k[133] = "\\N", k[160] = "\\_", k[8232] = "\\L", k[8233] = "\\P";
  var F = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
  ], Y = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  function B(U, ne) {
    var se, oe, ce, ge, he, _e, we;
    if (ne === null) return {};
    for (se = {}, oe = Object.keys(ne), ce = 0, ge = oe.length; ce < ge; ce += 1)
      he = oe[ce], _e = String(ne[he]), he.slice(0, 2) === "!!" && (he = "tag:yaml.org,2002:" + he.slice(2)), we = U.compiledTypeMap.fallback[he], we && l.call(we.styleAliases, _e) && (_e = we.styleAliases[_e]), se[he] = _e;
    return se;
  }
  function W(U) {
    var ne, se, oe;
    if (ne = U.toString(16).toUpperCase(), U <= 255)
      se = "x", oe = 2;
    else if (U <= 65535)
      se = "u", oe = 4;
    else if (U <= 4294967295)
      se = "U", oe = 8;
    else
      throw new t("code point within a string may not be greater than 0xFFFFFFFF");
    return "\\" + se + e.repeat("0", oe - ne.length) + ne;
  }
  var Z = 1, V = 2;
  function C(U) {
    this.schema = U.schema || a, this.indent = Math.max(1, U.indent || 2), this.noArrayIndent = U.noArrayIndent || !1, this.skipInvalid = U.skipInvalid || !1, this.flowLevel = e.isNothing(U.flowLevel) ? -1 : U.flowLevel, this.styleMap = B(this.schema, U.styles || null), this.sortKeys = U.sortKeys || !1, this.lineWidth = U.lineWidth || 80, this.noRefs = U.noRefs || !1, this.noCompatMode = U.noCompatMode || !1, this.condenseFlow = U.condenseFlow || !1, this.quotingType = U.quotingType === '"' ? V : Z, this.forceQuotes = U.forceQuotes || !1, this.replacer = typeof U.replacer == "function" ? U.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
  }
  function j(U, ne) {
    for (var se = e.repeat(" ", ne), oe = 0, ce = -1, ge = "", he, _e = U.length; oe < _e; )
      ce = U.indexOf(`
`, oe), ce === -1 ? (he = U.slice(oe), oe = _e) : (he = U.slice(oe, ce + 1), oe = ce + 1), he.length && he !== `
` && (ge += se), ge += he;
    return ge;
  }
  function D(U, ne) {
    return `
` + e.repeat(" ", U.indent * ne);
  }
  function R(U, ne) {
    var se, oe, ce;
    for (se = 0, oe = U.implicitTypes.length; se < oe; se += 1)
      if (ce = U.implicitTypes[se], ce.resolve(ne))
        return !0;
    return !1;
  }
  function N(U) {
    return U === c || U === i;
  }
  function x(U) {
    return 32 <= U && U <= 126 || 161 <= U && U <= 55295 && U !== 8232 && U !== 8233 || 57344 <= U && U <= 65533 && U !== r || 65536 <= U && U <= 1114111;
  }
  function O(U) {
    return x(U) && U !== r && U !== o && U !== u;
  }
  function I(U, ne, se) {
    var oe = O(U), ce = oe && !N(U);
    return (
      // ns-plain-safe
      (se ? (
        // c = flow-in
        oe
      ) : oe && U !== g && U !== T && U !== P && U !== q && U !== K) && U !== f && !(ne === E && !ce) || O(ne) && !N(ne) && U === f || ne === E && ce
    );
  }
  function Q(U) {
    return x(U) && U !== r && !N(U) && U !== p && U !== _ && U !== E && U !== g && U !== T && U !== P && U !== q && U !== K && U !== f && U !== y && U !== h && U !== s && U !== M && U !== b && U !== $ && U !== v && U !== d && U !== m && U !== w && U !== G;
  }
  function H(U) {
    return !N(U) && U !== E;
  }
  function A(U, ne) {
    var se = U.charCodeAt(ne), oe;
    return se >= 55296 && se <= 56319 && ne + 1 < U.length && (oe = U.charCodeAt(ne + 1), oe >= 56320 && oe <= 57343) ? (se - 55296) * 1024 + oe - 56320 + 65536 : se;
  }
  function L(U) {
    var ne = /^\n* /;
    return ne.test(U);
  }
  var X = 1, J = 2, re = 3, fe = 4, ye = 5;
  function Ie(U, ne, se, oe, ce, ge, he, _e) {
    var we, be = 0, He = null, We = !1, Me = !1, Lr = oe !== -1, Tt = -1, hr = Q(A(U, 0)) && H(A(U, U.length - 1));
    if (ne || he)
      for (we = 0; we < U.length; be >= 65536 ? we += 2 : we++) {
        if (be = A(U, we), !x(be))
          return ye;
        hr = hr && I(be, He, _e), He = be;
      }
    else {
      for (we = 0; we < U.length; be >= 65536 ? we += 2 : we++) {
        if (be = A(U, we), be === u)
          We = !0, Lr && (Me = Me || // Foldable line = too long, and not more-indented.
          we - Tt - 1 > oe && U[Tt + 1] !== " ", Tt = we);
        else if (!x(be))
          return ye;
        hr = hr && I(be, He, _e), He = be;
      }
      Me = Me || Lr && we - Tt - 1 > oe && U[Tt + 1] !== " ";
    }
    return !We && !Me ? hr && !he && !ce(U) ? X : ge === V ? ye : J : se > 9 && L(U) ? ye : he ? ge === V ? ye : J : Me ? fe : re;
  }
  function ke(U, ne, se, oe, ce) {
    U.dump = (function() {
      if (ne.length === 0)
        return U.quotingType === V ? '""' : "''";
      if (!U.noCompatMode && (F.indexOf(ne) !== -1 || Y.test(ne)))
        return U.quotingType === V ? '"' + ne + '"' : "'" + ne + "'";
      var ge = U.indent * Math.max(1, se), he = U.lineWidth === -1 ? -1 : Math.max(Math.min(U.lineWidth, 40), U.lineWidth - ge), _e = oe || U.flowLevel > -1 && se >= U.flowLevel;
      function we(be) {
        return R(U, be);
      }
      switch (Ie(
        ne,
        _e,
        U.indent,
        he,
        we,
        U.quotingType,
        U.forceQuotes && !oe,
        ce
      )) {
        case X:
          return ne;
        case J:
          return "'" + ne.replace(/'/g, "''") + "'";
        case re:
          return "|" + Oe(ne, U.indent) + Se(j(ne, ge));
        case fe:
          return ">" + Oe(ne, U.indent) + Se(j(S(ne, he), ge));
        case ye:
          return '"' + ie(ne) + '"';
        default:
          throw new t("impossible error: invalid scalar style");
      }
    })();
  }
  function Oe(U, ne) {
    var se = L(U) ? String(ne) : "", oe = U[U.length - 1] === `
`, ce = oe && (U[U.length - 2] === `
` || U === `
`), ge = ce ? "+" : oe ? "" : "-";
    return se + ge + `
`;
  }
  function Se(U) {
    return U[U.length - 1] === `
` ? U.slice(0, -1) : U;
  }
  function S(U, ne) {
    for (var se = /(\n+)([^\n]*)/g, oe = (function() {
      var be = U.indexOf(`
`);
      return be = be !== -1 ? be : U.length, se.lastIndex = be, te(U.slice(0, be), ne);
    })(), ce = U[0] === `
` || U[0] === " ", ge, he; he = se.exec(U); ) {
      var _e = he[1], we = he[2];
      ge = we[0] === " ", oe += _e + (!ce && !ge && we !== "" ? `
` : "") + te(we, ne), ce = ge;
    }
    return oe;
  }
  function te(U, ne) {
    if (U === "" || U[0] === " ") return U;
    for (var se = / [^ ]/g, oe, ce = 0, ge, he = 0, _e = 0, we = ""; oe = se.exec(U); )
      _e = oe.index, _e - ce > ne && (ge = he > ce ? he : _e, we += `
` + U.slice(ce, ge), ce = ge + 1), he = _e;
    return we += `
`, U.length - ce > ne && he > ce ? we += U.slice(ce, he) + `
` + U.slice(he + 1) : we += U.slice(ce), we.slice(1);
  }
  function ie(U) {
    for (var ne = "", se = 0, oe, ce = 0; ce < U.length; se >= 65536 ? ce += 2 : ce++)
      se = A(U, ce), oe = k[se], !oe && x(se) ? (ne += U[ce], se >= 65536 && (ne += U[ce + 1])) : ne += oe || W(se);
    return ne;
  }
  function pe(U, ne, se) {
    var oe = "", ce = U.tag, ge, he, _e;
    for (ge = 0, he = se.length; ge < he; ge += 1)
      _e = se[ge], U.replacer && (_e = U.replacer.call(se, String(ge), _e)), (ve(U, ne, _e, !1, !1) || typeof _e > "u" && ve(U, ne, null, !1, !1)) && (oe !== "" && (oe += "," + (U.condenseFlow ? "" : " ")), oe += U.dump);
    U.tag = ce, U.dump = "[" + oe + "]";
  }
  function ae(U, ne, se, oe) {
    var ce = "", ge = U.tag, he, _e, we;
    for (he = 0, _e = se.length; he < _e; he += 1)
      we = se[he], U.replacer && (we = U.replacer.call(se, String(he), we)), (ve(U, ne + 1, we, !0, !0, !1, !0) || typeof we > "u" && ve(U, ne + 1, null, !0, !0, !1, !0)) && ((!oe || ce !== "") && (ce += D(U, ne)), U.dump && u === U.dump.charCodeAt(0) ? ce += "-" : ce += "- ", ce += U.dump);
    U.tag = ge, U.dump = ce || "[]";
  }
  function de(U, ne, se) {
    var oe = "", ce = U.tag, ge = Object.keys(se), he, _e, we, be, He;
    for (he = 0, _e = ge.length; he < _e; he += 1)
      He = "", oe !== "" && (He += ", "), U.condenseFlow && (He += '"'), we = ge[he], be = se[we], U.replacer && (be = U.replacer.call(se, we, be)), ve(U, ne, we, !1, !1) && (U.dump.length > 1024 && (He += "? "), He += U.dump + (U.condenseFlow ? '"' : "") + ":" + (U.condenseFlow ? "" : " "), ve(U, ne, be, !1, !1) && (He += U.dump, oe += He));
    U.tag = ce, U.dump = "{" + oe + "}";
  }
  function le(U, ne, se, oe) {
    var ce = "", ge = U.tag, he = Object.keys(se), _e, we, be, He, We, Me;
    if (U.sortKeys === !0)
      he.sort();
    else if (typeof U.sortKeys == "function")
      he.sort(U.sortKeys);
    else if (U.sortKeys)
      throw new t("sortKeys must be a boolean or a function");
    for (_e = 0, we = he.length; _e < we; _e += 1)
      Me = "", (!oe || ce !== "") && (Me += D(U, ne)), be = he[_e], He = se[be], U.replacer && (He = U.replacer.call(se, be, He)), ve(U, ne + 1, be, !0, !0, !0) && (We = U.tag !== null && U.tag !== "?" || U.dump && U.dump.length > 1024, We && (U.dump && u === U.dump.charCodeAt(0) ? Me += "?" : Me += "? "), Me += U.dump, We && (Me += D(U, ne)), ve(U, ne + 1, He, !0, We) && (U.dump && u === U.dump.charCodeAt(0) ? Me += ":" : Me += ": ", Me += U.dump, ce += Me));
    U.tag = ge, U.dump = ce || "{}";
  }
  function me(U, ne, se) {
    var oe, ce, ge, he, _e, we;
    for (ce = se ? U.explicitTypes : U.implicitTypes, ge = 0, he = ce.length; ge < he; ge += 1)
      if (_e = ce[ge], (_e.instanceOf || _e.predicate) && (!_e.instanceOf || typeof ne == "object" && ne instanceof _e.instanceOf) && (!_e.predicate || _e.predicate(ne))) {
        if (se ? _e.multi && _e.representName ? U.tag = _e.representName(ne) : U.tag = _e.tag : U.tag = "?", _e.represent) {
          if (we = U.styleMap[_e.tag] || _e.defaultStyle, n.call(_e.represent) === "[object Function]")
            oe = _e.represent(ne, we);
          else if (l.call(_e.represent, we))
            oe = _e.represent[we](ne, we);
          else
            throw new t("!<" + _e.tag + '> tag resolver accepts not "' + we + '" style');
          U.dump = oe;
        }
        return !0;
      }
    return !1;
  }
  function ve(U, ne, se, oe, ce, ge, he) {
    U.tag = null, U.dump = se, me(U, se, !1) || me(U, se, !0);
    var _e = n.call(U.dump), we = oe, be;
    oe && (oe = U.flowLevel < 0 || U.flowLevel > ne);
    var He = _e === "[object Object]" || _e === "[object Array]", We, Me;
    if (He && (We = U.duplicates.indexOf(se), Me = We !== -1), (U.tag !== null && U.tag !== "?" || Me || U.indent !== 2 && ne > 0) && (ce = !1), Me && U.usedDuplicates[We])
      U.dump = "*ref_" + We;
    else {
      if (He && Me && !U.usedDuplicates[We] && (U.usedDuplicates[We] = !0), _e === "[object Object]")
        oe && Object.keys(U.dump).length !== 0 ? (le(U, ne, U.dump, ce), Me && (U.dump = "&ref_" + We + U.dump)) : (de(U, ne, U.dump), Me && (U.dump = "&ref_" + We + " " + U.dump));
      else if (_e === "[object Array]")
        oe && U.dump.length !== 0 ? (U.noArrayIndent && !he && ne > 0 ? ae(U, ne - 1, U.dump, ce) : ae(U, ne, U.dump, ce), Me && (U.dump = "&ref_" + We + U.dump)) : (pe(U, ne, U.dump), Me && (U.dump = "&ref_" + We + " " + U.dump));
      else if (_e === "[object String]")
        U.tag !== "?" && ke(U, U.dump, ne, ge, we);
      else {
        if (_e === "[object Undefined]")
          return !1;
        if (U.skipInvalid) return !1;
        throw new t("unacceptable kind of an object to dump " + _e);
      }
      U.tag !== null && U.tag !== "?" && (be = encodeURI(
        U.tag[0] === "!" ? U.tag.slice(1) : U.tag
      ).replace(/!/g, "%21"), U.tag[0] === "!" ? be = "!" + be : be.slice(0, 18) === "tag:yaml.org,2002:" ? be = "!!" + be.slice(18) : be = "!<" + be + ">", U.dump = be + " " + U.dump);
    }
    return !0;
  }
  function qe(U, ne) {
    var se = [], oe = [], ce, ge;
    for (Fe(U, se, oe), ce = 0, ge = oe.length; ce < ge; ce += 1)
      ne.duplicates.push(se[oe[ce]]);
    ne.usedDuplicates = new Array(ge);
  }
  function Fe(U, ne, se) {
    var oe, ce, ge;
    if (U !== null && typeof U == "object")
      if (ce = ne.indexOf(U), ce !== -1)
        se.indexOf(ce) === -1 && se.push(ce);
      else if (ne.push(U), Array.isArray(U))
        for (ce = 0, ge = U.length; ce < ge; ce += 1)
          Fe(U[ce], ne, se);
      else
        for (oe = Object.keys(U), ce = 0, ge = oe.length; ce < ge; ce += 1)
          Fe(U[oe[ce]], ne, se);
  }
  function $e(U, ne) {
    ne = ne || {};
    var se = new C(ne);
    se.noRefs || qe(U, se);
    var oe = U;
    return se.replacer && (oe = se.replacer.call({ "": oe }, "", oe)), ve(se, 0, oe, !0, !0) ? se.dump + `
` : "";
  }
  return Ao.dump = $e, Ao;
}
var ud;
function Zu() {
  if (ud) return st;
  ud = 1;
  var e = $_(), t = S_();
  function a(n, l) {
    return function() {
      throw new Error("Function yaml." + n + " is removed in js-yaml 4. Use yaml." + l + " instead, which is now safe by default.");
    };
  }
  return st.Type = ht(), st.Schema = Ly(), st.FAILSAFE_SCHEMA = jy(), st.JSON_SCHEMA = By(), st.CORE_SCHEMA = Hy(), st.DEFAULT_SCHEMA = Qu(), st.load = e.load, st.loadAll = e.loadAll, st.dump = t.dump, st.YAMLException = qn(), st.types = {
    binary: Xy(),
    float: Gy(),
    map: Uy(),
    null: My(),
    pairs: Yy(),
    set: Jy(),
    timestamp: zy(),
    bool: xy(),
    int: Vy(),
    merge: Ky(),
    omap: Wy(),
    seq: Fy(),
    str: qy()
  }, st.safeLoad = a("safeLoad", "load"), st.safeLoadAll = a("safeLoadAll", "loadAll"), st.safeDump = a("safeDump", "dump"), st;
}
var un = {}, ld;
function b_() {
  if (ld) return un;
  ld = 1, Object.defineProperty(un, "__esModule", { value: !0 }), un.Lazy = void 0;
  class e {
    constructor(a) {
      this._value = null, this.creator = a;
    }
    get hasValue() {
      return this.creator == null;
    }
    get value() {
      if (this.creator == null)
        return this._value;
      const a = this.creator();
      return this.value = a, a;
    }
    set value(a) {
      this._value = a, this.creator = null;
    }
  }
  return un.Lazy = e, un;
}
var ti = { exports: {} }, Co, fd;
function rs() {
  if (fd) return Co;
  fd = 1;
  const e = "2.0.0", t = 256, a = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, l = t - 6;
  return Co = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: a,
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
  }, Co;
}
var Do, dd;
function ns() {
  return dd || (dd = 1, Do = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Do;
}
var hd;
function Fn() {
  return hd || (hd = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: a,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: l
    } = rs(), r = ns();
    t = e.exports = {};
    const i = t.re = [], u = t.safeRe = [], o = t.src = [], c = t.safeSrc = [], s = t.t = {};
    let d = 0;
    const f = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", l],
      [f, n]
    ], y = (h) => {
      for (const [g, p] of m)
        h = h.split(`${g}*`).join(`${g}{0,${p}}`).split(`${g}+`).join(`${g}{1,${p}}`);
      return h;
    }, v = (h, g, p) => {
      const E = y(g), b = d++;
      r(h, b, g), s[h] = b, o[b] = g, c[b] = E, i[b] = new RegExp(g, p ? "g" : void 0), u[b] = new RegExp(E, p ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${f}*`), v("MAINVERSION", `(${o[s.NUMERICIDENTIFIER]})\\.(${o[s.NUMERICIDENTIFIER]})\\.(${o[s.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${o[s.NUMERICIDENTIFIERLOOSE]})\\.(${o[s.NUMERICIDENTIFIERLOOSE]})\\.(${o[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${o[s.NONNUMERICIDENTIFIER]}|${o[s.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${o[s.NONNUMERICIDENTIFIER]}|${o[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${o[s.PRERELEASEIDENTIFIER]}(?:\\.${o[s.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${o[s.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[s.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${f}+`), v("BUILD", `(?:\\+(${o[s.BUILDIDENTIFIER]}(?:\\.${o[s.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${o[s.MAINVERSION]}${o[s.PRERELEASE]}?${o[s.BUILD]}?`), v("FULL", `^${o[s.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${o[s.MAINVERSIONLOOSE]}${o[s.PRERELEASELOOSE]}?${o[s.BUILD]}?`), v("LOOSE", `^${o[s.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${o[s.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${o[s.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${o[s.XRANGEIDENTIFIER]})(?:\\.(${o[s.XRANGEIDENTIFIER]})(?:\\.(${o[s.XRANGEIDENTIFIER]})(?:${o[s.PRERELEASE]})?${o[s.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${o[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[s.XRANGEIDENTIFIERLOOSE]})(?:${o[s.PRERELEASELOOSE]})?${o[s.BUILD]}?)?)?`), v("XRANGE", `^${o[s.GTLT]}\\s*${o[s.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${o[s.GTLT]}\\s*${o[s.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${a}})(?:\\.(\\d{1,${a}}))?(?:\\.(\\d{1,${a}}))?`), v("COERCE", `${o[s.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", o[s.COERCEPLAIN] + `(?:${o[s.PRERELEASE]})?(?:${o[s.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", o[s.COERCE], !0), v("COERCERTLFULL", o[s.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${o[s.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${o[s.LONETILDE]}${o[s.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${o[s.LONETILDE]}${o[s.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${o[s.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${o[s.LONECARET]}${o[s.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${o[s.LONECARET]}${o[s.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${o[s.GTLT]}\\s*(${o[s.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${o[s.GTLT]}\\s*(${o[s.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${o[s.GTLT]}\\s*(${o[s.LOOSEPLAIN]}|${o[s.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${o[s.XRANGEPLAIN]})\\s+-\\s+(${o[s.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${o[s.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[s.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(ti, ti.exports)), ti.exports;
}
var ko, pd;
function el() {
  if (pd) return ko;
  pd = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return ko = (n) => n ? typeof n != "object" ? e : n : t, ko;
}
var Lo, md;
function Qy() {
  if (md) return Lo;
  md = 1;
  const e = /^[0-9]+$/, t = (n, l) => {
    if (typeof n == "number" && typeof l == "number")
      return n === l ? 0 : n < l ? -1 : 1;
    const r = e.test(n), i = e.test(l);
    return r && i && (n = +n, l = +l), n === l ? 0 : r && !i ? -1 : i && !r ? 1 : n < l ? -1 : 1;
  };
  return Lo = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, l) => t(l, n)
  }, Lo;
}
var qo, gd;
function pt() {
  if (gd) return qo;
  gd = 1;
  const e = ns(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: a } = rs(), { safeRe: n, t: l } = Fn(), r = el(), { compareIdentifiers: i } = Qy();
  class u {
    constructor(c, s) {
      if (s = r(s), c instanceof u) {
        if (c.loose === !!s.loose && c.includePrerelease === !!s.includePrerelease)
          return c;
        c = c.version;
      } else if (typeof c != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof c}".`);
      if (c.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", c, s), this.options = s, this.loose = !!s.loose, this.includePrerelease = !!s.includePrerelease;
      const d = c.trim().match(s.loose ? n[l.LOOSE] : n[l.FULL]);
      if (!d)
        throw new TypeError(`Invalid Version: ${c}`);
      if (this.raw = c, this.major = +d[1], this.minor = +d[2], this.patch = +d[3], this.major > a || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > a || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > a || this.patch < 0)
        throw new TypeError("Invalid patch version");
      d[4] ? this.prerelease = d[4].split(".").map((f) => {
        if (/^[0-9]+$/.test(f)) {
          const m = +f;
          if (m >= 0 && m < a)
            return m;
        }
        return f;
      }) : this.prerelease = [], this.build = d[5] ? d[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(c) {
      if (e("SemVer.compare", this.version, this.options, c), !(c instanceof u)) {
        if (typeof c == "string" && c === this.version)
          return 0;
        c = new u(c, this.options);
      }
      return c.version === this.version ? 0 : this.compareMain(c) || this.comparePre(c);
    }
    compareMain(c) {
      return c instanceof u || (c = new u(c, this.options)), this.major < c.major ? -1 : this.major > c.major ? 1 : this.minor < c.minor ? -1 : this.minor > c.minor ? 1 : this.patch < c.patch ? -1 : this.patch > c.patch ? 1 : 0;
    }
    comparePre(c) {
      if (c instanceof u || (c = new u(c, this.options)), this.prerelease.length && !c.prerelease.length)
        return -1;
      if (!this.prerelease.length && c.prerelease.length)
        return 1;
      if (!this.prerelease.length && !c.prerelease.length)
        return 0;
      let s = 0;
      do {
        const d = this.prerelease[s], f = c.prerelease[s];
        if (e("prerelease compare", s, d, f), d === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (d === void 0)
          return -1;
        if (d === f)
          continue;
        return i(d, f);
      } while (++s);
    }
    compareBuild(c) {
      c instanceof u || (c = new u(c, this.options));
      let s = 0;
      do {
        const d = this.build[s], f = c.build[s];
        if (e("build compare", s, d, f), d === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (d === void 0)
          return -1;
        if (d === f)
          continue;
        return i(d, f);
      } while (++s);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(c, s, d) {
      if (c.startsWith("pre")) {
        if (!s && d === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (s) {
          const f = `-${s}`.match(this.options.loose ? n[l.PRERELEASELOOSE] : n[l.PRERELEASE]);
          if (!f || f[1] !== s)
            throw new Error(`invalid identifier: ${s}`);
        }
      }
      switch (c) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", s, d);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", s, d);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", s, d), this.inc("pre", s, d);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", s, d), this.inc("pre", s, d);
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
          const f = Number(d) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [f];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (s === this.prerelease.join(".") && d === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(f);
            }
          }
          if (s) {
            let m = [s, f];
            d === !1 && (m = [s]), i(this.prerelease[0], s) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${c}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return qo = u, qo;
}
var Fo, yd;
function Zr() {
  if (yd) return Fo;
  yd = 1;
  const e = pt();
  return Fo = (a, n, l = !1) => {
    if (a instanceof e)
      return a;
    try {
      return new e(a, n);
    } catch (r) {
      if (!l)
        return null;
      throw r;
    }
  }, Fo;
}
var Uo, vd;
function R_() {
  if (vd) return Uo;
  vd = 1;
  const e = Zr();
  return Uo = (a, n) => {
    const l = e(a, n);
    return l ? l.version : null;
  }, Uo;
}
var jo, _d;
function T_() {
  if (_d) return jo;
  _d = 1;
  const e = Zr();
  return jo = (a, n) => {
    const l = e(a.trim().replace(/^[=v]+/, ""), n);
    return l ? l.version : null;
  }, jo;
}
var Mo, Ed;
function P_() {
  if (Ed) return Mo;
  Ed = 1;
  const e = pt();
  return Mo = (a, n, l, r, i) => {
    typeof l == "string" && (i = r, r = l, l = void 0);
    try {
      return new e(
        a instanceof e ? a.version : a,
        l
      ).inc(n, r, i).version;
    } catch {
      return null;
    }
  }, Mo;
}
var xo, wd;
function N_() {
  if (wd) return xo;
  wd = 1;
  const e = Zr();
  return xo = (a, n) => {
    const l = e(a, null, !0), r = e(n, null, !0), i = l.compare(r);
    if (i === 0)
      return null;
    const u = i > 0, o = u ? l : r, c = u ? r : l, s = !!o.prerelease.length;
    if (!!c.prerelease.length && !s) {
      if (!c.patch && !c.minor)
        return "major";
      if (c.compareMain(o) === 0)
        return c.minor && !c.patch ? "minor" : "patch";
    }
    const f = s ? "pre" : "";
    return l.major !== r.major ? f + "major" : l.minor !== r.minor ? f + "minor" : l.patch !== r.patch ? f + "patch" : "prerelease";
  }, xo;
}
var Vo, $d;
function I_() {
  if ($d) return Vo;
  $d = 1;
  const e = pt();
  return Vo = (a, n) => new e(a, n).major, Vo;
}
var Go, Sd;
function O_() {
  if (Sd) return Go;
  Sd = 1;
  const e = pt();
  return Go = (a, n) => new e(a, n).minor, Go;
}
var Bo, bd;
function A_() {
  if (bd) return Bo;
  bd = 1;
  const e = pt();
  return Bo = (a, n) => new e(a, n).patch, Bo;
}
var Ho, Rd;
function C_() {
  if (Rd) return Ho;
  Rd = 1;
  const e = Zr();
  return Ho = (a, n) => {
    const l = e(a, n);
    return l && l.prerelease.length ? l.prerelease : null;
  }, Ho;
}
var zo, Td;
function Ct() {
  if (Td) return zo;
  Td = 1;
  const e = pt();
  return zo = (a, n, l) => new e(a, l).compare(new e(n, l)), zo;
}
var Ko, Pd;
function D_() {
  if (Pd) return Ko;
  Pd = 1;
  const e = Ct();
  return Ko = (a, n, l) => e(n, a, l), Ko;
}
var Xo, Nd;
function k_() {
  if (Nd) return Xo;
  Nd = 1;
  const e = Ct();
  return Xo = (a, n) => e(a, n, !0), Xo;
}
var Wo, Id;
function tl() {
  if (Id) return Wo;
  Id = 1;
  const e = pt();
  return Wo = (a, n, l) => {
    const r = new e(a, l), i = new e(n, l);
    return r.compare(i) || r.compareBuild(i);
  }, Wo;
}
var Yo, Od;
function L_() {
  if (Od) return Yo;
  Od = 1;
  const e = tl();
  return Yo = (a, n) => a.sort((l, r) => e(l, r, n)), Yo;
}
var Jo, Ad;
function q_() {
  if (Ad) return Jo;
  Ad = 1;
  const e = tl();
  return Jo = (a, n) => a.sort((l, r) => e(r, l, n)), Jo;
}
var Qo, Cd;
function is() {
  if (Cd) return Qo;
  Cd = 1;
  const e = Ct();
  return Qo = (a, n, l) => e(a, n, l) > 0, Qo;
}
var Zo, Dd;
function rl() {
  if (Dd) return Zo;
  Dd = 1;
  const e = Ct();
  return Zo = (a, n, l) => e(a, n, l) < 0, Zo;
}
var ec, kd;
function Zy() {
  if (kd) return ec;
  kd = 1;
  const e = Ct();
  return ec = (a, n, l) => e(a, n, l) === 0, ec;
}
var tc, Ld;
function e0() {
  if (Ld) return tc;
  Ld = 1;
  const e = Ct();
  return tc = (a, n, l) => e(a, n, l) !== 0, tc;
}
var rc, qd;
function nl() {
  if (qd) return rc;
  qd = 1;
  const e = Ct();
  return rc = (a, n, l) => e(a, n, l) >= 0, rc;
}
var nc, Fd;
function il() {
  if (Fd) return nc;
  Fd = 1;
  const e = Ct();
  return nc = (a, n, l) => e(a, n, l) <= 0, nc;
}
var ic, Ud;
function t0() {
  if (Ud) return ic;
  Ud = 1;
  const e = Zy(), t = e0(), a = is(), n = nl(), l = rl(), r = il();
  return ic = (u, o, c, s) => {
    switch (o) {
      case "===":
        return typeof u == "object" && (u = u.version), typeof c == "object" && (c = c.version), u === c;
      case "!==":
        return typeof u == "object" && (u = u.version), typeof c == "object" && (c = c.version), u !== c;
      case "":
      case "=":
      case "==":
        return e(u, c, s);
      case "!=":
        return t(u, c, s);
      case ">":
        return a(u, c, s);
      case ">=":
        return n(u, c, s);
      case "<":
        return l(u, c, s);
      case "<=":
        return r(u, c, s);
      default:
        throw new TypeError(`Invalid operator: ${o}`);
    }
  }, ic;
}
var ac, jd;
function F_() {
  if (jd) return ac;
  jd = 1;
  const e = pt(), t = Zr(), { safeRe: a, t: n } = Fn();
  return ac = (r, i) => {
    if (r instanceof e)
      return r;
    if (typeof r == "number" && (r = String(r)), typeof r != "string")
      return null;
    i = i || {};
    let u = null;
    if (!i.rtl)
      u = r.match(i.includePrerelease ? a[n.COERCEFULL] : a[n.COERCE]);
    else {
      const m = i.includePrerelease ? a[n.COERCERTLFULL] : a[n.COERCERTL];
      let y;
      for (; (y = m.exec(r)) && (!u || u.index + u[0].length !== r.length); )
        (!u || y.index + y[0].length !== u.index + u[0].length) && (u = y), m.lastIndex = y.index + y[1].length + y[2].length;
      m.lastIndex = -1;
    }
    if (u === null)
      return null;
    const o = u[2], c = u[3] || "0", s = u[4] || "0", d = i.includePrerelease && u[5] ? `-${u[5]}` : "", f = i.includePrerelease && u[6] ? `+${u[6]}` : "";
    return t(`${o}.${c}.${s}${d}${f}`, i);
  }, ac;
}
var sc, Md;
function U_() {
  if (Md) return sc;
  Md = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(a) {
      const n = this.map.get(a);
      if (n !== void 0)
        return this.map.delete(a), this.map.set(a, n), n;
    }
    delete(a) {
      return this.map.delete(a);
    }
    set(a, n) {
      if (!this.delete(a) && n !== void 0) {
        if (this.map.size >= this.max) {
          const r = this.map.keys().next().value;
          this.delete(r);
        }
        this.map.set(a, n);
      }
      return this;
    }
  }
  return sc = e, sc;
}
var oc, xd;
function Dt() {
  if (xd) return oc;
  xd = 1;
  const e = /\s+/g;
  class t {
    constructor(F, Y) {
      if (Y = l(Y), F instanceof t)
        return F.loose === !!Y.loose && F.includePrerelease === !!Y.includePrerelease ? F : new t(F.raw, Y);
      if (F instanceof r)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = Y, this.loose = !!Y.loose, this.includePrerelease = !!Y.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((B) => this.parseRange(B.trim())).filter((B) => B.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const B = this.set[0];
        if (this.set = this.set.filter((W) => !v(W[0])), this.set.length === 0)
          this.set = [B];
        else if (this.set.length > 1) {
          for (const W of this.set)
            if (W.length === 1 && h(W[0])) {
              this.set = [W];
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
          const Y = this.set[F];
          for (let B = 0; B < Y.length; B++)
            B > 0 && (this.formatted += " "), this.formatted += Y[B].toString().trim();
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
      const B = ((this.options.includePrerelease && m) | (this.options.loose && y)) + ":" + F, W = n.get(B);
      if (W)
        return W;
      const Z = this.options.loose, V = Z ? o[c.HYPHENRANGELOOSE] : o[c.HYPHENRANGE];
      F = F.replace(V, M(this.options.includePrerelease)), i("hyphen replace", F), F = F.replace(o[c.COMPARATORTRIM], s), i("comparator trim", F), F = F.replace(o[c.TILDETRIM], d), i("tilde trim", F), F = F.replace(o[c.CARETTRIM], f), i("caret trim", F);
      let C = F.split(" ").map((N) => p(N, this.options)).join(" ").split(/\s+/).map((N) => q(N, this.options));
      Z && (C = C.filter((N) => (i("loose invalid filter", N, this.options), !!N.match(o[c.COMPARATORLOOSE])))), i("range list", C);
      const j = /* @__PURE__ */ new Map(), D = C.map((N) => new r(N, this.options));
      for (const N of D) {
        if (v(N))
          return [N];
        j.set(N.value, N);
      }
      j.size > 1 && j.has("") && j.delete("");
      const R = [...j.values()];
      return n.set(B, R), R;
    }
    intersects(F, Y) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((B) => g(B, Y) && F.set.some((W) => g(W, Y) && B.every((Z) => W.every((V) => Z.intersects(V, Y)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new u(F, this.options);
        } catch {
          return !1;
        }
      for (let Y = 0; Y < this.set.length; Y++)
        if (K(this.set[Y], F, this.options))
          return !0;
      return !1;
    }
  }
  oc = t;
  const a = U_(), n = new a(), l = el(), r = as(), i = ns(), u = pt(), {
    safeRe: o,
    t: c,
    comparatorTrimReplace: s,
    tildeTrimReplace: d,
    caretTrimReplace: f
  } = Fn(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: y } = rs(), v = (k) => k.value === "<0.0.0-0", h = (k) => k.value === "", g = (k, F) => {
    let Y = !0;
    const B = k.slice();
    let W = B.pop();
    for (; Y && B.length; )
      Y = B.every((Z) => W.intersects(Z, F)), W = B.pop();
    return Y;
  }, p = (k, F) => (k = k.replace(o[c.BUILD], ""), i("comp", k, F), k = _(k, F), i("caret", k), k = b(k, F), i("tildes", k), k = T(k, F), i("xrange", k), k = G(k, F), i("stars", k), k), E = (k) => !k || k.toLowerCase() === "x" || k === "*", b = (k, F) => k.trim().split(/\s+/).map((Y) => $(Y, F)).join(" "), $ = (k, F) => {
    const Y = F.loose ? o[c.TILDELOOSE] : o[c.TILDE];
    return k.replace(Y, (B, W, Z, V, C) => {
      i("tilde", k, B, W, Z, V, C);
      let j;
      return E(W) ? j = "" : E(Z) ? j = `>=${W}.0.0 <${+W + 1}.0.0-0` : E(V) ? j = `>=${W}.${Z}.0 <${W}.${+Z + 1}.0-0` : C ? (i("replaceTilde pr", C), j = `>=${W}.${Z}.${V}-${C} <${W}.${+Z + 1}.0-0`) : j = `>=${W}.${Z}.${V} <${W}.${+Z + 1}.0-0`, i("tilde return", j), j;
    });
  }, _ = (k, F) => k.trim().split(/\s+/).map((Y) => w(Y, F)).join(" "), w = (k, F) => {
    i("caret", k, F);
    const Y = F.loose ? o[c.CARETLOOSE] : o[c.CARET], B = F.includePrerelease ? "-0" : "";
    return k.replace(Y, (W, Z, V, C, j) => {
      i("caret", k, W, Z, V, C, j);
      let D;
      return E(Z) ? D = "" : E(V) ? D = `>=${Z}.0.0${B} <${+Z + 1}.0.0-0` : E(C) ? Z === "0" ? D = `>=${Z}.${V}.0${B} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.0${B} <${+Z + 1}.0.0-0` : j ? (i("replaceCaret pr", j), Z === "0" ? V === "0" ? D = `>=${Z}.${V}.${C}-${j} <${Z}.${V}.${+C + 1}-0` : D = `>=${Z}.${V}.${C}-${j} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.${C}-${j} <${+Z + 1}.0.0-0`) : (i("no pr"), Z === "0" ? V === "0" ? D = `>=${Z}.${V}.${C}${B} <${Z}.${V}.${+C + 1}-0` : D = `>=${Z}.${V}.${C}${B} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.${C} <${+Z + 1}.0.0-0`), i("caret return", D), D;
    });
  }, T = (k, F) => (i("replaceXRanges", k, F), k.split(/\s+/).map((Y) => P(Y, F)).join(" ")), P = (k, F) => {
    k = k.trim();
    const Y = F.loose ? o[c.XRANGELOOSE] : o[c.XRANGE];
    return k.replace(Y, (B, W, Z, V, C, j) => {
      i("xRange", k, B, W, Z, V, C, j);
      const D = E(Z), R = D || E(V), N = R || E(C), x = N;
      return W === "=" && x && (W = ""), j = F.includePrerelease ? "-0" : "", D ? W === ">" || W === "<" ? B = "<0.0.0-0" : B = "*" : W && x ? (R && (V = 0), C = 0, W === ">" ? (W = ">=", R ? (Z = +Z + 1, V = 0, C = 0) : (V = +V + 1, C = 0)) : W === "<=" && (W = "<", R ? Z = +Z + 1 : V = +V + 1), W === "<" && (j = "-0"), B = `${W + Z}.${V}.${C}${j}`) : R ? B = `>=${Z}.0.0${j} <${+Z + 1}.0.0-0` : N && (B = `>=${Z}.${V}.0${j} <${Z}.${+V + 1}.0-0`), i("xRange return", B), B;
    });
  }, G = (k, F) => (i("replaceStars", k, F), k.trim().replace(o[c.STAR], "")), q = (k, F) => (i("replaceGTE0", k, F), k.trim().replace(o[F.includePrerelease ? c.GTE0PRE : c.GTE0], "")), M = (k) => (F, Y, B, W, Z, V, C, j, D, R, N, x) => (E(B) ? Y = "" : E(W) ? Y = `>=${B}.0.0${k ? "-0" : ""}` : E(Z) ? Y = `>=${B}.${W}.0${k ? "-0" : ""}` : V ? Y = `>=${Y}` : Y = `>=${Y}${k ? "-0" : ""}`, E(D) ? j = "" : E(R) ? j = `<${+D + 1}.0.0-0` : E(N) ? j = `<${D}.${+R + 1}.0-0` : x ? j = `<=${D}.${R}.${N}-${x}` : k ? j = `<${D}.${R}.${+N + 1}-0` : j = `<=${j}`, `${Y} ${j}`.trim()), K = (k, F, Y) => {
    for (let B = 0; B < k.length; B++)
      if (!k[B].test(F))
        return !1;
    if (F.prerelease.length && !Y.includePrerelease) {
      for (let B = 0; B < k.length; B++)
        if (i(k[B].semver), k[B].semver !== r.ANY && k[B].semver.prerelease.length > 0) {
          const W = k[B].semver;
          if (W.major === F.major && W.minor === F.minor && W.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return oc;
}
var cc, Vd;
function as() {
  if (Vd) return cc;
  Vd = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(s, d) {
      if (d = a(d), s instanceof t) {
        if (s.loose === !!d.loose)
          return s;
        s = s.value;
      }
      s = s.trim().split(/\s+/).join(" "), i("comparator", s, d), this.options = d, this.loose = !!d.loose, this.parse(s), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(s) {
      const d = this.options.loose ? n[l.COMPARATORLOOSE] : n[l.COMPARATOR], f = s.match(d);
      if (!f)
        throw new TypeError(`Invalid comparator: ${s}`);
      this.operator = f[1] !== void 0 ? f[1] : "", this.operator === "=" && (this.operator = ""), f[2] ? this.semver = new u(f[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(s) {
      if (i("Comparator.test", s, this.options.loose), this.semver === e || s === e)
        return !0;
      if (typeof s == "string")
        try {
          s = new u(s, this.options);
        } catch {
          return !1;
        }
      return r(s, this.operator, this.semver, this.options);
    }
    intersects(s, d) {
      if (!(s instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new o(s.value, d).test(this.value) : s.operator === "" ? s.value === "" ? !0 : new o(this.value, d).test(s.semver) : (d = a(d), d.includePrerelease && (this.value === "<0.0.0-0" || s.value === "<0.0.0-0") || !d.includePrerelease && (this.value.startsWith("<0.0.0") || s.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && s.operator.startsWith(">") || this.operator.startsWith("<") && s.operator.startsWith("<") || this.semver.version === s.semver.version && this.operator.includes("=") && s.operator.includes("=") || r(this.semver, "<", s.semver, d) && this.operator.startsWith(">") && s.operator.startsWith("<") || r(this.semver, ">", s.semver, d) && this.operator.startsWith("<") && s.operator.startsWith(">")));
    }
  }
  cc = t;
  const a = el(), { safeRe: n, t: l } = Fn(), r = t0(), i = ns(), u = pt(), o = Dt();
  return cc;
}
var uc, Gd;
function ss() {
  if (Gd) return uc;
  Gd = 1;
  const e = Dt();
  return uc = (a, n, l) => {
    try {
      n = new e(n, l);
    } catch {
      return !1;
    }
    return n.test(a);
  }, uc;
}
var lc, Bd;
function j_() {
  if (Bd) return lc;
  Bd = 1;
  const e = Dt();
  return lc = (a, n) => new e(a, n).set.map((l) => l.map((r) => r.value).join(" ").trim().split(" ")), lc;
}
var fc, Hd;
function M_() {
  if (Hd) return fc;
  Hd = 1;
  const e = pt(), t = Dt();
  return fc = (n, l, r) => {
    let i = null, u = null, o = null;
    try {
      o = new t(l, r);
    } catch {
      return null;
    }
    return n.forEach((c) => {
      o.test(c) && (!i || u.compare(c) === -1) && (i = c, u = new e(i, r));
    }), i;
  }, fc;
}
var dc, zd;
function x_() {
  if (zd) return dc;
  zd = 1;
  const e = pt(), t = Dt();
  return dc = (n, l, r) => {
    let i = null, u = null, o = null;
    try {
      o = new t(l, r);
    } catch {
      return null;
    }
    return n.forEach((c) => {
      o.test(c) && (!i || u.compare(c) === 1) && (i = c, u = new e(i, r));
    }), i;
  }, dc;
}
var hc, Kd;
function V_() {
  if (Kd) return hc;
  Kd = 1;
  const e = pt(), t = Dt(), a = is();
  return hc = (l, r) => {
    l = new t(l, r);
    let i = new e("0.0.0");
    if (l.test(i) || (i = new e("0.0.0-0"), l.test(i)))
      return i;
    i = null;
    for (let u = 0; u < l.set.length; ++u) {
      const o = l.set[u];
      let c = null;
      o.forEach((s) => {
        const d = new e(s.semver.version);
        switch (s.operator) {
          case ">":
            d.prerelease.length === 0 ? d.patch++ : d.prerelease.push(0), d.raw = d.format();
          /* fallthrough */
          case "":
          case ">=":
            (!c || a(d, c)) && (c = d);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${s.operator}`);
        }
      }), c && (!i || a(i, c)) && (i = c);
    }
    return i && l.test(i) ? i : null;
  }, hc;
}
var pc, Xd;
function G_() {
  if (Xd) return pc;
  Xd = 1;
  const e = Dt();
  return pc = (a, n) => {
    try {
      return new e(a, n).range || "*";
    } catch {
      return null;
    }
  }, pc;
}
var mc, Wd;
function al() {
  if (Wd) return mc;
  Wd = 1;
  const e = pt(), t = as(), { ANY: a } = t, n = Dt(), l = ss(), r = is(), i = rl(), u = il(), o = nl();
  return mc = (s, d, f, m) => {
    s = new e(s, m), d = new n(d, m);
    let y, v, h, g, p;
    switch (f) {
      case ">":
        y = r, v = u, h = i, g = ">", p = ">=";
        break;
      case "<":
        y = i, v = o, h = r, g = "<", p = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(s, d, m))
      return !1;
    for (let E = 0; E < d.set.length; ++E) {
      const b = d.set[E];
      let $ = null, _ = null;
      if (b.forEach((w) => {
        w.semver === a && (w = new t(">=0.0.0")), $ = $ || w, _ = _ || w, y(w.semver, $.semver, m) ? $ = w : h(w.semver, _.semver, m) && (_ = w);
      }), $.operator === g || $.operator === p || (!_.operator || _.operator === g) && v(s, _.semver))
        return !1;
      if (_.operator === p && h(s, _.semver))
        return !1;
    }
    return !0;
  }, mc;
}
var gc, Yd;
function B_() {
  if (Yd) return gc;
  Yd = 1;
  const e = al();
  return gc = (a, n, l) => e(a, n, ">", l), gc;
}
var yc, Jd;
function H_() {
  if (Jd) return yc;
  Jd = 1;
  const e = al();
  return yc = (a, n, l) => e(a, n, "<", l), yc;
}
var vc, Qd;
function z_() {
  if (Qd) return vc;
  Qd = 1;
  const e = Dt();
  return vc = (a, n, l) => (a = new e(a, l), n = new e(n, l), a.intersects(n, l)), vc;
}
var _c, Zd;
function K_() {
  if (Zd) return _c;
  Zd = 1;
  const e = ss(), t = Ct();
  return _c = (a, n, l) => {
    const r = [];
    let i = null, u = null;
    const o = a.sort((f, m) => t(f, m, l));
    for (const f of o)
      e(f, n, l) ? (u = f, i || (i = f)) : (u && r.push([i, u]), u = null, i = null);
    i && r.push([i, null]);
    const c = [];
    for (const [f, m] of r)
      f === m ? c.push(f) : !m && f === o[0] ? c.push("*") : m ? f === o[0] ? c.push(`<=${m}`) : c.push(`${f} - ${m}`) : c.push(`>=${f}`);
    const s = c.join(" || "), d = typeof n.raw == "string" ? n.raw : String(n);
    return s.length < d.length ? s : n;
  }, _c;
}
var Ec, eh;
function X_() {
  if (eh) return Ec;
  eh = 1;
  const e = Dt(), t = as(), { ANY: a } = t, n = ss(), l = Ct(), r = (d, f, m = {}) => {
    if (d === f)
      return !0;
    d = new e(d, m), f = new e(f, m);
    let y = !1;
    e: for (const v of d.set) {
      for (const h of f.set) {
        const g = o(v, h, m);
        if (y = y || g !== null, g)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], u = [new t(">=0.0.0")], o = (d, f, m) => {
    if (d === f)
      return !0;
    if (d.length === 1 && d[0].semver === a) {
      if (f.length === 1 && f[0].semver === a)
        return !0;
      m.includePrerelease ? d = i : d = u;
    }
    if (f.length === 1 && f[0].semver === a) {
      if (m.includePrerelease)
        return !0;
      f = u;
    }
    const y = /* @__PURE__ */ new Set();
    let v, h;
    for (const T of d)
      T.operator === ">" || T.operator === ">=" ? v = c(v, T, m) : T.operator === "<" || T.operator === "<=" ? h = s(h, T, m) : y.add(T.semver);
    if (y.size > 1)
      return null;
    let g;
    if (v && h) {
      if (g = l(v.semver, h.semver, m), g > 0)
        return null;
      if (g === 0 && (v.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const T of y) {
      if (v && !n(T, String(v), m) || h && !n(T, String(h), m))
        return null;
      for (const P of f)
        if (!n(T, String(P), m))
          return !1;
      return !0;
    }
    let p, E, b, $, _ = h && !m.includePrerelease && h.semver.prerelease.length ? h.semver : !1, w = v && !m.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    _ && _.prerelease.length === 1 && h.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const T of f) {
      if ($ = $ || T.operator === ">" || T.operator === ">=", b = b || T.operator === "<" || T.operator === "<=", v) {
        if (w && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === w.major && T.semver.minor === w.minor && T.semver.patch === w.patch && (w = !1), T.operator === ">" || T.operator === ">=") {
          if (p = c(v, T, m), p === T && p !== v)
            return !1;
        } else if (v.operator === ">=" && !n(v.semver, String(T), m))
          return !1;
      }
      if (h) {
        if (_ && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === _.major && T.semver.minor === _.minor && T.semver.patch === _.patch && (_ = !1), T.operator === "<" || T.operator === "<=") {
          if (E = s(h, T, m), E === T && E !== h)
            return !1;
        } else if (h.operator === "<=" && !n(h.semver, String(T), m))
          return !1;
      }
      if (!T.operator && (h || v) && g !== 0)
        return !1;
    }
    return !(v && b && !h && g !== 0 || h && $ && !v && g !== 0 || w || _);
  }, c = (d, f, m) => {
    if (!d)
      return f;
    const y = l(d.semver, f.semver, m);
    return y > 0 ? d : y < 0 || f.operator === ">" && d.operator === ">=" ? f : d;
  }, s = (d, f, m) => {
    if (!d)
      return f;
    const y = l(d.semver, f.semver, m);
    return y < 0 ? d : y > 0 || f.operator === "<" && d.operator === "<=" ? f : d;
  };
  return Ec = r, Ec;
}
var wc, th;
function r0() {
  if (th) return wc;
  th = 1;
  const e = Fn(), t = rs(), a = pt(), n = Qy(), l = Zr(), r = R_(), i = T_(), u = P_(), o = N_(), c = I_(), s = O_(), d = A_(), f = C_(), m = Ct(), y = D_(), v = k_(), h = tl(), g = L_(), p = q_(), E = is(), b = rl(), $ = Zy(), _ = e0(), w = nl(), T = il(), P = t0(), G = F_(), q = as(), M = Dt(), K = ss(), k = j_(), F = M_(), Y = x_(), B = V_(), W = G_(), Z = al(), V = B_(), C = H_(), j = z_(), D = K_(), R = X_();
  return wc = {
    parse: l,
    valid: r,
    clean: i,
    inc: u,
    diff: o,
    major: c,
    minor: s,
    patch: d,
    prerelease: f,
    compare: m,
    rcompare: y,
    compareLoose: v,
    compareBuild: h,
    sort: g,
    rsort: p,
    gt: E,
    lt: b,
    eq: $,
    neq: _,
    gte: w,
    lte: T,
    cmp: P,
    coerce: G,
    Comparator: q,
    Range: M,
    satisfies: K,
    toComparators: k,
    maxSatisfying: F,
    minSatisfying: Y,
    minVersion: B,
    validRange: W,
    outside: Z,
    gtr: V,
    ltr: C,
    intersects: j,
    simplifyRange: D,
    subset: R,
    SemVer: a,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, wc;
}
var Ur = {}, Cn = { exports: {} };
Cn.exports;
var rh;
function W_() {
  return rh || (rh = 1, (function(e, t) {
    var a = 200, n = "__lodash_hash_undefined__", l = 1, r = 2, i = 9007199254740991, u = "[object Arguments]", o = "[object Array]", c = "[object AsyncFunction]", s = "[object Boolean]", d = "[object Date]", f = "[object Error]", m = "[object Function]", y = "[object GeneratorFunction]", v = "[object Map]", h = "[object Number]", g = "[object Null]", p = "[object Object]", E = "[object Promise]", b = "[object Proxy]", $ = "[object RegExp]", _ = "[object Set]", w = "[object String]", T = "[object Symbol]", P = "[object Undefined]", G = "[object WeakMap]", q = "[object ArrayBuffer]", M = "[object DataView]", K = "[object Float32Array]", k = "[object Float64Array]", F = "[object Int8Array]", Y = "[object Int16Array]", B = "[object Int32Array]", W = "[object Uint8Array]", Z = "[object Uint8ClampedArray]", V = "[object Uint16Array]", C = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, D = /^\[object .+?Constructor\]$/, R = /^(?:0|[1-9]\d*)$/, N = {};
    N[K] = N[k] = N[F] = N[Y] = N[B] = N[W] = N[Z] = N[V] = N[C] = !0, N[u] = N[o] = N[q] = N[s] = N[M] = N[d] = N[f] = N[m] = N[v] = N[h] = N[p] = N[$] = N[_] = N[w] = N[G] = !1;
    var x = typeof Ot == "object" && Ot && Ot.Object === Object && Ot, O = typeof self == "object" && self && self.Object === Object && self, I = x || O || Function("return this")(), Q = t && !t.nodeType && t, H = Q && !0 && e && !e.nodeType && e, A = H && H.exports === Q, L = A && x.process, X = (function() {
      try {
        return L && L.binding && L.binding("util");
      } catch {
      }
    })(), J = X && X.isTypedArray;
    function re(z, ee) {
      for (var ue = -1, Ee = z == null ? 0 : z.length, ze = 0, Pe = []; ++ue < Ee; ) {
        var Ye = z[ue];
        ee(Ye, ue, z) && (Pe[ze++] = Ye);
      }
      return Pe;
    }
    function fe(z, ee) {
      for (var ue = -1, Ee = ee.length, ze = z.length; ++ue < Ee; )
        z[ze + ue] = ee[ue];
      return z;
    }
    function ye(z, ee) {
      for (var ue = -1, Ee = z == null ? 0 : z.length; ++ue < Ee; )
        if (ee(z[ue], ue, z))
          return !0;
      return !1;
    }
    function Ie(z, ee) {
      for (var ue = -1, Ee = Array(z); ++ue < z; )
        Ee[ue] = ee(ue);
      return Ee;
    }
    function ke(z) {
      return function(ee) {
        return z(ee);
      };
    }
    function Oe(z, ee) {
      return z.has(ee);
    }
    function Se(z, ee) {
      return z?.[ee];
    }
    function S(z) {
      var ee = -1, ue = Array(z.size);
      return z.forEach(function(Ee, ze) {
        ue[++ee] = [ze, Ee];
      }), ue;
    }
    function te(z, ee) {
      return function(ue) {
        return z(ee(ue));
      };
    }
    function ie(z) {
      var ee = -1, ue = Array(z.size);
      return z.forEach(function(Ee) {
        ue[++ee] = Ee;
      }), ue;
    }
    var pe = Array.prototype, ae = Function.prototype, de = Object.prototype, le = I["__core-js_shared__"], me = ae.toString, ve = de.hasOwnProperty, qe = (function() {
      var z = /[^.]+$/.exec(le && le.keys && le.keys.IE_PROTO || "");
      return z ? "Symbol(src)_1." + z : "";
    })(), Fe = de.toString, $e = RegExp(
      "^" + me.call(ve).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    ), U = A ? I.Buffer : void 0, ne = I.Symbol, se = I.Uint8Array, oe = de.propertyIsEnumerable, ce = pe.splice, ge = ne ? ne.toStringTag : void 0, he = Object.getOwnPropertySymbols, _e = U ? U.isBuffer : void 0, we = te(Object.keys, Object), be = qr(I, "DataView"), He = qr(I, "Map"), We = qr(I, "Promise"), Me = qr(I, "Set"), Lr = qr(I, "WeakMap"), Tt = qr(Object, "create"), hr = gr(be), F0 = gr(He), U0 = gr(We), j0 = gr(Me), M0 = gr(Lr), Rl = ne ? ne.prototype : void 0, Ss = Rl ? Rl.valueOf : void 0;
    function pr(z) {
      var ee = -1, ue = z == null ? 0 : z.length;
      for (this.clear(); ++ee < ue; ) {
        var Ee = z[ee];
        this.set(Ee[0], Ee[1]);
      }
    }
    function x0() {
      this.__data__ = Tt ? Tt(null) : {}, this.size = 0;
    }
    function V0(z) {
      var ee = this.has(z) && delete this.__data__[z];
      return this.size -= ee ? 1 : 0, ee;
    }
    function G0(z) {
      var ee = this.__data__;
      if (Tt) {
        var ue = ee[z];
        return ue === n ? void 0 : ue;
      }
      return ve.call(ee, z) ? ee[z] : void 0;
    }
    function B0(z) {
      var ee = this.__data__;
      return Tt ? ee[z] !== void 0 : ve.call(ee, z);
    }
    function H0(z, ee) {
      var ue = this.__data__;
      return this.size += this.has(z) ? 0 : 1, ue[z] = Tt && ee === void 0 ? n : ee, this;
    }
    pr.prototype.clear = x0, pr.prototype.delete = V0, pr.prototype.get = G0, pr.prototype.has = B0, pr.prototype.set = H0;
    function xt(z) {
      var ee = -1, ue = z == null ? 0 : z.length;
      for (this.clear(); ++ee < ue; ) {
        var Ee = z[ee];
        this.set(Ee[0], Ee[1]);
      }
    }
    function z0() {
      this.__data__ = [], this.size = 0;
    }
    function K0(z) {
      var ee = this.__data__, ue = Mn(ee, z);
      if (ue < 0)
        return !1;
      var Ee = ee.length - 1;
      return ue == Ee ? ee.pop() : ce.call(ee, ue, 1), --this.size, !0;
    }
    function X0(z) {
      var ee = this.__data__, ue = Mn(ee, z);
      return ue < 0 ? void 0 : ee[ue][1];
    }
    function W0(z) {
      return Mn(this.__data__, z) > -1;
    }
    function Y0(z, ee) {
      var ue = this.__data__, Ee = Mn(ue, z);
      return Ee < 0 ? (++this.size, ue.push([z, ee])) : ue[Ee][1] = ee, this;
    }
    xt.prototype.clear = z0, xt.prototype.delete = K0, xt.prototype.get = X0, xt.prototype.has = W0, xt.prototype.set = Y0;
    function mr(z) {
      var ee = -1, ue = z == null ? 0 : z.length;
      for (this.clear(); ++ee < ue; ) {
        var Ee = z[ee];
        this.set(Ee[0], Ee[1]);
      }
    }
    function J0() {
      this.size = 0, this.__data__ = {
        hash: new pr(),
        map: new (He || xt)(),
        string: new pr()
      };
    }
    function Q0(z) {
      var ee = xn(this, z).delete(z);
      return this.size -= ee ? 1 : 0, ee;
    }
    function Z0(z) {
      return xn(this, z).get(z);
    }
    function ev(z) {
      return xn(this, z).has(z);
    }
    function tv(z, ee) {
      var ue = xn(this, z), Ee = ue.size;
      return ue.set(z, ee), this.size += ue.size == Ee ? 0 : 1, this;
    }
    mr.prototype.clear = J0, mr.prototype.delete = Q0, mr.prototype.get = Z0, mr.prototype.has = ev, mr.prototype.set = tv;
    function jn(z) {
      var ee = -1, ue = z == null ? 0 : z.length;
      for (this.__data__ = new mr(); ++ee < ue; )
        this.add(z[ee]);
    }
    function rv(z) {
      return this.__data__.set(z, n), this;
    }
    function nv(z) {
      return this.__data__.has(z);
    }
    jn.prototype.add = jn.prototype.push = rv, jn.prototype.has = nv;
    function Qt(z) {
      var ee = this.__data__ = new xt(z);
      this.size = ee.size;
    }
    function iv() {
      this.__data__ = new xt(), this.size = 0;
    }
    function av(z) {
      var ee = this.__data__, ue = ee.delete(z);
      return this.size = ee.size, ue;
    }
    function sv(z) {
      return this.__data__.get(z);
    }
    function ov(z) {
      return this.__data__.has(z);
    }
    function cv(z, ee) {
      var ue = this.__data__;
      if (ue instanceof xt) {
        var Ee = ue.__data__;
        if (!He || Ee.length < a - 1)
          return Ee.push([z, ee]), this.size = ++ue.size, this;
        ue = this.__data__ = new mr(Ee);
      }
      return ue.set(z, ee), this.size = ue.size, this;
    }
    Qt.prototype.clear = iv, Qt.prototype.delete = av, Qt.prototype.get = sv, Qt.prototype.has = ov, Qt.prototype.set = cv;
    function uv(z, ee) {
      var ue = Vn(z), Ee = !ue && bv(z), ze = !ue && !Ee && bs(z), Pe = !ue && !Ee && !ze && kl(z), Ye = ue || Ee || ze || Pe, Qe = Ye ? Ie(z.length, String) : [], Ze = Qe.length;
      for (var Xe in z)
        ve.call(z, Xe) && !(Ye && // Safari 9 has enumerable `arguments.length` in strict mode.
        (Xe == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        ze && (Xe == "offset" || Xe == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        Pe && (Xe == "buffer" || Xe == "byteLength" || Xe == "byteOffset") || // Skip index properties.
        _v(Xe, Ze))) && Qe.push(Xe);
      return Qe;
    }
    function Mn(z, ee) {
      for (var ue = z.length; ue--; )
        if (Ol(z[ue][0], ee))
          return ue;
      return -1;
    }
    function lv(z, ee, ue) {
      var Ee = ee(z);
      return Vn(z) ? Ee : fe(Ee, ue(z));
    }
    function rn(z) {
      return z == null ? z === void 0 ? P : g : ge && ge in Object(z) ? yv(z) : Sv(z);
    }
    function Tl(z) {
      return nn(z) && rn(z) == u;
    }
    function Pl(z, ee, ue, Ee, ze) {
      return z === ee ? !0 : z == null || ee == null || !nn(z) && !nn(ee) ? z !== z && ee !== ee : fv(z, ee, ue, Ee, Pl, ze);
    }
    function fv(z, ee, ue, Ee, ze, Pe) {
      var Ye = Vn(z), Qe = Vn(ee), Ze = Ye ? o : Zt(z), Xe = Qe ? o : Zt(ee);
      Ze = Ze == u ? p : Ze, Xe = Xe == u ? p : Xe;
      var yt = Ze == p, Pt = Xe == p, nt = Ze == Xe;
      if (nt && bs(z)) {
        if (!bs(ee))
          return !1;
        Ye = !0, yt = !1;
      }
      if (nt && !yt)
        return Pe || (Pe = new Qt()), Ye || kl(z) ? Nl(z, ee, ue, Ee, ze, Pe) : mv(z, ee, Ze, ue, Ee, ze, Pe);
      if (!(ue & l)) {
        var $t = yt && ve.call(z, "__wrapped__"), St = Pt && ve.call(ee, "__wrapped__");
        if ($t || St) {
          var er = $t ? z.value() : z, Vt = St ? ee.value() : ee;
          return Pe || (Pe = new Qt()), ze(er, Vt, ue, Ee, Pe);
        }
      }
      return nt ? (Pe || (Pe = new Qt()), gv(z, ee, ue, Ee, ze, Pe)) : !1;
    }
    function dv(z) {
      if (!Dl(z) || wv(z))
        return !1;
      var ee = Al(z) ? $e : D;
      return ee.test(gr(z));
    }
    function hv(z) {
      return nn(z) && Cl(z.length) && !!N[rn(z)];
    }
    function pv(z) {
      if (!$v(z))
        return we(z);
      var ee = [];
      for (var ue in Object(z))
        ve.call(z, ue) && ue != "constructor" && ee.push(ue);
      return ee;
    }
    function Nl(z, ee, ue, Ee, ze, Pe) {
      var Ye = ue & l, Qe = z.length, Ze = ee.length;
      if (Qe != Ze && !(Ye && Ze > Qe))
        return !1;
      var Xe = Pe.get(z);
      if (Xe && Pe.get(ee))
        return Xe == ee;
      var yt = -1, Pt = !0, nt = ue & r ? new jn() : void 0;
      for (Pe.set(z, ee), Pe.set(ee, z); ++yt < Qe; ) {
        var $t = z[yt], St = ee[yt];
        if (Ee)
          var er = Ye ? Ee(St, $t, yt, ee, z, Pe) : Ee($t, St, yt, z, ee, Pe);
        if (er !== void 0) {
          if (er)
            continue;
          Pt = !1;
          break;
        }
        if (nt) {
          if (!ye(ee, function(Vt, yr) {
            if (!Oe(nt, yr) && ($t === Vt || ze($t, Vt, ue, Ee, Pe)))
              return nt.push(yr);
          })) {
            Pt = !1;
            break;
          }
        } else if (!($t === St || ze($t, St, ue, Ee, Pe))) {
          Pt = !1;
          break;
        }
      }
      return Pe.delete(z), Pe.delete(ee), Pt;
    }
    function mv(z, ee, ue, Ee, ze, Pe, Ye) {
      switch (ue) {
        case M:
          if (z.byteLength != ee.byteLength || z.byteOffset != ee.byteOffset)
            return !1;
          z = z.buffer, ee = ee.buffer;
        case q:
          return !(z.byteLength != ee.byteLength || !Pe(new se(z), new se(ee)));
        case s:
        case d:
        case h:
          return Ol(+z, +ee);
        case f:
          return z.name == ee.name && z.message == ee.message;
        case $:
        case w:
          return z == ee + "";
        case v:
          var Qe = S;
        case _:
          var Ze = Ee & l;
          if (Qe || (Qe = ie), z.size != ee.size && !Ze)
            return !1;
          var Xe = Ye.get(z);
          if (Xe)
            return Xe == ee;
          Ee |= r, Ye.set(z, ee);
          var yt = Nl(Qe(z), Qe(ee), Ee, ze, Pe, Ye);
          return Ye.delete(z), yt;
        case T:
          if (Ss)
            return Ss.call(z) == Ss.call(ee);
      }
      return !1;
    }
    function gv(z, ee, ue, Ee, ze, Pe) {
      var Ye = ue & l, Qe = Il(z), Ze = Qe.length, Xe = Il(ee), yt = Xe.length;
      if (Ze != yt && !Ye)
        return !1;
      for (var Pt = Ze; Pt--; ) {
        var nt = Qe[Pt];
        if (!(Ye ? nt in ee : ve.call(ee, nt)))
          return !1;
      }
      var $t = Pe.get(z);
      if ($t && Pe.get(ee))
        return $t == ee;
      var St = !0;
      Pe.set(z, ee), Pe.set(ee, z);
      for (var er = Ye; ++Pt < Ze; ) {
        nt = Qe[Pt];
        var Vt = z[nt], yr = ee[nt];
        if (Ee)
          var Ll = Ye ? Ee(yr, Vt, nt, ee, z, Pe) : Ee(Vt, yr, nt, z, ee, Pe);
        if (!(Ll === void 0 ? Vt === yr || ze(Vt, yr, ue, Ee, Pe) : Ll)) {
          St = !1;
          break;
        }
        er || (er = nt == "constructor");
      }
      if (St && !er) {
        var Gn = z.constructor, Bn = ee.constructor;
        Gn != Bn && "constructor" in z && "constructor" in ee && !(typeof Gn == "function" && Gn instanceof Gn && typeof Bn == "function" && Bn instanceof Bn) && (St = !1);
      }
      return Pe.delete(z), Pe.delete(ee), St;
    }
    function Il(z) {
      return lv(z, Pv, vv);
    }
    function xn(z, ee) {
      var ue = z.__data__;
      return Ev(ee) ? ue[typeof ee == "string" ? "string" : "hash"] : ue.map;
    }
    function qr(z, ee) {
      var ue = Se(z, ee);
      return dv(ue) ? ue : void 0;
    }
    function yv(z) {
      var ee = ve.call(z, ge), ue = z[ge];
      try {
        z[ge] = void 0;
        var Ee = !0;
      } catch {
      }
      var ze = Fe.call(z);
      return Ee && (ee ? z[ge] = ue : delete z[ge]), ze;
    }
    var vv = he ? function(z) {
      return z == null ? [] : (z = Object(z), re(he(z), function(ee) {
        return oe.call(z, ee);
      }));
    } : Nv, Zt = rn;
    (be && Zt(new be(new ArrayBuffer(1))) != M || He && Zt(new He()) != v || We && Zt(We.resolve()) != E || Me && Zt(new Me()) != _ || Lr && Zt(new Lr()) != G) && (Zt = function(z) {
      var ee = rn(z), ue = ee == p ? z.constructor : void 0, Ee = ue ? gr(ue) : "";
      if (Ee)
        switch (Ee) {
          case hr:
            return M;
          case F0:
            return v;
          case U0:
            return E;
          case j0:
            return _;
          case M0:
            return G;
        }
      return ee;
    });
    function _v(z, ee) {
      return ee = ee ?? i, !!ee && (typeof z == "number" || R.test(z)) && z > -1 && z % 1 == 0 && z < ee;
    }
    function Ev(z) {
      var ee = typeof z;
      return ee == "string" || ee == "number" || ee == "symbol" || ee == "boolean" ? z !== "__proto__" : z === null;
    }
    function wv(z) {
      return !!qe && qe in z;
    }
    function $v(z) {
      var ee = z && z.constructor, ue = typeof ee == "function" && ee.prototype || de;
      return z === ue;
    }
    function Sv(z) {
      return Fe.call(z);
    }
    function gr(z) {
      if (z != null) {
        try {
          return me.call(z);
        } catch {
        }
        try {
          return z + "";
        } catch {
        }
      }
      return "";
    }
    function Ol(z, ee) {
      return z === ee || z !== z && ee !== ee;
    }
    var bv = Tl(/* @__PURE__ */ (function() {
      return arguments;
    })()) ? Tl : function(z) {
      return nn(z) && ve.call(z, "callee") && !oe.call(z, "callee");
    }, Vn = Array.isArray;
    function Rv(z) {
      return z != null && Cl(z.length) && !Al(z);
    }
    var bs = _e || Iv;
    function Tv(z, ee) {
      return Pl(z, ee);
    }
    function Al(z) {
      if (!Dl(z))
        return !1;
      var ee = rn(z);
      return ee == m || ee == y || ee == c || ee == b;
    }
    function Cl(z) {
      return typeof z == "number" && z > -1 && z % 1 == 0 && z <= i;
    }
    function Dl(z) {
      var ee = typeof z;
      return z != null && (ee == "object" || ee == "function");
    }
    function nn(z) {
      return z != null && typeof z == "object";
    }
    var kl = J ? ke(J) : hv;
    function Pv(z) {
      return Rv(z) ? uv(z) : pv(z);
    }
    function Nv() {
      return [];
    }
    function Iv() {
      return !1;
    }
    e.exports = Tv;
  })(Cn, Cn.exports)), Cn.exports;
}
var nh;
function Y_() {
  if (nh) return Ur;
  nh = 1, Object.defineProperty(Ur, "__esModule", { value: !0 }), Ur.DownloadedUpdateHelper = void 0, Ur.createTempUpdateFile = u;
  const e = kn, t = At, a = W_(), n = /* @__PURE__ */ fr(), l = Ge;
  let r = class {
    constructor(c) {
      this.cacheDir = c, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
    }
    get downloadedFileInfo() {
      return this._downloadedFileInfo;
    }
    get file() {
      return this._file;
    }
    get packageFile() {
      return this._packageFile;
    }
    get cacheDirForPendingUpdate() {
      return l.join(this.cacheDir, "pending");
    }
    async validateDownloadedPath(c, s, d, f) {
      if (this.versionInfo != null && this.file === c && this.fileInfo != null)
        return a(this.versionInfo, s) && a(this.fileInfo.info, d.info) && await (0, n.pathExists)(c) ? c : null;
      const m = await this.getValidCachedUpdateFile(d, f);
      return m === null ? null : (f.info(`Update has already been downloaded to ${c}).`), this._file = m, m);
    }
    async setDownloadedFile(c, s, d, f, m, y) {
      this._file = c, this._packageFile = s, this.versionInfo = d, this.fileInfo = f, this._downloadedFileInfo = {
        fileName: m,
        sha512: f.info.sha512,
        isAdminRightsRequired: f.info.isAdminRightsRequired === !0
      }, y && await (0, n.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
    }
    async clear() {
      this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
    }
    async cleanCacheDirForPendingUpdate() {
      try {
        await (0, n.emptyDir)(this.cacheDirForPendingUpdate);
      } catch {
      }
    }
    /**
     * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
     * @param fileInfo
     * @param logger
     */
    async getValidCachedUpdateFile(c, s) {
      const d = this.getUpdateInfoFile();
      if (!await (0, n.pathExists)(d))
        return null;
      let m;
      try {
        m = await (0, n.readJson)(d);
      } catch (g) {
        let p = "No cached update info available";
        return g.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), p += ` (error on read: ${g.message})`), s.info(p), null;
      }
      if (!(m?.fileName !== null))
        return s.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
      if (c.info.sha512 !== m.sha512)
        return s.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${m.sha512}, expected: ${c.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
      const v = l.join(this.cacheDirForPendingUpdate, m.fileName);
      if (!await (0, n.pathExists)(v))
        return s.info("Cached update file doesn't exist"), null;
      const h = await i(v);
      return c.info.sha512 !== h ? (s.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${h}, expected: ${c.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = m, v);
    }
    getUpdateInfoFile() {
      return l.join(this.cacheDirForPendingUpdate, "update-info.json");
    }
  };
  Ur.DownloadedUpdateHelper = r;
  function i(o, c = "sha512", s = "base64", d) {
    return new Promise((f, m) => {
      const y = (0, e.createHash)(c);
      y.on("error", m).setEncoding(s), (0, t.createReadStream)(o, {
        ...d,
        highWaterMark: 1024 * 1024
        /* better to use more memory but hash faster */
      }).on("error", m).on("end", () => {
        y.end(), f(y.read());
      }).pipe(y, { end: !1 });
    });
  }
  async function u(o, c, s) {
    let d = 0, f = l.join(c, o);
    for (let m = 0; m < 3; m++)
      try {
        return await (0, n.unlink)(f), f;
      } catch (y) {
        if (y.code === "ENOENT")
          return f;
        s.warn(`Error on remove temp update file: ${y}`), f = l.join(c, `${d++}-${o}`);
      }
    return f;
  }
  return Ur;
}
var ln = {}, ri = {}, ih;
function J_() {
  if (ih) return ri;
  ih = 1, Object.defineProperty(ri, "__esModule", { value: !0 }), ri.getAppCacheDir = a;
  const e = Ge, t = Za;
  function a() {
    const n = (0, t.homedir)();
    let l;
    return process.platform === "win32" ? l = process.env.LOCALAPPDATA || e.join(n, "AppData", "Local") : process.platform === "darwin" ? l = e.join(n, "Library", "Caches") : l = process.env.XDG_CACHE_HOME || e.join(n, ".cache"), l;
  }
  return ri;
}
var ah;
function Q_() {
  if (ah) return ln;
  ah = 1, Object.defineProperty(ln, "__esModule", { value: !0 }), ln.ElectronAppAdapter = void 0;
  const e = Ge, t = J_();
  let a = class {
    constructor(l = Jt.app) {
      this.app = l;
    }
    whenReady() {
      return this.app.whenReady();
    }
    get version() {
      return this.app.getVersion();
    }
    get name() {
      return this.app.getName();
    }
    get isPackaged() {
      return this.app.isPackaged === !0;
    }
    get appUpdateConfigPath() {
      return this.isPackaged ? e.join(process.resourcesPath, "app-update.yml") : e.join(this.app.getAppPath(), "dev-app-update.yml");
    }
    get userDataPath() {
      return this.app.getPath("userData");
    }
    get baseCachePath() {
      return (0, t.getAppCacheDir)();
    }
    quit() {
      this.app.quit();
    }
    relaunch() {
      this.app.relaunch();
    }
    onQuit(l) {
      this.app.once("quit", (r, i) => l(i));
    }
  };
  return ln.ElectronAppAdapter = a, ln;
}
var $c = {}, sh;
function Z_() {
  return sh || (sh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = a;
    const t = rt();
    e.NET_SESSION_NAME = "electron-updater";
    function a() {
      return Jt.session.fromPartition(e.NET_SESSION_NAME, {
        cache: !1
      });
    }
    class n extends t.HttpExecutor {
      constructor(r) {
        super(), this.proxyLoginCallback = r, this.cachedSession = null;
      }
      async download(r, i, u) {
        return await u.cancellationToken.createPromise((o, c, s) => {
          const d = {
            headers: u.headers || void 0,
            redirect: "manual"
          };
          (0, t.configureRequestUrl)(r, d), (0, t.configureRequestOptions)(d), this.doDownload(d, {
            destination: i,
            options: u,
            onCancel: s,
            callback: (f) => {
              f == null ? o(i) : c(f);
            },
            responseHandler: null
          }, 0);
        });
      }
      createRequest(r, i) {
        r.headers && r.headers.Host && (r.host = r.headers.Host, delete r.headers.Host), this.cachedSession == null && (this.cachedSession = a());
        const u = Jt.net.request({
          ...r,
          session: this.cachedSession
        });
        return u.on("response", i), this.proxyLoginCallback != null && u.on("login", this.proxyLoginCallback), u;
      }
      addRedirectHandlers(r, i, u, o, c) {
        r.on("redirect", (s, d, f) => {
          r.abort(), o > this.maxRedirects ? u(this.createMaxRedirectError()) : c(t.HttpExecutor.prepareRedirectUrlOptions(f, i));
        });
      }
    }
    e.ElectronHttpExecutor = n;
  })($c)), $c;
}
var fn = {}, Sr = {}, Sc, oh;
function eE() {
  if (oh) return Sc;
  oh = 1;
  var e = "[object Symbol]", t = /[\\^$.*+?()[\]{}|]/g, a = RegExp(t.source), n = typeof Ot == "object" && Ot && Ot.Object === Object && Ot, l = typeof self == "object" && self && self.Object === Object && self, r = n || l || Function("return this")(), i = Object.prototype, u = i.toString, o = r.Symbol, c = o ? o.prototype : void 0, s = c ? c.toString : void 0;
  function d(h) {
    if (typeof h == "string")
      return h;
    if (m(h))
      return s ? s.call(h) : "";
    var g = h + "";
    return g == "0" && 1 / h == -1 / 0 ? "-0" : g;
  }
  function f(h) {
    return !!h && typeof h == "object";
  }
  function m(h) {
    return typeof h == "symbol" || f(h) && u.call(h) == e;
  }
  function y(h) {
    return h == null ? "" : d(h);
  }
  function v(h) {
    return h = y(h), h && a.test(h) ? h.replace(t, "\\$&") : h;
  }
  return Sc = v, Sc;
}
var ch;
function Dr() {
  if (ch) return Sr;
  ch = 1, Object.defineProperty(Sr, "__esModule", { value: !0 }), Sr.newBaseUrl = a, Sr.newUrlFromBase = n, Sr.getChannelFilename = l, Sr.blockmapFiles = r;
  const e = Yr, t = eE();
  function a(i) {
    const u = new e.URL(i);
    return u.pathname.endsWith("/") || (u.pathname += "/"), u;
  }
  function n(i, u, o = !1) {
    const c = new e.URL(i, u), s = u.search;
    return s != null && s.length !== 0 ? c.search = s : o && (c.search = `noCache=${Date.now().toString(32)}`), c;
  }
  function l(i) {
    return `${i}.yml`;
  }
  function r(i, u, o) {
    const c = n(`${i.pathname}.blockmap`, i);
    return [n(`${i.pathname.replace(new RegExp(t(o), "g"), u)}.blockmap`, i), c];
  }
  return Sr;
}
var Gt = {}, uh;
function Rt() {
  if (uh) return Gt;
  uh = 1, Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.Provider = void 0, Gt.findFile = l, Gt.parseUpdateInfo = r, Gt.getFileList = i, Gt.resolveFiles = u;
  const e = rt(), t = Zu(), a = Dr();
  let n = class {
    constructor(c) {
      this.runtimeOptions = c, this.requestHeaders = null, this.executor = c.executor;
    }
    get isUseMultipleRangeRequest() {
      return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
    }
    getChannelFilePrefix() {
      if (this.runtimeOptions.platform === "linux") {
        const c = process.env.TEST_UPDATER_ARCH || process.arch;
        return "-linux" + (c === "x64" ? "" : `-${c}`);
      } else
        return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
    }
    // due to historical reasons for windows we use channel name without platform specifier
    getDefaultChannelName() {
      return this.getCustomChannelName("latest");
    }
    getCustomChannelName(c) {
      return `${c}${this.getChannelFilePrefix()}`;
    }
    get fileExtraDownloadHeaders() {
      return null;
    }
    setRequestHeaders(c) {
      this.requestHeaders = c;
    }
    /**
     * Method to perform API request only to resolve update info, but not to download update.
     */
    httpRequest(c, s, d) {
      return this.executor.request(this.createRequestOptions(c, s), d);
    }
    createRequestOptions(c, s) {
      const d = {};
      return this.requestHeaders == null ? s != null && (d.headers = s) : d.headers = s == null ? this.requestHeaders : { ...this.requestHeaders, ...s }, (0, e.configureRequestUrl)(c, d), d;
    }
  };
  Gt.Provider = n;
  function l(o, c, s) {
    if (o.length === 0)
      throw (0, e.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
    const d = o.find((f) => f.url.pathname.toLowerCase().endsWith(`.${c}`));
    return d ?? (s == null ? o[0] : o.find((f) => !s.some((m) => f.url.pathname.toLowerCase().endsWith(`.${m}`))));
  }
  function r(o, c, s) {
    if (o == null)
      throw (0, e.newError)(`Cannot parse update info from ${c} in the latest release artifacts (${s}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    let d;
    try {
      d = (0, t.load)(o);
    } catch (f) {
      throw (0, e.newError)(`Cannot parse update info from ${c} in the latest release artifacts (${s}): ${f.stack || f.message}, rawData: ${o}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
    }
    return d;
  }
  function i(o) {
    const c = o.files;
    if (c != null && c.length > 0)
      return c;
    if (o.path != null)
      return [
        {
          url: o.path,
          sha2: o.sha2,
          sha512: o.sha512
        }
      ];
    throw (0, e.newError)(`No files provided: ${(0, e.safeStringifyJson)(o)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
  }
  function u(o, c, s = (d) => d) {
    const f = i(o).map((v) => {
      if (v.sha2 == null && v.sha512 == null)
        throw (0, e.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, e.safeStringifyJson)(v)}`, "ERR_UPDATER_NO_CHECKSUM");
      return {
        url: (0, a.newUrlFromBase)(s(v.url), c),
        info: v
      };
    }), m = o.packages, y = m == null ? null : m[process.arch] || m.ia32;
    return y != null && (f[0].packageInfo = {
      ...y,
      path: (0, a.newUrlFromBase)(s(y.path), c).href
    }), f;
  }
  return Gt;
}
var lh;
function n0() {
  if (lh) return fn;
  lh = 1, Object.defineProperty(fn, "__esModule", { value: !0 }), fn.GenericProvider = void 0;
  const e = rt(), t = Dr(), a = Rt();
  let n = class extends a.Provider {
    constructor(r, i, u) {
      super(u), this.configuration = r, this.updater = i, this.baseUrl = (0, t.newBaseUrl)(this.configuration.url);
    }
    get channel() {
      const r = this.updater.channel || this.configuration.channel;
      return r == null ? this.getDefaultChannelName() : this.getCustomChannelName(r);
    }
    async getLatestVersion() {
      const r = (0, t.getChannelFilename)(this.channel), i = (0, t.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
      for (let u = 0; ; u++)
        try {
          return (0, a.parseUpdateInfo)(await this.httpRequest(i), r, i);
        } catch (o) {
          if (o instanceof e.HttpError && o.statusCode === 404)
            throw (0, e.newError)(`Cannot find channel "${r}" update info: ${o.stack || o.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
          if (o.code === "ECONNREFUSED" && u < 3) {
            await new Promise((c, s) => {
              try {
                setTimeout(c, 1e3 * u);
              } catch (d) {
                s(d);
              }
            });
            continue;
          }
          throw o;
        }
    }
    resolveFiles(r) {
      return (0, a.resolveFiles)(r, this.baseUrl);
    }
  };
  return fn.GenericProvider = n, fn;
}
var dn = {}, hn = {}, fh;
function tE() {
  if (fh) return hn;
  fh = 1, Object.defineProperty(hn, "__esModule", { value: !0 }), hn.BitbucketProvider = void 0;
  const e = rt(), t = Dr(), a = Rt();
  let n = class extends a.Provider {
    constructor(r, i, u) {
      super({
        ...u,
        isUseMultipleRangeRequest: !1
      }), this.configuration = r, this.updater = i;
      const { owner: o, slug: c } = r;
      this.baseUrl = (0, t.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${o}/${c}/downloads`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "latest";
    }
    async getLatestVersion() {
      const r = new e.CancellationToken(), i = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), u = (0, t.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const o = await this.httpRequest(u, void 0, r);
        return (0, a.parseUpdateInfo)(o, i, u);
      } catch (o) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(r) {
      return (0, a.resolveFiles)(r, this.baseUrl);
    }
    toString() {
      const { owner: r, slug: i } = this.configuration;
      return `Bitbucket (owner: ${r}, slug: ${i}, channel: ${this.channel})`;
    }
  };
  return hn.BitbucketProvider = n, hn;
}
var rr = {}, dh;
function i0() {
  if (dh) return rr;
  dh = 1, Object.defineProperty(rr, "__esModule", { value: !0 }), rr.GitHubProvider = rr.BaseGitHubProvider = void 0, rr.computeReleaseNotes = c;
  const e = rt(), t = r0(), a = Yr, n = Dr(), l = Rt(), r = /\/tag\/([^/]+)$/;
  class i extends l.Provider {
    constructor(d, f, m) {
      super({
        ...m,
        /* because GitHib uses S3 */
        isUseMultipleRangeRequest: !1
      }), this.options = d, this.baseUrl = (0, n.newBaseUrl)((0, e.githubUrl)(d, f));
      const y = f === "github.com" ? "api.github.com" : f;
      this.baseApiUrl = (0, n.newBaseUrl)((0, e.githubUrl)(d, y));
    }
    computeGithubBasePath(d) {
      const f = this.options.host;
      return f && !["github.com", "api.github.com"].includes(f) ? `/api/v3${d}` : d;
    }
  }
  rr.BaseGitHubProvider = i;
  let u = class extends i {
    constructor(d, f, m) {
      super(d, "github.com", m), this.options = d, this.updater = f;
    }
    get channel() {
      const d = this.updater.channel || this.options.channel;
      return d == null ? this.getDefaultChannelName() : this.getCustomChannelName(d);
    }
    async getLatestVersion() {
      var d, f, m, y, v;
      const h = new e.CancellationToken(), g = await this.httpRequest((0, n.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
        accept: "application/xml, application/atom+xml, text/xml, */*"
      }, h), p = (0, e.parseXml)(g);
      let E = p.element("entry", !1, "No published versions on GitHub"), b = null;
      try {
        if (this.updater.allowPrerelease) {
          const G = ((d = this.updater) === null || d === void 0 ? void 0 : d.channel) || ((f = t.prerelease(this.updater.currentVersion)) === null || f === void 0 ? void 0 : f[0]) || null;
          if (G === null)
            b = r.exec(E.element("link").attribute("href"))[1];
          else
            for (const q of p.getElements("entry")) {
              const M = r.exec(q.element("link").attribute("href"));
              if (M === null)
                continue;
              const K = M[1], k = ((m = t.prerelease(K)) === null || m === void 0 ? void 0 : m[0]) || null, F = !G || ["alpha", "beta"].includes(G), Y = k !== null && !["alpha", "beta"].includes(String(k));
              if (F && !Y && !(G === "beta" && k === "alpha")) {
                b = K;
                break;
              }
              if (k && k === G) {
                b = K;
                break;
              }
            }
        } else {
          b = await this.getLatestTagName(h);
          for (const G of p.getElements("entry"))
            if (r.exec(G.element("link").attribute("href"))[1] === b) {
              E = G;
              break;
            }
        }
      } catch (G) {
        throw (0, e.newError)(`Cannot parse releases feed: ${G.stack || G.message},
XML:
${g}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
      }
      if (b == null)
        throw (0, e.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
      let $, _ = "", w = "";
      const T = async (G) => {
        _ = (0, n.getChannelFilename)(G), w = (0, n.newUrlFromBase)(this.getBaseDownloadPath(String(b), _), this.baseUrl);
        const q = this.createRequestOptions(w);
        try {
          return await this.executor.request(q, h);
        } catch (M) {
          throw M instanceof e.HttpError && M.statusCode === 404 ? (0, e.newError)(`Cannot find ${_} in the latest release artifacts (${w}): ${M.stack || M.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : M;
        }
      };
      try {
        let G = this.channel;
        this.updater.allowPrerelease && (!((y = t.prerelease(b)) === null || y === void 0) && y[0]) && (G = this.getCustomChannelName(String((v = t.prerelease(b)) === null || v === void 0 ? void 0 : v[0]))), $ = await T(G);
      } catch (G) {
        if (this.updater.allowPrerelease)
          $ = await T(this.getDefaultChannelName());
        else
          throw G;
      }
      const P = (0, l.parseUpdateInfo)($, _, w);
      return P.releaseName == null && (P.releaseName = E.elementValueOrEmpty("title")), P.releaseNotes == null && (P.releaseNotes = c(this.updater.currentVersion, this.updater.fullChangelog, p, E)), {
        tag: b,
        ...P
      };
    }
    async getLatestTagName(d) {
      const f = this.options, m = f.host == null || f.host === "github.com" ? (0, n.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new a.URL(`${this.computeGithubBasePath(`/repos/${f.owner}/${f.repo}/releases`)}/latest`, this.baseApiUrl);
      try {
        const y = await this.httpRequest(m, { Accept: "application/json" }, d);
        return y == null ? null : JSON.parse(y).tag_name;
      } catch (y) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${m}), please ensure a production release exists: ${y.stack || y.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return `/${this.options.owner}/${this.options.repo}/releases`;
    }
    resolveFiles(d) {
      return (0, l.resolveFiles)(d, this.baseUrl, (f) => this.getBaseDownloadPath(d.tag, f.replace(/ /g, "-")));
    }
    getBaseDownloadPath(d, f) {
      return `${this.basePath}/download/${d}/${f}`;
    }
  };
  rr.GitHubProvider = u;
  function o(s) {
    const d = s.elementValueOrEmpty("content");
    return d === "No content." ? "" : d;
  }
  function c(s, d, f, m) {
    if (!d)
      return o(m);
    const y = [];
    for (const v of f.getElements("entry")) {
      const h = /\/tag\/v?([^/]+)$/.exec(v.element("link").attribute("href"))[1];
      t.lt(s, h) && y.push({
        version: h,
        note: o(v)
      });
    }
    return y.sort((v, h) => t.rcompare(v.version, h.version));
  }
  return rr;
}
var pn = {}, hh;
function rE() {
  if (hh) return pn;
  hh = 1, Object.defineProperty(pn, "__esModule", { value: !0 }), pn.KeygenProvider = void 0;
  const e = rt(), t = Dr(), a = Rt();
  let n = class extends a.Provider {
    constructor(r, i, u) {
      super({
        ...u,
        isUseMultipleRangeRequest: !1
      }), this.configuration = r, this.updater = i, this.defaultHostname = "api.keygen.sh";
      const o = this.configuration.host || this.defaultHostname;
      this.baseUrl = (0, t.newBaseUrl)(`https://${o}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
    }
    get channel() {
      return this.updater.channel || this.configuration.channel || "stable";
    }
    async getLatestVersion() {
      const r = new e.CancellationToken(), i = (0, t.getChannelFilename)(this.getCustomChannelName(this.channel)), u = (0, t.newUrlFromBase)(i, this.baseUrl, this.updater.isAddNoCacheQuery);
      try {
        const o = await this.httpRequest(u, {
          Accept: "application/vnd.api+json",
          "Keygen-Version": "1.1"
        }, r);
        return (0, a.parseUpdateInfo)(o, i, u);
      } catch (o) {
        throw (0, e.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    resolveFiles(r) {
      return (0, a.resolveFiles)(r, this.baseUrl);
    }
    toString() {
      const { account: r, product: i, platform: u } = this.configuration;
      return `Keygen (account: ${r}, product: ${i}, platform: ${u}, channel: ${this.channel})`;
    }
  };
  return pn.KeygenProvider = n, pn;
}
var mn = {}, ph;
function nE() {
  if (ph) return mn;
  ph = 1, Object.defineProperty(mn, "__esModule", { value: !0 }), mn.PrivateGitHubProvider = void 0;
  const e = rt(), t = Zu(), a = Ge, n = Yr, l = Dr(), r = i0(), i = Rt();
  let u = class extends r.BaseGitHubProvider {
    constructor(c, s, d, f) {
      super(c, "api.github.com", f), this.updater = s, this.token = d;
    }
    createRequestOptions(c, s) {
      const d = super.createRequestOptions(c, s);
      return d.redirect = "manual", d;
    }
    async getLatestVersion() {
      const c = new e.CancellationToken(), s = (0, l.getChannelFilename)(this.getDefaultChannelName()), d = await this.getLatestVersionInfo(c), f = d.assets.find((v) => v.name === s);
      if (f == null)
        throw (0, e.newError)(`Cannot find ${s} in the release ${d.html_url || d.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
      const m = new n.URL(f.url);
      let y;
      try {
        y = (0, t.load)(await this.httpRequest(m, this.configureHeaders("application/octet-stream"), c));
      } catch (v) {
        throw v instanceof e.HttpError && v.statusCode === 404 ? (0, e.newError)(`Cannot find ${s} in the latest release artifacts (${m}): ${v.stack || v.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : v;
      }
      return y.assets = d.assets, y;
    }
    get fileExtraDownloadHeaders() {
      return this.configureHeaders("application/octet-stream");
    }
    configureHeaders(c) {
      return {
        accept: c,
        authorization: `token ${this.token}`
      };
    }
    async getLatestVersionInfo(c) {
      const s = this.updater.allowPrerelease;
      let d = this.basePath;
      s || (d = `${d}/latest`);
      const f = (0, l.newUrlFromBase)(d, this.baseUrl);
      try {
        const m = JSON.parse(await this.httpRequest(f, this.configureHeaders("application/vnd.github.v3+json"), c));
        return s ? m.find((y) => y.prerelease) || m[0] : m;
      } catch (m) {
        throw (0, e.newError)(`Unable to find latest version on GitHub (${f}), please ensure a production release exists: ${m.stack || m.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
      }
    }
    get basePath() {
      return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
    }
    resolveFiles(c) {
      return (0, i.getFileList)(c).map((s) => {
        const d = a.posix.basename(s.url).replace(/ /g, "-"), f = c.assets.find((m) => m != null && m.name === d);
        if (f == null)
          throw (0, e.newError)(`Cannot find asset "${d}" in: ${JSON.stringify(c.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
        return {
          url: new n.URL(f.url),
          info: s
        };
      });
    }
  };
  return mn.PrivateGitHubProvider = u, mn;
}
var mh;
function iE() {
  if (mh) return dn;
  mh = 1, Object.defineProperty(dn, "__esModule", { value: !0 }), dn.isUrlProbablySupportMultiRangeRequests = i, dn.createClient = u;
  const e = rt(), t = tE(), a = n0(), n = i0(), l = rE(), r = nE();
  function i(o) {
    return !o.includes("s3.amazonaws.com");
  }
  function u(o, c, s) {
    if (typeof o == "string")
      throw (0, e.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
    const d = o.provider;
    switch (d) {
      case "github": {
        const f = o, m = (f.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || f.token;
        return m == null ? new n.GitHubProvider(f, c, s) : new r.PrivateGitHubProvider(f, c, m, s);
      }
      case "bitbucket":
        return new t.BitbucketProvider(o, c, s);
      case "keygen":
        return new l.KeygenProvider(o, c, s);
      case "s3":
      case "spaces":
        return new a.GenericProvider({
          provider: "generic",
          url: (0, e.getS3LikeProviderBaseUrl)(o),
          channel: o.channel || null
        }, c, {
          ...s,
          // https://github.com/minio/minio/issues/5285#issuecomment-350428955
          isUseMultipleRangeRequest: !1
        });
      case "generic": {
        const f = o;
        return new a.GenericProvider(f, c, {
          ...s,
          isUseMultipleRangeRequest: f.useMultipleRangeRequest !== !1 && i(f.url)
        });
      }
      case "custom": {
        const f = o, m = f.updateProvider;
        if (!m)
          throw (0, e.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
        return new m(f, c, s);
      }
      default:
        throw (0, e.newError)(`Unsupported provider: ${d}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
    }
  }
  return dn;
}
var gn = {}, yn = {}, jr = {}, Mr = {}, gh;
function sl() {
  if (gh) return Mr;
  gh = 1, Object.defineProperty(Mr, "__esModule", { value: !0 }), Mr.OperationKind = void 0, Mr.computeOperations = t;
  var e;
  (function(i) {
    i[i.COPY = 0] = "COPY", i[i.DOWNLOAD = 1] = "DOWNLOAD";
  })(e || (Mr.OperationKind = e = {}));
  function t(i, u, o) {
    const c = r(i.files), s = r(u.files);
    let d = null;
    const f = u.files[0], m = [], y = f.name, v = c.get(y);
    if (v == null)
      throw new Error(`no file ${y} in old blockmap`);
    const h = s.get(y);
    let g = 0;
    const { checksumToOffset: p, checksumToOldSize: E } = l(c.get(y), v.offset, o);
    let b = f.offset;
    for (let $ = 0; $ < h.checksums.length; b += h.sizes[$], $++) {
      const _ = h.sizes[$], w = h.checksums[$];
      let T = p.get(w);
      T != null && E.get(w) !== _ && (o.warn(`Checksum ("${w}") matches, but size differs (old: ${E.get(w)}, new: ${_})`), T = void 0), T === void 0 ? (g++, d != null && d.kind === e.DOWNLOAD && d.end === b ? d.end += _ : (d = {
        kind: e.DOWNLOAD,
        start: b,
        end: b + _
        // oldBlocks: null,
      }, n(d, m, w, $))) : d != null && d.kind === e.COPY && d.end === T ? d.end += _ : (d = {
        kind: e.COPY,
        start: T,
        end: T + _
        // oldBlocks: [checksum]
      }, n(d, m, w, $));
    }
    return g > 0 && o.info(`File${f.name === "file" ? "" : " " + f.name} has ${g} changed blocks`), m;
  }
  const a = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
  function n(i, u, o, c) {
    if (a && u.length !== 0) {
      const s = u[u.length - 1];
      if (s.kind === i.kind && i.start < s.end && i.start > s.start) {
        const d = [s.start, s.end, i.start, i.end].reduce((f, m) => f < m ? f : m);
        throw new Error(`operation (block index: ${c}, checksum: ${o}, kind: ${e[i.kind]}) overlaps previous operation (checksum: ${o}):
abs: ${s.start} until ${s.end} and ${i.start} until ${i.end}
rel: ${s.start - d} until ${s.end - d} and ${i.start - d} until ${i.end - d}`);
      }
    }
    u.push(i);
  }
  function l(i, u, o) {
    const c = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map();
    let d = u;
    for (let f = 0; f < i.checksums.length; f++) {
      const m = i.checksums[f], y = i.sizes[f], v = s.get(m);
      if (v === void 0)
        c.set(m, d), s.set(m, y);
      else if (o.debug != null) {
        const h = v === y ? "(same size)" : `(size: ${v}, this size: ${y})`;
        o.debug(`${m} duplicated in blockmap ${h}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
      }
      d += y;
    }
    return { checksumToOffset: c, checksumToOldSize: s };
  }
  function r(i) {
    const u = /* @__PURE__ */ new Map();
    for (const o of i)
      u.set(o.name, o);
    return u;
  }
  return Mr;
}
var yh;
function a0() {
  if (yh) return jr;
  yh = 1, Object.defineProperty(jr, "__esModule", { value: !0 }), jr.DataSplitter = void 0, jr.copyData = i;
  const e = rt(), t = At, a = Dn, n = sl(), l = Buffer.from(`\r
\r
`);
  var r;
  (function(o) {
    o[o.INIT = 0] = "INIT", o[o.HEADER = 1] = "HEADER", o[o.BODY = 2] = "BODY";
  })(r || (r = {}));
  function i(o, c, s, d, f) {
    const m = (0, t.createReadStream)("", {
      fd: s,
      autoClose: !1,
      start: o.start,
      // end is inclusive
      end: o.end - 1
    });
    m.on("error", d), m.once("end", f), m.pipe(c, {
      end: !1
    });
  }
  let u = class extends a.Writable {
    constructor(c, s, d, f, m, y) {
      super(), this.out = c, this.options = s, this.partIndexToTaskIndex = d, this.partIndexToLength = m, this.finishHandler = y, this.partIndex = -1, this.headerListBuffer = null, this.readState = r.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = f.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
    }
    get isFinished() {
      return this.partIndex === this.partIndexToLength.length;
    }
    // noinspection JSUnusedGlobalSymbols
    _write(c, s, d) {
      if (this.isFinished) {
        console.error(`Trailing ignored data: ${c.length} bytes`);
        return;
      }
      this.handleData(c).then(d).catch(d);
    }
    async handleData(c) {
      let s = 0;
      if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
        throw (0, e.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
      if (this.ignoreByteCount > 0) {
        const d = Math.min(this.ignoreByteCount, c.length);
        this.ignoreByteCount -= d, s = d;
      } else if (this.remainingPartDataCount > 0) {
        const d = Math.min(this.remainingPartDataCount, c.length);
        this.remainingPartDataCount -= d, await this.processPartData(c, 0, d), s = d;
      }
      if (s !== c.length) {
        if (this.readState === r.HEADER) {
          const d = this.searchHeaderListEnd(c, s);
          if (d === -1)
            return;
          s = d, this.readState = r.BODY, this.headerListBuffer = null;
        }
        for (; ; ) {
          if (this.readState === r.BODY)
            this.readState = r.INIT;
          else {
            this.partIndex++;
            let y = this.partIndexToTaskIndex.get(this.partIndex);
            if (y == null)
              if (this.isFinished)
                y = this.options.end;
              else
                throw (0, e.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
            const v = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
            if (v < y)
              await this.copyExistingData(v, y);
            else if (v > y)
              throw (0, e.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
            if (this.isFinished) {
              this.onPartEnd(), this.finishHandler();
              return;
            }
            if (s = this.searchHeaderListEnd(c, s), s === -1) {
              this.readState = r.HEADER;
              return;
            }
          }
          const d = this.partIndexToLength[this.partIndex], f = s + d, m = Math.min(f, c.length);
          if (await this.processPartStarted(c, s, m), this.remainingPartDataCount = d - (m - s), this.remainingPartDataCount > 0)
            return;
          if (s = f + this.boundaryLength, s >= c.length) {
            this.ignoreByteCount = this.boundaryLength - (c.length - f);
            return;
          }
        }
      }
    }
    copyExistingData(c, s) {
      return new Promise((d, f) => {
        const m = () => {
          if (c === s) {
            d();
            return;
          }
          const y = this.options.tasks[c];
          if (y.kind !== n.OperationKind.COPY) {
            f(new Error("Task kind must be COPY"));
            return;
          }
          i(y, this.out, this.options.oldFileFd, f, () => {
            c++, m();
          });
        };
        m();
      });
    }
    searchHeaderListEnd(c, s) {
      const d = c.indexOf(l, s);
      if (d !== -1)
        return d + l.length;
      const f = s === 0 ? c : c.slice(s);
      return this.headerListBuffer == null ? this.headerListBuffer = f : this.headerListBuffer = Buffer.concat([this.headerListBuffer, f]), -1;
    }
    onPartEnd() {
      const c = this.partIndexToLength[this.partIndex - 1];
      if (this.actualPartLength !== c)
        throw (0, e.newError)(`Expected length: ${c} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
      this.actualPartLength = 0;
    }
    processPartStarted(c, s, d) {
      return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(c, s, d);
    }
    processPartData(c, s, d) {
      this.actualPartLength += d - s;
      const f = this.out;
      return f.write(s === 0 && c.length === d ? c : c.slice(s, d)) ? Promise.resolve() : new Promise((m, y) => {
        f.on("error", y), f.once("drain", () => {
          f.removeListener("error", y), m();
        });
      });
    }
  };
  return jr.DataSplitter = u, jr;
}
var vn = {}, vh;
function aE() {
  if (vh) return vn;
  vh = 1, Object.defineProperty(vn, "__esModule", { value: !0 }), vn.executeTasksUsingMultipleRangeRequests = n, vn.checkIsRangesSupported = r;
  const e = rt(), t = a0(), a = sl();
  function n(i, u, o, c, s) {
    const d = (f) => {
      if (f >= u.length) {
        i.fileMetadataBuffer != null && o.write(i.fileMetadataBuffer), o.end();
        return;
      }
      const m = f + 1e3;
      l(i, {
        tasks: u,
        start: f,
        end: Math.min(u.length, m),
        oldFileFd: c
      }, o, () => d(m), s);
    };
    return d;
  }
  function l(i, u, o, c, s) {
    let d = "bytes=", f = 0;
    const m = /* @__PURE__ */ new Map(), y = [];
    for (let g = u.start; g < u.end; g++) {
      const p = u.tasks[g];
      p.kind === a.OperationKind.DOWNLOAD && (d += `${p.start}-${p.end - 1}, `, m.set(f, g), f++, y.push(p.end - p.start));
    }
    if (f <= 1) {
      const g = (p) => {
        if (p >= u.end) {
          c();
          return;
        }
        const E = u.tasks[p++];
        if (E.kind === a.OperationKind.COPY)
          (0, t.copyData)(E, o, u.oldFileFd, s, () => g(p));
        else {
          const b = i.createRequestOptions();
          b.headers.Range = `bytes=${E.start}-${E.end - 1}`;
          const $ = i.httpExecutor.createRequest(b, (_) => {
            r(_, s) && (_.pipe(o, {
              end: !1
            }), _.once("end", () => g(p)));
          });
          i.httpExecutor.addErrorAndTimeoutHandlers($, s), $.end();
        }
      };
      g(u.start);
      return;
    }
    const v = i.createRequestOptions();
    v.headers.Range = d.substring(0, d.length - 2);
    const h = i.httpExecutor.createRequest(v, (g) => {
      if (!r(g, s))
        return;
      const p = (0, e.safeGetHeader)(g, "content-type"), E = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(p);
      if (E == null) {
        s(new Error(`Content-Type "multipart/byteranges" is expected, but got "${p}"`));
        return;
      }
      const b = new t.DataSplitter(o, u, m, E[1] || E[2], y, c);
      b.on("error", s), g.pipe(b), g.on("end", () => {
        setTimeout(() => {
          h.abort(), s(new Error("Response ends without calling any handlers"));
        }, 1e4);
      });
    });
    i.httpExecutor.addErrorAndTimeoutHandlers(h, s), h.end();
  }
  function r(i, u) {
    if (i.statusCode >= 400)
      return u((0, e.createHttpError)(i)), !1;
    if (i.statusCode !== 206) {
      const o = (0, e.safeGetHeader)(i, "accept-ranges");
      if (o == null || o === "none")
        return u(new Error(`Server doesn't support Accept-Ranges (response code ${i.statusCode})`)), !1;
    }
    return !0;
  }
  return vn;
}
var _n = {}, _h;
function sE() {
  if (_h) return _n;
  _h = 1, Object.defineProperty(_n, "__esModule", { value: !0 }), _n.ProgressDifferentialDownloadCallbackTransform = void 0;
  const e = Dn;
  var t;
  (function(n) {
    n[n.COPY = 0] = "COPY", n[n.DOWNLOAD = 1] = "DOWNLOAD";
  })(t || (t = {}));
  let a = class extends e.Transform {
    constructor(l, r, i) {
      super(), this.progressDifferentialDownloadInfo = l, this.cancellationToken = r, this.onProgress = i, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = t.COPY, this.nextUpdate = this.start + 1e3;
    }
    _transform(l, r, i) {
      if (this.cancellationToken.cancelled) {
        i(new Error("cancelled"), null);
        return;
      }
      if (this.operationType == t.COPY) {
        i(null, l);
        return;
      }
      this.transferred += l.length, this.delta += l.length;
      const u = Date.now();
      u >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = u + 1e3, this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((u - this.start) / 1e3))
      }), this.delta = 0), i(null, l);
    }
    beginFileCopy() {
      this.operationType = t.COPY;
    }
    beginRangeDownload() {
      this.operationType = t.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
    }
    endRangeDownload() {
      this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      });
    }
    // Called when we are 100% done with the connection/download
    _flush(l) {
      if (this.cancellationToken.cancelled) {
        l(new Error("cancelled"));
        return;
      }
      this.onProgress({
        total: this.progressDifferentialDownloadInfo.grandTotal,
        delta: this.delta,
        transferred: this.transferred,
        percent: 100,
        bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
      }), this.delta = 0, this.transferred = 0, l(null);
    }
  };
  return _n.ProgressDifferentialDownloadCallbackTransform = a, _n;
}
var Eh;
function s0() {
  if (Eh) return yn;
  Eh = 1, Object.defineProperty(yn, "__esModule", { value: !0 }), yn.DifferentialDownloader = void 0;
  const e = rt(), t = /* @__PURE__ */ fr(), a = At, n = a0(), l = Yr, r = sl(), i = aE(), u = sE();
  let o = class {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(f, m, y) {
      this.blockAwareFileInfo = f, this.httpExecutor = m, this.options = y, this.fileMetadataBuffer = null, this.logger = y.logger;
    }
    createRequestOptions() {
      const f = {
        headers: {
          ...this.options.requestHeaders,
          accept: "*/*"
        }
      };
      return (0, e.configureRequestUrl)(this.options.newUrl, f), (0, e.configureRequestOptions)(f), f;
    }
    doDownload(f, m) {
      if (f.version !== m.version)
        throw new Error(`version is different (${f.version} - ${m.version}), full download is required`);
      const y = this.logger, v = (0, r.computeOperations)(f, m, y);
      y.debug != null && y.debug(JSON.stringify(v, null, 2));
      let h = 0, g = 0;
      for (const E of v) {
        const b = E.end - E.start;
        E.kind === r.OperationKind.DOWNLOAD ? h += b : g += b;
      }
      const p = this.blockAwareFileInfo.size;
      if (h + g + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== p)
        throw new Error(`Internal error, size mismatch: downloadSize: ${h}, copySize: ${g}, newSize: ${p}`);
      return y.info(`Full: ${c(p)}, To download: ${c(h)} (${Math.round(h / (p / 100))}%)`), this.downloadFile(v);
    }
    downloadFile(f) {
      const m = [], y = () => Promise.all(m.map((v) => (0, t.close)(v.descriptor).catch((h) => {
        this.logger.error(`cannot close file "${v.path}": ${h}`);
      })));
      return this.doDownloadFile(f, m).then(y).catch((v) => y().catch((h) => {
        try {
          this.logger.error(`cannot close files: ${h}`);
        } catch (g) {
          try {
            console.error(g);
          } catch {
          }
        }
        throw v;
      }).then(() => {
        throw v;
      }));
    }
    async doDownloadFile(f, m) {
      const y = await (0, t.open)(this.options.oldFile, "r");
      m.push({ descriptor: y, path: this.options.oldFile });
      const v = await (0, t.open)(this.options.newFile, "w");
      m.push({ descriptor: v, path: this.options.newFile });
      const h = (0, a.createWriteStream)(this.options.newFile, { fd: v });
      await new Promise((g, p) => {
        const E = [];
        let b;
        if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
          const M = [];
          let K = 0;
          for (const F of f)
            F.kind === r.OperationKind.DOWNLOAD && (M.push(F.end - F.start), K += F.end - F.start);
          const k = {
            expectedByteCounts: M,
            grandTotal: K
          };
          b = new u.ProgressDifferentialDownloadCallbackTransform(k, this.options.cancellationToken, this.options.onProgress), E.push(b);
        }
        const $ = new e.DigestTransform(this.blockAwareFileInfo.sha512);
        $.isValidateOnEnd = !1, E.push($), h.on("finish", () => {
          h.close(() => {
            m.splice(1, 1);
            try {
              $.validate();
            } catch (M) {
              p(M);
              return;
            }
            g(void 0);
          });
        }), E.push(h);
        let _ = null;
        for (const M of E)
          M.on("error", p), _ == null ? _ = M : _ = _.pipe(M);
        const w = E[0];
        let T;
        if (this.options.isUseMultipleRangeRequest) {
          T = (0, i.executeTasksUsingMultipleRangeRequests)(this, f, w, y, p), T(0);
          return;
        }
        let P = 0, G = null;
        this.logger.info(`Differential download: ${this.options.newUrl}`);
        const q = this.createRequestOptions();
        q.redirect = "manual", T = (M) => {
          var K, k;
          if (M >= f.length) {
            this.fileMetadataBuffer != null && w.write(this.fileMetadataBuffer), w.end();
            return;
          }
          const F = f[M++];
          if (F.kind === r.OperationKind.COPY) {
            b && b.beginFileCopy(), (0, n.copyData)(F, w, y, p, () => T(M));
            return;
          }
          const Y = `bytes=${F.start}-${F.end - 1}`;
          q.headers.range = Y, (k = (K = this.logger) === null || K === void 0 ? void 0 : K.debug) === null || k === void 0 || k.call(K, `download range: ${Y}`), b && b.beginRangeDownload();
          const B = this.httpExecutor.createRequest(q, (W) => {
            W.on("error", p), W.on("aborted", () => {
              p(new Error("response has been aborted by the server"));
            }), W.statusCode >= 400 && p((0, e.createHttpError)(W)), W.pipe(w, {
              end: !1
            }), W.once("end", () => {
              b && b.endRangeDownload(), ++P === 100 ? (P = 0, setTimeout(() => T(M), 1e3)) : T(M);
            });
          });
          B.on("redirect", (W, Z, V) => {
            this.logger.info(`Redirect to ${s(V)}`), G = V, (0, e.configureRequestUrl)(new l.URL(G), q), B.followRedirect();
          }), this.httpExecutor.addErrorAndTimeoutHandlers(B, p), B.end();
        }, T(0);
      });
    }
    async readRemoteBytes(f, m) {
      const y = Buffer.allocUnsafe(m + 1 - f), v = this.createRequestOptions();
      v.headers.range = `bytes=${f}-${m}`;
      let h = 0;
      if (await this.request(v, (g) => {
        g.copy(y, h), h += g.length;
      }), h !== y.length)
        throw new Error(`Received data length ${h} is not equal to expected ${y.length}`);
      return y;
    }
    request(f, m) {
      return new Promise((y, v) => {
        const h = this.httpExecutor.createRequest(f, (g) => {
          (0, i.checkIsRangesSupported)(g, v) && (g.on("error", v), g.on("aborted", () => {
            v(new Error("response has been aborted by the server"));
          }), g.on("data", m), g.on("end", () => y()));
        });
        this.httpExecutor.addErrorAndTimeoutHandlers(h, v), h.end();
      });
    }
  };
  yn.DifferentialDownloader = o;
  function c(d, f = " KB") {
    return new Intl.NumberFormat("en").format((d / 1024).toFixed(2)) + f;
  }
  function s(d) {
    const f = d.indexOf("?");
    return f < 0 ? d : d.substring(0, f);
  }
  return yn;
}
var wh;
function oE() {
  if (wh) return gn;
  wh = 1, Object.defineProperty(gn, "__esModule", { value: !0 }), gn.GenericDifferentialDownloader = void 0;
  const e = s0();
  let t = class extends e.DifferentialDownloader {
    download(n, l) {
      return this.doDownload(n, l);
    }
  };
  return gn.GenericDifferentialDownloader = t, gn;
}
var bc = {}, $h;
function kr() {
  return $h || ($h = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
    const t = rt();
    Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
      return t.CancellationToken;
    } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
    class a {
      constructor(r) {
        this.emitter = r;
      }
      /**
       * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
       */
      login(r) {
        n(this.emitter, "login", r);
      }
      progress(r) {
        n(this.emitter, e.DOWNLOAD_PROGRESS, r);
      }
      updateDownloaded(r) {
        n(this.emitter, e.UPDATE_DOWNLOADED, r);
      }
      updateCancelled(r) {
        n(this.emitter, "update-cancelled", r);
      }
    }
    e.UpdaterSignal = a;
    function n(l, r, i) {
      l.on(r, i);
    }
  })(bc)), bc;
}
var Sh;
function ol() {
  if (Sh) return Er;
  Sh = 1, Object.defineProperty(Er, "__esModule", { value: !0 }), Er.NoOpLogger = Er.AppUpdater = void 0;
  const e = rt(), t = kn, a = Za, n = Py, l = /* @__PURE__ */ fr(), r = Zu(), i = b_(), u = Ge, o = r0(), c = Y_(), s = Q_(), d = Z_(), f = n0(), m = iE(), y = Iy, v = Dr(), h = oE(), g = kr();
  let p = class o0 extends n.EventEmitter {
    /**
     * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
     */
    get channel() {
      return this._channel;
    }
    /**
     * Set the update channel. Overrides `channel` in the update configuration.
     *
     * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
     */
    set channel(_) {
      if (this._channel != null) {
        if (typeof _ != "string")
          throw (0, e.newError)(`Channel must be a string, but got: ${_}`, "ERR_UPDATER_INVALID_CHANNEL");
        if (_.length === 0)
          throw (0, e.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
      }
      this._channel = _, this.allowDowngrade = !0;
    }
    /**
     *  Shortcut for explicitly adding auth tokens to request headers
     */
    addAuthHeader(_) {
      this.requestHeaders = Object.assign({}, this.requestHeaders, {
        authorization: _
      });
    }
    // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    get netSession() {
      return (0, d.getNetSession)();
    }
    /**
     * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
     * Set it to `null` if you would like to disable a logging feature.
     */
    get logger() {
      return this._logger;
    }
    set logger(_) {
      this._logger = _ ?? new b();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     * test only
     * @private
     */
    set updateConfigPath(_) {
      this.clientPromise = null, this._appUpdateConfigPath = _, this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig());
    }
    /**
     * Allows developer to override default logic for determining if an update is supported.
     * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
     */
    get isUpdateSupported() {
      return this._isUpdateSupported;
    }
    set isUpdateSupported(_) {
      _ && (this._isUpdateSupported = _);
    }
    constructor(_, w) {
      super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new g.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (G) => this.checkIfUpdateSupported(G), this.clientPromise = null, this.stagingUserIdPromise = new i.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new i.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (G) => {
        this._logger.error(`Error: ${G.stack || G.message}`);
      }), w == null ? (this.app = new s.ElectronAppAdapter(), this.httpExecutor = new d.ElectronHttpExecutor((G, q) => this.emit("login", G, q))) : (this.app = w, this.httpExecutor = null);
      const T = this.app.version, P = (0, o.parse)(T);
      if (P == null)
        throw (0, e.newError)(`App version is not a valid semver version: "${T}"`, "ERR_UPDATER_INVALID_VERSION");
      this.currentVersion = P, this.allowPrerelease = E(P), _ != null && (this.setFeedURL(_), typeof _ != "string" && _.requestHeaders && (this.requestHeaders = _.requestHeaders));
    }
    //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
    getFeedURL() {
      return "Deprecated. Do not use it.";
    }
    /**
     * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
     * @param options If you want to override configuration in the `app-update.yml`.
     */
    setFeedURL(_) {
      const w = this.createProviderRuntimeOptions();
      let T;
      typeof _ == "string" ? T = new f.GenericProvider({ provider: "generic", url: _ }, this, {
        ...w,
        isUseMultipleRangeRequest: (0, m.isUrlProbablySupportMultiRangeRequests)(_)
      }) : T = (0, m.createClient)(_, this, w), this.clientPromise = Promise.resolve(T);
    }
    /**
     * Asks the server whether there is an update.
     * @returns null if the updater is disabled, otherwise info about the latest version
     */
    checkForUpdates() {
      if (!this.isUpdaterActive())
        return Promise.resolve(null);
      let _ = this.checkForUpdatesPromise;
      if (_ != null)
        return this._logger.info("Checking for update (already in progress)"), _;
      const w = () => this.checkForUpdatesPromise = null;
      return this._logger.info("Checking for update"), _ = this.doCheckForUpdates().then((T) => (w(), T)).catch((T) => {
        throw w(), this.emit("error", T, `Cannot check for updates: ${(T.stack || T).toString()}`), T;
      }), this.checkForUpdatesPromise = _, _;
    }
    isUpdaterActive() {
      return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
    }
    // noinspection JSUnusedGlobalSymbols
    checkForUpdatesAndNotify(_) {
      return this.checkForUpdates().then((w) => w?.downloadPromise ? (w.downloadPromise.then(() => {
        const T = o0.formatDownloadNotification(w.updateInfo.version, this.app.name, _);
        new Jt.Notification(T).show();
      }), w) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), w));
    }
    static formatDownloadNotification(_, w, T) {
      return T == null && (T = {
        title: "A new update is ready to install",
        body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
      }), T = {
        title: T.title.replace("{appName}", w).replace("{version}", _),
        body: T.body.replace("{appName}", w).replace("{version}", _)
      }, T;
    }
    async isStagingMatch(_) {
      const w = _.stagingPercentage;
      let T = w;
      if (T == null)
        return !0;
      if (T = parseInt(T, 10), isNaN(T))
        return this._logger.warn(`Staging percentage is NaN: ${w}`), !0;
      T = T / 100;
      const P = await this.stagingUserIdPromise.value, q = e.UUID.parse(P).readUInt32BE(12) / 4294967295;
      return this._logger.info(`Staging percentage: ${T}, percentage: ${q}, user id: ${P}`), q < T;
    }
    computeFinalHeaders(_) {
      return this.requestHeaders != null && Object.assign(_, this.requestHeaders), _;
    }
    async isUpdateAvailable(_) {
      const w = (0, o.parse)(_.version);
      if (w == null)
        throw (0, e.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${_.version}"`, "ERR_UPDATER_INVALID_VERSION");
      const T = this.currentVersion;
      if ((0, o.eq)(w, T) || !await Promise.resolve(this.isUpdateSupported(_)) || !await this.isStagingMatch(_))
        return !1;
      const G = (0, o.gt)(w, T), q = (0, o.lt)(w, T);
      return G ? !0 : this.allowDowngrade && q;
    }
    checkIfUpdateSupported(_) {
      const w = _?.minimumSystemVersion, T = (0, a.release)();
      if (w)
        try {
          if ((0, o.lt)(T, w))
            return this._logger.info(`Current OS version ${T} is less than the minimum OS version required ${w} for version ${T}`), !1;
        } catch (P) {
          this._logger.warn(`Failed to compare current OS version(${T}) with minimum OS version(${w}): ${(P.message || P).toString()}`);
        }
      return !0;
    }
    async getUpdateInfoAndProvider() {
      await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((T) => (0, m.createClient)(T, this, this.createProviderRuntimeOptions())));
      const _ = await this.clientPromise, w = await this.stagingUserIdPromise.value;
      return _.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": w })), {
        info: await _.getLatestVersion(),
        provider: _
      };
    }
    createProviderRuntimeOptions() {
      return {
        isUseMultipleRangeRequest: !0,
        platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
        executor: this.httpExecutor
      };
    }
    async doCheckForUpdates() {
      this.emit("checking-for-update");
      const _ = await this.getUpdateInfoAndProvider(), w = _.info;
      if (!await this.isUpdateAvailable(w))
        return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${w.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", w), {
          isUpdateAvailable: !1,
          versionInfo: w,
          updateInfo: w
        };
      this.updateInfoAndProvider = _, this.onUpdateAvailable(w);
      const T = new e.CancellationToken();
      return {
        isUpdateAvailable: !0,
        versionInfo: w,
        updateInfo: w,
        cancellationToken: T,
        downloadPromise: this.autoDownload ? this.downloadUpdate(T) : null
      };
    }
    onUpdateAvailable(_) {
      this._logger.info(`Found version ${_.version} (url: ${(0, e.asArray)(_.files).map((w) => w.url).join(", ")})`), this.emit("update-available", _);
    }
    /**
     * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
     * @returns {Promise<Array<string>>} Paths to downloaded files.
     */
    downloadUpdate(_ = new e.CancellationToken()) {
      const w = this.updateInfoAndProvider;
      if (w == null) {
        const P = new Error("Please check update first");
        return this.dispatchError(P), Promise.reject(P);
      }
      if (this.downloadPromise != null)
        return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
      this._logger.info(`Downloading update from ${(0, e.asArray)(w.info.files).map((P) => P.url).join(", ")}`);
      const T = (P) => {
        if (!(P instanceof e.CancellationError))
          try {
            this.dispatchError(P);
          } catch (G) {
            this._logger.warn(`Cannot dispatch error event: ${G.stack || G}`);
          }
        return P;
      };
      return this.downloadPromise = this.doDownloadUpdate({
        updateInfoAndProvider: w,
        requestHeaders: this.computeRequestHeaders(w.provider),
        cancellationToken: _,
        disableWebInstaller: this.disableWebInstaller,
        disableDifferentialDownload: this.disableDifferentialDownload
      }).catch((P) => {
        throw T(P);
      }).finally(() => {
        this.downloadPromise = null;
      }), this.downloadPromise;
    }
    dispatchError(_) {
      this.emit("error", _, (_.stack || _).toString());
    }
    dispatchUpdateDownloaded(_) {
      this.emit(g.UPDATE_DOWNLOADED, _);
    }
    async loadUpdateConfig() {
      return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, r.load)(await (0, l.readFile)(this._appUpdateConfigPath, "utf-8"));
    }
    computeRequestHeaders(_) {
      const w = _.fileExtraDownloadHeaders;
      if (w != null) {
        const T = this.requestHeaders;
        return T == null ? w : {
          ...w,
          ...T
        };
      }
      return this.computeFinalHeaders({ accept: "*/*" });
    }
    async getOrCreateStagingUserId() {
      const _ = u.join(this.app.userDataPath, ".updaterId");
      try {
        const T = await (0, l.readFile)(_, "utf-8");
        if (e.UUID.check(T))
          return T;
        this._logger.warn(`Staging user id file exists, but content was invalid: ${T}`);
      } catch (T) {
        T.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${T}`);
      }
      const w = e.UUID.v5((0, t.randomBytes)(4096), e.UUID.OID);
      this._logger.info(`Generated new staging user ID: ${w}`);
      try {
        await (0, l.outputFile)(_, w);
      } catch (T) {
        this._logger.warn(`Couldn't write out staging user ID: ${T}`);
      }
      return w;
    }
    /** @internal */
    get isAddNoCacheQuery() {
      const _ = this.requestHeaders;
      if (_ == null)
        return !0;
      for (const w of Object.keys(_)) {
        const T = w.toLowerCase();
        if (T === "authorization" || T === "private-token")
          return !1;
      }
      return !0;
    }
    async getOrCreateDownloadHelper() {
      let _ = this.downloadedUpdateHelper;
      if (_ == null) {
        const w = (await this.configOnDisk.value).updaterCacheDirName, T = this._logger;
        w == null && T.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
        const P = u.join(this.app.baseCachePath, w || this.app.name);
        T.debug != null && T.debug(`updater cache dir: ${P}`), _ = new c.DownloadedUpdateHelper(P), this.downloadedUpdateHelper = _;
      }
      return _;
    }
    async executeDownload(_) {
      const w = _.fileInfo, T = {
        headers: _.downloadUpdateOptions.requestHeaders,
        cancellationToken: _.downloadUpdateOptions.cancellationToken,
        sha2: w.info.sha2,
        sha512: w.info.sha512
      };
      this.listenerCount(g.DOWNLOAD_PROGRESS) > 0 && (T.onProgress = (D) => this.emit(g.DOWNLOAD_PROGRESS, D));
      const P = _.downloadUpdateOptions.updateInfoAndProvider.info, G = P.version, q = w.packageInfo;
      function M() {
        const D = decodeURIComponent(_.fileInfo.url.pathname);
        return D.endsWith(`.${_.fileExtension}`) ? u.basename(D) : _.fileInfo.info.url;
      }
      const K = await this.getOrCreateDownloadHelper(), k = K.cacheDirForPendingUpdate;
      await (0, l.mkdir)(k, { recursive: !0 });
      const F = M();
      let Y = u.join(k, F);
      const B = q == null ? null : u.join(k, `package-${G}${u.extname(q.path) || ".7z"}`), W = async (D) => (await K.setDownloadedFile(Y, B, P, w, F, D), await _.done({
        ...P,
        downloadedFile: Y
      }), B == null ? [Y] : [Y, B]), Z = this._logger, V = await K.validateDownloadedPath(Y, P, w, Z);
      if (V != null)
        return Y = V, await W(!1);
      const C = async () => (await K.clear().catch(() => {
      }), await (0, l.unlink)(Y).catch(() => {
      })), j = await (0, c.createTempUpdateFile)(`temp-${F}`, k, Z);
      try {
        await _.task(j, T, B, C), await (0, e.retry)(() => (0, l.rename)(j, Y), 60, 500, 0, 0, (D) => D instanceof Error && /^EBUSY:/.test(D.message));
      } catch (D) {
        throw await C(), D instanceof e.CancellationError && (Z.info("cancelled"), this.emit("update-cancelled", P)), D;
      }
      return Z.info(`New version ${G} has been downloaded to ${Y}`), await W(!0);
    }
    async differentialDownloadInstaller(_, w, T, P, G) {
      try {
        if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
          return !0;
        const q = (0, v.blockmapFiles)(_.url, this.app.version, w.updateInfoAndProvider.info.version);
        this._logger.info(`Download block maps (old: "${q[0]}", new: ${q[1]})`);
        const M = async (F) => {
          const Y = await this.httpExecutor.downloadToBuffer(F, {
            headers: w.requestHeaders,
            cancellationToken: w.cancellationToken
          });
          if (Y == null || Y.length === 0)
            throw new Error(`Blockmap "${F.href}" is empty`);
          try {
            return JSON.parse((0, y.gunzipSync)(Y).toString());
          } catch (B) {
            throw new Error(`Cannot parse blockmap "${F.href}", error: ${B}`);
          }
        }, K = {
          newUrl: _.url,
          oldFile: u.join(this.downloadedUpdateHelper.cacheDir, G),
          logger: this._logger,
          newFile: T,
          isUseMultipleRangeRequest: P.isUseMultipleRangeRequest,
          requestHeaders: w.requestHeaders,
          cancellationToken: w.cancellationToken
        };
        this.listenerCount(g.DOWNLOAD_PROGRESS) > 0 && (K.onProgress = (F) => this.emit(g.DOWNLOAD_PROGRESS, F));
        const k = await Promise.all(q.map((F) => M(F)));
        return await new h.GenericDifferentialDownloader(_.info, this.httpExecutor, K).download(k[0], k[1]), !1;
      } catch (q) {
        if (this._logger.error(`Cannot download differentially, fallback to full download: ${q.stack || q}`), this._testOnlyOptions != null)
          throw q;
        return !0;
      }
    }
  };
  Er.AppUpdater = p;
  function E($) {
    const _ = (0, o.prerelease)($);
    return _ != null && _.length > 0;
  }
  class b {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    info(_) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    warn(_) {
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    error(_) {
    }
  }
  return Er.NoOpLogger = b, Er;
}
var bh;
function en() {
  if (bh) return an;
  bh = 1, Object.defineProperty(an, "__esModule", { value: !0 }), an.BaseUpdater = void 0;
  const e = Qa, t = ol();
  let a = class extends t.AppUpdater {
    constructor(l, r) {
      super(l, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
    }
    quitAndInstall(l = !1, r = !1) {
      this._logger.info("Install on explicit quitAndInstall"), this.install(l, l ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
        Jt.autoUpdater.emit("before-quit-for-update"), this.app.quit();
      }) : this.quitAndInstallCalled = !1;
    }
    executeDownload(l) {
      return super.executeDownload({
        ...l,
        done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
      });
    }
    get installerPath() {
      return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
    }
    // must be sync (because quit even handler is not async)
    install(l = !1, r = !1) {
      if (this.quitAndInstallCalled)
        return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
      const i = this.downloadedUpdateHelper, u = this.installerPath, o = i == null ? null : i.downloadedFileInfo;
      if (u == null || o == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      this.quitAndInstallCalled = !0;
      try {
        return this._logger.info(`Install: isSilent: ${l}, isForceRunAfter: ${r}`), this.doInstall({
          isSilent: l,
          isForceRunAfter: r,
          isAdminRightsRequired: o.isAdminRightsRequired
        });
      } catch (c) {
        return this.dispatchError(c), !1;
      }
    }
    addQuitHandler() {
      this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((l) => {
        if (this.quitAndInstallCalled) {
          this._logger.info("Update installer has already been triggered. Quitting application.");
          return;
        }
        if (!this.autoInstallOnAppQuit) {
          this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
          return;
        }
        if (l !== 0) {
          this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${l}`);
          return;
        }
        this._logger.info("Auto install update on quit"), this.install(!0, !1);
      }));
    }
    wrapSudo() {
      const { name: l } = this.app, r = `"${l} would like to update"`, i = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), u = [i];
      return /kdesudo/i.test(i) ? (u.push("--comment", r), u.push("-c")) : /gksudo/i.test(i) ? u.push("--message", r) : /pkexec/i.test(i) && u.push("--disable-internal-agent"), u.join(" ");
    }
    spawnSyncLog(l, r = [], i = {}) {
      this._logger.info(`Executing: ${l} with args: ${r}`);
      const u = (0, e.spawnSync)(l, r, {
        env: { ...process.env, ...i },
        encoding: "utf-8",
        shell: !0
      }), { error: o, status: c, stdout: s, stderr: d } = u;
      if (o != null)
        throw this._logger.error(d), o;
      if (c != null && c !== 0)
        throw this._logger.error(d), new Error(`Command ${l} exited with code ${c}`);
      return s.trim();
    }
    /**
     * This handles both node 8 and node 10 way of emitting error when spawning a process
     *   - node 8: Throws the error
     *   - node 10: Emit the error(Need to listen with on)
     */
    // https://github.com/electron-userland/electron-builder/issues/1129
    // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
    async spawnLog(l, r = [], i = void 0, u = "ignore") {
      return this._logger.info(`Executing: ${l} with args: ${r}`), new Promise((o, c) => {
        try {
          const s = { stdio: u, env: i, detached: !0 }, d = (0, e.spawn)(l, r, s);
          d.on("error", (f) => {
            c(f);
          }), d.unref(), d.pid !== void 0 && o(!0);
        } catch (s) {
          c(s);
        }
      });
    }
  };
  return an.BaseUpdater = a, an;
}
var En = {}, wn = {}, Rh;
function c0() {
  if (Rh) return wn;
  Rh = 1, Object.defineProperty(wn, "__esModule", { value: !0 }), wn.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
  const e = /* @__PURE__ */ fr(), t = s0(), a = Iy;
  let n = class extends t.DifferentialDownloader {
    async download() {
      const u = this.blockAwareFileInfo, o = u.size, c = o - (u.blockMapSize + 4);
      this.fileMetadataBuffer = await this.readRemoteBytes(c, o - 1);
      const s = l(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
      await this.doDownload(await r(this.options.oldFile), s);
    }
  };
  wn.FileWithEmbeddedBlockMapDifferentialDownloader = n;
  function l(i) {
    return JSON.parse((0, a.inflateRawSync)(i).toString());
  }
  async function r(i) {
    const u = await (0, e.open)(i, "r");
    try {
      const o = (await (0, e.fstat)(u)).size, c = Buffer.allocUnsafe(4);
      await (0, e.read)(u, c, 0, c.length, o - c.length);
      const s = Buffer.allocUnsafe(c.readUInt32BE(0));
      return await (0, e.read)(u, s, 0, s.length, o - c.length - s.length), await (0, e.close)(u), l(s);
    } catch (o) {
      throw await (0, e.close)(u), o;
    }
  }
  return wn;
}
var Th;
function Ph() {
  if (Th) return En;
  Th = 1, Object.defineProperty(En, "__esModule", { value: !0 }), En.AppImageUpdater = void 0;
  const e = rt(), t = Qa, a = /* @__PURE__ */ fr(), n = At, l = Ge, r = en(), i = c0(), u = Rt(), o = kr();
  let c = class extends r.BaseUpdater {
    constructor(d, f) {
      super(d, f);
    }
    isUpdaterActive() {
      return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
    }
    /*** @private */
    doDownloadUpdate(d) {
      const f = d.updateInfoAndProvider.provider, m = (0, u.findFile)(f.resolveFiles(d.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "AppImage",
        fileInfo: m,
        downloadUpdateOptions: d,
        task: async (y, v) => {
          const h = process.env.APPIMAGE;
          if (h == null)
            throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
          (d.disableDifferentialDownload || await this.downloadDifferential(m, h, y, f, d)) && await this.httpExecutor.download(m.url, y, v), await (0, a.chmod)(y, 493);
        }
      });
    }
    async downloadDifferential(d, f, m, y, v) {
      try {
        const h = {
          newUrl: d.url,
          oldFile: f,
          logger: this._logger,
          newFile: m,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          requestHeaders: v.requestHeaders,
          cancellationToken: v.cancellationToken
        };
        return this.listenerCount(o.DOWNLOAD_PROGRESS) > 0 && (h.onProgress = (g) => this.emit(o.DOWNLOAD_PROGRESS, g)), await new i.FileWithEmbeddedBlockMapDifferentialDownloader(d.info, this.httpExecutor, h).download(), !1;
      } catch (h) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${h.stack || h}`), process.platform === "linux";
      }
    }
    doInstall(d) {
      const f = process.env.APPIMAGE;
      if (f == null)
        throw (0, e.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
      (0, n.unlinkSync)(f);
      let m;
      const y = l.basename(f), v = this.installerPath;
      if (v == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      l.basename(v) === y || !/\d+\.\d+\.\d+/.test(y) ? m = f : m = l.join(l.dirname(f), l.basename(v)), (0, t.execFileSync)("mv", ["-f", v, m]), m !== f && this.emit("appimage-filename-updated", m);
      const h = {
        ...process.env,
        APPIMAGE_SILENT_INSTALL: "true"
      };
      return d.isForceRunAfter ? this.spawnLog(m, [], h) : (h.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, t.execFileSync)(m, [], { env: h })), !0;
    }
  };
  return En.AppImageUpdater = c, En;
}
var $n = {}, Nh;
function Ih() {
  if (Nh) return $n;
  Nh = 1, Object.defineProperty($n, "__esModule", { value: !0 }), $n.DebUpdater = void 0;
  const e = en(), t = Rt(), a = kr();
  let n = class extends e.BaseUpdater {
    constructor(r, i) {
      super(r, i);
    }
    /*** @private */
    doDownloadUpdate(r) {
      const i = r.updateInfoAndProvider.provider, u = (0, t.findFile)(i.resolveFiles(r.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
      return this.executeDownload({
        fileExtension: "deb",
        fileInfo: u,
        downloadUpdateOptions: r,
        task: async (o, c) => {
          this.listenerCount(a.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (s) => this.emit(a.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(u.url, o, c);
        }
      });
    }
    get installerPath() {
      var r, i;
      return (i = (r = super.installerPath) === null || r === void 0 ? void 0 : r.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(r) {
      const i = this.wrapSudo(), u = /pkexec/i.test(i) ? "" : '"', o = this.installerPath;
      if (o == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const c = ["dpkg", "-i", o, "||", "apt-get", "install", "-f", "-y"];
      return this.spawnSyncLog(i, [`${u}/bin/bash`, "-c", `'${c.join(" ")}'${u}`]), r.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return $n.DebUpdater = n, $n;
}
var Sn = {}, Oh;
function Ah() {
  if (Oh) return Sn;
  Oh = 1, Object.defineProperty(Sn, "__esModule", { value: !0 }), Sn.PacmanUpdater = void 0;
  const e = en(), t = kr(), a = Rt();
  let n = class extends e.BaseUpdater {
    constructor(r, i) {
      super(r, i);
    }
    /*** @private */
    doDownloadUpdate(r) {
      const i = r.updateInfoAndProvider.provider, u = (0, a.findFile)(i.resolveFiles(r.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
      return this.executeDownload({
        fileExtension: "pacman",
        fileInfo: u,
        downloadUpdateOptions: r,
        task: async (o, c) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (s) => this.emit(t.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(u.url, o, c);
        }
      });
    }
    get installerPath() {
      var r, i;
      return (i = (r = super.installerPath) === null || r === void 0 ? void 0 : r.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(r) {
      const i = this.wrapSudo(), u = /pkexec/i.test(i) ? "" : '"', o = this.installerPath;
      if (o == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const c = ["pacman", "-U", "--noconfirm", o];
      return this.spawnSyncLog(i, [`${u}/bin/bash`, "-c", `'${c.join(" ")}'${u}`]), r.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return Sn.PacmanUpdater = n, Sn;
}
var bn = {}, Ch;
function Dh() {
  if (Ch) return bn;
  Ch = 1, Object.defineProperty(bn, "__esModule", { value: !0 }), bn.RpmUpdater = void 0;
  const e = en(), t = kr(), a = Rt();
  let n = class extends e.BaseUpdater {
    constructor(r, i) {
      super(r, i);
    }
    /*** @private */
    doDownloadUpdate(r) {
      const i = r.updateInfoAndProvider.provider, u = (0, a.findFile)(i.resolveFiles(r.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
      return this.executeDownload({
        fileExtension: "rpm",
        fileInfo: u,
        downloadUpdateOptions: r,
        task: async (o, c) => {
          this.listenerCount(t.DOWNLOAD_PROGRESS) > 0 && (c.onProgress = (s) => this.emit(t.DOWNLOAD_PROGRESS, s)), await this.httpExecutor.download(u.url, o, c);
        }
      });
    }
    get installerPath() {
      var r, i;
      return (i = (r = super.installerPath) === null || r === void 0 ? void 0 : r.replace(/ /g, "\\ ")) !== null && i !== void 0 ? i : null;
    }
    doInstall(r) {
      const i = this.wrapSudo(), u = /pkexec/i.test(i) ? "" : '"', o = this.spawnSyncLog("which zypper"), c = this.installerPath;
      if (c == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      let s;
      return o ? s = [o, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", c] : s = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", c], this.spawnSyncLog(i, [`${u}/bin/bash`, "-c", `'${s.join(" ")}'${u}`]), r.isForceRunAfter && this.app.relaunch(), !0;
    }
  };
  return bn.RpmUpdater = n, bn;
}
var Rn = {}, kh;
function Lh() {
  if (kh) return Rn;
  kh = 1, Object.defineProperty(Rn, "__esModule", { value: !0 }), Rn.MacUpdater = void 0;
  const e = rt(), t = /* @__PURE__ */ fr(), a = At, n = Ge, l = Fv, r = ol(), i = Rt(), u = Qa, o = kn;
  let c = class extends r.AppUpdater {
    constructor(d, f) {
      super(d, f), this.nativeUpdater = Jt.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (m) => {
        this._logger.warn(m), this.emit("error", m);
      }), this.nativeUpdater.on("update-downloaded", () => {
        this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
      });
    }
    debug(d) {
      this._logger.debug != null && this._logger.debug(d);
    }
    closeServerIfExists() {
      this.server && (this.debug("Closing proxy server"), this.server.close((d) => {
        d && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
      }));
    }
    async doDownloadUpdate(d) {
      let f = d.updateInfoAndProvider.provider.resolveFiles(d.updateInfoAndProvider.info);
      const m = this._logger, y = "sysctl.proc_translated";
      let v = !1;
      try {
        this.debug("Checking for macOS Rosetta environment"), v = (0, u.execFileSync)("sysctl", [y], { encoding: "utf8" }).includes(`${y}: 1`), m.info(`Checked for macOS Rosetta environment (isRosetta=${v})`);
      } catch ($) {
        m.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${$}`);
      }
      let h = !1;
      try {
        this.debug("Checking for arm64 in uname");
        const _ = (0, u.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
        m.info(`Checked 'uname -a': arm64=${_}`), h = h || _;
      } catch ($) {
        m.warn(`uname shell command to check for arm64 failed: ${$}`);
      }
      h = h || process.arch === "arm64" || v;
      const g = ($) => {
        var _;
        return $.url.pathname.includes("arm64") || ((_ = $.info.url) === null || _ === void 0 ? void 0 : _.includes("arm64"));
      };
      h && f.some(g) ? f = f.filter(($) => h === g($)) : f = f.filter(($) => !g($));
      const p = (0, i.findFile)(f, "zip", ["pkg", "dmg"]);
      if (p == null)
        throw (0, e.newError)(`ZIP file not provided: ${(0, e.safeStringifyJson)(f)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
      const E = d.updateInfoAndProvider.provider, b = "update.zip";
      return this.executeDownload({
        fileExtension: "zip",
        fileInfo: p,
        downloadUpdateOptions: d,
        task: async ($, _) => {
          const w = n.join(this.downloadedUpdateHelper.cacheDir, b), T = () => (0, t.pathExistsSync)(w) ? !d.disableDifferentialDownload : (m.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
          let P = !0;
          T() && (P = await this.differentialDownloadInstaller(p, d, $, E, b)), P && await this.httpExecutor.download(p.url, $, _);
        },
        done: async ($) => {
          if (!d.disableDifferentialDownload)
            try {
              const _ = n.join(this.downloadedUpdateHelper.cacheDir, b);
              await (0, t.copyFile)($.downloadedFile, _);
            } catch (_) {
              this._logger.warn(`Unable to copy file for caching for future differential downloads: ${_.message}`);
            }
          return this.updateDownloaded(p, $);
        }
      });
    }
    async updateDownloaded(d, f) {
      var m;
      const y = f.downloadedFile, v = (m = d.info.size) !== null && m !== void 0 ? m : (await (0, t.stat)(y)).size, h = this._logger, g = `fileToProxy=${d.url.href}`;
      this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${g})`), this.server = (0, l.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${g})`), this.server.on("close", () => {
        h.info(`Proxy server for native Squirrel.Mac is closed (${g})`);
      });
      const p = (E) => {
        const b = E.address();
        return typeof b == "string" ? b : `http://127.0.0.1:${b?.port}`;
      };
      return await new Promise((E, b) => {
        const $ = (0, o.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), _ = Buffer.from(`autoupdater:${$}`, "ascii"), w = `/${(0, o.randomBytes)(64).toString("hex")}.zip`;
        this.server.on("request", (T, P) => {
          const G = T.url;
          if (h.info(`${G} requested`), G === "/") {
            if (!T.headers.authorization || T.headers.authorization.indexOf("Basic ") === -1) {
              P.statusCode = 401, P.statusMessage = "Invalid Authentication Credentials", P.end(), h.warn("No authenthication info");
              return;
            }
            const K = T.headers.authorization.split(" ")[1], k = Buffer.from(K, "base64").toString("ascii"), [F, Y] = k.split(":");
            if (F !== "autoupdater" || Y !== $) {
              P.statusCode = 401, P.statusMessage = "Invalid Authentication Credentials", P.end(), h.warn("Invalid authenthication credentials");
              return;
            }
            const B = Buffer.from(`{ "url": "${p(this.server)}${w}" }`);
            P.writeHead(200, { "Content-Type": "application/json", "Content-Length": B.length }), P.end(B);
            return;
          }
          if (!G.startsWith(w)) {
            h.warn(`${G} requested, but not supported`), P.writeHead(404), P.end();
            return;
          }
          h.info(`${w} requested by Squirrel.Mac, pipe ${y}`);
          let q = !1;
          P.on("finish", () => {
            q || (this.nativeUpdater.removeListener("error", b), E([]));
          });
          const M = (0, a.createReadStream)(y);
          M.on("error", (K) => {
            try {
              P.end();
            } catch (k) {
              h.warn(`cannot end response: ${k}`);
            }
            q = !0, this.nativeUpdater.removeListener("error", b), b(new Error(`Cannot pipe "${y}": ${K}`));
          }), P.writeHead(200, {
            "Content-Type": "application/zip",
            "Content-Length": v
          }), M.pipe(P);
        }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${g})`), this.server.listen(0, "127.0.0.1", () => {
          this.debug(`Proxy server for native Squirrel.Mac is listening (address=${p(this.server)}, ${g})`), this.nativeUpdater.setFeedURL({
            url: p(this.server),
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Basic ${_.toString("base64")}`
            }
          }), this.dispatchUpdateDownloaded(f), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", b), this.nativeUpdater.checkForUpdates()) : E([]);
        });
      });
    }
    handleUpdateDownloaded() {
      this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
    }
    quitAndInstall() {
      this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
    }
  };
  return Rn.MacUpdater = c, Rn;
}
var Tn = {}, ni = {}, qh;
function cE() {
  if (qh) return ni;
  qh = 1, Object.defineProperty(ni, "__esModule", { value: !0 }), ni.verifySignature = l;
  const e = rt(), t = Qa, a = Za, n = Ge;
  function l(o, c, s) {
    return new Promise((d, f) => {
      const m = c.replace(/'/g, "''");
      s.info(`Verifying signature ${m}`), (0, t.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${m}' | ConvertTo-Json -Compress"`], {
        shell: !0,
        timeout: 20 * 1e3
      }, (y, v, h) => {
        var g;
        try {
          if (y != null || h) {
            i(s, y, h, f), d(null);
            return;
          }
          const p = r(v);
          if (p.Status === 0) {
            try {
              const _ = n.normalize(p.Path), w = n.normalize(c);
              if (s.info(`LiteralPath: ${_}. Update Path: ${w}`), _ !== w) {
                i(s, new Error(`LiteralPath of ${_} is different than ${w}`), h, f), d(null);
                return;
              }
            } catch (_) {
              s.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(g = _.message) !== null && g !== void 0 ? g : _.stack}`);
            }
            const b = (0, e.parseDn)(p.SignerCertificate.Subject);
            let $ = !1;
            for (const _ of o) {
              const w = (0, e.parseDn)(_);
              if (w.size ? $ = Array.from(w.keys()).every((P) => w.get(P) === b.get(P)) : _ === b.get("CN") && (s.warn(`Signature validated using only CN ${_}. Please add your full Distinguished Name (DN) to publisherNames configuration`), $ = !0), $) {
                d(null);
                return;
              }
            }
          }
          const E = `publisherNames: ${o.join(" | ")}, raw info: ` + JSON.stringify(p, (b, $) => b === "RawData" ? void 0 : $, 2);
          s.warn(`Sign verification failed, installer signed with incorrect certificate: ${E}`), d(E);
        } catch (p) {
          i(s, p, null, f), d(null);
          return;
        }
      });
    });
  }
  function r(o) {
    const c = JSON.parse(o);
    delete c.PrivateKey, delete c.IsOSBinary, delete c.SignatureType;
    const s = c.SignerCertificate;
    return s != null && (delete s.Archived, delete s.Extensions, delete s.Handle, delete s.HasPrivateKey, delete s.SubjectName), c;
  }
  function i(o, c, s, d) {
    if (u()) {
      o.warn(`Cannot execute Get-AuthenticodeSignature: ${c || s}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    try {
      (0, t.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
    } catch (f) {
      o.warn(`Cannot execute ConvertTo-Json: ${f.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
      return;
    }
    c != null && d(c), s && d(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${s}. Failing signature validation due to unknown stderr.`));
  }
  function u() {
    const o = a.release();
    return o.startsWith("6.") && !o.startsWith("6.3");
  }
  return ni;
}
var Fh;
function Uh() {
  if (Fh) return Tn;
  Fh = 1, Object.defineProperty(Tn, "__esModule", { value: !0 }), Tn.NsisUpdater = void 0;
  const e = rt(), t = Ge, a = en(), n = c0(), l = kr(), r = Rt(), i = /* @__PURE__ */ fr(), u = cE(), o = Yr;
  let c = class extends a.BaseUpdater {
    constructor(d, f) {
      super(d, f), this._verifyUpdateCodeSignature = (m, y) => (0, u.verifySignature)(m, y, this._logger);
    }
    /**
     * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
     * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
     */
    get verifyUpdateCodeSignature() {
      return this._verifyUpdateCodeSignature;
    }
    set verifyUpdateCodeSignature(d) {
      d && (this._verifyUpdateCodeSignature = d);
    }
    /*** @private */
    doDownloadUpdate(d) {
      const f = d.updateInfoAndProvider.provider, m = (0, r.findFile)(f.resolveFiles(d.updateInfoAndProvider.info), "exe");
      return this.executeDownload({
        fileExtension: "exe",
        downloadUpdateOptions: d,
        fileInfo: m,
        task: async (y, v, h, g) => {
          const p = m.packageInfo, E = p != null && h != null;
          if (E && d.disableWebInstaller)
            throw (0, e.newError)(`Unable to download new version ${d.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
          !E && !d.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (E || d.disableDifferentialDownload || await this.differentialDownloadInstaller(m, d, y, f, e.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(m.url, y, v);
          const b = await this.verifySignature(y);
          if (b != null)
            throw await g(), (0, e.newError)(`New version ${d.updateInfoAndProvider.info.version} is not signed by the application owner: ${b}`, "ERR_UPDATER_INVALID_SIGNATURE");
          if (E && await this.differentialDownloadWebPackage(d, p, h, f))
            try {
              await this.httpExecutor.download(new o.URL(p.path), h, {
                headers: d.requestHeaders,
                cancellationToken: d.cancellationToken,
                sha512: p.sha512
              });
            } catch ($) {
              try {
                await (0, i.unlink)(h);
              } catch {
              }
              throw $;
            }
        }
      });
    }
    // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
    // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
    // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
    async verifySignature(d) {
      let f;
      try {
        if (f = (await this.configOnDisk.value).publisherName, f == null)
          return null;
      } catch (m) {
        if (m.code === "ENOENT")
          return null;
        throw m;
      }
      return await this._verifyUpdateCodeSignature(Array.isArray(f) ? f : [f], d);
    }
    doInstall(d) {
      const f = this.installerPath;
      if (f == null)
        return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
      const m = ["--updated"];
      d.isSilent && m.push("/S"), d.isForceRunAfter && m.push("--force-run"), this.installDirectory && m.push(`/D=${this.installDirectory}`);
      const y = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
      y != null && m.push(`--package-file=${y}`);
      const v = () => {
        this.spawnLog(t.join(process.resourcesPath, "elevate.exe"), [f].concat(m)).catch((h) => this.dispatchError(h));
      };
      return d.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), v(), !0) : (this.spawnLog(f, m).catch((h) => {
        const g = h.code;
        this._logger.info(`Cannot run installer: error code: ${g}, error message: "${h.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), g === "UNKNOWN" || g === "EACCES" ? v() : g === "ENOENT" ? Jt.shell.openPath(f).catch((p) => this.dispatchError(p)) : this.dispatchError(h);
      }), !0);
    }
    async differentialDownloadWebPackage(d, f, m, y) {
      if (f.blockMapSize == null)
        return !0;
      try {
        const v = {
          newUrl: new o.URL(f.path),
          oldFile: t.join(this.downloadedUpdateHelper.cacheDir, e.CURRENT_APP_PACKAGE_FILE_NAME),
          logger: this._logger,
          newFile: m,
          requestHeaders: this.requestHeaders,
          isUseMultipleRangeRequest: y.isUseMultipleRangeRequest,
          cancellationToken: d.cancellationToken
        };
        this.listenerCount(l.DOWNLOAD_PROGRESS) > 0 && (v.onProgress = (h) => this.emit(l.DOWNLOAD_PROGRESS, h)), await new n.FileWithEmbeddedBlockMapDifferentialDownloader(f, this.httpExecutor, v).download();
      } catch (v) {
        return this._logger.error(`Cannot download differentially, fallback to full download: ${v.stack || v}`), process.platform === "win32";
      }
      return !1;
    }
  };
  return Tn.NsisUpdater = c, Tn;
}
var jh;
function uE() {
  return jh || (jh = 1, (function(e) {
    var t = _r && _r.__createBinding || (Object.create ? (function(h, g, p, E) {
      E === void 0 && (E = p);
      var b = Object.getOwnPropertyDescriptor(g, p);
      (!b || ("get" in b ? !g.__esModule : b.writable || b.configurable)) && (b = { enumerable: !0, get: function() {
        return g[p];
      } }), Object.defineProperty(h, E, b);
    }) : (function(h, g, p, E) {
      E === void 0 && (E = p), h[E] = g[p];
    })), a = _r && _r.__exportStar || function(h, g) {
      for (var p in h) p !== "default" && !Object.prototype.hasOwnProperty.call(g, p) && t(g, h, p);
    };
    Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
    const n = /* @__PURE__ */ fr(), l = Ge;
    var r = en();
    Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
      return r.BaseUpdater;
    } });
    var i = ol();
    Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
      return i.AppUpdater;
    } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
      return i.NoOpLogger;
    } });
    var u = Rt();
    Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
      return u.Provider;
    } });
    var o = Ph();
    Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
      return o.AppImageUpdater;
    } });
    var c = Ih();
    Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
      return c.DebUpdater;
    } });
    var s = Ah();
    Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
      return s.PacmanUpdater;
    } });
    var d = Dh();
    Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
      return d.RpmUpdater;
    } });
    var f = Lh();
    Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
      return f.MacUpdater;
    } });
    var m = Uh();
    Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
      return m.NsisUpdater;
    } }), a(kr(), e);
    let y;
    function v() {
      if (process.platform === "win32")
        y = new (Uh()).NsisUpdater();
      else if (process.platform === "darwin")
        y = new (Lh()).MacUpdater();
      else {
        y = new (Ph()).AppImageUpdater();
        try {
          const h = l.join(process.resourcesPath, "package-type");
          if (!(0, n.existsSync)(h))
            return y;
          console.info("Checking for beta autoupdate feature for deb/rpm distributions");
          const g = (0, n.readFileSync)(h).toString().trim();
          switch (console.info("Found package-type:", g), g) {
            case "deb":
              y = new (Ih()).DebUpdater();
              break;
            case "rpm":
              y = new (Dh()).RpmUpdater();
              break;
            case "pacman":
              y = new (Ah()).PacmanUpdater();
              break;
            default:
              break;
          }
        } catch (h) {
          console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", h.message);
        }
      }
      return y;
    }
    Object.defineProperty(e, "autoUpdater", {
      enumerable: !0,
      get: () => y || v()
    });
  })(_r)), _r;
}
var bt = uE();
const Ar = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, u0 = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), l0 = 1e6, lE = (e) => e >= "0" && e <= "9";
function f0(e) {
  if (e === "0")
    return !0;
  if (/^[1-9]\d*$/.test(e)) {
    const t = Number.parseInt(e, 10);
    return t <= Number.MAX_SAFE_INTEGER && t <= l0;
  }
  return !1;
}
function Rc(e, t) {
  return u0.has(e) ? !1 : (e && f0(e) ? t.push(Number.parseInt(e, 10)) : t.push(e), !0);
}
function fE(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  const t = [];
  let a = "", n = "start", l = !1, r = 0;
  for (const i of e) {
    if (r++, l) {
      a += i, l = !1;
      continue;
    }
    if (i === "\\") {
      if (n === "index")
        throw new Error(`Invalid character '${i}' in an index at position ${r}`);
      if (n === "indexEnd")
        throw new Error(`Invalid character '${i}' after an index at position ${r}`);
      l = !0, n = n === "start" ? "property" : n;
      continue;
    }
    switch (i) {
      case ".": {
        if (n === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${r}`);
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (!Rc(a, t))
          return [];
        a = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error(`Invalid character '${i}' in an index at position ${r}`);
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (n === "property" || n === "start") {
          if ((a || n === "property") && !Rc(a, t))
            return [];
          a = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          if (a === "")
            a = (t.pop() || "") + "[]", n = "property";
          else {
            const u = Number.parseInt(a, 10);
            !Number.isNaN(u) && Number.isFinite(u) && u >= 0 && u <= Number.MAX_SAFE_INTEGER && u <= l0 && a === String(u) ? t.push(u) : t.push(a), a = "", n = "indexEnd";
          }
          break;
        }
        if (n === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${r}`);
        a += i;
        break;
      }
      default: {
        if (n === "index" && !lE(i))
          throw new Error(`Invalid character '${i}' in an index at position ${r}`);
        if (n === "indexEnd")
          throw new Error(`Invalid character '${i}' after an index at position ${r}`);
        n === "start" && (n = "property"), a += i;
      }
    }
  }
  switch (l && (a += "\\"), n) {
    case "property": {
      if (!Rc(a, t))
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
function os(e) {
  if (typeof e == "string")
    return fE(e);
  if (Array.isArray(e)) {
    const t = [];
    for (const [a, n] of e.entries()) {
      if (typeof n != "string" && typeof n != "number")
        throw new TypeError(`Expected a string or number for path segment at index ${a}, got ${typeof n}`);
      if (typeof n == "number" && !Number.isFinite(n))
        throw new TypeError(`Path segment at index ${a} must be a finite number, got ${n}`);
      if (u0.has(n))
        return [];
      typeof n == "string" && f0(n) ? t.push(Number.parseInt(n, 10)) : t.push(n);
    }
    return t;
  }
  return [];
}
function Mh(e, t, a) {
  if (!Ar(e) || typeof t != "string" && !Array.isArray(t))
    return a === void 0 ? e : a;
  const n = os(t);
  if (n.length === 0)
    return a;
  for (let l = 0; l < n.length; l++) {
    const r = n[l];
    if (e = e[r], e == null) {
      if (l !== n.length - 1)
        return a;
      break;
    }
  }
  return e === void 0 ? a : e;
}
function ii(e, t, a) {
  if (!Ar(e) || typeof t != "string" && !Array.isArray(t))
    return e;
  const n = e, l = os(t);
  if (l.length === 0)
    return e;
  for (let r = 0; r < l.length; r++) {
    const i = l[r];
    if (r === l.length - 1)
      e[i] = a;
    else if (!Ar(e[i])) {
      const o = typeof l[r + 1] == "number";
      e[i] = o ? [] : {};
    }
    e = e[i];
  }
  return n;
}
function dE(e, t) {
  if (!Ar(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const a = os(t);
  if (a.length === 0)
    return !1;
  for (let n = 0; n < a.length; n++) {
    const l = a[n];
    if (n === a.length - 1)
      return Object.hasOwn(e, l) ? (delete e[l], !0) : !1;
    if (e = e[l], !Ar(e))
      return !1;
  }
}
function Tc(e, t) {
  if (!Ar(e) || typeof t != "string" && !Array.isArray(t))
    return !1;
  const a = os(t);
  if (a.length === 0)
    return !1;
  for (const n of a) {
    if (!Ar(e) || !(n in e))
      return !1;
    e = e[n];
  }
  return !0;
}
const lr = Oy.homedir(), cl = Oy.tmpdir(), { env: Xr } = Ke, hE = (e) => {
  const t = je.join(lr, "Library");
  return {
    data: je.join(t, "Application Support", e),
    config: je.join(t, "Preferences", e),
    cache: je.join(t, "Caches", e),
    log: je.join(t, "Logs", e),
    temp: je.join(cl, e)
  };
}, pE = (e) => {
  const t = Xr.APPDATA || je.join(lr, "AppData", "Roaming"), a = Xr.LOCALAPPDATA || je.join(lr, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: je.join(a, e, "Data"),
    config: je.join(t, e, "Config"),
    cache: je.join(a, e, "Cache"),
    log: je.join(a, e, "Log"),
    temp: je.join(cl, e)
  };
}, mE = (e) => {
  const t = je.basename(lr);
  return {
    data: je.join(Xr.XDG_DATA_HOME || je.join(lr, ".local", "share"), e),
    config: je.join(Xr.XDG_CONFIG_HOME || je.join(lr, ".config"), e),
    cache: je.join(Xr.XDG_CACHE_HOME || je.join(lr, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: je.join(Xr.XDG_STATE_HOME || je.join(lr, ".local", "state"), e),
    temp: je.join(cl, t, e)
  };
};
function gE(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), Ke.platform === "darwin" ? hE(e) : Ke.platform === "win32" ? pE(e) : mE(e);
}
const nr = (e, t) => {
  const { onError: a } = t;
  return function(...l) {
    return e.apply(void 0, l).catch(a);
  };
}, Bt = (e, t) => {
  const { onError: a } = t;
  return function(...l) {
    try {
      return e.apply(void 0, l);
    } catch (r) {
      return a(r);
    }
  };
}, yE = 250, ir = (e, t) => {
  const { isRetriable: a } = t;
  return function(l) {
    const { timeout: r } = l, i = l.interval ?? yE, u = Date.now() + r;
    return function o(...c) {
      return e.apply(void 0, c).catch((s) => {
        if (!a(s) || Date.now() >= u)
          throw s;
        const d = Math.round(i * Math.random());
        return d > 0 ? new Promise((m) => setTimeout(m, d)).then(() => o.apply(void 0, c)) : o.apply(void 0, c);
      });
    };
  };
}, ar = (e, t) => {
  const { isRetriable: a } = t;
  return function(l) {
    const { timeout: r } = l, i = Date.now() + r;
    return function(...o) {
      for (; ; )
        try {
          return e.apply(void 0, o);
        } catch (c) {
          if (!a(c) || Date.now() >= i)
            throw c;
          continue;
        }
    };
  };
}, Wr = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!Wr.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !vE && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!Wr.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!Wr.isNodeError(e))
      throw e;
    if (!Wr.isChangeErrorOk(e))
      throw e;
  }
}, ai = {
  onError: Wr.onChangeError
}, vt = {
  onError: () => {
  }
}, vE = Ke.getuid ? !Ke.getuid() : !1, ot = {
  isRetriable: Wr.isRetriableError
}, ct = {
  attempt: {
    /* ASYNC */
    chmod: nr(it(Te.chmod), ai),
    chown: nr(it(Te.chown), ai),
    close: nr(it(Te.close), vt),
    fsync: nr(it(Te.fsync), vt),
    mkdir: nr(it(Te.mkdir), vt),
    realpath: nr(it(Te.realpath), vt),
    stat: nr(it(Te.stat), vt),
    unlink: nr(it(Te.unlink), vt),
    /* SYNC */
    chmodSync: Bt(Te.chmodSync, ai),
    chownSync: Bt(Te.chownSync, ai),
    closeSync: Bt(Te.closeSync, vt),
    existsSync: Bt(Te.existsSync, vt),
    fsyncSync: Bt(Te.fsync, vt),
    mkdirSync: Bt(Te.mkdirSync, vt),
    realpathSync: Bt(Te.realpathSync, vt),
    statSync: Bt(Te.statSync, vt),
    unlinkSync: Bt(Te.unlinkSync, vt)
  },
  retry: {
    /* ASYNC */
    close: ir(it(Te.close), ot),
    fsync: ir(it(Te.fsync), ot),
    open: ir(it(Te.open), ot),
    readFile: ir(it(Te.readFile), ot),
    rename: ir(it(Te.rename), ot),
    stat: ir(it(Te.stat), ot),
    write: ir(it(Te.write), ot),
    writeFile: ir(it(Te.writeFile), ot),
    /* SYNC */
    closeSync: ar(Te.closeSync, ot),
    fsyncSync: ar(Te.fsyncSync, ot),
    openSync: ar(Te.openSync, ot),
    readFileSync: ar(Te.readFileSync, ot),
    renameSync: ar(Te.renameSync, ot),
    statSync: ar(Te.statSync, ot),
    writeSync: ar(Te.writeSync, ot),
    writeFileSync: ar(Te.writeFileSync, ot)
  }
}, _E = "utf8", xh = 438, EE = 511, wE = {}, $E = Ke.geteuid ? Ke.geteuid() : -1, SE = Ke.getegid ? Ke.getegid() : -1, bE = 1e3, RE = !!Ke.getuid;
Ke.getuid && Ke.getuid();
const Vh = 128, TE = (e) => e instanceof Error && "code" in e, Gh = (e) => typeof e == "string", Pc = (e) => e === void 0, PE = Ke.platform === "linux", d0 = Ke.platform === "win32", ul = ["SIGHUP", "SIGINT", "SIGTERM"];
d0 || ul.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
PE && ul.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class NE {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const a of this.callbacks)
          a();
        t && (d0 && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? Ke.kill(Ke.pid, "SIGTERM") : Ke.kill(Ke.pid, t));
      }
    }, this.hook = () => {
      Ke.once("exit", () => this.exit());
      for (const t of ul)
        try {
          Ke.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const IE = new NE(), OE = IE.register, ut = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), l = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${l}`;
  },
  get: (e, t, a = !0) => {
    const n = ut.truncate(t(e));
    return n in ut.store ? ut.get(e, t, a) : (ut.store[n] = a, [n, () => delete ut.store[n]]);
  },
  purge: (e) => {
    ut.store[e] && (delete ut.store[e], ct.attempt.unlink(e));
  },
  purgeSync: (e) => {
    ut.store[e] && (delete ut.store[e], ct.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in ut.store)
      ut.purgeSync(e);
  },
  truncate: (e) => {
    const t = je.basename(e);
    if (t.length <= Vh)
      return e;
    const a = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!a)
      return e;
    const n = t.length - Vh;
    return `${e.slice(0, -t.length)}${a[1]}${a[2].slice(0, -n)}${a[3]}`;
  }
};
OE(ut.purgeSyncAll);
function h0(e, t, a = wE) {
  if (Gh(a))
    return h0(e, t, { encoding: a });
  const l = { timeout: a.timeout ?? bE };
  let r = null, i = null, u = null;
  try {
    const o = ct.attempt.realpathSync(e), c = !!o;
    e = o || e, [i, r] = ut.get(e, a.tmpCreate || ut.create, a.tmpPurge !== !1);
    const s = RE && Pc(a.chown), d = Pc(a.mode);
    if (c && (s || d)) {
      const f = ct.attempt.statSync(e);
      f && (a = { ...a }, s && (a.chown = { uid: f.uid, gid: f.gid }), d && (a.mode = f.mode));
    }
    if (!c) {
      const f = je.dirname(e);
      ct.attempt.mkdirSync(f, {
        mode: EE,
        recursive: !0
      });
    }
    u = ct.retry.openSync(l)(i, "w", a.mode || xh), a.tmpCreated && a.tmpCreated(i), Gh(t) ? ct.retry.writeSync(l)(u, t, 0, a.encoding || _E) : Pc(t) || ct.retry.writeSync(l)(u, t, 0, t.length, 0), a.fsync !== !1 && (a.fsyncWait !== !1 ? ct.retry.fsyncSync(l)(u) : ct.attempt.fsync(u)), ct.retry.closeSync(l)(u), u = null, a.chown && (a.chown.uid !== $E || a.chown.gid !== SE) && ct.attempt.chownSync(i, a.chown.uid, a.chown.gid), a.mode && a.mode !== xh && ct.attempt.chmodSync(i, a.mode);
    try {
      ct.retry.renameSync(l)(i, e);
    } catch (f) {
      if (!TE(f) || f.code !== "ENAMETOOLONG")
        throw f;
      ct.retry.renameSync(l)(i, ut.truncate(e));
    }
    r(), i = null;
  } finally {
    u && ct.attempt.closeSync(u), i && ut.purge(i);
  }
}
var si = { exports: {} }, Nc = {}, Ht = {}, br = {}, Ic = {}, Oc = {}, Ac = {}, Bh;
function Ka() {
  return Bh || (Bh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class a extends t {
      constructor(p) {
        if (super(), !e.IDENTIFIER.test(p))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = p;
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
    e.Name = a;
    class n extends t {
      constructor(p) {
        super(), this._items = typeof p == "string" ? [p] : p;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const p = this._items[0];
        return p === "" || p === '""';
      }
      get str() {
        var p;
        return (p = this._str) !== null && p !== void 0 ? p : this._str = this._items.reduce((E, b) => `${E}${b}`, "");
      }
      get names() {
        var p;
        return (p = this._names) !== null && p !== void 0 ? p : this._names = this._items.reduce((E, b) => (b instanceof a && (E[b.str] = (E[b.str] || 0) + 1), E), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function l(g, ...p) {
      const E = [g[0]];
      let b = 0;
      for (; b < p.length; )
        u(E, p[b]), E.push(g[++b]);
      return new n(E);
    }
    e._ = l;
    const r = new n("+");
    function i(g, ...p) {
      const E = [m(g[0])];
      let b = 0;
      for (; b < p.length; )
        E.push(r), u(E, p[b]), E.push(r, m(g[++b]));
      return o(E), new n(E);
    }
    e.str = i;
    function u(g, p) {
      p instanceof n ? g.push(...p._items) : p instanceof a ? g.push(p) : g.push(d(p));
    }
    e.addCodeArg = u;
    function o(g) {
      let p = 1;
      for (; p < g.length - 1; ) {
        if (g[p] === r) {
          const E = c(g[p - 1], g[p + 1]);
          if (E !== void 0) {
            g.splice(p - 1, 3, E);
            continue;
          }
          g[p++] = "+";
        }
        p++;
      }
    }
    function c(g, p) {
      if (p === '""')
        return g;
      if (g === '""')
        return p;
      if (typeof g == "string")
        return p instanceof a || g[g.length - 1] !== '"' ? void 0 : typeof p != "string" ? `${g.slice(0, -1)}${p}"` : p[0] === '"' ? g.slice(0, -1) + p.slice(1) : void 0;
      if (typeof p == "string" && p[0] === '"' && !(g instanceof a))
        return `"${g}${p.slice(1)}`;
    }
    function s(g, p) {
      return p.emptyStr() ? g : g.emptyStr() ? p : i`${g}${p}`;
    }
    e.strConcat = s;
    function d(g) {
      return typeof g == "number" || typeof g == "boolean" || g === null ? g : m(Array.isArray(g) ? g.join(",") : g);
    }
    function f(g) {
      return new n(m(g));
    }
    e.stringify = f;
    function m(g) {
      return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = m;
    function y(g) {
      return typeof g == "string" && e.IDENTIFIER.test(g) ? new n(`.${g}`) : l`[${g}]`;
    }
    e.getProperty = y;
    function v(g) {
      if (typeof g == "string" && e.IDENTIFIER.test(g))
        return new n(`${g}`);
      throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
    }
    e.getEsmExportName = v;
    function h(g) {
      return new n(g.toString());
    }
    e.regexpCode = h;
  })(Ac)), Ac;
}
var Cc = {}, Hh;
function zh() {
  return Hh || (Hh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Ka();
    class a extends Error {
      constructor(c) {
        super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
      }
    }
    var n;
    (function(o) {
      o[o.Started = 0] = "Started", o[o.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: c, parent: s } = {}) {
        this._names = {}, this._prefixes = c, this._parent = s;
      }
      toName(c) {
        return c instanceof t.Name ? c : this.name(c);
      }
      name(c) {
        return new t.Name(this._newName(c));
      }
      _newName(c) {
        const s = this._names[c] || this._nameGroup(c);
        return `${c}${s.index++}`;
      }
      _nameGroup(c) {
        var s, d;
        if (!((d = (s = this._parent) === null || s === void 0 ? void 0 : s._prefixes) === null || d === void 0) && d.has(c) || this._prefixes && !this._prefixes.has(c))
          throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
        return this._names[c] = { prefix: c, index: 0 };
      }
    }
    e.Scope = l;
    class r extends t.Name {
      constructor(c, s) {
        super(s), this.prefix = c;
      }
      setValue(c, { property: s, itemIndex: d }) {
        this.value = c, this.scopePath = (0, t._)`.${new t.Name(s)}[${d}]`;
      }
    }
    e.ValueScopeName = r;
    const i = (0, t._)`\n`;
    class u extends l {
      constructor(c) {
        super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(c) {
        return new r(c, this._newName(c));
      }
      value(c, s) {
        var d;
        if (s.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const f = this.toName(c), { prefix: m } = f, y = (d = s.key) !== null && d !== void 0 ? d : s.ref;
        let v = this._values[m];
        if (v) {
          const p = v.get(y);
          if (p)
            return p;
        } else
          v = this._values[m] = /* @__PURE__ */ new Map();
        v.set(y, f);
        const h = this._scope[m] || (this._scope[m] = []), g = h.length;
        return h[g] = s.ref, f.setValue(s, { property: m, itemIndex: g }), f;
      }
      getValue(c, s) {
        const d = this._values[c];
        if (d)
          return d.get(s);
      }
      scopeRefs(c, s = this._values) {
        return this._reduceValues(s, (d) => {
          if (d.scopePath === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return (0, t._)`${c}${d.scopePath}`;
        });
      }
      scopeCode(c = this._values, s, d) {
        return this._reduceValues(c, (f) => {
          if (f.value === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return f.value.code;
        }, s, d);
      }
      _reduceValues(c, s, d = {}, f) {
        let m = t.nil;
        for (const y in c) {
          const v = c[y];
          if (!v)
            continue;
          const h = d[y] = d[y] || /* @__PURE__ */ new Map();
          v.forEach((g) => {
            if (h.has(g))
              return;
            h.set(g, n.Started);
            let p = s(g);
            if (p) {
              const E = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              m = (0, t._)`${m}${E} ${g} = ${p};${this.opts._n}`;
            } else if (p = f?.(g))
              m = (0, t._)`${m}${p}${this.opts._n}`;
            else
              throw new a(g);
            h.set(g, n.Completed);
          });
        }
        return m;
      }
    }
    e.ValueScope = u;
  })(Cc)), Cc;
}
var Kh;
function Ne() {
  return Kh || (Kh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Ka(), a = zh();
    var n = Ka();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var l = zh();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
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
    class r {
      optimizeNodes() {
        return this;
      }
      optimizeNames(R, N) {
        return this;
      }
    }
    class i extends r {
      constructor(R, N, x) {
        super(), this.varKind = R, this.name = N, this.rhs = x;
      }
      render({ es5: R, _n: N }) {
        const x = R ? a.varKinds.var : this.varKind, O = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${x} ${this.name}${O};` + N;
      }
      optimizeNames(R, N) {
        if (R[this.name.str])
          return this.rhs && (this.rhs = k(this.rhs, R, N)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class u extends r {
      constructor(R, N, x) {
        super(), this.lhs = R, this.rhs = N, this.sideEffects = x;
      }
      render({ _n: R }) {
        return `${this.lhs} = ${this.rhs};` + R;
      }
      optimizeNames(R, N) {
        if (!(this.lhs instanceof t.Name && !R[this.lhs.str] && !this.sideEffects))
          return this.rhs = k(this.rhs, R, N), this;
      }
      get names() {
        const R = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return K(R, this.rhs);
      }
    }
    class o extends u {
      constructor(R, N, x, O) {
        super(R, x, O), this.op = N;
      }
      render({ _n: R }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + R;
      }
    }
    class c extends r {
      constructor(R) {
        super(), this.label = R, this.names = {};
      }
      render({ _n: R }) {
        return `${this.label}:` + R;
      }
    }
    class s extends r {
      constructor(R) {
        super(), this.label = R, this.names = {};
      }
      render({ _n: R }) {
        return `break${this.label ? ` ${this.label}` : ""};` + R;
      }
    }
    class d extends r {
      constructor(R) {
        super(), this.error = R;
      }
      render({ _n: R }) {
        return `throw ${this.error};` + R;
      }
      get names() {
        return this.error.names;
      }
    }
    class f extends r {
      constructor(R) {
        super(), this.code = R;
      }
      render({ _n: R }) {
        return `${this.code};` + R;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(R, N) {
        return this.code = k(this.code, R, N), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class m extends r {
      constructor(R = []) {
        super(), this.nodes = R;
      }
      render(R) {
        return this.nodes.reduce((N, x) => N + x.render(R), "");
      }
      optimizeNodes() {
        const { nodes: R } = this;
        let N = R.length;
        for (; N--; ) {
          const x = R[N].optimizeNodes();
          Array.isArray(x) ? R.splice(N, 1, ...x) : x ? R[N] = x : R.splice(N, 1);
        }
        return R.length > 0 ? this : void 0;
      }
      optimizeNames(R, N) {
        const { nodes: x } = this;
        let O = x.length;
        for (; O--; ) {
          const I = x[O];
          I.optimizeNames(R, N) || (F(R, I.names), x.splice(O, 1));
        }
        return x.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((R, N) => M(R, N.names), {});
      }
    }
    class y extends m {
      render(R) {
        return "{" + R._n + super.render(R) + "}" + R._n;
      }
    }
    class v extends m {
    }
    class h extends y {
    }
    h.kind = "else";
    class g extends y {
      constructor(R, N) {
        super(N), this.condition = R;
      }
      render(R) {
        let N = `if(${this.condition})` + super.render(R);
        return this.else && (N += "else " + this.else.render(R)), N;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const R = this.condition;
        if (R === !0)
          return this.nodes;
        let N = this.else;
        if (N) {
          const x = N.optimizeNodes();
          N = this.else = Array.isArray(x) ? new h(x) : x;
        }
        if (N)
          return R === !1 ? N instanceof g ? N : N.nodes : this.nodes.length ? this : new g(Y(R), N instanceof g ? [N] : N.nodes);
        if (!(R === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(R, N) {
        var x;
        if (this.else = (x = this.else) === null || x === void 0 ? void 0 : x.optimizeNames(R, N), !!(super.optimizeNames(R, N) || this.else))
          return this.condition = k(this.condition, R, N), this;
      }
      get names() {
        const R = super.names;
        return K(R, this.condition), this.else && M(R, this.else.names), R;
      }
    }
    g.kind = "if";
    class p extends y {
    }
    p.kind = "for";
    class E extends p {
      constructor(R) {
        super(), this.iteration = R;
      }
      render(R) {
        return `for(${this.iteration})` + super.render(R);
      }
      optimizeNames(R, N) {
        if (super.optimizeNames(R, N))
          return this.iteration = k(this.iteration, R, N), this;
      }
      get names() {
        return M(super.names, this.iteration.names);
      }
    }
    class b extends p {
      constructor(R, N, x, O) {
        super(), this.varKind = R, this.name = N, this.from = x, this.to = O;
      }
      render(R) {
        const N = R.es5 ? a.varKinds.var : this.varKind, { name: x, from: O, to: I } = this;
        return `for(${N} ${x}=${O}; ${x}<${I}; ${x}++)` + super.render(R);
      }
      get names() {
        const R = K(super.names, this.from);
        return K(R, this.to);
      }
    }
    class $ extends p {
      constructor(R, N, x, O) {
        super(), this.loop = R, this.varKind = N, this.name = x, this.iterable = O;
      }
      render(R) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(R);
      }
      optimizeNames(R, N) {
        if (super.optimizeNames(R, N))
          return this.iterable = k(this.iterable, R, N), this;
      }
      get names() {
        return M(super.names, this.iterable.names);
      }
    }
    class _ extends y {
      constructor(R, N, x) {
        super(), this.name = R, this.args = N, this.async = x;
      }
      render(R) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(R);
      }
    }
    _.kind = "func";
    class w extends m {
      render(R) {
        return "return " + super.render(R);
      }
    }
    w.kind = "return";
    class T extends y {
      render(R) {
        let N = "try" + super.render(R);
        return this.catch && (N += this.catch.render(R)), this.finally && (N += this.finally.render(R)), N;
      }
      optimizeNodes() {
        var R, N;
        return super.optimizeNodes(), (R = this.catch) === null || R === void 0 || R.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(R, N) {
        var x, O;
        return super.optimizeNames(R, N), (x = this.catch) === null || x === void 0 || x.optimizeNames(R, N), (O = this.finally) === null || O === void 0 || O.optimizeNames(R, N), this;
      }
      get names() {
        const R = super.names;
        return this.catch && M(R, this.catch.names), this.finally && M(R, this.finally.names), R;
      }
    }
    class P extends y {
      constructor(R) {
        super(), this.error = R;
      }
      render(R) {
        return `catch(${this.error})` + super.render(R);
      }
    }
    P.kind = "catch";
    class G extends y {
      render(R) {
        return "finally" + super.render(R);
      }
    }
    G.kind = "finally";
    class q {
      constructor(R, N = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...N, _n: N.lines ? `
` : "" }, this._extScope = R, this._scope = new a.Scope({ parent: R }), this._nodes = [new v()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(R) {
        return this._scope.name(R);
      }
      // reserves unique name in the external scope
      scopeName(R) {
        return this._extScope.name(R);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(R, N) {
        const x = this._extScope.value(R, N);
        return (this._values[x.prefix] || (this._values[x.prefix] = /* @__PURE__ */ new Set())).add(x), x;
      }
      getScopeValue(R, N) {
        return this._extScope.getValue(R, N);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(R) {
        return this._extScope.scopeRefs(R, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(R, N, x, O) {
        const I = this._scope.toName(N);
        return x !== void 0 && O && (this._constants[I.str] = x), this._leafNode(new i(R, I, x)), I;
      }
      // `const` declaration (`var` in es5 mode)
      const(R, N, x) {
        return this._def(a.varKinds.const, R, N, x);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(R, N, x) {
        return this._def(a.varKinds.let, R, N, x);
      }
      // `var` declaration with optional assignment
      var(R, N, x) {
        return this._def(a.varKinds.var, R, N, x);
      }
      // assignment code
      assign(R, N, x) {
        return this._leafNode(new u(R, N, x));
      }
      // `+=` code
      add(R, N) {
        return this._leafNode(new o(R, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(R) {
        return typeof R == "function" ? R() : R !== t.nil && this._leafNode(new f(R)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...R) {
        const N = ["{"];
        for (const [x, O] of R)
          N.length > 1 && N.push(","), N.push(x), (x !== O || this.opts.es5) && (N.push(":"), (0, t.addCodeArg)(N, O));
        return N.push("}"), new t._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(R, N, x) {
        if (this._blockNode(new g(R)), N && x)
          this.code(N).else().code(x).endIf();
        else if (N)
          this.code(N).endIf();
        else if (x)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(R) {
        return this._elseNode(new g(R));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(g, h);
      }
      _for(R, N) {
        return this._blockNode(R), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(R, N) {
        return this._for(new E(R), N);
      }
      // `for` statement for a range of values
      forRange(R, N, x, O, I = this.opts.es5 ? a.varKinds.var : a.varKinds.let) {
        const Q = this._scope.toName(R);
        return this._for(new b(I, Q, N, x), () => O(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(R, N, x, O = a.varKinds.const) {
        const I = this._scope.toName(R);
        if (this.opts.es5) {
          const Q = N instanceof t.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (H) => {
            this.var(I, (0, t._)`${Q}[${H}]`), x(I);
          });
        }
        return this._for(new $("of", O, I, N), () => x(I));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(R, N, x, O = this.opts.es5 ? a.varKinds.var : a.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(R, (0, t._)`Object.keys(${N})`, x);
        const I = this._scope.toName(R);
        return this._for(new $("in", O, I, N), () => x(I));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(p);
      }
      // `label` statement
      label(R) {
        return this._leafNode(new c(R));
      }
      // `break` statement
      break(R) {
        return this._leafNode(new s(R));
      }
      // `return` statement
      return(R) {
        const N = new w();
        if (this._blockNode(N), this.code(R), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(w);
      }
      // `try` statement
      try(R, N, x) {
        if (!N && !x)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const O = new T();
        if (this._blockNode(O), this.code(R), N) {
          const I = this.name("e");
          this._currNode = O.catch = new P(I), N(I);
        }
        return x && (this._currNode = O.finally = new G(), this.code(x)), this._endBlockNode(P, G);
      }
      // `throw` statement
      throw(R) {
        return this._leafNode(new d(R));
      }
      // start self-balancing block
      block(R, N) {
        return this._blockStarts.push(this._nodes.length), R && this.code(R).endBlock(N), this;
      }
      // end the current self-balancing block
      endBlock(R) {
        const N = this._blockStarts.pop();
        if (N === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const x = this._nodes.length - N;
        if (x < 0 || R !== void 0 && x !== R)
          throw new Error(`CodeGen: wrong number of nodes: ${x} vs ${R} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(R, N = t.nil, x, O) {
        return this._blockNode(new _(R, N, x)), O && this.code(O).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(_);
      }
      optimize(R = 1) {
        for (; R-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(R) {
        return this._currNode.nodes.push(R), this;
      }
      _blockNode(R) {
        this._currNode.nodes.push(R), this._nodes.push(R);
      }
      _endBlockNode(R, N) {
        const x = this._currNode;
        if (x instanceof R || N && x instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${R.kind}/${N.kind}` : R.kind}"`);
      }
      _elseNode(R) {
        const N = this._currNode;
        if (!(N instanceof g))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = N.else = R, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const R = this._nodes;
        return R[R.length - 1];
      }
      set _currNode(R) {
        const N = this._nodes;
        N[N.length - 1] = R;
      }
    }
    e.CodeGen = q;
    function M(D, R) {
      for (const N in R)
        D[N] = (D[N] || 0) + (R[N] || 0);
      return D;
    }
    function K(D, R) {
      return R instanceof t._CodeOrName ? M(D, R.names) : D;
    }
    function k(D, R, N) {
      if (D instanceof t.Name)
        return x(D);
      if (!O(D))
        return D;
      return new t._Code(D._items.reduce((I, Q) => (Q instanceof t.Name && (Q = x(Q)), Q instanceof t._Code ? I.push(...Q._items) : I.push(Q), I), []));
      function x(I) {
        const Q = N[I.str];
        return Q === void 0 || R[I.str] !== 1 ? I : (delete R[I.str], Q);
      }
      function O(I) {
        return I instanceof t._Code && I._items.some((Q) => Q instanceof t.Name && R[Q.str] === 1 && N[Q.str] !== void 0);
      }
    }
    function F(D, R) {
      for (const N in R)
        D[N] = (D[N] || 0) - (R[N] || 0);
    }
    function Y(D) {
      return typeof D == "boolean" || typeof D == "number" || D === null ? !D : (0, t._)`!${j(D)}`;
    }
    e.not = Y;
    const B = C(e.operators.AND);
    function W(...D) {
      return D.reduce(B);
    }
    e.and = W;
    const Z = C(e.operators.OR);
    function V(...D) {
      return D.reduce(Z);
    }
    e.or = V;
    function C(D) {
      return (R, N) => R === t.nil ? N : N === t.nil ? R : (0, t._)`${j(R)} ${D} ${j(N)}`;
    }
    function j(D) {
      return D instanceof t.Name ? D : (0, t._)`(${D})`;
    }
  })(Oc)), Oc;
}
var Ae = {}, Xh;
function Le() {
  if (Xh) return Ae;
  Xh = 1, Object.defineProperty(Ae, "__esModule", { value: !0 }), Ae.checkStrictMode = Ae.getErrorPath = Ae.Type = Ae.useFunc = Ae.setEvaluated = Ae.evaluatedPropsToName = Ae.mergeEvaluated = Ae.eachItem = Ae.unescapeJsonPointer = Ae.escapeJsonPointer = Ae.escapeFragment = Ae.unescapeFragment = Ae.schemaRefOrVal = Ae.schemaHasRulesButRef = Ae.schemaHasRules = Ae.checkUnknownRules = Ae.alwaysValidSchema = Ae.toHash = void 0;
  const e = Ne(), t = Ka();
  function a($) {
    const _ = {};
    for (const w of $)
      _[w] = !0;
    return _;
  }
  Ae.toHash = a;
  function n($, _) {
    return typeof _ == "boolean" ? _ : Object.keys(_).length === 0 ? !0 : (l($, _), !r(_, $.self.RULES.all));
  }
  Ae.alwaysValidSchema = n;
  function l($, _ = $.schema) {
    const { opts: w, self: T } = $;
    if (!w.strictSchema || typeof _ == "boolean")
      return;
    const P = T.RULES.keywords;
    for (const G in _)
      P[G] || b($, `unknown keyword: "${G}"`);
  }
  Ae.checkUnknownRules = l;
  function r($, _) {
    if (typeof $ == "boolean")
      return !$;
    for (const w in $)
      if (_[w])
        return !0;
    return !1;
  }
  Ae.schemaHasRules = r;
  function i($, _) {
    if (typeof $ == "boolean")
      return !$;
    for (const w in $)
      if (w !== "$ref" && _.all[w])
        return !0;
    return !1;
  }
  Ae.schemaHasRulesButRef = i;
  function u({ topSchemaRef: $, schemaPath: _ }, w, T, P) {
    if (!P) {
      if (typeof w == "number" || typeof w == "boolean")
        return w;
      if (typeof w == "string")
        return (0, e._)`${w}`;
    }
    return (0, e._)`${$}${_}${(0, e.getProperty)(T)}`;
  }
  Ae.schemaRefOrVal = u;
  function o($) {
    return d(decodeURIComponent($));
  }
  Ae.unescapeFragment = o;
  function c($) {
    return encodeURIComponent(s($));
  }
  Ae.escapeFragment = c;
  function s($) {
    return typeof $ == "number" ? `${$}` : $.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Ae.escapeJsonPointer = s;
  function d($) {
    return $.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Ae.unescapeJsonPointer = d;
  function f($, _) {
    if (Array.isArray($))
      for (const w of $)
        _(w);
    else
      _($);
  }
  Ae.eachItem = f;
  function m({ mergeNames: $, mergeToName: _, mergeValues: w, resultToName: T }) {
    return (P, G, q, M) => {
      const K = q === void 0 ? G : q instanceof e.Name ? (G instanceof e.Name ? $(P, G, q) : _(P, G, q), q) : G instanceof e.Name ? (_(P, q, G), G) : w(G, q);
      return M === e.Name && !(K instanceof e.Name) ? T(P, K) : K;
    };
  }
  Ae.mergeEvaluated = {
    props: m({
      mergeNames: ($, _, w) => $.if((0, e._)`${w} !== true && ${_} !== undefined`, () => {
        $.if((0, e._)`${_} === true`, () => $.assign(w, !0), () => $.assign(w, (0, e._)`${w} || {}`).code((0, e._)`Object.assign(${w}, ${_})`));
      }),
      mergeToName: ($, _, w) => $.if((0, e._)`${w} !== true`, () => {
        _ === !0 ? $.assign(w, !0) : ($.assign(w, (0, e._)`${w} || {}`), v($, w, _));
      }),
      mergeValues: ($, _) => $ === !0 ? !0 : { ...$, ..._ },
      resultToName: y
    }),
    items: m({
      mergeNames: ($, _, w) => $.if((0, e._)`${w} !== true && ${_} !== undefined`, () => $.assign(w, (0, e._)`${_} === true ? true : ${w} > ${_} ? ${w} : ${_}`)),
      mergeToName: ($, _, w) => $.if((0, e._)`${w} !== true`, () => $.assign(w, _ === !0 ? !0 : (0, e._)`${w} > ${_} ? ${w} : ${_}`)),
      mergeValues: ($, _) => $ === !0 ? !0 : Math.max($, _),
      resultToName: ($, _) => $.var("items", _)
    })
  };
  function y($, _) {
    if (_ === !0)
      return $.var("props", !0);
    const w = $.var("props", (0, e._)`{}`);
    return _ !== void 0 && v($, w, _), w;
  }
  Ae.evaluatedPropsToName = y;
  function v($, _, w) {
    Object.keys(w).forEach((T) => $.assign((0, e._)`${_}${(0, e.getProperty)(T)}`, !0));
  }
  Ae.setEvaluated = v;
  const h = {};
  function g($, _) {
    return $.scopeValue("func", {
      ref: _,
      code: h[_.code] || (h[_.code] = new t._Code(_.code))
    });
  }
  Ae.useFunc = g;
  var p;
  (function($) {
    $[$.Num = 0] = "Num", $[$.Str = 1] = "Str";
  })(p || (Ae.Type = p = {}));
  function E($, _, w) {
    if ($ instanceof e.Name) {
      const T = _ === p.Num;
      return w ? T ? (0, e._)`"[" + ${$} + "]"` : (0, e._)`"['" + ${$} + "']"` : T ? (0, e._)`"/" + ${$}` : (0, e._)`"/" + ${$}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return w ? (0, e.getProperty)($).toString() : "/" + s($);
  }
  Ae.getErrorPath = E;
  function b($, _, w = $.opts.strictSchema) {
    if (w) {
      if (_ = `strict mode: ${_}`, w === !0)
        throw new Error(_);
      $.self.logger.warn(_);
    }
  }
  return Ae.checkStrictMode = b, Ae;
}
var oi = {}, Wh;
function kt() {
  if (Wh) return oi;
  Wh = 1, Object.defineProperty(oi, "__esModule", { value: !0 });
  const e = Ne(), t = {
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
  return oi.default = t, oi;
}
var Yh;
function cs() {
  return Yh || (Yh = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = Ne(), a = Le(), n = kt();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: g }) => g ? (0, t.str)`"${h}" keyword must be ${g} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function l(h, g = e.keywordError, p, E) {
      const { it: b } = h, { gen: $, compositeRule: _, allErrors: w } = b, T = d(h, g, p);
      E ?? (_ || w) ? o($, T) : c(b, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function r(h, g = e.keywordError, p) {
      const { it: E } = h, { gen: b, compositeRule: $, allErrors: _ } = E, w = d(h, g, p);
      o(b, w), $ || _ || c(E, n.default.vErrors);
    }
    e.reportExtraError = r;
    function i(h, g) {
      h.assign(n.default.errors, g), h.if((0, t._)`${n.default.vErrors} !== null`, () => h.if(g, () => h.assign((0, t._)`${n.default.vErrors}.length`, g), () => h.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function u({ gen: h, keyword: g, schemaValue: p, data: E, errsCount: b, it: $ }) {
      if (b === void 0)
        throw new Error("ajv implementation error");
      const _ = h.name("err");
      h.forRange("i", b, n.default.errors, (w) => {
        h.const(_, (0, t._)`${n.default.vErrors}[${w}]`), h.if((0, t._)`${_}.instancePath === undefined`, () => h.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(n.default.instancePath, $.errorPath))), h.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${$.errSchemaPath}/${g}`), $.opts.verbose && (h.assign((0, t._)`${_}.schema`, p), h.assign((0, t._)`${_}.data`, E));
      });
    }
    e.extendErrors = u;
    function o(h, g) {
      const p = h.const("err", g);
      h.if((0, t._)`${n.default.vErrors} === null`, () => h.assign(n.default.vErrors, (0, t._)`[${p}]`), (0, t._)`${n.default.vErrors}.push(${p})`), h.code((0, t._)`${n.default.errors}++`);
    }
    function c(h, g) {
      const { gen: p, validateName: E, schemaEnv: b } = h;
      b.$async ? p.throw((0, t._)`new ${h.ValidationError}(${g})`) : (p.assign((0, t._)`${E}.errors`, g), p.return(!1));
    }
    const s = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function d(h, g, p) {
      const { createErrors: E } = h.it;
      return E === !1 ? (0, t._)`{}` : f(h, g, p);
    }
    function f(h, g, p = {}) {
      const { gen: E, it: b } = h, $ = [
        m(b, p),
        y(h, p)
      ];
      return v(h, g, $), E.object(...$);
    }
    function m({ errorPath: h }, { instancePath: g }) {
      const p = g ? (0, t.str)`${h}${(0, a.getErrorPath)(g, a.Type.Str)}` : h;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, p)];
    }
    function y({ keyword: h, it: { errSchemaPath: g } }, { schemaPath: p, parentSchema: E }) {
      let b = E ? g : (0, t.str)`${g}/${h}`;
      return p && (b = (0, t.str)`${b}${(0, a.getErrorPath)(p, a.Type.Str)}`), [s.schemaPath, b];
    }
    function v(h, { params: g, message: p }, E) {
      const { keyword: b, data: $, schemaValue: _, it: w } = h, { opts: T, propertyName: P, topSchemaRef: G, schemaPath: q } = w;
      E.push([s.keyword, b], [s.params, typeof g == "function" ? g(h) : g || (0, t._)`{}`]), T.messages && E.push([s.message, typeof p == "function" ? p(h) : p]), T.verbose && E.push([s.schema, _], [s.parentSchema, (0, t._)`${G}${q}`], [n.default.data, $]), P && E.push([s.propertyName, P]);
    }
  })(Ic)), Ic;
}
var Jh;
function AE() {
  if (Jh) return br;
  Jh = 1, Object.defineProperty(br, "__esModule", { value: !0 }), br.boolOrEmptySchema = br.topBoolOrEmptySchema = void 0;
  const e = cs(), t = Ne(), a = kt(), n = {
    message: "boolean schema is false"
  };
  function l(u) {
    const { gen: o, schema: c, validateName: s } = u;
    c === !1 ? i(u, !1) : typeof c == "object" && c.$async === !0 ? o.return(a.default.data) : (o.assign((0, t._)`${s}.errors`, null), o.return(!0));
  }
  br.topBoolOrEmptySchema = l;
  function r(u, o) {
    const { gen: c, schema: s } = u;
    s === !1 ? (c.var(o, !1), i(u)) : c.var(o, !0);
  }
  br.boolOrEmptySchema = r;
  function i(u, o) {
    const { gen: c, data: s } = u, d = {
      gen: c,
      keyword: "false schema",
      data: s,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: u
    };
    (0, e.reportError)(d, n, void 0, o);
  }
  return br;
}
var et = {}, Rr = {}, Qh;
function p0() {
  if (Qh) return Rr;
  Qh = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.getRules = Rr.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function a(l) {
    return typeof l == "string" && t.has(l);
  }
  Rr.isJSONType = a;
  function n() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return Rr.getRules = n, Rr;
}
var zt = {}, Zh;
function m0() {
  if (Zh) return zt;
  Zh = 1, Object.defineProperty(zt, "__esModule", { value: !0 }), zt.shouldUseRule = zt.shouldUseGroup = zt.schemaHasRulesForType = void 0;
  function e({ schema: n, self: l }, r) {
    const i = l.RULES.types[r];
    return i && i !== !0 && t(n, i);
  }
  zt.schemaHasRulesForType = e;
  function t(n, l) {
    return l.rules.some((r) => a(n, r));
  }
  zt.shouldUseGroup = t;
  function a(n, l) {
    var r;
    return n[l.keyword] !== void 0 || ((r = l.definition.implements) === null || r === void 0 ? void 0 : r.some((i) => n[i] !== void 0));
  }
  return zt.shouldUseRule = a, zt;
}
var ep;
function Xa() {
  if (ep) return et;
  ep = 1, Object.defineProperty(et, "__esModule", { value: !0 }), et.reportTypeError = et.checkDataTypes = et.checkDataType = et.coerceAndCheckDataType = et.getJSONTypes = et.getSchemaTypes = et.DataType = void 0;
  const e = p0(), t = m0(), a = cs(), n = Ne(), l = Le();
  var r;
  (function(p) {
    p[p.Correct = 0] = "Correct", p[p.Wrong = 1] = "Wrong";
  })(r || (et.DataType = r = {}));
  function i(p) {
    const E = u(p.type);
    if (E.includes("null")) {
      if (p.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!E.length && p.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      p.nullable === !0 && E.push("null");
    }
    return E;
  }
  et.getSchemaTypes = i;
  function u(p) {
    const E = Array.isArray(p) ? p : p ? [p] : [];
    if (E.every(e.isJSONType))
      return E;
    throw new Error("type must be JSONType or JSONType[]: " + E.join(","));
  }
  et.getJSONTypes = u;
  function o(p, E) {
    const { gen: b, data: $, opts: _ } = p, w = s(E, _.coerceTypes), T = E.length > 0 && !(w.length === 0 && E.length === 1 && (0, t.schemaHasRulesForType)(p, E[0]));
    if (T) {
      const P = y(E, $, _.strictNumbers, r.Wrong);
      b.if(P, () => {
        w.length ? d(p, E, w) : h(p);
      });
    }
    return T;
  }
  et.coerceAndCheckDataType = o;
  const c = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function s(p, E) {
    return E ? p.filter((b) => c.has(b) || E === "array" && b === "array") : [];
  }
  function d(p, E, b) {
    const { gen: $, data: _, opts: w } = p, T = $.let("dataType", (0, n._)`typeof ${_}`), P = $.let("coerced", (0, n._)`undefined`);
    w.coerceTypes === "array" && $.if((0, n._)`${T} == 'object' && Array.isArray(${_}) && ${_}.length == 1`, () => $.assign(_, (0, n._)`${_}[0]`).assign(T, (0, n._)`typeof ${_}`).if(y(E, _, w.strictNumbers), () => $.assign(P, _))), $.if((0, n._)`${P} !== undefined`);
    for (const q of b)
      (c.has(q) || q === "array" && w.coerceTypes === "array") && G(q);
    $.else(), h(p), $.endIf(), $.if((0, n._)`${P} !== undefined`, () => {
      $.assign(_, P), f(p, P);
    });
    function G(q) {
      switch (q) {
        case "string":
          $.elseIf((0, n._)`${T} == "number" || ${T} == "boolean"`).assign(P, (0, n._)`"" + ${_}`).elseIf((0, n._)`${_} === null`).assign(P, (0, n._)`""`);
          return;
        case "number":
          $.elseIf((0, n._)`${T} == "boolean" || ${_} === null
              || (${T} == "string" && ${_} && ${_} == +${_})`).assign(P, (0, n._)`+${_}`);
          return;
        case "integer":
          $.elseIf((0, n._)`${T} === "boolean" || ${_} === null
              || (${T} === "string" && ${_} && ${_} == +${_} && !(${_} % 1))`).assign(P, (0, n._)`+${_}`);
          return;
        case "boolean":
          $.elseIf((0, n._)`${_} === "false" || ${_} === 0 || ${_} === null`).assign(P, !1).elseIf((0, n._)`${_} === "true" || ${_} === 1`).assign(P, !0);
          return;
        case "null":
          $.elseIf((0, n._)`${_} === "" || ${_} === 0 || ${_} === false`), $.assign(P, null);
          return;
        case "array":
          $.elseIf((0, n._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${_} === null`).assign(P, (0, n._)`[${_}]`);
      }
    }
  }
  function f({ gen: p, parentData: E, parentDataProperty: b }, $) {
    p.if((0, n._)`${E} !== undefined`, () => p.assign((0, n._)`${E}[${b}]`, $));
  }
  function m(p, E, b, $ = r.Correct) {
    const _ = $ === r.Correct ? n.operators.EQ : n.operators.NEQ;
    let w;
    switch (p) {
      case "null":
        return (0, n._)`${E} ${_} null`;
      case "array":
        w = (0, n._)`Array.isArray(${E})`;
        break;
      case "object":
        w = (0, n._)`${E} && typeof ${E} == "object" && !Array.isArray(${E})`;
        break;
      case "integer":
        w = T((0, n._)`!(${E} % 1) && !isNaN(${E})`);
        break;
      case "number":
        w = T();
        break;
      default:
        return (0, n._)`typeof ${E} ${_} ${p}`;
    }
    return $ === r.Correct ? w : (0, n.not)(w);
    function T(P = n.nil) {
      return (0, n.and)((0, n._)`typeof ${E} == "number"`, P, b ? (0, n._)`isFinite(${E})` : n.nil);
    }
  }
  et.checkDataType = m;
  function y(p, E, b, $) {
    if (p.length === 1)
      return m(p[0], E, b, $);
    let _;
    const w = (0, l.toHash)(p);
    if (w.array && w.object) {
      const T = (0, n._)`typeof ${E} != "object"`;
      _ = w.null ? T : (0, n._)`!${E} || ${T}`, delete w.null, delete w.array, delete w.object;
    } else
      _ = n.nil;
    w.number && delete w.integer;
    for (const T in w)
      _ = (0, n.and)(_, m(T, E, b, $));
    return _;
  }
  et.checkDataTypes = y;
  const v = {
    message: ({ schema: p }) => `must be ${p}`,
    params: ({ schema: p, schemaValue: E }) => typeof p == "string" ? (0, n._)`{type: ${p}}` : (0, n._)`{type: ${E}}`
  };
  function h(p) {
    const E = g(p);
    (0, a.reportError)(E, v);
  }
  et.reportTypeError = h;
  function g(p) {
    const { gen: E, data: b, schema: $ } = p, _ = (0, l.schemaRefOrVal)(p, $, "type");
    return {
      gen: E,
      keyword: "type",
      data: b,
      schema: $.type,
      schemaCode: _,
      schemaValue: _,
      parentSchema: $,
      params: {},
      it: p
    };
  }
  return et;
}
var Pn = {}, tp;
function CE() {
  if (tp) return Pn;
  tp = 1, Object.defineProperty(Pn, "__esModule", { value: !0 }), Pn.assignDefaults = void 0;
  const e = Ne(), t = Le();
  function a(l, r) {
    const { properties: i, items: u } = l.schema;
    if (r === "object" && i)
      for (const o in i)
        n(l, o, i[o].default);
    else r === "array" && Array.isArray(u) && u.forEach((o, c) => n(l, c, o.default));
  }
  Pn.assignDefaults = a;
  function n(l, r, i) {
    const { gen: u, compositeRule: o, data: c, opts: s } = l;
    if (i === void 0)
      return;
    const d = (0, e._)`${c}${(0, e.getProperty)(r)}`;
    if (o) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${d}`);
      return;
    }
    let f = (0, e._)`${d} === undefined`;
    s.useDefaults === "empty" && (f = (0, e._)`${f} || ${d} === null || ${d} === ""`), u.if(f, (0, e._)`${d} = ${(0, e.stringify)(i)}`);
  }
  return Pn;
}
var Nt = {}, xe = {}, rp;
function Lt() {
  if (rp) return xe;
  rp = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.validateUnion = xe.validateArray = xe.usePattern = xe.callValidateCode = xe.schemaProperties = xe.allSchemaProperties = xe.noPropertyInData = xe.propertyInData = xe.isOwnProperty = xe.hasPropFunc = xe.reportMissingProp = xe.checkMissingProp = xe.checkReportMissingProp = void 0;
  const e = Ne(), t = Le(), a = kt(), n = Le();
  function l(p, E) {
    const { gen: b, data: $, it: _ } = p;
    b.if(s(b, $, E, _.opts.ownProperties), () => {
      p.setParams({ missingProperty: (0, e._)`${E}` }, !0), p.error();
    });
  }
  xe.checkReportMissingProp = l;
  function r({ gen: p, data: E, it: { opts: b } }, $, _) {
    return (0, e.or)(...$.map((w) => (0, e.and)(s(p, E, w, b.ownProperties), (0, e._)`${_} = ${w}`)));
  }
  xe.checkMissingProp = r;
  function i(p, E) {
    p.setParams({ missingProperty: E }, !0), p.error();
  }
  xe.reportMissingProp = i;
  function u(p) {
    return p.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  xe.hasPropFunc = u;
  function o(p, E, b) {
    return (0, e._)`${u(p)}.call(${E}, ${b})`;
  }
  xe.isOwnProperty = o;
  function c(p, E, b, $) {
    const _ = (0, e._)`${E}${(0, e.getProperty)(b)} !== undefined`;
    return $ ? (0, e._)`${_} && ${o(p, E, b)}` : _;
  }
  xe.propertyInData = c;
  function s(p, E, b, $) {
    const _ = (0, e._)`${E}${(0, e.getProperty)(b)} === undefined`;
    return $ ? (0, e.or)(_, (0, e.not)(o(p, E, b))) : _;
  }
  xe.noPropertyInData = s;
  function d(p) {
    return p ? Object.keys(p).filter((E) => E !== "__proto__") : [];
  }
  xe.allSchemaProperties = d;
  function f(p, E) {
    return d(E).filter((b) => !(0, t.alwaysValidSchema)(p, E[b]));
  }
  xe.schemaProperties = f;
  function m({ schemaCode: p, data: E, it: { gen: b, topSchemaRef: $, schemaPath: _, errorPath: w }, it: T }, P, G, q) {
    const M = q ? (0, e._)`${p}, ${E}, ${$}${_}` : E, K = [
      [a.default.instancePath, (0, e.strConcat)(a.default.instancePath, w)],
      [a.default.parentData, T.parentData],
      [a.default.parentDataProperty, T.parentDataProperty],
      [a.default.rootData, a.default.rootData]
    ];
    T.opts.dynamicRef && K.push([a.default.dynamicAnchors, a.default.dynamicAnchors]);
    const k = (0, e._)`${M}, ${b.object(...K)}`;
    return G !== e.nil ? (0, e._)`${P}.call(${G}, ${k})` : (0, e._)`${P}(${k})`;
  }
  xe.callValidateCode = m;
  const y = (0, e._)`new RegExp`;
  function v({ gen: p, it: { opts: E } }, b) {
    const $ = E.unicodeRegExp ? "u" : "", { regExp: _ } = E.code, w = _(b, $);
    return p.scopeValue("pattern", {
      key: w.toString(),
      ref: w,
      code: (0, e._)`${_.code === "new RegExp" ? y : (0, n.useFunc)(p, _)}(${b}, ${$})`
    });
  }
  xe.usePattern = v;
  function h(p) {
    const { gen: E, data: b, keyword: $, it: _ } = p, w = E.name("valid");
    if (_.allErrors) {
      const P = E.let("valid", !0);
      return T(() => E.assign(P, !1)), P;
    }
    return E.var(w, !0), T(() => E.break()), w;
    function T(P) {
      const G = E.const("len", (0, e._)`${b}.length`);
      E.forRange("i", 0, G, (q) => {
        p.subschema({
          keyword: $,
          dataProp: q,
          dataPropType: t.Type.Num
        }, w), E.if((0, e.not)(w), P);
      });
    }
  }
  xe.validateArray = h;
  function g(p) {
    const { gen: E, schema: b, keyword: $, it: _ } = p;
    if (!Array.isArray(b))
      throw new Error("ajv implementation error");
    if (b.some((G) => (0, t.alwaysValidSchema)(_, G)) && !_.opts.unevaluated)
      return;
    const T = E.let("valid", !1), P = E.name("_valid");
    E.block(() => b.forEach((G, q) => {
      const M = p.subschema({
        keyword: $,
        schemaProp: q,
        compositeRule: !0
      }, P);
      E.assign(T, (0, e._)`${T} || ${P}`), p.mergeValidEvaluated(M, P) || E.if((0, e.not)(T));
    })), p.result(T, () => p.reset(), () => p.error(!0));
  }
  return xe.validateUnion = g, xe;
}
var np;
function DE() {
  if (np) return Nt;
  np = 1, Object.defineProperty(Nt, "__esModule", { value: !0 }), Nt.validateKeywordUsage = Nt.validSchemaType = Nt.funcKeywordCode = Nt.macroKeywordCode = void 0;
  const e = Ne(), t = kt(), a = Lt(), n = cs();
  function l(f, m) {
    const { gen: y, keyword: v, schema: h, parentSchema: g, it: p } = f, E = m.macro.call(p.self, h, g, p), b = c(y, v, E);
    p.opts.validateSchema !== !1 && p.self.validateSchema(E, !0);
    const $ = y.name("valid");
    f.subschema({
      schema: E,
      schemaPath: e.nil,
      errSchemaPath: `${p.errSchemaPath}/${v}`,
      topSchemaRef: b,
      compositeRule: !0
    }, $), f.pass($, () => f.error(!0));
  }
  Nt.macroKeywordCode = l;
  function r(f, m) {
    var y;
    const { gen: v, keyword: h, schema: g, parentSchema: p, $data: E, it: b } = f;
    o(b, m);
    const $ = !E && m.compile ? m.compile.call(b.self, g, p, b) : m.validate, _ = c(v, h, $), w = v.let("valid");
    f.block$data(w, T), f.ok((y = m.valid) !== null && y !== void 0 ? y : w);
    function T() {
      if (m.errors === !1)
        q(), m.modifying && i(f), M(() => f.error());
      else {
        const K = m.async ? P() : G();
        m.modifying && i(f), M(() => u(f, K));
      }
    }
    function P() {
      const K = v.let("ruleErrs", null);
      return v.try(() => q((0, e._)`await `), (k) => v.assign(w, !1).if((0, e._)`${k} instanceof ${b.ValidationError}`, () => v.assign(K, (0, e._)`${k}.errors`), () => v.throw(k))), K;
    }
    function G() {
      const K = (0, e._)`${_}.errors`;
      return v.assign(K, null), q(e.nil), K;
    }
    function q(K = m.async ? (0, e._)`await ` : e.nil) {
      const k = b.opts.passContext ? t.default.this : t.default.self, F = !("compile" in m && !E || m.schema === !1);
      v.assign(w, (0, e._)`${K}${(0, a.callValidateCode)(f, _, k, F)}`, m.modifying);
    }
    function M(K) {
      var k;
      v.if((0, e.not)((k = m.valid) !== null && k !== void 0 ? k : w), K);
    }
  }
  Nt.funcKeywordCode = r;
  function i(f) {
    const { gen: m, data: y, it: v } = f;
    m.if(v.parentData, () => m.assign(y, (0, e._)`${v.parentData}[${v.parentDataProperty}]`));
  }
  function u(f, m) {
    const { gen: y } = f;
    y.if((0, e._)`Array.isArray(${m})`, () => {
      y.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${m} : ${t.default.vErrors}.concat(${m})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(f);
    }, () => f.error());
  }
  function o({ schemaEnv: f }, m) {
    if (m.async && !f.$async)
      throw new Error("async keyword in sync schema");
  }
  function c(f, m, y) {
    if (y === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return f.scopeValue("keyword", typeof y == "function" ? { ref: y } : { ref: y, code: (0, e.stringify)(y) });
  }
  function s(f, m, y = !1) {
    return !m.length || m.some((v) => v === "array" ? Array.isArray(f) : v === "object" ? f && typeof f == "object" && !Array.isArray(f) : typeof f == v || y && typeof f > "u");
  }
  Nt.validSchemaType = s;
  function d({ schema: f, opts: m, self: y, errSchemaPath: v }, h, g) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(g) : h.keyword !== g)
      throw new Error("ajv implementation error");
    const p = h.dependencies;
    if (p?.some((E) => !Object.prototype.hasOwnProperty.call(f, E)))
      throw new Error(`parent schema must have dependencies of ${g}: ${p.join(",")}`);
    if (h.validateSchema && !h.validateSchema(f[g])) {
      const b = `keyword "${g}" value is invalid at path "${v}": ` + y.errorsText(h.validateSchema.errors);
      if (m.validateSchema === "log")
        y.logger.error(b);
      else
        throw new Error(b);
    }
  }
  return Nt.validateKeywordUsage = d, Nt;
}
var Kt = {}, ip;
function kE() {
  if (ip) return Kt;
  ip = 1, Object.defineProperty(Kt, "__esModule", { value: !0 }), Kt.extendSubschemaMode = Kt.extendSubschemaData = Kt.getSubschema = void 0;
  const e = Ne(), t = Le();
  function a(r, { keyword: i, schemaProp: u, schema: o, schemaPath: c, errSchemaPath: s, topSchemaRef: d }) {
    if (i !== void 0 && o !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const f = r.schema[i];
      return u === void 0 ? {
        schema: f,
        schemaPath: (0, e._)`${r.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${r.errSchemaPath}/${i}`
      } : {
        schema: f[u],
        schemaPath: (0, e._)`${r.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(u)}`,
        errSchemaPath: `${r.errSchemaPath}/${i}/${(0, t.escapeFragment)(u)}`
      };
    }
    if (o !== void 0) {
      if (c === void 0 || s === void 0 || d === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: o,
        schemaPath: c,
        topSchemaRef: d,
        errSchemaPath: s
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Kt.getSubschema = a;
  function n(r, i, { dataProp: u, dataPropType: o, data: c, dataTypes: s, propertyName: d }) {
    if (c !== void 0 && u !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: f } = i;
    if (u !== void 0) {
      const { errorPath: y, dataPathArr: v, opts: h } = i, g = f.let("data", (0, e._)`${i.data}${(0, e.getProperty)(u)}`, !0);
      m(g), r.errorPath = (0, e.str)`${y}${(0, t.getErrorPath)(u, o, h.jsPropertySyntax)}`, r.parentDataProperty = (0, e._)`${u}`, r.dataPathArr = [...v, r.parentDataProperty];
    }
    if (c !== void 0) {
      const y = c instanceof e.Name ? c : f.let("data", c, !0);
      m(y), d !== void 0 && (r.propertyName = d);
    }
    s && (r.dataTypes = s);
    function m(y) {
      r.data = y, r.dataLevel = i.dataLevel + 1, r.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), r.parentData = i.data, r.dataNames = [...i.dataNames, y];
    }
  }
  Kt.extendSubschemaData = n;
  function l(r, { jtdDiscriminator: i, jtdMetadata: u, compositeRule: o, createErrors: c, allErrors: s }) {
    o !== void 0 && (r.compositeRule = o), c !== void 0 && (r.createErrors = c), s !== void 0 && (r.allErrors = s), r.jtdDiscriminator = i, r.jtdMetadata = u;
  }
  return Kt.extendSubschemaMode = l, Kt;
}
var lt = {}, Dc, ap;
function us() {
  return ap || (ap = 1, Dc = function e(t, a) {
    if (t === a) return !0;
    if (t && a && typeof t == "object" && typeof a == "object") {
      if (t.constructor !== a.constructor) return !1;
      var n, l, r;
      if (Array.isArray(t)) {
        if (n = t.length, n != a.length) return !1;
        for (l = n; l-- !== 0; )
          if (!e(t[l], a[l])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === a.source && t.flags === a.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === a.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === a.toString();
      if (r = Object.keys(t), n = r.length, n !== Object.keys(a).length) return !1;
      for (l = n; l-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(a, r[l])) return !1;
      for (l = n; l-- !== 0; ) {
        var i = r[l];
        if (!e(t[i], a[i])) return !1;
      }
      return !0;
    }
    return t !== t && a !== a;
  }), Dc;
}
var kc = { exports: {} }, sp;
function LE() {
  if (sp) return kc.exports;
  sp = 1;
  var e = kc.exports = function(n, l, r) {
    typeof l == "function" && (r = l, l = {}), r = l.cb || r;
    var i = typeof r == "function" ? r : r.pre || function() {
    }, u = r.post || function() {
    };
    t(l, i, u, n, "", n);
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
  function t(n, l, r, i, u, o, c, s, d, f) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, u, o, c, s, d, f);
      for (var m in i) {
        var y = i[m];
        if (Array.isArray(y)) {
          if (m in e.arrayKeywords)
            for (var v = 0; v < y.length; v++)
              t(n, l, r, y[v], u + "/" + m + "/" + v, o, u, m, i, v);
        } else if (m in e.propsKeywords) {
          if (y && typeof y == "object")
            for (var h in y)
              t(n, l, r, y[h], u + "/" + m + "/" + a(h), o, u, m, i, h);
        } else (m in e.keywords || n.allKeys && !(m in e.skipKeywords)) && t(n, l, r, y, u + "/" + m, o, u, m, i);
      }
      r(i, u, o, c, s, d, f);
    }
  }
  function a(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return kc.exports;
}
var op;
function ls() {
  if (op) return lt;
  op = 1, Object.defineProperty(lt, "__esModule", { value: !0 }), lt.getSchemaRefs = lt.resolveUrl = lt.normalizeId = lt._getFullPath = lt.getFullPath = lt.inlineRef = void 0;
  const e = Le(), t = us(), a = LE(), n = /* @__PURE__ */ new Set([
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
  function l(v, h = !0) {
    return typeof v == "boolean" ? !0 : h === !0 ? !i(v) : h ? u(v) <= h : !1;
  }
  lt.inlineRef = l;
  const r = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(v) {
    for (const h in v) {
      if (r.has(h))
        return !0;
      const g = v[h];
      if (Array.isArray(g) && g.some(i) || typeof g == "object" && i(g))
        return !0;
    }
    return !1;
  }
  function u(v) {
    let h = 0;
    for (const g in v) {
      if (g === "$ref")
        return 1 / 0;
      if (h++, !n.has(g) && (typeof v[g] == "object" && (0, e.eachItem)(v[g], (p) => h += u(p)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function o(v, h = "", g) {
    g !== !1 && (h = d(h));
    const p = v.parse(h);
    return c(v, p);
  }
  lt.getFullPath = o;
  function c(v, h) {
    return v.serialize(h).split("#")[0] + "#";
  }
  lt._getFullPath = c;
  const s = /#\/?$/;
  function d(v) {
    return v ? v.replace(s, "") : "";
  }
  lt.normalizeId = d;
  function f(v, h, g) {
    return g = d(g), v.resolve(h, g);
  }
  lt.resolveUrl = f;
  const m = /^[a-z_][-a-z0-9._]*$/i;
  function y(v, h) {
    if (typeof v == "boolean")
      return {};
    const { schemaId: g, uriResolver: p } = this.opts, E = d(v[g] || h), b = { "": E }, $ = o(p, E, !1), _ = {}, w = /* @__PURE__ */ new Set();
    return a(v, { allKeys: !0 }, (G, q, M, K) => {
      if (K === void 0)
        return;
      const k = $ + q;
      let F = b[K];
      typeof G[g] == "string" && (F = Y.call(this, G[g])), B.call(this, G.$anchor), B.call(this, G.$dynamicAnchor), b[q] = F;
      function Y(W) {
        const Z = this.opts.uriResolver.resolve;
        if (W = d(F ? Z(F, W) : W), w.has(W))
          throw P(W);
        w.add(W);
        let V = this.refs[W];
        return typeof V == "string" && (V = this.refs[V]), typeof V == "object" ? T(G, V.schema, W) : W !== d(k) && (W[0] === "#" ? (T(G, _[W], W), _[W] = G) : this.refs[W] = k), W;
      }
      function B(W) {
        if (typeof W == "string") {
          if (!m.test(W))
            throw new Error(`invalid anchor "${W}"`);
          Y.call(this, `#${W}`);
        }
      }
    }), _;
    function T(G, q, M) {
      if (q !== void 0 && !t(G, q))
        throw P(M);
    }
    function P(G) {
      return new Error(`reference "${G}" resolves to more than one schema`);
    }
  }
  return lt.getSchemaRefs = y, lt;
}
var cp;
function fs() {
  if (cp) return Ht;
  cp = 1, Object.defineProperty(Ht, "__esModule", { value: !0 }), Ht.getData = Ht.KeywordCxt = Ht.validateFunctionCode = void 0;
  const e = AE(), t = Xa(), a = m0(), n = Xa(), l = CE(), r = DE(), i = kE(), u = Ne(), o = kt(), c = ls(), s = Le(), d = cs();
  function f(A) {
    if ($(A) && (w(A), b(A))) {
      h(A);
      return;
    }
    m(A, () => (0, e.topBoolOrEmptySchema)(A));
  }
  Ht.validateFunctionCode = f;
  function m({ gen: A, validateName: L, schema: X, schemaEnv: J, opts: re }, fe) {
    re.code.es5 ? A.func(L, (0, u._)`${o.default.data}, ${o.default.valCxt}`, J.$async, () => {
      A.code((0, u._)`"use strict"; ${p(X, re)}`), v(A, re), A.code(fe);
    }) : A.func(L, (0, u._)`${o.default.data}, ${y(re)}`, J.$async, () => A.code(p(X, re)).code(fe));
  }
  function y(A) {
    return (0, u._)`{${o.default.instancePath}="", ${o.default.parentData}, ${o.default.parentDataProperty}, ${o.default.rootData}=${o.default.data}${A.dynamicRef ? (0, u._)`, ${o.default.dynamicAnchors}={}` : u.nil}}={}`;
  }
  function v(A, L) {
    A.if(o.default.valCxt, () => {
      A.var(o.default.instancePath, (0, u._)`${o.default.valCxt}.${o.default.instancePath}`), A.var(o.default.parentData, (0, u._)`${o.default.valCxt}.${o.default.parentData}`), A.var(o.default.parentDataProperty, (0, u._)`${o.default.valCxt}.${o.default.parentDataProperty}`), A.var(o.default.rootData, (0, u._)`${o.default.valCxt}.${o.default.rootData}`), L.dynamicRef && A.var(o.default.dynamicAnchors, (0, u._)`${o.default.valCxt}.${o.default.dynamicAnchors}`);
    }, () => {
      A.var(o.default.instancePath, (0, u._)`""`), A.var(o.default.parentData, (0, u._)`undefined`), A.var(o.default.parentDataProperty, (0, u._)`undefined`), A.var(o.default.rootData, o.default.data), L.dynamicRef && A.var(o.default.dynamicAnchors, (0, u._)`{}`);
    });
  }
  function h(A) {
    const { schema: L, opts: X, gen: J } = A;
    m(A, () => {
      X.$comment && L.$comment && K(A), G(A), J.let(o.default.vErrors, null), J.let(o.default.errors, 0), X.unevaluated && g(A), T(A), k(A);
    });
  }
  function g(A) {
    const { gen: L, validateName: X } = A;
    A.evaluated = L.const("evaluated", (0, u._)`${X}.evaluated`), L.if((0, u._)`${A.evaluated}.dynamicProps`, () => L.assign((0, u._)`${A.evaluated}.props`, (0, u._)`undefined`)), L.if((0, u._)`${A.evaluated}.dynamicItems`, () => L.assign((0, u._)`${A.evaluated}.items`, (0, u._)`undefined`));
  }
  function p(A, L) {
    const X = typeof A == "object" && A[L.schemaId];
    return X && (L.code.source || L.code.process) ? (0, u._)`/*# sourceURL=${X} */` : u.nil;
  }
  function E(A, L) {
    if ($(A) && (w(A), b(A))) {
      _(A, L);
      return;
    }
    (0, e.boolOrEmptySchema)(A, L);
  }
  function b({ schema: A, self: L }) {
    if (typeof A == "boolean")
      return !A;
    for (const X in A)
      if (L.RULES.all[X])
        return !0;
    return !1;
  }
  function $(A) {
    return typeof A.schema != "boolean";
  }
  function _(A, L) {
    const { schema: X, gen: J, opts: re } = A;
    re.$comment && X.$comment && K(A), q(A), M(A);
    const fe = J.const("_errs", o.default.errors);
    T(A, fe), J.var(L, (0, u._)`${fe} === ${o.default.errors}`);
  }
  function w(A) {
    (0, s.checkUnknownRules)(A), P(A);
  }
  function T(A, L) {
    if (A.opts.jtd)
      return Y(A, [], !1, L);
    const X = (0, t.getSchemaTypes)(A.schema), J = (0, t.coerceAndCheckDataType)(A, X);
    Y(A, X, !J, L);
  }
  function P(A) {
    const { schema: L, errSchemaPath: X, opts: J, self: re } = A;
    L.$ref && J.ignoreKeywordsWithRef && (0, s.schemaHasRulesButRef)(L, re.RULES) && re.logger.warn(`$ref: keywords ignored in schema at path "${X}"`);
  }
  function G(A) {
    const { schema: L, opts: X } = A;
    L.default !== void 0 && X.useDefaults && X.strictSchema && (0, s.checkStrictMode)(A, "default is ignored in the schema root");
  }
  function q(A) {
    const L = A.schema[A.opts.schemaId];
    L && (A.baseId = (0, c.resolveUrl)(A.opts.uriResolver, A.baseId, L));
  }
  function M(A) {
    if (A.schema.$async && !A.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function K({ gen: A, schemaEnv: L, schema: X, errSchemaPath: J, opts: re }) {
    const fe = X.$comment;
    if (re.$comment === !0)
      A.code((0, u._)`${o.default.self}.logger.log(${fe})`);
    else if (typeof re.$comment == "function") {
      const ye = (0, u.str)`${J}/$comment`, Ie = A.scopeValue("root", { ref: L.root });
      A.code((0, u._)`${o.default.self}.opts.$comment(${fe}, ${ye}, ${Ie}.schema)`);
    }
  }
  function k(A) {
    const { gen: L, schemaEnv: X, validateName: J, ValidationError: re, opts: fe } = A;
    X.$async ? L.if((0, u._)`${o.default.errors} === 0`, () => L.return(o.default.data), () => L.throw((0, u._)`new ${re}(${o.default.vErrors})`)) : (L.assign((0, u._)`${J}.errors`, o.default.vErrors), fe.unevaluated && F(A), L.return((0, u._)`${o.default.errors} === 0`));
  }
  function F({ gen: A, evaluated: L, props: X, items: J }) {
    X instanceof u.Name && A.assign((0, u._)`${L}.props`, X), J instanceof u.Name && A.assign((0, u._)`${L}.items`, J);
  }
  function Y(A, L, X, J) {
    const { gen: re, schema: fe, data: ye, allErrors: Ie, opts: ke, self: Oe } = A, { RULES: Se } = Oe;
    if (fe.$ref && (ke.ignoreKeywordsWithRef || !(0, s.schemaHasRulesButRef)(fe, Se))) {
      re.block(() => O(A, "$ref", Se.all.$ref.definition));
      return;
    }
    ke.jtd || W(A, L), re.block(() => {
      for (const te of Se.rules)
        S(te);
      S(Se.post);
    });
    function S(te) {
      (0, a.shouldUseGroup)(fe, te) && (te.type ? (re.if((0, n.checkDataType)(te.type, ye, ke.strictNumbers)), B(A, te), L.length === 1 && L[0] === te.type && X && (re.else(), (0, n.reportTypeError)(A)), re.endIf()) : B(A, te), Ie || re.if((0, u._)`${o.default.errors} === ${J || 0}`));
    }
  }
  function B(A, L) {
    const { gen: X, schema: J, opts: { useDefaults: re } } = A;
    re && (0, l.assignDefaults)(A, L.type), X.block(() => {
      for (const fe of L.rules)
        (0, a.shouldUseRule)(J, fe) && O(A, fe.keyword, fe.definition, L.type);
    });
  }
  function W(A, L) {
    A.schemaEnv.meta || !A.opts.strictTypes || (Z(A, L), A.opts.allowUnionTypes || V(A, L), C(A, A.dataTypes));
  }
  function Z(A, L) {
    if (L.length) {
      if (!A.dataTypes.length) {
        A.dataTypes = L;
        return;
      }
      L.forEach((X) => {
        D(A.dataTypes, X) || N(A, `type "${X}" not allowed by context "${A.dataTypes.join(",")}"`);
      }), R(A, L);
    }
  }
  function V(A, L) {
    L.length > 1 && !(L.length === 2 && L.includes("null")) && N(A, "use allowUnionTypes to allow union type keyword");
  }
  function C(A, L) {
    const X = A.self.RULES.all;
    for (const J in X) {
      const re = X[J];
      if (typeof re == "object" && (0, a.shouldUseRule)(A.schema, re)) {
        const { type: fe } = re.definition;
        fe.length && !fe.some((ye) => j(L, ye)) && N(A, `missing type "${fe.join(",")}" for keyword "${J}"`);
      }
    }
  }
  function j(A, L) {
    return A.includes(L) || L === "number" && A.includes("integer");
  }
  function D(A, L) {
    return A.includes(L) || L === "integer" && A.includes("number");
  }
  function R(A, L) {
    const X = [];
    for (const J of A.dataTypes)
      D(L, J) ? X.push(J) : L.includes("integer") && J === "number" && X.push("integer");
    A.dataTypes = X;
  }
  function N(A, L) {
    const X = A.schemaEnv.baseId + A.errSchemaPath;
    L += ` at "${X}" (strictTypes)`, (0, s.checkStrictMode)(A, L, A.opts.strictTypes);
  }
  class x {
    constructor(L, X, J) {
      if ((0, r.validateKeywordUsage)(L, X, J), this.gen = L.gen, this.allErrors = L.allErrors, this.keyword = J, this.data = L.data, this.schema = L.schema[J], this.$data = X.$data && L.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, s.schemaRefOrVal)(L, this.schema, J, this.$data), this.schemaType = X.schemaType, this.parentSchema = L.schema, this.params = {}, this.it = L, this.def = X, this.$data)
        this.schemaCode = L.gen.const("vSchema", H(this.$data, L));
      else if (this.schemaCode = this.schemaValue, !(0, r.validSchemaType)(this.schema, X.schemaType, X.allowUndefined))
        throw new Error(`${J} value must be ${JSON.stringify(X.schemaType)}`);
      ("code" in X ? X.trackErrors : X.errors !== !1) && (this.errsCount = L.gen.const("_errs", o.default.errors));
    }
    result(L, X, J) {
      this.failResult((0, u.not)(L), X, J);
    }
    failResult(L, X, J) {
      this.gen.if(L), J ? J() : this.error(), X ? (this.gen.else(), X(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(L, X) {
      this.failResult((0, u.not)(L), void 0, X);
    }
    fail(L) {
      if (L === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(L), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(L) {
      if (!this.$data)
        return this.fail(L);
      const { schemaCode: X } = this;
      this.fail((0, u._)`${X} !== undefined && (${(0, u.or)(this.invalid$data(), L)})`);
    }
    error(L, X, J) {
      if (X) {
        this.setParams(X), this._error(L, J), this.setParams({});
        return;
      }
      this._error(L, J);
    }
    _error(L, X) {
      (L ? d.reportExtraError : d.reportError)(this, this.def.error, X);
    }
    $dataError() {
      (0, d.reportError)(this, this.def.$dataError || d.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, d.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(L) {
      this.allErrors || this.gen.if(L);
    }
    setParams(L, X) {
      X ? Object.assign(this.params, L) : this.params = L;
    }
    block$data(L, X, J = u.nil) {
      this.gen.block(() => {
        this.check$data(L, J), X();
      });
    }
    check$data(L = u.nil, X = u.nil) {
      if (!this.$data)
        return;
      const { gen: J, schemaCode: re, schemaType: fe, def: ye } = this;
      J.if((0, u.or)((0, u._)`${re} === undefined`, X)), L !== u.nil && J.assign(L, !0), (fe.length || ye.validateSchema) && (J.elseIf(this.invalid$data()), this.$dataError(), L !== u.nil && J.assign(L, !1)), J.else();
    }
    invalid$data() {
      const { gen: L, schemaCode: X, schemaType: J, def: re, it: fe } = this;
      return (0, u.or)(ye(), Ie());
      function ye() {
        if (J.length) {
          if (!(X instanceof u.Name))
            throw new Error("ajv implementation error");
          const ke = Array.isArray(J) ? J : [J];
          return (0, u._)`${(0, n.checkDataTypes)(ke, X, fe.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return u.nil;
      }
      function Ie() {
        if (re.validateSchema) {
          const ke = L.scopeValue("validate$data", { ref: re.validateSchema });
          return (0, u._)`!${ke}(${X})`;
        }
        return u.nil;
      }
    }
    subschema(L, X) {
      const J = (0, i.getSubschema)(this.it, L);
      (0, i.extendSubschemaData)(J, this.it, L), (0, i.extendSubschemaMode)(J, L);
      const re = { ...this.it, ...J, items: void 0, props: void 0 };
      return E(re, X), re;
    }
    mergeEvaluated(L, X) {
      const { it: J, gen: re } = this;
      J.opts.unevaluated && (J.props !== !0 && L.props !== void 0 && (J.props = s.mergeEvaluated.props(re, L.props, J.props, X)), J.items !== !0 && L.items !== void 0 && (J.items = s.mergeEvaluated.items(re, L.items, J.items, X)));
    }
    mergeValidEvaluated(L, X) {
      const { it: J, gen: re } = this;
      if (J.opts.unevaluated && (J.props !== !0 || J.items !== !0))
        return re.if(X, () => this.mergeEvaluated(L, u.Name)), !0;
    }
  }
  Ht.KeywordCxt = x;
  function O(A, L, X, J) {
    const re = new x(A, X, L);
    "code" in X ? X.code(re, J) : re.$data && X.validate ? (0, r.funcKeywordCode)(re, X) : "macro" in X ? (0, r.macroKeywordCode)(re, X) : (X.compile || X.validate) && (0, r.funcKeywordCode)(re, X);
  }
  const I = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function H(A, { dataLevel: L, dataNames: X, dataPathArr: J }) {
    let re, fe;
    if (A === "")
      return o.default.rootData;
    if (A[0] === "/") {
      if (!I.test(A))
        throw new Error(`Invalid JSON-pointer: ${A}`);
      re = A, fe = o.default.rootData;
    } else {
      const Oe = Q.exec(A);
      if (!Oe)
        throw new Error(`Invalid JSON-pointer: ${A}`);
      const Se = +Oe[1];
      if (re = Oe[2], re === "#") {
        if (Se >= L)
          throw new Error(ke("property/index", Se));
        return J[L - Se];
      }
      if (Se > L)
        throw new Error(ke("data", Se));
      if (fe = X[L - Se], !re)
        return fe;
    }
    let ye = fe;
    const Ie = re.split("/");
    for (const Oe of Ie)
      Oe && (fe = (0, u._)`${fe}${(0, u.getProperty)((0, s.unescapeJsonPointer)(Oe))}`, ye = (0, u._)`${ye} && ${fe}`);
    return ye;
    function ke(Oe, Se) {
      return `Cannot access ${Oe} ${Se} levels up, current level is ${L}`;
    }
  }
  return Ht.getData = H, Ht;
}
var ci = {}, up;
function ll() {
  if (up) return ci;
  up = 1, Object.defineProperty(ci, "__esModule", { value: !0 });
  class e extends Error {
    constructor(a) {
      super("validation failed"), this.errors = a, this.ajv = this.validation = !0;
    }
  }
  return ci.default = e, ci;
}
var ui = {}, lp;
function ds() {
  if (lp) return ui;
  lp = 1, Object.defineProperty(ui, "__esModule", { value: !0 });
  const e = ls();
  class t extends Error {
    constructor(n, l, r, i) {
      super(i || `can't resolve reference ${r} from id ${l}`), this.missingRef = (0, e.resolveUrl)(n, l, r), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return ui.default = t, ui;
}
var _t = {}, fp;
function hs() {
  if (fp) return _t;
  fp = 1, Object.defineProperty(_t, "__esModule", { value: !0 }), _t.resolveSchema = _t.getCompilingSchema = _t.resolveRef = _t.compileSchema = _t.SchemaEnv = void 0;
  const e = Ne(), t = ll(), a = kt(), n = ls(), l = Le(), r = fs();
  class i {
    constructor(g) {
      var p;
      this.refs = {}, this.dynamicAnchors = {};
      let E;
      typeof g.schema == "object" && (E = g.schema), this.schema = g.schema, this.schemaId = g.schemaId, this.root = g.root || this, this.baseId = (p = g.baseId) !== null && p !== void 0 ? p : (0, n.normalizeId)(E?.[g.schemaId || "$id"]), this.schemaPath = g.schemaPath, this.localRefs = g.localRefs, this.meta = g.meta, this.$async = E?.$async, this.refs = {};
    }
  }
  _t.SchemaEnv = i;
  function u(h) {
    const g = s.call(this, h);
    if (g)
      return g;
    const p = (0, n.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: E, lines: b } = this.opts.code, { ownProperties: $ } = this.opts, _ = new e.CodeGen(this.scope, { es5: E, lines: b, ownProperties: $ });
    let w;
    h.$async && (w = _.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = _.scopeName("validate");
    h.validateName = T;
    const P = {
      gen: _,
      allErrors: this.opts.allErrors,
      data: a.default.data,
      parentData: a.default.parentData,
      parentDataProperty: a.default.parentDataProperty,
      dataNames: [a.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: _.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: T,
      ValidationError: w,
      schema: h.schema,
      schemaEnv: h,
      rootId: p,
      baseId: h.baseId || p,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let G;
    try {
      this._compilations.add(h), (0, r.validateFunctionCode)(P), _.optimize(this.opts.code.optimize);
      const q = _.toString();
      G = `${_.scopeRefs(a.default.scope)}return ${q}`, this.opts.code.process && (G = this.opts.code.process(G, h));
      const K = new Function(`${a.default.self}`, `${a.default.scope}`, G)(this, this.scope.get());
      if (this.scope.value(T, { ref: K }), K.errors = null, K.schema = h.schema, K.schemaEnv = h, h.$async && (K.$async = !0), this.opts.code.source === !0 && (K.source = { validateName: T, validateCode: q, scopeValues: _._values }), this.opts.unevaluated) {
        const { props: k, items: F } = P;
        K.evaluated = {
          props: k instanceof e.Name ? void 0 : k,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: k instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, K.source && (K.source.evaluated = (0, e.stringify)(K.evaluated));
      }
      return h.validate = K, h;
    } catch (q) {
      throw delete h.validate, delete h.validateName, G && this.logger.error("Error compiling schema, function code:", G), q;
    } finally {
      this._compilations.delete(h);
    }
  }
  _t.compileSchema = u;
  function o(h, g, p) {
    var E;
    p = (0, n.resolveUrl)(this.opts.uriResolver, g, p);
    const b = h.refs[p];
    if (b)
      return b;
    let $ = f.call(this, h, p);
    if ($ === void 0) {
      const _ = (E = h.localRefs) === null || E === void 0 ? void 0 : E[p], { schemaId: w } = this.opts;
      _ && ($ = new i({ schema: _, schemaId: w, root: h, baseId: g }));
    }
    if ($ !== void 0)
      return h.refs[p] = c.call(this, $);
  }
  _t.resolveRef = o;
  function c(h) {
    return (0, n.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : u.call(this, h);
  }
  function s(h) {
    for (const g of this._compilations)
      if (d(g, h))
        return g;
  }
  _t.getCompilingSchema = s;
  function d(h, g) {
    return h.schema === g.schema && h.root === g.root && h.baseId === g.baseId;
  }
  function f(h, g) {
    let p;
    for (; typeof (p = this.refs[g]) == "string"; )
      g = p;
    return p || this.schemas[g] || m.call(this, h, g);
  }
  function m(h, g) {
    const p = this.opts.uriResolver.parse(g), E = (0, n._getFullPath)(this.opts.uriResolver, p);
    let b = (0, n.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && E === b)
      return v.call(this, p, h);
    const $ = (0, n.normalizeId)(E), _ = this.refs[$] || this.schemas[$];
    if (typeof _ == "string") {
      const w = m.call(this, h, _);
      return typeof w?.schema != "object" ? void 0 : v.call(this, p, w);
    }
    if (typeof _?.schema == "object") {
      if (_.validate || u.call(this, _), $ === (0, n.normalizeId)(g)) {
        const { schema: w } = _, { schemaId: T } = this.opts, P = w[T];
        return P && (b = (0, n.resolveUrl)(this.opts.uriResolver, b, P)), new i({ schema: w, schemaId: T, root: h, baseId: b });
      }
      return v.call(this, p, _);
    }
  }
  _t.resolveSchema = m;
  const y = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function v(h, { baseId: g, schema: p, root: E }) {
    var b;
    if (((b = h.fragment) === null || b === void 0 ? void 0 : b[0]) !== "/")
      return;
    for (const w of h.fragment.slice(1).split("/")) {
      if (typeof p == "boolean")
        return;
      const T = p[(0, l.unescapeFragment)(w)];
      if (T === void 0)
        return;
      p = T;
      const P = typeof p == "object" && p[this.opts.schemaId];
      !y.has(w) && P && (g = (0, n.resolveUrl)(this.opts.uriResolver, g, P));
    }
    let $;
    if (typeof p != "boolean" && p.$ref && !(0, l.schemaHasRulesButRef)(p, this.RULES)) {
      const w = (0, n.resolveUrl)(this.opts.uriResolver, g, p.$ref);
      $ = m.call(this, E, w);
    }
    const { schemaId: _ } = this.opts;
    if ($ = $ || new i({ schema: p, schemaId: _, root: E, baseId: g }), $.schema !== $.root.schema)
      return $;
  }
  return _t;
}
const qE = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", FE = "Meta-schema for $data reference (JSON AnySchema extension proposal)", UE = "object", jE = ["$data"], ME = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, xE = !1, VE = {
  $id: qE,
  description: FE,
  type: UE,
  required: jE,
  properties: ME,
  additionalProperties: xE
};
var li = {}, Nn = { exports: {} }, Lc, dp;
function g0() {
  if (dp) return Lc;
  dp = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function a(f) {
    let m = "", y = 0, v = 0;
    for (v = 0; v < f.length; v++)
      if (y = f[v].charCodeAt(0), y !== 48) {
        if (!(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
          return "";
        m += f[v];
        break;
      }
    for (v += 1; v < f.length; v++) {
      if (y = f[v].charCodeAt(0), !(y >= 48 && y <= 57 || y >= 65 && y <= 70 || y >= 97 && y <= 102))
        return "";
      m += f[v];
    }
    return m;
  }
  const n = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function l(f) {
    return f.length = 0, !0;
  }
  function r(f, m, y) {
    if (f.length) {
      const v = a(f);
      if (v !== "")
        m.push(v);
      else
        return y.error = !0, !1;
      f.length = 0;
    }
    return !0;
  }
  function i(f) {
    let m = 0;
    const y = { error: !1, address: "", zone: "" }, v = [], h = [];
    let g = !1, p = !1, E = r;
    for (let b = 0; b < f.length; b++) {
      const $ = f[b];
      if (!($ === "[" || $ === "]"))
        if ($ === ":") {
          if (g === !0 && (p = !0), !E(h, v, y))
            break;
          if (++m > 7) {
            y.error = !0;
            break;
          }
          b > 0 && f[b - 1] === ":" && (g = !0), v.push(":");
          continue;
        } else if ($ === "%") {
          if (!E(h, v, y))
            break;
          E = l;
        } else {
          h.push($);
          continue;
        }
    }
    return h.length && (E === l ? y.zone = h.join("") : p ? v.push(h.join("")) : v.push(a(h))), y.address = v.join(""), y;
  }
  function u(f) {
    if (o(f, ":") < 2)
      return { host: f, isIPV6: !1 };
    const m = i(f);
    if (m.error)
      return { host: f, isIPV6: !1 };
    {
      let y = m.address, v = m.address;
      return m.zone && (y += "%" + m.zone, v += "%25" + m.zone), { host: y, isIPV6: !0, escapedHost: v };
    }
  }
  function o(f, m) {
    let y = 0;
    for (let v = 0; v < f.length; v++)
      f[v] === m && y++;
    return y;
  }
  function c(f) {
    let m = f;
    const y = [];
    let v = -1, h = 0;
    for (; h = m.length; ) {
      if (h === 1) {
        if (m === ".")
          break;
        if (m === "/") {
          y.push("/");
          break;
        } else {
          y.push(m);
          break;
        }
      } else if (h === 2) {
        if (m[0] === ".") {
          if (m[1] === ".")
            break;
          if (m[1] === "/") {
            m = m.slice(2);
            continue;
          }
        } else if (m[0] === "/" && (m[1] === "." || m[1] === "/")) {
          y.push("/");
          break;
        }
      } else if (h === 3 && m === "/..") {
        y.length !== 0 && y.pop(), y.push("/");
        break;
      }
      if (m[0] === ".") {
        if (m[1] === ".") {
          if (m[2] === "/") {
            m = m.slice(3);
            continue;
          }
        } else if (m[1] === "/") {
          m = m.slice(2);
          continue;
        }
      } else if (m[0] === "/" && m[1] === ".") {
        if (m[2] === "/") {
          m = m.slice(2);
          continue;
        } else if (m[2] === "." && m[3] === "/") {
          m = m.slice(3), y.length !== 0 && y.pop();
          continue;
        }
      }
      if ((v = m.indexOf("/", 1)) === -1) {
        y.push(m);
        break;
      } else
        y.push(m.slice(0, v)), m = m.slice(v);
    }
    return y.join("");
  }
  function s(f, m) {
    const y = m !== !0 ? escape : unescape;
    return f.scheme !== void 0 && (f.scheme = y(f.scheme)), f.userinfo !== void 0 && (f.userinfo = y(f.userinfo)), f.host !== void 0 && (f.host = y(f.host)), f.path !== void 0 && (f.path = y(f.path)), f.query !== void 0 && (f.query = y(f.query)), f.fragment !== void 0 && (f.fragment = y(f.fragment)), f;
  }
  function d(f) {
    const m = [];
    if (f.userinfo !== void 0 && (m.push(f.userinfo), m.push("@")), f.host !== void 0) {
      let y = unescape(f.host);
      if (!t(y)) {
        const v = u(y);
        v.isIPV6 === !0 ? y = `[${v.escapedHost}]` : y = f.host;
      }
      m.push(y);
    }
    return (typeof f.port == "number" || typeof f.port == "string") && (m.push(":"), m.push(String(f.port))), m.length ? m.join("") : void 0;
  }
  return Lc = {
    nonSimpleDomain: n,
    recomposeAuthority: d,
    normalizeComponentEncoding: s,
    removeDotSegments: c,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: u,
    stringArrayToHexStripped: a
  }, Lc;
}
var qc, hp;
function GE() {
  if (hp) return qc;
  hp = 1;
  const { isUUID: e } = g0(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, a = (
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
  function n($) {
    return a.indexOf(
      /** @type {*} */
      $
    ) !== -1;
  }
  function l($) {
    return $.secure === !0 ? !0 : $.secure === !1 ? !1 : $.scheme ? $.scheme.length === 3 && ($.scheme[0] === "w" || $.scheme[0] === "W") && ($.scheme[1] === "s" || $.scheme[1] === "S") && ($.scheme[2] === "s" || $.scheme[2] === "S") : !1;
  }
  function r($) {
    return $.host || ($.error = $.error || "HTTP URIs must have a host."), $;
  }
  function i($) {
    const _ = String($.scheme).toLowerCase() === "https";
    return ($.port === (_ ? 443 : 80) || $.port === "") && ($.port = void 0), $.path || ($.path = "/"), $;
  }
  function u($) {
    return $.secure = l($), $.resourceName = ($.path || "/") + ($.query ? "?" + $.query : ""), $.path = void 0, $.query = void 0, $;
  }
  function o($) {
    if (($.port === (l($) ? 443 : 80) || $.port === "") && ($.port = void 0), typeof $.secure == "boolean" && ($.scheme = $.secure ? "wss" : "ws", $.secure = void 0), $.resourceName) {
      const [_, w] = $.resourceName.split("?");
      $.path = _ && _ !== "/" ? _ : void 0, $.query = w, $.resourceName = void 0;
    }
    return $.fragment = void 0, $;
  }
  function c($, _) {
    if (!$.path)
      return $.error = "URN can not be parsed", $;
    const w = $.path.match(t);
    if (w) {
      const T = _.scheme || $.scheme || "urn";
      $.nid = w[1].toLowerCase(), $.nss = w[2];
      const P = `${T}:${_.nid || $.nid}`, G = b(P);
      $.path = void 0, G && ($ = G.parse($, _));
    } else
      $.error = $.error || "URN can not be parsed.";
    return $;
  }
  function s($, _) {
    if ($.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const w = _.scheme || $.scheme || "urn", T = $.nid.toLowerCase(), P = `${w}:${_.nid || T}`, G = b(P);
    G && ($ = G.serialize($, _));
    const q = $, M = $.nss;
    return q.path = `${T || _.nid}:${M}`, _.skipEscape = !0, q;
  }
  function d($, _) {
    const w = $;
    return w.uuid = w.nss, w.nss = void 0, !_.tolerant && (!w.uuid || !e(w.uuid)) && (w.error = w.error || "UUID is not valid."), w;
  }
  function f($) {
    const _ = $;
    return _.nss = ($.uuid || "").toLowerCase(), _;
  }
  const m = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: r,
      serialize: i
    }
  ), y = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: m.domainHost,
      parse: r,
      serialize: i
    }
  ), v = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: u,
      serialize: o
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: v.domainHost,
      parse: v.parse,
      serialize: v.serialize
    }
  ), E = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: m,
      https: y,
      ws: v,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: c,
          serialize: s,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: d,
          serialize: f,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(E, null);
  function b($) {
    return $ && (E[
      /** @type {SchemeName} */
      $
    ] || E[
      /** @type {SchemeName} */
      $.toLowerCase()
    ]) || void 0;
  }
  return qc = {
    wsIsSecure: l,
    SCHEMES: E,
    isValidSchemeName: n,
    getSchemeHandler: b
  }, qc;
}
var pp;
function y0() {
  if (pp) return Nn.exports;
  pp = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: a, normalizeComponentEncoding: n, isIPv4: l, nonSimpleDomain: r } = g0(), { SCHEMES: i, getSchemeHandler: u } = GE();
  function o(h, g) {
    return typeof h == "string" ? h = /** @type {T} */
    f(y(h, g), g) : typeof h == "object" && (h = /** @type {T} */
    y(f(h, g), g)), h;
  }
  function c(h, g, p) {
    const E = p ? Object.assign({ scheme: "null" }, p) : { scheme: "null" }, b = s(y(h, E), y(g, E), E, !0);
    return E.skipEscape = !0, f(b, E);
  }
  function s(h, g, p, E) {
    const b = {};
    return E || (h = y(f(h, p), p), g = y(f(g, p), p)), p = p || {}, !p.tolerant && g.scheme ? (b.scheme = g.scheme, b.userinfo = g.userinfo, b.host = g.host, b.port = g.port, b.path = t(g.path || ""), b.query = g.query) : (g.userinfo !== void 0 || g.host !== void 0 || g.port !== void 0 ? (b.userinfo = g.userinfo, b.host = g.host, b.port = g.port, b.path = t(g.path || ""), b.query = g.query) : (g.path ? (g.path[0] === "/" ? b.path = t(g.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? b.path = "/" + g.path : h.path ? b.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + g.path : b.path = g.path, b.path = t(b.path)), b.query = g.query) : (b.path = h.path, g.query !== void 0 ? b.query = g.query : b.query = h.query), b.userinfo = h.userinfo, b.host = h.host, b.port = h.port), b.scheme = h.scheme), b.fragment = g.fragment, b;
  }
  function d(h, g, p) {
    return typeof h == "string" ? (h = unescape(h), h = f(n(y(h, p), !0), { ...p, skipEscape: !0 })) : typeof h == "object" && (h = f(n(h, !0), { ...p, skipEscape: !0 })), typeof g == "string" ? (g = unescape(g), g = f(n(y(g, p), !0), { ...p, skipEscape: !0 })) : typeof g == "object" && (g = f(n(g, !0), { ...p, skipEscape: !0 })), h.toLowerCase() === g.toLowerCase();
  }
  function f(h, g) {
    const p = {
      host: h.host,
      scheme: h.scheme,
      userinfo: h.userinfo,
      port: h.port,
      path: h.path,
      query: h.query,
      nid: h.nid,
      nss: h.nss,
      uuid: h.uuid,
      fragment: h.fragment,
      reference: h.reference,
      resourceName: h.resourceName,
      secure: h.secure,
      error: ""
    }, E = Object.assign({}, g), b = [], $ = u(E.scheme || p.scheme);
    $ && $.serialize && $.serialize(p, E), p.path !== void 0 && (E.skipEscape ? p.path = unescape(p.path) : (p.path = escape(p.path), p.scheme !== void 0 && (p.path = p.path.split("%3A").join(":")))), E.reference !== "suffix" && p.scheme && b.push(p.scheme, ":");
    const _ = a(p);
    if (_ !== void 0 && (E.reference !== "suffix" && b.push("//"), b.push(_), p.path && p.path[0] !== "/" && b.push("/")), p.path !== void 0) {
      let w = p.path;
      !E.absolutePath && (!$ || !$.absolutePath) && (w = t(w)), _ === void 0 && w[0] === "/" && w[1] === "/" && (w = "/%2F" + w.slice(2)), b.push(w);
    }
    return p.query !== void 0 && b.push("?", p.query), p.fragment !== void 0 && b.push("#", p.fragment), b.join("");
  }
  const m = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function y(h, g) {
    const p = Object.assign({}, g), E = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let b = !1;
    p.reference === "suffix" && (p.scheme ? h = p.scheme + ":" + h : h = "//" + h);
    const $ = h.match(m);
    if ($) {
      if (E.scheme = $[1], E.userinfo = $[3], E.host = $[4], E.port = parseInt($[5], 10), E.path = $[6] || "", E.query = $[7], E.fragment = $[8], isNaN(E.port) && (E.port = $[5]), E.host)
        if (l(E.host) === !1) {
          const T = e(E.host);
          E.host = T.host.toLowerCase(), b = T.isIPV6;
        } else
          b = !0;
      E.scheme === void 0 && E.userinfo === void 0 && E.host === void 0 && E.port === void 0 && E.query === void 0 && !E.path ? E.reference = "same-document" : E.scheme === void 0 ? E.reference = "relative" : E.fragment === void 0 ? E.reference = "absolute" : E.reference = "uri", p.reference && p.reference !== "suffix" && p.reference !== E.reference && (E.error = E.error || "URI is not a " + p.reference + " reference.");
      const _ = u(p.scheme || E.scheme);
      if (!p.unicodeSupport && (!_ || !_.unicodeSupport) && E.host && (p.domainHost || _ && _.domainHost) && b === !1 && r(E.host))
        try {
          E.host = URL.domainToASCII(E.host.toLowerCase());
        } catch (w) {
          E.error = E.error || "Host's domain name can not be converted to ASCII: " + w;
        }
      (!_ || _ && !_.skipNormalize) && (h.indexOf("%") !== -1 && (E.scheme !== void 0 && (E.scheme = unescape(E.scheme)), E.host !== void 0 && (E.host = unescape(E.host))), E.path && (E.path = escape(unescape(E.path))), E.fragment && (E.fragment = encodeURI(decodeURIComponent(E.fragment)))), _ && _.parse && _.parse(E, p);
    } else
      E.error = E.error || "URI can not be parsed.";
    return E;
  }
  const v = {
    SCHEMES: i,
    normalize: o,
    resolve: c,
    resolveComponent: s,
    equal: d,
    serialize: f,
    parse: y
  };
  return Nn.exports = v, Nn.exports.default = v, Nn.exports.fastUri = v, Nn.exports;
}
var mp;
function BE() {
  if (mp) return li;
  mp = 1, Object.defineProperty(li, "__esModule", { value: !0 });
  const e = y0();
  return e.code = 'require("ajv/dist/runtime/uri").default', li.default = e, li;
}
var gp;
function HE() {
  return gp || (gp = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = fs();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var a = Ne();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return a._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return a.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return a.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return a.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return a.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return a.CodeGen;
    } });
    const n = ll(), l = ds(), r = p0(), i = hs(), u = Ne(), o = ls(), c = Xa(), s = Le(), d = VE, f = BE(), m = (V, C) => new RegExp(V, C);
    m.code = "new RegExp";
    const y = ["removeAdditional", "useDefaults", "coerceTypes"], v = /* @__PURE__ */ new Set([
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
    ]), h = {
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
    }, g = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, p = 200;
    function E(V) {
      var C, j, D, R, N, x, O, I, Q, H, A, L, X, J, re, fe, ye, Ie, ke, Oe, Se, S, te, ie, pe;
      const ae = V.strict, de = (C = V.code) === null || C === void 0 ? void 0 : C.optimize, le = de === !0 || de === void 0 ? 1 : de || 0, me = (D = (j = V.code) === null || j === void 0 ? void 0 : j.regExp) !== null && D !== void 0 ? D : m, ve = (R = V.uriResolver) !== null && R !== void 0 ? R : f.default;
      return {
        strictSchema: (x = (N = V.strictSchema) !== null && N !== void 0 ? N : ae) !== null && x !== void 0 ? x : !0,
        strictNumbers: (I = (O = V.strictNumbers) !== null && O !== void 0 ? O : ae) !== null && I !== void 0 ? I : !0,
        strictTypes: (H = (Q = V.strictTypes) !== null && Q !== void 0 ? Q : ae) !== null && H !== void 0 ? H : "log",
        strictTuples: (L = (A = V.strictTuples) !== null && A !== void 0 ? A : ae) !== null && L !== void 0 ? L : "log",
        strictRequired: (J = (X = V.strictRequired) !== null && X !== void 0 ? X : ae) !== null && J !== void 0 ? J : !1,
        code: V.code ? { ...V.code, optimize: le, regExp: me } : { optimize: le, regExp: me },
        loopRequired: (re = V.loopRequired) !== null && re !== void 0 ? re : p,
        loopEnum: (fe = V.loopEnum) !== null && fe !== void 0 ? fe : p,
        meta: (ye = V.meta) !== null && ye !== void 0 ? ye : !0,
        messages: (Ie = V.messages) !== null && Ie !== void 0 ? Ie : !0,
        inlineRefs: (ke = V.inlineRefs) !== null && ke !== void 0 ? ke : !0,
        schemaId: (Oe = V.schemaId) !== null && Oe !== void 0 ? Oe : "$id",
        addUsedSchema: (Se = V.addUsedSchema) !== null && Se !== void 0 ? Se : !0,
        validateSchema: (S = V.validateSchema) !== null && S !== void 0 ? S : !0,
        validateFormats: (te = V.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (ie = V.unicodeRegExp) !== null && ie !== void 0 ? ie : !0,
        int32range: (pe = V.int32range) !== null && pe !== void 0 ? pe : !0,
        uriResolver: ve
      };
    }
    class b {
      constructor(C = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), C = this.opts = { ...C, ...E(C) };
        const { es5: j, lines: D } = this.opts.code;
        this.scope = new u.ValueScope({ scope: {}, prefixes: v, es5: j, lines: D }), this.logger = M(C.logger);
        const R = C.validateFormats;
        C.validateFormats = !1, this.RULES = (0, r.getRules)(), $.call(this, h, C, "NOT SUPPORTED"), $.call(this, g, C, "DEPRECATED", "warn"), this._metaOpts = G.call(this), C.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), C.keywords && P.call(this, C.keywords), typeof C.meta == "object" && this.addMetaSchema(C.meta), w.call(this), C.validateFormats = R;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: C, meta: j, schemaId: D } = this.opts;
        let R = d;
        D === "id" && (R = { ...d }, R.id = R.$id, delete R.$id), j && C && this.addMetaSchema(R, R[D], !1);
      }
      defaultMeta() {
        const { meta: C, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof C == "object" ? C[j] || C : void 0;
      }
      validate(C, j) {
        let D;
        if (typeof C == "string") {
          if (D = this.getSchema(C), !D)
            throw new Error(`no schema with key or ref "${C}"`);
        } else
          D = this.compile(C);
        const R = D(j);
        return "$async" in D || (this.errors = D.errors), R;
      }
      compile(C, j) {
        const D = this._addSchema(C, j);
        return D.validate || this._compileSchemaEnv(D);
      }
      compileAsync(C, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: D } = this.opts;
        return R.call(this, C, j);
        async function R(H, A) {
          await N.call(this, H.$schema);
          const L = this._addSchema(H, A);
          return L.validate || x.call(this, L);
        }
        async function N(H) {
          H && !this.getSchema(H) && await R.call(this, { $ref: H }, !0);
        }
        async function x(H) {
          try {
            return this._compileSchemaEnv(H);
          } catch (A) {
            if (!(A instanceof l.default))
              throw A;
            return O.call(this, A), await I.call(this, A.missingSchema), x.call(this, H);
          }
        }
        function O({ missingSchema: H, missingRef: A }) {
          if (this.refs[H])
            throw new Error(`AnySchema ${H} is loaded but ${A} cannot be resolved`);
        }
        async function I(H) {
          const A = await Q.call(this, H);
          this.refs[H] || await N.call(this, A.$schema), this.refs[H] || this.addSchema(A, H, j);
        }
        async function Q(H) {
          const A = this._loading[H];
          if (A)
            return A;
          try {
            return await (this._loading[H] = D(H));
          } finally {
            delete this._loading[H];
          }
        }
      }
      // Adds schema to the instance
      addSchema(C, j, D, R = this.opts.validateSchema) {
        if (Array.isArray(C)) {
          for (const x of C)
            this.addSchema(x, void 0, D, R);
          return this;
        }
        let N;
        if (typeof C == "object") {
          const { schemaId: x } = this.opts;
          if (N = C[x], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${x} must be string`);
        }
        return j = (0, o.normalizeId)(j || N), this._checkUnique(j), this.schemas[j] = this._addSchema(C, D, j, R, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(C, j, D = this.opts.validateSchema) {
        return this.addSchema(C, j, !0, D), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(C, j) {
        if (typeof C == "boolean")
          return !0;
        let D;
        if (D = C.$schema, D !== void 0 && typeof D != "string")
          throw new Error("$schema must be a string");
        if (D = D || this.opts.defaultMeta || this.defaultMeta(), !D)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const R = this.validate(D, C);
        if (!R && j) {
          const N = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(N);
          else
            throw new Error(N);
        }
        return R;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(C) {
        let j;
        for (; typeof (j = _.call(this, C)) == "string"; )
          C = j;
        if (j === void 0) {
          const { schemaId: D } = this.opts, R = new i.SchemaEnv({ schema: {}, schemaId: D });
          if (j = i.resolveSchema.call(this, R, C), !j)
            return;
          this.refs[C] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(C) {
        if (C instanceof RegExp)
          return this._removeAllSchemas(this.schemas, C), this._removeAllSchemas(this.refs, C), this;
        switch (typeof C) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = _.call(this, C);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[C], delete this.refs[C], this;
          }
          case "object": {
            const j = C;
            this._cache.delete(j);
            let D = C[this.opts.schemaId];
            return D && (D = (0, o.normalizeId)(D), delete this.schemas[D], delete this.refs[D]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(C) {
        for (const j of C)
          this.addKeyword(j);
        return this;
      }
      addKeyword(C, j) {
        let D;
        if (typeof C == "string")
          D = C, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = D);
        else if (typeof C == "object" && j === void 0) {
          if (j = C, D = j.keyword, Array.isArray(D) && !D.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (k.call(this, D, j), !j)
          return (0, s.eachItem)(D, (N) => F.call(this, N)), this;
        B.call(this, j);
        const R = {
          ...j,
          type: (0, c.getJSONTypes)(j.type),
          schemaType: (0, c.getJSONTypes)(j.schemaType)
        };
        return (0, s.eachItem)(D, R.type.length === 0 ? (N) => F.call(this, N, R) : (N) => R.type.forEach((x) => F.call(this, N, R, x))), this;
      }
      getKeyword(C) {
        const j = this.RULES.all[C];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(C) {
        const { RULES: j } = this;
        delete j.keywords[C], delete j.all[C];
        for (const D of j.rules) {
          const R = D.rules.findIndex((N) => N.keyword === C);
          R >= 0 && D.rules.splice(R, 1);
        }
        return this;
      }
      // Add format
      addFormat(C, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[C] = j, this;
      }
      errorsText(C = this.errors, { separator: j = ", ", dataVar: D = "data" } = {}) {
        return !C || C.length === 0 ? "No errors" : C.map((R) => `${D}${R.instancePath} ${R.message}`).reduce((R, N) => R + j + N);
      }
      $dataMetaSchema(C, j) {
        const D = this.RULES.all;
        C = JSON.parse(JSON.stringify(C));
        for (const R of j) {
          const N = R.split("/").slice(1);
          let x = C;
          for (const O of N)
            x = x[O];
          for (const O in D) {
            const I = D[O];
            if (typeof I != "object")
              continue;
            const { $data: Q } = I.definition, H = x[O];
            Q && H && (x[O] = Z(H));
          }
        }
        return C;
      }
      _removeAllSchemas(C, j) {
        for (const D in C) {
          const R = C[D];
          (!j || j.test(D)) && (typeof R == "string" ? delete C[D] : R && !R.meta && (this._cache.delete(R.schema), delete C[D]));
        }
      }
      _addSchema(C, j, D, R = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let x;
        const { schemaId: O } = this.opts;
        if (typeof C == "object")
          x = C[O];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof C != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let I = this._cache.get(C);
        if (I !== void 0)
          return I;
        D = (0, o.normalizeId)(x || D);
        const Q = o.getSchemaRefs.call(this, C, D);
        return I = new i.SchemaEnv({ schema: C, schemaId: O, meta: j, baseId: D, localRefs: Q }), this._cache.set(I.schema, I), N && !D.startsWith("#") && (D && this._checkUnique(D), this.refs[D] = I), R && this.validateSchema(C, !0), I;
      }
      _checkUnique(C) {
        if (this.schemas[C] || this.refs[C])
          throw new Error(`schema with key or id "${C}" already exists`);
      }
      _compileSchemaEnv(C) {
        if (C.meta ? this._compileMetaSchema(C) : i.compileSchema.call(this, C), !C.validate)
          throw new Error("ajv implementation error");
        return C.validate;
      }
      _compileMetaSchema(C) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, C);
        } finally {
          this.opts = j;
        }
      }
    }
    b.ValidationError = n.default, b.MissingRefError = l.default, e.default = b;
    function $(V, C, j, D = "error") {
      for (const R in V) {
        const N = R;
        N in C && this.logger[D](`${j}: option ${R}. ${V[N]}`);
      }
    }
    function _(V) {
      return V = (0, o.normalizeId)(V), this.schemas[V] || this.refs[V];
    }
    function w() {
      const V = this.opts.schemas;
      if (V)
        if (Array.isArray(V))
          this.addSchema(V);
        else
          for (const C in V)
            this.addSchema(V[C], C);
    }
    function T() {
      for (const V in this.opts.formats) {
        const C = this.opts.formats[V];
        C && this.addFormat(V, C);
      }
    }
    function P(V) {
      if (Array.isArray(V)) {
        this.addVocabulary(V);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const C in V) {
        const j = V[C];
        j.keyword || (j.keyword = C), this.addKeyword(j);
      }
    }
    function G() {
      const V = { ...this.opts };
      for (const C of y)
        delete V[C];
      return V;
    }
    const q = { log() {
    }, warn() {
    }, error() {
    } };
    function M(V) {
      if (V === !1)
        return q;
      if (V === void 0)
        return console;
      if (V.log && V.warn && V.error)
        return V;
      throw new Error("logger must implement log, warn and error methods");
    }
    const K = /^[a-z_$][a-z0-9_$:-]*$/i;
    function k(V, C) {
      const { RULES: j } = this;
      if ((0, s.eachItem)(V, (D) => {
        if (j.keywords[D])
          throw new Error(`Keyword ${D} is already defined`);
        if (!K.test(D))
          throw new Error(`Keyword ${D} has invalid name`);
      }), !!C && C.$data && !("code" in C || "validate" in C))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(V, C, j) {
      var D;
      const R = C?.post;
      if (j && R)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let x = R ? N.post : N.rules.find(({ type: I }) => I === j);
      if (x || (x = { type: j, rules: [] }, N.rules.push(x)), N.keywords[V] = !0, !C)
        return;
      const O = {
        keyword: V,
        definition: {
          ...C,
          type: (0, c.getJSONTypes)(C.type),
          schemaType: (0, c.getJSONTypes)(C.schemaType)
        }
      };
      C.before ? Y.call(this, x, O, C.before) : x.rules.push(O), N.all[V] = O, (D = C.implements) === null || D === void 0 || D.forEach((I) => this.addKeyword(I));
    }
    function Y(V, C, j) {
      const D = V.rules.findIndex((R) => R.keyword === j);
      D >= 0 ? V.rules.splice(D, 0, C) : (V.rules.push(C), this.logger.warn(`rule ${j} is not defined`));
    }
    function B(V) {
      let { metaSchema: C } = V;
      C !== void 0 && (V.$data && this.opts.$data && (C = Z(C)), V.validateSchema = this.compile(C, !0));
    }
    const W = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Z(V) {
      return { anyOf: [V, W] };
    }
  })(Nc)), Nc;
}
var fi = {}, di = {}, hi = {}, yp;
function zE() {
  if (yp) return hi;
  yp = 1, Object.defineProperty(hi, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return hi.default = e, hi;
}
var sr = {}, vp;
function fl() {
  if (vp) return sr;
  vp = 1, Object.defineProperty(sr, "__esModule", { value: !0 }), sr.callRef = sr.getValidate = void 0;
  const e = ds(), t = Lt(), a = Ne(), n = kt(), l = hs(), r = Le(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(c) {
      const { gen: s, schema: d, it: f } = c, { baseId: m, schemaEnv: y, validateName: v, opts: h, self: g } = f, { root: p } = y;
      if ((d === "#" || d === "#/") && m === p.baseId)
        return b();
      const E = l.resolveRef.call(g, p, m, d);
      if (E === void 0)
        throw new e.default(f.opts.uriResolver, m, d);
      if (E instanceof l.SchemaEnv)
        return $(E);
      return _(E);
      function b() {
        if (y === p)
          return o(c, v, y, y.$async);
        const w = s.scopeValue("root", { ref: p });
        return o(c, (0, a._)`${w}.validate`, p, p.$async);
      }
      function $(w) {
        const T = u(c, w);
        o(c, T, w, w.$async);
      }
      function _(w) {
        const T = s.scopeValue("schema", h.code.source === !0 ? { ref: w, code: (0, a.stringify)(w) } : { ref: w }), P = s.name("valid"), G = c.subschema({
          schema: w,
          dataTypes: [],
          schemaPath: a.nil,
          topSchemaRef: T,
          errSchemaPath: d
        }, P);
        c.mergeEvaluated(G), c.ok(P);
      }
    }
  };
  function u(c, s) {
    const { gen: d } = c;
    return s.validate ? d.scopeValue("validate", { ref: s.validate }) : (0, a._)`${d.scopeValue("wrapper", { ref: s })}.validate`;
  }
  sr.getValidate = u;
  function o(c, s, d, f) {
    const { gen: m, it: y } = c, { allErrors: v, schemaEnv: h, opts: g } = y, p = g.passContext ? n.default.this : a.nil;
    f ? E() : b();
    function E() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const w = m.let("valid");
      m.try(() => {
        m.code((0, a._)`await ${(0, t.callValidateCode)(c, s, p)}`), _(s), v || m.assign(w, !0);
      }, (T) => {
        m.if((0, a._)`!(${T} instanceof ${y.ValidationError})`, () => m.throw(T)), $(T), v || m.assign(w, !1);
      }), c.ok(w);
    }
    function b() {
      c.result((0, t.callValidateCode)(c, s, p), () => _(s), () => $(s));
    }
    function $(w) {
      const T = (0, a._)`${w}.errors`;
      m.assign(n.default.vErrors, (0, a._)`${n.default.vErrors} === null ? ${T} : ${n.default.vErrors}.concat(${T})`), m.assign(n.default.errors, (0, a._)`${n.default.vErrors}.length`);
    }
    function _(w) {
      var T;
      if (!y.opts.unevaluated)
        return;
      const P = (T = d?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (y.props !== !0)
        if (P && !P.dynamicProps)
          P.props !== void 0 && (y.props = r.mergeEvaluated.props(m, P.props, y.props));
        else {
          const G = m.var("props", (0, a._)`${w}.evaluated.props`);
          y.props = r.mergeEvaluated.props(m, G, y.props, a.Name);
        }
      if (y.items !== !0)
        if (P && !P.dynamicItems)
          P.items !== void 0 && (y.items = r.mergeEvaluated.items(m, P.items, y.items));
        else {
          const G = m.var("items", (0, a._)`${w}.evaluated.items`);
          y.items = r.mergeEvaluated.items(m, G, y.items, a.Name);
        }
    }
  }
  return sr.callRef = o, sr.default = i, sr;
}
var _p;
function KE() {
  if (_p) return di;
  _p = 1, Object.defineProperty(di, "__esModule", { value: !0 });
  const e = zE(), t = fl(), a = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return di.default = a, di;
}
var pi = {}, mi = {}, Ep;
function XE() {
  if (Ep) return mi;
  Ep = 1, Object.defineProperty(mi, "__esModule", { value: !0 });
  const e = Ne(), t = e.operators, a = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: r, schemaCode: i }) => (0, e.str)`must be ${a[r].okStr} ${i}`,
    params: ({ keyword: r, schemaCode: i }) => (0, e._)`{comparison: ${a[r].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(a),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(r) {
      const { keyword: i, data: u, schemaCode: o } = r;
      r.fail$data((0, e._)`${u} ${a[i].fail} ${o} || isNaN(${u})`);
    }
  };
  return mi.default = l, mi;
}
var gi = {}, wp;
function WE() {
  if (wp) return gi;
  wp = 1, Object.defineProperty(gi, "__esModule", { value: !0 });
  const e = Ne(), a = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: l, data: r, schemaCode: i, it: u } = n, o = u.opts.multipleOfPrecision, c = l.let("res"), s = o ? (0, e._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${o}` : (0, e._)`${c} !== parseInt(${c})`;
      n.fail$data((0, e._)`(${i} === 0 || (${c} = ${r}/${i}, ${s}))`);
    }
  };
  return gi.default = a, gi;
}
var yi = {}, vi = {}, $p;
function YE() {
  if ($p) return vi;
  $p = 1, Object.defineProperty(vi, "__esModule", { value: !0 });
  function e(t) {
    const a = t.length;
    let n = 0, l = 0, r;
    for (; l < a; )
      n++, r = t.charCodeAt(l++), r >= 55296 && r <= 56319 && l < a && (r = t.charCodeAt(l), (r & 64512) === 56320 && l++);
    return n;
  }
  return vi.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', vi;
}
var Sp;
function JE() {
  if (Sp) return yi;
  Sp = 1, Object.defineProperty(yi, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), a = YE(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: i }) {
        const u = r === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${u} than ${i} characters`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: i, data: u, schemaCode: o, it: c } = r, s = i === "maxLength" ? e.operators.GT : e.operators.LT, d = c.opts.unicode === !1 ? (0, e._)`${u}.length` : (0, e._)`${(0, t.useFunc)(r.gen, a.default)}(${u})`;
      r.fail$data((0, e._)`${d} ${s} ${o}`);
    }
  };
  return yi.default = l, yi;
}
var _i = {}, bp;
function QE() {
  if (bp) return _i;
  bp = 1, Object.defineProperty(_i, "__esModule", { value: !0 });
  const e = Lt(), t = Ne(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: r, $data: i, schema: u, schemaCode: o, it: c } = l, s = c.opts.unicodeRegExp ? "u" : "", d = i ? (0, t._)`(new RegExp(${o}, ${s}))` : (0, e.usePattern)(l, u);
      l.fail$data((0, t._)`!${d}.test(${r})`);
    }
  };
  return _i.default = n, _i;
}
var Ei = {}, Rp;
function ZE() {
  if (Rp) return Ei;
  Rp = 1, Object.defineProperty(Ei, "__esModule", { value: !0 });
  const e = Ne(), a = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: l }) {
        const r = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${r} than ${l} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: l, data: r, schemaCode: i } = n, u = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${r}).length ${u} ${i}`);
    }
  };
  return Ei.default = a, Ei;
}
var wi = {}, Tp;
function ew() {
  if (Tp) return wi;
  Tp = 1, Object.defineProperty(wi, "__esModule", { value: !0 });
  const e = Lt(), t = Ne(), a = Le(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: r } }) => (0, t.str)`must have required property '${r}'`,
      params: ({ params: { missingProperty: r } }) => (0, t._)`{missingProperty: ${r}}`
    },
    code(r) {
      const { gen: i, schema: u, schemaCode: o, data: c, $data: s, it: d } = r, { opts: f } = d;
      if (!s && u.length === 0)
        return;
      const m = u.length >= f.loopRequired;
      if (d.allErrors ? y() : v(), f.strictRequired) {
        const p = r.parentSchema.properties, { definedProperties: E } = r.it;
        for (const b of u)
          if (p?.[b] === void 0 && !E.has(b)) {
            const $ = d.schemaEnv.baseId + d.errSchemaPath, _ = `required property "${b}" is not defined at "${$}" (strictRequired)`;
            (0, a.checkStrictMode)(d, _, d.opts.strictRequired);
          }
      }
      function y() {
        if (m || s)
          r.block$data(t.nil, h);
        else
          for (const p of u)
            (0, e.checkReportMissingProp)(r, p);
      }
      function v() {
        const p = i.let("missing");
        if (m || s) {
          const E = i.let("valid", !0);
          r.block$data(E, () => g(p, E)), r.ok(E);
        } else
          i.if((0, e.checkMissingProp)(r, u, p)), (0, e.reportMissingProp)(r, p), i.else();
      }
      function h() {
        i.forOf("prop", o, (p) => {
          r.setParams({ missingProperty: p }), i.if((0, e.noPropertyInData)(i, c, p, f.ownProperties), () => r.error());
        });
      }
      function g(p, E) {
        r.setParams({ missingProperty: p }), i.forOf(p, o, () => {
          i.assign(E, (0, e.propertyInData)(i, c, p, f.ownProperties)), i.if((0, t.not)(E), () => {
            r.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return wi.default = l, wi;
}
var $i = {}, Pp;
function tw() {
  if (Pp) return $i;
  Pp = 1, Object.defineProperty($i, "__esModule", { value: !0 });
  const e = Ne(), a = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: l }) {
        const r = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${r} than ${l} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: l, data: r, schemaCode: i } = n, u = l === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${r}.length ${u} ${i}`);
    }
  };
  return $i.default = a, $i;
}
var Si = {}, bi = {}, Np;
function dl() {
  if (Np) return bi;
  Np = 1, Object.defineProperty(bi, "__esModule", { value: !0 });
  const e = us();
  return e.code = 'require("ajv/dist/runtime/equal").default', bi.default = e, bi;
}
var Ip;
function rw() {
  if (Ip) return Si;
  Ip = 1, Object.defineProperty(Si, "__esModule", { value: !0 });
  const e = Xa(), t = Ne(), a = Le(), n = dl(), r = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: u } }) => (0, t.str)`must NOT have duplicate items (items ## ${u} and ${i} are identical)`,
      params: ({ params: { i, j: u } }) => (0, t._)`{i: ${i}, j: ${u}}`
    },
    code(i) {
      const { gen: u, data: o, $data: c, schema: s, parentSchema: d, schemaCode: f, it: m } = i;
      if (!c && !s)
        return;
      const y = u.let("valid"), v = d.items ? (0, e.getSchemaTypes)(d.items) : [];
      i.block$data(y, h, (0, t._)`${f} === false`), i.ok(y);
      function h() {
        const b = u.let("i", (0, t._)`${o}.length`), $ = u.let("j");
        i.setParams({ i: b, j: $ }), u.assign(y, !0), u.if((0, t._)`${b} > 1`, () => (g() ? p : E)(b, $));
      }
      function g() {
        return v.length > 0 && !v.some((b) => b === "object" || b === "array");
      }
      function p(b, $) {
        const _ = u.name("item"), w = (0, e.checkDataTypes)(v, _, m.opts.strictNumbers, e.DataType.Wrong), T = u.const("indices", (0, t._)`{}`);
        u.for((0, t._)`;${b}--;`, () => {
          u.let(_, (0, t._)`${o}[${b}]`), u.if(w, (0, t._)`continue`), v.length > 1 && u.if((0, t._)`typeof ${_} == "string"`, (0, t._)`${_} += "_"`), u.if((0, t._)`typeof ${T}[${_}] == "number"`, () => {
            u.assign($, (0, t._)`${T}[${_}]`), i.error(), u.assign(y, !1).break();
          }).code((0, t._)`${T}[${_}] = ${b}`);
        });
      }
      function E(b, $) {
        const _ = (0, a.useFunc)(u, n.default), w = u.name("outer");
        u.label(w).for((0, t._)`;${b}--;`, () => u.for((0, t._)`${$} = ${b}; ${$}--;`, () => u.if((0, t._)`${_}(${o}[${b}], ${o}[${$}])`, () => {
          i.error(), u.assign(y, !1).break(w);
        })));
      }
    }
  };
  return Si.default = r, Si;
}
var Ri = {}, Op;
function nw() {
  if (Op) return Ri;
  Op = 1, Object.defineProperty(Ri, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), a = dl(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: r }) => (0, e._)`{allowedValue: ${r}}`
    },
    code(r) {
      const { gen: i, data: u, $data: o, schemaCode: c, schema: s } = r;
      o || s && typeof s == "object" ? r.fail$data((0, e._)`!${(0, t.useFunc)(i, a.default)}(${u}, ${c})`) : r.fail((0, e._)`${s} !== ${u}`);
    }
  };
  return Ri.default = l, Ri;
}
var Ti = {}, Ap;
function iw() {
  if (Ap) return Ti;
  Ap = 1, Object.defineProperty(Ti, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), a = dl(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: r }) => (0, e._)`{allowedValues: ${r}}`
    },
    code(r) {
      const { gen: i, data: u, $data: o, schema: c, schemaCode: s, it: d } = r;
      if (!o && c.length === 0)
        throw new Error("enum must have non-empty array");
      const f = c.length >= d.opts.loopEnum;
      let m;
      const y = () => m ?? (m = (0, t.useFunc)(i, a.default));
      let v;
      if (f || o)
        v = i.let("valid"), r.block$data(v, h);
      else {
        if (!Array.isArray(c))
          throw new Error("ajv implementation error");
        const p = i.const("vSchema", s);
        v = (0, e.or)(...c.map((E, b) => g(p, b)));
      }
      r.pass(v);
      function h() {
        i.assign(v, !1), i.forOf("v", s, (p) => i.if((0, e._)`${y()}(${u}, ${p})`, () => i.assign(v, !0).break()));
      }
      function g(p, E) {
        const b = c[E];
        return typeof b == "object" && b !== null ? (0, e._)`${y()}(${u}, ${p}[${E}])` : (0, e._)`${u} === ${b}`;
      }
    }
  };
  return Ti.default = l, Ti;
}
var Cp;
function aw() {
  if (Cp) return pi;
  Cp = 1, Object.defineProperty(pi, "__esModule", { value: !0 });
  const e = XE(), t = WE(), a = JE(), n = QE(), l = ZE(), r = ew(), i = tw(), u = rw(), o = nw(), c = iw(), s = [
    // number
    e.default,
    t.default,
    // string
    a.default,
    n.default,
    // object
    l.default,
    r.default,
    // array
    i.default,
    u.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    o.default,
    c.default
  ];
  return pi.default = s, pi;
}
var Pi = {}, xr = {}, Dp;
function v0() {
  if (Dp) return xr;
  Dp = 1, Object.defineProperty(xr, "__esModule", { value: !0 }), xr.validateAdditionalItems = void 0;
  const e = Ne(), t = Le(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: r } }) => (0, e.str)`must NOT have more than ${r} items`,
      params: ({ params: { len: r } }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { parentSchema: i, it: u } = r, { items: o } = i;
      if (!Array.isArray(o)) {
        (0, t.checkStrictMode)(u, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(r, o);
    }
  };
  function l(r, i) {
    const { gen: u, schema: o, data: c, keyword: s, it: d } = r;
    d.items = !0;
    const f = u.const("len", (0, e._)`${c}.length`);
    if (o === !1)
      r.setParams({ len: i.length }), r.pass((0, e._)`${f} <= ${i.length}`);
    else if (typeof o == "object" && !(0, t.alwaysValidSchema)(d, o)) {
      const y = u.var("valid", (0, e._)`${f} <= ${i.length}`);
      u.if((0, e.not)(y), () => m(y)), r.ok(y);
    }
    function m(y) {
      u.forRange("i", i.length, f, (v) => {
        r.subschema({ keyword: s, dataProp: v, dataPropType: t.Type.Num }, y), d.allErrors || u.if((0, e.not)(y), () => u.break());
      });
    }
  }
  return xr.validateAdditionalItems = l, xr.default = n, xr;
}
var Ni = {}, Vr = {}, kp;
function _0() {
  if (kp) return Vr;
  kp = 1, Object.defineProperty(Vr, "__esModule", { value: !0 }), Vr.validateTuple = void 0;
  const e = Ne(), t = Le(), a = Lt(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(r) {
      const { schema: i, it: u } = r;
      if (Array.isArray(i))
        return l(r, "additionalItems", i);
      u.items = !0, !(0, t.alwaysValidSchema)(u, i) && r.ok((0, a.validateArray)(r));
    }
  };
  function l(r, i, u = r.schema) {
    const { gen: o, parentSchema: c, data: s, keyword: d, it: f } = r;
    v(c), f.opts.unevaluated && u.length && f.items !== !0 && (f.items = t.mergeEvaluated.items(o, u.length, f.items));
    const m = o.name("valid"), y = o.const("len", (0, e._)`${s}.length`);
    u.forEach((h, g) => {
      (0, t.alwaysValidSchema)(f, h) || (o.if((0, e._)`${y} > ${g}`, () => r.subschema({
        keyword: d,
        schemaProp: g,
        dataProp: g
      }, m)), r.ok(m));
    });
    function v(h) {
      const { opts: g, errSchemaPath: p } = f, E = u.length, b = E === h.minItems && (E === h.maxItems || h[i] === !1);
      if (g.strictTuples && !b) {
        const $ = `"${d}" is ${E}-tuple, but minItems or maxItems/${i} are not specified or different at path "${p}"`;
        (0, t.checkStrictMode)(f, $, g.strictTuples);
      }
    }
  }
  return Vr.validateTuple = l, Vr.default = n, Vr;
}
var Lp;
function sw() {
  if (Lp) return Ni;
  Lp = 1, Object.defineProperty(Ni, "__esModule", { value: !0 });
  const e = _0(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (a) => (0, e.validateTuple)(a, "items")
  };
  return Ni.default = t, Ni;
}
var Ii = {}, qp;
function ow() {
  if (qp) return Ii;
  qp = 1, Object.defineProperty(Ii, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), a = Lt(), n = v0(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: u, parentSchema: o, it: c } = i, { prefixItems: s } = o;
      c.items = !0, !(0, t.alwaysValidSchema)(c, u) && (s ? (0, n.validateAdditionalItems)(i, s) : i.ok((0, a.validateArray)(i)));
    }
  };
  return Ii.default = r, Ii;
}
var Oi = {}, Fp;
function cw() {
  if (Fp) return Oi;
  Fp = 1, Object.defineProperty(Oi, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: r } }) => r === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${r} valid item(s)`,
      params: ({ params: { min: l, max: r } }) => r === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${r}}`
    },
    code(l) {
      const { gen: r, schema: i, parentSchema: u, data: o, it: c } = l;
      let s, d;
      const { minContains: f, maxContains: m } = u;
      c.opts.next ? (s = f === void 0 ? 1 : f, d = m) : s = 1;
      const y = r.const("len", (0, e._)`${o}.length`);
      if (l.setParams({ min: s, max: d }), d === void 0 && s === 0) {
        (0, t.checkStrictMode)(c, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (d !== void 0 && s > d) {
        (0, t.checkStrictMode)(c, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(c, i)) {
        let E = (0, e._)`${y} >= ${s}`;
        d !== void 0 && (E = (0, e._)`${E} && ${y} <= ${d}`), l.pass(E);
        return;
      }
      c.items = !0;
      const v = r.name("valid");
      d === void 0 && s === 1 ? g(v, () => r.if(v, () => r.break())) : s === 0 ? (r.let(v, !0), d !== void 0 && r.if((0, e._)`${o}.length > 0`, h)) : (r.let(v, !1), h()), l.result(v, () => l.reset());
      function h() {
        const E = r.name("_valid"), b = r.let("count", 0);
        g(E, () => r.if(E, () => p(b)));
      }
      function g(E, b) {
        r.forRange("i", 0, y, ($) => {
          l.subschema({
            keyword: "contains",
            dataProp: $,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, E), b();
        });
      }
      function p(E) {
        r.code((0, e._)`${E}++`), d === void 0 ? r.if((0, e._)`${E} >= ${s}`, () => r.assign(v, !0).break()) : (r.if((0, e._)`${E} > ${d}`, () => r.assign(v, !1).break()), s === 1 ? r.assign(v, !0) : r.if((0, e._)`${E} >= ${s}`, () => r.assign(v, !0)));
      }
    }
  };
  return Oi.default = n, Oi;
}
var Fc = {}, Up;
function hl() {
  return Up || (Up = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = Ne(), a = Le(), n = Lt();
    e.error = {
      message: ({ params: { property: o, depsCount: c, deps: s } }) => {
        const d = c === 1 ? "property" : "properties";
        return (0, t.str)`must have ${d} ${s} when property ${o} is present`;
      },
      params: ({ params: { property: o, depsCount: c, deps: s, missingProperty: d } }) => (0, t._)`{property: ${o},
    missingProperty: ${d},
    depsCount: ${c},
    deps: ${s}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(o) {
        const [c, s] = r(o);
        i(o, c), u(o, s);
      }
    };
    function r({ schema: o }) {
      const c = {}, s = {};
      for (const d in o) {
        if (d === "__proto__")
          continue;
        const f = Array.isArray(o[d]) ? c : s;
        f[d] = o[d];
      }
      return [c, s];
    }
    function i(o, c = o.schema) {
      const { gen: s, data: d, it: f } = o;
      if (Object.keys(c).length === 0)
        return;
      const m = s.let("missing");
      for (const y in c) {
        const v = c[y];
        if (v.length === 0)
          continue;
        const h = (0, n.propertyInData)(s, d, y, f.opts.ownProperties);
        o.setParams({
          property: y,
          depsCount: v.length,
          deps: v.join(", ")
        }), f.allErrors ? s.if(h, () => {
          for (const g of v)
            (0, n.checkReportMissingProp)(o, g);
        }) : (s.if((0, t._)`${h} && (${(0, n.checkMissingProp)(o, v, m)})`), (0, n.reportMissingProp)(o, m), s.else());
      }
    }
    e.validatePropertyDeps = i;
    function u(o, c = o.schema) {
      const { gen: s, data: d, keyword: f, it: m } = o, y = s.name("valid");
      for (const v in c)
        (0, a.alwaysValidSchema)(m, c[v]) || (s.if(
          (0, n.propertyInData)(s, d, v, m.opts.ownProperties),
          () => {
            const h = o.subschema({ keyword: f, schemaProp: v }, y);
            o.mergeValidEvaluated(h, y);
          },
          () => s.var(y, !0)
          // TODO var
        ), o.ok(y));
    }
    e.validateSchemaDeps = u, e.default = l;
  })(Fc)), Fc;
}
var Ai = {}, jp;
function uw() {
  if (jp) return Ai;
  jp = 1, Object.defineProperty(Ai, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: r, schema: i, data: u, it: o } = l;
      if ((0, t.alwaysValidSchema)(o, i))
        return;
      const c = r.name("valid");
      r.forIn("key", u, (s) => {
        l.setParams({ propertyName: s }), l.subschema({
          keyword: "propertyNames",
          data: s,
          dataTypes: ["string"],
          propertyName: s,
          compositeRule: !0
        }, c), r.if((0, e.not)(c), () => {
          l.error(!0), o.allErrors || r.break();
        });
      }), l.ok(c);
    }
  };
  return Ai.default = n, Ai;
}
var Ci = {}, Mp;
function E0() {
  if (Mp) return Ci;
  Mp = 1, Object.defineProperty(Ci, "__esModule", { value: !0 });
  const e = Lt(), t = Ne(), a = kt(), n = Le(), r = {
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
      const { gen: u, schema: o, parentSchema: c, data: s, errsCount: d, it: f } = i;
      if (!d)
        throw new Error("ajv implementation error");
      const { allErrors: m, opts: y } = f;
      if (f.props = !0, y.removeAdditional !== "all" && (0, n.alwaysValidSchema)(f, o))
        return;
      const v = (0, e.allSchemaProperties)(c.properties), h = (0, e.allSchemaProperties)(c.patternProperties);
      g(), i.ok((0, t._)`${d} === ${a.default.errors}`);
      function g() {
        u.forIn("key", s, (_) => {
          !v.length && !h.length ? b(_) : u.if(p(_), () => b(_));
        });
      }
      function p(_) {
        let w;
        if (v.length > 8) {
          const T = (0, n.schemaRefOrVal)(f, c.properties, "properties");
          w = (0, e.isOwnProperty)(u, T, _);
        } else v.length ? w = (0, t.or)(...v.map((T) => (0, t._)`${_} === ${T}`)) : w = t.nil;
        return h.length && (w = (0, t.or)(w, ...h.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${_})`))), (0, t.not)(w);
      }
      function E(_) {
        u.code((0, t._)`delete ${s}[${_}]`);
      }
      function b(_) {
        if (y.removeAdditional === "all" || y.removeAdditional && o === !1) {
          E(_);
          return;
        }
        if (o === !1) {
          i.setParams({ additionalProperty: _ }), i.error(), m || u.break();
          return;
        }
        if (typeof o == "object" && !(0, n.alwaysValidSchema)(f, o)) {
          const w = u.name("valid");
          y.removeAdditional === "failing" ? ($(_, w, !1), u.if((0, t.not)(w), () => {
            i.reset(), E(_);
          })) : ($(_, w), m || u.if((0, t.not)(w), () => u.break()));
        }
      }
      function $(_, w, T) {
        const P = {
          keyword: "additionalProperties",
          dataProp: _,
          dataPropType: n.Type.Str
        };
        T === !1 && Object.assign(P, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(P, w);
      }
    }
  };
  return Ci.default = r, Ci;
}
var Di = {}, xp;
function lw() {
  if (xp) return Di;
  xp = 1, Object.defineProperty(Di, "__esModule", { value: !0 });
  const e = fs(), t = Lt(), a = Le(), n = E0(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(r) {
      const { gen: i, schema: u, parentSchema: o, data: c, it: s } = r;
      s.opts.removeAdditional === "all" && o.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(s, n.default, "additionalProperties"));
      const d = (0, t.allSchemaProperties)(u);
      for (const h of d)
        s.definedProperties.add(h);
      s.opts.unevaluated && d.length && s.props !== !0 && (s.props = a.mergeEvaluated.props(i, (0, a.toHash)(d), s.props));
      const f = d.filter((h) => !(0, a.alwaysValidSchema)(s, u[h]));
      if (f.length === 0)
        return;
      const m = i.name("valid");
      for (const h of f)
        y(h) ? v(h) : (i.if((0, t.propertyInData)(i, c, h, s.opts.ownProperties)), v(h), s.allErrors || i.else().var(m, !0), i.endIf()), r.it.definedProperties.add(h), r.ok(m);
      function y(h) {
        return s.opts.useDefaults && !s.compositeRule && u[h].default !== void 0;
      }
      function v(h) {
        r.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, m);
      }
    }
  };
  return Di.default = l, Di;
}
var ki = {}, Vp;
function fw() {
  if (Vp) return ki;
  Vp = 1, Object.defineProperty(ki, "__esModule", { value: !0 });
  const e = Lt(), t = Ne(), a = Le(), n = Le(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(r) {
      const { gen: i, schema: u, data: o, parentSchema: c, it: s } = r, { opts: d } = s, f = (0, e.allSchemaProperties)(u), m = f.filter((b) => (0, a.alwaysValidSchema)(s, u[b]));
      if (f.length === 0 || m.length === f.length && (!s.opts.unevaluated || s.props === !0))
        return;
      const y = d.strictSchema && !d.allowMatchingProperties && c.properties, v = i.name("valid");
      s.props !== !0 && !(s.props instanceof t.Name) && (s.props = (0, n.evaluatedPropsToName)(i, s.props));
      const { props: h } = s;
      g();
      function g() {
        for (const b of f)
          y && p(b), s.allErrors ? E(b) : (i.var(v, !0), E(b), i.if(v));
      }
      function p(b) {
        for (const $ in y)
          new RegExp(b).test($) && (0, a.checkStrictMode)(s, `property ${$} matches pattern ${b} (use allowMatchingProperties)`);
      }
      function E(b) {
        i.forIn("key", o, ($) => {
          i.if((0, t._)`${(0, e.usePattern)(r, b)}.test(${$})`, () => {
            const _ = m.includes(b);
            _ || r.subschema({
              keyword: "patternProperties",
              schemaProp: b,
              dataProp: $,
              dataPropType: n.Type.Str
            }, v), s.opts.unevaluated && h !== !0 ? i.assign((0, t._)`${h}[${$}]`, !0) : !_ && !s.allErrors && i.if((0, t.not)(v), () => i.break());
          });
        });
      }
    }
  };
  return ki.default = l, ki;
}
var Li = {}, Gp;
function dw() {
  if (Gp) return Li;
  Gp = 1, Object.defineProperty(Li, "__esModule", { value: !0 });
  const e = Le(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(a) {
      const { gen: n, schema: l, it: r } = a;
      if ((0, e.alwaysValidSchema)(r, l)) {
        a.fail();
        return;
      }
      const i = n.name("valid");
      a.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), a.failResult(i, () => a.reset(), () => a.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Li.default = t, Li;
}
var qi = {}, Bp;
function hw() {
  if (Bp) return qi;
  Bp = 1, Object.defineProperty(qi, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Lt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return qi.default = t, qi;
}
var Fi = {}, Hp;
function pw() {
  if (Hp) return Fi;
  Hp = 1, Object.defineProperty(Fi, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: r, schema: i, parentSchema: u, it: o } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (o.opts.discriminator && u.discriminator)
        return;
      const c = i, s = r.let("valid", !1), d = r.let("passing", null), f = r.name("_valid");
      l.setParams({ passing: d }), r.block(m), l.result(s, () => l.reset(), () => l.error(!0));
      function m() {
        c.forEach((y, v) => {
          let h;
          (0, t.alwaysValidSchema)(o, y) ? r.var(f, !0) : h = l.subschema({
            keyword: "oneOf",
            schemaProp: v,
            compositeRule: !0
          }, f), v > 0 && r.if((0, e._)`${f} && ${s}`).assign(s, !1).assign(d, (0, e._)`[${d}, ${v}]`).else(), r.if(f, () => {
            r.assign(s, !0), r.assign(d, v), h && l.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return Fi.default = n, Fi;
}
var Ui = {}, zp;
function mw() {
  if (zp) return Ui;
  zp = 1, Object.defineProperty(Ui, "__esModule", { value: !0 });
  const e = Le(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(a) {
      const { gen: n, schema: l, it: r } = a;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = n.name("valid");
      l.forEach((u, o) => {
        if ((0, e.alwaysValidSchema)(r, u))
          return;
        const c = a.subschema({ keyword: "allOf", schemaProp: o }, i);
        a.ok(i), a.mergeEvaluated(c);
      });
    }
  };
  return Ui.default = t, Ui;
}
var ji = {}, Kp;
function gw() {
  if (Kp) return ji;
  Kp = 1, Object.defineProperty(ji, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: r }) => (0, e.str)`must match "${r.ifClause}" schema`,
      params: ({ params: r }) => (0, e._)`{failingKeyword: ${r.ifClause}}`
    },
    code(r) {
      const { gen: i, parentSchema: u, it: o } = r;
      u.then === void 0 && u.else === void 0 && (0, t.checkStrictMode)(o, '"if" without "then" and "else" is ignored');
      const c = l(o, "then"), s = l(o, "else");
      if (!c && !s)
        return;
      const d = i.let("valid", !0), f = i.name("_valid");
      if (m(), r.reset(), c && s) {
        const v = i.let("ifClause");
        r.setParams({ ifClause: v }), i.if(f, y("then", v), y("else", v));
      } else c ? i.if(f, y("then")) : i.if((0, e.not)(f), y("else"));
      r.pass(d, () => r.error(!0));
      function m() {
        const v = r.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, f);
        r.mergeEvaluated(v);
      }
      function y(v, h) {
        return () => {
          const g = r.subschema({ keyword: v }, f);
          i.assign(d, f), r.mergeValidEvaluated(g, d), h ? i.assign(h, (0, e._)`${v}`) : r.setParams({ ifClause: v });
        };
      }
    }
  };
  function l(r, i) {
    const u = r.schema[i];
    return u !== void 0 && !(0, t.alwaysValidSchema)(r, u);
  }
  return ji.default = n, ji;
}
var Mi = {}, Xp;
function yw() {
  if (Xp) return Mi;
  Xp = 1, Object.defineProperty(Mi, "__esModule", { value: !0 });
  const e = Le(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: a, parentSchema: n, it: l }) {
      n.if === void 0 && (0, e.checkStrictMode)(l, `"${a}" without "if" is ignored`);
    }
  };
  return Mi.default = t, Mi;
}
var Wp;
function vw() {
  if (Wp) return Pi;
  Wp = 1, Object.defineProperty(Pi, "__esModule", { value: !0 });
  const e = v0(), t = sw(), a = _0(), n = ow(), l = cw(), r = hl(), i = uw(), u = E0(), o = lw(), c = fw(), s = dw(), d = hw(), f = pw(), m = mw(), y = gw(), v = yw();
  function h(g = !1) {
    const p = [
      // any
      s.default,
      d.default,
      f.default,
      m.default,
      y.default,
      v.default,
      // object
      i.default,
      u.default,
      r.default,
      o.default,
      c.default
    ];
    return g ? p.push(t.default, n.default) : p.push(e.default, a.default), p.push(l.default), p;
  }
  return Pi.default = h, Pi;
}
var xi = {}, Gr = {}, Yp;
function w0() {
  if (Yp) return Gr;
  Yp = 1, Object.defineProperty(Gr, "__esModule", { value: !0 }), Gr.dynamicAnchor = void 0;
  const e = Ne(), t = kt(), a = hs(), n = fl(), l = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (u) => r(u, u.schema)
  };
  function r(u, o) {
    const { gen: c, it: s } = u;
    s.schemaEnv.root.dynamicAnchors[o] = !0;
    const d = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(o)}`, f = s.errSchemaPath === "#" ? s.validateName : i(u);
    c.if((0, e._)`!${d}`, () => c.assign(d, f));
  }
  Gr.dynamicAnchor = r;
  function i(u) {
    const { schemaEnv: o, schema: c, self: s } = u.it, { root: d, baseId: f, localRefs: m, meta: y } = o.root, { schemaId: v } = s.opts, h = new a.SchemaEnv({ schema: c, schemaId: v, root: d, baseId: f, localRefs: m, meta: y });
    return a.compileSchema.call(s, h), (0, n.getValidate)(u, h);
  }
  return Gr.default = l, Gr;
}
var Br = {}, Jp;
function $0() {
  if (Jp) return Br;
  Jp = 1, Object.defineProperty(Br, "__esModule", { value: !0 }), Br.dynamicRef = void 0;
  const e = Ne(), t = kt(), a = fl(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (r) => l(r, r.schema)
  };
  function l(r, i) {
    const { gen: u, keyword: o, it: c } = r;
    if (i[0] !== "#")
      throw new Error(`"${o}" only supports hash fragment reference`);
    const s = i.slice(1);
    if (c.allErrors)
      d();
    else {
      const m = u.let("valid", !1);
      d(m), r.ok(m);
    }
    function d(m) {
      if (c.schemaEnv.root.dynamicAnchors[s]) {
        const y = u.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(s)}`);
        u.if(y, f(y, m), f(c.validateName, m));
      } else
        f(c.validateName, m)();
    }
    function f(m, y) {
      return y ? () => u.block(() => {
        (0, a.callRef)(r, m), u.let(y, !0);
      }) : () => (0, a.callRef)(r, m);
    }
  }
  return Br.dynamicRef = l, Br.default = n, Br;
}
var Vi = {}, Qp;
function _w() {
  if (Qp) return Vi;
  Qp = 1, Object.defineProperty(Vi, "__esModule", { value: !0 });
  const e = w0(), t = Le(), a = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Vi.default = a, Vi;
}
var Gi = {}, Zp;
function Ew() {
  if (Zp) return Gi;
  Zp = 1, Object.defineProperty(Gi, "__esModule", { value: !0 });
  const e = $0(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (a) => (0, e.dynamicRef)(a, a.schema)
  };
  return Gi.default = t, Gi;
}
var em;
function ww() {
  if (em) return xi;
  em = 1, Object.defineProperty(xi, "__esModule", { value: !0 });
  const e = w0(), t = $0(), a = _w(), n = Ew(), l = [e.default, t.default, a.default, n.default];
  return xi.default = l, xi;
}
var Bi = {}, Hi = {}, tm;
function $w() {
  if (tm) return Hi;
  tm = 1, Object.defineProperty(Hi, "__esModule", { value: !0 });
  const e = hl(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (a) => (0, e.validatePropertyDeps)(a)
  };
  return Hi.default = t, Hi;
}
var zi = {}, rm;
function Sw() {
  if (rm) return zi;
  rm = 1, Object.defineProperty(zi, "__esModule", { value: !0 });
  const e = hl(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (a) => (0, e.validateSchemaDeps)(a)
  };
  return zi.default = t, zi;
}
var Ki = {}, nm;
function bw() {
  if (nm) return Ki;
  nm = 1, Object.defineProperty(Ki, "__esModule", { value: !0 });
  const e = Le(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: a, parentSchema: n, it: l }) {
      n.contains === void 0 && (0, e.checkStrictMode)(l, `"${a}" without "contains" is ignored`);
    }
  };
  return Ki.default = t, Ki;
}
var im;
function Rw() {
  if (im) return Bi;
  im = 1, Object.defineProperty(Bi, "__esModule", { value: !0 });
  const e = $w(), t = Sw(), a = bw(), n = [e.default, t.default, a.default];
  return Bi.default = n, Bi;
}
var Xi = {}, Wi = {}, am;
function Tw() {
  if (am) return Wi;
  am = 1, Object.defineProperty(Wi, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), a = kt(), l = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: r }) => (0, e._)`{unevaluatedProperty: ${r.unevaluatedProperty}}`
    },
    code(r) {
      const { gen: i, schema: u, data: o, errsCount: c, it: s } = r;
      if (!c)
        throw new Error("ajv implementation error");
      const { allErrors: d, props: f } = s;
      f instanceof e.Name ? i.if((0, e._)`${f} !== true`, () => i.forIn("key", o, (h) => i.if(y(f, h), () => m(h)))) : f !== !0 && i.forIn("key", o, (h) => f === void 0 ? m(h) : i.if(v(f, h), () => m(h))), s.props = !0, r.ok((0, e._)`${c} === ${a.default.errors}`);
      function m(h) {
        if (u === !1) {
          r.setParams({ unevaluatedProperty: h }), r.error(), d || i.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(s, u)) {
          const g = i.name("valid");
          r.subschema({
            keyword: "unevaluatedProperties",
            dataProp: h,
            dataPropType: t.Type.Str
          }, g), d || i.if((0, e.not)(g), () => i.break());
        }
      }
      function y(h, g) {
        return (0, e._)`!${h} || !${h}[${g}]`;
      }
      function v(h, g) {
        const p = [];
        for (const E in h)
          h[E] === !0 && p.push((0, e._)`${g} !== ${E}`);
        return (0, e.and)(...p);
      }
    }
  };
  return Wi.default = l, Wi;
}
var Yi = {}, sm;
function Pw() {
  if (sm) return Yi;
  sm = 1, Object.defineProperty(Yi, "__esModule", { value: !0 });
  const e = Ne(), t = Le(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: l } }) => (0, e.str)`must NOT have more than ${l} items`,
      params: ({ params: { len: l } }) => (0, e._)`{limit: ${l}}`
    },
    code(l) {
      const { gen: r, schema: i, data: u, it: o } = l, c = o.items || 0;
      if (c === !0)
        return;
      const s = r.const("len", (0, e._)`${u}.length`);
      if (i === !1)
        l.setParams({ len: c }), l.fail((0, e._)`${s} > ${c}`);
      else if (typeof i == "object" && !(0, t.alwaysValidSchema)(o, i)) {
        const f = r.var("valid", (0, e._)`${s} <= ${c}`);
        r.if((0, e.not)(f), () => d(f, c)), l.ok(f);
      }
      o.items = !0;
      function d(f, m) {
        r.forRange("i", m, s, (y) => {
          l.subschema({ keyword: "unevaluatedItems", dataProp: y, dataPropType: t.Type.Num }, f), o.allErrors || r.if((0, e.not)(f), () => r.break());
        });
      }
    }
  };
  return Yi.default = n, Yi;
}
var om;
function Nw() {
  if (om) return Xi;
  om = 1, Object.defineProperty(Xi, "__esModule", { value: !0 });
  const e = Tw(), t = Pw(), a = [e.default, t.default];
  return Xi.default = a, Xi;
}
var Ji = {}, Qi = {}, cm;
function Iw() {
  if (cm) return Qi;
  cm = 1, Object.defineProperty(Qi, "__esModule", { value: !0 });
  const e = Ne(), a = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, l) {
      const { gen: r, data: i, $data: u, schema: o, schemaCode: c, it: s } = n, { opts: d, errSchemaPath: f, schemaEnv: m, self: y } = s;
      if (!d.validateFormats)
        return;
      u ? v() : h();
      function v() {
        const g = r.scopeValue("formats", {
          ref: y.formats,
          code: d.code.formats
        }), p = r.const("fDef", (0, e._)`${g}[${c}]`), E = r.let("fType"), b = r.let("format");
        r.if((0, e._)`typeof ${p} == "object" && !(${p} instanceof RegExp)`, () => r.assign(E, (0, e._)`${p}.type || "string"`).assign(b, (0, e._)`${p}.validate`), () => r.assign(E, (0, e._)`"string"`).assign(b, p)), n.fail$data((0, e.or)($(), _()));
        function $() {
          return d.strictSchema === !1 ? e.nil : (0, e._)`${c} && !${b}`;
        }
        function _() {
          const w = m.$async ? (0, e._)`(${p}.async ? await ${b}(${i}) : ${b}(${i}))` : (0, e._)`${b}(${i})`, T = (0, e._)`(typeof ${b} == "function" ? ${w} : ${b}.test(${i}))`;
          return (0, e._)`${b} && ${b} !== true && ${E} === ${l} && !${T}`;
        }
      }
      function h() {
        const g = y.formats[o];
        if (!g) {
          $();
          return;
        }
        if (g === !0)
          return;
        const [p, E, b] = _(g);
        p === l && n.pass(w());
        function $() {
          if (d.strictSchema === !1) {
            y.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${o}" ignored in schema at path "${f}"`;
          }
        }
        function _(T) {
          const P = T instanceof RegExp ? (0, e.regexpCode)(T) : d.code.formats ? (0, e._)`${d.code.formats}${(0, e.getProperty)(o)}` : void 0, G = r.scopeValue("formats", { key: o, ref: T, code: P });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${G}.validate`] : ["string", T, G];
        }
        function w() {
          if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
            if (!m.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${b}(${i})`;
          }
          return typeof E == "function" ? (0, e._)`${b}(${i})` : (0, e._)`${b}.test(${i})`;
        }
      }
    }
  };
  return Qi.default = a, Qi;
}
var um;
function Ow() {
  if (um) return Ji;
  um = 1, Object.defineProperty(Ji, "__esModule", { value: !0 });
  const t = [Iw().default];
  return Ji.default = t, Ji;
}
var Tr = {}, lm;
function Aw() {
  return lm || (lm = 1, Object.defineProperty(Tr, "__esModule", { value: !0 }), Tr.contentVocabulary = Tr.metadataVocabulary = void 0, Tr.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Tr.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Tr;
}
var fm;
function Cw() {
  if (fm) return fi;
  fm = 1, Object.defineProperty(fi, "__esModule", { value: !0 });
  const e = KE(), t = aw(), a = vw(), n = ww(), l = Rw(), r = Nw(), i = Ow(), u = Aw(), o = [
    n.default,
    e.default,
    t.default,
    (0, a.default)(!0),
    i.default,
    u.metadataVocabulary,
    u.contentVocabulary,
    l.default,
    r.default
  ];
  return fi.default = o, fi;
}
var Zi = {}, In = {}, dm;
function Dw() {
  if (dm) return In;
  dm = 1, Object.defineProperty(In, "__esModule", { value: !0 }), In.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (In.DiscrError = e = {})), In;
}
var hm;
function kw() {
  if (hm) return Zi;
  hm = 1, Object.defineProperty(Zi, "__esModule", { value: !0 });
  const e = Ne(), t = Dw(), a = hs(), n = ds(), l = Le(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: u, tagName: o } }) => u === t.DiscrError.Tag ? `tag "${o}" must be string` : `value of tag "${o}" must be in oneOf`,
      params: ({ params: { discrError: u, tag: o, tagName: c } }) => (0, e._)`{error: ${u}, tag: ${c}, tagValue: ${o}}`
    },
    code(u) {
      const { gen: o, data: c, schema: s, parentSchema: d, it: f } = u, { oneOf: m } = d;
      if (!f.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const y = s.propertyName;
      if (typeof y != "string")
        throw new Error("discriminator: requires propertyName");
      if (s.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!m)
        throw new Error("discriminator: requires oneOf keyword");
      const v = o.let("valid", !1), h = o.const("tag", (0, e._)`${c}${(0, e.getProperty)(y)}`);
      o.if((0, e._)`typeof ${h} == "string"`, () => g(), () => u.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: y })), u.ok(v);
      function g() {
        const b = E();
        o.if(!1);
        for (const $ in b)
          o.elseIf((0, e._)`${h} === ${$}`), o.assign(v, p(b[$]));
        o.else(), u.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: y }), o.endIf();
      }
      function p(b) {
        const $ = o.name("valid"), _ = u.subschema({ keyword: "oneOf", schemaProp: b }, $);
        return u.mergeEvaluated(_, e.Name), $;
      }
      function E() {
        var b;
        const $ = {}, _ = T(d);
        let w = !0;
        for (let q = 0; q < m.length; q++) {
          let M = m[q];
          if (M?.$ref && !(0, l.schemaHasRulesButRef)(M, f.self.RULES)) {
            const k = M.$ref;
            if (M = a.resolveRef.call(f.self, f.schemaEnv.root, f.baseId, k), M instanceof a.SchemaEnv && (M = M.schema), M === void 0)
              throw new n.default(f.opts.uriResolver, f.baseId, k);
          }
          const K = (b = M?.properties) === null || b === void 0 ? void 0 : b[y];
          if (typeof K != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${y}"`);
          w = w && (_ || T(M)), P(K, q);
        }
        if (!w)
          throw new Error(`discriminator: "${y}" must be required`);
        return $;
        function T({ required: q }) {
          return Array.isArray(q) && q.includes(y);
        }
        function P(q, M) {
          if (q.const)
            G(q.const, M);
          else if (q.enum)
            for (const K of q.enum)
              G(K, M);
          else
            throw new Error(`discriminator: "properties/${y}" must have "const" or "enum"`);
        }
        function G(q, M) {
          if (typeof q != "string" || q in $)
            throw new Error(`discriminator: "${y}" values must be unique strings`);
          $[q] = M;
        }
      }
    }
  };
  return Zi.default = i, Zi;
}
var ea = {};
const Lw = "https://json-schema.org/draft/2020-12/schema", qw = "https://json-schema.org/draft/2020-12/schema", Fw = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, Uw = "meta", jw = "Core and Validation specifications meta-schema", Mw = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], xw = ["object", "boolean"], Vw = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Gw = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Bw = {
  $schema: Lw,
  $id: qw,
  $vocabulary: Fw,
  $dynamicAnchor: Uw,
  title: jw,
  allOf: Mw,
  type: xw,
  $comment: Vw,
  properties: Gw
}, Hw = "https://json-schema.org/draft/2020-12/schema", zw = "https://json-schema.org/draft/2020-12/meta/applicator", Kw = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Xw = "meta", Ww = "Applicator vocabulary meta-schema", Yw = ["object", "boolean"], Jw = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, Qw = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, Zw = {
  $schema: Hw,
  $id: zw,
  $vocabulary: Kw,
  $dynamicAnchor: Xw,
  title: Ww,
  type: Yw,
  properties: Jw,
  $defs: Qw
}, e$ = "https://json-schema.org/draft/2020-12/schema", t$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", r$ = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, n$ = "meta", i$ = "Unevaluated applicator vocabulary meta-schema", a$ = ["object", "boolean"], s$ = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, o$ = {
  $schema: e$,
  $id: t$,
  $vocabulary: r$,
  $dynamicAnchor: n$,
  title: i$,
  type: a$,
  properties: s$
}, c$ = "https://json-schema.org/draft/2020-12/schema", u$ = "https://json-schema.org/draft/2020-12/meta/content", l$ = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, f$ = "meta", d$ = "Content vocabulary meta-schema", h$ = ["object", "boolean"], p$ = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, m$ = {
  $schema: c$,
  $id: u$,
  $vocabulary: l$,
  $dynamicAnchor: f$,
  title: d$,
  type: h$,
  properties: p$
}, g$ = "https://json-schema.org/draft/2020-12/schema", y$ = "https://json-schema.org/draft/2020-12/meta/core", v$ = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, _$ = "meta", E$ = "Core vocabulary meta-schema", w$ = ["object", "boolean"], $$ = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, S$ = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, b$ = {
  $schema: g$,
  $id: y$,
  $vocabulary: v$,
  $dynamicAnchor: _$,
  title: E$,
  type: w$,
  properties: $$,
  $defs: S$
}, R$ = "https://json-schema.org/draft/2020-12/schema", T$ = "https://json-schema.org/draft/2020-12/meta/format-annotation", P$ = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, N$ = "meta", I$ = "Format vocabulary meta-schema for annotation results", O$ = ["object", "boolean"], A$ = { format: { type: "string" } }, C$ = {
  $schema: R$,
  $id: T$,
  $vocabulary: P$,
  $dynamicAnchor: N$,
  title: I$,
  type: O$,
  properties: A$
}, D$ = "https://json-schema.org/draft/2020-12/schema", k$ = "https://json-schema.org/draft/2020-12/meta/meta-data", L$ = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, q$ = "meta", F$ = "Meta-data vocabulary meta-schema", U$ = ["object", "boolean"], j$ = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, M$ = {
  $schema: D$,
  $id: k$,
  $vocabulary: L$,
  $dynamicAnchor: q$,
  title: F$,
  type: U$,
  properties: j$
}, x$ = "https://json-schema.org/draft/2020-12/schema", V$ = "https://json-schema.org/draft/2020-12/meta/validation", G$ = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, B$ = "meta", H$ = "Validation vocabulary meta-schema", z$ = ["object", "boolean"], K$ = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, X$ = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, W$ = {
  $schema: x$,
  $id: V$,
  $vocabulary: G$,
  $dynamicAnchor: B$,
  title: H$,
  type: z$,
  properties: K$,
  $defs: X$
};
var pm;
function Y$() {
  if (pm) return ea;
  pm = 1, Object.defineProperty(ea, "__esModule", { value: !0 });
  const e = Bw, t = Zw, a = o$, n = m$, l = b$, r = C$, i = M$, u = W$, o = ["/properties"];
  function c(s) {
    return [
      e,
      t,
      a,
      n,
      l,
      d(this, r),
      i,
      d(this, u)
    ].forEach((f) => this.addMetaSchema(f, void 0, !1)), this;
    function d(f, m) {
      return s ? f.$dataMetaSchema(m, o) : m;
    }
  }
  return ea.default = c, ea;
}
var mm;
function J$() {
  return mm || (mm = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const a = HE(), n = Cw(), l = kw(), r = Y$(), i = "https://json-schema.org/draft/2020-12/schema";
    class u extends a.default {
      constructor(m = {}) {
        super({
          ...m,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((m) => this.addVocabulary(m)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: m, meta: y } = this.opts;
        y && (r.default.call(this, m), this.refs["http://json-schema.org/schema"] = i);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
      }
    }
    t.Ajv2020 = u, e.exports = t = u, e.exports.Ajv2020 = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var o = fs();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return o.KeywordCxt;
    } });
    var c = Ne();
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
    var s = ll();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return s.default;
    } });
    var d = ds();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(si, si.exports)), si.exports;
}
var Q$ = J$(), ta = { exports: {} }, Uc = {}, gm;
function Z$() {
  return gm || (gm = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(q, M) {
      return { validate: q, compare: M };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(r, i),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(o(!0), c),
      "date-time": t(f(!0), m),
      "iso-time": t(o(), s),
      "iso-date-time": t(f(), y),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: g,
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
      regex: G,
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
      byte: E,
      // signed 32 bit integer
      int32: { type: "number", validate: _ },
      // signed 64 bit integer
      int64: { type: "number", validate: w },
      // C-type float
      float: { type: "number", validate: T },
      // C-type double
      double: { type: "number", validate: T },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, c),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, m),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, s),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, y),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function a(q) {
      return q % 4 === 0 && (q % 100 !== 0 || q % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, l = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function r(q) {
      const M = n.exec(q);
      if (!M)
        return !1;
      const K = +M[1], k = +M[2], F = +M[3];
      return k >= 1 && k <= 12 && F >= 1 && F <= (k === 2 && a(K) ? 29 : l[k]);
    }
    function i(q, M) {
      if (q && M)
        return q > M ? 1 : q < M ? -1 : 0;
    }
    const u = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function o(q) {
      return function(K) {
        const k = u.exec(K);
        if (!k)
          return !1;
        const F = +k[1], Y = +k[2], B = +k[3], W = k[4], Z = k[5] === "-" ? -1 : 1, V = +(k[6] || 0), C = +(k[7] || 0);
        if (V > 23 || C > 59 || q && !W)
          return !1;
        if (F <= 23 && Y <= 59 && B < 60)
          return !0;
        const j = Y - C * Z, D = F - V * Z - (j < 0 ? 1 : 0);
        return (D === 23 || D === -1) && (j === 59 || j === -1) && B < 61;
      };
    }
    function c(q, M) {
      if (!(q && M))
        return;
      const K = (/* @__PURE__ */ new Date("2020-01-01T" + q)).valueOf(), k = (/* @__PURE__ */ new Date("2020-01-01T" + M)).valueOf();
      if (K && k)
        return K - k;
    }
    function s(q, M) {
      if (!(q && M))
        return;
      const K = u.exec(q), k = u.exec(M);
      if (K && k)
        return q = K[1] + K[2] + K[3], M = k[1] + k[2] + k[3], q > M ? 1 : q < M ? -1 : 0;
    }
    const d = /t|\s/i;
    function f(q) {
      const M = o(q);
      return function(k) {
        const F = k.split(d);
        return F.length === 2 && r(F[0]) && M(F[1]);
      };
    }
    function m(q, M) {
      if (!(q && M))
        return;
      const K = new Date(q).valueOf(), k = new Date(M).valueOf();
      if (K && k)
        return K - k;
    }
    function y(q, M) {
      if (!(q && M))
        return;
      const [K, k] = q.split(d), [F, Y] = M.split(d), B = i(K, F);
      if (B !== void 0)
        return B || c(k, Y);
    }
    const v = /\/|:/, h = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function g(q) {
      return v.test(q) && h.test(q);
    }
    const p = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function E(q) {
      return p.lastIndex = 0, p.test(q);
    }
    const b = -2147483648, $ = 2 ** 31 - 1;
    function _(q) {
      return Number.isInteger(q) && q <= $ && q >= b;
    }
    function w(q) {
      return Number.isInteger(q);
    }
    function T() {
      return !0;
    }
    const P = /[^\\]\\Z/;
    function G(q) {
      if (P.test(q))
        return !1;
      try {
        return new RegExp(q), !0;
      } catch {
        return !1;
      }
    }
  })(Uc)), Uc;
}
var jc = {}, ra = { exports: {} }, Mc = {}, Xt = {}, Pr = {}, xc = {}, Vc = {}, Gc = {}, ym;
function Wa() {
  return ym || (ym = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class a extends t {
      constructor(p) {
        if (super(), !e.IDENTIFIER.test(p))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = p;
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
    e.Name = a;
    class n extends t {
      constructor(p) {
        super(), this._items = typeof p == "string" ? [p] : p;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const p = this._items[0];
        return p === "" || p === '""';
      }
      get str() {
        var p;
        return (p = this._str) !== null && p !== void 0 ? p : this._str = this._items.reduce((E, b) => `${E}${b}`, "");
      }
      get names() {
        var p;
        return (p = this._names) !== null && p !== void 0 ? p : this._names = this._items.reduce((E, b) => (b instanceof a && (E[b.str] = (E[b.str] || 0) + 1), E), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function l(g, ...p) {
      const E = [g[0]];
      let b = 0;
      for (; b < p.length; )
        u(E, p[b]), E.push(g[++b]);
      return new n(E);
    }
    e._ = l;
    const r = new n("+");
    function i(g, ...p) {
      const E = [m(g[0])];
      let b = 0;
      for (; b < p.length; )
        E.push(r), u(E, p[b]), E.push(r, m(g[++b]));
      return o(E), new n(E);
    }
    e.str = i;
    function u(g, p) {
      p instanceof n ? g.push(...p._items) : p instanceof a ? g.push(p) : g.push(d(p));
    }
    e.addCodeArg = u;
    function o(g) {
      let p = 1;
      for (; p < g.length - 1; ) {
        if (g[p] === r) {
          const E = c(g[p - 1], g[p + 1]);
          if (E !== void 0) {
            g.splice(p - 1, 3, E);
            continue;
          }
          g[p++] = "+";
        }
        p++;
      }
    }
    function c(g, p) {
      if (p === '""')
        return g;
      if (g === '""')
        return p;
      if (typeof g == "string")
        return p instanceof a || g[g.length - 1] !== '"' ? void 0 : typeof p != "string" ? `${g.slice(0, -1)}${p}"` : p[0] === '"' ? g.slice(0, -1) + p.slice(1) : void 0;
      if (typeof p == "string" && p[0] === '"' && !(g instanceof a))
        return `"${g}${p.slice(1)}`;
    }
    function s(g, p) {
      return p.emptyStr() ? g : g.emptyStr() ? p : i`${g}${p}`;
    }
    e.strConcat = s;
    function d(g) {
      return typeof g == "number" || typeof g == "boolean" || g === null ? g : m(Array.isArray(g) ? g.join(",") : g);
    }
    function f(g) {
      return new n(m(g));
    }
    e.stringify = f;
    function m(g) {
      return JSON.stringify(g).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = m;
    function y(g) {
      return typeof g == "string" && e.IDENTIFIER.test(g) ? new n(`.${g}`) : l`[${g}]`;
    }
    e.getProperty = y;
    function v(g) {
      if (typeof g == "string" && e.IDENTIFIER.test(g))
        return new n(`${g}`);
      throw new Error(`CodeGen: invalid export name: ${g}, use explicit $id name mapping`);
    }
    e.getEsmExportName = v;
    function h(g) {
      return new n(g.toString());
    }
    e.regexpCode = h;
  })(Gc)), Gc;
}
var Bc = {}, vm;
function _m() {
  return vm || (vm = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = Wa();
    class a extends Error {
      constructor(c) {
        super(`CodeGen: "code" for ${c} not defined`), this.value = c.value;
      }
    }
    var n;
    (function(o) {
      o[o.Started = 0] = "Started", o[o.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class l {
      constructor({ prefixes: c, parent: s } = {}) {
        this._names = {}, this._prefixes = c, this._parent = s;
      }
      toName(c) {
        return c instanceof t.Name ? c : this.name(c);
      }
      name(c) {
        return new t.Name(this._newName(c));
      }
      _newName(c) {
        const s = this._names[c] || this._nameGroup(c);
        return `${c}${s.index++}`;
      }
      _nameGroup(c) {
        var s, d;
        if (!((d = (s = this._parent) === null || s === void 0 ? void 0 : s._prefixes) === null || d === void 0) && d.has(c) || this._prefixes && !this._prefixes.has(c))
          throw new Error(`CodeGen: prefix "${c}" is not allowed in this scope`);
        return this._names[c] = { prefix: c, index: 0 };
      }
    }
    e.Scope = l;
    class r extends t.Name {
      constructor(c, s) {
        super(s), this.prefix = c;
      }
      setValue(c, { property: s, itemIndex: d }) {
        this.value = c, this.scopePath = (0, t._)`.${new t.Name(s)}[${d}]`;
      }
    }
    e.ValueScopeName = r;
    const i = (0, t._)`\n`;
    class u extends l {
      constructor(c) {
        super(c), this._values = {}, this._scope = c.scope, this.opts = { ...c, _n: c.lines ? i : t.nil };
      }
      get() {
        return this._scope;
      }
      name(c) {
        return new r(c, this._newName(c));
      }
      value(c, s) {
        var d;
        if (s.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const f = this.toName(c), { prefix: m } = f, y = (d = s.key) !== null && d !== void 0 ? d : s.ref;
        let v = this._values[m];
        if (v) {
          const p = v.get(y);
          if (p)
            return p;
        } else
          v = this._values[m] = /* @__PURE__ */ new Map();
        v.set(y, f);
        const h = this._scope[m] || (this._scope[m] = []), g = h.length;
        return h[g] = s.ref, f.setValue(s, { property: m, itemIndex: g }), f;
      }
      getValue(c, s) {
        const d = this._values[c];
        if (d)
          return d.get(s);
      }
      scopeRefs(c, s = this._values) {
        return this._reduceValues(s, (d) => {
          if (d.scopePath === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return (0, t._)`${c}${d.scopePath}`;
        });
      }
      scopeCode(c = this._values, s, d) {
        return this._reduceValues(c, (f) => {
          if (f.value === void 0)
            throw new Error(`CodeGen: name "${f}" has no value`);
          return f.value.code;
        }, s, d);
      }
      _reduceValues(c, s, d = {}, f) {
        let m = t.nil;
        for (const y in c) {
          const v = c[y];
          if (!v)
            continue;
          const h = d[y] = d[y] || /* @__PURE__ */ new Map();
          v.forEach((g) => {
            if (h.has(g))
              return;
            h.set(g, n.Started);
            let p = s(g);
            if (p) {
              const E = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              m = (0, t._)`${m}${E} ${g} = ${p};${this.opts._n}`;
            } else if (p = f?.(g))
              m = (0, t._)`${m}${p}${this.opts._n}`;
            else
              throw new a(g);
            h.set(g, n.Completed);
          });
        }
        return m;
      }
    }
    e.ValueScope = u;
  })(Bc)), Bc;
}
var Em;
function De() {
  return Em || (Em = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = Wa(), a = _m();
    var n = Wa();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var l = _m();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return l.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return l.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return l.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return l.varKinds;
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
    class r {
      optimizeNodes() {
        return this;
      }
      optimizeNames(R, N) {
        return this;
      }
    }
    class i extends r {
      constructor(R, N, x) {
        super(), this.varKind = R, this.name = N, this.rhs = x;
      }
      render({ es5: R, _n: N }) {
        const x = R ? a.varKinds.var : this.varKind, O = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${x} ${this.name}${O};` + N;
      }
      optimizeNames(R, N) {
        if (R[this.name.str])
          return this.rhs && (this.rhs = k(this.rhs, R, N)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class u extends r {
      constructor(R, N, x) {
        super(), this.lhs = R, this.rhs = N, this.sideEffects = x;
      }
      render({ _n: R }) {
        return `${this.lhs} = ${this.rhs};` + R;
      }
      optimizeNames(R, N) {
        if (!(this.lhs instanceof t.Name && !R[this.lhs.str] && !this.sideEffects))
          return this.rhs = k(this.rhs, R, N), this;
      }
      get names() {
        const R = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return K(R, this.rhs);
      }
    }
    class o extends u {
      constructor(R, N, x, O) {
        super(R, x, O), this.op = N;
      }
      render({ _n: R }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + R;
      }
    }
    class c extends r {
      constructor(R) {
        super(), this.label = R, this.names = {};
      }
      render({ _n: R }) {
        return `${this.label}:` + R;
      }
    }
    class s extends r {
      constructor(R) {
        super(), this.label = R, this.names = {};
      }
      render({ _n: R }) {
        return `break${this.label ? ` ${this.label}` : ""};` + R;
      }
    }
    class d extends r {
      constructor(R) {
        super(), this.error = R;
      }
      render({ _n: R }) {
        return `throw ${this.error};` + R;
      }
      get names() {
        return this.error.names;
      }
    }
    class f extends r {
      constructor(R) {
        super(), this.code = R;
      }
      render({ _n: R }) {
        return `${this.code};` + R;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames(R, N) {
        return this.code = k(this.code, R, N), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class m extends r {
      constructor(R = []) {
        super(), this.nodes = R;
      }
      render(R) {
        return this.nodes.reduce((N, x) => N + x.render(R), "");
      }
      optimizeNodes() {
        const { nodes: R } = this;
        let N = R.length;
        for (; N--; ) {
          const x = R[N].optimizeNodes();
          Array.isArray(x) ? R.splice(N, 1, ...x) : x ? R[N] = x : R.splice(N, 1);
        }
        return R.length > 0 ? this : void 0;
      }
      optimizeNames(R, N) {
        const { nodes: x } = this;
        let O = x.length;
        for (; O--; ) {
          const I = x[O];
          I.optimizeNames(R, N) || (F(R, I.names), x.splice(O, 1));
        }
        return x.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce((R, N) => M(R, N.names), {});
      }
    }
    class y extends m {
      render(R) {
        return "{" + R._n + super.render(R) + "}" + R._n;
      }
    }
    class v extends m {
    }
    class h extends y {
    }
    h.kind = "else";
    class g extends y {
      constructor(R, N) {
        super(N), this.condition = R;
      }
      render(R) {
        let N = `if(${this.condition})` + super.render(R);
        return this.else && (N += "else " + this.else.render(R)), N;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const R = this.condition;
        if (R === !0)
          return this.nodes;
        let N = this.else;
        if (N) {
          const x = N.optimizeNodes();
          N = this.else = Array.isArray(x) ? new h(x) : x;
        }
        if (N)
          return R === !1 ? N instanceof g ? N : N.nodes : this.nodes.length ? this : new g(Y(R), N instanceof g ? [N] : N.nodes);
        if (!(R === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames(R, N) {
        var x;
        if (this.else = (x = this.else) === null || x === void 0 ? void 0 : x.optimizeNames(R, N), !!(super.optimizeNames(R, N) || this.else))
          return this.condition = k(this.condition, R, N), this;
      }
      get names() {
        const R = super.names;
        return K(R, this.condition), this.else && M(R, this.else.names), R;
      }
    }
    g.kind = "if";
    class p extends y {
    }
    p.kind = "for";
    class E extends p {
      constructor(R) {
        super(), this.iteration = R;
      }
      render(R) {
        return `for(${this.iteration})` + super.render(R);
      }
      optimizeNames(R, N) {
        if (super.optimizeNames(R, N))
          return this.iteration = k(this.iteration, R, N), this;
      }
      get names() {
        return M(super.names, this.iteration.names);
      }
    }
    class b extends p {
      constructor(R, N, x, O) {
        super(), this.varKind = R, this.name = N, this.from = x, this.to = O;
      }
      render(R) {
        const N = R.es5 ? a.varKinds.var : this.varKind, { name: x, from: O, to: I } = this;
        return `for(${N} ${x}=${O}; ${x}<${I}; ${x}++)` + super.render(R);
      }
      get names() {
        const R = K(super.names, this.from);
        return K(R, this.to);
      }
    }
    class $ extends p {
      constructor(R, N, x, O) {
        super(), this.loop = R, this.varKind = N, this.name = x, this.iterable = O;
      }
      render(R) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(R);
      }
      optimizeNames(R, N) {
        if (super.optimizeNames(R, N))
          return this.iterable = k(this.iterable, R, N), this;
      }
      get names() {
        return M(super.names, this.iterable.names);
      }
    }
    class _ extends y {
      constructor(R, N, x) {
        super(), this.name = R, this.args = N, this.async = x;
      }
      render(R) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(R);
      }
    }
    _.kind = "func";
    class w extends m {
      render(R) {
        return "return " + super.render(R);
      }
    }
    w.kind = "return";
    class T extends y {
      render(R) {
        let N = "try" + super.render(R);
        return this.catch && (N += this.catch.render(R)), this.finally && (N += this.finally.render(R)), N;
      }
      optimizeNodes() {
        var R, N;
        return super.optimizeNodes(), (R = this.catch) === null || R === void 0 || R.optimizeNodes(), (N = this.finally) === null || N === void 0 || N.optimizeNodes(), this;
      }
      optimizeNames(R, N) {
        var x, O;
        return super.optimizeNames(R, N), (x = this.catch) === null || x === void 0 || x.optimizeNames(R, N), (O = this.finally) === null || O === void 0 || O.optimizeNames(R, N), this;
      }
      get names() {
        const R = super.names;
        return this.catch && M(R, this.catch.names), this.finally && M(R, this.finally.names), R;
      }
    }
    class P extends y {
      constructor(R) {
        super(), this.error = R;
      }
      render(R) {
        return `catch(${this.error})` + super.render(R);
      }
    }
    P.kind = "catch";
    class G extends y {
      render(R) {
        return "finally" + super.render(R);
      }
    }
    G.kind = "finally";
    class q {
      constructor(R, N = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...N, _n: N.lines ? `
` : "" }, this._extScope = R, this._scope = new a.Scope({ parent: R }), this._nodes = [new v()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name(R) {
        return this._scope.name(R);
      }
      // reserves unique name in the external scope
      scopeName(R) {
        return this._extScope.name(R);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue(R, N) {
        const x = this._extScope.value(R, N);
        return (this._values[x.prefix] || (this._values[x.prefix] = /* @__PURE__ */ new Set())).add(x), x;
      }
      getScopeValue(R, N) {
        return this._extScope.getValue(R, N);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs(R) {
        return this._extScope.scopeRefs(R, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def(R, N, x, O) {
        const I = this._scope.toName(N);
        return x !== void 0 && O && (this._constants[I.str] = x), this._leafNode(new i(R, I, x)), I;
      }
      // `const` declaration (`var` in es5 mode)
      const(R, N, x) {
        return this._def(a.varKinds.const, R, N, x);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let(R, N, x) {
        return this._def(a.varKinds.let, R, N, x);
      }
      // `var` declaration with optional assignment
      var(R, N, x) {
        return this._def(a.varKinds.var, R, N, x);
      }
      // assignment code
      assign(R, N, x) {
        return this._leafNode(new u(R, N, x));
      }
      // `+=` code
      add(R, N) {
        return this._leafNode(new o(R, e.operators.ADD, N));
      }
      // appends passed SafeExpr to code or executes Block
      code(R) {
        return typeof R == "function" ? R() : R !== t.nil && this._leafNode(new f(R)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...R) {
        const N = ["{"];
        for (const [x, O] of R)
          N.length > 1 && N.push(","), N.push(x), (x !== O || this.opts.es5) && (N.push(":"), (0, t.addCodeArg)(N, O));
        return N.push("}"), new t._Code(N);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if(R, N, x) {
        if (this._blockNode(new g(R)), N && x)
          this.code(N).else().code(x).endIf();
        else if (N)
          this.code(N).endIf();
        else if (x)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf(R) {
        return this._elseNode(new g(R));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(g, h);
      }
      _for(R, N) {
        return this._blockNode(R), N && this.code(N).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for(R, N) {
        return this._for(new E(R), N);
      }
      // `for` statement for a range of values
      forRange(R, N, x, O, I = this.opts.es5 ? a.varKinds.var : a.varKinds.let) {
        const Q = this._scope.toName(R);
        return this._for(new b(I, Q, N, x), () => O(Q));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf(R, N, x, O = a.varKinds.const) {
        const I = this._scope.toName(R);
        if (this.opts.es5) {
          const Q = N instanceof t.Name ? N : this.var("_arr", N);
          return this.forRange("_i", 0, (0, t._)`${Q}.length`, (H) => {
            this.var(I, (0, t._)`${Q}[${H}]`), x(I);
          });
        }
        return this._for(new $("of", O, I, N), () => x(I));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn(R, N, x, O = this.opts.es5 ? a.varKinds.var : a.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf(R, (0, t._)`Object.keys(${N})`, x);
        const I = this._scope.toName(R);
        return this._for(new $("in", O, I, N), () => x(I));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(p);
      }
      // `label` statement
      label(R) {
        return this._leafNode(new c(R));
      }
      // `break` statement
      break(R) {
        return this._leafNode(new s(R));
      }
      // `return` statement
      return(R) {
        const N = new w();
        if (this._blockNode(N), this.code(R), N.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(w);
      }
      // `try` statement
      try(R, N, x) {
        if (!N && !x)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const O = new T();
        if (this._blockNode(O), this.code(R), N) {
          const I = this.name("e");
          this._currNode = O.catch = new P(I), N(I);
        }
        return x && (this._currNode = O.finally = new G(), this.code(x)), this._endBlockNode(P, G);
      }
      // `throw` statement
      throw(R) {
        return this._leafNode(new d(R));
      }
      // start self-balancing block
      block(R, N) {
        return this._blockStarts.push(this._nodes.length), R && this.code(R).endBlock(N), this;
      }
      // end the current self-balancing block
      endBlock(R) {
        const N = this._blockStarts.pop();
        if (N === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const x = this._nodes.length - N;
        if (x < 0 || R !== void 0 && x !== R)
          throw new Error(`CodeGen: wrong number of nodes: ${x} vs ${R} expected`);
        return this._nodes.length = N, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func(R, N = t.nil, x, O) {
        return this._blockNode(new _(R, N, x)), O && this.code(O).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(_);
      }
      optimize(R = 1) {
        for (; R-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode(R) {
        return this._currNode.nodes.push(R), this;
      }
      _blockNode(R) {
        this._currNode.nodes.push(R), this._nodes.push(R);
      }
      _endBlockNode(R, N) {
        const x = this._currNode;
        if (x instanceof R || N && x instanceof N)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${N ? `${R.kind}/${N.kind}` : R.kind}"`);
      }
      _elseNode(R) {
        const N = this._currNode;
        if (!(N instanceof g))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = N.else = R, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const R = this._nodes;
        return R[R.length - 1];
      }
      set _currNode(R) {
        const N = this._nodes;
        N[N.length - 1] = R;
      }
    }
    e.CodeGen = q;
    function M(D, R) {
      for (const N in R)
        D[N] = (D[N] || 0) + (R[N] || 0);
      return D;
    }
    function K(D, R) {
      return R instanceof t._CodeOrName ? M(D, R.names) : D;
    }
    function k(D, R, N) {
      if (D instanceof t.Name)
        return x(D);
      if (!O(D))
        return D;
      return new t._Code(D._items.reduce((I, Q) => (Q instanceof t.Name && (Q = x(Q)), Q instanceof t._Code ? I.push(...Q._items) : I.push(Q), I), []));
      function x(I) {
        const Q = N[I.str];
        return Q === void 0 || R[I.str] !== 1 ? I : (delete R[I.str], Q);
      }
      function O(I) {
        return I instanceof t._Code && I._items.some((Q) => Q instanceof t.Name && R[Q.str] === 1 && N[Q.str] !== void 0);
      }
    }
    function F(D, R) {
      for (const N in R)
        D[N] = (D[N] || 0) - (R[N] || 0);
    }
    function Y(D) {
      return typeof D == "boolean" || typeof D == "number" || D === null ? !D : (0, t._)`!${j(D)}`;
    }
    e.not = Y;
    const B = C(e.operators.AND);
    function W(...D) {
      return D.reduce(B);
    }
    e.and = W;
    const Z = C(e.operators.OR);
    function V(...D) {
      return D.reduce(Z);
    }
    e.or = V;
    function C(D) {
      return (R, N) => R === t.nil ? N : N === t.nil ? R : (0, t._)`${j(R)} ${D} ${j(N)}`;
    }
    function j(D) {
      return D instanceof t.Name ? D : (0, t._)`(${D})`;
    }
  })(Vc)), Vc;
}
var Ce = {}, wm;
function Ue() {
  if (wm) return Ce;
  wm = 1, Object.defineProperty(Ce, "__esModule", { value: !0 }), Ce.checkStrictMode = Ce.getErrorPath = Ce.Type = Ce.useFunc = Ce.setEvaluated = Ce.evaluatedPropsToName = Ce.mergeEvaluated = Ce.eachItem = Ce.unescapeJsonPointer = Ce.escapeJsonPointer = Ce.escapeFragment = Ce.unescapeFragment = Ce.schemaRefOrVal = Ce.schemaHasRulesButRef = Ce.schemaHasRules = Ce.checkUnknownRules = Ce.alwaysValidSchema = Ce.toHash = void 0;
  const e = De(), t = Wa();
  function a($) {
    const _ = {};
    for (const w of $)
      _[w] = !0;
    return _;
  }
  Ce.toHash = a;
  function n($, _) {
    return typeof _ == "boolean" ? _ : Object.keys(_).length === 0 ? !0 : (l($, _), !r(_, $.self.RULES.all));
  }
  Ce.alwaysValidSchema = n;
  function l($, _ = $.schema) {
    const { opts: w, self: T } = $;
    if (!w.strictSchema || typeof _ == "boolean")
      return;
    const P = T.RULES.keywords;
    for (const G in _)
      P[G] || b($, `unknown keyword: "${G}"`);
  }
  Ce.checkUnknownRules = l;
  function r($, _) {
    if (typeof $ == "boolean")
      return !$;
    for (const w in $)
      if (_[w])
        return !0;
    return !1;
  }
  Ce.schemaHasRules = r;
  function i($, _) {
    if (typeof $ == "boolean")
      return !$;
    for (const w in $)
      if (w !== "$ref" && _.all[w])
        return !0;
    return !1;
  }
  Ce.schemaHasRulesButRef = i;
  function u({ topSchemaRef: $, schemaPath: _ }, w, T, P) {
    if (!P) {
      if (typeof w == "number" || typeof w == "boolean")
        return w;
      if (typeof w == "string")
        return (0, e._)`${w}`;
    }
    return (0, e._)`${$}${_}${(0, e.getProperty)(T)}`;
  }
  Ce.schemaRefOrVal = u;
  function o($) {
    return d(decodeURIComponent($));
  }
  Ce.unescapeFragment = o;
  function c($) {
    return encodeURIComponent(s($));
  }
  Ce.escapeFragment = c;
  function s($) {
    return typeof $ == "number" ? `${$}` : $.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Ce.escapeJsonPointer = s;
  function d($) {
    return $.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Ce.unescapeJsonPointer = d;
  function f($, _) {
    if (Array.isArray($))
      for (const w of $)
        _(w);
    else
      _($);
  }
  Ce.eachItem = f;
  function m({ mergeNames: $, mergeToName: _, mergeValues: w, resultToName: T }) {
    return (P, G, q, M) => {
      const K = q === void 0 ? G : q instanceof e.Name ? (G instanceof e.Name ? $(P, G, q) : _(P, G, q), q) : G instanceof e.Name ? (_(P, q, G), G) : w(G, q);
      return M === e.Name && !(K instanceof e.Name) ? T(P, K) : K;
    };
  }
  Ce.mergeEvaluated = {
    props: m({
      mergeNames: ($, _, w) => $.if((0, e._)`${w} !== true && ${_} !== undefined`, () => {
        $.if((0, e._)`${_} === true`, () => $.assign(w, !0), () => $.assign(w, (0, e._)`${w} || {}`).code((0, e._)`Object.assign(${w}, ${_})`));
      }),
      mergeToName: ($, _, w) => $.if((0, e._)`${w} !== true`, () => {
        _ === !0 ? $.assign(w, !0) : ($.assign(w, (0, e._)`${w} || {}`), v($, w, _));
      }),
      mergeValues: ($, _) => $ === !0 ? !0 : { ...$, ..._ },
      resultToName: y
    }),
    items: m({
      mergeNames: ($, _, w) => $.if((0, e._)`${w} !== true && ${_} !== undefined`, () => $.assign(w, (0, e._)`${_} === true ? true : ${w} > ${_} ? ${w} : ${_}`)),
      mergeToName: ($, _, w) => $.if((0, e._)`${w} !== true`, () => $.assign(w, _ === !0 ? !0 : (0, e._)`${w} > ${_} ? ${w} : ${_}`)),
      mergeValues: ($, _) => $ === !0 ? !0 : Math.max($, _),
      resultToName: ($, _) => $.var("items", _)
    })
  };
  function y($, _) {
    if (_ === !0)
      return $.var("props", !0);
    const w = $.var("props", (0, e._)`{}`);
    return _ !== void 0 && v($, w, _), w;
  }
  Ce.evaluatedPropsToName = y;
  function v($, _, w) {
    Object.keys(w).forEach((T) => $.assign((0, e._)`${_}${(0, e.getProperty)(T)}`, !0));
  }
  Ce.setEvaluated = v;
  const h = {};
  function g($, _) {
    return $.scopeValue("func", {
      ref: _,
      code: h[_.code] || (h[_.code] = new t._Code(_.code))
    });
  }
  Ce.useFunc = g;
  var p;
  (function($) {
    $[$.Num = 0] = "Num", $[$.Str = 1] = "Str";
  })(p || (Ce.Type = p = {}));
  function E($, _, w) {
    if ($ instanceof e.Name) {
      const T = _ === p.Num;
      return w ? T ? (0, e._)`"[" + ${$} + "]"` : (0, e._)`"['" + ${$} + "']"` : T ? (0, e._)`"/" + ${$}` : (0, e._)`"/" + ${$}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return w ? (0, e.getProperty)($).toString() : "/" + s($);
  }
  Ce.getErrorPath = E;
  function b($, _, w = $.opts.strictSchema) {
    if (w) {
      if (_ = `strict mode: ${_}`, w === !0)
        throw new Error(_);
      $.self.logger.warn(_);
    }
  }
  return Ce.checkStrictMode = b, Ce;
}
var na = {}, $m;
function dr() {
  if ($m) return na;
  $m = 1, Object.defineProperty(na, "__esModule", { value: !0 });
  const e = De(), t = {
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
  return na.default = t, na;
}
var Sm;
function ps() {
  return Sm || (Sm = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = De(), a = Ue(), n = dr();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: g }) => g ? (0, t.str)`"${h}" keyword must be ${g} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function l(h, g = e.keywordError, p, E) {
      const { it: b } = h, { gen: $, compositeRule: _, allErrors: w } = b, T = d(h, g, p);
      E ?? (_ || w) ? o($, T) : c(b, (0, t._)`[${T}]`);
    }
    e.reportError = l;
    function r(h, g = e.keywordError, p) {
      const { it: E } = h, { gen: b, compositeRule: $, allErrors: _ } = E, w = d(h, g, p);
      o(b, w), $ || _ || c(E, n.default.vErrors);
    }
    e.reportExtraError = r;
    function i(h, g) {
      h.assign(n.default.errors, g), h.if((0, t._)`${n.default.vErrors} !== null`, () => h.if(g, () => h.assign((0, t._)`${n.default.vErrors}.length`, g), () => h.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = i;
    function u({ gen: h, keyword: g, schemaValue: p, data: E, errsCount: b, it: $ }) {
      if (b === void 0)
        throw new Error("ajv implementation error");
      const _ = h.name("err");
      h.forRange("i", b, n.default.errors, (w) => {
        h.const(_, (0, t._)`${n.default.vErrors}[${w}]`), h.if((0, t._)`${_}.instancePath === undefined`, () => h.assign((0, t._)`${_}.instancePath`, (0, t.strConcat)(n.default.instancePath, $.errorPath))), h.assign((0, t._)`${_}.schemaPath`, (0, t.str)`${$.errSchemaPath}/${g}`), $.opts.verbose && (h.assign((0, t._)`${_}.schema`, p), h.assign((0, t._)`${_}.data`, E));
      });
    }
    e.extendErrors = u;
    function o(h, g) {
      const p = h.const("err", g);
      h.if((0, t._)`${n.default.vErrors} === null`, () => h.assign(n.default.vErrors, (0, t._)`[${p}]`), (0, t._)`${n.default.vErrors}.push(${p})`), h.code((0, t._)`${n.default.errors}++`);
    }
    function c(h, g) {
      const { gen: p, validateName: E, schemaEnv: b } = h;
      b.$async ? p.throw((0, t._)`new ${h.ValidationError}(${g})`) : (p.assign((0, t._)`${E}.errors`, g), p.return(!1));
    }
    const s = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function d(h, g, p) {
      const { createErrors: E } = h.it;
      return E === !1 ? (0, t._)`{}` : f(h, g, p);
    }
    function f(h, g, p = {}) {
      const { gen: E, it: b } = h, $ = [
        m(b, p),
        y(h, p)
      ];
      return v(h, g, $), E.object(...$);
    }
    function m({ errorPath: h }, { instancePath: g }) {
      const p = g ? (0, t.str)`${h}${(0, a.getErrorPath)(g, a.Type.Str)}` : h;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, p)];
    }
    function y({ keyword: h, it: { errSchemaPath: g } }, { schemaPath: p, parentSchema: E }) {
      let b = E ? g : (0, t.str)`${g}/${h}`;
      return p && (b = (0, t.str)`${b}${(0, a.getErrorPath)(p, a.Type.Str)}`), [s.schemaPath, b];
    }
    function v(h, { params: g, message: p }, E) {
      const { keyword: b, data: $, schemaValue: _, it: w } = h, { opts: T, propertyName: P, topSchemaRef: G, schemaPath: q } = w;
      E.push([s.keyword, b], [s.params, typeof g == "function" ? g(h) : g || (0, t._)`{}`]), T.messages && E.push([s.message, typeof p == "function" ? p(h) : p]), T.verbose && E.push([s.schema, _], [s.parentSchema, (0, t._)`${G}${q}`], [n.default.data, $]), P && E.push([s.propertyName, P]);
    }
  })(xc)), xc;
}
var bm;
function eS() {
  if (bm) return Pr;
  bm = 1, Object.defineProperty(Pr, "__esModule", { value: !0 }), Pr.boolOrEmptySchema = Pr.topBoolOrEmptySchema = void 0;
  const e = ps(), t = De(), a = dr(), n = {
    message: "boolean schema is false"
  };
  function l(u) {
    const { gen: o, schema: c, validateName: s } = u;
    c === !1 ? i(u, !1) : typeof c == "object" && c.$async === !0 ? o.return(a.default.data) : (o.assign((0, t._)`${s}.errors`, null), o.return(!0));
  }
  Pr.topBoolOrEmptySchema = l;
  function r(u, o) {
    const { gen: c, schema: s } = u;
    s === !1 ? (c.var(o, !1), i(u)) : c.var(o, !0);
  }
  Pr.boolOrEmptySchema = r;
  function i(u, o) {
    const { gen: c, data: s } = u, d = {
      gen: c,
      keyword: "false schema",
      data: s,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: u
    };
    (0, e.reportError)(d, n, void 0, o);
  }
  return Pr;
}
var tt = {}, Nr = {}, Rm;
function S0() {
  if (Rm) return Nr;
  Rm = 1, Object.defineProperty(Nr, "__esModule", { value: !0 }), Nr.getRules = Nr.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function a(l) {
    return typeof l == "string" && t.has(l);
  }
  Nr.isJSONType = a;
  function n() {
    const l = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...l, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, l.number, l.string, l.array, l.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return Nr.getRules = n, Nr;
}
var Wt = {}, Tm;
function b0() {
  if (Tm) return Wt;
  Tm = 1, Object.defineProperty(Wt, "__esModule", { value: !0 }), Wt.shouldUseRule = Wt.shouldUseGroup = Wt.schemaHasRulesForType = void 0;
  function e({ schema: n, self: l }, r) {
    const i = l.RULES.types[r];
    return i && i !== !0 && t(n, i);
  }
  Wt.schemaHasRulesForType = e;
  function t(n, l) {
    return l.rules.some((r) => a(n, r));
  }
  Wt.shouldUseGroup = t;
  function a(n, l) {
    var r;
    return n[l.keyword] !== void 0 || ((r = l.definition.implements) === null || r === void 0 ? void 0 : r.some((i) => n[i] !== void 0));
  }
  return Wt.shouldUseRule = a, Wt;
}
var Pm;
function Ya() {
  if (Pm) return tt;
  Pm = 1, Object.defineProperty(tt, "__esModule", { value: !0 }), tt.reportTypeError = tt.checkDataTypes = tt.checkDataType = tt.coerceAndCheckDataType = tt.getJSONTypes = tt.getSchemaTypes = tt.DataType = void 0;
  const e = S0(), t = b0(), a = ps(), n = De(), l = Ue();
  var r;
  (function(p) {
    p[p.Correct = 0] = "Correct", p[p.Wrong = 1] = "Wrong";
  })(r || (tt.DataType = r = {}));
  function i(p) {
    const E = u(p.type);
    if (E.includes("null")) {
      if (p.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!E.length && p.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      p.nullable === !0 && E.push("null");
    }
    return E;
  }
  tt.getSchemaTypes = i;
  function u(p) {
    const E = Array.isArray(p) ? p : p ? [p] : [];
    if (E.every(e.isJSONType))
      return E;
    throw new Error("type must be JSONType or JSONType[]: " + E.join(","));
  }
  tt.getJSONTypes = u;
  function o(p, E) {
    const { gen: b, data: $, opts: _ } = p, w = s(E, _.coerceTypes), T = E.length > 0 && !(w.length === 0 && E.length === 1 && (0, t.schemaHasRulesForType)(p, E[0]));
    if (T) {
      const P = y(E, $, _.strictNumbers, r.Wrong);
      b.if(P, () => {
        w.length ? d(p, E, w) : h(p);
      });
    }
    return T;
  }
  tt.coerceAndCheckDataType = o;
  const c = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function s(p, E) {
    return E ? p.filter((b) => c.has(b) || E === "array" && b === "array") : [];
  }
  function d(p, E, b) {
    const { gen: $, data: _, opts: w } = p, T = $.let("dataType", (0, n._)`typeof ${_}`), P = $.let("coerced", (0, n._)`undefined`);
    w.coerceTypes === "array" && $.if((0, n._)`${T} == 'object' && Array.isArray(${_}) && ${_}.length == 1`, () => $.assign(_, (0, n._)`${_}[0]`).assign(T, (0, n._)`typeof ${_}`).if(y(E, _, w.strictNumbers), () => $.assign(P, _))), $.if((0, n._)`${P} !== undefined`);
    for (const q of b)
      (c.has(q) || q === "array" && w.coerceTypes === "array") && G(q);
    $.else(), h(p), $.endIf(), $.if((0, n._)`${P} !== undefined`, () => {
      $.assign(_, P), f(p, P);
    });
    function G(q) {
      switch (q) {
        case "string":
          $.elseIf((0, n._)`${T} == "number" || ${T} == "boolean"`).assign(P, (0, n._)`"" + ${_}`).elseIf((0, n._)`${_} === null`).assign(P, (0, n._)`""`);
          return;
        case "number":
          $.elseIf((0, n._)`${T} == "boolean" || ${_} === null
              || (${T} == "string" && ${_} && ${_} == +${_})`).assign(P, (0, n._)`+${_}`);
          return;
        case "integer":
          $.elseIf((0, n._)`${T} === "boolean" || ${_} === null
              || (${T} === "string" && ${_} && ${_} == +${_} && !(${_} % 1))`).assign(P, (0, n._)`+${_}`);
          return;
        case "boolean":
          $.elseIf((0, n._)`${_} === "false" || ${_} === 0 || ${_} === null`).assign(P, !1).elseIf((0, n._)`${_} === "true" || ${_} === 1`).assign(P, !0);
          return;
        case "null":
          $.elseIf((0, n._)`${_} === "" || ${_} === 0 || ${_} === false`), $.assign(P, null);
          return;
        case "array":
          $.elseIf((0, n._)`${T} === "string" || ${T} === "number"
              || ${T} === "boolean" || ${_} === null`).assign(P, (0, n._)`[${_}]`);
      }
    }
  }
  function f({ gen: p, parentData: E, parentDataProperty: b }, $) {
    p.if((0, n._)`${E} !== undefined`, () => p.assign((0, n._)`${E}[${b}]`, $));
  }
  function m(p, E, b, $ = r.Correct) {
    const _ = $ === r.Correct ? n.operators.EQ : n.operators.NEQ;
    let w;
    switch (p) {
      case "null":
        return (0, n._)`${E} ${_} null`;
      case "array":
        w = (0, n._)`Array.isArray(${E})`;
        break;
      case "object":
        w = (0, n._)`${E} && typeof ${E} == "object" && !Array.isArray(${E})`;
        break;
      case "integer":
        w = T((0, n._)`!(${E} % 1) && !isNaN(${E})`);
        break;
      case "number":
        w = T();
        break;
      default:
        return (0, n._)`typeof ${E} ${_} ${p}`;
    }
    return $ === r.Correct ? w : (0, n.not)(w);
    function T(P = n.nil) {
      return (0, n.and)((0, n._)`typeof ${E} == "number"`, P, b ? (0, n._)`isFinite(${E})` : n.nil);
    }
  }
  tt.checkDataType = m;
  function y(p, E, b, $) {
    if (p.length === 1)
      return m(p[0], E, b, $);
    let _;
    const w = (0, l.toHash)(p);
    if (w.array && w.object) {
      const T = (0, n._)`typeof ${E} != "object"`;
      _ = w.null ? T : (0, n._)`!${E} || ${T}`, delete w.null, delete w.array, delete w.object;
    } else
      _ = n.nil;
    w.number && delete w.integer;
    for (const T in w)
      _ = (0, n.and)(_, m(T, E, b, $));
    return _;
  }
  tt.checkDataTypes = y;
  const v = {
    message: ({ schema: p }) => `must be ${p}`,
    params: ({ schema: p, schemaValue: E }) => typeof p == "string" ? (0, n._)`{type: ${p}}` : (0, n._)`{type: ${E}}`
  };
  function h(p) {
    const E = g(p);
    (0, a.reportError)(E, v);
  }
  tt.reportTypeError = h;
  function g(p) {
    const { gen: E, data: b, schema: $ } = p, _ = (0, l.schemaRefOrVal)(p, $, "type");
    return {
      gen: E,
      keyword: "type",
      data: b,
      schema: $.type,
      schemaCode: _,
      schemaValue: _,
      parentSchema: $,
      params: {},
      it: p
    };
  }
  return tt;
}
var On = {}, Nm;
function tS() {
  if (Nm) return On;
  Nm = 1, Object.defineProperty(On, "__esModule", { value: !0 }), On.assignDefaults = void 0;
  const e = De(), t = Ue();
  function a(l, r) {
    const { properties: i, items: u } = l.schema;
    if (r === "object" && i)
      for (const o in i)
        n(l, o, i[o].default);
    else r === "array" && Array.isArray(u) && u.forEach((o, c) => n(l, c, o.default));
  }
  On.assignDefaults = a;
  function n(l, r, i) {
    const { gen: u, compositeRule: o, data: c, opts: s } = l;
    if (i === void 0)
      return;
    const d = (0, e._)`${c}${(0, e.getProperty)(r)}`;
    if (o) {
      (0, t.checkStrictMode)(l, `default is ignored for: ${d}`);
      return;
    }
    let f = (0, e._)`${d} === undefined`;
    s.useDefaults === "empty" && (f = (0, e._)`${f} || ${d} === null || ${d} === ""`), u.if(f, (0, e._)`${d} = ${(0, e.stringify)(i)}`);
  }
  return On;
}
var It = {}, Ve = {}, Im;
function qt() {
  if (Im) return Ve;
  Im = 1, Object.defineProperty(Ve, "__esModule", { value: !0 }), Ve.validateUnion = Ve.validateArray = Ve.usePattern = Ve.callValidateCode = Ve.schemaProperties = Ve.allSchemaProperties = Ve.noPropertyInData = Ve.propertyInData = Ve.isOwnProperty = Ve.hasPropFunc = Ve.reportMissingProp = Ve.checkMissingProp = Ve.checkReportMissingProp = void 0;
  const e = De(), t = Ue(), a = dr(), n = Ue();
  function l(p, E) {
    const { gen: b, data: $, it: _ } = p;
    b.if(s(b, $, E, _.opts.ownProperties), () => {
      p.setParams({ missingProperty: (0, e._)`${E}` }, !0), p.error();
    });
  }
  Ve.checkReportMissingProp = l;
  function r({ gen: p, data: E, it: { opts: b } }, $, _) {
    return (0, e.or)(...$.map((w) => (0, e.and)(s(p, E, w, b.ownProperties), (0, e._)`${_} = ${w}`)));
  }
  Ve.checkMissingProp = r;
  function i(p, E) {
    p.setParams({ missingProperty: E }, !0), p.error();
  }
  Ve.reportMissingProp = i;
  function u(p) {
    return p.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  Ve.hasPropFunc = u;
  function o(p, E, b) {
    return (0, e._)`${u(p)}.call(${E}, ${b})`;
  }
  Ve.isOwnProperty = o;
  function c(p, E, b, $) {
    const _ = (0, e._)`${E}${(0, e.getProperty)(b)} !== undefined`;
    return $ ? (0, e._)`${_} && ${o(p, E, b)}` : _;
  }
  Ve.propertyInData = c;
  function s(p, E, b, $) {
    const _ = (0, e._)`${E}${(0, e.getProperty)(b)} === undefined`;
    return $ ? (0, e.or)(_, (0, e.not)(o(p, E, b))) : _;
  }
  Ve.noPropertyInData = s;
  function d(p) {
    return p ? Object.keys(p).filter((E) => E !== "__proto__") : [];
  }
  Ve.allSchemaProperties = d;
  function f(p, E) {
    return d(E).filter((b) => !(0, t.alwaysValidSchema)(p, E[b]));
  }
  Ve.schemaProperties = f;
  function m({ schemaCode: p, data: E, it: { gen: b, topSchemaRef: $, schemaPath: _, errorPath: w }, it: T }, P, G, q) {
    const M = q ? (0, e._)`${p}, ${E}, ${$}${_}` : E, K = [
      [a.default.instancePath, (0, e.strConcat)(a.default.instancePath, w)],
      [a.default.parentData, T.parentData],
      [a.default.parentDataProperty, T.parentDataProperty],
      [a.default.rootData, a.default.rootData]
    ];
    T.opts.dynamicRef && K.push([a.default.dynamicAnchors, a.default.dynamicAnchors]);
    const k = (0, e._)`${M}, ${b.object(...K)}`;
    return G !== e.nil ? (0, e._)`${P}.call(${G}, ${k})` : (0, e._)`${P}(${k})`;
  }
  Ve.callValidateCode = m;
  const y = (0, e._)`new RegExp`;
  function v({ gen: p, it: { opts: E } }, b) {
    const $ = E.unicodeRegExp ? "u" : "", { regExp: _ } = E.code, w = _(b, $);
    return p.scopeValue("pattern", {
      key: w.toString(),
      ref: w,
      code: (0, e._)`${_.code === "new RegExp" ? y : (0, n.useFunc)(p, _)}(${b}, ${$})`
    });
  }
  Ve.usePattern = v;
  function h(p) {
    const { gen: E, data: b, keyword: $, it: _ } = p, w = E.name("valid");
    if (_.allErrors) {
      const P = E.let("valid", !0);
      return T(() => E.assign(P, !1)), P;
    }
    return E.var(w, !0), T(() => E.break()), w;
    function T(P) {
      const G = E.const("len", (0, e._)`${b}.length`);
      E.forRange("i", 0, G, (q) => {
        p.subschema({
          keyword: $,
          dataProp: q,
          dataPropType: t.Type.Num
        }, w), E.if((0, e.not)(w), P);
      });
    }
  }
  Ve.validateArray = h;
  function g(p) {
    const { gen: E, schema: b, keyword: $, it: _ } = p;
    if (!Array.isArray(b))
      throw new Error("ajv implementation error");
    if (b.some((G) => (0, t.alwaysValidSchema)(_, G)) && !_.opts.unevaluated)
      return;
    const T = E.let("valid", !1), P = E.name("_valid");
    E.block(() => b.forEach((G, q) => {
      const M = p.subschema({
        keyword: $,
        schemaProp: q,
        compositeRule: !0
      }, P);
      E.assign(T, (0, e._)`${T} || ${P}`), p.mergeValidEvaluated(M, P) || E.if((0, e.not)(T));
    })), p.result(T, () => p.reset(), () => p.error(!0));
  }
  return Ve.validateUnion = g, Ve;
}
var Om;
function rS() {
  if (Om) return It;
  Om = 1, Object.defineProperty(It, "__esModule", { value: !0 }), It.validateKeywordUsage = It.validSchemaType = It.funcKeywordCode = It.macroKeywordCode = void 0;
  const e = De(), t = dr(), a = qt(), n = ps();
  function l(f, m) {
    const { gen: y, keyword: v, schema: h, parentSchema: g, it: p } = f, E = m.macro.call(p.self, h, g, p), b = c(y, v, E);
    p.opts.validateSchema !== !1 && p.self.validateSchema(E, !0);
    const $ = y.name("valid");
    f.subschema({
      schema: E,
      schemaPath: e.nil,
      errSchemaPath: `${p.errSchemaPath}/${v}`,
      topSchemaRef: b,
      compositeRule: !0
    }, $), f.pass($, () => f.error(!0));
  }
  It.macroKeywordCode = l;
  function r(f, m) {
    var y;
    const { gen: v, keyword: h, schema: g, parentSchema: p, $data: E, it: b } = f;
    o(b, m);
    const $ = !E && m.compile ? m.compile.call(b.self, g, p, b) : m.validate, _ = c(v, h, $), w = v.let("valid");
    f.block$data(w, T), f.ok((y = m.valid) !== null && y !== void 0 ? y : w);
    function T() {
      if (m.errors === !1)
        q(), m.modifying && i(f), M(() => f.error());
      else {
        const K = m.async ? P() : G();
        m.modifying && i(f), M(() => u(f, K));
      }
    }
    function P() {
      const K = v.let("ruleErrs", null);
      return v.try(() => q((0, e._)`await `), (k) => v.assign(w, !1).if((0, e._)`${k} instanceof ${b.ValidationError}`, () => v.assign(K, (0, e._)`${k}.errors`), () => v.throw(k))), K;
    }
    function G() {
      const K = (0, e._)`${_}.errors`;
      return v.assign(K, null), q(e.nil), K;
    }
    function q(K = m.async ? (0, e._)`await ` : e.nil) {
      const k = b.opts.passContext ? t.default.this : t.default.self, F = !("compile" in m && !E || m.schema === !1);
      v.assign(w, (0, e._)`${K}${(0, a.callValidateCode)(f, _, k, F)}`, m.modifying);
    }
    function M(K) {
      var k;
      v.if((0, e.not)((k = m.valid) !== null && k !== void 0 ? k : w), K);
    }
  }
  It.funcKeywordCode = r;
  function i(f) {
    const { gen: m, data: y, it: v } = f;
    m.if(v.parentData, () => m.assign(y, (0, e._)`${v.parentData}[${v.parentDataProperty}]`));
  }
  function u(f, m) {
    const { gen: y } = f;
    y.if((0, e._)`Array.isArray(${m})`, () => {
      y.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${m} : ${t.default.vErrors}.concat(${m})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(f);
    }, () => f.error());
  }
  function o({ schemaEnv: f }, m) {
    if (m.async && !f.$async)
      throw new Error("async keyword in sync schema");
  }
  function c(f, m, y) {
    if (y === void 0)
      throw new Error(`keyword "${m}" failed to compile`);
    return f.scopeValue("keyword", typeof y == "function" ? { ref: y } : { ref: y, code: (0, e.stringify)(y) });
  }
  function s(f, m, y = !1) {
    return !m.length || m.some((v) => v === "array" ? Array.isArray(f) : v === "object" ? f && typeof f == "object" && !Array.isArray(f) : typeof f == v || y && typeof f > "u");
  }
  It.validSchemaType = s;
  function d({ schema: f, opts: m, self: y, errSchemaPath: v }, h, g) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(g) : h.keyword !== g)
      throw new Error("ajv implementation error");
    const p = h.dependencies;
    if (p?.some((E) => !Object.prototype.hasOwnProperty.call(f, E)))
      throw new Error(`parent schema must have dependencies of ${g}: ${p.join(",")}`);
    if (h.validateSchema && !h.validateSchema(f[g])) {
      const b = `keyword "${g}" value is invalid at path "${v}": ` + y.errorsText(h.validateSchema.errors);
      if (m.validateSchema === "log")
        y.logger.error(b);
      else
        throw new Error(b);
    }
  }
  return It.validateKeywordUsage = d, It;
}
var Yt = {}, Am;
function nS() {
  if (Am) return Yt;
  Am = 1, Object.defineProperty(Yt, "__esModule", { value: !0 }), Yt.extendSubschemaMode = Yt.extendSubschemaData = Yt.getSubschema = void 0;
  const e = De(), t = Ue();
  function a(r, { keyword: i, schemaProp: u, schema: o, schemaPath: c, errSchemaPath: s, topSchemaRef: d }) {
    if (i !== void 0 && o !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const f = r.schema[i];
      return u === void 0 ? {
        schema: f,
        schemaPath: (0, e._)`${r.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${r.errSchemaPath}/${i}`
      } : {
        schema: f[u],
        schemaPath: (0, e._)`${r.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(u)}`,
        errSchemaPath: `${r.errSchemaPath}/${i}/${(0, t.escapeFragment)(u)}`
      };
    }
    if (o !== void 0) {
      if (c === void 0 || s === void 0 || d === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: o,
        schemaPath: c,
        topSchemaRef: d,
        errSchemaPath: s
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  Yt.getSubschema = a;
  function n(r, i, { dataProp: u, dataPropType: o, data: c, dataTypes: s, propertyName: d }) {
    if (c !== void 0 && u !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: f } = i;
    if (u !== void 0) {
      const { errorPath: y, dataPathArr: v, opts: h } = i, g = f.let("data", (0, e._)`${i.data}${(0, e.getProperty)(u)}`, !0);
      m(g), r.errorPath = (0, e.str)`${y}${(0, t.getErrorPath)(u, o, h.jsPropertySyntax)}`, r.parentDataProperty = (0, e._)`${u}`, r.dataPathArr = [...v, r.parentDataProperty];
    }
    if (c !== void 0) {
      const y = c instanceof e.Name ? c : f.let("data", c, !0);
      m(y), d !== void 0 && (r.propertyName = d);
    }
    s && (r.dataTypes = s);
    function m(y) {
      r.data = y, r.dataLevel = i.dataLevel + 1, r.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), r.parentData = i.data, r.dataNames = [...i.dataNames, y];
    }
  }
  Yt.extendSubschemaData = n;
  function l(r, { jtdDiscriminator: i, jtdMetadata: u, compositeRule: o, createErrors: c, allErrors: s }) {
    o !== void 0 && (r.compositeRule = o), c !== void 0 && (r.createErrors = c), s !== void 0 && (r.allErrors = s), r.jtdDiscriminator = i, r.jtdMetadata = u;
  }
  return Yt.extendSubschemaMode = l, Yt;
}
var ft = {}, Hc = { exports: {} }, Cm;
function iS() {
  if (Cm) return Hc.exports;
  Cm = 1;
  var e = Hc.exports = function(n, l, r) {
    typeof l == "function" && (r = l, l = {}), r = l.cb || r;
    var i = typeof r == "function" ? r : r.pre || function() {
    }, u = r.post || function() {
    };
    t(l, i, u, n, "", n);
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
  function t(n, l, r, i, u, o, c, s, d, f) {
    if (i && typeof i == "object" && !Array.isArray(i)) {
      l(i, u, o, c, s, d, f);
      for (var m in i) {
        var y = i[m];
        if (Array.isArray(y)) {
          if (m in e.arrayKeywords)
            for (var v = 0; v < y.length; v++)
              t(n, l, r, y[v], u + "/" + m + "/" + v, o, u, m, i, v);
        } else if (m in e.propsKeywords) {
          if (y && typeof y == "object")
            for (var h in y)
              t(n, l, r, y[h], u + "/" + m + "/" + a(h), o, u, m, i, h);
        } else (m in e.keywords || n.allKeys && !(m in e.skipKeywords)) && t(n, l, r, y, u + "/" + m, o, u, m, i);
      }
      r(i, u, o, c, s, d, f);
    }
  }
  function a(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Hc.exports;
}
var Dm;
function ms() {
  if (Dm) return ft;
  Dm = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.getSchemaRefs = ft.resolveUrl = ft.normalizeId = ft._getFullPath = ft.getFullPath = ft.inlineRef = void 0;
  const e = Ue(), t = us(), a = iS(), n = /* @__PURE__ */ new Set([
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
  function l(v, h = !0) {
    return typeof v == "boolean" ? !0 : h === !0 ? !i(v) : h ? u(v) <= h : !1;
  }
  ft.inlineRef = l;
  const r = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function i(v) {
    for (const h in v) {
      if (r.has(h))
        return !0;
      const g = v[h];
      if (Array.isArray(g) && g.some(i) || typeof g == "object" && i(g))
        return !0;
    }
    return !1;
  }
  function u(v) {
    let h = 0;
    for (const g in v) {
      if (g === "$ref")
        return 1 / 0;
      if (h++, !n.has(g) && (typeof v[g] == "object" && (0, e.eachItem)(v[g], (p) => h += u(p)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function o(v, h = "", g) {
    g !== !1 && (h = d(h));
    const p = v.parse(h);
    return c(v, p);
  }
  ft.getFullPath = o;
  function c(v, h) {
    return v.serialize(h).split("#")[0] + "#";
  }
  ft._getFullPath = c;
  const s = /#\/?$/;
  function d(v) {
    return v ? v.replace(s, "") : "";
  }
  ft.normalizeId = d;
  function f(v, h, g) {
    return g = d(g), v.resolve(h, g);
  }
  ft.resolveUrl = f;
  const m = /^[a-z_][-a-z0-9._]*$/i;
  function y(v, h) {
    if (typeof v == "boolean")
      return {};
    const { schemaId: g, uriResolver: p } = this.opts, E = d(v[g] || h), b = { "": E }, $ = o(p, E, !1), _ = {}, w = /* @__PURE__ */ new Set();
    return a(v, { allKeys: !0 }, (G, q, M, K) => {
      if (K === void 0)
        return;
      const k = $ + q;
      let F = b[K];
      typeof G[g] == "string" && (F = Y.call(this, G[g])), B.call(this, G.$anchor), B.call(this, G.$dynamicAnchor), b[q] = F;
      function Y(W) {
        const Z = this.opts.uriResolver.resolve;
        if (W = d(F ? Z(F, W) : W), w.has(W))
          throw P(W);
        w.add(W);
        let V = this.refs[W];
        return typeof V == "string" && (V = this.refs[V]), typeof V == "object" ? T(G, V.schema, W) : W !== d(k) && (W[0] === "#" ? (T(G, _[W], W), _[W] = G) : this.refs[W] = k), W;
      }
      function B(W) {
        if (typeof W == "string") {
          if (!m.test(W))
            throw new Error(`invalid anchor "${W}"`);
          Y.call(this, `#${W}`);
        }
      }
    }), _;
    function T(G, q, M) {
      if (q !== void 0 && !t(G, q))
        throw P(M);
    }
    function P(G) {
      return new Error(`reference "${G}" resolves to more than one schema`);
    }
  }
  return ft.getSchemaRefs = y, ft;
}
var km;
function gs() {
  if (km) return Xt;
  km = 1, Object.defineProperty(Xt, "__esModule", { value: !0 }), Xt.getData = Xt.KeywordCxt = Xt.validateFunctionCode = void 0;
  const e = eS(), t = Ya(), a = b0(), n = Ya(), l = tS(), r = rS(), i = nS(), u = De(), o = dr(), c = ms(), s = Ue(), d = ps();
  function f(A) {
    if ($(A) && (w(A), b(A))) {
      h(A);
      return;
    }
    m(A, () => (0, e.topBoolOrEmptySchema)(A));
  }
  Xt.validateFunctionCode = f;
  function m({ gen: A, validateName: L, schema: X, schemaEnv: J, opts: re }, fe) {
    re.code.es5 ? A.func(L, (0, u._)`${o.default.data}, ${o.default.valCxt}`, J.$async, () => {
      A.code((0, u._)`"use strict"; ${p(X, re)}`), v(A, re), A.code(fe);
    }) : A.func(L, (0, u._)`${o.default.data}, ${y(re)}`, J.$async, () => A.code(p(X, re)).code(fe));
  }
  function y(A) {
    return (0, u._)`{${o.default.instancePath}="", ${o.default.parentData}, ${o.default.parentDataProperty}, ${o.default.rootData}=${o.default.data}${A.dynamicRef ? (0, u._)`, ${o.default.dynamicAnchors}={}` : u.nil}}={}`;
  }
  function v(A, L) {
    A.if(o.default.valCxt, () => {
      A.var(o.default.instancePath, (0, u._)`${o.default.valCxt}.${o.default.instancePath}`), A.var(o.default.parentData, (0, u._)`${o.default.valCxt}.${o.default.parentData}`), A.var(o.default.parentDataProperty, (0, u._)`${o.default.valCxt}.${o.default.parentDataProperty}`), A.var(o.default.rootData, (0, u._)`${o.default.valCxt}.${o.default.rootData}`), L.dynamicRef && A.var(o.default.dynamicAnchors, (0, u._)`${o.default.valCxt}.${o.default.dynamicAnchors}`);
    }, () => {
      A.var(o.default.instancePath, (0, u._)`""`), A.var(o.default.parentData, (0, u._)`undefined`), A.var(o.default.parentDataProperty, (0, u._)`undefined`), A.var(o.default.rootData, o.default.data), L.dynamicRef && A.var(o.default.dynamicAnchors, (0, u._)`{}`);
    });
  }
  function h(A) {
    const { schema: L, opts: X, gen: J } = A;
    m(A, () => {
      X.$comment && L.$comment && K(A), G(A), J.let(o.default.vErrors, null), J.let(o.default.errors, 0), X.unevaluated && g(A), T(A), k(A);
    });
  }
  function g(A) {
    const { gen: L, validateName: X } = A;
    A.evaluated = L.const("evaluated", (0, u._)`${X}.evaluated`), L.if((0, u._)`${A.evaluated}.dynamicProps`, () => L.assign((0, u._)`${A.evaluated}.props`, (0, u._)`undefined`)), L.if((0, u._)`${A.evaluated}.dynamicItems`, () => L.assign((0, u._)`${A.evaluated}.items`, (0, u._)`undefined`));
  }
  function p(A, L) {
    const X = typeof A == "object" && A[L.schemaId];
    return X && (L.code.source || L.code.process) ? (0, u._)`/*# sourceURL=${X} */` : u.nil;
  }
  function E(A, L) {
    if ($(A) && (w(A), b(A))) {
      _(A, L);
      return;
    }
    (0, e.boolOrEmptySchema)(A, L);
  }
  function b({ schema: A, self: L }) {
    if (typeof A == "boolean")
      return !A;
    for (const X in A)
      if (L.RULES.all[X])
        return !0;
    return !1;
  }
  function $(A) {
    return typeof A.schema != "boolean";
  }
  function _(A, L) {
    const { schema: X, gen: J, opts: re } = A;
    re.$comment && X.$comment && K(A), q(A), M(A);
    const fe = J.const("_errs", o.default.errors);
    T(A, fe), J.var(L, (0, u._)`${fe} === ${o.default.errors}`);
  }
  function w(A) {
    (0, s.checkUnknownRules)(A), P(A);
  }
  function T(A, L) {
    if (A.opts.jtd)
      return Y(A, [], !1, L);
    const X = (0, t.getSchemaTypes)(A.schema), J = (0, t.coerceAndCheckDataType)(A, X);
    Y(A, X, !J, L);
  }
  function P(A) {
    const { schema: L, errSchemaPath: X, opts: J, self: re } = A;
    L.$ref && J.ignoreKeywordsWithRef && (0, s.schemaHasRulesButRef)(L, re.RULES) && re.logger.warn(`$ref: keywords ignored in schema at path "${X}"`);
  }
  function G(A) {
    const { schema: L, opts: X } = A;
    L.default !== void 0 && X.useDefaults && X.strictSchema && (0, s.checkStrictMode)(A, "default is ignored in the schema root");
  }
  function q(A) {
    const L = A.schema[A.opts.schemaId];
    L && (A.baseId = (0, c.resolveUrl)(A.opts.uriResolver, A.baseId, L));
  }
  function M(A) {
    if (A.schema.$async && !A.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function K({ gen: A, schemaEnv: L, schema: X, errSchemaPath: J, opts: re }) {
    const fe = X.$comment;
    if (re.$comment === !0)
      A.code((0, u._)`${o.default.self}.logger.log(${fe})`);
    else if (typeof re.$comment == "function") {
      const ye = (0, u.str)`${J}/$comment`, Ie = A.scopeValue("root", { ref: L.root });
      A.code((0, u._)`${o.default.self}.opts.$comment(${fe}, ${ye}, ${Ie}.schema)`);
    }
  }
  function k(A) {
    const { gen: L, schemaEnv: X, validateName: J, ValidationError: re, opts: fe } = A;
    X.$async ? L.if((0, u._)`${o.default.errors} === 0`, () => L.return(o.default.data), () => L.throw((0, u._)`new ${re}(${o.default.vErrors})`)) : (L.assign((0, u._)`${J}.errors`, o.default.vErrors), fe.unevaluated && F(A), L.return((0, u._)`${o.default.errors} === 0`));
  }
  function F({ gen: A, evaluated: L, props: X, items: J }) {
    X instanceof u.Name && A.assign((0, u._)`${L}.props`, X), J instanceof u.Name && A.assign((0, u._)`${L}.items`, J);
  }
  function Y(A, L, X, J) {
    const { gen: re, schema: fe, data: ye, allErrors: Ie, opts: ke, self: Oe } = A, { RULES: Se } = Oe;
    if (fe.$ref && (ke.ignoreKeywordsWithRef || !(0, s.schemaHasRulesButRef)(fe, Se))) {
      re.block(() => O(A, "$ref", Se.all.$ref.definition));
      return;
    }
    ke.jtd || W(A, L), re.block(() => {
      for (const te of Se.rules)
        S(te);
      S(Se.post);
    });
    function S(te) {
      (0, a.shouldUseGroup)(fe, te) && (te.type ? (re.if((0, n.checkDataType)(te.type, ye, ke.strictNumbers)), B(A, te), L.length === 1 && L[0] === te.type && X && (re.else(), (0, n.reportTypeError)(A)), re.endIf()) : B(A, te), Ie || re.if((0, u._)`${o.default.errors} === ${J || 0}`));
    }
  }
  function B(A, L) {
    const { gen: X, schema: J, opts: { useDefaults: re } } = A;
    re && (0, l.assignDefaults)(A, L.type), X.block(() => {
      for (const fe of L.rules)
        (0, a.shouldUseRule)(J, fe) && O(A, fe.keyword, fe.definition, L.type);
    });
  }
  function W(A, L) {
    A.schemaEnv.meta || !A.opts.strictTypes || (Z(A, L), A.opts.allowUnionTypes || V(A, L), C(A, A.dataTypes));
  }
  function Z(A, L) {
    if (L.length) {
      if (!A.dataTypes.length) {
        A.dataTypes = L;
        return;
      }
      L.forEach((X) => {
        D(A.dataTypes, X) || N(A, `type "${X}" not allowed by context "${A.dataTypes.join(",")}"`);
      }), R(A, L);
    }
  }
  function V(A, L) {
    L.length > 1 && !(L.length === 2 && L.includes("null")) && N(A, "use allowUnionTypes to allow union type keyword");
  }
  function C(A, L) {
    const X = A.self.RULES.all;
    for (const J in X) {
      const re = X[J];
      if (typeof re == "object" && (0, a.shouldUseRule)(A.schema, re)) {
        const { type: fe } = re.definition;
        fe.length && !fe.some((ye) => j(L, ye)) && N(A, `missing type "${fe.join(",")}" for keyword "${J}"`);
      }
    }
  }
  function j(A, L) {
    return A.includes(L) || L === "number" && A.includes("integer");
  }
  function D(A, L) {
    return A.includes(L) || L === "integer" && A.includes("number");
  }
  function R(A, L) {
    const X = [];
    for (const J of A.dataTypes)
      D(L, J) ? X.push(J) : L.includes("integer") && J === "number" && X.push("integer");
    A.dataTypes = X;
  }
  function N(A, L) {
    const X = A.schemaEnv.baseId + A.errSchemaPath;
    L += ` at "${X}" (strictTypes)`, (0, s.checkStrictMode)(A, L, A.opts.strictTypes);
  }
  class x {
    constructor(L, X, J) {
      if ((0, r.validateKeywordUsage)(L, X, J), this.gen = L.gen, this.allErrors = L.allErrors, this.keyword = J, this.data = L.data, this.schema = L.schema[J], this.$data = X.$data && L.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, s.schemaRefOrVal)(L, this.schema, J, this.$data), this.schemaType = X.schemaType, this.parentSchema = L.schema, this.params = {}, this.it = L, this.def = X, this.$data)
        this.schemaCode = L.gen.const("vSchema", H(this.$data, L));
      else if (this.schemaCode = this.schemaValue, !(0, r.validSchemaType)(this.schema, X.schemaType, X.allowUndefined))
        throw new Error(`${J} value must be ${JSON.stringify(X.schemaType)}`);
      ("code" in X ? X.trackErrors : X.errors !== !1) && (this.errsCount = L.gen.const("_errs", o.default.errors));
    }
    result(L, X, J) {
      this.failResult((0, u.not)(L), X, J);
    }
    failResult(L, X, J) {
      this.gen.if(L), J ? J() : this.error(), X ? (this.gen.else(), X(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(L, X) {
      this.failResult((0, u.not)(L), void 0, X);
    }
    fail(L) {
      if (L === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(L), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(L) {
      if (!this.$data)
        return this.fail(L);
      const { schemaCode: X } = this;
      this.fail((0, u._)`${X} !== undefined && (${(0, u.or)(this.invalid$data(), L)})`);
    }
    error(L, X, J) {
      if (X) {
        this.setParams(X), this._error(L, J), this.setParams({});
        return;
      }
      this._error(L, J);
    }
    _error(L, X) {
      (L ? d.reportExtraError : d.reportError)(this, this.def.error, X);
    }
    $dataError() {
      (0, d.reportError)(this, this.def.$dataError || d.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, d.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(L) {
      this.allErrors || this.gen.if(L);
    }
    setParams(L, X) {
      X ? Object.assign(this.params, L) : this.params = L;
    }
    block$data(L, X, J = u.nil) {
      this.gen.block(() => {
        this.check$data(L, J), X();
      });
    }
    check$data(L = u.nil, X = u.nil) {
      if (!this.$data)
        return;
      const { gen: J, schemaCode: re, schemaType: fe, def: ye } = this;
      J.if((0, u.or)((0, u._)`${re} === undefined`, X)), L !== u.nil && J.assign(L, !0), (fe.length || ye.validateSchema) && (J.elseIf(this.invalid$data()), this.$dataError(), L !== u.nil && J.assign(L, !1)), J.else();
    }
    invalid$data() {
      const { gen: L, schemaCode: X, schemaType: J, def: re, it: fe } = this;
      return (0, u.or)(ye(), Ie());
      function ye() {
        if (J.length) {
          if (!(X instanceof u.Name))
            throw new Error("ajv implementation error");
          const ke = Array.isArray(J) ? J : [J];
          return (0, u._)`${(0, n.checkDataTypes)(ke, X, fe.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return u.nil;
      }
      function Ie() {
        if (re.validateSchema) {
          const ke = L.scopeValue("validate$data", { ref: re.validateSchema });
          return (0, u._)`!${ke}(${X})`;
        }
        return u.nil;
      }
    }
    subschema(L, X) {
      const J = (0, i.getSubschema)(this.it, L);
      (0, i.extendSubschemaData)(J, this.it, L), (0, i.extendSubschemaMode)(J, L);
      const re = { ...this.it, ...J, items: void 0, props: void 0 };
      return E(re, X), re;
    }
    mergeEvaluated(L, X) {
      const { it: J, gen: re } = this;
      J.opts.unevaluated && (J.props !== !0 && L.props !== void 0 && (J.props = s.mergeEvaluated.props(re, L.props, J.props, X)), J.items !== !0 && L.items !== void 0 && (J.items = s.mergeEvaluated.items(re, L.items, J.items, X)));
    }
    mergeValidEvaluated(L, X) {
      const { it: J, gen: re } = this;
      if (J.opts.unevaluated && (J.props !== !0 || J.items !== !0))
        return re.if(X, () => this.mergeEvaluated(L, u.Name)), !0;
    }
  }
  Xt.KeywordCxt = x;
  function O(A, L, X, J) {
    const re = new x(A, X, L);
    "code" in X ? X.code(re, J) : re.$data && X.validate ? (0, r.funcKeywordCode)(re, X) : "macro" in X ? (0, r.macroKeywordCode)(re, X) : (X.compile || X.validate) && (0, r.funcKeywordCode)(re, X);
  }
  const I = /^\/(?:[^~]|~0|~1)*$/, Q = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function H(A, { dataLevel: L, dataNames: X, dataPathArr: J }) {
    let re, fe;
    if (A === "")
      return o.default.rootData;
    if (A[0] === "/") {
      if (!I.test(A))
        throw new Error(`Invalid JSON-pointer: ${A}`);
      re = A, fe = o.default.rootData;
    } else {
      const Oe = Q.exec(A);
      if (!Oe)
        throw new Error(`Invalid JSON-pointer: ${A}`);
      const Se = +Oe[1];
      if (re = Oe[2], re === "#") {
        if (Se >= L)
          throw new Error(ke("property/index", Se));
        return J[L - Se];
      }
      if (Se > L)
        throw new Error(ke("data", Se));
      if (fe = X[L - Se], !re)
        return fe;
    }
    let ye = fe;
    const Ie = re.split("/");
    for (const Oe of Ie)
      Oe && (fe = (0, u._)`${fe}${(0, u.getProperty)((0, s.unescapeJsonPointer)(Oe))}`, ye = (0, u._)`${ye} && ${fe}`);
    return ye;
    function ke(Oe, Se) {
      return `Cannot access ${Oe} ${Se} levels up, current level is ${L}`;
    }
  }
  return Xt.getData = H, Xt;
}
var ia = {}, Lm;
function pl() {
  if (Lm) return ia;
  Lm = 1, Object.defineProperty(ia, "__esModule", { value: !0 });
  class e extends Error {
    constructor(a) {
      super("validation failed"), this.errors = a, this.ajv = this.validation = !0;
    }
  }
  return ia.default = e, ia;
}
var aa = {}, qm;
function ys() {
  if (qm) return aa;
  qm = 1, Object.defineProperty(aa, "__esModule", { value: !0 });
  const e = ms();
  class t extends Error {
    constructor(n, l, r, i) {
      super(i || `can't resolve reference ${r} from id ${l}`), this.missingRef = (0, e.resolveUrl)(n, l, r), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return aa.default = t, aa;
}
var Et = {}, Fm;
function ml() {
  if (Fm) return Et;
  Fm = 1, Object.defineProperty(Et, "__esModule", { value: !0 }), Et.resolveSchema = Et.getCompilingSchema = Et.resolveRef = Et.compileSchema = Et.SchemaEnv = void 0;
  const e = De(), t = pl(), a = dr(), n = ms(), l = Ue(), r = gs();
  class i {
    constructor(g) {
      var p;
      this.refs = {}, this.dynamicAnchors = {};
      let E;
      typeof g.schema == "object" && (E = g.schema), this.schema = g.schema, this.schemaId = g.schemaId, this.root = g.root || this, this.baseId = (p = g.baseId) !== null && p !== void 0 ? p : (0, n.normalizeId)(E?.[g.schemaId || "$id"]), this.schemaPath = g.schemaPath, this.localRefs = g.localRefs, this.meta = g.meta, this.$async = E?.$async, this.refs = {};
    }
  }
  Et.SchemaEnv = i;
  function u(h) {
    const g = s.call(this, h);
    if (g)
      return g;
    const p = (0, n.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: E, lines: b } = this.opts.code, { ownProperties: $ } = this.opts, _ = new e.CodeGen(this.scope, { es5: E, lines: b, ownProperties: $ });
    let w;
    h.$async && (w = _.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const T = _.scopeName("validate");
    h.validateName = T;
    const P = {
      gen: _,
      allErrors: this.opts.allErrors,
      data: a.default.data,
      parentData: a.default.parentData,
      parentDataProperty: a.default.parentDataProperty,
      dataNames: [a.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: _.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: T,
      ValidationError: w,
      schema: h.schema,
      schemaEnv: h,
      rootId: p,
      baseId: h.baseId || p,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let G;
    try {
      this._compilations.add(h), (0, r.validateFunctionCode)(P), _.optimize(this.opts.code.optimize);
      const q = _.toString();
      G = `${_.scopeRefs(a.default.scope)}return ${q}`, this.opts.code.process && (G = this.opts.code.process(G, h));
      const K = new Function(`${a.default.self}`, `${a.default.scope}`, G)(this, this.scope.get());
      if (this.scope.value(T, { ref: K }), K.errors = null, K.schema = h.schema, K.schemaEnv = h, h.$async && (K.$async = !0), this.opts.code.source === !0 && (K.source = { validateName: T, validateCode: q, scopeValues: _._values }), this.opts.unevaluated) {
        const { props: k, items: F } = P;
        K.evaluated = {
          props: k instanceof e.Name ? void 0 : k,
          items: F instanceof e.Name ? void 0 : F,
          dynamicProps: k instanceof e.Name,
          dynamicItems: F instanceof e.Name
        }, K.source && (K.source.evaluated = (0, e.stringify)(K.evaluated));
      }
      return h.validate = K, h;
    } catch (q) {
      throw delete h.validate, delete h.validateName, G && this.logger.error("Error compiling schema, function code:", G), q;
    } finally {
      this._compilations.delete(h);
    }
  }
  Et.compileSchema = u;
  function o(h, g, p) {
    var E;
    p = (0, n.resolveUrl)(this.opts.uriResolver, g, p);
    const b = h.refs[p];
    if (b)
      return b;
    let $ = f.call(this, h, p);
    if ($ === void 0) {
      const _ = (E = h.localRefs) === null || E === void 0 ? void 0 : E[p], { schemaId: w } = this.opts;
      _ && ($ = new i({ schema: _, schemaId: w, root: h, baseId: g }));
    }
    if ($ !== void 0)
      return h.refs[p] = c.call(this, $);
  }
  Et.resolveRef = o;
  function c(h) {
    return (0, n.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : u.call(this, h);
  }
  function s(h) {
    for (const g of this._compilations)
      if (d(g, h))
        return g;
  }
  Et.getCompilingSchema = s;
  function d(h, g) {
    return h.schema === g.schema && h.root === g.root && h.baseId === g.baseId;
  }
  function f(h, g) {
    let p;
    for (; typeof (p = this.refs[g]) == "string"; )
      g = p;
    return p || this.schemas[g] || m.call(this, h, g);
  }
  function m(h, g) {
    const p = this.opts.uriResolver.parse(g), E = (0, n._getFullPath)(this.opts.uriResolver, p);
    let b = (0, n.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && E === b)
      return v.call(this, p, h);
    const $ = (0, n.normalizeId)(E), _ = this.refs[$] || this.schemas[$];
    if (typeof _ == "string") {
      const w = m.call(this, h, _);
      return typeof w?.schema != "object" ? void 0 : v.call(this, p, w);
    }
    if (typeof _?.schema == "object") {
      if (_.validate || u.call(this, _), $ === (0, n.normalizeId)(g)) {
        const { schema: w } = _, { schemaId: T } = this.opts, P = w[T];
        return P && (b = (0, n.resolveUrl)(this.opts.uriResolver, b, P)), new i({ schema: w, schemaId: T, root: h, baseId: b });
      }
      return v.call(this, p, _);
    }
  }
  Et.resolveSchema = m;
  const y = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function v(h, { baseId: g, schema: p, root: E }) {
    var b;
    if (((b = h.fragment) === null || b === void 0 ? void 0 : b[0]) !== "/")
      return;
    for (const w of h.fragment.slice(1).split("/")) {
      if (typeof p == "boolean")
        return;
      const T = p[(0, l.unescapeFragment)(w)];
      if (T === void 0)
        return;
      p = T;
      const P = typeof p == "object" && p[this.opts.schemaId];
      !y.has(w) && P && (g = (0, n.resolveUrl)(this.opts.uriResolver, g, P));
    }
    let $;
    if (typeof p != "boolean" && p.$ref && !(0, l.schemaHasRulesButRef)(p, this.RULES)) {
      const w = (0, n.resolveUrl)(this.opts.uriResolver, g, p.$ref);
      $ = m.call(this, E, w);
    }
    const { schemaId: _ } = this.opts;
    if ($ = $ || new i({ schema: p, schemaId: _, root: E, baseId: g }), $.schema !== $.root.schema)
      return $;
  }
  return Et;
}
const aS = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", sS = "Meta-schema for $data reference (JSON AnySchema extension proposal)", oS = "object", cS = ["$data"], uS = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, lS = !1, fS = {
  $id: aS,
  description: sS,
  type: oS,
  required: cS,
  properties: uS,
  additionalProperties: lS
};
var sa = {}, Um;
function dS() {
  if (Um) return sa;
  Um = 1, Object.defineProperty(sa, "__esModule", { value: !0 });
  const e = y0();
  return e.code = 'require("ajv/dist/runtime/uri").default', sa.default = e, sa;
}
var jm;
function hS() {
  return jm || (jm = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = gs();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var a = De();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return a._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return a.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return a.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return a.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return a.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return a.CodeGen;
    } });
    const n = pl(), l = ys(), r = S0(), i = ml(), u = De(), o = ms(), c = Ya(), s = Ue(), d = fS, f = dS(), m = (V, C) => new RegExp(V, C);
    m.code = "new RegExp";
    const y = ["removeAdditional", "useDefaults", "coerceTypes"], v = /* @__PURE__ */ new Set([
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
    ]), h = {
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
    }, g = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, p = 200;
    function E(V) {
      var C, j, D, R, N, x, O, I, Q, H, A, L, X, J, re, fe, ye, Ie, ke, Oe, Se, S, te, ie, pe;
      const ae = V.strict, de = (C = V.code) === null || C === void 0 ? void 0 : C.optimize, le = de === !0 || de === void 0 ? 1 : de || 0, me = (D = (j = V.code) === null || j === void 0 ? void 0 : j.regExp) !== null && D !== void 0 ? D : m, ve = (R = V.uriResolver) !== null && R !== void 0 ? R : f.default;
      return {
        strictSchema: (x = (N = V.strictSchema) !== null && N !== void 0 ? N : ae) !== null && x !== void 0 ? x : !0,
        strictNumbers: (I = (O = V.strictNumbers) !== null && O !== void 0 ? O : ae) !== null && I !== void 0 ? I : !0,
        strictTypes: (H = (Q = V.strictTypes) !== null && Q !== void 0 ? Q : ae) !== null && H !== void 0 ? H : "log",
        strictTuples: (L = (A = V.strictTuples) !== null && A !== void 0 ? A : ae) !== null && L !== void 0 ? L : "log",
        strictRequired: (J = (X = V.strictRequired) !== null && X !== void 0 ? X : ae) !== null && J !== void 0 ? J : !1,
        code: V.code ? { ...V.code, optimize: le, regExp: me } : { optimize: le, regExp: me },
        loopRequired: (re = V.loopRequired) !== null && re !== void 0 ? re : p,
        loopEnum: (fe = V.loopEnum) !== null && fe !== void 0 ? fe : p,
        meta: (ye = V.meta) !== null && ye !== void 0 ? ye : !0,
        messages: (Ie = V.messages) !== null && Ie !== void 0 ? Ie : !0,
        inlineRefs: (ke = V.inlineRefs) !== null && ke !== void 0 ? ke : !0,
        schemaId: (Oe = V.schemaId) !== null && Oe !== void 0 ? Oe : "$id",
        addUsedSchema: (Se = V.addUsedSchema) !== null && Se !== void 0 ? Se : !0,
        validateSchema: (S = V.validateSchema) !== null && S !== void 0 ? S : !0,
        validateFormats: (te = V.validateFormats) !== null && te !== void 0 ? te : !0,
        unicodeRegExp: (ie = V.unicodeRegExp) !== null && ie !== void 0 ? ie : !0,
        int32range: (pe = V.int32range) !== null && pe !== void 0 ? pe : !0,
        uriResolver: ve
      };
    }
    class b {
      constructor(C = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), C = this.opts = { ...C, ...E(C) };
        const { es5: j, lines: D } = this.opts.code;
        this.scope = new u.ValueScope({ scope: {}, prefixes: v, es5: j, lines: D }), this.logger = M(C.logger);
        const R = C.validateFormats;
        C.validateFormats = !1, this.RULES = (0, r.getRules)(), $.call(this, h, C, "NOT SUPPORTED"), $.call(this, g, C, "DEPRECATED", "warn"), this._metaOpts = G.call(this), C.formats && T.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), C.keywords && P.call(this, C.keywords), typeof C.meta == "object" && this.addMetaSchema(C.meta), w.call(this), C.validateFormats = R;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: C, meta: j, schemaId: D } = this.opts;
        let R = d;
        D === "id" && (R = { ...d }, R.id = R.$id, delete R.$id), j && C && this.addMetaSchema(R, R[D], !1);
      }
      defaultMeta() {
        const { meta: C, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof C == "object" ? C[j] || C : void 0;
      }
      validate(C, j) {
        let D;
        if (typeof C == "string") {
          if (D = this.getSchema(C), !D)
            throw new Error(`no schema with key or ref "${C}"`);
        } else
          D = this.compile(C);
        const R = D(j);
        return "$async" in D || (this.errors = D.errors), R;
      }
      compile(C, j) {
        const D = this._addSchema(C, j);
        return D.validate || this._compileSchemaEnv(D);
      }
      compileAsync(C, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: D } = this.opts;
        return R.call(this, C, j);
        async function R(H, A) {
          await N.call(this, H.$schema);
          const L = this._addSchema(H, A);
          return L.validate || x.call(this, L);
        }
        async function N(H) {
          H && !this.getSchema(H) && await R.call(this, { $ref: H }, !0);
        }
        async function x(H) {
          try {
            return this._compileSchemaEnv(H);
          } catch (A) {
            if (!(A instanceof l.default))
              throw A;
            return O.call(this, A), await I.call(this, A.missingSchema), x.call(this, H);
          }
        }
        function O({ missingSchema: H, missingRef: A }) {
          if (this.refs[H])
            throw new Error(`AnySchema ${H} is loaded but ${A} cannot be resolved`);
        }
        async function I(H) {
          const A = await Q.call(this, H);
          this.refs[H] || await N.call(this, A.$schema), this.refs[H] || this.addSchema(A, H, j);
        }
        async function Q(H) {
          const A = this._loading[H];
          if (A)
            return A;
          try {
            return await (this._loading[H] = D(H));
          } finally {
            delete this._loading[H];
          }
        }
      }
      // Adds schema to the instance
      addSchema(C, j, D, R = this.opts.validateSchema) {
        if (Array.isArray(C)) {
          for (const x of C)
            this.addSchema(x, void 0, D, R);
          return this;
        }
        let N;
        if (typeof C == "object") {
          const { schemaId: x } = this.opts;
          if (N = C[x], N !== void 0 && typeof N != "string")
            throw new Error(`schema ${x} must be string`);
        }
        return j = (0, o.normalizeId)(j || N), this._checkUnique(j), this.schemas[j] = this._addSchema(C, D, j, R, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(C, j, D = this.opts.validateSchema) {
        return this.addSchema(C, j, !0, D), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(C, j) {
        if (typeof C == "boolean")
          return !0;
        let D;
        if (D = C.$schema, D !== void 0 && typeof D != "string")
          throw new Error("$schema must be a string");
        if (D = D || this.opts.defaultMeta || this.defaultMeta(), !D)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const R = this.validate(D, C);
        if (!R && j) {
          const N = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(N);
          else
            throw new Error(N);
        }
        return R;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(C) {
        let j;
        for (; typeof (j = _.call(this, C)) == "string"; )
          C = j;
        if (j === void 0) {
          const { schemaId: D } = this.opts, R = new i.SchemaEnv({ schema: {}, schemaId: D });
          if (j = i.resolveSchema.call(this, R, C), !j)
            return;
          this.refs[C] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(C) {
        if (C instanceof RegExp)
          return this._removeAllSchemas(this.schemas, C), this._removeAllSchemas(this.refs, C), this;
        switch (typeof C) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = _.call(this, C);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[C], delete this.refs[C], this;
          }
          case "object": {
            const j = C;
            this._cache.delete(j);
            let D = C[this.opts.schemaId];
            return D && (D = (0, o.normalizeId)(D), delete this.schemas[D], delete this.refs[D]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(C) {
        for (const j of C)
          this.addKeyword(j);
        return this;
      }
      addKeyword(C, j) {
        let D;
        if (typeof C == "string")
          D = C, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = D);
        else if (typeof C == "object" && j === void 0) {
          if (j = C, D = j.keyword, Array.isArray(D) && !D.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (k.call(this, D, j), !j)
          return (0, s.eachItem)(D, (N) => F.call(this, N)), this;
        B.call(this, j);
        const R = {
          ...j,
          type: (0, c.getJSONTypes)(j.type),
          schemaType: (0, c.getJSONTypes)(j.schemaType)
        };
        return (0, s.eachItem)(D, R.type.length === 0 ? (N) => F.call(this, N, R) : (N) => R.type.forEach((x) => F.call(this, N, R, x))), this;
      }
      getKeyword(C) {
        const j = this.RULES.all[C];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(C) {
        const { RULES: j } = this;
        delete j.keywords[C], delete j.all[C];
        for (const D of j.rules) {
          const R = D.rules.findIndex((N) => N.keyword === C);
          R >= 0 && D.rules.splice(R, 1);
        }
        return this;
      }
      // Add format
      addFormat(C, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[C] = j, this;
      }
      errorsText(C = this.errors, { separator: j = ", ", dataVar: D = "data" } = {}) {
        return !C || C.length === 0 ? "No errors" : C.map((R) => `${D}${R.instancePath} ${R.message}`).reduce((R, N) => R + j + N);
      }
      $dataMetaSchema(C, j) {
        const D = this.RULES.all;
        C = JSON.parse(JSON.stringify(C));
        for (const R of j) {
          const N = R.split("/").slice(1);
          let x = C;
          for (const O of N)
            x = x[O];
          for (const O in D) {
            const I = D[O];
            if (typeof I != "object")
              continue;
            const { $data: Q } = I.definition, H = x[O];
            Q && H && (x[O] = Z(H));
          }
        }
        return C;
      }
      _removeAllSchemas(C, j) {
        for (const D in C) {
          const R = C[D];
          (!j || j.test(D)) && (typeof R == "string" ? delete C[D] : R && !R.meta && (this._cache.delete(R.schema), delete C[D]));
        }
      }
      _addSchema(C, j, D, R = this.opts.validateSchema, N = this.opts.addUsedSchema) {
        let x;
        const { schemaId: O } = this.opts;
        if (typeof C == "object")
          x = C[O];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof C != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let I = this._cache.get(C);
        if (I !== void 0)
          return I;
        D = (0, o.normalizeId)(x || D);
        const Q = o.getSchemaRefs.call(this, C, D);
        return I = new i.SchemaEnv({ schema: C, schemaId: O, meta: j, baseId: D, localRefs: Q }), this._cache.set(I.schema, I), N && !D.startsWith("#") && (D && this._checkUnique(D), this.refs[D] = I), R && this.validateSchema(C, !0), I;
      }
      _checkUnique(C) {
        if (this.schemas[C] || this.refs[C])
          throw new Error(`schema with key or id "${C}" already exists`);
      }
      _compileSchemaEnv(C) {
        if (C.meta ? this._compileMetaSchema(C) : i.compileSchema.call(this, C), !C.validate)
          throw new Error("ajv implementation error");
        return C.validate;
      }
      _compileMetaSchema(C) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          i.compileSchema.call(this, C);
        } finally {
          this.opts = j;
        }
      }
    }
    b.ValidationError = n.default, b.MissingRefError = l.default, e.default = b;
    function $(V, C, j, D = "error") {
      for (const R in V) {
        const N = R;
        N in C && this.logger[D](`${j}: option ${R}. ${V[N]}`);
      }
    }
    function _(V) {
      return V = (0, o.normalizeId)(V), this.schemas[V] || this.refs[V];
    }
    function w() {
      const V = this.opts.schemas;
      if (V)
        if (Array.isArray(V))
          this.addSchema(V);
        else
          for (const C in V)
            this.addSchema(V[C], C);
    }
    function T() {
      for (const V in this.opts.formats) {
        const C = this.opts.formats[V];
        C && this.addFormat(V, C);
      }
    }
    function P(V) {
      if (Array.isArray(V)) {
        this.addVocabulary(V);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const C in V) {
        const j = V[C];
        j.keyword || (j.keyword = C), this.addKeyword(j);
      }
    }
    function G() {
      const V = { ...this.opts };
      for (const C of y)
        delete V[C];
      return V;
    }
    const q = { log() {
    }, warn() {
    }, error() {
    } };
    function M(V) {
      if (V === !1)
        return q;
      if (V === void 0)
        return console;
      if (V.log && V.warn && V.error)
        return V;
      throw new Error("logger must implement log, warn and error methods");
    }
    const K = /^[a-z_$][a-z0-9_$:-]*$/i;
    function k(V, C) {
      const { RULES: j } = this;
      if ((0, s.eachItem)(V, (D) => {
        if (j.keywords[D])
          throw new Error(`Keyword ${D} is already defined`);
        if (!K.test(D))
          throw new Error(`Keyword ${D} has invalid name`);
      }), !!C && C.$data && !("code" in C || "validate" in C))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function F(V, C, j) {
      var D;
      const R = C?.post;
      if (j && R)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: N } = this;
      let x = R ? N.post : N.rules.find(({ type: I }) => I === j);
      if (x || (x = { type: j, rules: [] }, N.rules.push(x)), N.keywords[V] = !0, !C)
        return;
      const O = {
        keyword: V,
        definition: {
          ...C,
          type: (0, c.getJSONTypes)(C.type),
          schemaType: (0, c.getJSONTypes)(C.schemaType)
        }
      };
      C.before ? Y.call(this, x, O, C.before) : x.rules.push(O), N.all[V] = O, (D = C.implements) === null || D === void 0 || D.forEach((I) => this.addKeyword(I));
    }
    function Y(V, C, j) {
      const D = V.rules.findIndex((R) => R.keyword === j);
      D >= 0 ? V.rules.splice(D, 0, C) : (V.rules.push(C), this.logger.warn(`rule ${j} is not defined`));
    }
    function B(V) {
      let { metaSchema: C } = V;
      C !== void 0 && (V.$data && this.opts.$data && (C = Z(C)), V.validateSchema = this.compile(C, !0));
    }
    const W = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function Z(V) {
      return { anyOf: [V, W] };
    }
  })(Mc)), Mc;
}
var oa = {}, ca = {}, ua = {}, Mm;
function pS() {
  if (Mm) return ua;
  Mm = 1, Object.defineProperty(ua, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return ua.default = e, ua;
}
var or = {}, xm;
function mS() {
  if (xm) return or;
  xm = 1, Object.defineProperty(or, "__esModule", { value: !0 }), or.callRef = or.getValidate = void 0;
  const e = ys(), t = qt(), a = De(), n = dr(), l = ml(), r = Ue(), i = {
    keyword: "$ref",
    schemaType: "string",
    code(c) {
      const { gen: s, schema: d, it: f } = c, { baseId: m, schemaEnv: y, validateName: v, opts: h, self: g } = f, { root: p } = y;
      if ((d === "#" || d === "#/") && m === p.baseId)
        return b();
      const E = l.resolveRef.call(g, p, m, d);
      if (E === void 0)
        throw new e.default(f.opts.uriResolver, m, d);
      if (E instanceof l.SchemaEnv)
        return $(E);
      return _(E);
      function b() {
        if (y === p)
          return o(c, v, y, y.$async);
        const w = s.scopeValue("root", { ref: p });
        return o(c, (0, a._)`${w}.validate`, p, p.$async);
      }
      function $(w) {
        const T = u(c, w);
        o(c, T, w, w.$async);
      }
      function _(w) {
        const T = s.scopeValue("schema", h.code.source === !0 ? { ref: w, code: (0, a.stringify)(w) } : { ref: w }), P = s.name("valid"), G = c.subschema({
          schema: w,
          dataTypes: [],
          schemaPath: a.nil,
          topSchemaRef: T,
          errSchemaPath: d
        }, P);
        c.mergeEvaluated(G), c.ok(P);
      }
    }
  };
  function u(c, s) {
    const { gen: d } = c;
    return s.validate ? d.scopeValue("validate", { ref: s.validate }) : (0, a._)`${d.scopeValue("wrapper", { ref: s })}.validate`;
  }
  or.getValidate = u;
  function o(c, s, d, f) {
    const { gen: m, it: y } = c, { allErrors: v, schemaEnv: h, opts: g } = y, p = g.passContext ? n.default.this : a.nil;
    f ? E() : b();
    function E() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const w = m.let("valid");
      m.try(() => {
        m.code((0, a._)`await ${(0, t.callValidateCode)(c, s, p)}`), _(s), v || m.assign(w, !0);
      }, (T) => {
        m.if((0, a._)`!(${T} instanceof ${y.ValidationError})`, () => m.throw(T)), $(T), v || m.assign(w, !1);
      }), c.ok(w);
    }
    function b() {
      c.result((0, t.callValidateCode)(c, s, p), () => _(s), () => $(s));
    }
    function $(w) {
      const T = (0, a._)`${w}.errors`;
      m.assign(n.default.vErrors, (0, a._)`${n.default.vErrors} === null ? ${T} : ${n.default.vErrors}.concat(${T})`), m.assign(n.default.errors, (0, a._)`${n.default.vErrors}.length`);
    }
    function _(w) {
      var T;
      if (!y.opts.unevaluated)
        return;
      const P = (T = d?.validate) === null || T === void 0 ? void 0 : T.evaluated;
      if (y.props !== !0)
        if (P && !P.dynamicProps)
          P.props !== void 0 && (y.props = r.mergeEvaluated.props(m, P.props, y.props));
        else {
          const G = m.var("props", (0, a._)`${w}.evaluated.props`);
          y.props = r.mergeEvaluated.props(m, G, y.props, a.Name);
        }
      if (y.items !== !0)
        if (P && !P.dynamicItems)
          P.items !== void 0 && (y.items = r.mergeEvaluated.items(m, P.items, y.items));
        else {
          const G = m.var("items", (0, a._)`${w}.evaluated.items`);
          y.items = r.mergeEvaluated.items(m, G, y.items, a.Name);
        }
    }
  }
  return or.callRef = o, or.default = i, or;
}
var Vm;
function gS() {
  if (Vm) return ca;
  Vm = 1, Object.defineProperty(ca, "__esModule", { value: !0 });
  const e = pS(), t = mS(), a = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return ca.default = a, ca;
}
var la = {}, fa = {}, Gm;
function yS() {
  if (Gm) return fa;
  Gm = 1, Object.defineProperty(fa, "__esModule", { value: !0 });
  const e = De(), t = e.operators, a = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: r, schemaCode: i }) => (0, e.str)`must be ${a[r].okStr} ${i}`,
    params: ({ keyword: r, schemaCode: i }) => (0, e._)`{comparison: ${a[r].okStr}, limit: ${i}}`
  }, l = {
    keyword: Object.keys(a),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(r) {
      const { keyword: i, data: u, schemaCode: o } = r;
      r.fail$data((0, e._)`${u} ${a[i].fail} ${o} || isNaN(${u})`);
    }
  };
  return fa.default = l, fa;
}
var da = {}, Bm;
function vS() {
  if (Bm) return da;
  Bm = 1, Object.defineProperty(da, "__esModule", { value: !0 });
  const e = De(), a = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: l, data: r, schemaCode: i, it: u } = n, o = u.opts.multipleOfPrecision, c = l.let("res"), s = o ? (0, e._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${o}` : (0, e._)`${c} !== parseInt(${c})`;
      n.fail$data((0, e._)`(${i} === 0 || (${c} = ${r}/${i}, ${s}))`);
    }
  };
  return da.default = a, da;
}
var ha = {}, pa = {}, Hm;
function _S() {
  if (Hm) return pa;
  Hm = 1, Object.defineProperty(pa, "__esModule", { value: !0 });
  function e(t) {
    const a = t.length;
    let n = 0, l = 0, r;
    for (; l < a; )
      n++, r = t.charCodeAt(l++), r >= 55296 && r <= 56319 && l < a && (r = t.charCodeAt(l), (r & 64512) === 56320 && l++);
    return n;
  }
  return pa.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', pa;
}
var zm;
function ES() {
  if (zm) return ha;
  zm = 1, Object.defineProperty(ha, "__esModule", { value: !0 });
  const e = De(), t = Ue(), a = _S(), l = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: r, schemaCode: i }) {
        const u = r === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${u} than ${i} characters`;
      },
      params: ({ schemaCode: r }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { keyword: i, data: u, schemaCode: o, it: c } = r, s = i === "maxLength" ? e.operators.GT : e.operators.LT, d = c.opts.unicode === !1 ? (0, e._)`${u}.length` : (0, e._)`${(0, t.useFunc)(r.gen, a.default)}(${u})`;
      r.fail$data((0, e._)`${d} ${s} ${o}`);
    }
  };
  return ha.default = l, ha;
}
var ma = {}, Km;
function wS() {
  if (Km) return ma;
  Km = 1, Object.defineProperty(ma, "__esModule", { value: !0 });
  const e = qt(), t = De(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: l }) => (0, t.str)`must match pattern "${l}"`,
      params: ({ schemaCode: l }) => (0, t._)`{pattern: ${l}}`
    },
    code(l) {
      const { data: r, $data: i, schema: u, schemaCode: o, it: c } = l, s = c.opts.unicodeRegExp ? "u" : "", d = i ? (0, t._)`(new RegExp(${o}, ${s}))` : (0, e.usePattern)(l, u);
      l.fail$data((0, t._)`!${d}.test(${r})`);
    }
  };
  return ma.default = n, ma;
}
var ga = {}, Xm;
function $S() {
  if (Xm) return ga;
  Xm = 1, Object.defineProperty(ga, "__esModule", { value: !0 });
  const e = De(), a = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: l }) {
        const r = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${r} than ${l} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: l, data: r, schemaCode: i } = n, u = l === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${r}).length ${u} ${i}`);
    }
  };
  return ga.default = a, ga;
}
var ya = {}, Wm;
function SS() {
  if (Wm) return ya;
  Wm = 1, Object.defineProperty(ya, "__esModule", { value: !0 });
  const e = qt(), t = De(), a = Ue(), l = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: r } }) => (0, t.str)`must have required property '${r}'`,
      params: ({ params: { missingProperty: r } }) => (0, t._)`{missingProperty: ${r}}`
    },
    code(r) {
      const { gen: i, schema: u, schemaCode: o, data: c, $data: s, it: d } = r, { opts: f } = d;
      if (!s && u.length === 0)
        return;
      const m = u.length >= f.loopRequired;
      if (d.allErrors ? y() : v(), f.strictRequired) {
        const p = r.parentSchema.properties, { definedProperties: E } = r.it;
        for (const b of u)
          if (p?.[b] === void 0 && !E.has(b)) {
            const $ = d.schemaEnv.baseId + d.errSchemaPath, _ = `required property "${b}" is not defined at "${$}" (strictRequired)`;
            (0, a.checkStrictMode)(d, _, d.opts.strictRequired);
          }
      }
      function y() {
        if (m || s)
          r.block$data(t.nil, h);
        else
          for (const p of u)
            (0, e.checkReportMissingProp)(r, p);
      }
      function v() {
        const p = i.let("missing");
        if (m || s) {
          const E = i.let("valid", !0);
          r.block$data(E, () => g(p, E)), r.ok(E);
        } else
          i.if((0, e.checkMissingProp)(r, u, p)), (0, e.reportMissingProp)(r, p), i.else();
      }
      function h() {
        i.forOf("prop", o, (p) => {
          r.setParams({ missingProperty: p }), i.if((0, e.noPropertyInData)(i, c, p, f.ownProperties), () => r.error());
        });
      }
      function g(p, E) {
        r.setParams({ missingProperty: p }), i.forOf(p, o, () => {
          i.assign(E, (0, e.propertyInData)(i, c, p, f.ownProperties)), i.if((0, t.not)(E), () => {
            r.error(), i.break();
          });
        }, t.nil);
      }
    }
  };
  return ya.default = l, ya;
}
var va = {}, Ym;
function bS() {
  if (Ym) return va;
  Ym = 1, Object.defineProperty(va, "__esModule", { value: !0 });
  const e = De(), a = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: l }) {
        const r = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${r} than ${l} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: l, data: r, schemaCode: i } = n, u = l === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${r}.length ${u} ${i}`);
    }
  };
  return va.default = a, va;
}
var _a = {}, Ea = {}, Jm;
function gl() {
  if (Jm) return Ea;
  Jm = 1, Object.defineProperty(Ea, "__esModule", { value: !0 });
  const e = us();
  return e.code = 'require("ajv/dist/runtime/equal").default', Ea.default = e, Ea;
}
var Qm;
function RS() {
  if (Qm) return _a;
  Qm = 1, Object.defineProperty(_a, "__esModule", { value: !0 });
  const e = Ya(), t = De(), a = Ue(), n = gl(), r = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i, j: u } }) => (0, t.str)`must NOT have duplicate items (items ## ${u} and ${i} are identical)`,
      params: ({ params: { i, j: u } }) => (0, t._)`{i: ${i}, j: ${u}}`
    },
    code(i) {
      const { gen: u, data: o, $data: c, schema: s, parentSchema: d, schemaCode: f, it: m } = i;
      if (!c && !s)
        return;
      const y = u.let("valid"), v = d.items ? (0, e.getSchemaTypes)(d.items) : [];
      i.block$data(y, h, (0, t._)`${f} === false`), i.ok(y);
      function h() {
        const b = u.let("i", (0, t._)`${o}.length`), $ = u.let("j");
        i.setParams({ i: b, j: $ }), u.assign(y, !0), u.if((0, t._)`${b} > 1`, () => (g() ? p : E)(b, $));
      }
      function g() {
        return v.length > 0 && !v.some((b) => b === "object" || b === "array");
      }
      function p(b, $) {
        const _ = u.name("item"), w = (0, e.checkDataTypes)(v, _, m.opts.strictNumbers, e.DataType.Wrong), T = u.const("indices", (0, t._)`{}`);
        u.for((0, t._)`;${b}--;`, () => {
          u.let(_, (0, t._)`${o}[${b}]`), u.if(w, (0, t._)`continue`), v.length > 1 && u.if((0, t._)`typeof ${_} == "string"`, (0, t._)`${_} += "_"`), u.if((0, t._)`typeof ${T}[${_}] == "number"`, () => {
            u.assign($, (0, t._)`${T}[${_}]`), i.error(), u.assign(y, !1).break();
          }).code((0, t._)`${T}[${_}] = ${b}`);
        });
      }
      function E(b, $) {
        const _ = (0, a.useFunc)(u, n.default), w = u.name("outer");
        u.label(w).for((0, t._)`;${b}--;`, () => u.for((0, t._)`${$} = ${b}; ${$}--;`, () => u.if((0, t._)`${_}(${o}[${b}], ${o}[${$}])`, () => {
          i.error(), u.assign(y, !1).break(w);
        })));
      }
    }
  };
  return _a.default = r, _a;
}
var wa = {}, Zm;
function TS() {
  if (Zm) return wa;
  Zm = 1, Object.defineProperty(wa, "__esModule", { value: !0 });
  const e = De(), t = Ue(), a = gl(), l = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: r }) => (0, e._)`{allowedValue: ${r}}`
    },
    code(r) {
      const { gen: i, data: u, $data: o, schemaCode: c, schema: s } = r;
      o || s && typeof s == "object" ? r.fail$data((0, e._)`!${(0, t.useFunc)(i, a.default)}(${u}, ${c})`) : r.fail((0, e._)`${s} !== ${u}`);
    }
  };
  return wa.default = l, wa;
}
var $a = {}, eg;
function PS() {
  if (eg) return $a;
  eg = 1, Object.defineProperty($a, "__esModule", { value: !0 });
  const e = De(), t = Ue(), a = gl(), l = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: r }) => (0, e._)`{allowedValues: ${r}}`
    },
    code(r) {
      const { gen: i, data: u, $data: o, schema: c, schemaCode: s, it: d } = r;
      if (!o && c.length === 0)
        throw new Error("enum must have non-empty array");
      const f = c.length >= d.opts.loopEnum;
      let m;
      const y = () => m ?? (m = (0, t.useFunc)(i, a.default));
      let v;
      if (f || o)
        v = i.let("valid"), r.block$data(v, h);
      else {
        if (!Array.isArray(c))
          throw new Error("ajv implementation error");
        const p = i.const("vSchema", s);
        v = (0, e.or)(...c.map((E, b) => g(p, b)));
      }
      r.pass(v);
      function h() {
        i.assign(v, !1), i.forOf("v", s, (p) => i.if((0, e._)`${y()}(${u}, ${p})`, () => i.assign(v, !0).break()));
      }
      function g(p, E) {
        const b = c[E];
        return typeof b == "object" && b !== null ? (0, e._)`${y()}(${u}, ${p}[${E}])` : (0, e._)`${u} === ${b}`;
      }
    }
  };
  return $a.default = l, $a;
}
var tg;
function NS() {
  if (tg) return la;
  tg = 1, Object.defineProperty(la, "__esModule", { value: !0 });
  const e = yS(), t = vS(), a = ES(), n = wS(), l = $S(), r = SS(), i = bS(), u = RS(), o = TS(), c = PS(), s = [
    // number
    e.default,
    t.default,
    // string
    a.default,
    n.default,
    // object
    l.default,
    r.default,
    // array
    i.default,
    u.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    o.default,
    c.default
  ];
  return la.default = s, la;
}
var Sa = {}, Hr = {}, rg;
function R0() {
  if (rg) return Hr;
  rg = 1, Object.defineProperty(Hr, "__esModule", { value: !0 }), Hr.validateAdditionalItems = void 0;
  const e = De(), t = Ue(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: r } }) => (0, e.str)`must NOT have more than ${r} items`,
      params: ({ params: { len: r } }) => (0, e._)`{limit: ${r}}`
    },
    code(r) {
      const { parentSchema: i, it: u } = r, { items: o } = i;
      if (!Array.isArray(o)) {
        (0, t.checkStrictMode)(u, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      l(r, o);
    }
  };
  function l(r, i) {
    const { gen: u, schema: o, data: c, keyword: s, it: d } = r;
    d.items = !0;
    const f = u.const("len", (0, e._)`${c}.length`);
    if (o === !1)
      r.setParams({ len: i.length }), r.pass((0, e._)`${f} <= ${i.length}`);
    else if (typeof o == "object" && !(0, t.alwaysValidSchema)(d, o)) {
      const y = u.var("valid", (0, e._)`${f} <= ${i.length}`);
      u.if((0, e.not)(y), () => m(y)), r.ok(y);
    }
    function m(y) {
      u.forRange("i", i.length, f, (v) => {
        r.subschema({ keyword: s, dataProp: v, dataPropType: t.Type.Num }, y), d.allErrors || u.if((0, e.not)(y), () => u.break());
      });
    }
  }
  return Hr.validateAdditionalItems = l, Hr.default = n, Hr;
}
var ba = {}, zr = {}, ng;
function T0() {
  if (ng) return zr;
  ng = 1, Object.defineProperty(zr, "__esModule", { value: !0 }), zr.validateTuple = void 0;
  const e = De(), t = Ue(), a = qt(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(r) {
      const { schema: i, it: u } = r;
      if (Array.isArray(i))
        return l(r, "additionalItems", i);
      u.items = !0, !(0, t.alwaysValidSchema)(u, i) && r.ok((0, a.validateArray)(r));
    }
  };
  function l(r, i, u = r.schema) {
    const { gen: o, parentSchema: c, data: s, keyword: d, it: f } = r;
    v(c), f.opts.unevaluated && u.length && f.items !== !0 && (f.items = t.mergeEvaluated.items(o, u.length, f.items));
    const m = o.name("valid"), y = o.const("len", (0, e._)`${s}.length`);
    u.forEach((h, g) => {
      (0, t.alwaysValidSchema)(f, h) || (o.if((0, e._)`${y} > ${g}`, () => r.subschema({
        keyword: d,
        schemaProp: g,
        dataProp: g
      }, m)), r.ok(m));
    });
    function v(h) {
      const { opts: g, errSchemaPath: p } = f, E = u.length, b = E === h.minItems && (E === h.maxItems || h[i] === !1);
      if (g.strictTuples && !b) {
        const $ = `"${d}" is ${E}-tuple, but minItems or maxItems/${i} are not specified or different at path "${p}"`;
        (0, t.checkStrictMode)(f, $, g.strictTuples);
      }
    }
  }
  return zr.validateTuple = l, zr.default = n, zr;
}
var ig;
function IS() {
  if (ig) return ba;
  ig = 1, Object.defineProperty(ba, "__esModule", { value: !0 });
  const e = T0(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (a) => (0, e.validateTuple)(a, "items")
  };
  return ba.default = t, ba;
}
var Ra = {}, ag;
function OS() {
  if (ag) return Ra;
  ag = 1, Object.defineProperty(Ra, "__esModule", { value: !0 });
  const e = De(), t = Ue(), a = qt(), n = R0(), r = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { schema: u, parentSchema: o, it: c } = i, { prefixItems: s } = o;
      c.items = !0, !(0, t.alwaysValidSchema)(c, u) && (s ? (0, n.validateAdditionalItems)(i, s) : i.ok((0, a.validateArray)(i)));
    }
  };
  return Ra.default = r, Ra;
}
var Ta = {}, sg;
function AS() {
  if (sg) return Ta;
  sg = 1, Object.defineProperty(Ta, "__esModule", { value: !0 });
  const e = De(), t = Ue(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: l, max: r } }) => r === void 0 ? (0, e.str)`must contain at least ${l} valid item(s)` : (0, e.str)`must contain at least ${l} and no more than ${r} valid item(s)`,
      params: ({ params: { min: l, max: r } }) => r === void 0 ? (0, e._)`{minContains: ${l}}` : (0, e._)`{minContains: ${l}, maxContains: ${r}}`
    },
    code(l) {
      const { gen: r, schema: i, parentSchema: u, data: o, it: c } = l;
      let s, d;
      const { minContains: f, maxContains: m } = u;
      c.opts.next ? (s = f === void 0 ? 1 : f, d = m) : s = 1;
      const y = r.const("len", (0, e._)`${o}.length`);
      if (l.setParams({ min: s, max: d }), d === void 0 && s === 0) {
        (0, t.checkStrictMode)(c, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (d !== void 0 && s > d) {
        (0, t.checkStrictMode)(c, '"minContains" > "maxContains" is always invalid'), l.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(c, i)) {
        let E = (0, e._)`${y} >= ${s}`;
        d !== void 0 && (E = (0, e._)`${E} && ${y} <= ${d}`), l.pass(E);
        return;
      }
      c.items = !0;
      const v = r.name("valid");
      d === void 0 && s === 1 ? g(v, () => r.if(v, () => r.break())) : s === 0 ? (r.let(v, !0), d !== void 0 && r.if((0, e._)`${o}.length > 0`, h)) : (r.let(v, !1), h()), l.result(v, () => l.reset());
      function h() {
        const E = r.name("_valid"), b = r.let("count", 0);
        g(E, () => r.if(E, () => p(b)));
      }
      function g(E, b) {
        r.forRange("i", 0, y, ($) => {
          l.subschema({
            keyword: "contains",
            dataProp: $,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, E), b();
        });
      }
      function p(E) {
        r.code((0, e._)`${E}++`), d === void 0 ? r.if((0, e._)`${E} >= ${s}`, () => r.assign(v, !0).break()) : (r.if((0, e._)`${E} > ${d}`, () => r.assign(v, !1).break()), s === 1 ? r.assign(v, !0) : r.if((0, e._)`${E} >= ${s}`, () => r.assign(v, !0)));
      }
    }
  };
  return Ta.default = n, Ta;
}
var zc = {}, og;
function CS() {
  return og || (og = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = De(), a = Ue(), n = qt();
    e.error = {
      message: ({ params: { property: o, depsCount: c, deps: s } }) => {
        const d = c === 1 ? "property" : "properties";
        return (0, t.str)`must have ${d} ${s} when property ${o} is present`;
      },
      params: ({ params: { property: o, depsCount: c, deps: s, missingProperty: d } }) => (0, t._)`{property: ${o},
    missingProperty: ${d},
    depsCount: ${c},
    deps: ${s}}`
      // TODO change to reference
    };
    const l = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(o) {
        const [c, s] = r(o);
        i(o, c), u(o, s);
      }
    };
    function r({ schema: o }) {
      const c = {}, s = {};
      for (const d in o) {
        if (d === "__proto__")
          continue;
        const f = Array.isArray(o[d]) ? c : s;
        f[d] = o[d];
      }
      return [c, s];
    }
    function i(o, c = o.schema) {
      const { gen: s, data: d, it: f } = o;
      if (Object.keys(c).length === 0)
        return;
      const m = s.let("missing");
      for (const y in c) {
        const v = c[y];
        if (v.length === 0)
          continue;
        const h = (0, n.propertyInData)(s, d, y, f.opts.ownProperties);
        o.setParams({
          property: y,
          depsCount: v.length,
          deps: v.join(", ")
        }), f.allErrors ? s.if(h, () => {
          for (const g of v)
            (0, n.checkReportMissingProp)(o, g);
        }) : (s.if((0, t._)`${h} && (${(0, n.checkMissingProp)(o, v, m)})`), (0, n.reportMissingProp)(o, m), s.else());
      }
    }
    e.validatePropertyDeps = i;
    function u(o, c = o.schema) {
      const { gen: s, data: d, keyword: f, it: m } = o, y = s.name("valid");
      for (const v in c)
        (0, a.alwaysValidSchema)(m, c[v]) || (s.if(
          (0, n.propertyInData)(s, d, v, m.opts.ownProperties),
          () => {
            const h = o.subschema({ keyword: f, schemaProp: v }, y);
            o.mergeValidEvaluated(h, y);
          },
          () => s.var(y, !0)
          // TODO var
        ), o.ok(y));
    }
    e.validateSchemaDeps = u, e.default = l;
  })(zc)), zc;
}
var Pa = {}, cg;
function DS() {
  if (cg) return Pa;
  cg = 1, Object.defineProperty(Pa, "__esModule", { value: !0 });
  const e = De(), t = Ue(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: l }) => (0, e._)`{propertyName: ${l.propertyName}}`
    },
    code(l) {
      const { gen: r, schema: i, data: u, it: o } = l;
      if ((0, t.alwaysValidSchema)(o, i))
        return;
      const c = r.name("valid");
      r.forIn("key", u, (s) => {
        l.setParams({ propertyName: s }), l.subschema({
          keyword: "propertyNames",
          data: s,
          dataTypes: ["string"],
          propertyName: s,
          compositeRule: !0
        }, c), r.if((0, e.not)(c), () => {
          l.error(!0), o.allErrors || r.break();
        });
      }), l.ok(c);
    }
  };
  return Pa.default = n, Pa;
}
var Na = {}, ug;
function P0() {
  if (ug) return Na;
  ug = 1, Object.defineProperty(Na, "__esModule", { value: !0 });
  const e = qt(), t = De(), a = dr(), n = Ue(), r = {
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
      const { gen: u, schema: o, parentSchema: c, data: s, errsCount: d, it: f } = i;
      if (!d)
        throw new Error("ajv implementation error");
      const { allErrors: m, opts: y } = f;
      if (f.props = !0, y.removeAdditional !== "all" && (0, n.alwaysValidSchema)(f, o))
        return;
      const v = (0, e.allSchemaProperties)(c.properties), h = (0, e.allSchemaProperties)(c.patternProperties);
      g(), i.ok((0, t._)`${d} === ${a.default.errors}`);
      function g() {
        u.forIn("key", s, (_) => {
          !v.length && !h.length ? b(_) : u.if(p(_), () => b(_));
        });
      }
      function p(_) {
        let w;
        if (v.length > 8) {
          const T = (0, n.schemaRefOrVal)(f, c.properties, "properties");
          w = (0, e.isOwnProperty)(u, T, _);
        } else v.length ? w = (0, t.or)(...v.map((T) => (0, t._)`${_} === ${T}`)) : w = t.nil;
        return h.length && (w = (0, t.or)(w, ...h.map((T) => (0, t._)`${(0, e.usePattern)(i, T)}.test(${_})`))), (0, t.not)(w);
      }
      function E(_) {
        u.code((0, t._)`delete ${s}[${_}]`);
      }
      function b(_) {
        if (y.removeAdditional === "all" || y.removeAdditional && o === !1) {
          E(_);
          return;
        }
        if (o === !1) {
          i.setParams({ additionalProperty: _ }), i.error(), m || u.break();
          return;
        }
        if (typeof o == "object" && !(0, n.alwaysValidSchema)(f, o)) {
          const w = u.name("valid");
          y.removeAdditional === "failing" ? ($(_, w, !1), u.if((0, t.not)(w), () => {
            i.reset(), E(_);
          })) : ($(_, w), m || u.if((0, t.not)(w), () => u.break()));
        }
      }
      function $(_, w, T) {
        const P = {
          keyword: "additionalProperties",
          dataProp: _,
          dataPropType: n.Type.Str
        };
        T === !1 && Object.assign(P, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), i.subschema(P, w);
      }
    }
  };
  return Na.default = r, Na;
}
var Ia = {}, lg;
function kS() {
  if (lg) return Ia;
  lg = 1, Object.defineProperty(Ia, "__esModule", { value: !0 });
  const e = gs(), t = qt(), a = Ue(), n = P0(), l = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(r) {
      const { gen: i, schema: u, parentSchema: o, data: c, it: s } = r;
      s.opts.removeAdditional === "all" && o.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(s, n.default, "additionalProperties"));
      const d = (0, t.allSchemaProperties)(u);
      for (const h of d)
        s.definedProperties.add(h);
      s.opts.unevaluated && d.length && s.props !== !0 && (s.props = a.mergeEvaluated.props(i, (0, a.toHash)(d), s.props));
      const f = d.filter((h) => !(0, a.alwaysValidSchema)(s, u[h]));
      if (f.length === 0)
        return;
      const m = i.name("valid");
      for (const h of f)
        y(h) ? v(h) : (i.if((0, t.propertyInData)(i, c, h, s.opts.ownProperties)), v(h), s.allErrors || i.else().var(m, !0), i.endIf()), r.it.definedProperties.add(h), r.ok(m);
      function y(h) {
        return s.opts.useDefaults && !s.compositeRule && u[h].default !== void 0;
      }
      function v(h) {
        r.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, m);
      }
    }
  };
  return Ia.default = l, Ia;
}
var Oa = {}, fg;
function LS() {
  if (fg) return Oa;
  fg = 1, Object.defineProperty(Oa, "__esModule", { value: !0 });
  const e = qt(), t = De(), a = Ue(), n = Ue(), l = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(r) {
      const { gen: i, schema: u, data: o, parentSchema: c, it: s } = r, { opts: d } = s, f = (0, e.allSchemaProperties)(u), m = f.filter((b) => (0, a.alwaysValidSchema)(s, u[b]));
      if (f.length === 0 || m.length === f.length && (!s.opts.unevaluated || s.props === !0))
        return;
      const y = d.strictSchema && !d.allowMatchingProperties && c.properties, v = i.name("valid");
      s.props !== !0 && !(s.props instanceof t.Name) && (s.props = (0, n.evaluatedPropsToName)(i, s.props));
      const { props: h } = s;
      g();
      function g() {
        for (const b of f)
          y && p(b), s.allErrors ? E(b) : (i.var(v, !0), E(b), i.if(v));
      }
      function p(b) {
        for (const $ in y)
          new RegExp(b).test($) && (0, a.checkStrictMode)(s, `property ${$} matches pattern ${b} (use allowMatchingProperties)`);
      }
      function E(b) {
        i.forIn("key", o, ($) => {
          i.if((0, t._)`${(0, e.usePattern)(r, b)}.test(${$})`, () => {
            const _ = m.includes(b);
            _ || r.subschema({
              keyword: "patternProperties",
              schemaProp: b,
              dataProp: $,
              dataPropType: n.Type.Str
            }, v), s.opts.unevaluated && h !== !0 ? i.assign((0, t._)`${h}[${$}]`, !0) : !_ && !s.allErrors && i.if((0, t.not)(v), () => i.break());
          });
        });
      }
    }
  };
  return Oa.default = l, Oa;
}
var Aa = {}, dg;
function qS() {
  if (dg) return Aa;
  dg = 1, Object.defineProperty(Aa, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(a) {
      const { gen: n, schema: l, it: r } = a;
      if ((0, e.alwaysValidSchema)(r, l)) {
        a.fail();
        return;
      }
      const i = n.name("valid");
      a.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, i), a.failResult(i, () => a.reset(), () => a.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Aa.default = t, Aa;
}
var Ca = {}, hg;
function FS() {
  if (hg) return Ca;
  hg = 1, Object.defineProperty(Ca, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: qt().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Ca.default = t, Ca;
}
var Da = {}, pg;
function US() {
  if (pg) return Da;
  pg = 1, Object.defineProperty(Da, "__esModule", { value: !0 });
  const e = De(), t = Ue(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: l }) => (0, e._)`{passingSchemas: ${l.passing}}`
    },
    code(l) {
      const { gen: r, schema: i, parentSchema: u, it: o } = l;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      if (o.opts.discriminator && u.discriminator)
        return;
      const c = i, s = r.let("valid", !1), d = r.let("passing", null), f = r.name("_valid");
      l.setParams({ passing: d }), r.block(m), l.result(s, () => l.reset(), () => l.error(!0));
      function m() {
        c.forEach((y, v) => {
          let h;
          (0, t.alwaysValidSchema)(o, y) ? r.var(f, !0) : h = l.subschema({
            keyword: "oneOf",
            schemaProp: v,
            compositeRule: !0
          }, f), v > 0 && r.if((0, e._)`${f} && ${s}`).assign(s, !1).assign(d, (0, e._)`[${d}, ${v}]`).else(), r.if(f, () => {
            r.assign(s, !0), r.assign(d, v), h && l.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return Da.default = n, Da;
}
var ka = {}, mg;
function jS() {
  if (mg) return ka;
  mg = 1, Object.defineProperty(ka, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(a) {
      const { gen: n, schema: l, it: r } = a;
      if (!Array.isArray(l))
        throw new Error("ajv implementation error");
      const i = n.name("valid");
      l.forEach((u, o) => {
        if ((0, e.alwaysValidSchema)(r, u))
          return;
        const c = a.subschema({ keyword: "allOf", schemaProp: o }, i);
        a.ok(i), a.mergeEvaluated(c);
      });
    }
  };
  return ka.default = t, ka;
}
var La = {}, gg;
function MS() {
  if (gg) return La;
  gg = 1, Object.defineProperty(La, "__esModule", { value: !0 });
  const e = De(), t = Ue(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: r }) => (0, e.str)`must match "${r.ifClause}" schema`,
      params: ({ params: r }) => (0, e._)`{failingKeyword: ${r.ifClause}}`
    },
    code(r) {
      const { gen: i, parentSchema: u, it: o } = r;
      u.then === void 0 && u.else === void 0 && (0, t.checkStrictMode)(o, '"if" without "then" and "else" is ignored');
      const c = l(o, "then"), s = l(o, "else");
      if (!c && !s)
        return;
      const d = i.let("valid", !0), f = i.name("_valid");
      if (m(), r.reset(), c && s) {
        const v = i.let("ifClause");
        r.setParams({ ifClause: v }), i.if(f, y("then", v), y("else", v));
      } else c ? i.if(f, y("then")) : i.if((0, e.not)(f), y("else"));
      r.pass(d, () => r.error(!0));
      function m() {
        const v = r.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, f);
        r.mergeEvaluated(v);
      }
      function y(v, h) {
        return () => {
          const g = r.subschema({ keyword: v }, f);
          i.assign(d, f), r.mergeValidEvaluated(g, d), h ? i.assign(h, (0, e._)`${v}`) : r.setParams({ ifClause: v });
        };
      }
    }
  };
  function l(r, i) {
    const u = r.schema[i];
    return u !== void 0 && !(0, t.alwaysValidSchema)(r, u);
  }
  return La.default = n, La;
}
var qa = {}, yg;
function xS() {
  if (yg) return qa;
  yg = 1, Object.defineProperty(qa, "__esModule", { value: !0 });
  const e = Ue(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: a, parentSchema: n, it: l }) {
      n.if === void 0 && (0, e.checkStrictMode)(l, `"${a}" without "if" is ignored`);
    }
  };
  return qa.default = t, qa;
}
var vg;
function VS() {
  if (vg) return Sa;
  vg = 1, Object.defineProperty(Sa, "__esModule", { value: !0 });
  const e = R0(), t = IS(), a = T0(), n = OS(), l = AS(), r = CS(), i = DS(), u = P0(), o = kS(), c = LS(), s = qS(), d = FS(), f = US(), m = jS(), y = MS(), v = xS();
  function h(g = !1) {
    const p = [
      // any
      s.default,
      d.default,
      f.default,
      m.default,
      y.default,
      v.default,
      // object
      i.default,
      u.default,
      r.default,
      o.default,
      c.default
    ];
    return g ? p.push(t.default, n.default) : p.push(e.default, a.default), p.push(l.default), p;
  }
  return Sa.default = h, Sa;
}
var Fa = {}, Ua = {}, _g;
function GS() {
  if (_g) return Ua;
  _g = 1, Object.defineProperty(Ua, "__esModule", { value: !0 });
  const e = De(), a = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, l) {
      const { gen: r, data: i, $data: u, schema: o, schemaCode: c, it: s } = n, { opts: d, errSchemaPath: f, schemaEnv: m, self: y } = s;
      if (!d.validateFormats)
        return;
      u ? v() : h();
      function v() {
        const g = r.scopeValue("formats", {
          ref: y.formats,
          code: d.code.formats
        }), p = r.const("fDef", (0, e._)`${g}[${c}]`), E = r.let("fType"), b = r.let("format");
        r.if((0, e._)`typeof ${p} == "object" && !(${p} instanceof RegExp)`, () => r.assign(E, (0, e._)`${p}.type || "string"`).assign(b, (0, e._)`${p}.validate`), () => r.assign(E, (0, e._)`"string"`).assign(b, p)), n.fail$data((0, e.or)($(), _()));
        function $() {
          return d.strictSchema === !1 ? e.nil : (0, e._)`${c} && !${b}`;
        }
        function _() {
          const w = m.$async ? (0, e._)`(${p}.async ? await ${b}(${i}) : ${b}(${i}))` : (0, e._)`${b}(${i})`, T = (0, e._)`(typeof ${b} == "function" ? ${w} : ${b}.test(${i}))`;
          return (0, e._)`${b} && ${b} !== true && ${E} === ${l} && !${T}`;
        }
      }
      function h() {
        const g = y.formats[o];
        if (!g) {
          $();
          return;
        }
        if (g === !0)
          return;
        const [p, E, b] = _(g);
        p === l && n.pass(w());
        function $() {
          if (d.strictSchema === !1) {
            y.logger.warn(T());
            return;
          }
          throw new Error(T());
          function T() {
            return `unknown format "${o}" ignored in schema at path "${f}"`;
          }
        }
        function _(T) {
          const P = T instanceof RegExp ? (0, e.regexpCode)(T) : d.code.formats ? (0, e._)`${d.code.formats}${(0, e.getProperty)(o)}` : void 0, G = r.scopeValue("formats", { key: o, ref: T, code: P });
          return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, e._)`${G}.validate`] : ["string", T, G];
        }
        function w() {
          if (typeof g == "object" && !(g instanceof RegExp) && g.async) {
            if (!m.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${b}(${i})`;
          }
          return typeof E == "function" ? (0, e._)`${b}(${i})` : (0, e._)`${b}.test(${i})`;
        }
      }
    }
  };
  return Ua.default = a, Ua;
}
var Eg;
function BS() {
  if (Eg) return Fa;
  Eg = 1, Object.defineProperty(Fa, "__esModule", { value: !0 });
  const t = [GS().default];
  return Fa.default = t, Fa;
}
var Ir = {}, wg;
function HS() {
  return wg || (wg = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.contentVocabulary = Ir.metadataVocabulary = void 0, Ir.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Ir.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Ir;
}
var $g;
function zS() {
  if ($g) return oa;
  $g = 1, Object.defineProperty(oa, "__esModule", { value: !0 });
  const e = gS(), t = NS(), a = VS(), n = BS(), l = HS(), r = [
    e.default,
    t.default,
    (0, a.default)(),
    n.default,
    l.metadataVocabulary,
    l.contentVocabulary
  ];
  return oa.default = r, oa;
}
var ja = {}, An = {}, Sg;
function KS() {
  if (Sg) return An;
  Sg = 1, Object.defineProperty(An, "__esModule", { value: !0 }), An.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (An.DiscrError = e = {})), An;
}
var bg;
function XS() {
  if (bg) return ja;
  bg = 1, Object.defineProperty(ja, "__esModule", { value: !0 });
  const e = De(), t = KS(), a = ml(), n = ys(), l = Ue(), i = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: u, tagName: o } }) => u === t.DiscrError.Tag ? `tag "${o}" must be string` : `value of tag "${o}" must be in oneOf`,
      params: ({ params: { discrError: u, tag: o, tagName: c } }) => (0, e._)`{error: ${u}, tag: ${c}, tagValue: ${o}}`
    },
    code(u) {
      const { gen: o, data: c, schema: s, parentSchema: d, it: f } = u, { oneOf: m } = d;
      if (!f.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const y = s.propertyName;
      if (typeof y != "string")
        throw new Error("discriminator: requires propertyName");
      if (s.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!m)
        throw new Error("discriminator: requires oneOf keyword");
      const v = o.let("valid", !1), h = o.const("tag", (0, e._)`${c}${(0, e.getProperty)(y)}`);
      o.if((0, e._)`typeof ${h} == "string"`, () => g(), () => u.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: y })), u.ok(v);
      function g() {
        const b = E();
        o.if(!1);
        for (const $ in b)
          o.elseIf((0, e._)`${h} === ${$}`), o.assign(v, p(b[$]));
        o.else(), u.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: y }), o.endIf();
      }
      function p(b) {
        const $ = o.name("valid"), _ = u.subschema({ keyword: "oneOf", schemaProp: b }, $);
        return u.mergeEvaluated(_, e.Name), $;
      }
      function E() {
        var b;
        const $ = {}, _ = T(d);
        let w = !0;
        for (let q = 0; q < m.length; q++) {
          let M = m[q];
          if (M?.$ref && !(0, l.schemaHasRulesButRef)(M, f.self.RULES)) {
            const k = M.$ref;
            if (M = a.resolveRef.call(f.self, f.schemaEnv.root, f.baseId, k), M instanceof a.SchemaEnv && (M = M.schema), M === void 0)
              throw new n.default(f.opts.uriResolver, f.baseId, k);
          }
          const K = (b = M?.properties) === null || b === void 0 ? void 0 : b[y];
          if (typeof K != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${y}"`);
          w = w && (_ || T(M)), P(K, q);
        }
        if (!w)
          throw new Error(`discriminator: "${y}" must be required`);
        return $;
        function T({ required: q }) {
          return Array.isArray(q) && q.includes(y);
        }
        function P(q, M) {
          if (q.const)
            G(q.const, M);
          else if (q.enum)
            for (const K of q.enum)
              G(K, M);
          else
            throw new Error(`discriminator: "properties/${y}" must have "const" or "enum"`);
        }
        function G(q, M) {
          if (typeof q != "string" || q in $)
            throw new Error(`discriminator: "${y}" values must be unique strings`);
          $[q] = M;
        }
      }
    }
  };
  return ja.default = i, ja;
}
const WS = "http://json-schema.org/draft-07/schema#", YS = "http://json-schema.org/draft-07/schema#", JS = "Core schema meta-schema", QS = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, ZS = ["object", "boolean"], eb = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, tb = {
  $schema: WS,
  $id: YS,
  title: JS,
  definitions: QS,
  type: ZS,
  properties: eb,
  default: !0
};
var Rg;
function rb() {
  return Rg || (Rg = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const a = hS(), n = zS(), l = XS(), r = tb, i = ["/properties"], u = "http://json-schema.org/draft-07/schema";
    class o extends a.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(l.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const y = this.opts.$data ? this.$dataMetaSchema(r, i) : r;
        this.addMetaSchema(y, u, !1), this.refs["http://json-schema.org/schema"] = u;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(u) ? u : void 0);
      }
    }
    t.Ajv = o, e.exports = t = o, e.exports.Ajv = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
    var c = gs();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return c.KeywordCxt;
    } });
    var s = De();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return s._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return s.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return s.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return s.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return s.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return s.CodeGen;
    } });
    var d = pl();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return d.default;
    } });
    var f = ys();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return f.default;
    } });
  })(ra, ra.exports)), ra.exports;
}
var Tg;
function nb() {
  return Tg || (Tg = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = rb(), a = De(), n = a.operators, l = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, r = {
      message: ({ keyword: u, schemaCode: o }) => (0, a.str)`should be ${l[u].okStr} ${o}`,
      params: ({ keyword: u, schemaCode: o }) => (0, a._)`{comparison: ${l[u].okStr}, limit: ${o}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(l),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: r,
      code(u) {
        const { gen: o, data: c, schemaCode: s, keyword: d, it: f } = u, { opts: m, self: y } = f;
        if (!m.validateFormats)
          return;
        const v = new t.KeywordCxt(f, y.RULES.all.format.definition, "format");
        v.$data ? h() : g();
        function h() {
          const E = o.scopeValue("formats", {
            ref: y.formats,
            code: m.code.formats
          }), b = o.const("fmt", (0, a._)`${E}[${v.schemaCode}]`);
          u.fail$data((0, a.or)((0, a._)`typeof ${b} != "object"`, (0, a._)`${b} instanceof RegExp`, (0, a._)`typeof ${b}.compare != "function"`, p(b)));
        }
        function g() {
          const E = v.schema, b = y.formats[E];
          if (!b || b === !0)
            return;
          if (typeof b != "object" || b instanceof RegExp || typeof b.compare != "function")
            throw new Error(`"${d}": format "${E}" does not define "compare" function`);
          const $ = o.scopeValue("formats", {
            key: E,
            ref: b,
            code: m.code.formats ? (0, a._)`${m.code.formats}${(0, a.getProperty)(E)}` : void 0
          });
          u.fail$data(p($));
        }
        function p(E) {
          return (0, a._)`${E}.compare(${c}, ${s}) ${l[d].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const i = (u) => (u.addKeyword(e.formatLimitDefinition), u);
    e.default = i;
  })(jc)), jc;
}
var Pg;
function ib() {
  return Pg || (Pg = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const a = Z$(), n = nb(), l = De(), r = new l.Name("fullFormats"), i = new l.Name("fastFormats"), u = (c, s = { keywords: !0 }) => {
      if (Array.isArray(s))
        return o(c, s, a.fullFormats, r), c;
      const [d, f] = s.mode === "fast" ? [a.fastFormats, i] : [a.fullFormats, r], m = s.formats || a.formatNames;
      return o(c, m, d, f), s.keywords && (0, n.default)(c), c;
    };
    u.get = (c, s = "full") => {
      const f = (s === "fast" ? a.fastFormats : a.fullFormats)[c];
      if (!f)
        throw new Error(`Unknown format "${c}"`);
      return f;
    };
    function o(c, s, d, f) {
      var m, y;
      (m = (y = c.opts.code).formats) !== null && m !== void 0 || (y.formats = (0, l._)`require("ajv-formats/dist/formats").${f}`);
      for (const v of s)
        c.addFormat(v, d[v]);
    }
    e.exports = t = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
  })(ta, ta.exports)), ta.exports;
}
var ab = ib();
const sb = /* @__PURE__ */ Ay(ab), ob = (e, t, a, n) => {
  if (a === "length" || a === "prototype" || a === "arguments" || a === "caller")
    return;
  const l = Object.getOwnPropertyDescriptor(e, a), r = Object.getOwnPropertyDescriptor(t, a);
  !cb(l, r) && n || Object.defineProperty(e, a, r);
}, cb = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, ub = (e, t) => {
  const a = Object.getPrototypeOf(t);
  a !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, a);
}, lb = (e, t) => `/* Wrapped ${e}*/
${t}`, fb = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), db = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), hb = (e, t, a) => {
  const n = a === "" ? "" : `with ${a.trim()}() `, l = lb.bind(null, n, t.toString());
  Object.defineProperty(l, "name", db);
  const { writable: r, enumerable: i, configurable: u } = fb;
  Object.defineProperty(e, "toString", { value: l, writable: r, enumerable: i, configurable: u });
};
function pb(e, t, { ignoreNonConfigurable: a = !1 } = {}) {
  const { name: n } = e;
  for (const l of Reflect.ownKeys(t))
    ob(e, t, l, a);
  return ub(e, t), hb(e, t, n), e;
}
const Ng = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: a = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: l = !1,
    after: r = !0
  } = t;
  if (a < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!l && !r)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, u, o;
  const c = function(...s) {
    const d = this, f = () => {
      i = void 0, u && (clearTimeout(u), u = void 0), r && (o = e.apply(d, s));
    }, m = () => {
      u = void 0, i && (clearTimeout(i), i = void 0), r && (o = e.apply(d, s));
    }, y = l && !i;
    return clearTimeout(i), i = setTimeout(f, a), n > 0 && n !== Number.POSITIVE_INFINITY && !u && (u = setTimeout(m, n)), y && (o = e.apply(d, s)), o;
  };
  return pb(c, e), c.cancel = () => {
    i && (clearTimeout(i), i = void 0), u && (clearTimeout(u), u = void 0);
  }, c;
};
var Ma = { exports: {} }, Kc, Ig;
function vs() {
  if (Ig) return Kc;
  Ig = 1;
  const e = "2.0.0", t = 256, a = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, l = t - 6;
  return Kc = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: l,
    MAX_SAFE_INTEGER: a,
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
  }, Kc;
}
var Xc, Og;
function _s() {
  return Og || (Og = 1, Xc = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Xc;
}
var Ag;
function Un() {
  return Ag || (Ag = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: a,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: l
    } = vs(), r = _s();
    t = e.exports = {};
    const i = t.re = [], u = t.safeRe = [], o = t.src = [], c = t.safeSrc = [], s = t.t = {};
    let d = 0;
    const f = "[a-zA-Z0-9-]", m = [
      ["\\s", 1],
      ["\\d", l],
      [f, n]
    ], y = (h) => {
      for (const [g, p] of m)
        h = h.split(`${g}*`).join(`${g}{0,${p}}`).split(`${g}+`).join(`${g}{1,${p}}`);
      return h;
    }, v = (h, g, p) => {
      const E = y(g), b = d++;
      r(h, b, g), s[h] = b, o[b] = g, c[b] = E, i[b] = new RegExp(g, p ? "g" : void 0), u[b] = new RegExp(E, p ? "g" : void 0);
    };
    v("NUMERICIDENTIFIER", "0|[1-9]\\d*"), v("NUMERICIDENTIFIERLOOSE", "\\d+"), v("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${f}*`), v("MAINVERSION", `(${o[s.NUMERICIDENTIFIER]})\\.(${o[s.NUMERICIDENTIFIER]})\\.(${o[s.NUMERICIDENTIFIER]})`), v("MAINVERSIONLOOSE", `(${o[s.NUMERICIDENTIFIERLOOSE]})\\.(${o[s.NUMERICIDENTIFIERLOOSE]})\\.(${o[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASEIDENTIFIER", `(?:${o[s.NONNUMERICIDENTIFIER]}|${o[s.NUMERICIDENTIFIER]})`), v("PRERELEASEIDENTIFIERLOOSE", `(?:${o[s.NONNUMERICIDENTIFIER]}|${o[s.NUMERICIDENTIFIERLOOSE]})`), v("PRERELEASE", `(?:-(${o[s.PRERELEASEIDENTIFIER]}(?:\\.${o[s.PRERELEASEIDENTIFIER]})*))`), v("PRERELEASELOOSE", `(?:-?(${o[s.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${o[s.PRERELEASEIDENTIFIERLOOSE]})*))`), v("BUILDIDENTIFIER", `${f}+`), v("BUILD", `(?:\\+(${o[s.BUILDIDENTIFIER]}(?:\\.${o[s.BUILDIDENTIFIER]})*))`), v("FULLPLAIN", `v?${o[s.MAINVERSION]}${o[s.PRERELEASE]}?${o[s.BUILD]}?`), v("FULL", `^${o[s.FULLPLAIN]}$`), v("LOOSEPLAIN", `[v=\\s]*${o[s.MAINVERSIONLOOSE]}${o[s.PRERELEASELOOSE]}?${o[s.BUILD]}?`), v("LOOSE", `^${o[s.LOOSEPLAIN]}$`), v("GTLT", "((?:<|>)?=?)"), v("XRANGEIDENTIFIERLOOSE", `${o[s.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), v("XRANGEIDENTIFIER", `${o[s.NUMERICIDENTIFIER]}|x|X|\\*`), v("XRANGEPLAIN", `[v=\\s]*(${o[s.XRANGEIDENTIFIER]})(?:\\.(${o[s.XRANGEIDENTIFIER]})(?:\\.(${o[s.XRANGEIDENTIFIER]})(?:${o[s.PRERELEASE]})?${o[s.BUILD]}?)?)?`), v("XRANGEPLAINLOOSE", `[v=\\s]*(${o[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[s.XRANGEIDENTIFIERLOOSE]})(?:\\.(${o[s.XRANGEIDENTIFIERLOOSE]})(?:${o[s.PRERELEASELOOSE]})?${o[s.BUILD]}?)?)?`), v("XRANGE", `^${o[s.GTLT]}\\s*${o[s.XRANGEPLAIN]}$`), v("XRANGELOOSE", `^${o[s.GTLT]}\\s*${o[s.XRANGEPLAINLOOSE]}$`), v("COERCEPLAIN", `(^|[^\\d])(\\d{1,${a}})(?:\\.(\\d{1,${a}}))?(?:\\.(\\d{1,${a}}))?`), v("COERCE", `${o[s.COERCEPLAIN]}(?:$|[^\\d])`), v("COERCEFULL", o[s.COERCEPLAIN] + `(?:${o[s.PRERELEASE]})?(?:${o[s.BUILD]})?(?:$|[^\\d])`), v("COERCERTL", o[s.COERCE], !0), v("COERCERTLFULL", o[s.COERCEFULL], !0), v("LONETILDE", "(?:~>?)"), v("TILDETRIM", `(\\s*)${o[s.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", v("TILDE", `^${o[s.LONETILDE]}${o[s.XRANGEPLAIN]}$`), v("TILDELOOSE", `^${o[s.LONETILDE]}${o[s.XRANGEPLAINLOOSE]}$`), v("LONECARET", "(?:\\^)"), v("CARETTRIM", `(\\s*)${o[s.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", v("CARET", `^${o[s.LONECARET]}${o[s.XRANGEPLAIN]}$`), v("CARETLOOSE", `^${o[s.LONECARET]}${o[s.XRANGEPLAINLOOSE]}$`), v("COMPARATORLOOSE", `^${o[s.GTLT]}\\s*(${o[s.LOOSEPLAIN]})$|^$`), v("COMPARATOR", `^${o[s.GTLT]}\\s*(${o[s.FULLPLAIN]})$|^$`), v("COMPARATORTRIM", `(\\s*)${o[s.GTLT]}\\s*(${o[s.LOOSEPLAIN]}|${o[s.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", v("HYPHENRANGE", `^\\s*(${o[s.XRANGEPLAIN]})\\s+-\\s+(${o[s.XRANGEPLAIN]})\\s*$`), v("HYPHENRANGELOOSE", `^\\s*(${o[s.XRANGEPLAINLOOSE]})\\s+-\\s+(${o[s.XRANGEPLAINLOOSE]})\\s*$`), v("STAR", "(<|>)?=?\\s*\\*"), v("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), v("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(Ma, Ma.exports)), Ma.exports;
}
var Wc, Cg;
function yl() {
  if (Cg) return Wc;
  Cg = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Wc = (n) => n ? typeof n != "object" ? e : n : t, Wc;
}
var Yc, Dg;
function N0() {
  if (Dg) return Yc;
  Dg = 1;
  const e = /^[0-9]+$/, t = (n, l) => {
    if (typeof n == "number" && typeof l == "number")
      return n === l ? 0 : n < l ? -1 : 1;
    const r = e.test(n), i = e.test(l);
    return r && i && (n = +n, l = +l), n === l ? 0 : r && !i ? -1 : i && !r ? 1 : n < l ? -1 : 1;
  };
  return Yc = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, l) => t(l, n)
  }, Yc;
}
var Jc, kg;
function mt() {
  if (kg) return Jc;
  kg = 1;
  const e = _s(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: a } = vs(), { safeRe: n, t: l } = Un(), r = yl(), { compareIdentifiers: i } = N0();
  class u {
    constructor(c, s) {
      if (s = r(s), c instanceof u) {
        if (c.loose === !!s.loose && c.includePrerelease === !!s.includePrerelease)
          return c;
        c = c.version;
      } else if (typeof c != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof c}".`);
      if (c.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", c, s), this.options = s, this.loose = !!s.loose, this.includePrerelease = !!s.includePrerelease;
      const d = c.trim().match(s.loose ? n[l.LOOSE] : n[l.FULL]);
      if (!d)
        throw new TypeError(`Invalid Version: ${c}`);
      if (this.raw = c, this.major = +d[1], this.minor = +d[2], this.patch = +d[3], this.major > a || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > a || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > a || this.patch < 0)
        throw new TypeError("Invalid patch version");
      d[4] ? this.prerelease = d[4].split(".").map((f) => {
        if (/^[0-9]+$/.test(f)) {
          const m = +f;
          if (m >= 0 && m < a)
            return m;
        }
        return f;
      }) : this.prerelease = [], this.build = d[5] ? d[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(c) {
      if (e("SemVer.compare", this.version, this.options, c), !(c instanceof u)) {
        if (typeof c == "string" && c === this.version)
          return 0;
        c = new u(c, this.options);
      }
      return c.version === this.version ? 0 : this.compareMain(c) || this.comparePre(c);
    }
    compareMain(c) {
      return c instanceof u || (c = new u(c, this.options)), this.major < c.major ? -1 : this.major > c.major ? 1 : this.minor < c.minor ? -1 : this.minor > c.minor ? 1 : this.patch < c.patch ? -1 : this.patch > c.patch ? 1 : 0;
    }
    comparePre(c) {
      if (c instanceof u || (c = new u(c, this.options)), this.prerelease.length && !c.prerelease.length)
        return -1;
      if (!this.prerelease.length && c.prerelease.length)
        return 1;
      if (!this.prerelease.length && !c.prerelease.length)
        return 0;
      let s = 0;
      do {
        const d = this.prerelease[s], f = c.prerelease[s];
        if (e("prerelease compare", s, d, f), d === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (d === void 0)
          return -1;
        if (d === f)
          continue;
        return i(d, f);
      } while (++s);
    }
    compareBuild(c) {
      c instanceof u || (c = new u(c, this.options));
      let s = 0;
      do {
        const d = this.build[s], f = c.build[s];
        if (e("build compare", s, d, f), d === void 0 && f === void 0)
          return 0;
        if (f === void 0)
          return 1;
        if (d === void 0)
          return -1;
        if (d === f)
          continue;
        return i(d, f);
      } while (++s);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(c, s, d) {
      if (c.startsWith("pre")) {
        if (!s && d === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (s) {
          const f = `-${s}`.match(this.options.loose ? n[l.PRERELEASELOOSE] : n[l.PRERELEASE]);
          if (!f || f[1] !== s)
            throw new Error(`invalid identifier: ${s}`);
        }
      }
      switch (c) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", s, d);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", s, d);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", s, d), this.inc("pre", s, d);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", s, d), this.inc("pre", s, d);
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
          const f = Number(d) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [f];
          else {
            let m = this.prerelease.length;
            for (; --m >= 0; )
              typeof this.prerelease[m] == "number" && (this.prerelease[m]++, m = -2);
            if (m === -1) {
              if (s === this.prerelease.join(".") && d === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(f);
            }
          }
          if (s) {
            let m = [s, f];
            d === !1 && (m = [s]), i(this.prerelease[0], s) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = m) : this.prerelease = m;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${c}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return Jc = u, Jc;
}
var Qc, Lg;
function tn() {
  if (Lg) return Qc;
  Lg = 1;
  const e = mt();
  return Qc = (a, n, l = !1) => {
    if (a instanceof e)
      return a;
    try {
      return new e(a, n);
    } catch (r) {
      if (!l)
        return null;
      throw r;
    }
  }, Qc;
}
var Zc, qg;
function mb() {
  if (qg) return Zc;
  qg = 1;
  const e = tn();
  return Zc = (a, n) => {
    const l = e(a, n);
    return l ? l.version : null;
  }, Zc;
}
var eu, Fg;
function gb() {
  if (Fg) return eu;
  Fg = 1;
  const e = tn();
  return eu = (a, n) => {
    const l = e(a.trim().replace(/^[=v]+/, ""), n);
    return l ? l.version : null;
  }, eu;
}
var tu, Ug;
function yb() {
  if (Ug) return tu;
  Ug = 1;
  const e = mt();
  return tu = (a, n, l, r, i) => {
    typeof l == "string" && (i = r, r = l, l = void 0);
    try {
      return new e(
        a instanceof e ? a.version : a,
        l
      ).inc(n, r, i).version;
    } catch {
      return null;
    }
  }, tu;
}
var ru, jg;
function vb() {
  if (jg) return ru;
  jg = 1;
  const e = tn();
  return ru = (a, n) => {
    const l = e(a, null, !0), r = e(n, null, !0), i = l.compare(r);
    if (i === 0)
      return null;
    const u = i > 0, o = u ? l : r, c = u ? r : l, s = !!o.prerelease.length;
    if (!!c.prerelease.length && !s) {
      if (!c.patch && !c.minor)
        return "major";
      if (c.compareMain(o) === 0)
        return c.minor && !c.patch ? "minor" : "patch";
    }
    const f = s ? "pre" : "";
    return l.major !== r.major ? f + "major" : l.minor !== r.minor ? f + "minor" : l.patch !== r.patch ? f + "patch" : "prerelease";
  }, ru;
}
var nu, Mg;
function _b() {
  if (Mg) return nu;
  Mg = 1;
  const e = mt();
  return nu = (a, n) => new e(a, n).major, nu;
}
var iu, xg;
function Eb() {
  if (xg) return iu;
  xg = 1;
  const e = mt();
  return iu = (a, n) => new e(a, n).minor, iu;
}
var au, Vg;
function wb() {
  if (Vg) return au;
  Vg = 1;
  const e = mt();
  return au = (a, n) => new e(a, n).patch, au;
}
var su, Gg;
function $b() {
  if (Gg) return su;
  Gg = 1;
  const e = tn();
  return su = (a, n) => {
    const l = e(a, n);
    return l && l.prerelease.length ? l.prerelease : null;
  }, su;
}
var ou, Bg;
function Ft() {
  if (Bg) return ou;
  Bg = 1;
  const e = mt();
  return ou = (a, n, l) => new e(a, l).compare(new e(n, l)), ou;
}
var cu, Hg;
function Sb() {
  if (Hg) return cu;
  Hg = 1;
  const e = Ft();
  return cu = (a, n, l) => e(n, a, l), cu;
}
var uu, zg;
function bb() {
  if (zg) return uu;
  zg = 1;
  const e = Ft();
  return uu = (a, n) => e(a, n, !0), uu;
}
var lu, Kg;
function vl() {
  if (Kg) return lu;
  Kg = 1;
  const e = mt();
  return lu = (a, n, l) => {
    const r = new e(a, l), i = new e(n, l);
    return r.compare(i) || r.compareBuild(i);
  }, lu;
}
var fu, Xg;
function Rb() {
  if (Xg) return fu;
  Xg = 1;
  const e = vl();
  return fu = (a, n) => a.sort((l, r) => e(l, r, n)), fu;
}
var du, Wg;
function Tb() {
  if (Wg) return du;
  Wg = 1;
  const e = vl();
  return du = (a, n) => a.sort((l, r) => e(r, l, n)), du;
}
var hu, Yg;
function Es() {
  if (Yg) return hu;
  Yg = 1;
  const e = Ft();
  return hu = (a, n, l) => e(a, n, l) > 0, hu;
}
var pu, Jg;
function _l() {
  if (Jg) return pu;
  Jg = 1;
  const e = Ft();
  return pu = (a, n, l) => e(a, n, l) < 0, pu;
}
var mu, Qg;
function I0() {
  if (Qg) return mu;
  Qg = 1;
  const e = Ft();
  return mu = (a, n, l) => e(a, n, l) === 0, mu;
}
var gu, Zg;
function O0() {
  if (Zg) return gu;
  Zg = 1;
  const e = Ft();
  return gu = (a, n, l) => e(a, n, l) !== 0, gu;
}
var yu, ey;
function El() {
  if (ey) return yu;
  ey = 1;
  const e = Ft();
  return yu = (a, n, l) => e(a, n, l) >= 0, yu;
}
var vu, ty;
function wl() {
  if (ty) return vu;
  ty = 1;
  const e = Ft();
  return vu = (a, n, l) => e(a, n, l) <= 0, vu;
}
var _u, ry;
function A0() {
  if (ry) return _u;
  ry = 1;
  const e = I0(), t = O0(), a = Es(), n = El(), l = _l(), r = wl();
  return _u = (u, o, c, s) => {
    switch (o) {
      case "===":
        return typeof u == "object" && (u = u.version), typeof c == "object" && (c = c.version), u === c;
      case "!==":
        return typeof u == "object" && (u = u.version), typeof c == "object" && (c = c.version), u !== c;
      case "":
      case "=":
      case "==":
        return e(u, c, s);
      case "!=":
        return t(u, c, s);
      case ">":
        return a(u, c, s);
      case ">=":
        return n(u, c, s);
      case "<":
        return l(u, c, s);
      case "<=":
        return r(u, c, s);
      default:
        throw new TypeError(`Invalid operator: ${o}`);
    }
  }, _u;
}
var Eu, ny;
function Pb() {
  if (ny) return Eu;
  ny = 1;
  const e = mt(), t = tn(), { safeRe: a, t: n } = Un();
  return Eu = (r, i) => {
    if (r instanceof e)
      return r;
    if (typeof r == "number" && (r = String(r)), typeof r != "string")
      return null;
    i = i || {};
    let u = null;
    if (!i.rtl)
      u = r.match(i.includePrerelease ? a[n.COERCEFULL] : a[n.COERCE]);
    else {
      const m = i.includePrerelease ? a[n.COERCERTLFULL] : a[n.COERCERTL];
      let y;
      for (; (y = m.exec(r)) && (!u || u.index + u[0].length !== r.length); )
        (!u || y.index + y[0].length !== u.index + u[0].length) && (u = y), m.lastIndex = y.index + y[1].length + y[2].length;
      m.lastIndex = -1;
    }
    if (u === null)
      return null;
    const o = u[2], c = u[3] || "0", s = u[4] || "0", d = i.includePrerelease && u[5] ? `-${u[5]}` : "", f = i.includePrerelease && u[6] ? `+${u[6]}` : "";
    return t(`${o}.${c}.${s}${d}${f}`, i);
  }, Eu;
}
var wu, iy;
function Nb() {
  if (iy) return wu;
  iy = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(a) {
      const n = this.map.get(a);
      if (n !== void 0)
        return this.map.delete(a), this.map.set(a, n), n;
    }
    delete(a) {
      return this.map.delete(a);
    }
    set(a, n) {
      if (!this.delete(a) && n !== void 0) {
        if (this.map.size >= this.max) {
          const r = this.map.keys().next().value;
          this.delete(r);
        }
        this.map.set(a, n);
      }
      return this;
    }
  }
  return wu = e, wu;
}
var $u, ay;
function Ut() {
  if (ay) return $u;
  ay = 1;
  const e = /\s+/g;
  class t {
    constructor(F, Y) {
      if (Y = l(Y), F instanceof t)
        return F.loose === !!Y.loose && F.includePrerelease === !!Y.includePrerelease ? F : new t(F.raw, Y);
      if (F instanceof r)
        return this.raw = F.value, this.set = [[F]], this.formatted = void 0, this;
      if (this.options = Y, this.loose = !!Y.loose, this.includePrerelease = !!Y.includePrerelease, this.raw = F.trim().replace(e, " "), this.set = this.raw.split("||").map((B) => this.parseRange(B.trim())).filter((B) => B.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const B = this.set[0];
        if (this.set = this.set.filter((W) => !v(W[0])), this.set.length === 0)
          this.set = [B];
        else if (this.set.length > 1) {
          for (const W of this.set)
            if (W.length === 1 && h(W[0])) {
              this.set = [W];
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
          const Y = this.set[F];
          for (let B = 0; B < Y.length; B++)
            B > 0 && (this.formatted += " "), this.formatted += Y[B].toString().trim();
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
      const B = ((this.options.includePrerelease && m) | (this.options.loose && y)) + ":" + F, W = n.get(B);
      if (W)
        return W;
      const Z = this.options.loose, V = Z ? o[c.HYPHENRANGELOOSE] : o[c.HYPHENRANGE];
      F = F.replace(V, M(this.options.includePrerelease)), i("hyphen replace", F), F = F.replace(o[c.COMPARATORTRIM], s), i("comparator trim", F), F = F.replace(o[c.TILDETRIM], d), i("tilde trim", F), F = F.replace(o[c.CARETTRIM], f), i("caret trim", F);
      let C = F.split(" ").map((N) => p(N, this.options)).join(" ").split(/\s+/).map((N) => q(N, this.options));
      Z && (C = C.filter((N) => (i("loose invalid filter", N, this.options), !!N.match(o[c.COMPARATORLOOSE])))), i("range list", C);
      const j = /* @__PURE__ */ new Map(), D = C.map((N) => new r(N, this.options));
      for (const N of D) {
        if (v(N))
          return [N];
        j.set(N.value, N);
      }
      j.size > 1 && j.has("") && j.delete("");
      const R = [...j.values()];
      return n.set(B, R), R;
    }
    intersects(F, Y) {
      if (!(F instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((B) => g(B, Y) && F.set.some((W) => g(W, Y) && B.every((Z) => W.every((V) => Z.intersects(V, Y)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(F) {
      if (!F)
        return !1;
      if (typeof F == "string")
        try {
          F = new u(F, this.options);
        } catch {
          return !1;
        }
      for (let Y = 0; Y < this.set.length; Y++)
        if (K(this.set[Y], F, this.options))
          return !0;
      return !1;
    }
  }
  $u = t;
  const a = Nb(), n = new a(), l = yl(), r = ws(), i = _s(), u = mt(), {
    safeRe: o,
    t: c,
    comparatorTrimReplace: s,
    tildeTrimReplace: d,
    caretTrimReplace: f
  } = Un(), { FLAG_INCLUDE_PRERELEASE: m, FLAG_LOOSE: y } = vs(), v = (k) => k.value === "<0.0.0-0", h = (k) => k.value === "", g = (k, F) => {
    let Y = !0;
    const B = k.slice();
    let W = B.pop();
    for (; Y && B.length; )
      Y = B.every((Z) => W.intersects(Z, F)), W = B.pop();
    return Y;
  }, p = (k, F) => (k = k.replace(o[c.BUILD], ""), i("comp", k, F), k = _(k, F), i("caret", k), k = b(k, F), i("tildes", k), k = T(k, F), i("xrange", k), k = G(k, F), i("stars", k), k), E = (k) => !k || k.toLowerCase() === "x" || k === "*", b = (k, F) => k.trim().split(/\s+/).map((Y) => $(Y, F)).join(" "), $ = (k, F) => {
    const Y = F.loose ? o[c.TILDELOOSE] : o[c.TILDE];
    return k.replace(Y, (B, W, Z, V, C) => {
      i("tilde", k, B, W, Z, V, C);
      let j;
      return E(W) ? j = "" : E(Z) ? j = `>=${W}.0.0 <${+W + 1}.0.0-0` : E(V) ? j = `>=${W}.${Z}.0 <${W}.${+Z + 1}.0-0` : C ? (i("replaceTilde pr", C), j = `>=${W}.${Z}.${V}-${C} <${W}.${+Z + 1}.0-0`) : j = `>=${W}.${Z}.${V} <${W}.${+Z + 1}.0-0`, i("tilde return", j), j;
    });
  }, _ = (k, F) => k.trim().split(/\s+/).map((Y) => w(Y, F)).join(" "), w = (k, F) => {
    i("caret", k, F);
    const Y = F.loose ? o[c.CARETLOOSE] : o[c.CARET], B = F.includePrerelease ? "-0" : "";
    return k.replace(Y, (W, Z, V, C, j) => {
      i("caret", k, W, Z, V, C, j);
      let D;
      return E(Z) ? D = "" : E(V) ? D = `>=${Z}.0.0${B} <${+Z + 1}.0.0-0` : E(C) ? Z === "0" ? D = `>=${Z}.${V}.0${B} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.0${B} <${+Z + 1}.0.0-0` : j ? (i("replaceCaret pr", j), Z === "0" ? V === "0" ? D = `>=${Z}.${V}.${C}-${j} <${Z}.${V}.${+C + 1}-0` : D = `>=${Z}.${V}.${C}-${j} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.${C}-${j} <${+Z + 1}.0.0-0`) : (i("no pr"), Z === "0" ? V === "0" ? D = `>=${Z}.${V}.${C}${B} <${Z}.${V}.${+C + 1}-0` : D = `>=${Z}.${V}.${C}${B} <${Z}.${+V + 1}.0-0` : D = `>=${Z}.${V}.${C} <${+Z + 1}.0.0-0`), i("caret return", D), D;
    });
  }, T = (k, F) => (i("replaceXRanges", k, F), k.split(/\s+/).map((Y) => P(Y, F)).join(" ")), P = (k, F) => {
    k = k.trim();
    const Y = F.loose ? o[c.XRANGELOOSE] : o[c.XRANGE];
    return k.replace(Y, (B, W, Z, V, C, j) => {
      i("xRange", k, B, W, Z, V, C, j);
      const D = E(Z), R = D || E(V), N = R || E(C), x = N;
      return W === "=" && x && (W = ""), j = F.includePrerelease ? "-0" : "", D ? W === ">" || W === "<" ? B = "<0.0.0-0" : B = "*" : W && x ? (R && (V = 0), C = 0, W === ">" ? (W = ">=", R ? (Z = +Z + 1, V = 0, C = 0) : (V = +V + 1, C = 0)) : W === "<=" && (W = "<", R ? Z = +Z + 1 : V = +V + 1), W === "<" && (j = "-0"), B = `${W + Z}.${V}.${C}${j}`) : R ? B = `>=${Z}.0.0${j} <${+Z + 1}.0.0-0` : N && (B = `>=${Z}.${V}.0${j} <${Z}.${+V + 1}.0-0`), i("xRange return", B), B;
    });
  }, G = (k, F) => (i("replaceStars", k, F), k.trim().replace(o[c.STAR], "")), q = (k, F) => (i("replaceGTE0", k, F), k.trim().replace(o[F.includePrerelease ? c.GTE0PRE : c.GTE0], "")), M = (k) => (F, Y, B, W, Z, V, C, j, D, R, N, x) => (E(B) ? Y = "" : E(W) ? Y = `>=${B}.0.0${k ? "-0" : ""}` : E(Z) ? Y = `>=${B}.${W}.0${k ? "-0" : ""}` : V ? Y = `>=${Y}` : Y = `>=${Y}${k ? "-0" : ""}`, E(D) ? j = "" : E(R) ? j = `<${+D + 1}.0.0-0` : E(N) ? j = `<${D}.${+R + 1}.0-0` : x ? j = `<=${D}.${R}.${N}-${x}` : k ? j = `<${D}.${R}.${+N + 1}-0` : j = `<=${j}`, `${Y} ${j}`.trim()), K = (k, F, Y) => {
    for (let B = 0; B < k.length; B++)
      if (!k[B].test(F))
        return !1;
    if (F.prerelease.length && !Y.includePrerelease) {
      for (let B = 0; B < k.length; B++)
        if (i(k[B].semver), k[B].semver !== r.ANY && k[B].semver.prerelease.length > 0) {
          const W = k[B].semver;
          if (W.major === F.major && W.minor === F.minor && W.patch === F.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return $u;
}
var Su, sy;
function ws() {
  if (sy) return Su;
  sy = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(s, d) {
      if (d = a(d), s instanceof t) {
        if (s.loose === !!d.loose)
          return s;
        s = s.value;
      }
      s = s.trim().split(/\s+/).join(" "), i("comparator", s, d), this.options = d, this.loose = !!d.loose, this.parse(s), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(s) {
      const d = this.options.loose ? n[l.COMPARATORLOOSE] : n[l.COMPARATOR], f = s.match(d);
      if (!f)
        throw new TypeError(`Invalid comparator: ${s}`);
      this.operator = f[1] !== void 0 ? f[1] : "", this.operator === "=" && (this.operator = ""), f[2] ? this.semver = new u(f[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(s) {
      if (i("Comparator.test", s, this.options.loose), this.semver === e || s === e)
        return !0;
      if (typeof s == "string")
        try {
          s = new u(s, this.options);
        } catch {
          return !1;
        }
      return r(s, this.operator, this.semver, this.options);
    }
    intersects(s, d) {
      if (!(s instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new o(s.value, d).test(this.value) : s.operator === "" ? s.value === "" ? !0 : new o(this.value, d).test(s.semver) : (d = a(d), d.includePrerelease && (this.value === "<0.0.0-0" || s.value === "<0.0.0-0") || !d.includePrerelease && (this.value.startsWith("<0.0.0") || s.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && s.operator.startsWith(">") || this.operator.startsWith("<") && s.operator.startsWith("<") || this.semver.version === s.semver.version && this.operator.includes("=") && s.operator.includes("=") || r(this.semver, "<", s.semver, d) && this.operator.startsWith(">") && s.operator.startsWith("<") || r(this.semver, ">", s.semver, d) && this.operator.startsWith("<") && s.operator.startsWith(">")));
    }
  }
  Su = t;
  const a = yl(), { safeRe: n, t: l } = Un(), r = A0(), i = _s(), u = mt(), o = Ut();
  return Su;
}
var bu, oy;
function $s() {
  if (oy) return bu;
  oy = 1;
  const e = Ut();
  return bu = (a, n, l) => {
    try {
      n = new e(n, l);
    } catch {
      return !1;
    }
    return n.test(a);
  }, bu;
}
var Ru, cy;
function Ib() {
  if (cy) return Ru;
  cy = 1;
  const e = Ut();
  return Ru = (a, n) => new e(a, n).set.map((l) => l.map((r) => r.value).join(" ").trim().split(" ")), Ru;
}
var Tu, uy;
function Ob() {
  if (uy) return Tu;
  uy = 1;
  const e = mt(), t = Ut();
  return Tu = (n, l, r) => {
    let i = null, u = null, o = null;
    try {
      o = new t(l, r);
    } catch {
      return null;
    }
    return n.forEach((c) => {
      o.test(c) && (!i || u.compare(c) === -1) && (i = c, u = new e(i, r));
    }), i;
  }, Tu;
}
var Pu, ly;
function Ab() {
  if (ly) return Pu;
  ly = 1;
  const e = mt(), t = Ut();
  return Pu = (n, l, r) => {
    let i = null, u = null, o = null;
    try {
      o = new t(l, r);
    } catch {
      return null;
    }
    return n.forEach((c) => {
      o.test(c) && (!i || u.compare(c) === 1) && (i = c, u = new e(i, r));
    }), i;
  }, Pu;
}
var Nu, fy;
function Cb() {
  if (fy) return Nu;
  fy = 1;
  const e = mt(), t = Ut(), a = Es();
  return Nu = (l, r) => {
    l = new t(l, r);
    let i = new e("0.0.0");
    if (l.test(i) || (i = new e("0.0.0-0"), l.test(i)))
      return i;
    i = null;
    for (let u = 0; u < l.set.length; ++u) {
      const o = l.set[u];
      let c = null;
      o.forEach((s) => {
        const d = new e(s.semver.version);
        switch (s.operator) {
          case ">":
            d.prerelease.length === 0 ? d.patch++ : d.prerelease.push(0), d.raw = d.format();
          /* fallthrough */
          case "":
          case ">=":
            (!c || a(d, c)) && (c = d);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${s.operator}`);
        }
      }), c && (!i || a(i, c)) && (i = c);
    }
    return i && l.test(i) ? i : null;
  }, Nu;
}
var Iu, dy;
function Db() {
  if (dy) return Iu;
  dy = 1;
  const e = Ut();
  return Iu = (a, n) => {
    try {
      return new e(a, n).range || "*";
    } catch {
      return null;
    }
  }, Iu;
}
var Ou, hy;
function $l() {
  if (hy) return Ou;
  hy = 1;
  const e = mt(), t = ws(), { ANY: a } = t, n = Ut(), l = $s(), r = Es(), i = _l(), u = wl(), o = El();
  return Ou = (s, d, f, m) => {
    s = new e(s, m), d = new n(d, m);
    let y, v, h, g, p;
    switch (f) {
      case ">":
        y = r, v = u, h = i, g = ">", p = ">=";
        break;
      case "<":
        y = i, v = o, h = r, g = "<", p = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (l(s, d, m))
      return !1;
    for (let E = 0; E < d.set.length; ++E) {
      const b = d.set[E];
      let $ = null, _ = null;
      if (b.forEach((w) => {
        w.semver === a && (w = new t(">=0.0.0")), $ = $ || w, _ = _ || w, y(w.semver, $.semver, m) ? $ = w : h(w.semver, _.semver, m) && (_ = w);
      }), $.operator === g || $.operator === p || (!_.operator || _.operator === g) && v(s, _.semver))
        return !1;
      if (_.operator === p && h(s, _.semver))
        return !1;
    }
    return !0;
  }, Ou;
}
var Au, py;
function kb() {
  if (py) return Au;
  py = 1;
  const e = $l();
  return Au = (a, n, l) => e(a, n, ">", l), Au;
}
var Cu, my;
function Lb() {
  if (my) return Cu;
  my = 1;
  const e = $l();
  return Cu = (a, n, l) => e(a, n, "<", l), Cu;
}
var Du, gy;
function qb() {
  if (gy) return Du;
  gy = 1;
  const e = Ut();
  return Du = (a, n, l) => (a = new e(a, l), n = new e(n, l), a.intersects(n, l)), Du;
}
var ku, yy;
function Fb() {
  if (yy) return ku;
  yy = 1;
  const e = $s(), t = Ft();
  return ku = (a, n, l) => {
    const r = [];
    let i = null, u = null;
    const o = a.sort((f, m) => t(f, m, l));
    for (const f of o)
      e(f, n, l) ? (u = f, i || (i = f)) : (u && r.push([i, u]), u = null, i = null);
    i && r.push([i, null]);
    const c = [];
    for (const [f, m] of r)
      f === m ? c.push(f) : !m && f === o[0] ? c.push("*") : m ? f === o[0] ? c.push(`<=${m}`) : c.push(`${f} - ${m}`) : c.push(`>=${f}`);
    const s = c.join(" || "), d = typeof n.raw == "string" ? n.raw : String(n);
    return s.length < d.length ? s : n;
  }, ku;
}
var Lu, vy;
function Ub() {
  if (vy) return Lu;
  vy = 1;
  const e = Ut(), t = ws(), { ANY: a } = t, n = $s(), l = Ft(), r = (d, f, m = {}) => {
    if (d === f)
      return !0;
    d = new e(d, m), f = new e(f, m);
    let y = !1;
    e: for (const v of d.set) {
      for (const h of f.set) {
        const g = o(v, h, m);
        if (y = y || g !== null, g)
          continue e;
      }
      if (y)
        return !1;
    }
    return !0;
  }, i = [new t(">=0.0.0-0")], u = [new t(">=0.0.0")], o = (d, f, m) => {
    if (d === f)
      return !0;
    if (d.length === 1 && d[0].semver === a) {
      if (f.length === 1 && f[0].semver === a)
        return !0;
      m.includePrerelease ? d = i : d = u;
    }
    if (f.length === 1 && f[0].semver === a) {
      if (m.includePrerelease)
        return !0;
      f = u;
    }
    const y = /* @__PURE__ */ new Set();
    let v, h;
    for (const T of d)
      T.operator === ">" || T.operator === ">=" ? v = c(v, T, m) : T.operator === "<" || T.operator === "<=" ? h = s(h, T, m) : y.add(T.semver);
    if (y.size > 1)
      return null;
    let g;
    if (v && h) {
      if (g = l(v.semver, h.semver, m), g > 0)
        return null;
      if (g === 0 && (v.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const T of y) {
      if (v && !n(T, String(v), m) || h && !n(T, String(h), m))
        return null;
      for (const P of f)
        if (!n(T, String(P), m))
          return !1;
      return !0;
    }
    let p, E, b, $, _ = h && !m.includePrerelease && h.semver.prerelease.length ? h.semver : !1, w = v && !m.includePrerelease && v.semver.prerelease.length ? v.semver : !1;
    _ && _.prerelease.length === 1 && h.operator === "<" && _.prerelease[0] === 0 && (_ = !1);
    for (const T of f) {
      if ($ = $ || T.operator === ">" || T.operator === ">=", b = b || T.operator === "<" || T.operator === "<=", v) {
        if (w && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === w.major && T.semver.minor === w.minor && T.semver.patch === w.patch && (w = !1), T.operator === ">" || T.operator === ">=") {
          if (p = c(v, T, m), p === T && p !== v)
            return !1;
        } else if (v.operator === ">=" && !n(v.semver, String(T), m))
          return !1;
      }
      if (h) {
        if (_ && T.semver.prerelease && T.semver.prerelease.length && T.semver.major === _.major && T.semver.minor === _.minor && T.semver.patch === _.patch && (_ = !1), T.operator === "<" || T.operator === "<=") {
          if (E = s(h, T, m), E === T && E !== h)
            return !1;
        } else if (h.operator === "<=" && !n(h.semver, String(T), m))
          return !1;
      }
      if (!T.operator && (h || v) && g !== 0)
        return !1;
    }
    return !(v && b && !h && g !== 0 || h && $ && !v && g !== 0 || w || _);
  }, c = (d, f, m) => {
    if (!d)
      return f;
    const y = l(d.semver, f.semver, m);
    return y > 0 ? d : y < 0 || f.operator === ">" && d.operator === ">=" ? f : d;
  }, s = (d, f, m) => {
    if (!d)
      return f;
    const y = l(d.semver, f.semver, m);
    return y < 0 ? d : y > 0 || f.operator === "<" && d.operator === "<=" ? f : d;
  };
  return Lu = r, Lu;
}
var qu, _y;
function jb() {
  if (_y) return qu;
  _y = 1;
  const e = Un(), t = vs(), a = mt(), n = N0(), l = tn(), r = mb(), i = gb(), u = yb(), o = vb(), c = _b(), s = Eb(), d = wb(), f = $b(), m = Ft(), y = Sb(), v = bb(), h = vl(), g = Rb(), p = Tb(), E = Es(), b = _l(), $ = I0(), _ = O0(), w = El(), T = wl(), P = A0(), G = Pb(), q = ws(), M = Ut(), K = $s(), k = Ib(), F = Ob(), Y = Ab(), B = Cb(), W = Db(), Z = $l(), V = kb(), C = Lb(), j = qb(), D = Fb(), R = Ub();
  return qu = {
    parse: l,
    valid: r,
    clean: i,
    inc: u,
    diff: o,
    major: c,
    minor: s,
    patch: d,
    prerelease: f,
    compare: m,
    rcompare: y,
    compareLoose: v,
    compareBuild: h,
    sort: g,
    rsort: p,
    gt: E,
    lt: b,
    eq: $,
    neq: _,
    gte: w,
    lte: T,
    cmp: P,
    coerce: G,
    Comparator: q,
    Range: M,
    satisfies: K,
    toComparators: k,
    maxSatisfying: F,
    minSatisfying: Y,
    minVersion: B,
    validRange: W,
    outside: Z,
    gtr: V,
    ltr: C,
    intersects: j,
    simplifyRange: D,
    subset: R,
    SemVer: a,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, qu;
}
var Mb = jb();
const Kr = /* @__PURE__ */ Ay(Mb), xb = Object.prototype.toString, Vb = "[object Uint8Array]", Gb = "[object ArrayBuffer]";
function C0(e, t, a) {
  return e ? e.constructor === t ? !0 : xb.call(e) === a : !1;
}
function D0(e) {
  return C0(e, Uint8Array, Vb);
}
function Bb(e) {
  return C0(e, ArrayBuffer, Gb);
}
function Hb(e) {
  return D0(e) || Bb(e);
}
function zb(e) {
  if (!D0(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Kb(e) {
  if (!Hb(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Fu(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ??= e.reduce((l, r) => l + r.length, 0);
  const a = new Uint8Array(t);
  let n = 0;
  for (const l of e)
    zb(l), a.set(l, n), n += l.length;
  return a;
}
const Ey = {
  utf8: new globalThis.TextDecoder("utf8")
};
function xa(e, t = "utf8") {
  return Kb(e), Ey[t] ??= new globalThis.TextDecoder(t), Ey[t].decode(e);
}
function Xb(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Wb = new globalThis.TextEncoder();
function Va(e) {
  return Xb(e), Wb.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Uu = "aes-256-cbc", cr = () => /* @__PURE__ */ Object.create(null), wy = (e) => e !== void 0, ju = (e, t) => {
  const a = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (a.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, ur = "__internal__", Mu = `${ur}.migrations.version`;
class Yb {
  path;
  events;
  #i;
  #r;
  #e;
  #t = {};
  #a = !1;
  #s;
  #o;
  #n;
  constructor(t = {}) {
    const a = this.#c(t);
    this.#e = a, this.#u(a), this.#f(a), this.#d(a), this.events = new EventTarget(), this.#r = a.encryptionKey, this.path = this.#h(a), this.#p(a), a.watch && this._watch();
  }
  get(t, a) {
    if (this.#e.accessPropertiesByDotNotation)
      return this._get(t, a);
    const { store: n } = this;
    return t in n ? n[t] : a;
  }
  set(t, a) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && a === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${ur} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, l = (r, i) => {
      if (ju(r, i), this.#e.accessPropertiesByDotNotation)
        ii(n, r, i);
      else {
        if (r === "__proto__" || r === "constructor" || r === "prototype")
          return;
        n[r] = i;
      }
    };
    if (typeof t == "object") {
      const r = t;
      for (const [i, u] of Object.entries(r))
        l(i, u);
    } else
      l(t, a);
    this.store = n;
  }
  has(t) {
    return this.#e.accessPropertiesByDotNotation ? Tc(this.store, t) : t in this.store;
  }
  appendToArray(t, a) {
    ju(t, a);
    const n = this.#e.accessPropertiesByDotNotation ? this._get(t, []) : t in this.store ? this.store[t] : [];
    if (!Array.isArray(n))
      throw new TypeError(`The key \`${t}\` is already set to a non-array value`);
    this.set(t, [...n, a]);
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const a of t)
      wy(this.#t[a]) && this.set(a, this.#t[a]);
  }
  delete(t) {
    const { store: a } = this;
    this.#e.accessPropertiesByDotNotation ? dE(a, t) : delete a[t], this.store = a;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    const t = cr();
    for (const a of Object.keys(this.#t))
      wy(this.#t[a]) && (ju(a, this.#t[a]), this.#e.accessPropertiesByDotNotation ? ii(t, a, this.#t[a]) : t[a] = this.#t[a]);
    this.store = t;
  }
  onDidChange(t, a) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof a != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof a}`);
    return this._handleValueChange(() => this.get(t), a);
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
    return Object.keys(this.store).filter((a) => !this._isReservedKeyPath(a)).length;
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
      const t = Te.readFileSync(this.path, this.#r ? null : "utf8"), a = this._decryptData(t), n = this._deserialize(a);
      return this.#a || this._validate(n), Object.assign(cr(), n);
    } catch (t) {
      if (t?.code === "ENOENT")
        return this._ensureDirectory(), cr();
      if (this.#e.clearInvalidConfig) {
        const a = t;
        if (a.name === "SyntaxError" || a.message?.startsWith("Config schema violation:"))
          return cr();
      }
      throw t;
    }
  }
  set store(t) {
    if (this._ensureDirectory(), !Tc(t, ur))
      try {
        const a = Te.readFileSync(this.path, this.#r ? null : "utf8"), n = this._decryptData(a), l = this._deserialize(n);
        Tc(l, ur) && ii(t, ur, Mh(l, ur));
      } catch {
      }
    this.#a || this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, a] of Object.entries(this.store))
      this._isReservedKeyPath(t) || (yield [t, a]);
  }
  /**
  Close the file watcher if one exists. This is useful in tests to prevent the process from hanging.
  */
  _closeWatcher() {
    this.#s && (this.#s.close(), this.#s = void 0), this.#o && (Te.unwatchFile(this.path), this.#o = !1), this.#n = void 0;
  }
  _decryptData(t) {
    if (!this.#r)
      return typeof t == "string" ? t : xa(t);
    try {
      const a = t.slice(0, 16), n = vr.pbkdf2Sync(this.#r, a, 1e4, 32, "sha512"), l = vr.createDecipheriv(Uu, n, a), r = t.slice(17), i = typeof r == "string" ? Va(r) : r;
      return xa(Fu([l.update(i), l.final()]));
    } catch {
      try {
        const a = t.slice(0, 16), n = vr.pbkdf2Sync(this.#r, a.toString(), 1e4, 32, "sha512"), l = vr.createDecipheriv(Uu, n, a), r = t.slice(17), i = typeof r == "string" ? Va(r) : r;
        return xa(Fu([l.update(i), l.final()]));
      } catch {
      }
    }
    return typeof t == "string" ? t : xa(t);
  }
  _handleStoreChange(t) {
    let a = this.store;
    const n = () => {
      const l = a, r = this.store;
      ql(r, l) || (a = r, t.call(this, r, l));
    };
    return this.events.addEventListener("change", n), () => {
      this.events.removeEventListener("change", n);
    };
  }
  _handleValueChange(t, a) {
    let n = t();
    const l = () => {
      const r = n, i = t();
      ql(i, r) || (n = i, a.call(this, i, r));
    };
    return this.events.addEventListener("change", l), () => {
      this.events.removeEventListener("change", l);
    };
  }
  _deserialize = (t) => JSON.parse(t);
  _serialize = (t) => JSON.stringify(t, void 0, "	");
  _validate(t) {
    if (!this.#i || this.#i(t) || !this.#i.errors)
      return;
    const n = this.#i.errors.map(({ instancePath: l, message: r = "" }) => `\`${l.slice(1)}\` ${r}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Te.mkdirSync(je.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let a = this._serialize(t);
    if (this.#r) {
      const n = vr.randomBytes(16), l = vr.pbkdf2Sync(this.#r, n, 1e4, 32, "sha512"), r = vr.createCipheriv(Uu, l, n);
      a = Fu([n, Va(":"), r.update(Va(a)), r.final()]);
    }
    if (Ke.env.SNAP)
      Te.writeFileSync(this.path, a, { mode: this.#e.configFileMode });
    else
      try {
        h0(this.path, a, { mode: this.#e.configFileMode });
      } catch (n) {
        if (n?.code === "EXDEV") {
          Te.writeFileSync(this.path, a, { mode: this.#e.configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    if (this._ensureDirectory(), Te.existsSync(this.path) || this._write(cr()), Ke.platform === "win32" || Ke.platform === "darwin") {
      this.#n ??= Ng(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 });
      const t = je.dirname(this.path), a = je.basename(this.path);
      this.#s = Te.watch(t, { persistent: !1, encoding: "utf8" }, (n, l) => {
        l && l !== a || typeof this.#n == "function" && this.#n();
      });
    } else
      this.#n ??= Ng(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 1e3 }), Te.watchFile(this.path, { persistent: !1 }, (t, a) => {
        typeof this.#n == "function" && this.#n();
      }), this.#o = !0;
  }
  _migrate(t, a, n) {
    let l = this._get(Mu, "0.0.0");
    const r = Object.keys(t).filter((u) => this._shouldPerformMigration(u, l, a));
    let i = structuredClone(this.store);
    for (const u of r)
      try {
        n && n(this, {
          fromVersion: l,
          toVersion: u,
          finalVersion: a,
          versions: r
        });
        const o = t[u];
        o?.(this), this._set(Mu, u), l = u, i = structuredClone(this.store);
      } catch (o) {
        this.store = i;
        try {
          this._write(i);
        } catch {
        }
        const c = o instanceof Error ? o.message : String(o);
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${c}`);
      }
    (this._isVersionInRangeFormat(l) || !Kr.eq(l, a)) && this._set(Mu, a);
  }
  _containsReservedKey(t) {
    return typeof t == "string" ? this._isReservedKeyPath(t) : !t || typeof t != "object" ? !1 : this._objectContainsReservedKey(t);
  }
  _objectContainsReservedKey(t) {
    if (!t || typeof t != "object")
      return !1;
    for (const [a, n] of Object.entries(t))
      if (this._isReservedKeyPath(a) || this._objectContainsReservedKey(n))
        return !0;
    return !1;
  }
  _isReservedKeyPath(t) {
    return t === ur || t.startsWith(`${ur}.`);
  }
  _isVersionInRangeFormat(t) {
    return Kr.clean(t) === null;
  }
  _shouldPerformMigration(t, a, n) {
    return this._isVersionInRangeFormat(t) ? a !== "0.0.0" && Kr.satisfies(a, t) ? !1 : Kr.satisfies(n, t) : !(Kr.lte(t, a) || Kr.gt(t, n));
  }
  _get(t, a) {
    return Mh(this.store, t, a);
  }
  _set(t, a) {
    const { store: n } = this;
    ii(n, t, a), this.store = n;
  }
  #c(t) {
    const a = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!a.cwd) {
      if (!a.projectName)
        throw new Error("Please specify the `projectName` option.");
      a.cwd = gE(a.projectName, { suffix: a.projectSuffix }).config;
    }
    return typeof a.fileExtension == "string" && (a.fileExtension = a.fileExtension.replace(/^\.+/, "")), a;
  }
  #u(t) {
    if (!(t.schema ?? t.ajvOptions ?? t.rootSchema))
      return;
    if (t.schema && typeof t.schema != "object")
      throw new TypeError("The `schema` option must be an object.");
    const a = sb.default, n = new Q$.Ajv2020({
      allErrors: !0,
      useDefaults: !0,
      ...t.ajvOptions
    });
    a(n);
    const l = {
      ...t.rootSchema,
      type: "object",
      properties: t.schema
    };
    this.#i = n.compile(l), this.#l(t.schema);
  }
  #l(t) {
    const a = Object.entries(t ?? {});
    for (const [n, l] of a) {
      if (!l || typeof l != "object" || !Object.hasOwn(l, "default"))
        continue;
      const { default: r } = l;
      r !== void 0 && (this.#t[n] = r);
    }
  }
  #f(t) {
    t.defaults && Object.assign(this.#t, t.defaults);
  }
  #d(t) {
    t.serialize && (this._serialize = t.serialize), t.deserialize && (this._deserialize = t.deserialize);
  }
  #h(t) {
    const a = typeof t.fileExtension == "string" ? t.fileExtension : void 0, n = a ? `.${a}` : "";
    return je.resolve(t.cwd, `${t.configName ?? "config"}${n}`);
  }
  #p(t) {
    if (t.migrations) {
      this.#m(t), this._validate(this.store);
      return;
    }
    const a = this.store, n = Object.assign(cr(), t.defaults ?? {}, a);
    this._validate(n);
    try {
      Fl.deepEqual(a, n);
    } catch {
      this.store = n;
    }
  }
  #m(t) {
    const { migrations: a, projectVersion: n } = t;
    if (a) {
      if (!n)
        throw new Error("Please specify the `projectVersion` option.");
      this.#a = !0;
      try {
        const l = this.store, r = Object.assign(cr(), t.defaults ?? {}, l);
        try {
          Fl.deepEqual(l, r);
        } catch {
          this._write(r);
        }
        this._migrate(a, n, t.beforeEachMigration);
      } finally {
        this.#a = !1;
      }
    }
  }
}
const { app: Ha, ipcMain: Gu, shell: Jb } = Jt;
let $y = !1;
const Sy = () => {
  if (!Gu || !Ha)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Ha.getPath("userData"),
    appVersion: Ha.getVersion()
  };
  return $y || (Gu.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), $y = !0), e;
};
class Qb extends Yb {
  constructor(t) {
    let a, n;
    if (Ke.type === "renderer") {
      const l = Jt.ipcRenderer.sendSync("electron-store-get-data");
      if (!l)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: a, appVersion: n } = l);
    } else Gu && Ha && ({ defaultCwd: a, appVersion: n } = Sy());
    t = {
      name: "config",
      ...t
    }, t.projectVersion ||= n, t.cwd ? t.cwd = je.isAbsolute(t.cwd) ? t.cwd : je.join(a, t.cwd) : t.cwd = a, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Sy();
  }
  async openInEditor() {
    const t = await Jb.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
let Bu, Re = null, za;
async function Zb() {
  Bu || (Bu = (await import("better-sqlite3")).default, za = Ge.join(jt.getPath("userData"), "gravio.db"));
}
async function eR() {
  try {
    await Zb();
    const e = Ge.dirname(za);
    return At.existsSync(e) || At.mkdirSync(e, { recursive: !0 }), Re = new Bu(za, { verbose: console.log }), Re.pragma("journal_mode = WAL"), tR(), console.log("✅ Base de datos SQLite inicializada en:", za), Re;
  } catch (e) {
    throw console.error("❌ Error al inicializar base de datos:", e), e;
  }
}
function tR() {
  if (Re) {
    Re.pragma("foreign_keys = OFF"), Re.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS empresa (
      id TEXT PRIMARY KEY,
      empresa TEXT NOT NULL,
      clave_empresa INTEGER UNIQUE,
      prefijo TEXT NOT NULL
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS rutas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ruta TEXT NOT NULL,
      clave_ruta INTEGER UNIQUE,
      clave_empresa INTEGER
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS operadores (
      id TEXT PRIMARY KEY,
      operador TEXT NOT NULL,
      clave_operador INTEGER UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
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
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id TEXT PRIMARY KEY,
      no_economico TEXT NOT NULL,
      placas TEXT NOT NULL,
      clave_empresa INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS conceptos (
      id TEXT PRIMARY KEY,
      nombre TEXT UNIQUE NOT NULL,
      clave_concepto INTEGER,
      activo INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
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
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      registrado_por TEXT
    )
  `);
    try {
      Re.pragma("table_info(registros)").some((a) => a.name === "registrado_por") || (Re.exec("ALTER TABLE registros ADD COLUMN registrado_por TEXT"), console.log("✅ Columna registrado_por agregada a tabla registros"));
    } catch (e) {
      console.warn("⚠️ Error al verificar/agregar columna registrado_por:", e);
    }
    Re.exec(`
    CREATE TABLE IF NOT EXISTS operadores_empresas (
      operador_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (operador_id, clave_empresa)
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS conceptos_empresas (
      concepto_id TEXT NOT NULL,
      clave_empresa INTEGER NOT NULL,
      PRIMARY KEY (concepto_id, clave_empresa)
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      data TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      last_attempt INTEGER,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `), Re.exec(`
    CREATE TABLE IF NOT EXISTS folio_sequences (
      id TEXT PRIMARY KEY,
      clave_empresa INTEGER UNIQUE NOT NULL,
      prefijo_empresa TEXT NOT NULL,
      ultimo_numero INTEGER NOT NULL DEFAULT 0,
      sincronizado INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL
    )
  `), Re.exec(`
    CREATE INDEX IF NOT EXISTS idx_registros_sincronizado ON registros(sincronizado);
    CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_registro);
    CREATE INDEX IF NOT EXISTS idx_registros_placa ON registros(placa_vehiculo);
    CREATE INDEX IF NOT EXISTS idx_registros_id ON registros(id);
    CREATE INDEX IF NOT EXISTS idx_registros_fecha_entrada ON registros(fecha_entrada);
    CREATE INDEX IF NOT EXISTS idx_registros_pending ON registros(peso_salida) WHERE peso_salida IS NULL;
    CREATE INDEX IF NOT EXISTS idx_registros_unsynced ON registros(sincronizado, updated_at) WHERE sincronizado = 0;
    CREATE INDEX IF NOT EXISTS idx_registros_empresa_folio ON registros(clave_empresa, folio DESC) WHERE folio IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_registros_folio_lookup ON registros(folio) WHERE folio IS NOT NULL;
    -- Unique constraint on folio per empresa (prevents duplicates)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_registros_unique_folio ON registros(clave_empresa, folio) WHERE folio IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name);
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_vehiculos_placas ON vehiculos(placas);
    CREATE INDEX IF NOT EXISTS idx_operadores_clave ON operadores(clave_operador);
    CREATE INDEX IF NOT EXISTS idx_rutas_clave ON rutas(clave_ruta);
    CREATE INDEX IF NOT EXISTS idx_empresa_clave ON empresa(clave_empresa);
    CREATE INDEX IF NOT EXISTS idx_conceptos_id ON conceptos(id);
    CREATE INDEX IF NOT EXISTS idx_folio_sequences_empresa ON folio_sequences(clave_empresa);
  `), Re.pragma("foreign_keys = OFF"), console.log("✅ Tablas de base de datos creadas (estructura compatible con Supabase)"), console.log("⚠️  Foreign keys deshabilitadas para operación offline-first");
  }
}
function k0(e) {
  return e.map((t) => t === void 0 || t === null ? null : typeof t == "number" || typeof t == "string" || typeof t == "bigint" || Buffer.isBuffer(t) ? t : typeof t == "boolean" ? t ? 1 : 0 : typeof t == "object" ? (console.warn("⚠️ Convirtiendo objeto a JSON string:", t), JSON.stringify(t)) : String(t));
}
function rR(e, t = []) {
  if (!Re)
    throw new Error("Base de datos no inicializada");
  try {
    const a = k0(t), n = Re.prepare(e);
    if (e.trim().toUpperCase().startsWith("SELECT"))
      return n.all(...a);
    {
      const l = n.run(...a);
      return [{ changes: l.changes, lastInsertRowid: l.lastInsertRowid }];
    }
  } catch (a) {
    throw console.error("❌ Error en query:", a), console.error("   SQL:", e), console.error("   Params:", t), a;
  }
}
function nR(e) {
  if (!Re)
    throw new Error("Base de datos no inicializada");
  try {
    Re.exec(e);
  } catch (t) {
    throw console.error("❌ Error en comando SQL:", t), t;
  }
}
function iR(e) {
  if (!Re)
    throw new Error("Base de datos no inicializada");
  const t = Re.transaction((a) => {
    for (const n of a) {
      const l = Re.prepare(n.sql), r = k0(n.params || []);
      l.run(...r);
    }
  });
  try {
    t(e);
  } catch (a) {
    throw console.error("❌ Error en transacción:", a), a;
  }
}
function aR(e, t) {
  if (!Re)
    throw new Error("Base de datos no inicializada");
  return Re.transaction(() => {
    const n = Re.prepare(
      "SELECT * FROM folio_sequences WHERE clave_empresa = ?"
    ).get(e);
    let l;
    if (n) {
      l = n.ultimo_numero + 1;
      const i = (/* @__PURE__ */ new Date()).toISOString();
      Re.prepare(`
        UPDATE folio_sequences
        SET ultimo_numero = ?, sincronizado = 0, updated_at = ?
        WHERE clave_empresa = ?
      `).run(l, i, e), console.log(`📋 Secuencia incrementada para empresa ${e}: ${n.ultimo_numero} → ${l}`);
    } else {
      l = 1;
      const i = `seq-${e}`, u = (/* @__PURE__ */ new Date()).toISOString();
      Re.prepare(`
        INSERT INTO folio_sequences
        (id, clave_empresa, prefijo_empresa, ultimo_numero, sincronizado, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(i, e, t, l, 0, u), console.log(`📋 Nueva secuencia inicializada para empresa ${e}: ${l}`);
    }
    return { folio: `${t}-${l.toString().padStart(7, "0")}`, ultimoNumero: l };
  }).immediate();
}
function sR(e, t = []) {
  if (!Re) throw new Error("Database not initialized");
  try {
    return Re.prepare(e).get(...t);
  } catch (a) {
    throw console.error("❌ Error en getOne:", a), a;
  }
}
function by(e, t = []) {
  if (!Re) throw new Error("Database not initialized");
  try {
    return Re.prepare(e).all(...t);
  } catch (a) {
    throw console.error("❌ Error en getAll:", a), a;
  }
}
function oR(e, t = []) {
  if (!Re) throw new Error("Database not initialized");
  try {
    return Re.prepare(e).run(...t);
  } catch (a) {
    throw console.error("❌ Error en runCommand:", a), a;
  }
}
function cR() {
  Re && (Re.close(), Re = null, console.log("✅ Base de datos cerrada"));
}
const uR = Dv(kv);
let Ja, L0;
async function q0() {
  Ja || (Ja = (await import("serialport")).SerialPort, L0 = (await import("@serialport/parser-readline")).ReadlineParser);
}
let dt = null, Hu = null, Sl = "";
const Ga = {
  baudRate: 2400,
  dataBits: 8,
  stopBits: 1,
  parity: "none",
  autoOpen: !1
};
async function lR() {
  try {
    await q0();
    const e = await Ja.list();
    if (console.log("🔌 Puertos raw encontrados (node-serialport):", e), process.platform === "win32")
      try {
        const { stdout: a } = await uR('powershell -command "[System.IO.Ports.SerialPort]::GetPortNames()"'), n = a.trim().split(/\r?\n/).filter((l) => l && l.trim().length > 0);
        console.log("🔌 Puertos encontrados vía PowerShell:", n), n.forEach((l) => {
          const r = l.trim();
          e.find((i) => i.path === r) || e.push({
            path: r,
            manufacturer: "Puerto Virtual (Detectado por OS)",
            serialNumber: void 0,
            vendorId: void 0,
            productId: void 0
          });
        });
      } catch (a) {
        console.warn("⚠️ Error al listar puertos con PowerShell:", a);
      }
    return { success: !0, ports: e.map((a) => ({
      path: a.path,
      manufacturer: a.manufacturer
    })) };
  } catch (e) {
    const t = e instanceof Error ? e.message : String(e);
    return console.error("❌ Error al listar puertos:", t), { success: !1, error: t };
  }
}
function fR(e) {
  try {
    const t = e.trim(), a = /\)0\s+(\d+)\s+(\d+)/, n = t.match(a);
    if (n) {
      const [, o, c] = n;
      return parseFloat(`${o}.${c}`);
    }
    const l = /[)>+\-SD]\s*(\d+)\s+(\d+)\s+(\d+)/, r = t.match(l);
    if (r) {
      const [, , o, c] = r;
      return parseFloat(`${o}.${c}`);
    }
    const i = /(\d+\.?\d*)/, u = t.match(i);
    return u ? parseFloat(u[1]) : null;
  } catch (t) {
    return console.error("❌ Error al parsear peso:", t), null;
  }
}
async function dR(e, t = Ga.baudRate, a) {
  try {
    return await q0(), dt && dt.isOpen && await bl(), dt = new Ja({
      path: e,
      baudRate: t,
      dataBits: Ga.dataBits,
      stopBits: Ga.stopBits,
      parity: Ga.parity,
      autoOpen: !1
    }), Hu = dt.pipe(new L0({ delimiter: "\r" })), Hu.on("data", (n) => {
      const l = n.trim();
      if (!l) return;
      console.log(`📥 RAW: ${JSON.stringify(l)}`);
      const r = fR(l);
      r !== null && (Sl = r.toString(), console.log("⚖️ Peso parseado:", r, "kg"), a && a(r));
    }), dt.on("error", (n) => {
      console.error("❌ Error en puerto serial:", n);
    }), dt.on("close", () => {
      console.log("🔌 Puerto serial cerrado");
    }), await new Promise((n, l) => {
      dt.open((r) => {
        r ? l(r) : (console.log(`✅ Puerto serial ${e} abierto a ${t} baud`), n());
      });
    }), { success: !0 };
  } catch (n) {
    const l = n instanceof Error ? n.message : String(n);
    return console.error("❌ Error al abrir puerto serial:", l), { success: !1, error: l };
  }
}
async function bl() {
  try {
    return dt && dt.isOpen && await new Promise((e, t) => {
      dt.close((a) => {
        a ? (console.error("❌ Error al cerrar puerto:", a), t(a)) : (dt = null, Hu = null, Sl = "", e());
      });
    }), { success: !0 };
  } catch (e) {
    return { success: !1, error: e instanceof Error ? e.message : String(e) };
  }
}
function hR() {
  return Sl;
}
function pR() {
  return dt ? {
    path: dt.path,
    baudRate: dt.baudRate,
    isOpen: dt.isOpen
  } : null;
}
function mR(e) {
  const t = (r) => r.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }), a = (r) => r.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !1
  }), n = (r) => r ? (r / 1e3).toFixed(3) : "0.000", l = () => {
    if (!e.fechaEntrada || !e.fechaSalida) return "0";
    const r = e.fechaSalida.getTime() - e.fechaEntrada.getTime();
    return Math.floor(r / (1e3 * 60)).toString();
  };
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
      font-size: 11px;
      font-weight: bold;
      line-height: 1.4;
      width: 80mm;
      padding: 2mm 5mm;
      background: white;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .logo-container {
      text-align: center;
      margin-bottom: 4px;
    }

    .logo {
      max-width: 65mm;
      max-height: 18mm;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      margin-bottom: 6px;
    }

    .company-name {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 1px;
      line-height: 1.2;
    }

    .company-address {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 4px;
    }

    .separator {
      border-bottom: 1px dashed #000;
      margin: 3px 0;
    }

    .folio {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 2px;
    }

    .field {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 1.5px;
      line-height: 1.3;
    }

    .field-label {
      display: inline-block;
      min-width: 50px;
    }

    .section-title {
      font-size: 11px;
      font-weight: bold;
      margin-top: 4px;
      margin-bottom: 2px;
      text-decoration: underline;
    }

    .pesos-section {
      margin-top: 5px;
      padding-top: 3px;
      border-top: 1px solid #000;
    }

    .peso-field {
      font-size: 11px;
      font-weight: bold;
      margin-bottom: 1px;
      display: flex;
      justify-content: space-between;
    }

    .footer {
      margin-top: 5px;
      padding-top: 3px;
      border-top: 1px dashed #000;
      font-size: 10px;
      font-weight: bold;
    }

    @media print {
      body {
        width: 80mm;
      }
    }
  </style>
</head>
<body>
  ${e.companyLogo ? `
  <div class="logo-container">
    <img src="${e.companyLogo}" alt="Logo" class="logo">
  </div>
  ` : ""}

  <div class="header">
    ${e.companyName ? `<div class="company-name">${e.companyName}</div>` : ""}
    ${e.companyAddress ? `<div class="company-address">${e.companyAddress}</div>` : ""}
  </div>

  <div class="folio">Folio: ${e.folio}</div>
  <div class="field">Entrada: ${e.fechaEntrada ? `${t(e.fechaEntrada)} ${a(e.fechaEntrada)}` : "N/A"}</div>
  <div class="field">Salida: ${e.fechaSalida ? `${t(e.fechaSalida)} ${a(e.fechaSalida)}` : "N/A"}</div>
  <div class="field">Placas: ${e.vehiculo.placas}</div>

  <div class="separator"></div>

  <div class="field">Concepto: ${e.conceptoClave} - ${e.conceptoNombre}</div>
  <div class="field">Empresa: ${e.empresaClave} - ${e.empresaNombre}</div>
  <div class="field">Operador: ${e.operadorClave} - ${e.operadorNombre}</div>
  <div class="field">Ruta: ${e.rutaClave} - ${e.rutaNombre}</div>
  <div class="field">Vehiculo (No. economico): ${e.vehiculo.numeroEconomico}</div>

  <div class="pesos-section">
    <div class="peso-field">
      <span>Peso Bruto:</span>
      <span>${n(e.pesos.entrada)} t</span>
    </div>
    <div class="peso-field">
      <span>Peso Tara:</span>
      <span>${n(e.pesos.salida)} t</span>
    </div>
    <div class="peso-field">
      <span>Peso Neto:</span>
      <span>${n(e.pesos.neto)} t</span>
    </div>
    <div class="peso-field">
      <span>Tiempo:</span>
      <span>${l()} min</span>
    </div>
  </div>

  <div class="footer">
    ${e.observaciones ? `<div>Obs: ${e.observaciones}</div>` : ""}
    ${e.usuario ? `<div>Usuario: ${e.usuario}</div>` : ""}
  </div>
</body>
</html>
  `.trim();
}
async function gR(e) {
  console.log("📞 listPrinters() llamada - mainWindow:", e ? "disponible" : "NULL");
  try {
    if (!e)
      return console.warn("⚠️ No hay ventana principal disponible"), [];
    console.log("🔍 Obteniendo impresoras del sistema...");
    const t = await e.webContents.getPrintersAsync();
    console.log("📋 Impresoras raw del sistema:", JSON.stringify(t, null, 2));
    const a = t.map((n) => ({
      name: n.name,
      displayName: n.displayName || n.name,
      description: n.description || "",
      status: n.status || 0,
      isDefault: n.isDefault || !1,
      options: n.options || {}
    }));
    return console.log("✅ Impresoras detectadas:", a.length), console.log("📄 Impresoras formateadas:", JSON.stringify(a, null, 2)), a;
  } catch (t) {
    return console.error("❌ Error al listar impresoras:", t), console.error("📚 Stack trace:", t.stack), [];
  }
}
async function yR(e, t) {
  try {
    if (console.log("🖨️ Preparando impresión térmica:", t), !t.printerName)
      return console.error("❌ No se especificó nombre de impresora"), !1;
    const a = new zu({
      show: !1,
      width: 302,
      // 80mm ≈ 302px @ 96 DPI
      height: 600,
      webPreferences: {
        nodeIntegration: !1,
        contextIsolation: !0
      }
    }), n = mR({
      folio: t.folio || "PENDIENTE",
      fecha: t.fecha ? new Date(t.fecha) : /* @__PURE__ */ new Date(),
      companyName: t.companyName,
      companyAddress: t.companyAddress,
      companyLogo: t.companyLogo,
      empresaClave: t.empresaClave || "",
      empresaNombre: t.empresaNombre || "Sin empresa",
      conceptoClave: t.conceptoClave || "",
      conceptoNombre: t.conceptoNombre || "Sin concepto",
      vehiculo: {
        placas: t.vehiculo?.placas || "",
        numeroEconomico: t.vehiculo?.numeroEconomico || "N/A"
      },
      operadorClave: t.operadorClave || "",
      operadorNombre: t.operadorNombre || "Sin operador",
      rutaClave: t.rutaClave || "",
      rutaNombre: t.rutaNombre || "Sin ruta",
      pesos: {
        entrada: t.pesos?.entrada,
        salida: t.pesos?.salida,
        neto: t.pesos?.neto
      },
      fechaEntrada: t.fechaEntrada ? new Date(t.fechaEntrada) : void 0,
      fechaSalida: t.fechaSalida ? new Date(t.fechaSalida) : void 0,
      observaciones: t.observaciones,
      usuario: t.usuario
    });
    return await a.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(n)), await new Promise((l) => setTimeout(l, 500)), new Promise((l) => {
      a.webContents.print({
        silent: !0,
        printBackground: !0,
        deviceName: t.printerName,
        pageSize: {
          width: 8e4,
          // 80mm en micrones
          height: 297e3
          // Largo variable, usar altura estándar
        },
        margins: {
          marginType: "none"
        }
      }, (r, i) => {
        r ? (console.log("✅ Impresión enviada exitosamente"), l(!0)) : (console.error("❌ Error de impresión:", i), l(!1)), setTimeout(() => {
          try {
            a.close();
          } catch {
            console.warn("Ventana ya cerrada");
          }
        }, 1e3);
      });
    });
  } catch (a) {
    return console.error("❌ Error al imprimir:", a), !1;
  }
}
const xu = Ge.dirname(Lv(import.meta.url));
let Je = null;
const Ba = new Qb(), Vu = /* @__PURE__ */ new Map();
async function vR(e, t) {
  const a = Vu.get(e);
  a && await a.catch(() => {
  });
  let n;
  const l = new Promise((r) => {
    n = r;
  });
  Vu.set(e, l);
  try {
    return await t();
  } finally {
    n(), Vu.delete(e);
  }
}
const Or = process.env.NODE_ENV === "development";
function Ry() {
  Je = new zu({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: Ge.join(xu, "preload.cjs"),
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1
      // Necesario para serialport y sqlite
    },
    title: "Gravio - Sistema de Relleno Sanitario",
    icon: Ge.join(xu, "../public/icon.png"),
    autoHideMenuBar: !Or
  }), Je.webContents.session.webRequest.onHeadersReceived((e, t) => {
    t({
      responseHeaders: {
        ...e.responseHeaders,
        "Content-Security-Policy": [
          Or ? "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:*; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:*; font-src 'self' data:;" : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; font-src 'self' data:;"
        ]
      }
    });
  }), Or ? (Je.loadURL("http://localhost:5173"), Je.webContents.openDevTools()) : Je.loadFile(Ge.join(xu, "../dist/index.html")), Je.on("closed", () => {
    Je = null;
  });
}
bt.autoUpdater.autoDownload = !0;
bt.autoUpdater.autoInstallOnAppQuit = !0;
bt.autoUpdater.on("checking-for-update", () => {
  console.log("🔍 Verificando actualizaciones...");
});
bt.autoUpdater.on("update-available", (e) => {
  console.log("✅ Actualización disponible:", e.version), console.log("📥 Descargando actualización en segundo plano..."), Je && Je.webContents.send("update-available", e);
});
bt.autoUpdater.on("update-not-available", () => {
  console.log("✅ La aplicación está actualizada");
});
bt.autoUpdater.on("download-progress", (e) => {
  Je && Je.webContents.send("update-download-progress", e);
});
bt.autoUpdater.on("update-downloaded", (e) => {
  console.log("✅ Actualización descargada:", e.version), Je && Je.webContents.send("update-downloaded", e);
});
bt.autoUpdater.on("error", (e) => {
  console.error("❌ Error en auto-updater:", e);
});
jt.whenReady().then(async () => {
  await eR(), Ry(), _R(), Or || setTimeout(() => {
    bt.autoUpdater.checkForUpdates();
  }, 5e3), jt.on("activate", () => {
    zu.getAllWindows().length === 0 && Ry();
  });
});
jt.on("window-all-closed", () => {
  process.platform !== "darwin" && jt.quit();
});
jt.on("before-quit", async () => {
  await bl(), cR();
});
function _R() {
  Be.handle("app:getVersion", () => jt.getVersion()), Be.handle("app:getPlatform", () => process.platform), Be.handle("serial:list", lR), Be.handle("serial:open", async (e, t, a) => await dR(t, a, (l) => {
    Je && Je.webContents.send("serial:data", l.toString());
  })), Be.handle("serial:close", bl), Be.handle("serial:read", hR), Be.handle("serial:getPortInfo", pR), Be.handle("db:query", (e, t, a) => rR(t, a)), Be.handle("db:exec", (e, t) => nR(t)), Be.handle("db:transaction", (e, t) => iR(t)), Be.handle("db:get", (e, t, a) => sR(t, a)), Be.handle("db:run", (e, t, a) => {
    oR(t, a);
  }), Be.handle("db:all", (e, t, a) => by(t, a)), Be.handle("db:atomicIncrementFolio", async (e, t, a) => vR(t, async () => aR(t, a))), Be.handle("printer:list", () => gR(Je)), Be.handle("printer:print", (e, t) => yR(Je, t)), Be.handle("sync:start", async () => {
    console.log("🔄 Iniciando sincronización...");
  }), Be.handle("sync:stop", async () => {
    console.log("⏸️ Deteniendo sincronización...");
  }), Be.handle("sync:getStatus", async () => ({
    isOnline: !0,
    lastSync: null,
    pendingItems: 0
  })), Be.handle("storage:get", (e, t) => Ba.get(t)), Be.handle("storage:set", (e, t, a) => {
    Ba.set(t, a);
  }), Be.handle("storage:delete", (e, t) => {
    Ba.delete(t);
  }), Be.handle("storage:clear", () => {
    Ba.clear();
  }), Be.handle("updater:check", async () => Or ? null : await bt.autoUpdater.checkForUpdates()), Be.handle("updater:download", async () => Or ? null : await bt.autoUpdater.downloadUpdate()), Be.handle("updater:installAndRestart", () => {
    Or || bt.autoUpdater.quitAndInstall(!1, !0);
  }), Be.handle("updater:openExternal", async (e, t) => {
    await Ov.openExternal(t);
  }), Be.handle("export:toExcel", async (e, t) => {
    try {
      const a = await import("xlsx"), n = await Av.showSaveDialog(Je, {
        title: "Exportar base de datos a Excel",
        defaultPath: `gravio-export-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.xlsx`,
        filters: [
          { name: "Excel Files", extensions: ["xlsx"] },
          { name: "All Files", extensions: ["*"] }
        ]
      });
      if (n.canceled || !n.filePath)
        return { success: !1, message: "Exportación cancelada" };
      const l = a.utils.book_new(), r = t ? [t] : ["registros", "vehiculos", "operadores", "rutas", "empresa", "conceptos", "usuarios"];
      for (const u of r)
        try {
          const o = await by(`SELECT * FROM ${u}`, []);
          if (o && o.length > 0) {
            const c = o.map((d) => {
              const f = { ...d };
              return ["created_at", "updated_at", "fecha_entrada", "fecha_salida", "fecha_registro", "pin_expires_at", "last_attempt", "created"].forEach((y) => {
                f[y] && typeof f[y] == "number" && (f[y] = new Date(f[y] * 1e3).toLocaleString("es-MX"));
              }), Object.keys(f).forEach((y) => {
                (f[y] === 0 || f[y] === 1) && (y === "sincronizado" || y === "activo") && (f[y] = f[y] === 1 ? "Sí" : "No");
              }), f;
            }), s = a.utils.json_to_sheet(c);
            a.utils.book_append_sheet(l, s, u);
          }
        } catch (o) {
          console.warn(`⚠️ No se pudo exportar la tabla ${u}:`, o);
        }
      const i = a.write(l, { type: "buffer", bookType: "xlsx" });
      return At.writeFileSync(n.filePath, i), {
        success: !0,
        message: "Base de datos exportada exitosamente",
        filePath: n.filePath
      };
    } catch (a) {
      return console.error("❌ Error al exportar a Excel:", a), {
        success: !1,
        message: `Error al exportar: ${a.message}`
      };
    }
  });
}
const ER = jt.requestSingleInstanceLock();
ER ? jt.on("second-instance", () => {
  Je && (Je.isMinimized() && Je.restore(), Je.focus());
}) : jt.quit();
