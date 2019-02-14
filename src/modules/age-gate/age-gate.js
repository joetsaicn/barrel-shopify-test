import select from 'dom-select'
import on from 'dom-event'
import Cookies from 'cookies-js'
import nanoajax from 'nanoajax'

const AGE_GATE_ACTIONS = '[data-age-gate-action]'
const AGE_GATE_CLASS = 'js-age-gate'
const AGE_GATE_ACTIVE = 'js-age-gate-active'
const AGE_GATE_CROSS = 'js-age-gate-cross'
const doc = document.documentElement

const activateAgeGate = () => {
  if (doc.classList.contains('js-age-gate') && Cookies('age_gate') !== '1') {
    doc.classList.add(AGE_GATE_ACTIVE)
  }
}

const respondToClick = (e, action) => {
  if (action === 'enter') {
    e.preventDefault()
    Cookies.set('age_gate', '1')
    nanoajax.ajax({url: '/cart/update.js', method: 'POST', body: 'attributes[age_gate]=1'}, () => {})
    deactivateAgeGate()
  }
}

const deactivateAgeGate = () => {
  doc.classList.remove(AGE_GATE_CLASS)
  doc.classList.remove(AGE_GATE_ACTIVE)
}

export default (el) => {
  const actions = select.all(AGE_GATE_ACTIONS)

  activateAgeGate()
  if (actions.length) {
    actions.map(action => {
      on(action, 'click', e => respondToClick(
        e, action.getAttribute('data-age-gate-action')
      ))
    })
  } else {
    deactivateAgeGate()
  }
}
