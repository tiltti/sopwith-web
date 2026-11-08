// Original title-art alternatives. No stored preference or default change.
(() => {
  const options=Object.freeze({
    current:Object.freeze({label:'A · CURRENT',image:'rainbow-splash-v1.png'}),
    airfield:Object.freeze({label:'B · AIRFIELD',image:'rainbow-splash-airfield-v2.png'}),
    campaign:Object.freeze({label:'C · THREE FRONTS',image:'rainbow-splash-campaign-v3.png'})
  });
  const fromSearch=search=>{const key=new URLSearchParams(search).get('splash');return Object.hasOwn(options,key)?key:'current';};
  window.PatrolSplash=Object.freeze({options,fromSearch});
})();
