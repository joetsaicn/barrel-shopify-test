import Vue from 'vue'
import qs from 'query-string'

export default el => {
  return new Vue({
    el,
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
  })
}
