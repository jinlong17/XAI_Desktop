/*
 * CP-STICKY-01 batch 10 (F1 impact review): page prelude for ./f1-host.tsx. Verification only.
 *
 * Served by ./verify-f1.mjs as a classic script that runs before the module bundle, so it exists before
 * React DOM initialises. It defines:
 *   - window.__f1: one global sequence shared with the fixture, a WeakMap object-id registry, and a
 *     live-router reader (the fixture assigns window.__f1.router after createBrowserRouter);
 *   - a minimal React DevTools global hook. React DOM (development build) calls onCommitFiberRoot after
 *     the layout phase of every commit and onPostCommitFiberRoot after that commit's passive effects.
 *     For each commit the hook records the committed DepartureCoordinator blocker-effect dependencies
 *     ([blocker, guardVersion, publishIntent]) and intent-effect dependencies
 *     ([finishIntent, guardVersion, intentVersion]) next to the router's LIVE blocker at that instant.
 *     A commit whose committed blocker snapshot is "blocked" while the live router blocker is a
 *     different object or no longer "blocked" is a stale-snapshot commit.
 * The hook only reads fibers; it never schedules work, and every callback is wrapped so that it can
 * never throw into React.
 */
(function installF1Prelude() {
  "use strict";
  var f1 = {
    seq: 0,
    commits: [],
    post: [],
    hookErrors: 0,
    router: null,
    ids: new WeakMap(),
    nextId: 0,
    path: null,
  };
  f1.next = function next() { f1.seq += 1; return f1.seq; };
  f1.idOf = function idOf(object) {
    if (!object || (typeof object !== "object" && typeof object !== "function")) return null;
    var id = f1.ids.get(object);
    if (id === undefined) {
      f1.nextId += 1;
      id = f1.nextId;
      f1.ids.set(object, id);
    }
    return id;
  };
  f1.live = function live() {
    var router = f1.router;
    if (!router || !router.state || !router.state.blockers) return null;
    var last = null;
    router.state.blockers.forEach(function (blocker) { last = blocker; });
    return last ? { id: f1.idOf(last), state: last.state } : null;
  };

  var isCoordinator = function (fiber) {
    return Boolean(fiber && typeof fiber.type === "function" && /^DepartureCoordinator\d*$/.test(fiber.type.name || ""));
  };
  // The child-index path from the committed HostRoot to the coordinator, re-validated on every commit.
  var followPath = function (current, path) {
    var node = current;
    for (var depth = 0; depth < path.length && node; depth += 1) {
      node = node.child;
      for (var index = 0; index < path[depth] && node; index += 1) node = node.sibling;
    }
    return node || null;
  };
  var search = function (current) {
    var stack = [{ fiber: current, path: [] }];
    var visited = 0;
    while (stack.length && visited < 200000) {
      var item = stack.pop();
      visited += 1;
      if (isCoordinator(item.fiber)) return item;
      var child = item.fiber.child;
      var index = 0;
      var children = [];
      while (child) {
        children.push({ fiber: child, path: item.path.concat(index) });
        child = child.sibling;
        index += 1;
      }
      for (var i = children.length - 1; i >= 0; i -= 1) stack.push(children[i]);
    }
    return null;
  };
  var coordinatorOf = function (root) {
    var current = root && root.current;
    if (!current) return null;
    if (f1.path) {
      var candidate = followPath(current, f1.path);
      if (isCoordinator(candidate)) return candidate;
    }
    var found = search(current);
    f1.path = found ? found.path : null;
    return found ? found.fiber : null;
  };
  var readCoordinator = function (fiber) {
    var view = { b: null, s: null, gv: null, iv: null };
    var hook = fiber.memoizedState;
    var guard = 0;
    while (hook && guard < 200) {
      guard += 1;
      var effect = hook.memoizedState;
      if (effect && typeof effect === "object" && "create" in effect && Array.isArray(effect.deps) && effect.deps.length === 3) {
        var deps = effect.deps;
        if (deps[0] && typeof deps[0] === "object" && typeof deps[0].state === "string" && typeof deps[1] === "number") {
          view.b = f1.idOf(deps[0]);
          view.s = deps[0].state;
          view.gv = deps[1];
        } else if (typeof deps[0] === "function" && typeof deps[1] === "number" && typeof deps[2] === "number") {
          view.iv = deps[2];
        }
      }
      hook = hook.next;
    }
    return view;
  };

  window.__f1 = f1;
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    isDisabled: false,
    renderers: new Map(),
    inject: function inject(internals) {
      var id = this.renderers.size + 1;
      this.renderers.set(id, internals);
      return id;
    },
    checkDCE: function checkDCE() {},
    onCommitFiberUnmount: function onCommitFiberUnmount() {},
    onCommitFiberRoot: function onCommitFiberRoot(rendererId, root, priority) {
      try {
        var fiber = coordinatorOf(root);
        var entry = { seq: f1.next(), prio: priority === undefined ? null : priority, coord: null, live: f1.live(), path: location.pathname };
        if (fiber) entry.coord = readCoordinator(fiber);
        f1.commits.push(entry);
      } catch (error) {
        f1.hookErrors += 1;
      }
    },
    onPostCommitFiberRoot: function onPostCommitFiberRoot() {
      try { f1.post.push({ seq: f1.next(), live: f1.live() }); } catch (error) { f1.hookErrors += 1; }
    },
  };
})();
