(function () {
  const signUpUrl = 'https://app.lemonadcard.com/signUp';
  const queryEntries = Array.from(new URL(window.location.href).searchParams.entries());

  if (!queryEntries.length) {
    return;
  }

  function isTargetLink(anchor) {
    if (!(anchor instanceof HTMLAnchorElement)) {
      return false;
    }

    try {
      const url = new URL(anchor.href, window.location.origin);
      return url.origin + url.pathname === signUpUrl;
    } catch (error) {
      return false;
    }
  }

  function patchLink(anchor) {
    if (!isTargetLink(anchor)) {
      return;
    }

    const url = new URL(anchor.href, window.location.origin);

    queryEntries.forEach(function (entry) {
      url.searchParams.set(entry[0], entry[1]);
    });

    anchor.href = url.toString();
  }

  function patchLinks(root) {
    if (root instanceof HTMLAnchorElement) {
      patchLink(root);
      return;
    }

    if (!(root instanceof Document) && !(root instanceof Element)) {
      return;
    }

    root.querySelectorAll('a[href]').forEach(patchLink);
  }

  patchLinks(document);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(patchLinks);
    });
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
