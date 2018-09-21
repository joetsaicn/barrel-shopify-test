import Vue from 'vue'
import VueScrollTo from 'vue-scrollto'

Vue.use(VueScrollTo)

export default el => {
  return new Vue({
    el,
    data () {
      return {
        activeAddress: {},
        showNewAddressForm: false
      }
    },
    methods: {
      toggleNewAddressForm (show) {
        this.showNewAddressForm = show
        show && this.$nextTick(() => {
          this.$scrollTo(this.$refs['newAddressForm'])
        })
      },
      populateAddressForm (data) {
        this.activeAddress = data
        this.toggleNewAddressForm(true)
      },
      showEmptyForm () {
        for (let key in this.activeAddress) {
          this['activeAddress'][key] = ''
        }
        this.toggleNewAddressForm(true)
      }
    }
  })
}
