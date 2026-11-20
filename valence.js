// Qualtrics owns valence assignment. This module never randomizes it.
(() => {
  'use strict';
  const version = 'qualtrics-valence-v1';
  const valid = value => value === 'positive' || value === 'negative';
  const linkError = 'This experiment link is missing a valid assignment. Please reopen the link provided in your survey.';
  const conflictError = 'This link conflicts with the assignment already saved for this Prolific ID. Please return to the survey and use your original experiment link, or contact the research team.';

  function read(search) {
    const values = new URLSearchParams(search).getAll('valence');
    if (values.length !== 1 || !valid(values[0])) throw new Error(linkError);
    return values[0];
  }

  function bind({ storage, sessionKey, condition, assignedValence }) {
    if (!valid(assignedValence)) throw new Error(linkError);
    function load(key) {
      const raw = storage.getItem(key);
      if (raw === null) return null;
      try { return JSON.parse(raw); }
      catch { throw new Error('Your saved experiment session could not be read. Please contact the research team.'); }
    }
    function check(value) {
      if (value !== undefined && value !== null && value !== assignedValence) throw new Error(conflictError);
    }
    try {
      const key = sessionKey + ':valence-assignment';
      const previous = load(key);
      if (previous !== null) {
        if (!valid(previous.assigned_valence) || previous.condition !== condition || previous.assignment_version !== version || previous.assignment_source !== 'qualtrics_url') throw new Error(conflictError);
        check(previous.assigned_valence);
      }
      for (const currentKey of [sessionKey, sessionKey + ':practice']) {
        const saved = load(currentKey);
        if (!saved) continue;
        check(saved.assigned_valence);
        check(saved.valence_assignment?.assigned_valence);
        // Do not silently combine old word-count evaluations with this design.
        if (currentKey === sessionKey && Array.isArray(saved.posts)) {
          for (const post of saved.posts) {
            const outcome = post?.outcome;
            if (!outcome || !valid(outcome.assigned_valence) || outcome.assignment_version !== version) {
              throw new Error('This Prolific ID has saved main-task work from an earlier experiment version. Please contact the research team.');
            }
            check(outcome.assigned_valence);
            if (outcome.valence !== (assignedValence === 'positive' ? 'above' : 'below')) throw new Error(conflictError);
          }
        }
      }
      const assignment = previous || {
        assigned_valence: assignedValence,
        assignment_source: 'qualtrics_url',
        assignment_version: version,
        assigned_at: new Date().toISOString(),
        condition
      };
      storage.setItem(key, JSON.stringify(assignment));
      return Object.freeze(assignment);
    } catch (error) {
      if (error?.name === 'SecurityError' || error?.name === 'QuotaExceededError') {
        throw new Error('Your browser could not save the experiment assignment. Please allow site storage and reopen your survey link.');
      }
      throw error;
    }
  }
  window.EXPERIMENT_VALENCE = Object.freeze({ read, bind, version });
})();
