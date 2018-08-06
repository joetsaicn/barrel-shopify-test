import Vue from 'vue'
import validate from 'mixins/validate'

Vue.component('account-recover-form', {
  data () {
    return {}
  },
  computed: {
    active () {
      return this.$parent.activeForm === 'recover'
    }
  },
  mixins: [validate]
})
