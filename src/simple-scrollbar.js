(function (w, d) {
  const raf = w.requestAnimationFrame || w.setImmediate || setTimeout;
  const barHtml = '<div class="ss-scroll">';
  const visibilityObserverOptions = { attributes: true, attributeFilter: ["class", "style"] };
  const contentObserverOptions = { attributes: true, childList: true, subtree: true, attributeFilter: ["class", "style"] };

  function initEl(el) {
    if (el.getAttribute('data-simple-scrollbar')) return;
    SimpleScrollbar(el);
    el.setAttribute('data-simple-scrollbar', 'true');
  }

  // Mouse drag handler
  function dragDealer(handle, container, getRatio) {
    var _lastPageY;

    handle.addEventListener('mousedown', function (e) {
      _lastPageY = e.pageY;
      handle.classList.add('ss-grabbed');
      d.body.classList.add('ss-grabbed');
      d.addEventListener('mousemove', drag);
      d.addEventListener('mouseup', stop);
      return false;
    });

    function drag(e) {
      const delta = e.pageY - _lastPageY;
      _lastPageY = e.pageY;

      raf(function () {
        container.scrollTop += delta / getRatio();
      });
    }

    function stop() {
      handle.classList.remove('ss-grabbed');
      d.body.classList.remove('ss-grabbed');
      d.removeEventListener('mousemove', drag);
      d.removeEventListener('mouseup', stop);
    }
  }

  function elementIsHidden(e) {
    return e.offsetWidth === 0 && e.offsetHeight === 0;
  }

  function getHiddenAncestorOrItself(element) {
    const parent = element.parentNode
    return !elementIsHidden(parent) ?
      element :
      getHiddenAncestorOrItself(parent);
  }
 
  function debounce(delay, func) {
    var _due;
    return function () {
      const start = (new Date()).valueOf();
      function tryCall() {
        const now = (new Date()).valueOf();
        if (now >= _due) {
          func();
        } else {
          setTimeout(tryCall, _due - now);
        }
      }
      if (_due !== undefined && start < _due) {
      } else {
        setTimeout(tryCall, delay);
      }
      _due = start + delay;
    };
  }
  // Constructor
  function ss(target) {
    var _scrollRatio = 1;

    function updateHandle() {
      const totalHeight = viewport.scrollHeight;
      const ownHeight = viewport.clientHeight;

      _scrollRatio = ownHeight / totalHeight;
      const isRtl = direction === 'rtl';
      const right = isRtl ?
        (target.clientWidth - handle.clientWidth + 18) :
        (target.clientWidth - handle.clientWidth) * -1;

      raf(function () {
        // Hide scrollbar if no scrolling is possible
        if (_scrollRatio >= 1) {
          handle.classList.add('ss-hidden')
        } else {
          handle.classList.remove('ss-hidden')
          handle.style.cssText = 'height:' + Math.max(_scrollRatio * 100, 10) + '%; top:' + (viewport.scrollTop / totalHeight) * 100 + '%;right:' + right + 'px;';
        }
      });
    }
    const direction = window.getComputedStyle(target).direction;
    const wrapper = d.createElement('div');
    wrapper.setAttribute('class', 'ss-wrapper');

    const viewport = d.createElement('div');
    viewport.setAttribute('class', 'ss-content');
    if (direction === 'rtl') {
      viewport.classList.add('rtl');
    }
    wrapper.appendChild(viewport);
    while (target.firstChild) {
      viewport.appendChild(target.firstChild);
    }
    target.appendChild(wrapper);
    target.insertAdjacentHTML('beforeend', barHtml);
    const handle = target.lastChild;

    dragDealer(handle, viewport, () =>  _scrollRatio);

    updateHandle();

    viewport.addEventListener('scroll', updateHandle);
    viewport.addEventListener('mouseenter', updateHandle);

    target.classList.add('ss-container');

    const css = window.getComputedStyle(viewport);
    if (css['height'] === '0px' && css['max-height'] !== '0px') {
      viewport.style.height = css['max-height'];
    }
    if (elementIsHidden(viewport)) {
      const visibilityObserver = new MutationObserver(function (visibilityMutations) {
        if (!elementIsHidden(viewport)) {
          updateHandle();
          visibilityObserver.disconnect();
        }  
      });
      visibilityObserver.observe(getHiddenAncestorOrItself(viewport), visibilityObserverOptions);
    }
    (new MutationObserver(debounce(200, updateHandle))).observe(viewport, contentObserverOptions);
  };
  
  function initAll() {
    const nodes = d.querySelectorAll('*[ss-container]');
    Array.prototype.forEach.call(nodes, initEl);
  }

  d.addEventListener('DOMContentLoaded', initAll);
  ss.initEl = initEl;
  ss.initAll = initAll;

  w.SimpleScrollbar = ss;
})(window, document);
