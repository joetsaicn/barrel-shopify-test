import Vue from 'vue'
import qs from 'query-string'

const AccountForms = {
  data () {
    return {
      activeForm: 'login'
    }
  },
  mounted () {
    this.changeForm()
  },
  methods: {
    changeForm (form = false) {
      const parsed = qs.parse(location.search)
      if (!form && !parsed.form) {
        return
      }
      if (!form) {
        form = parsed.form
      } else {
        parsed.form = form
      }
      this.activeForm = form
      history.replaceState(null, null, `${location.pathname}?${qs.stringify(parsed)}`)
    }
  }
}

export default {
  init (el) {
    this.instance = new Vue({
      el,
      ...AccountForms
    })
  },
  destroy () {
    this.instance.$destroy()
  }
}
