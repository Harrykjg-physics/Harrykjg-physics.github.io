/* ============================================================
   Private-area access gate (client-side).
   ------------------------------------------------------------
   WARNING: this is NOT real security. The password hash is
   embedded in this file, and a determined visitor can bypass
   the gate by reading the page source. It is intended only
   to keep casual visitors out. Do not store truly sensitive
   data behind it.
   ============================================================ */
(function () {
  "use strict";

  /* ---- CONFIG ---- */
  /* SHA-256 hex digest of the password (default: kong2026).
     To change the password, run
         echo -n "newpassword" | sha256sum
     and paste the output below. */
  var PASSWORD_HASH = "2d8b7acad0d9f248baf27d0c6027a568443c571b5579ca6826aada433391fead";
  var AUTH_KEY = "psw_private_auth_v1"; /* sessionStorage key */
  var SESSION_HOURS = 12;               /* stay unlocked for N hours per session */

  /* ---- callback registry: pages queue work to run after unlock ---- */
  var callbacks = (window.__pswCbs && window.__pswCbs.slice()) || [];
  if (window.__pswCbs) window.__pswCbs.length = 0;

  window.PrivateAuth = {
    onUnlock: function (fn) { callbacks.push(fn); },
    logout: function () {
      try {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY + "_t");
      } catch (e) {}
      location.reload();
    }
  };

  /* ---- SHA-256 (compact implementation, works on any page) ---- */
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = "length";
    var i, j;
    var result = "";
    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;
    var hash = sha256.h = sha256.h || [];
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }
    ascii += "\x80";
    while (ascii[lengthProperty] % 64 - 56) ascii += "\x00";
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return "";
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength);
    for (j = 0; j < words[lengthProperty];) {
      var w = words.slice(j, j += 16);
      var oldHash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ (~e & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? 0 : "") + b.toString(16);
      }
    }
    return result;
  }

  /* ---- helpers ---- */
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function fireCallbacks() {
    callbacks.forEach(function (fn) {
      try { fn(); } catch (e) {}
    });
  }

  function alreadyUnlocked() {
    try {
      if (sessionStorage.getItem(AUTH_KEY) !== "1") return false;
      var t = parseInt(sessionStorage.getItem(AUTH_KEY + "_t"), 10);
      if (t && Date.now() - t < SESSION_HOURS * 3600 * 1000) return true;
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem(AUTH_KEY + "_t");
      return false;
    } catch (e) { return false; }
  }

  /* ---- gate UI ---- */
  function buildGate() {
    var gate = document.createElement("div");
    gate.className = "psw-gate";
    gate.id = "psw-gate";
    gate.innerHTML =
      '<div class="psw-card">' +
        '<div class="lock">&#128274;</div>' +
        '<h2>Private area</h2>' +
        '<p>此页面为私人内容，请输入访问密码。<br>Enter the password to continue.</p>' +
        '<input type="password" id="psw-input" placeholder="Password" autocomplete="off">' +
        '<button id="psw-submit" type="button">Enter</button>' +
        '<p class="psw-error" id="psw-error"></p>' +
      '</div>';
    document.body.appendChild(gate);

    var input = gate.querySelector("#psw-input");
    var err = gate.querySelector("#psw-error");
    var btn = gate.querySelector("#psw-submit");

    function tryUnlock() {
      var val = input.value || "";
      if (sha256(val) === PASSWORD_HASH) {
        try {
          sessionStorage.setItem(AUTH_KEY, "1");
          sessionStorage.setItem(AUTH_KEY + "_t", String(Date.now()));
        } catch (e) {}
        if (gate.parentNode) gate.parentNode.removeChild(gate);
        fireCallbacks();
      } else {
        err.textContent = "密码错误，你没有权限访问此页面。 / Incorrect password.";
        input.select();
      }
    }
    btn.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryUnlock();
    });
    onReady(function () { input.focus(); });
  }

  /* ---- boot ---- */
  var lo = document.getElementById("psw-logout");
  if (lo) {
    lo.addEventListener("click", function (e) {
      e.preventDefault();
      window.PrivateAuth.logout();
    });
  }

  if (alreadyUnlocked()) {
    onReady(fireCallbacks);
  } else {
    buildGate();
  }
})();
