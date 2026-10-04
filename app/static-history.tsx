// GitHub Pages serves each exported document directly. Same-document history
// must remain local: an RSC request to the /juna/ deployment prefix has no server.
// Install during HTML parsing, before the framework and hydration start, so the
// first anchor navigation is protected as well as later back/forward actions.
export function StaticHistory() {
  return <script dangerouslySetInnerHTML={{ __html: `(function(){var pathname=location.pathname;window.addEventListener("popstate",function(event){if(location.pathname!==pathname)return;event.stopImmediatePropagation();window.dispatchEvent(new Event("juna:history"));},true);})();` }} />;
}
