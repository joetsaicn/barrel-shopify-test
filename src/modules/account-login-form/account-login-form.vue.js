import Vue from 'vue'
import validate from 'mixins/validate'

Vue.component('account-login-form', {
  data () {
    return {}
  },
  computed: {
    active () {
      return this.$parent.activeForm === 'login'
    }
  },
  mixins: [validate]
})
