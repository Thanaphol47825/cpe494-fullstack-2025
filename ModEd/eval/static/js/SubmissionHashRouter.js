/* SubmissionHashRouter - small in-module router to handle /eval/submission/manage
   This lives inside ModEd/eval only and will lazy-load SubmissionManage.js
*/
(function(){
  const root = (typeof RootURL !== 'undefined') ? RootURL : '';

  async function ensureSubmissionManage(){
    if(typeof SubmissionManage === 'undefined'){
      await new Promise((resolve,reject)=>{
        const s = document.createElement('script');
        s.src = root + 'eval/static/js/SubmissionManage.js';
        s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return true;
  }

  async function activateManage(){
    try{
      await ensureSubmissionManage();
      // SubmissionManage.initialize accepts optional parent; call without parent so it creates its own root
      const mgr = new SubmissionManage(typeof window.application !== 'undefined' ? window.application : undefined);
      if(typeof mgr.initialize === 'function') await mgr.initialize();
    }catch(e){
      console.error('SubmissionHashRouter failed to activate manage page:', e);
    }
  }

  function checkHash(){
    const hash = (window.location.hash || '').replace(/^#/, '');
    const path = hash.startsWith('/') ? hash : '/' + hash;
    if(path === '/eval/submission/manage' || path.endsWith('/submission/manage')){
      activateManage();
      return true;
    }
    return false;
  }

  window.addEventListener('hashchange', ()=>{ checkHash(); });
  // run on DOMContentLoaded in case page opens directly with the hash
  document.addEventListener('DOMContentLoaded', ()=>{ checkHash(); });
})();
