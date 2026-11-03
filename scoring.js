// Existing exploratory heuristic, not a validated measure or sentiment analysis.
// Shared by all conditions; it never affects experimental outcome assignment.
(() => {
'use strict';
function personalness(txt,t){let s=0;const low=txt.toLowerCase();if(/\b(i|me|my|mine|myself|we|our)\b/.test(low))s+=35;if(/\b(you|your|everyone|friends|audience)\b/.test(low))s+=15;if(/\b(love|grateful|happy|excited|proud|feel|learned|meaningful|important)\b/.test(low))s+=20;if(t.length>=2)s+=15;if(s>=50)s+=15;return Math.min(100,s)}
window.EXPERIMENT_SCORING=Object.freeze({method:'keyword-heuristic-v1',personalness});
})();
